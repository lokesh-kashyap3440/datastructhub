export function randomInt(min = 1, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomValue() {
  return randomInt(1, 99)
}

export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export function throttle(func, limit = 100) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
}

export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return formatTime(new Date(timestamp))
}

export function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(deepClone)
  if (obj instanceof Object) {
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) cloned[key] = deepClone(obj[key])
    }
    return cloned
  }
  return obj
}

export function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export function normalizeValue(value, maxLength = 4) {
  let str = String(value)
  if (str.length > maxLength) str = str.substring(0, maxLength - 1) + '\u2026'
  return str
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function createSVG(tag, attributes = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [key, value] of Object.entries(attributes)) {
    svg.setAttribute(key, value)
  }
  return svg
}

export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}
