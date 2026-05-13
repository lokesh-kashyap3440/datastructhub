import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class Stack {
  constructor() {
    this.items = []
    this.maxSize = 12
    this.container = null
  }

  init() { this.items = [] }

  size() { return this.items.length }
  isEmpty() { return this.items.length === 0 }
  isFull() { return this.items.length >= this.maxSize }

  async push(value) {
    if (this.isFull()) throw new Error('Stack is full')
    const numValue = parseInt(value)
    if (isNaN(numValue)) throw new Error('Invalid number')
    this.items.push(numValue)
    soundEngine.playPush()
    return `Pushed ${numValue}`
  }

  async pop() {
    if (this.isEmpty()) throw new Error('Stack is empty')
    const value = this.items.pop()
    soundEngine.playPop()
    return `Popped ${value}`
  }

  async peek() {
    if (this.isEmpty()) throw new Error('Stack is empty')
    const value = this.items[this.items.length - 1]
    soundEngine.playSearchHit()
    return `Top: ${value}`
  }

  clear() { this.items = [] }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (this.isEmpty()) {
      container.appendChild(this._createEmptyState('\u{1F4DA}', 'Stack is empty', 'Push elements to build the stack'))
      return
    }

    const stackContainer = document.createElement('div')
    stackContainer.className = 'stack-container'

    const pointerLabel = document.createElement('div')
    pointerLabel.className = 'stack-pointer-label'
    pointerLabel.textContent = 'TOP'
    stackContainer.appendChild(pointerLabel)

    const reversed = [...this.items].reverse()
    reversed.forEach((value, visualIndex) => {
      const actualIndex = this.items.length - 1 - visualIndex
      const item = document.createElement('div')
      item.className = 'stack-item'
      if (visualIndex === 0) item.classList.add('top')
      item.style.animationDelay = `${visualIndex * 60}ms`
      const span = document.createElement('span')
      span.textContent = value
      item.appendChild(span)
      stackContainer.appendChild(item)
    })

    const base = document.createElement('div')
    base.className = 'stack-base'
    stackContainer.appendChild(base)

    container.appendChild(stackContainer)
    const items = stackContainer.querySelectorAll('.stack-item')
    if (items.length) animator.stagger(items, { delay: 50 })
  }

  _createEmptyState(icon, title, hint) {
    const div = document.createElement('div')
    div.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5'
    const i = document.createElement('div'); i.style.cssText = 'font-size:36px'; i.textContent = icon
    const t = document.createElement('div'); t.style.cssText = 'font-size:15px;font-weight:600;color:#8888aa'; t.textContent = title
    const h = document.createElement('div'); h.style.cssText = 'font-size:12px;color:#55557a'; h.textContent = hint
    div.appendChild(i); div.appendChild(t); div.appendChild(h)
    return div
  }

  async execute(operation, value, index) {
    switch (operation) {
      case 'push': return await this.push(value)
      case 'pop': return await this.pop()
      case 'peek': return await this.peek()
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
