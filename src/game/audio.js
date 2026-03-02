export class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.thrustOsc = null;
        this.thrustGain = null;
        this.thrustNoise = null;
        this.thrustNoiseFilter = null;
        this.thrustNoiseGain = null;
        this.musicInterval = null;
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playShoot(currentTheme) {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (currentTheme === 'retro') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, t);
            filter.frequency.exponentialRampToValueAtTime(500, t + 0.3);

            osc.disconnect();
            osc.connect(filter);
            filter.connect(gain);

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

            osc.start(t);
            osc.stop(t + 0.3);
        }
    }

    playExplosion(currentTheme) {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const duration = currentTheme === 'retro' ? 0.3 : 0.8;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();

        if (currentTheme === 'retro') {
            noise.connect(gain);
            gain.connect(this.ctx.destination);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        } else {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, t);
            filter.frequency.exponentialRampToValueAtTime(50, t + 0.8);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            gain.gain.setValueAtTime(0.8, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);
        }

        noise.start(t);
    }

    startThrust(currentTheme) {
        if (!this.enabled || this.thrustOsc) return;

        this.thrustOsc = this.ctx.createOscillator();
        this.thrustGain = this.ctx.createGain();

        if (currentTheme === 'modern') {
            this.thrustOsc.type = 'sine';
            this.thrustOsc.frequency.setValueAtTime(50, this.ctx.currentTime);

            this.thrustNoise = this.ctx.createBufferSource();
            const noiseBufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, noiseBufferSize, this.ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseBufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            this.thrustNoise.buffer = noiseBuffer;
            this.thrustNoise.loop = true;

            this.thrustNoiseFilter = this.ctx.createBiquadFilter();
            this.thrustNoiseFilter.type = 'lowpass';
            this.thrustNoiseFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
            this.thrustNoiseFilter.Q.value = 1;

            this.thrustNoiseGain = this.ctx.createGain();
            this.thrustNoiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

            this.thrustNoise.connect(this.thrustNoiseFilter);
            this.thrustNoiseFilter.connect(this.thrustNoiseGain);
            this.thrustNoiseGain.connect(this.ctx.destination);

            this.thrustNoise.start();

            this.thrustOsc.connect(this.thrustGain);
            this.thrustGain.connect(this.ctx.destination);
            this.thrustGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.thrustGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
        } else {
            this.thrustOsc.type = 'square';
            this.thrustOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

            this.thrustOsc.connect(this.thrustGain);
            this.thrustGain.connect(this.ctx.destination);
            this.thrustGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.thrustGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        }

        this.thrustOsc.start();
    }

    stopThrust() {
        if (this.thrustOsc) {
            this.thrustGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
            this.thrustOsc.stop(this.ctx.currentTime + 0.1);
            this.thrustOsc = null;
            if (this.thrustNoise) {
                this.thrustNoiseGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
                this.thrustNoise.stop(this.ctx.currentTime + 0.2);
                this.thrustNoise = null;
                this.thrustNoiseGain = null;
                this.thrustNoiseFilter = null;
            }
        }
    }

    updateThrust(speed, currentTheme) {
        if (currentTheme === 'modern') {
            if (this.thrustNoiseFilter) {
                const baseFreq = 200;
                this.thrustNoiseFilter.frequency.setTargetAtTime(baseFreq + speed * 100, this.ctx.currentTime, 0.1);
            }
            if (this.thrustOsc) {
                this.thrustOsc.frequency.setTargetAtTime(50 + speed * 2, this.ctx.currentTime, 0.1);
            }
        }
    }

    playHyperspace() {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(1500, t + 0.5);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

        osc.start(t);
        osc.stop(t + 0.5);
    }

    startMusic() {
        if (!this.enabled || this.musicInterval) return;

        let tick = 0;
        const bassNotes = [65.41, 65.41, 65.41, 65.41, 49.00, 49.00, 49.00, 49.00, 43.65, 43.65, 43.65, 43.65, 49.00, 49.00, 49.00, 49.00];
        const arpNotes = [261.63, 329.63, 392.00, 493.88];

        this.musicInterval = setInterval(() => {
            if (this.ctx.state === 'suspended') return;
            const t = this.ctx.currentTime;

            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'sawtooth';
            bassOsc.frequency.value = bassNotes[tick % 16];

            const bassFilter = this.ctx.createBiquadFilter();
            bassFilter.type = 'lowpass';
            bassFilter.frequency.value = 400;

            bassOsc.connect(bassFilter);
            bassFilter.connect(bassGain);
            bassGain.connect(this.ctx.destination);

            bassGain.gain.setValueAtTime(0.3, t);
            bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

            bassOsc.start(t);
            bassOsc.stop(t + 0.25);

            if (tick % 2 === 0) {
                const arpOsc = this.ctx.createOscillator();
                const arpGain = this.ctx.createGain();
                arpOsc.type = 'square';
                arpOsc.frequency.value = arpNotes[(tick / 2) % 4] * (Math.floor(tick / 16) % 2 === 0 ? 1 : 2);

                arpOsc.connect(arpGain);
                arpGain.connect(this.ctx.destination);

                arpGain.gain.setValueAtTime(0.05, t);
                arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

                arpOsc.start(t);
                arpOsc.stop(t + 0.15);
            }

            tick++;
        }, 250);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

export const audio = new AudioController();
