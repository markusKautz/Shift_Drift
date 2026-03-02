import { ASTEROIDS_SPEED, FPS, ASTEROIDS_VERTICES, ASTEROIDS_JAGGEDNESS, SHIP_SIZE, SHOW_BOUNDING_BOX } from './constants.js';

export class Asteroid {
    constructor(x, y, r, level = 0, isPurple = false, isYellow = false, scale = 1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.level = level; // 0 = large, 1 = medium, 2 = small
        this.isPurple = isPurple;
        this.isYellow = isYellow;
        this.xv = Math.random() * (ASTEROIDS_SPEED * scale) / FPS * (Math.random() < 0.5 ? 1 : -1);
        this.yv = Math.random() * (ASTEROIDS_SPEED * scale) / FPS * (Math.random() < 0.5 ? 1 : -1);
        this.a = Math.random() * Math.PI * 2;
        this.vert = Math.floor(Math.random() * (ASTEROIDS_VERTICES + 1) + ASTEROIDS_VERTICES / 2);
        this.offset = [];
        for (let i = 0; i < this.vert; i++) {
            this.offset.push(Math.random() * ASTEROIDS_JAGGEDNESS * 2 + 1 - ASTEROIDS_JAGGEDNESS);
        }
    }

    draw(ctx, currentTheme) {
        if (currentTheme === 'modern') {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 150, 200, 0.4)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;

            ctx.beginPath();
            ctx.moveTo(
                this.x + this.r * this.offset[0] * Math.cos(this.a),
                this.y + this.r * this.offset[0] * Math.sin(this.a)
            );
            for (let i = 1; i < this.vert; i++) {
                ctx.lineTo(
                    this.x + this.r * this.offset[i] * Math.cos(this.a + i * Math.PI * 2 / this.vert),
                    this.y + this.r * this.offset[i] * Math.sin(this.a + i * Math.PI * 2 / this.vert)
                );
            }
            ctx.closePath();
            ctx.save();
            ctx.clip();

            const lightX = this.x - this.r * 0.35;
            const lightY = this.y - this.r * 0.35;
            const sphereGrad = ctx.createRadialGradient(lightX, lightY, this.r * 0.05, this.x, this.y, this.r);

            if (this.isPurple) {
                sphereGrad.addColorStop(0, '#d8b4fe');
                sphereGrad.addColorStop(0.25, '#a855f7');
                sphereGrad.addColorStop(0.6, '#6b21a8');
                sphereGrad.addColorStop(1, '#2e1065');
            } else if (this.isYellow) {
                sphereGrad.addColorStop(0, '#fef08a');
                sphereGrad.addColorStop(0.25, '#facc15');
                sphereGrad.addColorStop(0.6, '#a16207');
                sphereGrad.addColorStop(1, '#422006');
            } else {
                sphereGrad.addColorStop(0, '#5eead4');
                sphereGrad.addColorStop(0.25, '#1a8a7a');
                sphereGrad.addColorStop(0.6, '#0d4f52');
                sphereGrad.addColorStop(1, '#051e22');
            }

            ctx.fillStyle = sphereGrad;
            ctx.fillRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);

            const specGrad = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, this.r * 0.5);
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = specGrad;
            ctx.fillRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);

            ctx.restore();

            ctx.shadowColor = 'transparent';
            if (this.isPurple) ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
            else if (this.isYellow) ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
            else ctx.strokeStyle = 'rgba(94, 234, 212, 0.5)';

            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.r * this.offset[0] * Math.cos(this.a), this.y + this.r * this.offset[0] * Math.sin(this.a));
            for (let i = 1; i < this.vert; i++) {
                ctx.lineTo(this.x + this.r * this.offset[i] * Math.cos(this.a + i * Math.PI * 2 / this.vert), this.y + this.r * this.offset[i] * Math.sin(this.a + i * Math.PI * 2 / this.vert));
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        } else {
            if (this.isPurple) ctx.strokeStyle = '#a855f7';
            else if (this.isYellow) ctx.strokeStyle = '#facc15';
            else ctx.strokeStyle = '#00ff41';

            ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.moveTo(this.x + this.r * this.offset[0] * Math.cos(this.a), this.y + this.r * this.offset[0] * Math.sin(this.a));
            for (let i = 1; i < this.vert; i++) {
                ctx.lineTo(this.x + this.r * this.offset[i] * Math.cos(this.a + i * Math.PI * 2 / this.vert), this.y + this.r * this.offset[i] * Math.sin(this.a + i * Math.PI * 2 / this.vert));
            }
            ctx.closePath();
            ctx.stroke();
        }

        if (SHOW_BOUNDING_BOX) {
            ctx.strokeStyle = 'lime';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.xv;
        this.y += this.yv;

        if (this.x < 0 - this.r) this.x = canvasWidth + this.r;
        else if (this.x > canvasWidth + this.r) this.x = 0 - this.r;
        if (this.y < 0 - this.r) this.y = canvasHeight + this.r;
        else if (this.y > canvasHeight + this.r) this.y = 0 - this.r;
    }
}
