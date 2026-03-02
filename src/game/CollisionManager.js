import { distBetweenPoints } from './utils.js';
import { BULLET_MAX, BULLET_DIST, COMBO_DURATION, POWERUP_DURATION } from './constants.js';
import { createExplosion, triggerShake } from './particles.js';
import { Asteroid } from './Asteroid.js';
import { audio } from './audio.js';
import { updateComboUI, showNotification } from './ui.js';

export class CollisionManager {
    constructor(state, engineContext) {
        this.ctx = engineContext; // Will hold references like canvas, scoreElement, etc.
        this.state = state;
    }

    checkCollisions() {
        if (this.state.gameOver) return;

        this._checkShipVsEnemies();
        this._checkShipVsAsteroids();
        this._checkBulletsVsEntities();
    }

    _checkShipVsEnemies() {
        const { ship, ufo, rival, currentTheme } = this.state;

        if (ufo && distBetweenPoints(ship.x, ship.y, ufo.x, ufo.y) < ship.r + ufo.r) {
            this._handleShipHit();
        }

        if (rival && distBetweenPoints(ship.x, ship.y, rival.x, rival.y) < ship.r + rival.r) {
            this._handleShipHit();
        }
    }

    _checkShipVsAsteroids() {
        const { ship, asteroids } = this.state;
        for (let i = asteroids.length - 1; i >= 0; i--) {
            if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                this._handleShipHit(i);
                break;
            }
        }
    }

    _handleShipHit(asteroidIndex = -1) {
        const { currentTheme, shieldTimer } = this.state;

        if (shieldTimer > 0) {
            this.state.shieldTimer = 0;
            if (asteroidIndex !== -1) {
                this._splitAsteroid(asteroidIndex);
            } else {
                // If it was a UFO or Rival, remove it
                if (this.state.ufo && distBetweenPoints(this.state.ship.x, this.state.ship.y, this.state.ufo.x, this.state.ufo.y) < this.state.ship.r + this.state.ufo.r) {
                    this.state.ufo = null;
                    this.state.ufoSpawnTimer = 600 + Math.random() * 600;
                }
                if (this.state.rival && distBetweenPoints(this.state.ship.x, this.state.ship.y, this.state.rival.x, this.state.rival.y) < this.state.ship.r + this.state.rival.r) {
                    this.state.rival = null;
                    this.state.rivalSpawnTimer = 600;
                }
            }
            audio.playExplosion(currentTheme);
            createExplosion(this.state.particles, this.state.ship.x, this.state.ship.y, '#facc15', currentTheme);
        } else {
            audio.playExplosion(currentTheme);
            this.ctx.endGame();
        }
    }

    _checkBulletsVsEntities() {
        const { bullets, ship, ufo, rival, asteroids, currentTheme } = this.state;
        const canvas = this.ctx.canvas;

        for (let i = bullets.length - 1; i >= 0; i--) {
            // Distance Check
            if (bullets[i].dist > BULLET_DIST * canvas.width) {
                bullets.splice(i, 1);
                continue;
            }

            // Enemy Bullets hitting Player
            if (bullets[i].isEnemy) {
                if (distBetweenPoints(bullets[i].x, bullets[i].y, ship.x, ship.y) < ship.r) {
                    this._handleShipHit();
                    if (!this.state.gameOver) bullets.splice(i, 1); // Remove bullet if shield absorbed it
                    continue;
                }
            }
            // Player Bullets hitting Enemies/Asteroids
            else {
                let hitSomething = false;

                // Hit Rival
                if (rival && distBetweenPoints(bullets[i].x, bullets[i].y, rival.x, rival.y) < rival.r * (rival.shieldActive ? 2.0 : 1.0)) {
                    if (rival.shieldActive) {
                        rival.shieldActive = false;
                        audio.playExplosion(currentTheme);
                        createExplosion(this.state.particles, rival.x, rival.y, '#facc15', currentTheme);
                    } else {
                        createExplosion(this.state.particles, rival.x, rival.y, 'red', currentTheme);
                        triggerShake(this.state, 15, 8, currentTheme);
                        audio.playExplosion(currentTheme);
                        this._addScore(500);
                        this.state.archenemyKillsTotal++;
                        this.state.archenemyKilledInLevel = true;
                        this.state.currentMaxMultishot++;
                        showNotification("MAX MULTISHOT INCREASED!");
                        if (this.state.archenemyKillsTotal % 3 === 0) {
                            this.state.currentMaxShieldDuration += 10;
                            setTimeout(() => showNotification("MAX SHIELD INCREASED!"), 1500);
                        }
                        this.state.rival = null;
                        this.state.rivalSpawnTimer = 600;
                    }
                    hitSomething = true;
                }

                // Hit UFO
                else if (ufo && distBetweenPoints(bullets[i].x, bullets[i].y, ufo.x, ufo.y) < ufo.r && !hitSomething) {
                    createExplosion(this.state.particles, ufo.x, ufo.y, 'red', currentTheme);
                    triggerShake(this.state, 15, 8, currentTheme);
                    audio.playExplosion(currentTheme);
                    this._addScore(500);
                    this.state.ufo = null;
                    this.state.ufoSpawnTimer = 600 + Math.random() * 600;
                    hitSomething = true;
                }

                // Hit Asteroid
                if (!hitSomething) {
                    for (let j = asteroids.length - 1; j >= 0; j--) {
                        if (distBetweenPoints(bullets[i].x, bullets[i].y, asteroids[j].x, asteroids[j].y) < asteroids[j].r) {
                            createExplosion(this.state.particles, asteroids[j].x, asteroids[j].y, '#5eead4', currentTheme);
                            triggerShake(this.state, 10, 5, currentTheme);
                            audio.playExplosion(currentTheme);
                            this._splitAsteroid(j);
                            hitSomething = true;
                            break;
                        }
                    }
                }

                if (hitSomething) bullets.splice(i, 1);
            }
        }
    }

    _addScore(baseAmount) {
        if (baseAmount > 0) {
            this.state.score += baseAmount * this.state.combo;
            this.state._s = (this.state.score * 7 + 13) % 2147483647; // Obfuscated sync
            this.ctx.scoreElement.innerText = this.state.score;
        }
        this.state.combo++;
        this.state.comboTimer = COMBO_DURATION;
        updateComboUI(this.state.combo, this.ctx.comboElement);
    }

    _splitAsteroid(index) {
        const a = this.state.asteroids[index];
        const baseScore = (a.level === 0 ? 20 : a.level === 1 ? 50 : 100);
        this.state.score += baseScore * this.state.combo;
        this.state._s = (this.state.score * 7 + 13) % 2147483647; // Obfuscated sync
        this.ctx.scoreElement.innerText = this.state.score;

        // This implicitly counts as a hit for combo purposes if called directly
        if (baseScore > 0) {
            this.state.combo++;
            this.state.comboTimer = COMBO_DURATION;
            updateComboUI(this.state.combo, this.ctx.comboElement);
        }

        if (a.isPurple) {
            this.state.multishotCount = Math.min(this.state.currentMaxMultishot, this.state.multishotCount + 1);
            this.state.multishotTimer = POWERUP_DURATION;
        }
        if (a.isYellow) {
            this.state.shieldTimer = Math.min(this.state.currentMaxShieldDuration, this.state.shieldTimer + 20);
        }

        if (a.level < 2) {
            const newR = a.r / 2;
            const isSplittingToSmall = (a.level === 1);
            const purpleChance = isSplittingToSmall ? 0.1 : 0;
            const yellowChance = isSplittingToSmall ? purpleChance / 3 : 0;

            for (let i = 0; i < 2; i++) {
                const rand = Math.random();
                let p = false, y = false;
                if (rand < purpleChance) p = true;
                else if (rand < purpleChance + yellowChance) y = true;
                this.state.asteroids.push(new Asteroid(a.x, a.y, newR, a.level + 1, p, y, this.state.scale));
            }
        }
        this.state.asteroids.splice(index, 1);

        if (this.state.asteroids.length === 0) {
            this.state.level++;
            this.state.archenemyKilledInLevel = false;
            this.ctx.levelElement.innerText = this.state.level;
            this.ctx.createAsteroids();
        }
    }
}
