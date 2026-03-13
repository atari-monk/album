# Album 

## Table of Contents <a id="toc"></a>

- [Prompt](#prompt)
- [Configuration](#configuration)
    - [Files](#files)
    - [Hosting](#hosting)
- [Desktop Viewer](#desktop-viewer)
    - [Index](#dv-index)
    - [Style](#dv-style)
    - [Code](#code)
        - [Config](#config)
        - [State](#state)
        - [Viewer](#viewer)
        - [Slideshow](#slideshow)
        - [Main](#main)

## Prompt <a id="prompt"></a>

### Assumptions

```text
I develop incrementally using this document.  
It contains latest code base and context.  
Dont use comments inside code you give in answear.  
Provide only one step at a time to update this document step by step when implementing new feature.  
Do step so that app still works and is ready for test.  
Step must contain all code needed to test it.  
```

### Task Log

- Refactor main.js to use modules, procedural style, structs and functions for specific parts.

[⬆ Table of Contents](#toc)

## Configuration <a id="configuration"></a>

### Files <a id="files"></a>

```txt
album/
├── album/
│   ├── 001.jpg
│   └── n.jpg
├── desktop-viewer/
│   ├── index.html
│   ├── main.js
│   └── style.css
├── docs/
│   └── album-story.md
└── .gitignore
```

[⬆ Table of Contents](#toc)

### Hosting <a id="hosting"></a>

Single page can be launched just in browser.  
Page with files for html, css and js must be hosted by server.

```sh
python3 -m http.server
```

[⬆ Table of Contents](#toc)

## Desktop Viewer <a id="desktop-viewer"></a>

### Index <a id="dv-index"></a>

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

### Style <a id="dv-style"></a>

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

### Code <a id="code"></a>

#### Config <a id="config"></a>

desktop-viewer/config.js

```js
export const PATH = "./../album/";
export const TOTAL_IMAGES = 174;

export let SETTINGS = JSON.parse(localStorage.getItem("viewerSettings")) || {
    autoplayDelay: 5000,
    showCounter: true
};

export function saveSettings() {
    localStorage.setItem("viewerSettings", JSON.stringify(SETTINGS));
}
```

[⬆ Table of Contents](#toc)

#### State <a id="state"></a>

desktop-viewer/state.js

```js
export const State = {
    images: [],
    currentIndex: 0,
    autoplayTimer: null,
    isPlaying: false,
    firstOpen: true,
    settingsVisible: false
};

export function setCurrentIndex(index) {
    State.currentIndex = index;
}

export function nextIndex() {
    State.currentIndex = (State.currentIndex + 1) % State.images.length;
    return State.currentIndex;
}

export function prevIndex() {
    State.currentIndex = (State.currentIndex - 1 + State.images.length) % State.images.length;
    return State.currentIndex;
}

export function setImages(imgArray) {
    State.images = imgArray;
}
```

[⬆ Table of Contents](#toc)

#### Viewer <a id="viewer"></a>

desktop-viewer/viewer.js

```js
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
```

[⬆ Table of Contents](#toc)

#### Slideshow <a id="slideshow"></a>

desktop-viewer/slideshow.js  

```js
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
```

[⬆ Table of Contents](#toc)

#### Main <a id="main"></a>

desktop-viewer/main.js

```js
import { PATH, TOTAL_IMAGES, SETTINGS, saveSettings } from './config.js';
import { State, setImages } from './state.js';
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

function buildGallery() {
    const imgs = [];
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
        const src = `${PATH}${String(i).padStart(3,"0")}.jpg`;
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
```

[⬆ Table of Contents](#toc)
