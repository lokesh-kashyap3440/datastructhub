/**
 * DataStructHub — Mobile-First App
 * Linear layout: topBar → canvas → controls → tabBar
 */

// ===== App State =====
const AppState = {
    currentStructure: 'array',
    structures: {},
    isAnimating: false,
    speed: 1,
    soundEnabled: true
};

// ===== DOM References =====
const DOM = {};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    initEventListeners();
    initStructures();
    switchStructure('array');

    document.addEventListener('click', () => {
        soundEngine.init();
    }, { once: true });
});

// ===== Initialize DOM References =====
function initDOMReferences() {
    DOM.tabBar = document.getElementById('tabBar');
    DOM.structureTitle = document.getElementById('structureTitle');
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
    DOM.soundBtn = document.getElementById('soundBtn');
    DOM.complexityBar = document.getElementById('complexityBar');
    DOM.spaceBadge = document.getElementById('spaceBadge');
    DOM.compBars = document.getElementById('compBars');
    DOM.toast = document.getElementById('toast');
}

// ===== Initialize Event Listeners =====
function initEventListeners() {
    // Tab bar navigation
    DOM.tabBar.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (tab) {
            switchStructure(tab.dataset.structure);
        }
    });

    // Operation select change
    DOM.operationSelect.addEventListener('change', updateOperationUI);

    // Execute button
    DOM.executeBtn.addEventListener('click', executeOperation);

    // Randomize button
    DOM.randomBtn.addEventListener('click', randomizeStructure);

    // Clear button
    DOM.clearBtn.addEventListener('click', clearStructure);

    // Sound toggle
    DOM.soundBtn.addEventListener('click', () => {
        AppState.soundEnabled = soundEngine.toggle();
        DOM.soundBtn.textContent = AppState.soundEnabled ? '🔊' : '🔇';
        DOM.soundBtn.classList.toggle('muted', !AppState.soundEnabled);
        soundEngine.playToggle();
    });

    // Enter key on inputs
    DOM.valueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeOperation();
    });
    DOM.indexInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeOperation();
    });
}

// ===== Initialize Data Structures =====
function initStructures() {
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
    Object.values(AppState.structures).forEach(ds => ds.init());
}

// ===== Switch Structure =====
function switchStructure(structureId) {
    if (AppState.isAnimating) {
        showToast('Wait for animation to finish', 'warning');
        return;
    }

    // Update tab active state
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-structure="${structureId}"]`)?.classList.add('active');

    // Set active color
    const color = CONFIG.colors[structureId] || '#00e5ff';
    document.documentElement.style.setProperty('--active-color', color);

    // Update title
    const meta = CONFIG.structures[structureId] || {};
    DOM.structureTitle.textContent = meta.name || structureId;
    DOM.structureTitle.style.color = color;

    // Update capacity
    DOM.statCapacity.textContent = meta.maxCapacity || '—';

    // Update operation options
    updateOperationOptions(structureId);
    updateOperationUI();

    // Update execute button color
    DOM.executeBtn.style.background = color;
    DOM.executeBtn.style.boxShadow = `0 0 20px ${color}33`;

    // Update complexity bars
    updateComplexityBars(structureId);

    // Update space complexity
    const complexity = CONFIG.complexity[structureId];
    if (complexity && DOM.spaceBadge) {
        DOM.spaceBadge.textContent = complexity.space;
        DOM.spaceBadge.style.color = color;
        DOM.spaceBadge.style.background = `${color}1a`;
        DOM.spaceBadge.style.borderColor = `${color}33`;
    }

    // Clear and render
    DOM.visualization.innerHTML = '';
    if (DOM.emptyState) {
        DOM.visualization.innerHTML = `
            <div id="emptyState">
                <div class="emptyIcon">📦</div>
                <div class="emptyTitle">Structure is empty</div>
                <div class="emptyHint">Add elements to visualize</div>
            </div>
        `;
    }

    const ds = AppState.structures[structureId];
    if (ds) {
        ds.render(DOM.visualization);
        updateStats();
    }

    AppState.currentStructure = structureId;
    soundEngine.playClick();
}

// ===== Update Operation Options =====
function updateOperationOptions(structureId) {
    const select = DOM.operationSelect;
    select.innerHTML = '';

    const operations = {
        array: [
            { value: 'insert', label: 'Insert' },
            { value: 'insertAt', label: 'Insert At' },
            { value: 'delete', label: 'Delete' },
            { value: 'deleteAt', label: 'Delete At' },
            { value: 'search', label: 'Search' },
            { value: 'update', label: 'Update' }
        ],
        linkedlist: [
            { value: 'insertHead', label: 'Insert Head' },
            { value: 'insertTail', label: 'Insert Tail' },
            { value: 'insertAt', label: 'Insert At' },
            { value: 'deleteHead', label: 'Delete Head' },
            { value: 'deleteTail', label: 'Delete Tail' },
            { value: 'deleteAt', label: 'Delete At' },
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
            { value: 'traverseIn', label: 'Inorder' },
            { value: 'traversePre', label: 'Preorder' },
            { value: 'traversePost', label: 'Postorder' }
        ],
        hashtable: [
            { value: 'insert', label: 'Insert' },
            { value: 'search', label: 'Search' },
            { value: 'delete', label: 'Delete' }
        ],
        graph: [
            { value: 'addNode', label: 'Add Node' },
            { value: 'addEdge', label: 'Add Edge' },
            { value: 'bfs', label: 'BFS' },
            { value: 'dfs', label: 'DFS' }
        ],
        heap: [
            { value: 'insert', label: 'Insert' },
            { value: 'extract', label: 'Extract Max' },
            { value: 'heapify', label: 'Build Heap' }
        ]
    };

    const ops = operations[structureId] || [];
    ops.forEach(op => {
        const opt = document.createElement('option');
        opt.value = op.value;
        opt.textContent = op.label;
        select.appendChild(opt);
    });
}

// ===== Update Operation UI =====
function updateOperationUI() {
    const op = DOM.operationSelect.value;
    const needsIndex = ['insertAt', 'deleteAt', 'update'].includes(op);
    DOM.indexInput.style.display = needsIndex ? 'block' : 'none';

    if (AppState.currentStructure === 'hashtable') {
        DOM.valueInput.placeholder = 'key:value';
    } else if (op === 'addEdge') {
        DOM.valueInput.placeholder = 'A-B';
    } else {
        DOM.valueInput.placeholder = 'Value';
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
    if (!value && !['pop', 'dequeue', 'peek', 'front', 'extract',
                      'traverseIn', 'traversePre', 'traversePost',
                      'bfs', 'dfs', 'heapify', 'deleteHead', 'deleteTail'].includes(operation)) {
        showToast('Enter a value', 'error');
        DOM.valueInput.focus();
        return;
    }

    // Parse edge format (A-B)
    if (operation === 'addEdge') {
        const parts = value.split('-').map(v => v.trim());
        if (parts.length !== 2) {
            showToast('Use format: A-B', 'error');
            return;
        }
        value = parts;
    }

    // Parse hash table key:value
    if (operation === 'insert' && AppState.currentStructure === 'hashtable' && value.includes(':')) {
        const [key, val] = value.split(':').map(v => v.trim());
        if (!key || !val) {
            showToast('Use format: key:value', 'error');
            return;
        }
        value = { key, value: val };
    }

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
        const result = await ds.execute(operation, value, index);

        if (operation === 'search' && result === null) {
            showToast('Not found', 'warning');
        } else if (result !== false && result !== undefined) {
            showToast(typeof result === 'string' ? result : `Done: ${result}`, 'success');
        }

        ds.render(DOM.visualization);
        updateStats();
    } catch (err) {
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

    ds.clear();
    ds.render(DOM.visualization);

    const count = randomInt(5, 7);

    for (let i = 0; i < count; i++) {
        switch (AppState.currentStructure) {
            case 'array': await ds.insert(randomValue()); break;
            case 'linkedlist':
                await (i % 2 === 0 ? ds.insertHead(randomValue()) : ds.insertTail(randomValue()));
                break;
            case 'stack':
            case 'queue':
            case 'heap':
                await ds.insert(randomValue());
                break;
            case 'bst':
                await ds.insert(randomValue());
                break;
            case 'hashtable':
                await ds.insert(`k${i}`, randomValue());
                break;
            case 'graph':
                await ds.addNode(String.fromCharCode(65 + i));
                if (i > 0) await ds.addEdge(String.fromCharCode(64 + i), String.fromCharCode(65 + i));
                break;
        }
    }

    ds.render(DOM.visualization);
    updateStats();
    showToast(`${count} elements added`, 'success');
}

// ===== Clear Structure =====
function clearStructure() {
    if (AppState.isAnimating) return;

    const ds = AppState.structures[AppState.currentStructure];
    if (!ds) return;

    ds.clear();
    ds.render(DOM.visualization);
    updateStats();
    showToast('Cleared', 'success');
    soundEngine.playClick();
}

// ===== Update Stats =====
function updateStats() {
    const ds = AppState.structures[AppState.currentStructure];
    if (!ds) return;

    const size = ds.size ? ds.size() : (ds.data ? ds.data.length : (ds.heap ? ds.heap.length : 0));
    DOM.statSize.textContent = size;
}

// ===== Update Complexity Bars =====
function updateComplexityBars(structureId) {
    const complexity = CONFIG.complexity[structureId];
    if (!complexity || !DOM.compBars) return;

    const color = CONFIG.colors[structureId] || '#00e5ff';

    const ops = [
        { name: 'Acc', value: complexity.accessVal || 0 },
        { name: 'Sea', value: complexity.searchVal || 0 },
        { name: 'Ins', value: complexity.insertVal || 0 },
        { name: 'Del', value: complexity.deleteVal || 0 }
    ];

    DOM.compBars.innerHTML = ops.map(op => `
        <div class="compOp">
            <span class="compName">${op.name}</span>
            <div class="compBar" data-value="${op.value}" style="--bar-color:${color}"></div>
        </div>
    `).join('');

    // Apply color via CSS
    DOM.compBars.querySelectorAll('.compBar').forEach(bar => {
        bar.style.setProperty('--active-color', color);
    });
}

// ===== Show Toast =====
function showToast(message, type = '') {
    const toast = DOM.toast;
    if (!toast) return;

    toast.textContent = message;
    toast.className = '';
    if (type) toast.classList.add(type);

    // Force reflow
    toast.offsetHeight;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Expose globally
window.AppState = AppState;