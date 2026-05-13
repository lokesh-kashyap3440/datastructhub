export class EventBus {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(callback)
    return () => this.off(event, callback)
  }

  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper)
      callback(...args)
    }
    this.on(event, wrapper)
  }

  off(event, callback) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
  }

  emit(event, ...args) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(callback => {
      try { callback(...args) } catch (e) { console.error(`EventBus error in "${event}":`, e) }
    })
  }

  clear(event) {
    if (event) delete this.listeners[event]
    else this.listeners = {}
  }
}

export const eventBus = new EventBus()
