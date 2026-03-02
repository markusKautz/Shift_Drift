import '../styles/variables.css';
import '../styles/base.css';
import '../styles/ui.css';
import '../styles/animations.css';
import { audio } from './audio.js';
import { Asteroid } from './Asteroid.js';
import { getScale } from './scaling.js';
import { updateComboUI, qualifiesForLeaderboard, displayLeaderboard } from './ui.js';
import { TouchControls } from './TouchControls.js';
import { ASTEROIDS_NUM, ASTEROIDS_SIZE } from './constants.js';
import { distBetweenPoints } from './utils.js';

// Managers
import { GameState } from './GameState.js';
import { InputManager } from './InputManager.js';
import { CollisionManager } from './CollisionManager.js';
import { GameEngine } from './GameEngine.js';
import { supabase } from './supabaseClient.js';

const PAUSE_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
const FULLSCREEN_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;

const FORBIDDEN_NAMES = ['KKK', 'ZOG', 'FAG'];


// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const scoreList = document.getElementById('score-list');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const nameEntryContainer = document.getElementById('name-entry');
const comboElement = document.getElementById('combo-display');
const levelElement = document.getElementById('level');
const themeBtn = document.getElementById('theme-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');
const pauseMessage = document.getElementById('pause-message');
const pauseTitle = document.getElementById('pause-title');

// Initialize Core Architecture
const uiContext = { canvas, ctx, scoreElement, comboElement, levelElement, createAsteroids, endGame };
const gameState = new GameState(canvas.width, canvas.height, 1);
const inputManager = new InputManager({
    onShoot: () => engine.shoot(),
    onHyperspace: () => engine.hyperspace()
});
const collisionManager = new CollisionManager(gameState, null, uiContext);
const engine = new GameEngine(gameState, inputManager, collisionManager, uiContext);
collisionManager.engine = engine;

// Export context functions for UI to use
function createAsteroids() {
    gameState.asteroids = [];
    const numAsteroids = ASTEROIDS_NUM + (gameState.level - 1);
    const speedMultiplier = 1 + (gameState.level - 1) * 0.1;

    for (let i = 0; i < numAsteroids; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(gameState.ship.x, gameState.ship.y, x, y) < (ASTEROIDS_SIZE * gameState.scale) * 2 + gameState.ship.r);

        let a = new Asteroid(x, y, Math.ceil((ASTEROIDS_SIZE * gameState.scale) / 2), 0, false, false, gameState.scale);
        a.xv *= speedMultiplier;
        a.yv *= speedMultiplier;
        gameState.asteroids.push(a);
    }
}

async function endGame() {
    gameState.gameOver = true;
    audio.stopMusic();
    audio.stopThrust();
    finalScoreElement.innerText = gameState.score.toLocaleString();
    gameOverScreen.classList.remove('hidden');

    // Anti-cheat: basic local validation
    const expected_s = (gameState.score * 7 + 13) % 2147483647;
    const isPotentiallyTampered = gameState._s !== expected_s;
    const durationSeconds = (Date.now() - gameState.startTime) / 1000;

    // Auto-save score if > 0 and not obviously tampered
    if (gameState.score > 0 && gameState.playerName && !isPotentiallyTampered) {
        const syncStatus = document.getElementById('sync-status');
        if (syncStatus) syncStatus.classList.remove('hidden');

        try {
            // Secure submission via Edge Function
            const { data, error } = await supabase.functions.invoke('submit-score', {
                body: {
                    name: gameState.playerName,
                    score: gameState.score,
                    _s: gameState._s,
                    duration: Math.floor(durationSeconds)
                }
            });

            if (error) throw error;
        } catch (err) {
            console.error('Failed to auto-save score:', err);
        } finally {
            if (syncStatus) syncStatus.classList.add('hidden');
            displayLeaderboard(scoreList, gameState.score, gameState.playerName);
        }
    } else {
        displayLeaderboard(scoreList, gameState.score, gameState.playerName);
    }
}

function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const scale = getScale(canvas);
    gameState.reset(canvas.width, canvas.height, scale);

    scoreElement.innerText = gameState.score;
    levelElement.innerText = gameState.level;
    gameOverScreen.classList.add('hidden');

    // Sync name right before game starts
    if (playerNameInput.value.length === 3) {
        gameState.playerName = playerNameInput.value.toUpperCase();
        localStorage.setItem('asteroids_player_name', gameState.playerName);
    }

    updateComboUI(gameState.combo, comboElement);
    createAsteroids();
}

// Window Events for Sizing & UI Logic
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.scale = getScale(canvas);
    if (gameState.ship) {
        gameState.ship.scale = gameState.scale;
        gameState.ship.r = (gameState.ship.constructor.prototype.SHIP_SIZE || 20 / 2) * gameState.scale;
    }

    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
        togglePause(true);
    }
});

// Fullscreen API Handling (Mobile)
function togglePause(paused) {
    if (gameState.gameOver) return;

    // BLOCK START until name is valid
    if (!gameState.gameStarted) {
        if (!validatePlayerName(playerNameInput.value)) {
            return;
        }
    }

    gameState.isPaused = paused !== undefined ? paused : !gameState.isPaused;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (gameState.isPaused) {
        pauseOverlay.style.display = 'flex';
        pauseTitle.innerText = "PAUSED";

        const startIdentity = document.getElementById('start-identity');
        if (startIdentity) startIdentity.style.display = gameState.gameStarted ? 'none' : 'flex';

        updatePauseMessage();

        audio.stopMusic();
        audio.stopThrust();
        if (pauseBtn) {
            pauseBtn.innerHTML = isTouchDevice ? FULLSCREEN_ICON_SVG : PAUSE_ICON_SVG;
            pauseBtn.title = isTouchDevice ? "Fullscreen / Resume Game" : "Resume Game";
        }
    } else {
        if (playerNameInput.value.length === 3) {
            gameState.playerName = playerNameInput.value.toUpperCase();
            localStorage.setItem('asteroids_player_name', gameState.playerName);
        }
        pauseOverlay.style.display = 'none';
        if (gameState.currentTheme === 'modern') audio.startMusic();
        if (gameState.ship && gameState.ship.thrusting) audio.startThrust(gameState.currentTheme);
        if (pauseBtn) {
            pauseBtn.innerHTML = PAUSE_ICON_SVG;
            pauseBtn.title = "Pause Game";
        }
    }
}

function updatePauseMessage() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (gameState.gameStarted) {
        pauseMessage.innerHTML = isTouchDevice ? 'TAP <span class="msg-highlight">ANYWHERE</span> TO RESUME' : 'PRESS <span class="msg-highlight">ESC</span> TO RESUME';
    } else {
        if (isTouchDevice) {
            pauseMessage.innerHTML = 'TAP TO <span class="msg-highlight">START</span>';
        } else {
            if (playerNameInput.value.length < 3) {
                pauseMessage.innerHTML = 'ENTER <span class="msg-highlight">INITIALS TO START</span>';
            } else {
                pauseMessage.innerHTML = 'PRESS <span class="msg-highlight">ANY KEY</span> TO START';
            }
        }
    }
}

window.toggleFullscreenOnMobile = function () {
    const el = document.documentElement;
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

    if (!isFullscreen) {
        const requestFs = el.requestFullscreen || el.webkitRequestFullscreen;
        if (requestFs) requestFs.call(el).catch(() => { });
    } else {
        const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
        if (exitFs) exitFs.call(document).catch(() => { });
    }
};

function validatePlayerName(name) {
    const upperName = name.toUpperCase();
    if (upperName.length < 3) {
        playerNameInput.focus();
        updatePauseMessage();
        return false;
    }

    if (FORBIDDEN_NAMES.includes(upperName)) {
        playerNameInput.classList.remove('shake');
        void playerNameInput.offsetWidth; // Trigger reflow
        playerNameInput.classList.add('shake');
        setTimeout(() => playerNameInput.classList.remove('shake'), 500);
        return false;
    }
    return true;
}

// UI Listeners
pauseOverlay.addEventListener('click', (e) => {
    // Prevent click on name input from closing overlay
    if (e.target.id === 'player-name') return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && !gameState.gameOver) {
        if (!gameState.gameStarted) {
            if (!validatePlayerName(playerNameInput.value)) {
                return;
            }
            gameState.playerName = playerNameInput.value.toUpperCase();
            localStorage.setItem('asteroids_player_name', gameState.playerName);
            gameState.gameStarted = true;
            window.toggleFullscreenOnMobile();
            setTimeout(() => togglePause(false), 200);
        } else if (gameState.isPaused) {
            togglePause(false);
        }
    }
});

window.addEventListener('keydown', (e) => {
    if (document.activeElement === playerNameInput) {
        if (e.code === 'Enter') {
            if (!validatePlayerName(playerNameInput.value)) {
                return;
            }
            playerNameInput.blur();
            if (!gameState.gameStarted) {
                gameState.playerName = playerNameInput.value.toUpperCase();
                localStorage.setItem('asteroids_player_name', gameState.playerName);
                gameState.gameStarted = true;
                togglePause(false);
            } else if (gameState.isPaused) {
                togglePause(false);
            }
        }
        return;
    }

    if (!gameState.gameStarted) {
        if (!validatePlayerName(playerNameInput.value)) {
            return;
        }
        gameState.playerName = playerNameInput.value.toUpperCase();
        localStorage.setItem('asteroids_player_name', gameState.playerName);
        gameState.gameStarted = true;
        togglePause(false);
    } else if (e.code === 'Escape') {
        togglePause();
    }
    audio.resume();
});

window.addEventListener('touchstart', () => audio.resume(), { once: true });

restartBtn.addEventListener('click', () => {
    initGame();
    if (inputManager.touchControls) inputManager.touchControls.reset();
    engine.state.lastTime = performance.now();
    togglePause(false);
    if (!engine.animationFrameId || gameState.gameOver === false) {
        engine.start();
    }
});

playerNameInput.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
    updatePauseMessage();
});


themeBtn.addEventListener('click', () => {
    const newTheme = gameState.currentTheme === 'modern' ? 'retro' : 'modern';
    gameState.currentTheme = newTheme;
    themeBtn.innerHTML = newTheme === 'modern' ? 'R' : 'M';
    if (newTheme === 'modern') {
        document.body.classList.add('modern');
        if (!gameState.isPaused) audio.startMusic();
    } else {
        document.body.classList.remove('modern');
        audio.stopMusic();
        audio.stopThrust();
    }
    localStorage.setItem('asteroids_theme', newTheme);
});

if (pauseBtn) {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        pauseBtn.style.display = 'flex';
        pauseBtn.innerHTML = FULLSCREEN_ICON_SVG;
        pauseBtn.title = "Start Fullscreen Mode";

        // Update pause controls for touch
        const controlsContainer = document.querySelector('.pause-controls');
        if (controlsContainer) {
            controlsContainer.innerHTML = `
                <div class="control-row"><span>TAP</span><span>START/RESUME</span></div>
                <div class="control-row"><span>◄ ►</span><span>ROTATE</span></div>
                <div class="control-row"><span>▲</span><span>THRUST</span></div>
                <div class="control-row"><span>●</span><span>SHOOT</span></div>
                <div class="control-row"><span>◆</span><span>HYPERSPACE</span></div>
            `;
        }

        pauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!gameState.gameStarted) {
                window.toggleFullscreenOnMobile();
                return;
            }
            if (gameState.isPaused) {
                window.toggleFullscreenOnMobile();
            } else {
                togglePause();
            }
        });

        document.documentElement.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                if (!gameState.gameStarted) {
                    if (!validatePlayerName(playerNameInput.value)) {
                        // If invalid name, we can't really block fullscreen change here easily, 
                        // but we shouldn't start the game.
                        return;
                    }
                    gameState.playerName = playerNameInput.value.toUpperCase();
                    localStorage.setItem('asteroids_player_name', gameState.playerName);
                    togglePause(false);
                }
            } else {
                if (!gameState.gameOver) {
                    togglePause(true);
                }
            }
        });
    } else {
        pauseBtn.style.display = 'none';
    }
}

// Initial Boot
const savedTheme = localStorage.getItem('asteroids_theme') || 'modern';
if (savedTheme === 'modern') document.body.classList.add('modern');
else document.body.classList.remove('modern');
gameState.currentTheme = savedTheme;
themeBtn.innerHTML = savedTheme === 'modern' ? 'R' : 'M'; // Ensure correct initial icon

const isTouchDeviceFallback = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
// We'll use updatePauseMessage to set initial state
updatePauseMessage();


// Name pre-fill removed as per user request to start fresh on reload
playerNameInput.value = ''; // Force empty on load to prevent browser autofill

initGame();
engine.start();

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    const touchManager = new TouchControls(
        inputManager.keys,
        () => engine.shoot(),
        () => engine.hyperspace(),
        togglePause,
        gameState
    );
    inputManager.setTouchControls(touchManager);
}
