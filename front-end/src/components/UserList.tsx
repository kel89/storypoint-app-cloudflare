import { useRef, useEffect } from "react";
import { User } from "../types/User";
import { Role } from "../types/Role";

type UserListProps = {
    users: User[];
    showPoints: boolean;
    roleFilter: Role[];
    onCallout: (sid: string) => void;
};

export default function UserList({
    users,
    showPoints,
    roleFilter,
    onCallout,
}: UserListProps) {
    const prevVotedRef = useRef<Set<string>>(new Set());
    const newlyVotedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const prevVoted = prevVotedRef.current;
        const newVoters = new Set<string>();

        for (const user of users) {
            if (user.voted && !prevVoted.has(user.sid)) {
                newVoters.add(user.sid);
            }
        }

        newlyVotedRef.current = newVoters;

        const timeout = setTimeout(() => {
            const updated = new Set(prevVoted);
            for (const user of users) {
                if (user.voted) updated.add(user.sid);
                else updated.delete(user.sid);
            }
            prevVotedRef.current = updated;
            newlyVotedRef.current = new Set();
        }, 500);

        return () => clearTimeout(timeout);
    }, [users]);

    const isWaitingForUser = (user: User) => {
        return !showPoints && !user.voted;
    };

    const getRoleText = (role: Role) => {
        const prettyRole = role
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");

        let colorClass = "";
        switch (role) {
            case Role.FrontEnd:
                colorClass = "text-violet-500";
                break;
            case Role.BackEnd:
                colorClass = "text-emerald-500";
                break;
            case Role.QA:
                colorClass = "text-blue-500";
                break;
            case Role.DevOps:
                colorClass = "text-yellow-500";
                break;
            default:
                colorClass = "text-gray-500";
        }

        return <span className={`${colorClass} text-xs`}>({prettyRole})</span>;
    };

    const filteredUsers = users
        .filter((user) => user.role !== Role.Presenter)
        .filter((user) => {
            if (roleFilter && roleFilter.length === 0) {
                return true;
            }
            return roleFilter.includes(user.role);
        });

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Seals</h1>
            {filteredUsers.map((user, index) => {
                const isNewlyVoted = newlyVotedRef.current.has(user.sid);

                return (
                    <div
                        key={user.sid}
                        className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2"
                    >
                        <span
                            className={`text-lg dark:text-gray-200 ${
                                isWaitingForUser(user) ? "text-red-500 dark:text-red-400" : ""
                            }`}
                        >
                            <span
                                className="cursor-pointer"
                                onClick={() => onCallout(user.sid)}
                            >
                                {user.username}
                            </span>
                            &nbsp;
                            {getRoleText(user.role)}
                        </span>

                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {showPoints ? (
                                <span
                                    className="inline-block animate-number-reveal"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animationFillMode: "backwards",
                                    }}
                                >
                                    {user.points}
                                </span>
                            ) : user.voted ? (
                                <span
                                    className={
                                        isNewlyVoted
                                            ? "inline-block animate-check-pop"
                                            : ""
                                    }
                                >
                                    &#x2705;
                                </span>
                            ) : (
                                <span>&#8987;</span>
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
