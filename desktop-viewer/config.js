export const PATH = "./../album/";
export const TOTAL_IMAGES = 174;

export let SETTINGS = JSON.parse(localStorage.getItem("viewerSettings")) || {
    autoplayDelay: 5000,
    showCounter: true
};

export function saveSettings() {
    localStorage.setItem("viewerSettings", JSON.stringify(SETTINGS));
}