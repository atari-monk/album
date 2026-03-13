import { State, setCurrentIndex, nextIndex, prevIndex } from './state.js';
import { SETTINGS } from './config.js';

export function updateViewer(viewer, viewerImg, counter) {
    if (viewer.style.display !== "flex") return;
    viewerImg.src = State.images[State.currentIndex];
    if (SETTINGS.showCounter) {
        counter.style.display = "block";
        counter.textContent = `${State.currentIndex + 1} / ${State.images.length}`;
    } else {
        counter.style.display = "none";
    }
}

export function openViewer(index, viewer, viewerImg, settingsToggle, counter, showSettings, initCursorAutoHide) {
    setCurrentIndex(index);
    viewer.style.display = "flex";
    viewerImg.classList.remove("zoomed");
    document.body.style.overflow = "hidden";
    settingsToggle.style.display = "block";
    updateViewer(viewer, viewerImg, counter);
    initCursorAutoHide();
    if (State.firstOpen) {
        showSettings();
        State.settingsVisible = true;
        State.firstOpen = false;
    }
}

export function closeViewer(viewer, settingsToggle, counter, hideSettings, stopAutoplay) {
    viewer.style.display = "none";
    stopAutoplay(false);
    document.body.style.overflow = "auto";
    settingsToggle.style.display = "none";
    State.settingsVisible = false;
    hideSettings();
    counter.style.display = "none";
    counter.textContent = "";
}

export function nextImage(viewer, viewerImg, counter) {
    nextIndex();
    updateViewer(viewer, viewerImg, counter);
}

export function prevImage(viewer, viewerImg, counter) {
    prevIndex();
    updateViewer(viewer, viewerImg, counter);
}