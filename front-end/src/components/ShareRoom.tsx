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
        <div className="border rounded border-gray-100 shadow-lg p-2 flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400">Room: {roomId}</span>
            <button
                onClick={copyRoomLink}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
                {copied ? "Copied!" : "Copy Link"}
            </button>
        </div>
    );
}
