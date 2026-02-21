import UserList from "./UserList";
import { User } from "../types/User";
import ResultsGraph from "./ResultsGraph";
import ReactionList from "./ReactionMenu";
import ShareRoom from "./ShareRoom";

type ResultsViewProps = {
    users: User[];
    onClearPoints: () => void;
    onHidePoints: () => void;
    onReaction: (reaction: string) => void;
    roomId: string;
};

export default function ResultsView({
    users,
    onClearPoints,
    onHidePoints,
    onReaction,
    roomId,
}: ResultsViewProps) {
    return (
        <>
            <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 p-4 flex flex-col items-center">
                    <div className="w-full mb-4">
                        <UserList
                            users={users}
                            showPoints={true}
                            roleFilter={[]}
                            onCallout={() => {}}
                        />
                    </div>
                    <div className="mb-3">
                        <ReactionList onReaction={onReaction} />
                    </div>
                    <div className="w-full max-w-lg mb-3">
                        <ShareRoom roomId={roomId} />
                    </div>
                    <div className="w-full flex gap-2">
                        <button
                            onClick={onClearPoints}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors w-full"
                        >
                            Clear Votes
                        </button>
                        <button
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700 transition-colors w-full"
                            onClick={onHidePoints}
                        >
                            Hide Votes
                        </button>
                    </div>
                </div>
                <div className="w-full sm:w-2/3 min-h-[250px] p-4 animate-fade-slide-up">
                    <ResultsGraph users={users} />
                </div>
            </div>
        </>
    );
}
