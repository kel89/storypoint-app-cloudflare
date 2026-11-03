import confetti from "canvas-confetti";
import { fireConsensusConfetti } from "./confetti";

// Celebrations for consecutive consensus rounds (bowling-style):
//   1 = Consensus, 2 = On Fire, 3 = Turkey, 4 = Hambone, 5+ = Hive Mind

export type StreakTier = {
    title: string;
    emoji: string;
};

export function streakTier(streak: number): StreakTier | null {
    if (streak >= 5) return { title: "HIVE MIND", emoji: "🧠" };
    if (streak === 4) return { title: "HAMBONE", emoji: "🍖" };
    if (streak === 3) return { title: "TURKEY", emoji: "🦃" };
    if (streak === 2) return { title: "ON FIRE", emoji: "🔥" };
    return null;
}

const OVERLAY_MS = 3800;

const prefersReducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function createLayer(): HTMLDivElement {
    const layer = document.createElement("div");
    Object.assign(layer.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: "1000",
    });
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), OVERLAY_MS + 500);
    return layer;
}

function addEl(
    parent: HTMLElement,
    text: string,
    style: Partial<CSSStyleDeclaration>
): HTMLDivElement {
    const el = document.createElement("div");
    el.textContent = text;
    Object.assign(el.style, { position: "absolute", willChange: "transform, opacity" }, style);
    parent.appendChild(el);
    return el;
}

// Full-screen tinted flash behind everything
function flash(layer: HTMLElement, background: string) {
    const bg = addEl(layer, "", { inset: "0", background });
    bg.animate(
        [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }],
        { duration: OVERLAY_MS, easing: "ease-out", fill: "forwards" }
    );
}

// Big slam-in headline with optional subtitle
function headline(
    layer: HTMLElement,
    title: string,
    gradient: string,
    subtitle: string,
    shake: boolean
) {
    const wrap = addEl(layer, "", {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        width: "100%",
        padding: "0 16px",
        boxSizing: "border-box",
    });

    const t = addEl(wrap, title, {
        position: "relative",
        fontSize: "clamp(3rem, 13vw, 9rem)",
        fontWeight: "900",
        fontStyle: "italic",
        letterSpacing: "-0.02em",
        lineHeight: "1",
        background: gradient,
        backgroundSize: "200% 200%",
        webkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.35)) drop-shadow(0 0 24px rgba(255,255,255,0.35))",
    });
    // Safari still wants the prefixed clip property set this way
    t.style.setProperty("-webkit-background-clip", "text");

    if (subtitle) {
        const s = addEl(wrap, subtitle, {
            position: "relative",
            marginTop: "12px",
            fontSize: "clamp(1rem, 3.5vw, 1.75rem)",
            fontWeight: "800",
            letterSpacing: "0.2em",
            color: "white",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        });
        s.animate([{ opacity: 0 }, { opacity: 0, offset: 0.15 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], {
            duration: OVERLAY_MS,
            fill: "forwards",
        });
    }

    t.animate(
        [
            { transform: "scale(4)", opacity: 0 },
            { transform: "scale(0.9)", opacity: 1, offset: 0.1 },
            { transform: "scale(1.05)", offset: 0.16 },
            { transform: "scale(1)", offset: 0.22 },
            { transform: "scale(1)", opacity: 1, offset: 0.85 },
            { transform: "scale(1.4)", opacity: 0 },
        ],
        { duration: OVERLAY_MS, easing: "ease-out", fill: "forwards" }
    );
    t.animate([{ backgroundPosition: "0% 50%" }, { backgroundPosition: "100% 50%" }], {
        duration: 900,
        iterations: Infinity,
        direction: "alternate",
    });

    if (shake && !prefersReducedMotion()) {
        wrap.animate(
            [
                { transform: "translate(-50%, -50%) rotate(0deg)" },
                { transform: "translate(calc(-50% - 4px), calc(-50% + 2px)) rotate(-1deg)" },
                { transform: "translate(calc(-50% + 4px), calc(-50% - 2px)) rotate(1deg)" },
                { transform: "translate(-50%, -50%) rotate(0deg)" },
            ],
            { duration: 120, iterations: 30, delay: 350 }
        );
    }
}

// Emojis floating up from the bottom of the screen
function riseFromBottom(layer: HTMLElement, emojis: string[], count: number) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * window.innerWidth;
        const size = 24 + Math.random() * 40;
        const el = addEl(layer, emojis[i % emojis.length], {
            left: "0",
            top: "0",
            fontSize: `${size}px`,
        });
        const drift = (Math.random() - 0.5) * 120;
        el.animate(
            [
                { transform: `translate(${x}px, ${window.innerHeight + 60}px) scale(0.6)`, opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { transform: `translate(${x + drift}px, ${-80}px) scale(1.2)`, opacity: 0 },
            ],
            {
                duration: 1800 + Math.random() * 1600,
                delay: Math.random() * 1500,
                easing: "ease-in",
                fill: "both",
            }
        );
    }
}

// Emojis tumbling down from the top of the screen
function rainFromTop(layer: HTMLElement, emojis: string[], count: number) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * window.innerWidth;
        const spin = (Math.random() - 0.5) * 1080;
        const el = addEl(layer, emojis[i % emojis.length], {
            left: "0",
            top: "0",
            fontSize: `${28 + Math.random() * 28}px`,
        });
        el.animate(
            [
                { transform: `translate(${x}px, -80px) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${x}px, ${window.innerHeight + 80}px) rotate(${spin}deg)`, opacity: 1 },
            ],
            {
                duration: 1600 + Math.random() * 1400,
                delay: Math.random() * 1800,
                easing: "cubic-bezier(0.4, 0, 0.9, 0.6)",
                fill: "both",
            }
        );
    }
}

// Bowling scoreboard strike marks: X X X ...
function strikeMarks(layer: HTMLElement, n: number, color: string) {
    const row = addEl(layer, "", {
        left: "50%",
        top: "calc(50% - clamp(5rem, 16vw, 10rem))",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "12px",
    });
    for (let i = 0; i < n; i++) {
        const box = addEl(row, "✕", {
            position: "relative",
            width: "clamp(36px, 8vw, 56px)",
            height: "clamp(36px, 8vw, 56px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(24px, 6vw, 40px)",
            fontWeight: "900",
            color,
            background: "rgba(255,255,255,0.92)",
            border: `3px solid ${color}`,
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        });
        box.animate(
            [
                { transform: "scale(0) rotate(-90deg)", opacity: 0 },
                { transform: "scale(1.3) rotate(10deg)", opacity: 1, offset: 0.6 },
                { transform: "scale(1) rotate(0deg)", opacity: 1 },
            ],
            { duration: 350, delay: 300 + i * 220, easing: "ease-out", fill: "both" }
        );
        box.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 400,
            delay: OVERLAY_MS - 500,
            fill: "forwards",
        });
    }
}

function confettiCannons(colors: string[], durationMs: number, shapes?: confetti.Shape[]) {
    const end = Date.now() + durationMs;
    const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, shapes, zIndex: 1001 });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, shapes, zIndex: 1001 });
        if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
}

function fireworks(durationMs: number) {
    const end = Date.now() + durationMs;
    const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
            particleCount: 60,
            startVelocity: 30,
            spread: 360,
            ticks: 70,
            origin: { x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.4 },
            colors: ["#a855f7", "#ec4899", "#22d3ee", "#facc15", "#ffffff"],
            zIndex: 1001,
        });
    }, 280);
}

function onFire(layer: HTMLElement) {
    flash(layer, "radial-gradient(ellipse at bottom, rgba(255,90,0,0.55), rgba(180,0,0,0.25) 50%, transparent 80%)");
    riseFromBottom(layer, ["🔥", "🔥", "🔥", "💥"], 40);
    headline(layer, "🔥 ON FIRE! 🔥", "linear-gradient(90deg, #fde047, #f97316, #dc2626, #f97316, #fde047)", "2 IN A ROW", true);
    confettiCannons(["#ef4444", "#f97316", "#facc15"], 2500);
}

function turkey(layer: HTMLElement) {
    flash(layer, "radial-gradient(ellipse at center, rgba(180,83,9,0.45), rgba(120,53,15,0.2) 60%, transparent 85%)");
    strikeMarks(layer, 3, "#b45309");
    headline(layer, "TURKEY!", "linear-gradient(90deg, #fbbf24, #b45309, #dc2626, #b45309, #fbbf24)", "3 IN A ROW · GOBBLE GOBBLE", true);

    // A turkey struts across the screen and knocks the pins over
    const y = window.innerHeight * 0.78;
    const bird = addEl(layer, "🦃", { left: "0", top: "0", fontSize: "clamp(64px, 12vw, 120px)" });
    bird.animate(
        [
            { transform: `translate(${window.innerWidth + 40}px, ${y}px)` },
            { transform: `translate(-200px, ${y}px)` },
        ],
        { duration: 3200, delay: 200, easing: "linear", fill: "both" }
    );
    bird.animate(
        [{ marginTop: "0px" }, { marginTop: "-24px" }, { marginTop: "0px" }],
        { duration: 300, iterations: 12, delay: 200 }
    );
    for (let i = 0; i < 6; i++) {
        const pinX = window.innerWidth * (0.25 + i * 0.1);
        const pin = addEl(layer, "🎳", { left: "0", top: "0", fontSize: "48px" });
        // Roughly when the turkey reaches this pin
        const hitAt = 200 + 3200 * ((window.innerWidth + 40 - pinX) / (window.innerWidth + 240));
        const dir = Math.random() > 0.5 ? 1 : -1;
        pin.animate(
            [
                { transform: `translate(${pinX}px, ${y + 20}px) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${pinX}px, ${y + 20}px) rotate(0deg)`, opacity: 1, offset: 0.01 },
                { transform: `translate(${pinX - 150 - Math.random() * 100}px, ${y - 300 - Math.random() * 200}px) rotate(${dir * 720}deg)`, opacity: 0 },
            ],
            { duration: 900, delay: hitAt, easing: "ease-out", fill: "both" }
        );
    }
    rainFromTop(layer, ["🍂", "🪶", "🍁"], 30);
    confettiCannons(["#78350f", "#b45309", "#f59e0b", "#dc2626"], 2500);
}

function hambone(layer: HTMLElement) {
    flash(layer, "radial-gradient(ellipse at center, rgba(244,114,182,0.5), rgba(190,24,93,0.25) 55%, transparent 85%)");
    // Giant spinning ham bone behind the text
    const big = addEl(layer, "🍖", {
        left: "50%",
        top: "50%",
        fontSize: "clamp(160px, 40vw, 360px)",
        opacity: "0.35",
        transform: "translate(-50%, -50%)",
    });
    big.animate(
        [
            { transform: "translate(-50%, -50%) scale(0) rotate(0deg)", opacity: 0 },
            { transform: "translate(-50%, -50%) scale(1) rotate(360deg)", opacity: 0.35, offset: 0.3 },
            { transform: "translate(-50%, -50%) scale(1) rotate(720deg)", opacity: 0.35, offset: 0.85 },
            { transform: "translate(-50%, -50%) scale(0) rotate(1080deg)", opacity: 0 },
        ],
        { duration: OVERLAY_MS, easing: "ease-in-out", fill: "forwards" }
    );
    strikeMarks(layer, 4, "#be185d");
    headline(layer, "HAMBONE!", "linear-gradient(90deg, #fecdd3, #f472b6, #be185d, #f472b6, #fecdd3)", "4 IN A ROW · SIZZLIN'", true);
    rainFromTop(layer, ["🍖", "🍖", "🥓", "🍗"], 50);

    confettiCannons(["#f472b6", "#be185d", "#fecdd3", "#ffffff"], 3000);
}

function hiveMind(layer: HTMLElement, streak: number) {
    flash(layer, "radial-gradient(ellipse at center, rgba(88,28,135,0.75), rgba(15,23,42,0.85) 70%)");

    // Stars twinkling in the background
    for (let i = 0; i < 40; i++) {
        const star = addEl(layer, "✦", {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${8 + Math.random() * 14}px`,
            color: "white",
        });
        star.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
            duration: 800 + Math.random() * 1200,
            delay: Math.random() * 2500,
            iterations: 2,
        });
    }

    // Ring of brains orbiting the headline
    const orbit = addEl(layer, "", { left: "50%", top: "50%", width: "0", height: "0" });
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.38;
    const n = 10;
    for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        addEl(orbit, "🧠", {
            left: `${Math.cos(angle) * radius}px`,
            top: `${Math.sin(angle) * radius}px`,
            fontSize: "clamp(28px, 5vw, 48px)",
            transform: "translate(-50%, -50%)",
        });
    }
    orbit.animate(
        [
            { transform: "rotate(0deg) scale(0)", opacity: 0 },
            { transform: "rotate(120deg) scale(1)", opacity: 1, offset: 0.2 },
            { transform: "rotate(480deg) scale(1)", opacity: 1, offset: 0.85 },
            { transform: "rotate(600deg) scale(2)", opacity: 0 },
        ],
        { duration: OVERLAY_MS, easing: "ease-in-out", fill: "forwards" }
    );

    headline(
        layer,
        "HIVE MIND",
        "linear-gradient(90deg, #f472b6, #a855f7, #22d3ee, #facc15, #f472b6)",
        `${streak} IN A ROW · ONE BRAIN, MANY BODIES`,
        false
    );
    fireworks(3200);
}

export function celebrateStreak(streak: number) {
    if (streak < 1) return;

    if (streak === 1) {
        fireConsensusConfetti();
        return;
    }

    const layer = createLayer();
    if (streak === 2) onFire(layer);
    else if (streak === 3) turkey(layer);
    else if (streak === 4) hambone(layer);
    else hiveMind(layer, streak);
}
