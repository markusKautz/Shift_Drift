export class InputManager {
    constructor(callbacks) {
        this.keys = {};
        this.callbacks = callbacks; // { onShoot, onHyperspace }
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.touchControls = null; // Will be injected if mobile
        this._bindEvents();
    }

    _bindEvents() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') this.callbacks.onShoot();
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.callbacks.onHyperspace();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setTouchControls(touchManager) {
        this.touchControls = touchManager;
    }

    isThrusting() {
        return this.keys['ArrowUp'] || this.keys['KeyW'];
    }

    getRotation() {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) return 1; // Left
        if (this.keys['ArrowRight'] || this.keys['KeyD']) return -1; // Right
        return 0; // Neutral
    }
}
