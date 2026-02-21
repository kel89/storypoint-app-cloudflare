import { VotingRoom } from "./voting-room";

export { VotingRoom };

interface Env {
  VOTING_ROOM: DurableObjectNamespace;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route /api/room/:roomId/websocket → Durable Object (WebSocket upgrade)
    const wsMatch = path.match(/^\/api\/room\/([^/]+)\/websocket$/);
    if (wsMatch) {
      const roomId = wsMatch[1];
      const id = env.VOTING_ROOM.idFromName(roomId);
      const stub = env.VOTING_ROOM.get(id);
      return stub.fetch(request);
    }

    // Route /api/room/:roomId/clear → Durable Object (clear room)
    const clearMatch = path.match(/^\/api\/room\/([^/]+)\/clear$/);
    if (clearMatch) {
      const roomId = clearMatch[1];
      const id = env.VOTING_ROOM.idFromName(roomId);
      const stub = env.VOTING_ROOM.get(id);
      return stub.fetch(request);
    }

    // Everything else is handled by [assets] config in wrangler.toml
    return env.ASSETS.fetch(request);
  },
};
