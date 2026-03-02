import { Ship } from './Ship.js';

export class GameState {
    constructor(canvasWidth, canvasHeight, scale) {
        this.score = 0;
        this._s = 0; // Obfuscated score
        this.startTime = Date.now();
        this.gameOver = false;
        this.ship = new Ship(canvasWidth, canvasHeight, scale);
        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.level = 1;
        this.ufo = null;
        this.ufoSpawnTimer = 300;
        this.rival = null;
        this.rivalSpawnTimer = 600;
        this.archenemyKillsTotal = 0;
        this.archenemyKilledInLevel = false;
        this.multishotCount = 1;
        this.multishotTimer = 0;
        this.currentMaxMultishot = 2;
        this.shieldTimer = 0;
        this.currentMaxShieldDuration = 10;
        this.currentTheme = localStorage.getItem('asteroids_theme') || 'modern';
        this.lastTime = 0;
        this.lastHyperspace = 0;
        this.isPaused = true;
        this.gameStarted = false;
        this.scale = scale;
        this.fullscreenRequestedOnMobile = false;
        this.playerName = ''; // Start fresh on reload as per user preference
    }

    reset(canvasWidth, canvasHeight, scale) {
        this.scale = scale;
        this.ship = new Ship(canvasWidth, canvasHeight, scale);
        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        this.score = 0;
        this._s = 0;
        this.startTime = Date.now();
        this.gameOver = false;
        this.combo = 1;
        this.comboTimer = 0;
        this.level = 1;
        this.ufo = null;
        this.ufoSpawnTimer = 300;
        this.rival = null;
        this.rivalSpawnTimer = 600;
        this.archenemyKillsTotal = 0;
        this.archenemyKilledInLevel = false;
        this.multishotCount = 1;
        this.multishotTimer = 0;
        this.currentMaxMultishot = 2;
        this.shieldTimer = 0;
        this.currentMaxShieldDuration = 10;
    }
}
