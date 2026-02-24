import { useState } from "react";

type ShareRoomProps = {
    roomId: string;
};

export default function ShareRoom({ roomId }: ShareRoomProps) {
    const [copied, setCopied] = useState(false);

    const copyRoomLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border rounded border-gray-100 dark:border-gray-700 shadow-lg dark:shadow-gray-900/50 p-2 flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">Room: {roomId}</span>
            <button
                onClick={copyRoomLink}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors dark:text-gray-200"
            >
                {copied ? "Copied!" : "Copy Link"}
            </button>
        </div>
    );
}
