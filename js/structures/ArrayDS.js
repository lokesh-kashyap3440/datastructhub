import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class ArrayDS {
  constructor() {
    this.data = []
    this.maxCapacity = 12
    this.container = null
  }

  init() { this.data = [] }

  size() { return this.data.length }
  isEmpty() { return this.data.length === 0 }
  isFull() { return this.data.length >= this.maxCapacity }

  async insert(value) {
    if (this.isFull()) throw new Error('Array is full')
    const numValue = parseInt(value)
    if (isNaN(numValue)) throw new Error('Invalid number')
    this.data.push(numValue)
    soundEngine.playInsert()
    return `Inserted ${numValue}`
  }

  async insertAt(value, index) {
    if (this.isFull()) throw new Error('Array is full')
    const idx = parseInt(index)
    if (idx < 0 || idx > this.data.length) throw new Error('Invalid index')
    const numValue = parseInt(value)
    if (isNaN(numValue)) throw new Error('Invalid number')
    this.data.splice(idx, 0, numValue)
    soundEngine.playInsert(1.2)
    return `Inserted ${numValue} at [${idx}]`
  }

  async delete(value) {
    const numValue = parseInt(value)
    if (isNaN(numValue)) throw new Error('Invalid number')
    const index = this.data.indexOf(numValue)
    if (index === -1) throw new Error(`Value ${numValue} not found`)
    soundEngine.playDelete()
    this.data.splice(index, 1)
    return `Deleted ${numValue}`
  }

  async deleteAt(index) {
    const idx = parseInt(index)
    if (idx < 0 || idx >= this.data.length) throw new Error('Invalid index')
    const value = this.data[idx]
    soundEngine.playDelete()
    this.data.splice(idx, 1)
    return `Deleted at [${idx}]`
  }

  async search(value) {
    const numValue = parseInt(value)
    if (isNaN(numValue)) throw new Error('Invalid number')
    const index = this.data.indexOf(numValue)
    if (index === -1) return null
    return `Found ${numValue} at [${index}]`
  }

  async update(index, newValue) {
    const idx = parseInt(index)
    if (idx < 0 || idx >= this.data.length) throw new Error('Invalid index')
    const newVal = parseInt(newValue)
    if (isNaN(newVal)) throw new Error('Invalid number')
    const oldVal = this.data[idx]
    this.data[idx] = newVal
    soundEngine.playInsert(0.8)
    return `${oldVal} \u2192 ${newVal}`
  }

  clear() { this.data = [] }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (this.data.length === 0) {
      container.appendChild(this._createEmptyState('\u{1F4E6}', 'Array is empty', 'Enter a value and Execute'))
      return
    }

    const grid = document.createElement('div')
    grid.className = 'array-grid'

    this.data.forEach((value, index) => {
      const cell = document.createElement('div')
      cell.className = 'array-cell'
      cell.style.animationDelay = `${index * 40}ms`

      const valueEl = document.createElement('div')
      valueEl.className = 'array-value'
      valueEl.dataset.index = index
      valueEl.textContent = value

      const idxEl = document.createElement('span')
      idxEl.className = 'array-index'
      idxEl.textContent = `[${index}]`

      cell.appendChild(valueEl)
      cell.appendChild(idxEl)
      grid.appendChild(cell)
    })

    container.appendChild(grid)
    const cells = grid.querySelectorAll('.array-cell')
    if (cells.length) animator.stagger(cells, { delay: 40 })
  }

  _createEmptyState(icon, title, hint) {
    const div = document.createElement('div')
    div.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5'
    const iconEl = document.createElement('div')
    iconEl.style.cssText = 'font-size:36px'
    iconEl.textContent = icon
    const titleEl = document.createElement('div')
    titleEl.style.cssText = 'font-size:15px;font-weight:600;color:#8888aa'
    titleEl.textContent = title
    const hintEl = document.createElement('div')
    hintEl.style.cssText = 'font-size:12px;color:#55557a'
    hintEl.textContent = hint
    div.appendChild(iconEl)
    div.appendChild(titleEl)
    div.appendChild(hintEl)
    return div
  }

  async execute(operation, value, index) {
    switch (operation) {
      case 'insert': return await this.insert(value)
      case 'insertAt': return await this.insertAt(value, index)
      case 'delete': return await this.delete(value)
      case 'deleteAt': return await this.deleteAt(index)
      case 'search': return await this.search(value)
      case 'update': return await this.update(index, value)
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
