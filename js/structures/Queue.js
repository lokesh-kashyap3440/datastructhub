import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class Queue {
  constructor() {
    this.items = []
    this.maxSize = 12
    this.container = null
  }

  init() { this.items = [] }

  size() { return this.items.length }
  isEmpty() { return this.items.length === 0 }
  isFull() { return this.items.length >= this.maxSize }

  async enqueue(value) {
    if (this.isFull()) throw new Error('Queue is full')
    const numValue = parseInt(value)
    if (isNaN(numValue)) throw new Error('Invalid number')
    this.items.push(numValue)
    soundEngine.playPush()
    return `Enqueued ${numValue}`
  }

  async dequeue() {
    if (this.isEmpty()) throw new Error('Queue is empty')
    const value = this.items.shift()
    soundEngine.playPop()
    return `Dequeued ${value}`
  }

  async front() {
    if (this.isEmpty()) throw new Error('Queue is empty')
    const value = this.items[0]
    soundEngine.playSearchHit()
    return `Front: ${value}`
  }

  clear() { this.items = [] }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (this.isEmpty()) {
      container.appendChild(this._createEmptyState('\u{1F6B6}', 'Queue is empty', 'Enqueue elements to form a line'))
      return
    }

    const queueContainer = document.createElement('div')
    queueContainer.className = 'queue-container'

    this.items.forEach((value, index) => {
      const item = document.createElement('div')
      item.className = 'queue-item'
      if (index === 0) item.classList.add('front')
      if (index === this.items.length - 1) item.classList.add('rear')
      item.style.animationDelay = `${index * 80}ms`

      const valueEl = document.createElement('div')
      valueEl.className = 'queue-value'
      valueEl.dataset.index = index
      valueEl.textContent = value

      const idxEl = document.createElement('span')
      idxEl.className = 'queue-index'
      idxEl.textContent = `[${index}]`

      item.appendChild(valueEl)
      item.appendChild(idxEl)
      queueContainer.appendChild(item)

      if (index === 0) {
        const label = document.createElement('div')
        label.className = 'queue-pointer'
        label.textContent = '\u2190 Front'
        queueContainer.appendChild(label)
      }
    })

    const rearLabel = document.createElement('div')
    rearLabel.className = 'queue-pointer'
    rearLabel.textContent = 'Rear \u2192'
    queueContainer.appendChild(rearLabel)

    container.appendChild(queueContainer)

    const items = queueContainer.querySelectorAll('.queue-item')
    if (items.length) animator.stagger(items, { delay: 80 })
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
      case 'enqueue': return await this.enqueue(value)
      case 'dequeue': return await this.dequeue()
      case 'front': return await this.front()
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
