import { streakTier } from "../helpers/streakCelebration";

type StreakBadgeProps = {
    streak: number;
};

// Small pill showing the current consensus streak once it reaches 2
export default function StreakBadge({ streak }: StreakBadgeProps) {
    const tier = streakTier(streak);
    if (!tier) return null;

    return (
        <div
            key={streak}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-check-pop"
            title={`${streak} consensus rounds in a row`}
        >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white text-sm font-extrabold tracking-wide shadow-lg">
                <span className="text-lg leading-none">{tier.emoji}</span>
                <span>{tier.title}</span>
                <span className="opacity-80">· {streak} in a row</span>
            </div>
        </div>
    );
}
