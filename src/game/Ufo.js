import { ASTEROIDS_SPEED, FPS, SHIP_SIZE } from './constants.js';
import { Bullet } from './Bullet.js';
import { audio } from './audio.js';
import { getEnemyScale } from './scaling.js';

export class Ufo {
    constructor(canvasWidth, canvasHeight, scale = 1) {
        const eScale = getEnemyScale(scale);
        this.x = Math.random() < 0.5 ? 0 : canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.xv = (Math.random() * 2 + 2) * (this.x === 0 ? 1 : -1) * (ASTEROIDS_SPEED * scale / FPS);
        this.yv = (Math.random() * 2 - 1) * (ASTEROIDS_SPEED * scale / FPS);
        this.r = 20 * eScale;
        this.scale = scale;
        this.eScale = eScale;
        this.shootTimer = 0;
        this.changeDirTimer = 0;
    }

    update(engine, canvasWidth, canvasHeight, level, bullets) {
        this.x += this.xv;
        this.y += this.yv;

        if (this.x < 0 - this.r) this.x = canvasWidth + this.r;
        else if (this.x > canvasWidth + this.r) this.x = 0 - this.r;
        if (this.y < 0 - this.r) this.y = canvasHeight + this.r;
        else if (this.y > canvasHeight + this.r) this.y = 0 - this.r;

        this.changeDirTimer++;
        if (this.changeDirTimer > 60) {
            this.changeDirTimer = 0;
            if (Math.random() < 0.7) this.yv = (Math.random() * 4 - 2) * (ASTEROIDS_SPEED * this.scale / FPS);
            if (Math.random() < 0.3) this.xv = Math.sign(this.xv) * (Math.random() * 3 + 2) * (ASTEROIDS_SPEED * this.scale / FPS);
        }

        this.shootTimer++;
        const fireInterval = Math.max(40, 100 - (level - 1) * 10);
        if (this.shootTimer > fireInterval) {
            this.shootTimer = 0;
            this.shoot(engine, bullets);
        }
    }

    shoot(engine, bullets) {
        const angle = Math.random() * Math.PI * 2;
        let b;
        if (engine.bulletPool.length > 0) {
            b = engine.bulletPool.pop();
            b.reset(this.x, this.y, angle, true, 4, this.scale);
        } else {
            b = new Bullet(this.x, this.y, angle, true, 4, this.scale);
        }
        bullets.push(b);
        audio.playShoot('retro'); // UFO bullets are a bit "old school"
    }

    draw(ctx, currentTheme) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.eScale, this.eScale); // Use scale for consistent proportional drawing

        if (currentTheme === 'modern') {
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 20 / this.eScale; // Counteract scale for shadow consistency
            ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.beginPath();
            ctx.arc(0, -5, 10, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#cc0000';
            ctx.beginPath();
            ctx.ellipse(0, 5, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'yellow';
            [-12, 0, 12].forEach(lx => {
                ctx.beginPath();
                ctx.arc(lx, 5, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        } else {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1.5 / this.eScale; // Counteract scale for line weight
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-5, -10);
            ctx.lineTo(5, -10);
            ctx.lineTo(10, 0);
            ctx.lineTo(-10, 0);
            ctx.moveTo(-20, 5);
            ctx.lineTo(-10, 0);
            ctx.lineTo(10, 0);
            ctx.lineTo(20, 5);
            ctx.lineTo(-20, 5);
            ctx.stroke();
        }
        ctx.restore();
    }
}
