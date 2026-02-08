/* ===== CONFIG ===== */
const PATH = "./../album/";
const TOTAL_IMAGES = 174;

/* ===== SETTINGS STORAGE ===== */
let SETTINGS = JSON.parse(localStorage.getItem("viewerSettings")) || {
    autoplayDelay: 5000,
    showCounter: true
};

function saveSettings() {
    localStorage.setItem("viewerSettings", JSON.stringify(SETTINGS));
}

/* ===== STATE ===== */
let images = [];
let currentIndex = 0;
let autoplayTimer = null;
let isPlaying = false;
let firstOpen = true;
let settingsVisible = false;

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

/* ===== BUILD GALLERY ===== */
for (let i = 1; i <= TOTAL_IMAGES; i++) {
    const src = `${PATH}${String(i).padStart(3,"0")}.jpg`;
    const imgTest = new Image();
    imgTest.src = src;
    imgTest.onload = () => {
        images.push(src);
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";
        img.onclick = () => openViewer(images.indexOf(src));
        gallery.appendChild(img);
    };
}

/* ===== VIEWER FUNCTIONS ===== */
function openViewer(index) {
    currentIndex = index;
    viewer.style.display = "flex";
    viewerImg.classList.remove("zoomed");
    document.body.style.overflow = "hidden";
    settingsToggle.style.display = "block";

    updateViewer();

    if (firstOpen) {
        showSettings();
        settingsVisible = true;
        firstOpen = false;
    }
}

function closeViewer() {
    viewer.style.display = "none";
    stopAutoplay();
    document.body.style.overflow = "auto";

    settingsToggle.style.display = "none";
    settingsVisible = false;
    hideSettings();

    counter.style.display = "none";
    counter.textContent = "";
}

function updateViewer() {
    if (viewer.style.display !== "flex") return;

    viewerImg.src = images[currentIndex];

    if (SETTINGS.showCounter) {
        counter.style.display = "block";
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
    } else {
        counter.style.display = "none";
    }
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateViewer();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateViewer();
}

/* ===== AUTOPLAY ===== */
function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextImage, SETTINGS.autoplayDelay);
    isPlaying = true;
    playBtn.textContent = "⏸ Stop slideshow";
}

function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
    isPlaying = false;
    playBtn.textContent = "▶ Slideshow";
}

function togglePlay() {
    if (viewer.style.display !== "flex") return;
    isPlaying ? stopAutoplay() : startAutoplay();
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
    if (isPlaying) startAutoplay();
});

counterToggle.addEventListener("change", () => {
    SETTINGS.showCounter = counterToggle.checked;
    saveSettings();
    updateViewer();
});

playBtn.addEventListener("click", togglePlay);

/* ===== KEYBOARD ===== */
document.addEventListener("keydown", e => {
    if (viewer.style.display !== "flex") return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "Escape") closeViewer();
    if (e.key === " ") { e.preventDefault(); togglePlay(); }
});

/* ===== SETTINGS TOGGLE ===== */
settingsBox.addEventListener("click", e => e.stopPropagation());

function hideSettings() {
    settingsBox.style.opacity = "0";
    settingsBox.style.pointerEvents = "none";
}

function showSettings() {
    settingsBox.style.opacity = "1";
    settingsBox.style.pointerEvents = "auto";
}

settingsToggle.addEventListener("click", e => {
    if (viewer.style.display !== "flex") return;
    e.stopPropagation();
    settingsVisible = !settingsVisible;
    settingsVisible ? showSettings() : hideSettings();
});

document.addEventListener("click", e => {
    if (!settingsBox.contains(e.target) && e.target !== settingsToggle) {
        settingsVisible = false;
        hideSettings();
    }
});

hideSettings();
