const PARTICLE_COLORS = [
    "#3B82F6", // blue-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
];

export function voteParticleBurst(originX: number, originY: number) {
    const count = 8;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        particle.style.position = "fixed";
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.width = "8px";
        particle.style.height = "8px";
        particle.style.borderRadius = "50%";
        particle.style.pointerEvents = "none";
        particle.style.zIndex = "1000";
        particle.style.backgroundColor =
            PARTICLE_COLORS[i % PARTICLE_COLORS.length];

        document.body.appendChild(particle);

        const angle = (i / count) * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        const endX = originX + Math.cos(angle) * distance;
        const endY = originY + Math.sin(angle) * distance;

        particle.animate(
            [
                {
                    transform: "translate(-50%, -50%) scale(1)",
                    opacity: 1,
                },
                {
                    transform: `translate(${endX - originX - 4}px, ${endY - originY - 4}px) scale(0)`,
                    opacity: 0,
                },
            ],
            {
                duration: 500,
                easing: "ease-out",
                fill: "forwards",
            }
        );

        setTimeout(() => particle.remove(), 550);
    }
}
