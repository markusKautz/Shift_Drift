import { SHIP_SIZE, ASTEROIDS_SPEED, FPS } from './constants.js';
import { Bullet } from './Bullet.js';
import { audio } from './audio.js';
import { getEnemyScale } from './scaling.js';

export class Rival {
    constructor(canvasWidth, canvasHeight, scale = 1) {
        const eScale = getEnemyScale(scale);
        this.x = Math.random() < 0.5 ? 0 : canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.r = (SHIP_SIZE / 2) * eScale;
        this.scale = scale;
        this.eScale = eScale;
        this.xv = (Math.random() * 2 + 1) * (this.x === 0 ? 1 : -1) * (ASTEROIDS_SPEED * scale / FPS);
        this.yv = (Math.random() * 2 - 1) * (ASTEROIDS_SPEED * scale / FPS);
        this.a = 0; // angle
        this.shootTimer = 0;
        this.changeDirTimer = 0;
        this.shieldActive = true;
    }

    update(canvasWidth, canvasHeight, level, bullets, shipX, shipY) {
        this.x += this.xv;
        this.y += this.yv;

        if (this.x < 0 - this.r) this.x = canvasWidth + this.r;
        else if (this.x > canvasWidth + this.r) this.x = 0 - this.r;
        if (this.y < 0 - this.r) this.y = canvasHeight + this.r;
        else if (this.y > canvasHeight + this.r) this.y = 0 - this.r;

        const dx = shipX - this.x;
        const dy = shipY - this.y;
        this.a = -Math.atan2(dy, dx);

        this.changeDirTimer++;
        if (this.changeDirTimer > 180) {
            this.changeDirTimer = 0;
            this.yv = (Math.random() * 2 - 1) * (ASTEROIDS_SPEED * this.scale / FPS);
            this.xv = Math.sign(this.xv) * (Math.random() * 2 + 1) * (ASTEROIDS_SPEED * this.scale / FPS);
        }

        this.shootTimer++;
        if (this.shootTimer > 200) {
            this.shootTimer = 0;
            this.shoot(bullets, level);
        }
    }

    shoot(bullets, level) {
        const shotsPerBurst = Math.min(10, Math.floor(level / 3) + 1);
        const spreadAngle = 0.15;
        const totalSpread = (shotsPerBurst - 1) * spreadAngle;
        const startAngle = this.a - totalSpread / 2;

        for (let i = 0; i < shotsPerBurst; i++) {
            const angle = startAngle + i * spreadAngle;
            bullets.push(new Bullet(this.x, this.y, angle, true, 4, this.scale));
        }
        audio.playShoot('modern');
    }

    draw(ctx, currentTheme) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.a);

        if (currentTheme === 'modern') {
            const s = this.r;
            const nose = [1.2 * s, 0];
            const fwdL = [0.2 * s, 0.4 * s];
            const fwdR = [0.2 * s, -0.4 * s];
            const wingL = [-0.8 * s, 1.0 * s];
            const wingR = [-0.8 * s, -1.0 * s];
            const engL = [-0.6 * s, 0.3 * s];
            const engR = [-0.6 * s, -0.3 * s];
            const back = [-0.4 * s, 0];

            ctx.shadowColor = 'red';
            ctx.shadowBlur = 15;

            const grad = ctx.createLinearGradient(-s, 0, s, 0);
            grad.addColorStop(0, '#4a0000');
            grad.addColorStop(0.5, '#990000');
            grad.addColorStop(1, '#ff3333');

            ctx.fillStyle = grad;
            ctx.strokeStyle = '#ff6666';
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(nose[0], nose[1]);
            ctx.lineTo(fwdL[0], fwdL[1]);
            ctx.lineTo(wingL[0], wingL[1]);
            ctx.lineTo(engL[0], engL[1]);
            ctx.lineTo(back[0], back[1]);
            ctx.lineTo(engR[0], engR[1]);
            ctx.lineTo(wingR[0], wingR[1]);
            ctx.lineTo(fwdR[0], fwdR[1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#220000';
            ctx.beginPath();
            ctx.ellipse(0, 0, 0.4 * s, 0.2 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#440000';
            ctx.stroke();
        } else {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.r, 0);
            ctx.lineTo(-this.r * 0.8, this.r * 0.6);
            ctx.lineTo(-this.r * 0.5, 0);
            ctx.lineTo(-this.r * 0.8, -this.r * 0.6);
            ctx.closePath();
            ctx.stroke();
        }

        if (this.shieldActive) {
            ctx.save();
            ctx.rotate(this.a);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2.5;

            if (currentTheme === 'modern') {
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 10 + Math.sin(Date.now() / 150) * 8;
                ctx.beginPath();
                ctx.arc(0, 0, this.r * 2.0, 0, Math.PI * 2);
                ctx.stroke();

                ctx.globalAlpha = 0.15 + Math.sin(Date.now() / 150) * 0.05;
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(0, 0, this.r * 2.0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Simple yellow circle for retro mode
                ctx.beginPath();
                ctx.arc(0, 0, this.r * 2.0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
        ctx.restore();
    }
}
