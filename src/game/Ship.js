import { SHIP_SIZE, SHIP_THRUST, FRICTION, FPS, SHOW_BOUNDING_BOX } from './constants.js';
import { getPlayerScale } from './scaling.js';

export class Ship {
    constructor(canvasWidth, canvasHeight, scale = 1) {
        const pScale = getPlayerScale(scale);
        this.r = (SHIP_SIZE / 2) * pScale;
        this.scale = scale;
        this.pScale = pScale;
        this.reset(canvasWidth, canvasHeight);
    }

    reset(canvasWidth, canvasHeight) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.a = 90 / 180 * Math.PI; // convert to radians
        this.rot = 0;
        this.thrusting = false;
        this.thrust = { x: 0, y: 0 };
    }

    draw(ctx, currentTheme, shieldTimer) {
        if (currentTheme === 'modern') {
            ctx.save();
            const cos = Math.cos(this.a);
            const sin = Math.sin(this.a);
            const s = this.r;

            const px = (lx, ly) => this.x + lx * cos + ly * sin;
            const py = (lx, ly) => this.y - lx * sin + ly * cos;

            const nose = [1.8 * s, 0];
            const fwdL = [0.8 * s, -0.35 * s];
            const fwdR = [0.8 * s, 0.35 * s];
            const midL = [0.1 * s, -0.45 * s];
            const midR = [0.1 * s, 0.45 * s];
            const wingL = [-0.7 * s, -1.3 * s];
            const wingR = [-0.7 * s, 1.3 * s];
            const wingInL = [-0.5 * s, -0.5 * s];
            const wingInR = [-0.5 * s, 0.5 * s];
            const engOutL = [-0.9 * s, -0.55 * s];
            const engOutR = [-0.9 * s, 0.55 * s];
            const engCenter = [-0.6 * s, 0];

            ctx.shadowColor = 'rgba(0, 150, 255, 0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;

            const hullPath = () => {
                ctx.beginPath();
                ctx.moveTo(px(...nose), py(...nose));
                ctx.lineTo(px(...fwdL), py(...fwdL));
                ctx.lineTo(px(...midL), py(...midL));
                ctx.lineTo(px(...wingL), py(...wingL));
                ctx.lineTo(px(...wingInL), py(...wingInL));
                ctx.lineTo(px(...engOutL), py(...engOutL));
                ctx.lineTo(px(...engCenter), py(...engCenter));
                ctx.lineTo(px(...engOutR), py(...engOutR));
                ctx.lineTo(px(...wingInR), py(...wingInR));
                ctx.lineTo(px(...wingR), py(...wingR));
                ctx.lineTo(px(...midR), py(...midR));
                ctx.lineTo(px(...fwdR), py(...fwdR));
                ctx.closePath();
            };

            const noseX = px(...nose), noseY = py(...nose);
            const rearX = px(...engCenter), rearY = py(...engCenter);
            const bodyGrad = ctx.createLinearGradient(noseX, noseY, rearX, rearY);
            bodyGrad.addColorStop(0, '#7dd3fc');
            bodyGrad.addColorStop(0.25, '#0284c7');
            bodyGrad.addColorStop(0.5, '#075985');
            bodyGrad.addColorStop(1, '#0c2d48');

            ctx.fillStyle = bodyGrad;
            hullPath();
            ctx.fill();

            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = 'rgba(150, 220, 255, 0.6)';
            ctx.lineWidth = 1;
            hullPath();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(px(...midL), py(...midL));
            ctx.lineTo(px(...wingL), py(...wingL));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px(...midR), py(...midR));
            ctx.lineTo(px(...wingR), py(...wingR));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px(...nose), py(...nose));
            ctx.lineTo(px(...engCenter), py(...engCenter));
            ctx.stroke();

            const cockX = px(0.9 * s, 0);
            const cockY = py(0.9 * s, 0);
            const cockGrad = ctx.createRadialGradient(cockX, cockY, 0, cockX, cockY, s * 0.25);
            cockGrad.addColorStop(0, 'rgba(0, 255, 220, 0.7)');
            cockGrad.addColorStop(0.6, 'rgba(0, 200, 255, 0.3)');
            cockGrad.addColorStop(1, 'rgba(0, 100, 200, 0)');
            ctx.fillStyle = cockGrad;
            ctx.beginPath();
            ctx.ellipse(cockX, cockY, s * 0.2, s * 0.12, -this.a, 0, Math.PI * 2);
            ctx.fill();

            const engGlowL = [engOutL[0] - 0.05 * s, engOutL[1] + 0.1 * s];
            const engGlowR = [engOutR[0] - 0.05 * s, engOutR[1] - 0.1 * s];
            [engGlowL, engGlowR].forEach(eng => {
                const ex = px(...eng), ey = py(...eng);
                const eGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, s * 0.18);
                eGrad.addColorStop(0, 'rgba(0, 200, 255, 0.8)');
                eGrad.addColorStop(0.5, 'rgba(0, 120, 255, 0.3)');
                eGrad.addColorStop(1, 'rgba(0, 50, 150, 0)');
                ctx.fillStyle = eGrad;
                ctx.beginPath();
                ctx.arc(ex, ey, s * 0.18, 0, Math.PI * 2);
                ctx.fill();
            });

            const specGrad = ctx.createRadialGradient(noseX, noseY, 0, noseX, noseY, s * 0.5);
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = specGrad;
            hullPath();
            ctx.fill();

            if (this.thrusting) {
                const flameLen = 1.2 + Math.random() * 0.4;
                const texL = px((-0.9 - flameLen) * s, -0.45 * s);
                const teyL = py((-0.9 - flameLen) * s, -0.45 * s);
                const texR = px((-0.9 - flameLen) * s, 0.45 * s);
                const teyR = py((-0.9 - flameLen) * s, 0.45 * s);

                [[texL, teyL, -0.45 * s], [texR, teyR, 0.45 * s]].forEach(([tex, tey, side]) => {
                    const fGrad = ctx.createLinearGradient(px(-0.9 * s, side), py(-0.9 * s, side), tex, tey);
                    fGrad.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
                    fGrad.addColorStop(0.25, 'rgba(255, 180, 50, 0.8)');
                    fGrad.addColorStop(0.6, 'rgba(255, 80, 20, 0.4)');
                    fGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

                    ctx.shadowColor = '#ff6b35';
                    ctx.shadowBlur = 15;
                    ctx.fillStyle = fGrad;
                    ctx.beginPath();
                    ctx.moveTo(px(-0.9 * s, side - 0.12 * s), py(-0.9 * s, side - 0.12 * s));
                    ctx.lineTo(tex, tey);
                    ctx.lineTo(px(-0.9 * s, side + 0.12 * s), py(-0.9 * s, side + 0.12 * s));
                    ctx.closePath();
                    ctx.fill();
                });
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }
            ctx.restore();
        } else {
            ctx.strokeStyle = '#00ff41';
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo(this.x + 4 / 3 * this.r * Math.cos(this.a), this.y - 4 / 3 * this.r * Math.sin(this.a));
            ctx.lineTo(this.x - this.r * (2 / 3 * Math.cos(this.a) + Math.sin(this.a)), this.y + this.r * (2 / 3 * Math.sin(this.a) - Math.cos(this.a)));
            ctx.lineTo(this.x - this.r * (2 / 3 * Math.cos(this.a) - Math.sin(this.a)), this.y + this.r * (2 / 3 * Math.sin(this.a) + Math.cos(this.a)));
            ctx.closePath();
            ctx.stroke();

            if (this.thrusting) {
                ctx.fillStyle = '#ff00ff';
                ctx.strokeStyle = '#ff00ff';
                ctx.beginPath();
                ctx.moveTo(this.x - this.r * (2 / 3 * Math.cos(this.a) + 0.5 * Math.sin(this.a)), this.y + this.r * (2 / 3 * Math.sin(this.a) - 0.5 * Math.cos(this.a)));
                ctx.lineTo(this.x - this.r * 5 / 3 * Math.cos(this.a), this.y + this.r * 5 / 3 * Math.sin(this.a));
                ctx.lineTo(this.x - this.r * (2 / 3 * Math.cos(this.a) - 0.5 * Math.sin(this.a)), this.y + this.r * (2 / 3 * Math.sin(this.a) + 0.5 * Math.cos(this.a)));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        if (SHOW_BOUNDING_BOX) {
            ctx.strokeStyle = 'lime';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (shieldTimer > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
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
    }

    update(canvasWidth, canvasHeight) {
        this.a += this.rot;
        if (this.thrusting) {
            const scaledThrust = SHIP_THRUST * this.scale;
            this.thrust.x += scaledThrust * Math.cos(this.a) / FPS;
            this.thrust.y -= scaledThrust * Math.sin(this.a) / FPS;
        } else {
            this.thrust.x -= FRICTION * this.thrust.x / FPS;
            this.thrust.y -= FRICTION * this.thrust.y / FPS;
        }
        this.x += this.thrust.x;
        this.y += this.thrust.y;

        if (this.x < 0 - this.r) this.x = canvasWidth + this.r;
        else if (this.x > canvasWidth + this.r) this.x = 0 - this.r;
        if (this.y < 0 - this.r) this.y = canvasHeight + this.r;
        else if (this.y > canvasHeight + this.r) this.y = 0 - this.r;
    }
}
