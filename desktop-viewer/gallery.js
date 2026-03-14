import { PATH, TOTAL_IMAGES } from './config.js';
import { setImages } from './state.js';

export function buildGallery(
    gallery,
    openViewer,
    viewer,
    viewerImg,
    settingsToggle,
    counter,
    showSettings,
    initCursorAutoHide
) {
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

            img.onclick = () =>
                openViewer(
                    imgs.indexOf(src),
                    viewer,
                    viewerImg,
                    settingsToggle,
                    counter,
                    showSettings,
                    initCursorAutoHide
                );

            gallery.appendChild(img);
        };
    }

    setImages(imgs);
}