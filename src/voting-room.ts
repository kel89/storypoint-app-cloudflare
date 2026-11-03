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

        // Close stale WebSockets for the same username (e.g. after reconnect)
        for (const other of this.ctx.getWebSockets()) {
          if (other === ws) continue;
          const otherData = other.deserializeAttachment() as UserData;
          if (otherData && otherData.username === attachment.username) {
            // Drop it from the user list right away; a half-open socket can linger in
            // getWebSockets() long after close() and would shadow this connection's votes
            otherData.username = "";
            other.serializeAttachment(otherData);
            try { other.close(4000, "Replaced by new connection"); } catch {}
          }
        }

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
        const alreadyShowing = (await this.ctx.storage.get<boolean>("showResults")) ?? false;
        if (!alreadyShowing) {
          // Score this round against the streak it started with, so hiding and
          // re-revealing the same round re-scores it instead of counting twice
          const base = (await this.ctx.storage.get<number>("streakBase")) ?? 0;
          await this.ctx.storage.put("streak", this.hasConsensus() ? base + 1 : 0);
        }
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
        // The next round builds on whatever streak this round ended with
        await this.ctx.storage.put("streakBase", (await this.ctx.storage.get<number>("streak")) ?? 0);
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
    await this.ctx.storage.delete(["streak", "streakBase"]);
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
    // Deduplicate by username, keeping the newest connection (highest SID counter)
    const userMap = new Map<string, UserData>();
    for (const ws of this.ctx.getWebSockets()) {
      const data = ws.deserializeAttachment() as UserData;
      if (data && data.username) {
        const existing = userMap.get(data.username);
        if (!existing || this.compareSids(data.sid, existing.sid) > 0) {
          userMap.set(data.username, data);
        }
      }
    }
    return Array.from(userMap.values());
  }

  // Consensus = at least two people voted and every vote is the same
  private hasConsensus(): boolean {
    const voters = this.getUsers().filter((u) => u.points > 0);
    return voters.length >= 2 && voters.every((u) => u.points === voters[0].points);
  }

  private compareSids(a: string, b: string): number {
    // SID format: "user_{counter}_{timestamp}". sidCounter resets when the object
    // hibernates, so order by timestamp first and only use the counter as a tiebreak.
    const [, counterA, timeA] = a.split("_").map(Number);
    const [, counterB, timeB] = b.split("_").map(Number);
    return timeA - timeB || counterA - counterB;
  }

  private async broadcastState(): Promise<void> {
    const users = this.getUsers();
    const showResults = (await this.ctx.storage.get<boolean>("showResults")) ?? false;
    const streak = (await this.ctx.storage.get<number>("streak")) ?? 0;
    const msg = JSON.stringify({ type: "state", users, showResults, streak });
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
