/**
 * SOL VERMELHO - Audio System
 * Sistema de áudio procedural
 */

const Audio = {
    ctx: null,

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    play(type, x, y) {
        if (!this.ctx || G.paused) return;

        // Calcula volume baseado na distância
        const dist = Math.hypot(x - G.player.x, y - G.player.y);
        const vol = Math.max(0, 1 - dist / 600) * 0.3;

        if (vol <= 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        if (type === 'shot') {
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(60, now);
            osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    }
};

// Radio stub (pode ser expandido depois)
const Radio = {
    station: 0,
    timer: 0,
    crimeReported: false,

    changeStation() { },
    update() { },
    show() { },
    hide() { },
    updateDisplay() { }
};
