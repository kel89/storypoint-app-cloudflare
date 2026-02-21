import { User } from "./User";

// Messages the client sends to the server
export type ClientMessage =
  | { type: "join"; username: string; role: string }
  | { type: "vote"; points: number }
  | { type: "showResults" }
  | { type: "clearPoints" }
  | { type: "hidePoints" }
  | { type: "reaction"; reaction: string; sentBy: string }
  | { type: "callOutUser"; sid: string }
  | { type: "startTimer"; time: number }
  | { type: "stopTimer" };

// Messages the server sends to clients
export type ServerMessage =
  | { type: "state"; users: User[]; showResults: boolean }
  | { type: "joined"; sid: string }
  | { type: "reaction"; reaction: string; sender: string }
  | { type: "callout"; sid: string }
  | { type: "startTimer"; time: number }
  | { type: "stopTimer" }
  | { type: "clear" };
