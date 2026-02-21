import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";

import "./App.css";
import "react-toastify/dist/ReactToastify.min.css";
import Connect from "./components/Connect";
import VotingView from "./components/VotingView";
import ResultsView from "./components/ResultsView";
import { User } from "./types/User";
import githubLogo from "./assets/github-mark.svg";
import { rainDollarEmojis } from "./helpers/rainDollars";
import { playHurryUp } from "./helpers/playHurryUp";
import { createFloatingEmojis } from "./helpers/emojiAnimation";
import { expandCenterEmoji } from "./helpers/expandCenterEmoji";
import { fireConsensusConfetti } from "./helpers/confetti";
import { UserContext } from "./context/UserContex";
import { RoomSocket } from "./websocket";
import { Role } from "./types/Role";

function App() {
    const { roomId } = useParams<{ roomId: string }>();
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<Role | undefined>();
    const [sid, setSid] = useState<string>();
    const [users, setUsers] = useState<User[]>([]);
    const [showPoints, setShowPoints] = useState(false);
    const [presentationMode, setPresentationMode] = useState(false);
    const sidRef = useRef<string>();
    const socketRef = useRef<RoomSocket | null>(null);

    // Reveal transition state
    const [isRevealing, setIsRevealing] = useState(false);
    const [displayShowPoints, setDisplayShowPoints] = useState(false);
    const prevShowPointsRef = useRef(false);

    // Reveal transition orchestrator
    useEffect(() => {
        if (showPoints && !prevShowPointsRef.current) {
            // Transitioning to results: fade out first
            setIsRevealing(true);
            const timer = setTimeout(() => {
                setDisplayShowPoints(true);
                setIsRevealing(false);
            }, 300);
            prevShowPointsRef.current = showPoints;
            return () => clearTimeout(timer);
        }

        if (!showPoints && prevShowPointsRef.current) {
            // Going back to voting view
            setDisplayShowPoints(false);
        }

        prevShowPointsRef.current = showPoints;
    }, [showPoints]);

    // Consensus confetti detection
    useEffect(() => {
        if (!showPoints) return;

        const voters = users.filter((u) => u.points > 0);
        if (voters.length < 2) return;

        const allSame = voters.every((u) => u.points === voters[0].points);
        if (!allSame) return;

        const timer = setTimeout(() => {
            fireConsensusConfetti();
            toast("Consensus! The team agrees!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "light",
                transition: Bounce,
            });
        }, 800);

        return () => clearTimeout(timer);
    }, [showPoints, users]);

    // Update sidRef whenever sid changes
    useEffect(() => {
        sidRef.current = sid;
    }, [sid]);

    // Clean up socket on unmount
    useEffect(() => {
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const handleConnect = useCallback(
        (connectUsername: string, connectRole: string) => {
            if (!roomId) return;
            const rs = new RoomSocket(roomId);

            rs.on("joined", (data: { sid: string }) => {
                sidRef.current = data.sid;
                setSid(data.sid);
            });

            rs.on("state", (data: { users: User[]; showResults: boolean }) => {
                setUsers(data.users);
                setShowPoints(data.showResults);
            });

            rs.on(
                "reaction",
                (data: { reaction: string; sender: string }) => {
                    const { reaction, sender } = data;
                    let reactionName: string = "";
                    if (reaction === "makeItRain") {
                        rainDollarEmojis("💵", 3000, 100);
                        reactionName = "make it rain";
                    }
                    if (reaction === "hurryUp") {
                        playHurryUp();
                        reactionName = "we're waiting";
                    }
                    if (reaction === "happyFaces") {
                        createFloatingEmojis("😊", 3000, 100);
                        reactionName = "happy faces";
                    }
                    if (reaction === "mindBlown") {
                        expandCenterEmoji("🤯", 3000);
                        reactionName = "mind blown";
                    }
                    toast(`${sender} reacted with ${reactionName}`, {
                        position: "bottom-left",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        progress: undefined,
                        theme: "light",
                        transition: Bounce,
                    });
                }
            );

            rs.on("callout", (data: { sid: string }) => {
                if (data.sid == sidRef.current) {
                    playHurryUp();
                    toast("You have been called out!", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                        transition: Bounce,
                    });
                }
            });

            rs.on("clear", () => {
                setUsername("");
                setRole(undefined);
                setSid(undefined);
                setUsers([]);
                setShowPoints(false);
                setPresentationMode(false);
                setIsConnected(false);
                setDisplayShowPoints(false);
                setIsRevealing(false);
                prevShowPointsRef.current = false;
                socketRef.current?.disconnect();
                socketRef.current = null;

                toast("The room has been cleared!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            });

            rs.connect(connectUsername, connectRole);
            socketRef.current = rs;
            setIsConnected(true);
        },
        [roomId]
    );

    // Callback props for child components
    const onVote = useCallback((points: number) => {
        socketRef.current?.send({ type: "vote", points });
    }, []);

    const onShowResults = useCallback(() => {
        socketRef.current?.send({ type: "showResults" });
    }, []);

    const onClearPoints = useCallback(() => {
        socketRef.current?.send({ type: "clearPoints" });
    }, []);

    const onHidePoints = useCallback(() => {
        socketRef.current?.send({ type: "hidePoints" });
    }, []);

    const onReaction = useCallback(
        (reaction: string) => {
            socketRef.current?.send({
                type: "reaction",
                reaction,
                sentBy: username,
            });
        },
        [username]
    );

    const onCallout = useCallback((userSid: string) => {
        socketRef.current?.send({ type: "callOutUser", sid: userSid });
    }, []);

    const transitionClass = isRevealing
        ? "opacity-0 transition-opacity duration-300"
        : "opacity-100 transition-opacity duration-300";

    return (
        <>
            {!isConnected ? (
                <Connect
                    username={username}
                    setUsername={setUsername}
                    role={role}
                    setRole={setRole}
                    onConnect={handleConnect}
                    roomId={roomId || ""}
                />
            ) : displayShowPoints ? (
                <div className={transitionClass}>
                    <UserContext.Provider value={username}>
                        <ResultsView
                            users={users}
                            onClearPoints={onClearPoints}
                            onHidePoints={onHidePoints}
                            onReaction={onReaction}
                            roomId={roomId || ""}
                        />
                    </UserContext.Provider>
                </div>
            ) : (
                <div className={transitionClass}>
                    <UserContext.Provider value={username}>
                        <VotingView
                            users={users}
                            presentationMode={presentationMode}
                            setPresentationMode={setPresentationMode}
                            onShowResults={onShowResults}
                            onClearPoints={onClearPoints}
                            onVote={onVote}
                            onReaction={onReaction}
                            onCallout={onCallout}
                            roomId={roomId || ""}
                        />
                    </UserContext.Provider>
                </div>
            )}

            <a
                href="https://github.com/kel89/storypoint-app"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-4 right-4"
            >
                <img
                    src={githubLogo}
                    alt="GitHub logo"
                    className="w-10 h-10"
                />
            </a>
            <ToastContainer />
        </>
    );
}

export default App;
