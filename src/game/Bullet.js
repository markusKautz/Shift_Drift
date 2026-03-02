import { BULLET_SPEED, SHIP_SIZE, FPS, BULLET_DIST } from './constants.js';
import { getRetroBulletScale } from './scaling.js';

export class Bullet {
    constructor(x, y, angle, isEnemy = false, r = 2, scale = 1) {
        this.x = x;
        this.y = y;
        this.xv = (BULLET_SPEED * scale) * Math.cos(angle) / FPS;
        this.yv = -(BULLET_SPEED * scale) * Math.sin(angle) / FPS;
        this.dist = 0;
        this.isEnemy = isEnemy;
        this.r = r * scale;
        this.scale = scale;
    }

    update(canvas) {
        this.x += this.xv;
        this.y += this.yv;

        // handle edge of screen
        if (this.x < 0) this.x = canvas.width;
        else if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        else if (this.y > canvas.height) this.y = 0;

        // distance travelled
        this.dist += Math.sqrt(Math.pow(this.xv, 2) + Math.pow(this.yv, 2));
    }

    draw(ctx, currentTheme) {
        if (currentTheme === 'modern') {
            // 3D energy orb bullet
            ctx.save();
            const bRadius = this.isEnemy ? this.r * 2 : SHIP_SIZE / 6;

            // Colors based on source
            const colorCore = this.isEnemy ? 'rgba(255, 200, 200, 0.95)' : 'rgba(255, 255, 255, 0.95)';
            const colorMid = this.isEnemy ? 'rgba(255, 50, 50, 0.85)' : 'rgba(200, 140, 255, 0.85)';
            const colorEdge = this.isEnemy ? 'rgba(200, 0, 0, 0.2)' : 'rgba(120, 40, 200, 0.2)';
            const shadowCol = this.isEnemy ? 'red' : '#a855f7';

            // Outer glow
            ctx.shadowColor = shadowCol;
            ctx.shadowBlur = 18;

            // Radial gradient
            const orbGrad = ctx.createRadialGradient(
                this.x - bRadius * 0.3, this.y - bRadius * 0.3, 0,
                this.x, this.y, bRadius
            );
            orbGrad.addColorStop(0, colorCore);
            orbGrad.addColorStop(0.3, colorMid);
            orbGrad.addColorStop(1, colorEdge);

            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, bRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // Retro
            const retroScale = getRetroBulletScale(this.scale);
            ctx.fillStyle = this.isEnemy ? 'red' : 'salmon';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * retroScale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
