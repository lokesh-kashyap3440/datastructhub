/**
 * DataStructHub — Mobile-First App (v3 — diagnostic build)
 * Linear layout: topBar → canvas → controls → tabBar
 * DIAGNOSTIC MODE: Heavy console logging on every operation.
 */

window.__DSHUB_VERSION = '3.0.0-diagnostic';

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
window.addEventListener('DOMContentLoaded', () => {
    console.log('[DSHub] DOMContentLoaded fired');
    initDOMReferences();
    initEventListeners();
    initStructures();
    switchStructure('array');

    document.addEventListener('click', () => {
        soundEngine.init();
    }, { once: true });

    // Global test helpers
    window.__test = async function(msg) {
        console.log('[DSHub] === TEST: ' + msg + ' ===');
        const ds = AppState.structures[AppState.currentStructure];
        console.log('[DSHub] current DS:', AppState.currentStructure);
        console.log('[DSHub] ds object:', ds);
        console.log('[DSHub] ds.data/items/heap:', ds.data || ds.items || ds.heap || 'N/A');
        if (ds && ds.size) console.log('[DSHub] ds.size():', ds.size());
    };

    window.__testStack = async function() {
        console.log('[DSHub] === DIRECT STACK TEST ===');
        const ds = AppState.structures.stack;
        console.log('[DSHub] stack instance:', ds);
        console.log('[DSHub] stack.push:', typeof ds.push);
        console.log('[DSHub] stack.items BEFORE:', ds.items.slice());
        try {
            const r = await ds.push(77);
            console.log('[DSHub] push(77) returned:', r);
            console.log('[DSHub] stack.items AFTER:', ds.items.slice());
            console.log('[DSHub] calling render...');
            ds.render(DOM.visualization);
            console.log('[DSHub] render done');
        } catch(e) {
            console.error('[DSHub] ERROR:', e);
        }
    };

    window.__testLinkedList = async function() {
        console.log('[DSHub] === DIRECT LINKED LIST TEST ===');
        const ds = AppState.structures.linkedlist;
        console.log('[DSHub] ll instance:', ds);
        console.log('[DSHub] ll.insertHead:', typeof ds.insertHead);
        console.log('[DSHub] ll.size BEFORE:', ds.size());
        try {
            const r = await ds.insertHead(55);
            console.log('[DSHub] insertHead(55) returned:', r);
            console.log('[DSHub] ll.size AFTER:', ds.size());
            ds.render(DOM.visualization);
        } catch(e) {
            console.error('[DSHub] ERROR:', e);
        }
    };

    window.__getState = function() {
        const ds = AppState.structures[AppState.currentStructure];
        return {
            currentStructure: AppState.currentStructure,
            isAnimating: AppState.isAnimating,
            dsExists: !!ds,
            dsSize: ds ? (ds.size ? ds.size() : (ds.data || ds.items || ds.heap || 'N/A')) : 'N/A',
            btnDisabled: DOM.executeBtn?.disabled
        };
    };
});

// ===== Initialize DOM References =====
function initDOMReferences() {
    console.log('[DSHub] initDOMReferences called');

    DOM.tabBar = document.getElementById('tabBar');
    DOM.structureTitle = document.getElementById('structureTitle');
    DOM.statSize = document.getElementById('statSize');
    DOM.statCapacity = document.getElementById('statCapacity');
    DOM.visualization = document.getElementById('visualization');
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


    // Verify all elements exist
    const missing = [];
    ['tabBar','structureTitle','statSize','visualization',
     'valueInput','operationSelect','executeBtn','randomBtn',
     'clearBtn','soundBtn','toast'].forEach(id => {
        if (!DOM[id]) missing.push(id);
    });

    if (missing.length > 0) {
        console.error('[DSHub] MISSING DOM elements:', missing);
        alert('[DSHub] Missing elements: ' + missing.join(', '));
    } else {
        console.log('[DSHub] All DOM elements found');
    }
}

// ===== Initialize Event Listeners =====
function initEventListeners() {
    console.log('[DSHub] initEventListeners called');

    // Tab bar navigation
    DOM.tabBar.addEventListener('click', (e) => {
        const tab = e.target.closest('.nav-item');
        if (tab) {
            const structId = tab.dataset.structure;
            console.log('[DSHub] Tab clicked:', structId);
            switchStructure(structId);
        }
    });

    // Operation select change
    DOM.operationSelect.addEventListener('change', () => {
        console.log('[DSHub] Operation select changed to:', DOM.operationSelect.value);
        updateOperationUI();
    });

    // Execute button
    DOM.executeBtn.addEventListener('click', () => {
        console.log('[DSHub] Execute button click received');
        executeOperation();
    });

    // Randomize button
    DOM.randomBtn.addEventListener('click', () => {
        console.log('[DSHub] Random button click received');
        randomizeStructure();
    });

    // Clear button
    DOM.clearBtn.addEventListener('click', () => {
        console.log('[DSHub] Clear button click received');
        clearStructure();
    });

    // Sound toggle
    DOM.soundBtn.addEventListener('click', () => {
        AppState.soundEnabled = soundEngine.toggle();
        DOM.soundBtn.textContent = AppState.soundEnabled ? '🔊' : '🔇';
        DOM.soundBtn.classList.toggle('muted', !AppState.soundEnabled);
        soundEngine.playToggle();
    });

    // Enter key
    DOM.valueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('[DSHub] Enter key pressed');
            executeOperation();
        }
    });
    DOM.indexInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeOperation();
    });

    console.log('[DSHub] Event listeners attached');
}

// ===== Initialize Data Structures =====
function initStructures() {
    console.log('[DSHub] initStructures called — creating all DS instances');

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

    // Verify all have required methods
    const requiredMethods = ['init', 'size', 'render', 'execute', 'clear'];
    Object.entries(AppState.structures).forEach(([name, ds]) => {
        console.log(`[DSHub] ${name}:`, {
            type: typeof ds,
            hasInit: typeof ds.init === 'function',
            hasSize: typeof ds.size === 'function',
            hasRender: typeof ds.render === 'function',
            hasExecute: typeof ds.execute === 'function',
            hasClear: typeof ds.clear === 'function',
        });
        ds.init();
    });

    console.log('[DSHub] All structures initialized');
    console.log('[DSHub] stack.items:', AppState.structures.stack.items);
}

// ===== Switch Structure =====
function switchStructure(structureId) {
    console.log('[DSHub] switchStructure:', structureId);

    if (AppState.isAnimating) {
        anime.remove('*');
        AppState.isAnimating = false;
        DOM.executeBtn.disabled = false;
        DOM.randomBtn.disabled = false;
        DOM.clearBtn.disabled = false;
    }

    // Update tab active state
    document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`[data-structure="${structureId}"]`);
    if (activeTab) activeTab.classList.add('active');

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

    // Clear and render with fade transition
    anime({ targets: DOM.visualization, opacity: [1, 0], duration: 150, easing: 'easeOutQuad', complete: () => {
        DOM.visualization.innerHTML = '';
        const ds = AppState.structures[structureId];
        if (ds) {
            ds.render(DOM.visualization);
            updateStats();
        }
        anime({ targets: DOM.visualization, opacity: [0, 1], duration: 200, easing: 'easeOutQuad' });
    }});

    AppState.currentStructure = structureId;
    console.log('[DSHub] switchStructure complete');
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
            { value: 'removeNode', label: 'Remove Node' },
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

    console.log('[DSHub] Updated operation options for', structureId, ':', ops.map(o => o.value));
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
    console.log('[DSHub] executeOperation START');
    console.log('[DSHub] isAnimating:', AppState.isAnimating);

    if (AppState.isAnimating) {
        showToast('Animation in progress...', 'warning');
        console.log('[DSHub] Aborted — still animating');
        return;
    }

    const operation = DOM.operationSelect.value;
    let value = DOM.valueInput.value.trim();
    const index = parseInt(DOM.indexInput.value) || 0;

    console.log('[DSHub] operation:', operation, '| value:', value, '| index:', index);
    console.log('[DSHub] currentStructure:', AppState.currentStructure);

    // No-value operations that don't need input
    const noValueOps = ['pop', 'dequeue', 'peek', 'front', 'extract',
                        'traverseIn', 'traversePre', 'traversePost',
                        'bfs', 'dfs', 'heapify', 'deleteHead', 'deleteTail'];

    if (!value && !noValueOps.includes(operation)) {
        console.log('[DSHub] No value provided');
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

    // Get the DS
    const ds = AppState.structures[AppState.currentStructure];
    console.log('[DSHub] ds object:', ds);
    console.log('[DSHub] typeof ds:', typeof ds);
    console.log('[DSHub] typeof ds.execute:', ds ? typeof ds.execute : 'N/A');

    if (!ds) {
        console.error('[DSHub] FATAL: ds is undefined for', AppState.currentStructure);
        showToast('Error: Structure not found', 'error');
        return;
    }

    AppState.isAnimating = true;
    DOM.executeBtn.disabled = true;
    DOM.randomBtn.disabled = true;
    DOM.clearBtn.disabled = true;
    console.log('[DSHub] UI locked');

    try {
        console.log('[DSHub] Calling ds.execute...');
        const sizeVal = typeof ds.size === 'function' ? ds.size() : (ds.data?.length ?? ds.items?.length ?? ds.heap?.length ?? '?');
        console.log('[DSHub] ds.before state:', JSON.stringify(ds.data || ds.items || ds.heap || sizeVal));

        const result = await ds.execute(operation, value, index);

        const sizeAfter = typeof ds.size === 'function' ? ds.size() : (ds.data?.length ?? ds.items?.length ?? ds.heap?.length ?? '?');
        console.log('[DSHub] ds.execute returned:', result);
        console.log('[DSHub] ds.after state:', JSON.stringify(ds.data || ds.items || ds.heap || sizeAfter));

        if (operation === 'search' && result === null) {
            showToast('Not found', 'warning');
        } else if (result !== false && result !== undefined) {
            showToast(typeof result === 'string' ? result : `Done: ${result}`, 'success');
        }

        console.log('[DSHub] Rendering...');
        console.log('[DSHub] container:', DOM.visualization);

        DOM.visualization.innerHTML = '';
        ds.render(DOM.visualization);

        console.log('[DSHub] Container innerHTML after render:', DOM.visualization.innerHTML.substring(0, 200));

        updateStats();

    } catch (err) {
        console.error('[DSHub] Execute ERROR:', err);
        console.error('[DSHub] Error stack:', err.stack);
        showToast(err.message || 'Operation failed', 'error');
        soundEngine.playError();
    }

    AppState.isAnimating = false;
    DOM.executeBtn.disabled = false;
    DOM.randomBtn.disabled = false;
    DOM.clearBtn.disabled = false;
    console.log('[DSHub] UI unlocked');
    DOM.valueInput.value = '';
    DOM.valueInput.focus();
    console.log('[DSHub] executeOperation END');
}

// ===== Randomize Structure =====
async function randomizeStructure() {
    if (AppState.isAnimating) return;

    console.log('[DSHub] randomizeStructure called for:', AppState.currentStructure);
    soundEngine.playRandomize();

    const ds = AppState.structures[AppState.currentStructure];
    if (!ds) return;

    ds.clear();
    ds.render(DOM.visualization);

    const count = randomInt(5, 7);
    console.log('[DSHub] Randomizing with', count, 'elements');

    for (let i = 0; i < count; i++) {
        try {
            switch (AppState.currentStructure) {
                case 'array': await ds.insert(randomValue()); break;
                case 'linkedlist':
                    await (i % 2 === 0 ? ds.insertHead(randomValue()) : ds.insertTail(randomValue()));
                    break;
                case 'stack':
                    await ds.push(randomValue());
                    break;
                case 'queue':
                    await ds.enqueue(randomValue());
                    break;
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
        } catch(e) {
            console.error('[DSHub] randomize element', i, 'error:', e);
        }
    }

    console.log('[DSHub] Randomize complete, size:', (typeof ds.size === 'function') ? ds.size() : (ds.size ?? 'N/A'));
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

    const size = (typeof ds.size === 'function') ? ds.size() : (ds.size ?? (ds.data?.length ?? (ds.items?.length ?? (ds.heap?.length ?? 0))));

    DOM.statSize.textContent = size;
    anime({ targets: DOM.statSize, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, 0.5)' });
    console.log('[DSHub] stats updated — size:', size);
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

    DOM.compBars.innerHTML = ops.map(op => {
        const barWidth = Math.min(Math.max(op.value / 5 * 100, 0), 95);
        return `
            <div class="compOp">
                <span class="compName">${op.name}</span>
                <div class="compBar" data-value="${op.value}" style="--bar-color:${color}; --bar-w:${barWidth}"></div>
            </div>
        `;
    }).join('');

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

    toast.offsetHeight; // Force reflow
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Expose globally
window.AppState = AppState;