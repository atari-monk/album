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