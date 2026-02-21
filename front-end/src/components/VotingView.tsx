import { useState } from "react";
import UserList from "./UserList";
import PointSelector from "./PointSelector";
import { User } from "../types/User";
import RoleFilter from "./RoleFilter";
import ReactionList from "./ReactionMenu";
import { Role } from "../types/Role";
import ShareRoom from "./ShareRoom";

type VotingViewProps = {
    users: User[];
    presentationMode: boolean;
    setPresentationMode: (mode: boolean) => void;
    onShowResults: () => void;
    onClearPoints: () => void;
    onVote: (points: number) => void;
    onReaction: (reaction: string) => void;
    onCallout: (sid: string) => void;
    roomId: string;
};

export default function VotingView({
    users,
    presentationMode,
    setPresentationMode,
    onShowResults,
    onClearPoints,
    onVote,
    onReaction,
    onCallout,
    roomId,
}: VotingViewProps) {
    const [roleFilter, setRoleFilter] = useState<Role[]>([]);

    return (
        <>
            <div className="flex flex-col sm:flex-row">
                <div
                    className={`w-full ${
                        presentationMode ? "sm:w-full" : "sm:w-1/3"
                    } p-4 sm:p-8 flex flex-col items-center justify-center`}
                >
                    <div className="w-full max-w-2xl mb-4">
                        <UserList
                            users={users}
                            showPoints={false}
                            roleFilter={roleFilter}
                            onCallout={onCallout}
                        />
                        <div className="mt-1">
                            <RoleFilter
                                roleFilter={roleFilter}
                                setRoleFilter={setRoleFilter}
                            />
                        </div>
                    </div>
                    <div className="w-full max-w-lg mb-3">
                        <ReactionList onReaction={onReaction} />
                    </div>
                    <div className="w-full max-w-lg mb-3">
                        <ShareRoom roomId={roomId} />
                    </div>
                    <div className="w-full max-w-xl flex gap-2 mb-2">
                        <button
                            onClick={onShowResults}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors w-full"
                        >
                            Show Votes
                        </button>
                        <button
                            onClick={onClearPoints}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-700 transition-colors w-full"
                        >
                            Clear Votes
                        </button>
                    </div>
                    <button
                        className="text-blue-500 hover:bg-blue-100 px-4 py-2 rounded transition-colors duration-200 border border-blue-200"
                        onClick={() => setPresentationMode(!presentationMode)}
                    >
                        {presentationMode
                            ? "Exit Presentation Mode"
                            : "Enter Presentation Mode"}
                    </button>
                </div>
                {
                    // If in presentation mode, don't show point selector
                    presentationMode ? null : (
                        <div className="w-full sm:w-2/3 p-4">
                            <PointSelector onVote={onVote} />
                        </div>
                    )
                }
            </div>
        </>
    );
}
