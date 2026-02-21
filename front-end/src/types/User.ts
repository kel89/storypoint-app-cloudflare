import { Role } from "./Role";

export type User = {
    sid: string;
    username: string;
    points: number;
    voted: boolean;
    role: Role;
};
