# Story of Project - Parents Wedding Album 

## Table of Contents <a id="toc"></a>

- [Project Tree](#project-tree)
- [Desktop Viewer](#desktop-viewer)
    - [Index](#desktop-index)
    - [Style](#desktop-style)
    - [Main](#desktop-main)

## Project Tree <a id="project-tree"></a>

```txt
```

[⬆ Table of Contents](#toc)

## Desktop Viewer <a id="desktop-viewer"></a>

[⬆ Table of Contents](#toc)

### Index <a id="desktop-index"></a>

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Desktop Photo Viewer</title>
<link rel="stylesheet" href="./style.css">
</head>
<body>

<div class="gallery" id="gallery"></div>

<div class="viewer" id="viewer">
    <img id="viewerImg">
</div>

<button id="settingsToggle">⚙</button>

<div class="settings" id="settings">
    <label>
        Delay (seconds):
        <input type="range" id="delayRange" min="1" max="10">
        <span id="delayValue"></span>
    </label>
    <label>
        <input type="checkbox" id="counterToggle">
        Show photo counter
    </label>
    <button id="playBtn">▶ Slideshow</button>
</div>

<div class="counter" id="counter"></div>

<script type="module" src="./main.js"></script>

</body>
</html>
```

[⬆ Table of Contents](#toc)

### Style <a id="desktop-style"></a>

```css
body {
    margin: 0;
    background: #000;
    font-family: Arial, sans-serif;
}

/* ===== GALLERY ===== */
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 10px;
    padding: 10px;
}

.gallery img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    cursor: pointer;
}

/* ===== VIEWER ===== */
.viewer {
    position: fixed;
    inset: 0;
    background: #000;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.viewer img {
    max-width: 100vw;
    max-height: 100vh;
    object-fit: contain;
    transition: transform 0.3s ease;
}

.viewer img.zoomed {
    transform: scale(2);
    cursor: grab;
}

/* ===== SETTINGS BUTTON ===== */
#settingsToggle {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1001;
    font-size: 24px;
    color: #fff;
    background: rgba(0,0,0,0.5);
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
    display: none;
}

/* ===== SETTINGS CARD ===== */
.settings {
    position: fixed;
    top: 60px;
    right: 10px;
    padding: 14px;
    border-radius: 14px;
    min-width: 220px;
    font-size: 14px;
    color: #fff;
    z-index: 1002;
    background: rgba(30,30,30,0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.settings label {
    display: block;
    margin-bottom: 12px;
}

.settings input[type="range"] {
    width: 100%;
}

.settings button {
    width: 100%;
    margin-top: 8px;
}

/* ===== COUNTER ===== */
.counter {
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-size: 16px;
    color: #fff;
    z-index: 1001;
    display: none;
}
```

[⬆ Table of Contents](#toc)

### Main <a id="desktop-main"></a>

```js
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
```

[⬆ Table of Contents](#toc)