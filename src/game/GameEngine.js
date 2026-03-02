import { audio } from './audio.js';
import { Particle, createHyperspaceEffect } from './particles.js';
import { FPS, BULLET_MAX, HYPERSPACE_DIST, HYPERSPACE_COOLDOWN } from './constants.js';
import { Bullet } from './Bullet.js';
import { Ufo } from './Ufo.js';
import { Rival } from './Rival.js';
import { drawHUD, updateComboUI } from './ui.js';

export class GameEngine {
    constructor(state, inputManager, collisionManager, uiContext) {
        this.state = state;
        this.inputManager = inputManager;
        this.collisionManager = collisionManager;
        this.ui = uiContext; // { canvas, ctx }
        this.animationFrameId = null;

        // Starfield
        this.stars = [];
        this.lastW = 0;
        this.lastH = 0;

        // Object Pools
        this.bulletPool = [];
        this.particlePool = [];
    }

    start() {
        this.animationFrameId = requestAnimationFrame((time) => {
            this.state.lastTime = time;
            this.loop(time);
        });
    }

    loop(time = 0) {
        if (this.state.gameOver) {
            this.draw();
            return; // Stop loop loop when game over
        }

        if (this.state.isPaused) {
            this.state.lastTime = time;
            this.draw();
            this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
            return;
        }

        const dt = (time - this.state.lastTime) / 1000;
        this.state.lastTime = time;

        this.update(dt);
        this.draw();

        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        const { state, inputManager, collisionManager, ui: { canvas } } = this;

        // Player Input
        const rotDir = inputManager.getRotation();
        if (rotDir !== 0) {
            state.ship.rot = rotDir * (360 / 180 * Math.PI) / FPS;
        } else {
            state.ship.rot = 0;
        }

        const isThrusting = inputManager.isThrusting();
        state.ship.thrusting = isThrusting;

        if (isThrusting) {
            audio.startThrust(state.currentTheme);
            const speed = Math.sqrt(state.ship.thrust.x ** 2 + state.ship.thrust.y ** 2);
            audio.updateThrust(speed, state.currentTheme);
            if (state.currentTheme === 'modern') {
                this.spawnParticle(
                    state.ship.x - Math.cos(state.ship.a) * state.ship.r,
                    state.ship.y + Math.sin(state.ship.a) * state.ship.r,
                    `rgba(255, ${Math.floor(Math.random() * 100 + 100)}, 0, 1)`,
                    Math.random() * 2 + 1, Math.random() * 10 + 10, Math.random() * 2 + 1
                );
            }
        } else {
            audio.stopThrust();
        }

        state.ship.update(canvas.width, canvas.height);

        // Enemies
        if (!state.ufo && !state.gameOver) {
            state.ufoSpawnTimer--;
            if (state.ufoSpawnTimer <= 0) state.ufo = new Ufo(canvas.width, canvas.height, state.scale);
        }
        if (state.ufo) {
            state.ufo.update(this, canvas.width, canvas.height, state.level, state.bullets);
        }

        if (!state.rival && !state.gameOver && state.level % 3 === 0 && !state.archenemyKilledInLevel) {
            state.rivalSpawnTimer--;
            if (state.rivalSpawnTimer <= 0) state.rival = new Rival(canvas.width, canvas.height, state.scale);
        }
        if (state.rival) {
            state.rival.update(this, canvas.width, canvas.height, state.level, state.bullets, state.ship.x, state.ship.y);
        }

        // Asteroids & Bullets Movement
        state.asteroids.forEach(a => a.update(canvas.width, canvas.height));
        state.bullets.forEach(b => b.update(canvas));

        // Collisions
        collisionManager.checkCollisions();

        // Particles & Shake
        for (let i = state.particles.length - 1; i >= 0; i--) {
            state.particles[i].update();
            if (state.particles[i].life <= 0) {
                const p = state.particles.splice(i, 1)[0];
                this.particlePool.push(p);
            }
        }
        if (state.shakeTime > 0) state.shakeTime--;

        // Timers
        if (state.comboTimer > 0) {
            state.comboTimer -= dt;
            if (state.comboTimer <= 0) {
                state.combo = 1;
                updateComboUI(state.combo, this.ui.comboElement);
            }
        }
        if (state.multishotTimer > 0) {
            state.multishotTimer -= dt;
            if (state.multishotTimer <= 0) state.multishotCount = 1;
        }
        if (state.shieldTimer > 0) state.shieldTimer -= dt;
    }

    draw() {
        const { state, ui: { canvas, ctx } } = this;

        if (state.currentTheme === 'retro') {
            ctx.fillStyle = '#0a0e1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Let CSS background show

            // Draw Modern Starfield
            if (this.stars.length === 0 || this.lastW !== canvas.width || this.lastH !== canvas.height) {
                this.stars = [];
                for (let i = 0; i < 80; i++) this.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1 + 0.5, a: Math.random() * 0.5 + 0.1, speed: 0.2 });
                for (let i = 0; i < 40; i++) this.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.5 + 0.8, a: Math.random() * 0.6 + 0.3, speed: 0.5 });
                this.lastW = canvas.width; this.lastH = canvas.height;
            }
            this.stars.forEach(s => {
                let warp = state.ship.thrusting ? 5 : 1;
                s.x -= s.speed * warp;
                if (s.x < 0) s.x = canvas.width;
                ctx.fillStyle = `rgba(180, 220, 255, ${s.a})`;
                ctx.beginPath();
                if (warp > 1) ctx.rect(s.x, s.y, s.r * warp * 3, s.r);
                else ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        ctx.save();
        if (state.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * state.shakeIntensity;
            const dy = (Math.random() - 0.5) * state.shakeIntensity;
            ctx.translate(dx, dy);
        }

        state.bullets.forEach(b => b.draw(ctx, state.currentTheme));
        if (!state.gameOver) state.ship.draw(ctx, state.currentTheme, state.shieldTimer);
        state.asteroids.forEach(a => a.draw(ctx, state.currentTheme));
        if (state.ufo) state.ufo.draw(ctx, state.currentTheme);
        if (state.rival) state.rival.draw(ctx, state.currentTheme);
        state.particles.forEach(p => p.draw(ctx, state.currentTheme));

        drawHUD(ctx, canvas, state.multishotCount, state.multishotTimer, state.shieldTimer, state.currentMaxShieldDuration, state.scale);

        ctx.restore();
    }

    shoot() {
        if (this.state.isPaused || this.state.gameOver) return;
        const { state } = this;
        if (state.bullets.length < BULLET_MAX + (state.multishotCount * 5)) {
            const spreadAngle = 0.15;
            const totalSpread = (state.multishotCount - 1) * spreadAngle;
            const startAngle = state.ship.a - totalSpread / 2;

            for (let i = 0; i < state.multishotCount; i++) {
                const angle = startAngle + i * spreadAngle;
                const bx = state.ship.x + 4 / 3 * state.ship.r * Math.cos(state.ship.a);
                const by = state.ship.y - 4 / 3 * state.ship.r * Math.sin(state.ship.a);

                let b;
                if (this.bulletPool.length > 0) {
                    b = this.bulletPool.pop();
                    b.reset(bx, by, angle, false, 2, state.scale);
                } else {
                    b = new Bullet(bx, by, angle, false, 2, state.scale);
                }
                state.bullets.push(b);
            }
            audio.playShoot(state.currentTheme);
        }
    }

    spawnParticle(x, y, color, size, life, speed) {
        let p;
        if (this.particlePool.length > 0) {
            p = this.particlePool.pop();
            p.reset(x, y, color, size, life, speed);
        } else {
            p = new Particle(x, y, color, size, life, speed);
        }
        this.state.particles.push(p);
    }

    hyperspace() {
        if (this.state.isPaused || this.state.gameOver) return;
        const now = performance.now();
        const { state, ui: { canvas } } = this;
        if (now - state.lastHyperspace < HYPERSPACE_COOLDOWN) return;
        state.lastHyperspace = now;

        const sDist = HYPERSPACE_DIST * state.scale;
        state.ship.x += sDist * Math.cos(state.ship.a);
        state.ship.y -= sDist * Math.sin(state.ship.a);
        state.ship.thrust.x = 0;
        state.ship.thrust.y = 0;

        if (state.ship.x < 0 - state.ship.r) state.ship.x = canvas.width + state.ship.r;
        else if (state.ship.x > canvas.width + state.ship.r) state.ship.x = 0 - state.ship.r;
        if (state.ship.y < 0 - state.ship.r) state.ship.y = canvas.height + state.ship.r;
        else if (state.ship.y > canvas.height + state.ship.r) state.ship.y = 0 - state.ship.r;

        createHyperspaceEffect(this, state.particles, state.ship.x, state.ship.y, state.currentTheme);
        audio.playHyperspace();
    }
}
