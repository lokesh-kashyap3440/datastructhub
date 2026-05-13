export const CONFIG = {
  colors: {
    array: '#00e5ff',
    linkedlist: '#ff0080',
    stack: '#ff6b00',
    queue: '#ffd600',
    bst: '#00ff88',
    hashtable: '#9b59ff',
    graph: '#ff3d71',
    heap: '#14f195'
  },
  sounds: {
    insert: 'playInsert',
    delete: 'playDelete',
    searchHit: 'playSearchHit',
    searchMiss: 'playSearchMiss',
    push: 'playPush',
    pop: 'playPop',
    grow: 'playGrow',
    step: 'playStep',
    complete: 'playComplete',
    error: 'playError',
    click: 'playClick',
    toggle: 'playToggle',
    randomize: 'playRandomize'
  },
  durations: {
    nodeAppear: 400,
    nodeRemove: 350,
    highlight: 400,
    move: 500,
    fade: 300,
    stagger: 60,
    count: 600,
    step: 800
  },
  capacities: {
    array: 12,
    linkedlist: 20,
    stack: 12,
    queue: 12,
    bst: 31,
    hashtable: 8,
    graph: 10,
    heap: 15
  },
  complexity: {
    array: { access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)', space: 'O(n)', accessVal: 1, searchVal: 3, insertVal: 3, deleteVal: 3 },
    linkedlist: { access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', accessVal: 3, searchVal: 3, insertVal: 1, deleteVal: 1 },
    stack: { access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', accessVal: 3, searchVal: 3, insertVal: 1, deleteVal: 1 },
    queue: { access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', accessVal: 3, searchVal: 3, insertVal: 1, deleteVal: 1 },
    bst: { access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)', accessVal: 2, searchVal: 2, insertVal: 2, deleteVal: 2 },
    hashtable: { access: '—', search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', accessVal: 0, searchVal: 1, insertVal: 1, deleteVal: 1 },
    graph: { access: '—', search: 'O(V+E)', insert: 'O(1)', delete: 'O(V+E)', space: 'O(V+E)', accessVal: 0, searchVal: 3.5, insertVal: 1, deleteVal: 4 },
    heap: { access: '—', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)', accessVal: 0, searchVal: 3, insertVal: 2, deleteVal: 2 }
  },
  structures: {
    array: { name: 'Array', desc: 'A linear collection of elements indexed by integers', maxCapacity: 12 },
    linkedlist: { name: 'Linked List', desc: 'Elements connected by pointers in sequence', maxCapacity: 20 },
    stack: { name: 'Stack', desc: 'LIFO — Last In, First Out', maxCapacity: 12 },
    queue: { name: 'Queue', desc: 'FIFO — First In, First Out', maxCapacity: 12 },
    bst: { name: 'Binary Search Tree', desc: 'Hierarchical structure with left/right child nodes', maxCapacity: 31 },
    hashtable: { name: 'Hash Table', desc: 'Key-value pairs mapped via hash function', maxCapacity: 8 },
    graph: { name: 'Graph', desc: 'Nodes connected by edges in any pattern', maxCapacity: 10 },
    heap: { name: 'Heap', desc: 'Complete binary tree where parent >= child (max-heap)', maxCapacity: 15 }
  }
}
