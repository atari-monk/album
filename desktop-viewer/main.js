import { PATH, TOTAL_IMAGES, SETTINGS, saveSettings } from './config.js';
import { State, setImages } from './state.js';
import { openViewer, closeViewer, nextImage, prevImage, updateViewer } from './viewer.js';

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

function buildGallery() {
    const imgs = [];
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
        const src = `${PATH}${String(i).padStart(3, "0")}.jpg`;
        const imgTest = new Image();
        imgTest.src = src;
        imgTest.onload = () => {
            imgs.push(src);
            const img = document.createElement("img");
            img.src = src;
            img.loading = "lazy";
            img.onclick = () => openViewer(imgs.indexOf(src), viewer, viewerImg, settingsToggle, counter, showSettings, initCursorAutoHide);
            gallery.appendChild(img);
        };
    }
    setImages(imgs);
}

function startAutoplay(hideSettingsCard = false) {
    stopAutoplay(false);
    State.autoplayTimer = setInterval(() => nextImage(viewer, viewerImg, counter), SETTINGS.autoplayDelay);
    State.isPlaying = true;
    playBtn.textContent = "⏸ Stop slideshow";
    if (hideSettingsCard && State.settingsVisible) {
        hideSettings();
        State.settingsVisible = false;
    }
}

function stopAutoplay(hideSettingsCard = true) {
    if (State.autoplayTimer) clearInterval(State.autoplayTimer);
    State.autoplayTimer = null;
    State.isPlaying = false;
    playBtn.textContent = "▶ Slideshow";
    if (hideSettingsCard && State.settingsVisible) {
        hideSettings();
        State.settingsVisible = false;
    }
}

function togglePlay() {
    if (viewer.style.display !== "flex") return;
    State.isPlaying ? stopAutoplay(true) : startAutoplay(true);
}

viewerImg.addEventListener("dblclick", () => viewerImg.classList.toggle("zoomed"));
viewerImg.addEventListener("click", e => e.stopPropagation());
viewer.addEventListener("click", () => closeViewer(viewer, settingsToggle, counter, hideSettings, stopAutoplay));

delayRange.value = SETTINGS.autoplayDelay / 1000;
delayValue.textContent = delayRange.value + "s";
counterToggle.checked = SETTINGS.showCounter;

delayRange.addEventListener("input", () => {
    SETTINGS.autoplayDelay = delayRange.value * 1000;
    delayValue.textContent = delayRange.value + "s";
    saveSettings();
    if (State.isPlaying) startAutoplay(false);
});

counterToggle.addEventListener("change", () => {
    SETTINGS.showCounter = counterToggle.checked;
    saveSettings();
    updateViewer(viewer, viewerImg, counter);
});

playBtn.addEventListener("click", togglePlay);

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
    if (e.key === "Escape") closeViewer(viewer, settingsToggle, counter, hideSettings, stopAutoplay);
    if (e.key === " ") { e.preventDefault(); togglePlay(); }
});

let cursorTimer = null;

function initCursorAutoHide() {
    viewer.style.cursor = "default";
    function hideCursor() { viewer.style.cursor = "none"; }
    function resetTimer() {
        viewer.style.cursor = "default";
        if (cursorTimer) clearTimeout(cursorTimer);
        cursorTimer = setTimeout(hideCursor, 3000);
    }
    viewer.addEventListener("mousemove", resetTimer);
    resetTimer();
}

buildGallery();