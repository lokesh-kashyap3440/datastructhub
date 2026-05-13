import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class BST {
  constructor() {
    this.root = null
    this.container = null
    this.nodeRadius = 22
    this.levelHeight = 70
  }

  init() { this.root = null }

  size() { return this._countNodes(this.root) }

  _countNodes(node) {
    if (!node) return 0
    return 1 + this._countNodes(node.left) + this._countNodes(node.right)
  }

  _createNode(value) {
    const num = parseInt(value)
    if (isNaN(num)) throw new Error('Invalid number')
    return { value: num, left: null, right: null }
  }

  async insert(value) {
    const newNode = this._createNode(value)
    if (!this.root) {
      this.root = newNode
      soundEngine.playGrow()
      return `Inserted ${newNode.value} as root`
    }
    await this._insertRecursive(this.root, newNode)
    return `Inserted ${newNode.value}`
  }

  async _insertRecursive(node, newNode) {
    if (newNode.value < node.value) {
      if (!node.left) { node.left = newNode; soundEngine.playInsert(1.3) }
      else await this._insertRecursive(node.left, newNode)
    } else {
      if (!node.right) { node.right = newNode; soundEngine.playInsert(1.0) }
      else await this._insertRecursive(node.right, newNode)
    }
  }

  async search(value) {
    const target = parseInt(value)
    if (isNaN(target)) throw new Error('Invalid number')
    return await this._searchRecursive(this.root, target, 0)
  }

  async _searchRecursive(node, target, depth) {
    if (!node) { soundEngine.playSearchMiss(); return null }
    if (node.value === target) {
      soundEngine.playSearchHit()
      return `Found ${target} at depth ${depth}`
    }
    const direction = target < node.value ? 'left' : 'right'
    return await this._searchRecursive(node[direction], target, depth + 1)
  }

  async delete(value) {
    const target = parseInt(value)
    if (isNaN(target)) throw new Error('Invalid number')
    const existed = this._findNode(this.root, target)
    if (!existed.node) throw new Error(`Value ${target} not found`)
    this.root = this._deleteNode(this.root, target)
    soundEngine.playDelete()
    return `Deleted ${target}`
  }

  _findNode(node, value) {
    if (!node) return { node: null, parent: null, direction: null }
    if (node.value === value) return { node, parent: null, direction: null }
    const left = this._findNodeInSubtree(node.left, value, node, 'left')
    if (left.node) return left
    return this._findNodeInSubtree(node.right, value, node, 'right')
  }

  _findNodeInSubtree(node, value, parent, direction) {
    if (!node) return { node: null, parent, direction }
    if (node.value === value) return { node, parent, direction }
    if (value < node.value) return this._findNodeInSubtree(node.left, value, node, 'left')
    return this._findNodeInSubtree(node.right, value, node, 'right')
  }

  _deleteNode(node, value) {
    if (!node) return null
    if (value < node.value) { node.left = this._deleteNode(node.left, value) }
    else if (value > node.value) { node.right = this._deleteNode(node.right, value) }
    else {
      if (!node.left) return node.right
      if (!node.right) return node.left
      let successor = node.right
      while (successor.left) successor = successor.left
      node.value = successor.value
      node.right = this._deleteNode(node.right, successor.value)
    }
    return node
  }

  async traverseInorder() {
    const result = []
    this._traverseInorder(this.root, result)
    soundEngine.playComplete()
    return `Inorder: ${result.join(' \u2192 ')}`
  }

  _traverseInorder(node, result) {
    if (!node) return
    this._traverseInorder(node.left, result)
    result.push(node.value)
    this._traverseInorder(node.right, result)
  }

  async traversePreorder() {
    const result = []
    this._traversePreorder(this.root, result)
    soundEngine.playComplete()
    return `Preorder: ${result.join(' \u2192 ')}`
  }

  _traversePreorder(node, result) {
    if (!node) return
    result.push(node.value)
    this._traversePreorder(node.left, result)
    this._traversePreorder(node.right, result)
  }

  async traversePostorder() {
    const result = []
    this._traversePostorder(this.root, result)
    soundEngine.playComplete()
    return `Postorder: ${result.join(' \u2192 ')}`
  }

  _traversePostorder(node, result) {
    if (!node) return
    this._traversePostorder(node.left, result)
    this._traversePostorder(node.right, result)
    result.push(node.value)
  }

  clear() { this.root = null }

  getNodePosition(node, parent = null, isLeft = false) {
    const wrapper = this.container
    if (!wrapper) return { x: 200, y: 60 }
    const rect = wrapper.getBoundingClientRect()
    const width = rect.width || 600
    if (!parent) return { x: width / 2, y: 50 }
    const level = this._getLevel(node)
    const siblingIndex = isLeft ? 0 : 1
    const baseX = parent.x || width / 2
    const baseY = parent.y || 50
    const spread = Math.min(width / (level + 1), 200)
    const offset = (siblingIndex - 0.5) * spread
    return { x: baseX + offset, y: baseY + this.levelHeight }
  }

  _getLevel(node, root = this.root, level = 0) {
    if (!root) return 0
    if (root === node) return level
    const leftLevel = this._getLevel(node, root.left, level + 1)
    if (leftLevel) return leftLevel
    return this._getLevel(node, root.right, level + 1)
  }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (!this.root) {
      container.appendChild(this._createEmptyState('\u{1F333}', 'Tree is empty', 'Insert values to grow the tree'))
      return
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'bst-container'

    const positions = new Map()
    const depth = this._getTreeDepth(this.root)
    const startSpread = Math.min(120 * Math.pow(2, depth), 600)
    const startX = startSpread
    this._calculatePositions(this.root, null, null, positions, startX, 50, startSpread)

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const pos of positions.values()) {
      minX = Math.min(minX, pos.x)
      maxX = Math.max(maxX, pos.x)
      minY = Math.min(minY, pos.y)
      maxY = Math.max(maxY, pos.y)
    }

    const padding = this.nodeRadius + 20
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'bst-svg')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${(maxX - minX) + padding * 2} ${(maxY - minY) + padding * 2}`)
    wrapper.appendChild(svg)
    container.appendChild(wrapper)

    this._renderEdges(this.root, positions, svg)
    this._renderNodes(this.root, positions, svg)
  }

  _getTreeDepth(node) {
    if (!node) return 0
    return 1 + Math.max(this._getTreeDepth(node.left), this._getTreeDepth(node.right))
  }

  _calculatePositions(node, parent, isLeft, positions, x, y, spread) {
    if (!node) return
    positions.set(node, { x, y })
    const childSpread = spread / 2
    const childY = y + this.levelHeight
    if (node.left) this._calculatePositions(node.left, node, true, positions, x - childSpread, childY, childSpread)
    if (node.right) this._calculatePositions(node.right, node, false, positions, x + childSpread, childY, childSpread)
  }

  _renderEdges(node, positions, svg) {
    if (!node) return
    const nodePos = positions.get(node)
    if (node.left) {
      const childPos = positions.get(node.left)
      this._createEdge(nodePos.x, nodePos.y, childPos.x, childPos.y, svg)
      this._renderEdges(node.left, positions, svg)
    }
    if (node.right) {
      const childPos = positions.get(node.right)
      this._createEdge(nodePos.x, nodePos.y, childPos.x, childPos.y, svg)
      this._renderEdges(node.right, positions, svg)
    }
  }

  _createEdge(x1, y1, x2, y2, svg) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const midY = (y1 + y2) / 2
    line.setAttribute('d', `M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`)
    line.setAttribute('class', 'bst-edge')
    svg.appendChild(line)
  }

  _renderNodes(node, positions, svg) {
    if (!node) return
    const pos = positions.get(node)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'bst-node')
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('r', this.nodeRadius)
    g.appendChild(circle)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = node.value
    text.setAttribute('dy', '0.35em')
    g.appendChild(text)

    svg.appendChild(g)
    this._renderNodes(node.left, positions, svg)
    this._renderNodes(node.right, positions, svg)
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
      case 'search': return await this.search(value)
      case 'delete': return await this.delete(value)
      case 'traverseIn': return await this.traverseInorder()
      case 'traversePre': return await this.traversePreorder()
      case 'traversePost': return await this.traversePostorder()
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
