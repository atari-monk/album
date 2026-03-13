import { State } from './state.js';
import { SETTINGS } from './config.js';
import { nextImage } from './viewer.js';

export function startAutoplay(viewer, viewerImg, counter, playBtn, hideSettings, hideSettingsCard = false) {
    stopAutoplay(playBtn, hideSettings, false);

    State.autoplayTimer = setInterval(() => {
        nextImage(viewer, viewerImg, counter);
    }, SETTINGS.autoplayDelay);

    State.isPlaying = true;
    playBtn.textContent = "⏸ Stop slideshow";

    if (hideSettingsCard && State.settingsVisible) {
        hideSettings();
        State.settingsVisible = false;
    }
}

export function stopAutoplay(playBtn, hideSettings, hideSettingsCard = true) {
    if (State.autoplayTimer) clearInterval(State.autoplayTimer);

    State.autoplayTimer = null;
    State.isPlaying = false;
    playBtn.textContent = "▶ Slideshow";

    if (hideSettingsCard && State.settingsVisible) {
        hideSettings();
        State.settingsVisible = false;
    }
}

export function togglePlay(viewer, viewerImg, counter, playBtn, hideSettings) {
    if (viewer.style.display !== "flex") return;

    if (State.isPlaying) {
        stopAutoplay(playBtn, hideSettings, true);
    } else {
        startAutoplay(viewer, viewerImg, counter, playBtn, hideSettings, true);
    }
}