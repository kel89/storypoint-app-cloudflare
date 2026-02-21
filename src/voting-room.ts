import { DurableObject } from "cloudflare:workers";

interface UserData {
  sid: string;
  username: string;
  role: string;
  points: number;
  voted: boolean;
}

interface ClientMessage {
  type: string;
  username?: string;
  role?: string;
  points?: number;
  reaction?: string;
  sentBy?: string;
  sid?: string;
  time?: number;
}

export class VotingRoom extends DurableObject {
  private sidCounter = 0;

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle clear endpoint
    if (url.pathname.endsWith("/clear")) {
      await this.clearRoom();
      return new Response("Cleared");
    }

    // Handle WebSocket upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      const sid = `user_${++this.sidCounter}_${Date.now()}`;

      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ sid, username: "", role: "", points: 0, voted: false });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Expected WebSocket or /clear", { status: 400 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string") return;

    let msg: ClientMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    const attachment = ws.deserializeAttachment() as UserData;

    switch (msg.type) {
      case "join": {
        attachment.username = msg.username || "";
        attachment.role = msg.role || "";
        attachment.points = 0;
        attachment.voted = false;
        ws.serializeAttachment(attachment);

        // Send the client its own SID
        ws.send(JSON.stringify({ type: "joined", sid: attachment.sid }));

        // Broadcast updated state to all
        await this.broadcastState();
        break;
      }

      case "vote": {
        const points = msg.points ?? 0;
        attachment.points = points;
        attachment.voted = points > 0;
        ws.serializeAttachment(attachment);
        await this.broadcastState();
        break;
      }

      case "showResults": {
        await this.ctx.storage.put("showResults", true);
        await this.broadcastState();
        break;
      }

      case "clearPoints": {
        // Reset all users' points
        for (const socket of this.ctx.getWebSockets()) {
          const data = socket.deserializeAttachment() as UserData;
          if (data.username) {
            data.points = 0;
            data.voted = false;
            socket.serializeAttachment(data);
          }
        }
        await this.ctx.storage.put("showResults", false);
        await this.broadcastState();
        break;
      }

      case "hidePoints": {
        await this.ctx.storage.put("showResults", false);
        await this.broadcastState();
        break;
      }

      case "reaction": {
        this.broadcast(JSON.stringify({
          type: "reaction",
          reaction: msg.reaction,
          sender: msg.sentBy,
        }));
        break;
      }

      case "callOutUser": {
        this.broadcast(JSON.stringify({
          type: "callout",
          sid: msg.sid,
        }));
        break;
      }

      case "startTimer": {
        this.broadcast(JSON.stringify({
          type: "startTimer",
          time: msg.time,
        }));
        break;
      }

      case "stopTimer": {
        this.broadcast(JSON.stringify({ type: "stopTimer" }));
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    ws.close(code, reason);
    await this.broadcastState();
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    ws.close(1011, "WebSocket error");
    await this.broadcastState();
  }

  private async clearRoom(): Promise<void> {
    await this.ctx.storage.put("showResults", false);
    for (const ws of this.ctx.getWebSockets()) {
      const data = ws.deserializeAttachment() as UserData;
      data.username = "";
      data.role = "";
      data.points = 0;
      data.voted = false;
      ws.serializeAttachment(data);
    }
    this.broadcast(JSON.stringify({ type: "clear" }));
  }

  private getUsers(): UserData[] {
    const users: UserData[] = [];
    for (const ws of this.ctx.getWebSockets()) {
      const data = ws.deserializeAttachment() as UserData;
      if (data && data.username) {
        users.push(data);
      }
    }
    return users;
  }

  private async broadcastState(): Promise<void> {
    const users = this.getUsers();
    const showResults = (await this.ctx.storage.get<boolean>("showResults")) ?? false;
    const msg = JSON.stringify({ type: "state", users, showResults });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(msg);
      } catch {
        // Socket may be closed, ignore
      }
    }
  }

  private broadcast(msg: string): void {
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(msg);
      } catch {
        // Socket may be closed, ignore
      }
    }
  }
}
