export class Particle {
    constructor(x, y, color, size, life, speed) {
        this.reset(x, y, color, size, life, speed);
    }

    reset(x, y, color, size, life, speed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        const a = Math.random() * Math.PI * 2;
        const v = Math.random() * speed;
        this.xv = Math.cos(a) * v;
        this.yv = Math.sin(a) * v;
    }

    update() {
        this.x += this.xv;
        this.y += this.yv;
        this.life--;
        this.alpha = this.life / this.maxLife;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

export function createExplosion(engine, particles, x, y, color, currentTheme, count = 15) {
    if (currentTheme !== 'modern') return;
    for (let i = 0; i < count; i++) {
        engine.spawnParticle(x, y, color, Math.random() * 3 + 1, 30 + Math.random() * 20, 2);
    }
}

export function triggerShake(state, duration, intensity, currentTheme) {
    if (currentTheme !== 'modern') return;
    state.shakeTime = duration;
    state.shakeIntensity = intensity;
}

export function createHyperspaceEffect(engine, particles, x, y, currentTheme) {
    if (currentTheme !== 'modern') return;
    for (let i = 0; i < 20; i++) {
        const speed = Math.random() * 5 + 2;
        engine.spawnParticle(x, y, '#00d4ff', Math.random() * 2, 40, speed);
    }
    for (let i = 0; i < 10; i++) {
        engine.spawnParticle(x, y, '#ffffff', Math.random() * 3, 20, Math.random() * 8 + 4);
    }
}
