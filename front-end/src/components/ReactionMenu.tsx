type ReactionListProps = {
    onReaction: (reaction: string) => void;
};

export default function ReactionList({ onReaction }: ReactionListProps) {
    return (
        <div className="border rounded border-gray-100 shadow-lg p-2">
            <h2>Reactions</h2>
            <div className="flex flex-wrap justify-between gap-1 p-2">
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("happyFaces")}
                >
                    <span>😊</span>
                </button>
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("makeItRain")}
                >
                    <span>💰</span>
                </button>
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("mindBlown")}
                >
                    <span>🤯</span>
                </button>
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("hurryUp")}
                >
                    <span>🕒</span>
                </button>
            </div>
        </div>
    );
}
