import audioClip from "../assets/waiting.mp3";

export function playHurryUp() {
    const audio = new Audio(audioClip);
    audio.play();
}
