import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class Heap {
  constructor() {
    this.heap = []
    this.container = null
    this.nodeRadius = 18
    this.levelHeight = 60
  }

  init() { this.heap = [] }

  size() { return this.heap.length }
  isEmpty() { return this.heap.length === 0 }

  parent(i) { return Math.floor((i - 1) / 2) }
  leftChild(i) { return 2 * i + 1 }
  rightChild(i) { return 2 * i + 2 }

  async insert(value) {
    const numValue = parseInt(value)
    if (isNaN(numValue)) throw new Error('Invalid number')
    this.heap.push(numValue)
    await this.bubbleUp(this.heap.length - 1)
    soundEngine.playGrow()
    return `Inserted ${numValue}`
  }

  async bubbleUp(index) {
    while (index > 0) {
      const parentIdx = this.parent(index)
      if (this.heap[parentIdx] >= this.heap[index]) break
      ;[this.heap[parentIdx], this.heap[index]] = [this.heap[index], this.heap[parentIdx]]
      index = parentIdx
    }
  }

  async extract() {
    if (this.isEmpty()) throw new Error('Heap is empty')
    const max = this.heap[0]
    const last = this.heap.pop()
    if (!this.isEmpty()) { this.heap[0] = last; await this.bubbleDown(0) }
    soundEngine.playPop()
    return `Extracted max: ${max}`
  }

  async bubbleDown(index) {
    const length = this.heap.length
    while (true) {
      const leftIdx = this.leftChild(index)
      const rightIdx = this.rightChild(index)
      let largest = index
      if (leftIdx < length && this.heap[leftIdx] > this.heap[largest]) largest = leftIdx
      if (rightIdx < length && this.heap[rightIdx] > this.heap[largest]) largest = rightIdx
      if (largest === index) break
      ;[this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]]
      index = largest
    }
  }

  async heapify() {
    const startIdx = this.parent(this.heap.length - 1)
    for (let i = startIdx; i >= 0; i--) await this.bubbleDown(i)
    soundEngine.playComplete()
    return 'Heap built'
  }

  clear() { this.heap = [] }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (this.heap.length === 0) {
      container.appendChild(this._createEmptyState('\u{1F3D4}\uFE0F', 'Heap is empty', 'Insert values to build the heap'))
      return
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'heap-container'

    const levels = Math.ceil(Math.log2(this.heap.length + 1))
    const width = 600
    const height = levels * this.levelHeight + 40

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'heap-svg')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

    const positions = this.heap.map((_, index) => {
      const level = Math.floor(Math.log2(index + 1))
      const levelStart = Math.pow(2, level) - 1
      const positionInLevel = index - levelStart
      const nodesInLevel = Math.pow(2, level)
      const xSpacing = width / (nodesInLevel + 1)
      return { x: xSpacing * (positionInLevel + 1), y: level * this.levelHeight + 40 }
    })

    this.heap.forEach((_, index) => {
      const leftIdx = this.leftChild(index)
      const rightIdx = this.rightChild(index)
      if (leftIdx < this.heap.length) this._drawEdge(svg, positions[index], positions[leftIdx])
      if (rightIdx < this.heap.length) this._drawEdge(svg, positions[index], positions[rightIdx])
    })

    this.heap.forEach((value, index) => {
      this._drawNode(svg, value, positions[index], index)
    })

    wrapper.appendChild(svg)
    container.appendChild(wrapper)
  }

  _drawEdge(svg, from, to) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', from.x); line.setAttribute('y1', from.y)
    line.setAttribute('x2', to.x); line.setAttribute('y2', to.y)
    line.setAttribute('class', 'heap-edge')
    svg.appendChild(line)
  }

  _drawNode(svg, value, pos, index) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'heap-node')
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)
    g.setAttribute('data-index', index)

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('r', this.nodeRadius)
    g.appendChild(circle)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('dy', '0.35em')
    text.textContent = value
    g.appendChild(text)

    svg.appendChild(g)
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
      case 'insert': return await this.insert(value)
      case 'extract': return await this.extract()
      case 'heapify': return await this.heapify()
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
