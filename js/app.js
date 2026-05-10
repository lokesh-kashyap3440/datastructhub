/**
 * DataStructHub — Main Application
 * Orchestrates all data structure visualizations
 */

// ===== App State =====
const AppState = {
    currentStructure: 'array',
    structures: {},
    isAnimating: false,
    speed: 1,
    soundEnabled: true,
    operationLog: []
};

// ===== DOM References =====
const DOM = {
    navList: null,
    structureTitle: null,
    structureDesc: null,
    statSize: null,
    statCapacity: null,
    visualization: null,
    emptyState: null,
    valueInput: null,
    operationSelect: null,
    indexInput: null,
    executeBtn: null,
    randomBtn: null,
    clearBtn: null,
    stepBtn: null,
    speedSlider: null,
    speedValue: null,
    soundToggle: null,
    soundOnIcon: null,
    soundOffIcon: null,
    metricsPanel: null
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    initEventListeners();
    initStructures();
    initChart();

    // Select default structure (array)
    switchStructure('array');

    // Initialize sound engine (requires user interaction)
    document.addEventListener('click', () => {
        soundEngine.init();
    }, { once: true });
});

// ===== Initialize DOM References =====
function initDOMReferences() {
    DOM.navList = document.getElementById('navList');
    DOM.structureTitle = document.getElementById('structureTitle');
    DOM.structureDesc = document.getElementById('structureDesc');
    DOM.statSize = document.getElementById('statSize');
    DOM.statCapacity = document.getElementById('statCapacity');
    DOM.visualization = document.getElementById('visualization');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.valueInput = document.getElementById('valueInput');
    DOM.operationSelect = document.getElementById('operationSelect');
    DOM.indexInput = document.getElementById('indexInput');
    DOM.executeBtn = document.getElementById('executeBtn');
    DOM.randomBtn = document.getElementById('randomBtn');
    DOM.clearBtn = document.getElementById('clearBtn');
    DOM.stepBtn = document.getElementById('stepBtn');
    DOM.speedSlider = document.getElementById('speedSlider');
    DOM.speedValue = document.getElementById('speedValue');
    DOM.soundToggle = document.getElementById('soundToggle');
    DOM.soundOnIcon = document.getElementById('soundOnIcon');
    DOM.soundOffIcon = document.getElementById('soundOffIcon');
    DOM.metricsPanel = document.getElementById('metricsPanel');
}

// ===== Initialize Event Listeners =====
function initEventListeners() {
    // Navigation
    DOM.navList.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            const structure = navItem.dataset.structure;
            switchStructure(structure);
        }
    });

    // Operation select change
    DOM.operationSelect.addEventListener('change', () => {
        updateOperationUI();
        soundEngine.playClick();
    });

    // Execute button
    DOM.executeBtn.addEventListener('click', executeOperation);

    // Randomize button
    DOM.randomBtn.addEventListener('click', randomizeStructure);

    // Clear button
    DOM.clearBtn.addEventListener('click', clearStructure);

    // Speed slider
    DOM.speedSlider.addEventListener('input', () => {
        const speed = parseFloat(DOM.speedSlider.value);
        AppState.speed = speed;
        DOM.speedValue.textContent = `${speed}x`;
        animator.setSpeed(speed);
    });

    // Sound toggle
    DOM.soundToggle.addEventListener('click', () => {
        AppState.soundEnabled = soundEngine.toggle();
        DOM.soundOnIcon.style.display = AppState.soundEnabled ? 'block' : 'none';
        DOM.soundOffIcon.style.display = AppState.soundEnabled ? 'none' : 'block';
        DOM.soundToggle.classList.toggle('muted', !AppState.soundEnabled);
        soundEngine.playToggle();
    });

    // Enter key on input
    DOM.valueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            executeOperation();
        }
    });

    // Index input enter key
    DOM.indexInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            executeOperation();
        }
    });

    // Event bus listeners
    eventBus.on('structure:update', updateStats);
    eventBus.on('structure:operation', onOperation);
    eventBus.on('structure:error', onError);
}

// ===== Initialize Data Structures =====
function initStructures() {
    // Register all structures
    AppState.structures = {
        array: new ArrayDS(),
        linkedlist: new LinkedList(),
        stack: new Stack(),
        queue: new Queue(),
        bst: new BST(),
        hashtable: new HashTable(),
        graph: new Graph(),
        heap: new Heap()
    };

    // Initialize each structure
    Object.values(AppState.structures).forEach(ds => ds.init());
}

// ===== Initialize Chart =====
function initChart() {
    chartManager.init('timeChart');
    updateComplexityChart('array');
}

// ===== Switch Structure =====
function switchStructure(structureId) {
    if (AppState.isAnimating) {
        showToast('Wait for current animation to complete', 'warning');
        return;
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`[data-structure="${structureId}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Update CSS variable for active color
    const color = CONFIG.colors[structureId] || '#00e5ff';
    document.documentElement.style.setProperty('--active-color', color);
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-soft', `${color}1a`);
    document.documentElement.style.setProperty('--accent-hover', `${color}33`);
    document.documentElement.style.setProperty('--glow-color', `${color}26`);

    // Update button colors
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.style.background = color;
    });

    // Update structure info
    const meta = CONFIG.structures[structureId] || {};
    DOM.structureTitle.textContent = meta.name || structureId;
    DOM.structureTitle.style.color = color;
    DOM.structureDesc.textContent = meta.desc || '';

    // Update capacity
    DOM.statCapacity.textContent = meta.maxCapacity || '—';

    // Update operation options
    updateOperationOptions(structureId);
    updateOperationUI();

    // Clear visualization and render new structure
    clearVisualization();

    const ds = AppState.structures[structureId];
    if (ds) {
        ds.render(DOM.visualization);
        updateStats();
    }

    // Update chart
    updateComplexityChart(structureId);

    // Update space complexity
    const complexity = CONFIG.complexity[structureId];
    const spaceBadge = document.querySelector('.complexity-badge');
    if (spaceBadge && complexity) {
        spaceBadge.textContent = complexity.space;
        spaceBadge.style.color = color;
        spaceBadge.style.borderColor = `${color}33`;
        spaceBadge.style.background = `${color}1a`;
    }

    AppState.currentStructure = structureId;

    // Log
    addLogEntry(`Switched to ${meta.name}`, 'info');

    soundEngine.playClick();
}

// ===== Update Operation Options =====
function updateOperationOptions(structureId) {
    const select = DOM.operationSelect;
    select.innerHTML = '';

    const operations = {
        array: [
            { value: 'insert', label: 'Insert' },
            { value: 'insertAt', label: 'Insert At Index' },
            { value: 'delete', label: 'Delete (by value)' },
            { value: 'deleteAt', label: 'Delete At Index' },
            { value: 'search', label: 'Search' },
            { value: 'update', label: 'Update Index' }
        ],
        linkedlist: [
            { value: 'insertHead', label: 'Insert at Head' },
            { value: 'insertTail', label: 'Insert at Tail' },
            { value: 'insertAt', label: 'Insert At Index' },
            { value: 'deleteHead', label: 'Delete at Head' },
            { value: 'deleteTail', label: 'Delete at Tail' },
            { value: 'deleteAt', label: 'Delete At Index' },
            { value: 'search', label: 'Search' }
        ],
        stack: [
            { value: 'push', label: 'Push' },
            { value: 'pop', label: 'Pop' },
            { value: 'peek', label: 'Peek' }
        ],
        queue: [
            { value: 'enqueue', label: 'Enqueue' },
            { value: 'dequeue', label: 'Dequeue' },
            { value: 'front', label: 'Front' }
        ],
        bst: [
            { value: 'insert', label: 'Insert' },
            { value: 'search', label: 'Search' },
            { value: 'delete', label: 'Delete' },
            { value: 'traverseIn', label: 'Inorder Traversal' },
            { value: 'traversePre', label: 'Preorder Traversal' },
            { value: 'traversePost', label: 'Postorder Traversal' }
        ],
        hashtable: [
            { value: 'insert', label: 'Insert (key:value)' },
            { value: 'search', label: 'Search' },
            { value: 'delete', label: 'Delete' }
        ],
        graph: [
            { value: 'addNode', label: 'Add Node' },
            { value: 'addEdge', label: 'Add Edge' },
            { value: 'removeNode', label: 'Remove Node' },
            { value: 'bfs', label: 'BFS Traversal' },
            { value: 'dfs', label: 'DFS Traversal' }
        ],
        heap: [
            { value: 'insert', label: 'Insert' },
            { value: 'extract', label: 'Extract Max' },
            { value: 'heapify', label: 'Build Heap' }
        ]
    };

    const ops = operations[structureId] || [];
    ops.forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.label;
        select.appendChild(option);
    });
}

// ===== Update Operation UI =====
function updateOperationUI() {
    const operation = DOM.operationSelect.value;
    const needsIndex = ['insertAt', 'deleteAt', 'update'].includes(operation);
    const needsKey = operation === 'insert' && AppState.currentStructure === 'hashtable';
    const needsTwoValues = operation === 'addEdge';

    DOM.indexInput.style.display = needsIndex ? 'block' : 'none';

    if (needsKey) {
        DOM.valueInput.placeholder = 'key:value';
    } else if (needsTwoValues) {
        DOM.valueInput.placeholder = 'from → to';
    } else {
        DOM.valueInput.placeholder = 'Enter value...';
    }
}

// ===== Execute Operation =====
async function executeOperation() {
    if (AppState.isAnimating) {
        showToast('Animation in progress...', 'warning');
        return;
    }

    const operation = DOM.operationSelect.value;
    let value = DOM.valueInput.value.trim();
    const index = parseInt(DOM.indexInput.value) || 0;

    // Validate
    if (!value && !['pop', 'dequeue', 'peek', 'front', 'extract', 'traverseIn', 'traversePre', 'traversePost', 'bfs', 'dfs', 'heapify'].includes(operation)) {
        showToast('Please enter a value', 'error');
        DOM.valueInput.focus();
        return;
    }

    // For graph edge, parse "from-to" format
    if (operation === 'addEdge') {
        const parts = value.split('-').map(v => v.trim());
        if (parts.length !== 2) {
            showToast('Use format: node1-node2 (e.g., A-B)', 'error');
            return;
        }
        value = parts;
    }

    // For hash table insert, parse "key:value" format
    if (operation === 'insert' && AppState.currentStructure === 'hashtable' && value.includes(':')) {
        const [key, val] = value.split(':').map(v => v.trim());
        if (!key || !val) {
            showToast('Use format: key:value (e.g., name:Alice)', 'error');
            return;
        }
        value = { key, value: val };
    }

    // Highlight chart for operation
    const operationIndexMap = {
        'insert': 2, 'insertAt': 2, 'insertHead': 2, 'insertTail': 2, 'push': 2, 'enqueue': 2,
        'delete': 3, 'deleteAt': 3, 'deleteHead': 3, 'deleteTail': 3, 'pop': 3, 'dequeue': 3,
        'search': 1, 'bfs': 1, 'dfs': 1, 'traverseIn': 1, 'traversePre': 1, 'traversePost': 1,
        'access': 0, 'update': 0, 'addNode': 2, 'removeNode': 3, 'addEdge': 2,
        'peek': 1, 'front': 1, 'extract': 3, 'heapify': 2
    };
    const opIndex = operationIndexMap[operation] ?? 2;

    AppState.isAnimating = true;
    DOM.executeBtn.disabled = true;
    DOM.randomBtn.disabled = true;
    DOM.clearBtn.disabled = true;

    const ds = AppState.structures[AppState.currentStructure];
    if (!ds) {
        AppState.isAnimating = false;
        return;
    }

    try {
        // Perform operation
        const result = await ds.execute(operation, value, index);

        // Highlight chart
        const color = CONFIG.colors[AppState.currentStructure] || '#00e5ff';
        chartManager.highlightBar(opIndex, color);

        // Show result toast
        if (result !== undefined && result !== null) {
            if (operation === 'search' && result === null) {
                showToast('Not found', 'warning');
            } else if (result !== false) {
                showToast(typeof result === 'string' ? result : `Done: ${result}`, 'success');
            }
        }

        // Re-render
        ds.render(DOM.visualization);
        updateStats();

    } catch (err) {
        console.error('Operation error:', err);
        showToast(err.message || 'Operation failed', 'error');
        soundEngine.playError();
    }

    AppState.isAnimating = false;
    DOM.executeBtn.disabled = false;
    DOM.randomBtn.disabled = false;
    DOM.clearBtn.disabled = false;
    DOM.valueInput.value = '';
    DOM.valueInput.focus();
}

// ===== Randomize Structure =====
async function randomizeStructure() {
    if (AppState.isAnimating) return;

    soundEngine.playRandomize();

    const ds = AppState.structures[AppState.currentStructure];
    if (!ds) return;

    // Clear first
    ds.clear();
    ds.render(DOM.visualization);

    // Add random elements
    const count = randomInt(5, 8);
    const operations = [];

    switch (AppState.currentStructure) {
        case 'array':
            for (let i = 0; i < count; i++) {
                operations.push(ds.insert(randomValue()));
            }
            break;
        case 'linkedlist':
            for (let i = 0; i < count; i++) {
                operations.push(i % 2 === 0 ? ds.insertHead(randomValue()) : ds.insertTail(randomValue()));
            }
            break;
        case 'stack':
            for (let i = 0; i < count; i++) {
                operations.push(ds.push(randomValue()));
            }
            break;
        case 'queue':
            for (let i = 0; i < count; i++) {
                operations.push(ds.enqueue(randomValue()));
            }
            break;
        case 'bst':
            for (let i = 0; i < count; i++) {
                operations.push(ds.insert(randomValue()));
            }
            break;
        case 'hashtable':
            for (let i = 0; i < count; i++) {
                operations.push(ds.insert(`key${i}`, randomValue()));
            }
            break;
        case 'graph':
            const nodes = 'ABCDEFGHIJ'.split('').slice(0, count);
            for (const node of nodes) {
                operations.push(ds.addNode(node));
            }
            // Add random edges
            for (let i = 0; i < count - 1; i++) {
                const from = nodes[i];
                const to = nodes[randomInt(i + 1, count - 1)];
                operations.push(ds.addEdge(from, to));
            }
            break;
        case 'heap':
            for (let i = 0; i < count; i++) {
                operations.push(ds.insert(randomValue()));
            }
            break;
    }

    // Execute all at once (no animation for batch)
    for (const op of operations) {
        await op;
    }

    ds.render(DOM.visualization);
    updateStats();
    addLogEntry(`Generated ${count} random elements`, 'info');
    showToast(`${count} random elements added`, 'success');
}

// ===== Clear Structure =====
function clearStructure() {
    if (AppState.isAnimating) return;

    const ds = AppState.structures[AppState.currentStructure];
    if (!ds) return;

    ds.clear();
    ds.render(DOM.visualization);
    updateStats();
    addLogEntry('Structure cleared', 'info');
    showToast('Structure cleared', 'success');
    soundEngine.playClick();
}

// ===== Clear Visualization =====
function clearVisualization() {
    DOM.visualization.innerHTML = '';
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.id = 'emptyState';
    emptyState.innerHTML = `
        <div class="empty-icon">📦</div>
        <p class="empty-title">Structure is empty</p>
        <p class="empty-hint">Add elements to see them visualized here</p>
    `;
    DOM.visualization.appendChild(emptyState);
}

// ===== Update Stats =====
function updateStats() {
    const ds = AppState.structures[AppState.currentStructure];
    if (!ds) return;

    const size = ds.size ? ds.size() : (ds.data ? ds.data.length : 0);
    DOM.statSize.textContent = size;

    const meta = CONFIG.structures[AppState.currentStructure];
    DOM.statCapacity.textContent = meta?.maxCapacity || '—';
}

// ===== Update Complexity Chart =====
function updateComplexityChart(structureId) {
    const complexity = CONFIG.complexity[structureId];
    if (!complexity) return;

    const color = CONFIG.colors[structureId] || '#00e5ff';

    chartManager.update({
        access: complexity.access,
        search: complexity.search,
        insert: complexity.insert,
        delete: complexity.delete
    }, color);
}

// ===== On Operation Event =====
function onOperation(data) {
    const { operation, success } = data;
    const msg = success
        ? `${operation} completed successfully`
        : `${operation} failed`;
    const type = success ? 'success' : 'error';
    addLogEntry(msg, type);
}

// ===== On Error Event =====
function onError(data) {
    const { message } = data;
    showToast(message, 'error');
    addLogEntry(message, 'error');
}

// ===== Add Log Entry =====
function addLogEntry(message, type = 'info') {
    const log = document.getElementById('operationLog');
    if (!log) return;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `
        <span class="log-time">${formatTime()}</span>
        <span class="log-msg">${escapeHtml(message)}</span>
    `;

    log.insertBefore(entry, log.firstChild);

    // Keep only last 20 entries
    while (log.children.length > 20) {
        log.removeChild(log.lastChild);
    }
}

// Expose AppState globally
window.AppState = AppState;