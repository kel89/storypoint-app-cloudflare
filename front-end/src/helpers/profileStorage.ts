import { Role } from "../types/Role";

const PROFILE_KEY = "profile";

export type Profile = {
    username: string;
    role: Role;
};

export function loadProfile(): Profile | null {
    try {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (
            typeof parsed?.username !== "string" ||
            parsed.username.trim() === "" ||
            !Object.values(Role).includes(parsed.role)
        ) {
            return null;
        }
        return { username: parsed.username, role: parsed.role };
    } catch {
        return null;
    }
}

export function saveProfile(profile: Profile): void {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
        // Storage may be unavailable (e.g. private browsing), ignore
    }
}
