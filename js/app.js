import anime from 'animejs'
import { CONFIG } from './utils/constants.js'
import { randomInt, randomValue, sleep } from './utils/helpers.js'
import { eventBus } from './core/EventBus.js'
import { animator } from './core/Animator.js'
import { soundEngine } from './core/SoundEngine.js'
import { ArrayDS } from './structures/ArrayDS.js'
import { LinkedList } from './structures/LinkedList.js'
import { Stack } from './structures/Stack.js'
import { Queue } from './structures/Queue.js'
import { BST } from './structures/BST.js'
import { HashTable } from './structures/HashTable.js'
import { Graph } from './structures/Graph.js'
import { Heap } from './structures/Heap.js'

const STORAGE_KEY = 'dshub_state'

const AppState = {
  currentStructure: 'array',
  structures: {},
  isAnimating: false,
  pendingOps: [],
  speed: 1,
  soundEnabled: true,
}

const DOM = {}

function initDOMReferences() {
  DOM.tabBar = document.getElementById('tabBar')
  DOM.structureTitle = document.getElementById('structureTitle')
  DOM.statSize = document.getElementById('statSize')
  DOM.statCapacity = document.getElementById('statCapacity')
  DOM.visualization = document.getElementById('visualization')
  DOM.valueInput = document.getElementById('valueInput')
  DOM.operationSelect = document.getElementById('operationSelect')
  DOM.indexInput = document.getElementById('indexInput')
  DOM.executeBtn = document.getElementById('executeBtn')
  DOM.randomBtn = document.getElementById('randomBtn')
  DOM.clearBtn = document.getElementById('clearBtn')
  DOM.soundBtn = document.getElementById('soundBtn')
  DOM.spaceBadge = document.getElementById('spaceBadge')
  DOM.compBars = document.getElementById('compBars')
  DOM.toast = document.getElementById('toast')
  DOM.operationLog = document.getElementById('operationLog')

  const missing = ['tabBar','structureTitle','statSize','visualization','valueInput',
    'operationSelect','executeBtn','randomBtn','clearBtn','soundBtn','toast']
    .filter(id => !DOM[id])
  if (missing.length) console.error('[DSHub] Missing DOM elements:', missing)
}

function initEventListeners() {
  DOM.tabBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.nav-item')
    if (tab) switchStructure(tab.dataset.structure)
  })

  DOM.operationSelect.addEventListener('change', updateOperationUI)

  DOM.executeBtn.addEventListener('click', enqueueOperation)
  DOM.valueInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') enqueueOperation() })
  DOM.indexInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') enqueueOperation() })

  DOM.randomBtn.addEventListener('click', randomizeStructure)
  DOM.clearBtn.addEventListener('click', clearStructure)

  DOM.soundBtn.addEventListener('click', () => {
    AppState.soundEnabled = soundEngine.toggle()
    DOM.soundBtn.textContent = AppState.soundEnabled ? '\u{1F50A}' : '\u{1F507}'
    DOM.soundBtn.classList.toggle('muted', !AppState.soundEnabled)
    soundEngine.playToggle()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { DOM.valueInput.blur(); DOM.indexInput.blur() }
  })

  document.addEventListener('click', () => { soundEngine.init() }, { once: true })
}

function initStructures() {
  AppState.structures = {
    array: new ArrayDS(),
    linkedlist: new LinkedList(),
    stack: new Stack(),
    queue: new Queue(),
    bst: new BST(),
    hashtable: new HashTable(),
    graph: new Graph(),
    heap: new Heap(),
  }
  Object.values(AppState.structures).forEach(ds => ds.init())

  const saved = loadState()
  if (saved) {
    Object.keys(saved).forEach(key => {
      if (AppState.structures[key] && saved[key]) {
        try { AppState.structures[key].data = saved[key] } catch(e) {}
      }
    })
  }
}

function switchStructure(structureId) {
  if (AppState.isAnimating) {
    animator.cancelAll()
    AppState.isAnimating = false
    unlockUI()
  }

  document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'))
  const activeTab = document.querySelector(`[data-structure="${structureId}"]`)
  if (activeTab) activeTab.classList.add('active')

  const color = CONFIG.colors[structureId] || '#00e5ff'
  document.documentElement.style.setProperty('--active-color', color)

  const meta = CONFIG.structures[structureId] || {}
  DOM.structureTitle.textContent = meta.name || structureId
  DOM.structureTitle.style.color = color
  DOM.statCapacity.textContent = meta.maxCapacity || '\u2014'

  updateOperationOptions(structureId)
  updateOperationUI()

  DOM.executeBtn.style.background = color
  DOM.executeBtn.style.boxShadow = `0 0 20px ${color}33`

  updateComplexityBars(structureId)

  const complexity = CONFIG.complexity[structureId]
  if (complexity && DOM.spaceBadge) {
    DOM.spaceBadge.textContent = complexity.space
    DOM.spaceBadge.style.color = color
    DOM.spaceBadge.style.background = `${color}1a`
    DOM.spaceBadge.style.borderColor = `${color}33`
  }

  anime({ targets: DOM.visualization, opacity: [1, 0], duration: 150, easing: 'easeOutQuad', complete: () => {
    DOM.visualization.innerHTML = ''
    const ds = AppState.structures[structureId]
    if (ds) { ds.render(DOM.visualization); updateStats() }
    anime({ targets: DOM.visualization, opacity: [0, 1], duration: 200, easing: 'easeOutQuad' })
  }})

  AppState.currentStructure = structureId
}

function updateOperationOptions(structureId) {
  const select = DOM.operationSelect
  select.innerHTML = ''

  const operations = {
    array: [
      { value: 'insert', label: 'Insert' }, { value: 'insertAt', label: 'Insert At' },
      { value: 'delete', label: 'Delete' }, { value: 'deleteAt', label: 'Delete At' },
      { value: 'search', label: 'Search' }, { value: 'update', label: 'Update' }
    ],
    linkedlist: [
      { value: 'insertHead', label: 'Insert Head' }, { value: 'insertTail', label: 'Insert Tail' },
      { value: 'insertAt', label: 'Insert At' }, { value: 'deleteHead', label: 'Delete Head' },
      { value: 'deleteTail', label: 'Delete Tail' }, { value: 'deleteAt', label: 'Delete At' },
      { value: 'search', label: 'Search' }
    ],
    stack: [{ value: 'push', label: 'Push' }, { value: 'pop', label: 'Pop' }, { value: 'peek', label: 'Peek' }],
    queue: [{ value: 'enqueue', label: 'Enqueue' }, { value: 'dequeue', label: 'Dequeue' }, { value: 'front', label: 'Front' }],
    bst: [
      { value: 'insert', label: 'Insert' }, { value: 'search', label: 'Search' },
      { value: 'delete', label: 'Delete' }, { value: 'traverseIn', label: 'Inorder' },
      { value: 'traversePre', label: 'Preorder' }, { value: 'traversePost', label: 'Postorder' }
    ],
    hashtable: [{ value: 'insert', label: 'Insert' }, { value: 'search', label: 'Search' }, { value: 'delete', label: 'Delete' }],
    graph: [
      { value: 'addNode', label: 'Add Node' }, { value: 'addEdge', label: 'Add Edge' },
      { value: 'removeNode', label: 'Remove Node' }, { value: 'bfs', label: 'BFS' }, { value: 'dfs', label: 'DFS' }
    ],
    heap: [{ value: 'insert', label: 'Insert' }, { value: 'extract', label: 'Extract Max' }, { value: 'heapify', label: 'Build Heap' }]
  }

  const ops = operations[structureId] || []
  ops.forEach(op => {
    const opt = document.createElement('option')
    opt.value = op.value
    opt.textContent = op.label
    select.appendChild(opt)
  })
}

function updateOperationUI() {
  const op = DOM.operationSelect.value
  DOM.indexInput.style.display = ['insertAt', 'deleteAt', 'update'].includes(op) ? 'block' : 'none'

  if (AppState.currentStructure === 'hashtable') DOM.valueInput.placeholder = 'key:value'
  else if (op === 'addEdge') DOM.valueInput.placeholder = 'A-B'
  else DOM.valueInput.placeholder = 'Value'
}

function enqueueOperation() {
  AppState.pendingOps.push(processOperation)
  if (!AppState.isAnimating) dequeueOperation()
}

async function dequeueOperation() {
  if (AppState.isAnimating || AppState.pendingOps.length === 0) return
  const op = AppState.pendingOps.shift()
  if (op) await op()
  dequeueOperation()
}

async function processOperation() {
  if (AppState.isAnimating) return

  const operation = DOM.operationSelect.value
  let value = DOM.valueInput.value.trim()
  const index = parseInt(DOM.indexInput.value) || 0

  const noValueOps = ['pop', 'dequeue', 'peek', 'front', 'extract',
    'traverseIn', 'traversePre', 'traversePost', 'bfs', 'dfs', 'heapify', 'deleteHead', 'deleteTail']

  if (!value && !noValueOps.includes(operation)) {
    showToast('Enter a value', 'error')
    DOM.valueInput.focus()
    return
  }

  if (operation === 'addEdge') {
    const parts = value.split('-').map(v => v.trim())
    if (parts.length !== 2) { showToast('Use format: A-B', 'error'); return }
    value = parts
  }

  if (operation === 'insert' && AppState.currentStructure === 'hashtable' && value.includes(':')) {
    const [key, val] = value.split(':').map(v => v.trim())
    if (!key || !val) { showToast('Use format: key:value', 'error'); return }
    value = { key, value: val }
  }

  const ds = AppState.structures[AppState.currentStructure]
  if (!ds) { showToast('Error: Structure not found', 'error'); return }

  AppState.isAnimating = true
  lockUI()

  try {
    const result = await ds.execute(operation, value, index)

    if (operation === 'search' && result === null) showToast('Not found', 'warning')
    else if (result !== false && result !== undefined) showToast(typeof result === 'string' ? result : `Done: ${result}`, 'success')

    if (result) addLogEntry(operation, result)

    DOM.visualization.innerHTML = ''
    ds.render(DOM.visualization)
    updateStats()
    saveState()
  } catch (err) {
    showToast(err.message || 'Operation failed', 'error')
    soundEngine.playError()
  }

  AppState.isAnimating = false
  unlockUI()
  DOM.valueInput.value = ''
  DOM.valueInput.focus()
}

function lockUI() {
  DOM.executeBtn.disabled = true
  DOM.randomBtn.disabled = true
  DOM.clearBtn.disabled = true
}

function unlockUI() {
  DOM.executeBtn.disabled = false
  DOM.randomBtn.disabled = false
  DOM.clearBtn.disabled = false
}

async function randomizeStructure() {
  if (AppState.isAnimating) return

  soundEngine.playRandomize()
  const ds = AppState.structures[AppState.currentStructure]
  if (!ds) return

  ds.clear()
  const count = randomInt(5, 7)

  for (let i = 0; i < count; i++) {
    try {
      switch (AppState.currentStructure) {
        case 'array': await ds.insert(randomValue()); break
        case 'linkedlist': await (i % 2 === 0 ? ds.insertHead(randomValue()) : ds.insertTail(randomValue())); break
        case 'stack': await ds.push(randomValue()); break
        case 'queue': await ds.enqueue(randomValue()); break
        case 'heap': case 'bst': await ds.insert(randomValue()); break
        case 'hashtable': await ds.insert(`k${i}`, randomValue()); break
        case 'graph':
          await ds.addNode(String.fromCharCode(65 + i))
          if (i > 0) await ds.addEdge(String.fromCharCode(64 + i), String.fromCharCode(65 + i))
          break
      }
    } catch (e) { /* skip if full */ }
  }

  ds.render(DOM.visualization)
  updateStats()
  saveState()
  showToast(`${count} elements added`, 'success')
}

function clearStructure() {
  if (AppState.isAnimating) return
  const ds = AppState.structures[AppState.currentStructure]
  if (!ds) return
  ds.clear()
  ds.render(DOM.visualization)
  updateStats()
  saveState()
  showToast('Cleared', 'success')
  soundEngine.playClick()
}

function updateStats() {
  const ds = AppState.structures[AppState.currentStructure]
  if (!ds) return
  const size = typeof ds.size === 'function' ? ds.size() : 0
  DOM.statSize.textContent = size
}

function updateComplexityBars(structureId) {
  const complexity = CONFIG.complexity[structureId]
  if (!complexity || !DOM.compBars) return

  const color = CONFIG.colors[structureId] || '#00e5ff'
  const ops = [
    { name: 'Acc', value: complexity.accessVal || 0 },
    { name: 'Sea', value: complexity.searchVal || 0 },
    { name: 'Ins', value: complexity.insertVal || 0 },
    { name: 'Del', value: complexity.deleteVal || 0 }
  ]

  DOM.compBars.innerHTML = ops.map(op => {
    const barWidth = Math.min(Math.max(op.value / 5 * 100, 0), 95)
    return `<div class="compOp"><span class="compName">${op.name}</span><div class="compBar" style="--bar-color:${color}; --bar-w:${barWidth}"></div></div>`
  }).join('')

  DOM.compBars.querySelectorAll('.compBar').forEach(bar => {
    bar.style.setProperty('--active-color', color)
  })
}

function addLogEntry(operation, message) {
  if (!DOM.operationLog) return
  const entry = document.createElement('div')
  entry.className = 'log-entry'
  const time = document.createElement('span')
  time.className = 'log-time'
  time.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const msg = document.createElement('span')
  msg.className = 'log-msg'
  msg.textContent = `${operation}: ${message}`
  entry.appendChild(time)
  entry.appendChild(msg)
  DOM.operationLog.prepend(entry)
  while (DOM.operationLog.children.length > 50) DOM.operationLog.removeChild(DOM.operationLog.lastChild)
}

function showToast(message, type = '') {
  const toast = DOM.toast
  if (!toast) return
  toast.textContent = message
  toast.className = ''
  if (type) toast.classList.add(type)
  toast.offsetHeight
  toast.classList.add('show')
  clearTimeout(toast._timeout)
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500)
}

function saveState() {
  try {
    const state = {}
    Object.entries(AppState.structures).forEach(([key, ds]) => {
      if (ds.data && Array.isArray(ds.data)) state[key] = ds.data
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) { /* storage full or unavailable */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) { return null }
}

window.addEventListener('DOMContentLoaded', () => {
  initDOMReferences()
  initEventListeners()
  initStructures()
  switchStructure('array')
})

export { AppState }
