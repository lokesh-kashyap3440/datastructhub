import anime from 'animejs'
import { soundEngine } from '../core/SoundEngine.js'
import { animator } from '../core/Animator.js'
import { sleep } from '../utils/helpers.js'

export class HashTable {
  constructor() {
    this.buckets = Array.from({ length: 8 }, () => [])
    this._count = 0
    this.container = null
  }

  init() { this.buckets = Array.from({ length: 8 }, () => []); this._count = 0 }

  size() { return this._count }
  isEmpty() { return this._count === 0 }

  _hash(key) {
    let hash = 0
    for (let i = 0; i < key.length; i++) { hash = ((hash << 5) - hash) + key.charCodeAt(i); hash = hash & hash }
    return Math.abs(hash) % this.buckets.length
  }

  async insert(key, value) {
    if (this._count >= 32) throw new Error('Hash table is full')
    if (!key) throw new Error('Key is required')

    const strKey = String(key)
    const index = this._hash(strKey)

    for (const item of this.buckets[index]) {
      if (item.key === strKey) {
        item.value = String(value)
        soundEngine.playInsert(1.2)
        return `Updated ${strKey}: ${value}`
      }
    }

    this.buckets[index].push({ key: strKey, value: String(value) })
    this._count++
    soundEngine.playInsert()
    return `Inserted ${strKey}: ${value} at bucket ${index}`
  }

  async search(key) {
    const strKey = String(key)
    const index = this._hash(strKey)

    for (const item of this.buckets[index]) {
      if (item.key === strKey) {
        soundEngine.playSearchHit()
        return `Found ${strKey}: ${item.value}`
      }
    }
    soundEngine.playSearchMiss()
    return null
  }

  async delete(key) {
    const strKey = String(key)
    const index = this._hash(strKey)
    const bucket = this.buckets[index]
    const itemIndex = bucket.findIndex(item => item.key === strKey)

    if (itemIndex === -1) throw new Error(`Key "${strKey}" not found`)

    bucket.splice(itemIndex, 1)
    this._count--
    soundEngine.playDelete()
    return `Deleted ${strKey}`
  }

  clear() { this.buckets = Array.from({ length: 8 }, () => []); this._count = 0 }

  render(container) {
    this.container = container
    container.innerHTML = ''

    if (this.isEmpty()) {
      container.appendChild(this._createEmptyState('\u{1F510}', 'Hash table is empty', 'Insert key:value pairs'))
      return
    }

    const htContainer = document.createElement('div')
    htContainer.className = 'hashtable-container'

    this.buckets.forEach((bucket, index) => {
      const bucketEl = document.createElement('div')
      bucketEl.className = 'hashtable-bucket'
      bucketEl.dataset.index = index

      const label = document.createElement('div')
      label.className = 'ht-bucket-label'
      label.textContent = index
      bucketEl.appendChild(label)

      const itemsContainer = document.createElement('div')
      itemsContainer.className = 'ht-bucket-items'

      if (bucket.length === 0) {
        const nullLabel = document.createElement('div')
        nullLabel.className = 'ht-null-label'
        nullLabel.textContent = '\u2205'
        itemsContainer.appendChild(nullLabel)
      } else {
        bucket.forEach((item, i) => {
          const itemEl = document.createElement('div')
          itemEl.className = 'ht-item'
          itemEl.style.animationDelay = `${i * 100}ms`

          const valueEl = document.createElement('div')
          valueEl.className = 'ht-value'
          valueEl.textContent = `${item.key}\u2192${item.value}`
          valueEl.title = `${item.key}: ${item.value}`
          itemEl.appendChild(valueEl)
          itemsContainer.appendChild(itemEl)

          if (i < bucket.length - 1) {
            const arrow = document.createElement('div')
            arrow.className = 'ht-arrow'
            arrow.textContent = '\u2192'
            itemsContainer.appendChild(arrow)
          }
        })
      }

      bucketEl.appendChild(itemsContainer)
      htContainer.appendChild(bucketEl)
    })

    container.appendChild(htContainer)
    const buckets = htContainer.querySelectorAll('.hashtable-bucket')
    if (buckets.length) animator.stagger(buckets, { delay: 60 })
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
      case 'insert':
        if (typeof value === 'object' && value.key !== undefined) return await this.insert(value.key, value.value)
        const [key, val] = String(value).split(':').map(v => v.trim())
        return await this.insert(key, val)
      case 'search': return await this.search(value)
      case 'delete': return await this.delete(value)
      default: throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
