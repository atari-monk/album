import { SETTINGS, saveSettings } from './config.js';
import { State } from './state.js';
import { buildGallery } from './gallery.js';
import { openViewer, closeViewer, nextImage, prevImage, updateViewer } from './viewer.js';
import { startAutoplay, stopAutoplay, togglePlay } from './slideshow.js';

const gallery = document.getElementById("gallery");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");
const settingsToggle = document.getElementById("settingsToggle");
const settingsBox = document.getElementById("settings");
const delayRange = document.getElementById("delayRange");
const delayValue = document.getElementById("delayValue");
const counterToggle = document.getElementById("counterToggle");
const playBtn = document.getElementById("playBtn");
const counter = document.getElementById("counter");

viewerImg.addEventListener("dblclick", () => viewerImg.classList.toggle("zoomed"));
viewerImg.addEventListener("click", e => e.stopPropagation());

viewer.addEventListener("click", () =>
    closeViewer(
        viewer,
        settingsToggle,
        counter,
        hideSettings,
        () => stopAutoplay(playBtn, hideSettings, false)
    )
);

delayRange.value = SETTINGS.autoplayDelay / 1000;
delayValue.textContent = delayRange.value + "s";
counterToggle.checked = SETTINGS.showCounter;

delayRange.addEventListener("input", () => {
    SETTINGS.autoplayDelay = delayRange.value * 1000;
    delayValue.textContent = delayRange.value + "s";
    saveSettings();
    if (State.isPlaying)
        startAutoplay(viewer, viewerImg, counter, playBtn, hideSettings, false);
});

counterToggle.addEventListener("change", () => {
    SETTINGS.showCounter = counterToggle.checked;
    saveSettings();
    updateViewer(viewer, viewerImg, counter);
});

playBtn.addEventListener("click", () =>
    togglePlay(viewer, viewerImg, counter, playBtn, hideSettings)
);

function hideSettings() {
    settingsBox.style.opacity = "0";
    settingsBox.style.pointerEvents = "none";
}

function showSettings() {
    settingsBox.style.opacity = "1";
    settingsBox.style.pointerEvents = "auto";
}

settingsBox.addEventListener("click", e => e.stopPropagation());

settingsToggle.addEventListener("click", e => {
    if (viewer.style.display !== "flex") return;
    e.stopPropagation();
    State.settingsVisible = !State.settingsVisible;
    State.settingsVisible ? showSettings() : hideSettings();
});

document.addEventListener("click", e => {
    if (!settingsBox.contains(e.target) && e.target !== settingsToggle) {
        State.settingsVisible = false;
        hideSettings();
    }
});

hideSettings();

document.addEventListener("keydown", e => {
    if (viewer.style.display !== "flex") return;
    if (e.key === "ArrowRight") nextImage(viewer, viewerImg, counter);
    if (e.key === "ArrowLeft") prevImage(viewer, viewerImg, counter);
    if (e.key === "Escape") closeViewer(viewer, settingsToggle, counter, hideSettings, () => stopAutoplay(playBtn, hideSettings, false));
    if (e.key === " ") { e.preventDefault(); togglePlay(viewer, viewerImg, counter, playBtn, hideSettings); }
});

let cursorTimer = null;

function initCursorAutoHide() {
    viewer.style.cursor = "default";

    function hideCursor() {
        viewer.style.cursor = "none";
    }

    function resetTimer() {
        viewer.style.cursor = "default";
        if (cursorTimer) clearTimeout(cursorTimer);
        cursorTimer = setTimeout(hideCursor, 3000);
    }

    viewer.addEventListener("mousemove", resetTimer);
    resetTimer();
}

buildGallery(
    gallery,
    openViewer,
    viewer,
    viewerImg,
    settingsToggle,
    counter,
    showSettings,
    initCursorAutoHide
);