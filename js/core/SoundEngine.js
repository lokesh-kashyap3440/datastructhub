/**
 * SoundEngine — Synthesized UI sounds via Web Audio API
 * No external audio files needed!
 */
class SoundEngine {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.masterVolume = 0.15;
        this.initialized = false;
    }

    /**
     * Initialize AudioContext (must be called on user interaction)
     */
    init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Get enabled state
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Resume AudioContext (needed after user gesture)
     */
    async resume() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    /**
     * Create an oscillator with envelope
     * @param {number} frequency - Start frequency in Hz
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     * @param {number} duration - Duration in seconds
     * @param {Object} envelope - ADSR envelope
     * @returns {Object} { osc, gain }
     */
    createTone(frequency, type = 'sine', duration = 0.3) {
        if (!this.initialized || !this.context) return null;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.context.currentTime);

        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(this.masterVolume, this.context.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.context.destination);

        return { osc, gain };
    }

    /**
     * Play insert sound — ascending chime
     * @param {number} pitch - Pitch multiplier (default 1)
     */
    playInsert(pitch = 1) {
        if (!this.enabled || !this.initialized) return;

        const baseFreq = 523.25 * pitch; // C5
        const tones = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major triad

        tones.forEach((freq, i) => {
            const { osc, gain } = this.createTone(freq, 'sine', 0.25);
            if (!osc) return;

            osc.start();
            osc.stop(this.context.currentTime + 0.25 + i * 0.05);
        });
    }

    /**
     * Play delete sound — descending tone
     */
    playDelete() {
        if (!this.enabled || !this.initialized) return;

        const { osc, gain } = this.createTone(440, 'sine', 0.2);
        if (!osc) return;

        osc.frequency.exponentialRampToValueAtTime(220, this.context.currentTime + 0.2);
        osc.start();
        osc.stop(this.context.currentTime + 0.25);
    }

    /**
     * Play search hit — success bell
     */
    playSearchHit() {
        if (!this.enabled || !this.initialized) return;

        // Two-tone success
        const { osc: osc1, gain: gain1 } = this.createTone(659.25, 'sine', 0.4); // E5
        const { osc: osc2, gain: gain2 } = this.createTone(783.99, 'sine', 0.5); // G5

        if (osc1 && osc2) {
            osc1.start();
            osc1.stop(this.context.currentTime + 0.4);

            osc2.start();
            osc2.stop(this.context.currentTime + 0.5);
        }
    }

    /**
     * Play search miss — soft buzz
     */
    playSearchMiss() {
        if (!this.enabled || !this.initialized) return;

        const { osc, gain } = this.createTone(220, 'triangle', 0.15);
        if (!osc) return;

        osc.frequency.linearRampToValueAtTime(180, this.context.currentTime + 0.15);
        osc.start();
        osc.stop(this.context.currentTime + 0.2);
    }

    /**
     * Play error sound
     */
    playError() {
        if (!this.enabled || !this.initialized) return;

        const { osc, gain } = this.createTone(150, 'sawtooth', 0.2);
        if (!osc) return;

        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.context.currentTime + 0.2);
        osc.start();
        osc.stop(this.context.currentTime + 0.25);
    }

    /**
     * Play button click
     */
    playClick() {
        if (!this.enabled || !this.initialized) return;

        const { osc, gain } = this.createTone(800, 'square', 0.05);
        if (!osc) return;

        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
        osc.start();
        osc.stop(this.context.currentTime + 0.06);
    }

    /**
     * Play toggle/switch sound
     */
    playToggle() {
        if (!this.enabled || !this.initialized) return;

        const { osc, gain } = this.createTone(600, 'sine', 0.08);
        if (!osc) return;

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }

    /**
     * Play push (stack/queue) sound
     */
    playPush() {
        if (!this.enabled || !this.initialized) return;

        // Low "thud" then high "pop"
        const { osc: osc1, gain: gain1 } = this.createTone(120, 'sine', 0.1);
        if (osc1) {
            osc1.start();
            osc1.stop(this.context.currentTime + 0.15);
        }

        setTimeout(() => {
            const { osc: osc2, gain: gain2 } = this.createTone(800, 'sine', 0.12);
            if (osc2) {
                osc2.start();
                osc2.stop(this.context.currentTime + 0.15);
            }
        }, 50);
    }

    /**
     * Play pop (stack/queue) sound
     */
    playPop() {
        if (!this.enabled || !this.initialized) return;

        const { osc, gain } = this.createTone(400, 'sine', 0.15);
        if (!osc) return;

        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.15);
        osc.start();
        osc.stop(this.context.currentTime + 0.2);
    }

    /**
     * Play tree/heap grow sound
     */
    playGrow() {
        if (!this.enabled || !this.initialized) return;

        const notes = [262, 330, 392]; // C4, E4, G4
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const { osc } = this.createTone(freq, 'sine', 0.15);
                if (osc) {
                    osc.start();
                    osc.stop(this.context.currentTime + 0.18);
                }
            }, i * 80);
        });
    }

    /**
     * Play traversal step sound
     */
    playStep(pitch = 1) {
        if (!this.enabled || !this.initialized) return;

        const { osc, gain } = this.createTone(440 * pitch, 'sine', 0.1);
        if (!osc) return;

        osc.start();
        osc.stop(this.context.currentTime + 0.12);
    }

    /**
     * Play completion fanfare
     */
    playComplete() {
        if (!this.enabled || !this.initialized) return;

        const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        melody.forEach((freq, i) => {
            setTimeout(() => {
                const { osc } = this.createTone(freq, 'sine', 0.25);
                if (osc) {
                    osc.start();
                    osc.stop(this.context.currentTime + 0.3);
                }
            }, i * 100);
        });
    }

    /**
     * Play randomize/reset sound
     */
    playRandomize() {
        if (!this.enabled || !this.initialized) return;

        // Shimmer effect
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const freq = 300 + Math.random() * 600;
                const { osc } = this.createTone(freq, 'triangle', 0.08);
                if (osc) {
                    osc.start();
                    osc.stop(this.context.currentTime + 0.1);
                }
            }, i * 40);
        }
    }
}

// Export singleton instance
const soundEngine = new SoundEngine();