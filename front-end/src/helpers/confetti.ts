import confetti from "canvas-confetti";

export function fireConsensusConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };

    frame();
}
