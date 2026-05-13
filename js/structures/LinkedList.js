import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class LinkedList {
  constructor() {
    this.head = null
    this._count = 0
    this.container = null
  }

  init() { this.head = null; this._count = 0 }

  size() { return this._count }
  isEmpty() { return this._count === 0 }

  createNode(value) {
    const num = parseInt(value)
    if (isNaN(num)) throw new Error('Invalid number')
    return { value: num, next: null }
  }

  async insertHead(value) {
    if (this._count >= 20) throw new Error('List is full')
    const newNode = this.createNode(value)
    newNode.next = this.head
    this.head = newNode
    this._count++
    soundEngine.playInsert(1.5)
    return `Inserted ${newNode.value} at head`
  }

  async insertTail(value) {
    if (this._count >= 20) throw new Error('List is full')
    const newNode = this.createNode(value)
    if (!this.head) this.head = newNode
    else {
      let current = this.head
      while (current.next) current = current.next
      current.next = newNode
    }
    this._count++
    soundEngine.playInsert(1.0)
    return `Inserted ${newNode.value} at tail`
  }

  async insertAt(value, index) {
    if (index < 0 || index > this._count) throw new Error('Invalid index')
    if (index === 0) return await this.insertHead(value)
    if (index === this._count) return await this.insertTail(value)
    const newNode = this.createNode(value)
    let current = this.head
    for (let i = 0; i < index - 1; i++) current = current.next
    newNode.next = current.next
    current.next = newNode
    this._count++
    soundEngine.playInsert(1.2)
    return `Inserted ${newNode.value} at index ${index}`
  }

  async deleteHead() {
    if (!this.head) throw new Error('List is empty')
    const value = this.head.value
    soundEngine.playDelete()
    this.head = this.head.next
    this._count--
    return `Deleted head: ${value}`
  }

  async deleteTail() {
    if (!this.head) throw new Error('List is empty')
    if (!this.head.next) return await this.deleteHead()
    let current = this.head
    while (current.next && current.next.next) current = current.next
    const value = current.next.value
    soundEngine.playDelete()
    current.next = null
    this._count--
    return `Deleted tail: ${value}`
  }

  async deleteAt(index) {
    if (index < 0 || index >= this._count) throw new Error('Invalid index')
    if (index === 0) return await this.deleteHead()
    let current = this.head
    for (let i = 0; i < index - 1; i++) current = current.next
    const value = current.next.value
    soundEngine.playDelete()
    current.next = current.next.next
    this._count--
    return `Deleted at index ${index}: ${value}`
  }

  async search(value) {
    const target = parseInt(value)
    if (isNaN(target)) throw new Error('Invalid number')
    let current = this.head
    let index = 0
    while (current) {
      if (current.value === target) {
        soundEngine.playSearchHit()
        return `Found ${target} at index ${index}`
      }
      current = current.next
      index++
    }
    soundEngine.playSearchMiss()
    return null
  }

  clear() { this.head = null; this._count = 0 }

  toArray() {
    const arr = []
    let current = this.head
    while (current) { arr.push(current.value); current = current.next }
    return arr
  }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (this.isEmpty()) {
      container.appendChild(this._createEmptyState('\u{1F517}', 'List is empty', 'Insert nodes to see the chain'))
      return
    }

    const listContainer = document.createElement('div')
    listContainer.className = 'linked-list-container'

    const arr = this.toArray()
    arr.forEach((value, index) => {
      const nodeEl = document.createElement('div')
      nodeEl.className = 'll-node'
      nodeEl.style.animationDelay = `${index * 80}ms`

      const box = document.createElement('div')
      box.className = 'll-node-box'

      const valueEl = document.createElement('div')
      valueEl.className = 'll-value'
      valueEl.dataset.index = index
      valueEl.textContent = value

      const idxEl = document.createElement('span')
      idxEl.className = 'll-index'
      idxEl.textContent = `[${index}]`

      box.appendChild(valueEl)
      box.appendChild(idxEl)
      nodeEl.appendChild(box)
      listContainer.appendChild(nodeEl)

      if (index < arr.length - 1) {
        const arrow = document.createElement('div')
        arrow.className = 'll-arrow'
        arrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
        listContainer.appendChild(arrow)
      }
    })

    const nullEl = document.createElement('div')
    nullEl.className = 'll-null'
    nullEl.textContent = 'NULL'
    listContainer.appendChild(nullEl)

    container.appendChild(listContainer)
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
      case 'insertHead': return await this.insertHead(value)
      case 'insertTail': return await this.insertTail(value)
      case 'insertAt': return await this.insertAt(value, index)
      case 'deleteHead': return await this.deleteHead()
      case 'deleteTail': return await this.deleteTail()
      case 'deleteAt': return await this.deleteAt(index)
      case 'search': return await this.search(value)
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
