// src/expandCenterEmoji.ts
export function expandCenterEmoji(emoji: string, duration: number = 3000) {
    const emojiElement = document.createElement("div");
    emojiElement.textContent = emoji;
    emojiElement.style.position = "fixed";
    emojiElement.style.top = "50%";
    emojiElement.style.left = "50%";
    emojiElement.style.transform = "translate(-50%, -50%)";
    emojiElement.style.fontSize = "24px";
    emojiElement.style.willChange = "transform, opacity";
    emojiElement.style.zIndex = "1000";
    emojiElement.style.opacity = "1";

    document.body.appendChild(emojiElement);

    emojiElement.animate(
        [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            {
                transform: "translate(-50%, -50%) scale(30)",
                opacity: 1,
                offset: 0.9,
            },
            { transform: "translate(-50%, -50%) scale(30)", opacity: 0 },
        ],
        {
            duration: duration,
            easing: "ease-out",
            iterations: 1,
            fill: "forwards",
        }
    );

    setTimeout(() => {
        emojiElement.remove();
    }, duration);
}
