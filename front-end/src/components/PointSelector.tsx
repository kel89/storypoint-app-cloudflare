import { useState, useRef } from "react";
import { voteParticleBurst } from "../helpers/voteParticleBurst";

type PointSelectorProps = {
    onVote: (points: number) => void;
};

export default function PointSelector({ onVote }: PointSelectorProps) {
    const POINT_OPTIONS = [1, 2, 3, 5, 8, 13, 21];
    const [selectedPoint, setSelectedPoint] = useState<number>();
    const [bouncingPoint, setBouncingPoint] = useState<number | null>(null);
    const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const handlePointSelect = (
        point: number,
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        setSelectedPoint(point);
        onVote(point);

        // Trigger bounce animation
        if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
        setBouncingPoint(point);
        bounceTimeoutRef.current = setTimeout(() => setBouncingPoint(null), 350);

        // Particle burst from button center
        if (point !== 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            voteParticleBurst(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            );
        }
    };

    const colorClasses: Record<number, string> = {
        1: "bg-green-500 hover:bg-green-700",
        2: "bg-green-500 hover:bg-green-700",
        3: "bg-yellow-500 hover:bg-yellow-700",
        5: "bg-yellow-500 hover:bg-yellow-700",
        8: "bg-orange-500 hover:bg-orange-700",
        13: "bg-red-500 hover:bg-red-700",
        21: "bg-red-500 hover:bg-red-700",
    };

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {POINT_OPTIONS.map((point) => (
                <button
                    key={point}
                    onClick={(e) => handlePointSelect(point, e)}
                    className={`w-full h-32 text-white rounded flex items-center justify-center text-2xl
                                ${colorClasses[point]} transition-colors
                                ${
                                    point === selectedPoint
                                        ? "ring-4 ring-blue-500 animate-vote-ring-pulse"
                                        : ""
                                }
                                ${bouncingPoint === point ? "animate-vote-bounce" : ""}`}
                >
                    {point}
                </button>
            ))}
            <button
                onClick={(e) => handlePointSelect(0, e)}
                className="w-full h-32 text-white bg-gray-500 rounded flex items-center justify-center text-2xl transition-colors"
            >
                Clear My Vote
            </button>
        </div>
    );
}
