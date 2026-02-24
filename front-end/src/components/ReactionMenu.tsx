type ReactionListProps = {
    onReaction: (reaction: string) => void;
};

export default function ReactionList({ onReaction }: ReactionListProps) {
    return (
        <div className="border rounded border-gray-100 dark:border-gray-700 shadow-lg dark:shadow-gray-900/50 p-2">
            <h2 className="dark:text-gray-200">Reactions</h2>
            <div className="flex flex-wrap justify-between gap-1 p-2">
                <button
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("happyFaces")}
                >
                    <span>😊</span>
                </button>
                <button
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("makeItRain")}
                >
                    <span>💰</span>
                </button>
                <button
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("mindBlown")}
                >
                    <span>🤯</span>
                </button>
                <button
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded inline-flex items-center"
                    onClick={() => onReaction("hurryUp")}
                >
                    <span>🕒</span>
                </button>
            </div>
        </div>
    );
}
