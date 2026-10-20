import { ClientMessage, ServerMessage } from "./types/Messages";

type MessageHandler = (data: any) => void;

// Close code the server uses when another connection with the same username replaces this one
const REPLACED_CLOSE_CODE = 4000;

export class RoomSocket {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private roomId: string;
  private joinData: { username: string; role: string } | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  // Messages sent while the socket was down, flushed after re-joining
  private pending: ClientMessage[] = [];

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  connect(username: string, role: string): void {
    this.joinData = { username, role };
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    window.addEventListener("online", this.reconnectNow);
    document.addEventListener("visibilitychange", this.reconnectNow);
    this.openSocket();
  }

  // Skip the backoff wait and reconnect immediately if the socket is down
  private reconnectNow = (): void => {
    if (this.intentionalClose || !this.joinData) return;
    if (document.visibilityState === "hidden") return;
    const state = this.ws?.readyState;
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    this.openSocket();
  };

  private emit(type: string, data: unknown): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  private openSocket(): void {
    if (this.ws) {
      // Detach handlers so the old socket's close doesn't schedule another reconnect
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/room/${this.roomId}/websocket`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      // Send join message
      if (this.joinData) {
        this.send({ type: "join", username: this.joinData.username, role: this.joinData.role });
      }
      const pending = this.pending;
      this.pending = [];
      for (const msg of pending) {
        this.send(msg);
      }
    };

    this.ws.onmessage = (event) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      this.emit(msg.type, msg);
    };

    this.ws.onclose = (event) => {
      if (this.intentionalClose) return;
      if (event.code === REPLACED_CLOSE_CODE) {
        // Another tab joined with this username; reconnecting would just kick it out
        this.emit("replaced", {});
        return;
      }
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose will fire after this
    };
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.openSocket();
    }, delay);
  }

  send(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return;
    }
    if (msg.type !== "join") {
      this.pending.push(msg);
    }
    this.reconnectNow();
  }

  on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  disconnect(): void {
    this.intentionalClose = true;
    window.removeEventListener("online", this.reconnectNow);
    document.removeEventListener("visibilitychange", this.reconnectNow);
    this.pending = [];
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }
}
