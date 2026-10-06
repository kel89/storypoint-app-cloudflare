import { Role } from "../types/Role";

type ProfileButtonProps = {
    username: string;
    role: Role | undefined;
    onEdit: () => void;
};

export default function ProfileButton({
    username,
    role,
    onEdit,
}: ProfileButtonProps) {
    return (
        <button
            onClick={onEdit}
            className="fixed top-4 right-16 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 transition-colors shadow-md max-w-[60vw]"
            aria-label="Edit name and role"
            title="Edit name and role"
        >
            <span className="truncate">
                {username}
                {role && (
                    <span className="text-gray-500 dark:text-gray-400">
                        {" "}
                        · {role}
                    </span>
                )}
            </span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
        </button>
    );
}
