export class SoundEngine {
  constructor() {
    this.context = null
    this.enabled = true
    this.masterVolume = 0.15
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
    } catch (e) {
      console.warn('Web Audio API not supported:', e)
    }
  }

  toggle() { this.enabled = !this.enabled; return this.enabled }
  setEnabled(enabled) { this.enabled = enabled }
  isEnabled() { return this.enabled }

  async resume() {
    if (this.context && this.context.state === 'suspended') await this.context.resume()
  }

  createTone(frequency, type = 'sine', duration = 0.3) {
    if (!this.initialized || !this.context) return null
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, this.context.currentTime)
    gain.gain.setValueAtTime(0, this.context.currentTime)
    gain.gain.linearRampToValueAtTime(this.masterVolume, this.context.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration)
    osc.connect(gain)
    gain.connect(this.context.destination)
    return { osc, gain }
  }

  _safePlay(fn) {
    if (!this.enabled || !this.initialized) return
    fn.call(this)
  }

  playInsert(pitch = 1) {
    this._safePlay(() => {
      const baseFreq = 523.25 * pitch
      ;[baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((freq, i) => {
        const { osc } = this.createTone(freq, 'sine', 0.25)
        if (osc) { osc.start(); osc.stop(this.context.currentTime + 0.25 + i * 0.05) }
      })
    })
  }

  playDelete() {
    this._safePlay(() => {
      const { osc, gain } = this.createTone(440, 'sine', 0.2)
      if (osc) {
        osc.frequency.exponentialRampToValueAtTime(220, this.context.currentTime + 0.2)
        osc.start(); osc.stop(this.context.currentTime + 0.25)
      }
    })
  }

  playSearchHit() {
    this._safePlay(() => {
      const tones = [[659.25, 0.4], [783.99, 0.5]]
      tones.forEach(([freq, dur]) => {
        const { osc } = this.createTone(freq, 'sine', dur)
        if (osc) { osc.start(); osc.stop(this.context.currentTime + dur) }
      })
    })
  }

  playSearchMiss() {
    this._safePlay(() => {
      const { osc, gain } = this.createTone(220, 'triangle', 0.15)
      if (osc) {
        osc.frequency.linearRampToValueAtTime(180, this.context.currentTime + 0.15)
        osc.start(); osc.stop(this.context.currentTime + 0.2)
      }
    })
  }

  playError() {
    this._safePlay(() => {
      const { osc, gain } = this.createTone(150, 'sawtooth', 0.2)
      if (osc) {
        osc.frequency.setValueAtTime(200, this.context.currentTime)
        osc.frequency.linearRampToValueAtTime(100, this.context.currentTime + 0.2)
        osc.start(); osc.stop(this.context.currentTime + 0.25)
      }
    })
  }

  playClick() {
    this._safePlay(() => {
      const { osc, gain } = this.createTone(800, 'square', 0.05)
      if (osc) {
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05)
        osc.start(); osc.stop(this.context.currentTime + 0.06)
      }
    })
  }

  playToggle() {
    this._safePlay(() => {
      const { osc } = this.createTone(600, 'sine', 0.08)
      if (osc) { osc.start(); osc.stop(this.context.currentTime + 0.1) }
    })
  }

  playPush() {
    this._safePlay(() => {
      const { osc: osc1 } = this.createTone(120, 'sine', 0.1)
      if (osc1) { osc1.start(); osc1.stop(this.context.currentTime + 0.15) }
      setTimeout(() => {
        const { osc: osc2 } = this.createTone(800, 'sine', 0.12)
        if (osc2) { osc2.start(); osc2.stop(this.context.currentTime + 0.15) }
      }, 50)
    })
  }

  playPop() {
    this._safePlay(() => {
      const { osc, gain } = this.createTone(400, 'sine', 0.15)
      if (osc) {
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.15)
        osc.start(); osc.stop(this.context.currentTime + 0.2)
      }
    })
  }

  playGrow() {
    this._safePlay(() => {
      ;[262, 330, 392].forEach((freq, i) => {
        setTimeout(() => {
          const { osc } = this.createTone(freq, 'sine', 0.15)
          if (osc) { osc.start(); osc.stop(this.context.currentTime + 0.18) }
        }, i * 80)
      })
    })
  }

  playStep(pitch = 1) {
    this._safePlay(() => {
      const { osc } = this.createTone(440 * pitch, 'sine', 0.1)
      if (osc) { osc.start(); osc.stop(this.context.currentTime + 0.12) }
    })
  }

  playComplete() {
    this._safePlay(() => {
      ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        setTimeout(() => {
          const { osc } = this.createTone(freq, 'sine', 0.25)
          if (osc) { osc.start(); osc.stop(this.context.currentTime + 0.3) }
        }, i * 100)
      })
    })
  }

  playRandomize() {
    this._safePlay(() => {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const freq = 300 + Math.random() * 600
          const { osc } = this.createTone(freq, 'triangle', 0.08)
          if (osc) { osc.start(); osc.stop(this.context.currentTime + 0.1) }
        }, i * 40)
      }
    })
  }
}

export const soundEngine = new SoundEngine()
