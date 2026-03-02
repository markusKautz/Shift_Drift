/**
 * TouchControls - Mobile overlay buttons for Shift Drift
 * Maps touch events to the existing `keys` object for seamless integration.
 */

const BUTTON_DEFS = [
    { id: 'touch-left', label: '◄', key: 'ArrowLeft', zone: 'left' },
    { id: 'touch-right', label: '►', key: 'ArrowRight', zone: 'left' },
    { id: 'touch-thrust', label: '▲', key: 'ArrowUp', zone: 'center' },
    { id: 'touch-fire', label: '●', key: 'Space', zone: 'right', action: true },
    { id: 'touch-hyper', label: '◆', key: 'ShiftLeft', zone: 'right', action: true },
];

export class TouchControls {
    /**
     * @param {Object} keys - The shared keys state object from main.js
     * @param {Function} shootBullet - Shoot callback (for action buttons)
     * @param {Function} hyperspace - Hyperspace callback
     * @param {Function} togglePause - Pause toggle callback
     * @param {Object} state - The shared state object
     */
    constructor(keys, shootBullet, hyperspace, togglePause, state) {
        this.keys = keys;
        this.shootBullet = shootBullet;
        this.hyperspace = hyperspace;
        this.togglePause = togglePause;
        this.state = state;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.container = null;
        this.activeTouches = new Map(); // touchId -> buttonId
        this.gameStarted = false;

        if (this.isTouchDevice) {
            this._createUI();
            this._bindEvents();
        }
    }

    _createUI() {
        // Container
        this.container = document.createElement('div');
        this.container.id = 'touch-controls';
        this.container.innerHTML = `
            <div class="touch-zone touch-zone-left">
                <button id="touch-left" class="touch-btn touch-btn-dir" data-key="ArrowLeft">◄</button>
                <button id="touch-right" class="touch-btn touch-btn-dir" data-key="ArrowRight">►</button>
            </div>
            <div class="touch-zone touch-zone-right">
                <button id="touch-thrust" class="touch-btn touch-btn-thrust" data-key="ArrowUp">▲</button>
                <button id="touch-fire" class="touch-btn touch-btn-fire" data-key="Space">●</button>
                <button id="touch-hyper" class="touch-btn touch-btn-hyper" data-key="ShiftLeft">◆</button>
            </div>
        `;
        document.body.appendChild(this.container);

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
            #touch-controls {
                display: none;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 500;
                pointer-events: none;
                padding: 10px 15px 20px;
                justify-content: space-between;
                align-items: flex-end;
            }

            @media (pointer: coarse), (hover: none) {
                #touch-controls {
                    display: flex !important;
                }
            }

            .touch-zone {
                display: flex;
                gap: 10px;
                pointer-events: auto;
                align-items: flex-end;
            }

            .touch-zone-center {
                flex: 0 0 auto;
            }

            .touch-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 2px solid rgba(0, 212, 255, 0.4);
                background: rgba(0, 212, 255, 0.08);
                color: rgba(0, 212, 255, 0.6);
                font-size: 1.4rem;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                user-select: none;
                -webkit-user-select: none;
                touch-action: none;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                transition: background 0.1s, border-color 0.1s, box-shadow 0.1s;
                font-family: 'Orbitron', sans-serif;
                padding: 0;
                outline: none;
                -webkit-tap-highlight-color: transparent;
            }

            .touch-btn.active {
                background: rgba(0, 212, 255, 0.25);
                border-color: rgba(0, 212, 255, 0.8);
                box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
                color: rgba(0, 212, 255, 1);
            }

            .touch-btn-fire {
                width: 70px;
                height: 70px;
                font-size: 1.8rem;
                border-color: rgba(255, 100, 100, 0.4);
                background: rgba(255, 100, 100, 0.08);
                color: rgba(255, 100, 100, 0.6);
            }

            .touch-btn-fire.active {
                background: rgba(255, 100, 100, 0.25);
                border-color: rgba(255, 100, 100, 0.8);
                box-shadow: 0 0 20px rgba(255, 100, 100, 0.4);
                color: rgba(255, 100, 100, 1);
            }

            .touch-btn-thrust {
                width: 65px;
                height: 65px;
                font-size: 1.5rem;
            }

            .touch-btn-hyper {
                width: 50px;
                height: 50px;
                font-size: 1rem;
                border-color: rgba(168, 85, 247, 0.4);
                background: rgba(168, 85, 247, 0.08);
                color: rgba(168, 85, 247, 0.6);
            }

            .touch-btn-hyper.active {
                background: rgba(168, 85, 247, 0.25);
                border-color: rgba(168, 85, 247, 0.8);
                box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
                color: rgba(168, 85, 247, 1);
            }

            /* Hide on landscape desktop-sized screens */
            @media (pointer: fine) and (hover: hover) {
                #touch-controls {
                    display: none !important;
                }
            }

            /* Retro theme overrides */
            body:not(.modern) .touch-btn {
                border-color: rgba(0, 255, 65, 0.4);
                background: rgba(0, 255, 65, 0.06);
                color: rgba(0, 255, 65, 0.6);
            }
            body:not(.modern) .touch-btn.active {
                background: rgba(0, 255, 65, 0.2);
                border-color: rgba(0, 255, 65, 0.8);
                box-shadow: 0 0 15px rgba(0, 255, 65, 0.4);
                color: rgba(0, 255, 65, 1);
            }
            body:not(.modern) .touch-btn-fire {
                border-color: rgba(255, 0, 255, 0.4);
                background: rgba(255, 0, 255, 0.06);
                color: rgba(255, 0, 255, 0.6);
            }
            body:not(.modern) .touch-btn-fire.active {
                background: rgba(255, 0, 255, 0.2);
                border-color: rgba(255, 0, 255, 0.8);
                box-shadow: 0 0 15px rgba(255, 0, 255, 0.4);
                color: rgba(255, 0, 255, 1);
            }
            body:not(.modern) .touch-btn-hyper {
                border-color: rgba(255, 170, 0, 0.4);
                background: rgba(255, 170, 0, 0.06);
                color: rgba(255, 170, 0, 0.6);
            }
            body:not(.modern) .touch-btn-hyper.active {
                background: rgba(255, 170, 0, 0.2);
                border-color: rgba(255, 170, 0, 0.8);
                box-shadow: 0 0 15px rgba(255, 170, 0, 0.4);
                color: rgba(255, 170, 0, 1);
            }
        `;
        document.head.appendChild(style);
    }

    _bindEvents() {
        const container = this.container;
        if (!container) return;

        // Prevent default on all touch events to stop scrolling/zooming
        container.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
        container.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
        container.addEventListener('touchend', e => e.preventDefault(), { passive: false });

        // Handle touchstart - activate buttons
        container.addEventListener('touchstart', e => {
            for (const touch of e.changedTouches) {
                const btn = document.elementFromPoint(touch.clientX, touch.clientY);
                if (!btn || !btn.dataset.key) continue;

                const key = btn.dataset.key;
                this.activeTouches.set(touch.identifier, { btn, key });
                btn.classList.add('active');

                // Toggle pause if game is paused
                if (typeof this.togglePause === 'function') {
                    this.togglePause(false); // Force unpause
                }

                // Set key state
                this.keys[key] = true;

                // Immediate action for fire and hyperspace
                if (key === 'Space') this.shootBullet();
                if (key === 'ShiftLeft') this.hyperspace();
            }
        }, { passive: false });

        // Handle touchmove - track finger sliding between buttons
        container.addEventListener('touchmove', e => {
            for (const touch of e.changedTouches) {
                const existing = this.activeTouches.get(touch.identifier);
                const newBtn = document.elementFromPoint(touch.clientX, touch.clientY);

                if (existing && newBtn !== existing.btn) {
                    // Release old button
                    existing.btn.classList.remove('active');
                    this.keys[existing.key] = false;

                    if (newBtn && newBtn.dataset.key) {
                        // Press new button
                        const newKey = newBtn.dataset.key;
                        newBtn.classList.add('active');
                        this.keys[newKey] = true;
                        this.activeTouches.set(touch.identifier, { btn: newBtn, key: newKey });

                        if (newKey === 'Space') this.shootBullet();
                        if (newKey === 'ShiftLeft') this.hyperspace();
                    } else {
                        this.activeTouches.delete(touch.identifier);
                    }
                }
            }
        }, { passive: false });

        // Handle touchend - release buttons
        const handleEnd = (e) => {
            for (const touch of e.changedTouches) {
                const existing = this.activeTouches.get(touch.identifier);
                if (existing) {
                    existing.btn.classList.remove('active');
                    this.keys[existing.key] = false;
                    this.activeTouches.delete(touch.identifier);
                }
            }
        };

        container.addEventListener('touchend', handleEnd, { passive: false });
        container.addEventListener('touchcancel', handleEnd, { passive: false });

        // Also allow tapping the main game canvas area to unpause
        document.getElementById('gameCanvas')?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.togglePause(false);
            }
        }, { passive: false });
    }

    /**
     * Call this when the game is restarted to reset touch state
     */
    reset() {
        this.gameStarted = false;
        this.activeTouches.clear();
        // Clear all key states
        for (const def of BUTTON_DEFS) {
            this.keys[def.key] = false;
        }
        // Remove active class from all buttons
        if (this.container) {
            this.container.querySelectorAll('.touch-btn').forEach(btn => btn.classList.remove('active'));
        }
    }
}
