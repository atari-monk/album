import { PATH, TOTAL_IMAGES, SETTINGS, saveSettings } from './config.js';
import { State, setCurrentIndex, nextIndex, prevIndex, setImages } from './state.js';

/* ===== ELEMENTS ===== */
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

/* ===== GALLERY ===== */
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
            img.onclick = () => openViewer(imgs.indexOf(src));
            gallery.appendChild(img);
        };
    }
    setImages(imgs);
}

/* ===== VIEWER ===== */
function updateViewer() {
    if (viewer.style.display !== "flex") return;
    viewerImg.src = State.images[State.currentIndex];
    if (SETTINGS.showCounter) {
        counter.style.display = "block";
        counter.textContent = `${State.currentIndex + 1} / ${State.images.length}`;
    } else {
        counter.style.display = "none";
    }
}

function openViewer(index) {
    setCurrentIndex(index);
    viewer.style.display = "flex";
    viewerImg.classList.remove("zoomed");
    document.body.style.overflow = "hidden";
    settingsToggle.style.display = "block";
    updateViewer();
    initCursorAutoHide();
    if (State.firstOpen) {
        showSettings();
        State.settingsVisible = true;
        State.firstOpen = false;
    }
}

function closeViewer() {
    viewer.style.display = "none";
    stopAutoplay(false);
    document.body.style.overflow = "auto";
    settingsToggle.style.display = "none";
    State.settingsVisible = false;
    hideSettings();
    counter.style.display = "none";
    counter.textContent = "";
}

/* ===== IMAGE NAVIGATION ===== */
function nextImage() {
    nextIndex();
    updateViewer();
}

function prevImage() {
    prevIndex();
    updateViewer();
}

/* ===== AUTOPLAY ===== */
function startAutoplay(hideSettingsCard = false) {
    stopAutoplay(false);
    State.autoplayTimer = setInterval(nextImage, SETTINGS.autoplayDelay);
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

/* ===== VIEWER INTERACTIONS ===== */
viewerImg.addEventListener("dblclick", () => viewerImg.classList.toggle("zoomed"));
viewerImg.addEventListener("click", e => e.stopPropagation());
viewer.addEventListener("click", closeViewer);

/* ===== SETTINGS ===== */
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
    updateViewer();
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

/* ===== KEYBOARD ===== */
document.addEventListener("keydown", e => {
    if (viewer.style.display !== "flex") return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "Escape") closeViewer();
    if (e.key === " ") { e.preventDefault(); togglePlay(); }
});

/* ===== CURSOR AUTO-HIDE ===== */
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

/* ===== INIT ===== */
buildGallery();