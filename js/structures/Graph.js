import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class Graph {
  constructor() {
    this.nodes = new Map()
    this.edges = []
    this.container = null
    this.nodeRadius = 20
    this.positions = new Map()
  }

  init() { this.nodes = new Map(); this.edges = []; this.positions = new Map() }

  size() { return this.nodes.size }
  isEmpty() { return this.nodes.size === 0 }

  _getRandomPosition() {
    const width = 600, height = 350
    const centerX = width / 2, centerY = height / 2
    const radius = Math.min(width, height) / 2 - 50
    let x, y, attempts = 0
    do {
      const angle = Math.random() * 2 * Math.PI
      const dist = Math.random() * radius
      x = centerX + Math.cos(angle) * dist
      y = centerY + Math.sin(angle) * dist
      attempts++
    } while (this._isTooClose(x, y, 70) && attempts < 50)
    return { x, y }
  }

  _isTooClose(x, y, minDist) {
    for (const pos of this.positions.values()) {
      if (Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2) < minDist) return true
    }
    return false
  }

  async addNode(nodeId) {
    const id = String(nodeId).toUpperCase().charAt(0)
    if (!id.match(/[A-Z0-9]/)) throw new Error('Node ID must be alphanumeric')
    if (this.nodes.has(id)) throw new Error(`Node "${id}" already exists`)
    if (this.nodes.size >= 10) throw new Error('Graph is full (max 10 nodes)')

    const pos = this._getRandomPosition()
    this.positions.set(id, pos)
    this.nodes.set(id, { neighbors: [] })
    soundEngine.playGrow()
    return `Added node ${id}`
  }

  async addEdge(from, to) {
    const fromId = String(from).toUpperCase().charAt(0)
    const toId = String(to).toUpperCase().charAt(0)
    if (!this.nodes.has(fromId)) throw new Error(`Node "${fromId}" not found`)
    if (!this.nodes.has(toId)) throw new Error(`Node "${toId}" not found`)
    if (fromId === toId) throw new Error('Cannot add self-loop')

    const exists = this.edges.some(e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId))
    if (exists) throw new Error(`Edge ${fromId}-${toId} already exists`)

    this.edges.push({ from: fromId, to: toId })
    this.nodes.get(fromId).neighbors.push(toId)
    this.nodes.get(toId).neighbors.push(fromId)
    soundEngine.playInsert(1.2)
    return `Added edge ${fromId} \u2192 ${toId}`
  }

  async removeNode(nodeId) {
    const id = String(nodeId).toUpperCase().charAt(0)
    if (!this.nodes.has(id)) throw new Error(`Node "${id}" not found`)
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id)
    for (const [, node] of this.nodes) node.neighbors = node.neighbors.filter(n => n !== id)
    this.nodes.delete(id)
    this.positions.delete(id)
    soundEngine.playDelete()
    return `Removed node ${id}`
  }

  async bfs(startNode) {
    const start = String(startNode).toUpperCase().charAt(0)
    if (!this.nodes.has(start)) throw new Error(`Node "${start}" not found`)

    const visited = new Set(), queue = [start], order = []
    visited.add(start)

    while (queue.length > 0) {
      const current = queue.shift()
      order.push(current)
      for (const neighbor of this.nodes.get(current).neighbors) {
        if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor) }
      }
    }

    soundEngine.playComplete()
    return `BFS: ${order.join(' \u2192 ')}`
  }

  async dfs(startNode) {
    const start = String(startNode).toUpperCase().charAt(0)
    if (!this.nodes.has(start)) throw new Error(`Node "${start}" not found`)

    const visited = new Set(), order = []

    const dfsRecursive = (node) => {
      if (visited.has(node)) return
      visited.add(node)
      order.push(node)
      for (const neighbor of this.nodes.get(node).neighbors) {
        dfsRecursive(neighbor)
      }
    }

    dfsRecursive(start)
    soundEngine.playComplete()
    return `DFS: ${order.join(' \u2192 ')}`
  }

  clear() { this.nodes.clear(); this.edges = []; this.positions.clear() }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (this.nodes.size === 0) {
      container.appendChild(this._createEmptyState('\u{1F535}', 'Graph is empty', 'Add nodes and connect them'))
      return
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'graph-container'

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'graph-svg')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.setAttribute('viewBox', '0 0 600 350')
    wrapper.appendChild(svg)
    container.appendChild(wrapper)

    this.edges.forEach(edge => {
      const fromPos = this.positions.get(edge.from)
      const toPos = this.positions.get(edge.to)
      if (fromPos && toPos) this._createEdge(svg, fromPos.x, fromPos.y, toPos.x, toPos.y, edge.from, edge.to)
    })

    this.nodes.forEach((_, nodeId) => {
      const pos = this.positions.get(nodeId)
      if (pos) this._createNode(svg, nodeId, pos.x, pos.y)
    })
  }

  _createEdge(svg, x1, y1, x2, y2, fromId, toId) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1); line.setAttribute('y1', y1)
    line.setAttribute('x2', x2); line.setAttribute('y2', y2)
    line.setAttribute('class', 'graph-edge')
    line.setAttribute('data-from', fromId); line.setAttribute('data-to', toId)
    svg.appendChild(line)
  }

  _createNode(svg, nodeId, x, y) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'graph-node')
    g.setAttribute('transform', `translate(${x}, ${y})`)
    g.setAttribute('data-id', nodeId)

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('r', this.nodeRadius)
    g.appendChild(circle)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('dy', '0.35em')
    text.textContent = nodeId
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
      case 'addNode': return await this.addNode(value)
      case 'addEdge':
        if (Array.isArray(value) && value.length === 2) return await this.addEdge(value[0], value[1])
        throw new Error('Use format: A-B')
      case 'removeNode': return await this.removeNode(value)
      case 'bfs': return await this.bfs(value || 'A')
      case 'dfs': return await this.dfs(value || 'A')
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
