// src/rainDollarEmojis.ts
export function rainDollarEmojis(
    emoji: string = "$",
    duration: number = 3000,
    count: number = 20
) {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.overflow = "hidden";
    container.style.zIndex = "1000";

    for (let i = 0; i < count; i++) {
        const emojiElement = document.createElement("div");
        emojiElement.textContent = emoji;
        emojiElement.style.position = "absolute";
        emojiElement.style.fontSize = "24px";
        emojiElement.style.willChange = "transform, opacity";
        container.appendChild(emojiElement);

        const startX = Math.random() * window.innerWidth;
        const endY = window.innerHeight;
        const durationInMs = Math.random() * duration + duration / 2;

        emojiElement.style.transform = `translate(${startX}px, -50px)`;
        emojiElement.style.opacity = "1";
        emojiElement.animate(
            [
                { transform: `translate(${startX}px, -50px)`, opacity: 1 },
                {
                    transform: `translate(${startX}px, ${endY}px)`,
                    opacity: 1,
                    offset: 0.75,
                },
                { transform: `translate(${startX}px, ${endY}px)`, opacity: 0 },
            ],
            {
                duration: durationInMs,
                easing: "ease-out",
                iterations: 1,
                fill: "forwards",
            }
        );
    }

    document.body.appendChild(container);

    setTimeout(() => {
        container.remove();
    }, duration);
}
