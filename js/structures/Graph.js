/**
 * Graph — Adjacency list with SVG visualization and BFS/DFS
 */
class Graph {
    constructor() {
        this.nodes = new Map(); // nodeId -> { neighbors: [], position: {x, y} }
        this.edges = []; // [{ from, to }]
        this.container = null;
        this.nodeRadius = 20;
        this.positions = new Map();
    }

    init() {
        this.nodes = new Map();
        this.edges = [];
        this.positions = new Map();
    }

    size() {
        return this.nodes.size;
    }

    isEmpty() {
        return this.nodes.size === 0;
    }

    _getRandomPosition(existingPositions) {
        const width = 600;
        const height = 350;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 50;

        let x, y;
        let attempts = 0;
        const minDistance = 70;

        do {
            const angle = Math.random() * 2 * Math.PI;
            const dist = Math.random() * radius;
            x = centerX + Math.cos(angle) * dist;
            y = centerY + Math.sin(angle) * dist;
            attempts++;
        } while (this._isTooClose(x, y, existingPositions, minDistance) && attempts < 50);

        return { x, y };
    }

    _isTooClose(x, y, positions, minDist) {
        for (const pos of positions.values()) {
            const dx = pos.x - x;
            const dy = pos.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < minDist) return true;
        }
        return false;
    }

    async addNode(nodeId) {
        const id = String(nodeId).toUpperCase().charAt(0);
        if (this.nodes.has(id)) {
            throw new Error(`Node "${id}" already exists`);
        }
        if (this.nodes.size >= 10) {
            throw new Error('Graph is full (max 10 nodes)');
        }

        const pos = this._getRandomPosition(this.positions);
        this.positions.set(id, pos);
        this.nodes.set(id, { neighbors: [] });

        soundEngine.playGrow();
        await this.animateNodeAppear(id, pos.x, pos.y);
        return `Added node ${id}`;
    }

    async addEdge(from, to) {
        const fromId = String(from).toUpperCase().charAt(0);
        const toId = String(to).toUpperCase().charAt(0);

        if (!this.nodes.has(fromId)) {
            throw new Error(`Node "${fromId}" not found`);
        }
        if (!this.nodes.has(toId)) {
            throw new Error(`Node "${toId}" not found`);
        }
        if (fromId === toId) {
            throw new Error('Cannot add self-loop');
        }

        // Check if edge exists
        const exists = this.edges.some(e =>
            (e.from === fromId && e.to === toId) ||
            (e.from === toId && e.to === fromId)
        );
        if (exists) {
            throw new Error(`Edge ${fromId}-${toId} already exists`);
        }

        this.edges.push({ from: fromId, to: toId });
        this.nodes.get(fromId).neighbors.push(toId);
        this.nodes.get(toId).neighbors.push(fromId);

        soundEngine.playInsert(1.2);
        await this.animateEdgeAppear(fromId, toId);
        return `Added edge ${fromId} → ${toId}`;
    }

    async removeNode(nodeId) {
        const id = String(nodeId).toUpperCase().charAt(0);
        if (!this.nodes.has(id)) {
            throw new Error(`Node "${id}" not found`);
        }

        // Remove edges
        this.edges = this.edges.filter(e => e.from !== id && e.to !== id);

        // Remove from neighbors
        for (const [nodeId, node] of this.nodes) {
            node.neighbors = node.neighbors.filter(n => n !== id);
        }

        this.nodes.delete(id);
        this.positions.delete(id);

        soundEngine.playDelete();
        await this.animateNodeRemove(id);
        return `Removed node ${id}`;
    }

    async bfs(startNode) {
        const start = String(startNode).toUpperCase().charAt(0);
        if (!this.nodes.has(start)) {
            throw new Error(`Node "${start}" not found`);
        }

        const visited = new Set();
        const queue = [start];
        const order = [];
        visited.add(start);

        this.render(this.container);
        await sleep(animator.duration(300));

        while (queue.length > 0) {
            const current = queue.shift();
            order.push(current);

            // Highlight current node
            await this.animateNodeVisit(current, 'current');

            const neighbors = this.nodes.get(current).neighbors;
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    await this.animateEdgeVisit(current, neighbor);
                    await this.animateNodeVisit(neighbor, 'visited');
                }
            }
        }

        soundEngine.playComplete();
        return `BFS: ${order.join(' → ')}`;
    }

    async dfs(startNode) {
        const start = String(startNode).toUpperCase().charAt(0);
        if (!this.nodes.has(start)) {
            throw new Error(`Node "${start}" not found`);
        }

        const visited = new Set();
        const order = [];

        this.render(this.container);
        await sleep(animator.duration(300));

        const dfsRecursive = async (node) => {
            if (visited.has(node)) return;
            visited.add(node);
            order.push(node);

            await this.animateNodeVisit(node, 'current');

            const neighbors = this.nodes.get(node).neighbors;
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    await this.animateEdgeVisit(node, neighbor);
                    await dfsRecursive(neighbor);
                }
            }
        };

        await dfsRecursive(start);

        soundEngine.playComplete();
        return `DFS: ${order.join(' → ')}`;
    }

    clear() {
        this.nodes.clear();
        this.edges = [];
        this.positions.clear();
    }

    render(container) {
        this.container = container;
        container.innerHTML = '';

        if (this.nodes.size === 0) {
            this.showEmptyState(container);
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'graph-container';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'graph-svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 600 350');

        wrapper.appendChild(svg);
        container.appendChild(wrapper);

        // Render edges
        this.edges.forEach(edge => {
            const fromPos = this.positions.get(edge.from);
            const toPos = this.positions.get(edge.to);
            if (fromPos && toPos) {
                this._createEdge(svg, fromPos.x, fromPos.y, toPos.x, toPos.y, edge.from, edge.to);
            }
        });

        // Render nodes
        this.nodes.forEach((_, nodeId) => {
            const pos = this.positions.get(nodeId);
            if (pos) {
                this._createNode(svg, nodeId, pos.x, pos.y);
            }
        });
    }

    _createEdge(svg, x1, y1, x2, y2, fromId, toId) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'graph-edge');
        line.setAttribute('data-from', fromId);
        line.setAttribute('data-to', toId);
        svg.appendChild(line);
    }

    _createNode(svg, nodeId, x, y) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'graph-node');
        g.setAttribute('transform', `translate(${x}, ${y})`);
        g.setAttribute('data-id', nodeId);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.nodeRadius);
        g.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', '0.35em');
        text.textContent = nodeId;
        g.appendChild(text);

        svg.appendChild(g);
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔵</div>
                <p class="empty-title">Graph is empty</p>
                <p class="empty-hint">Add nodes and connect them with edges</p>
            </div>
        `;
    }

    async animateNodeAppear(nodeId, x, y) {
        this.render(this.container);
        const node = this.container?.querySelector(`[data-id="${nodeId}"]`);
        if (node) {
            node.style.transform = 'scale(0)';
            node.style.opacity = '0';
            await sleep(50);
            animator.appear(node);
            await sleep(animator.duration(500));
        }
    }

    async animateNodeRemove(nodeId) {
        const node = this.container?.querySelector(`[data-id="${nodeId}"]`);
        if (node) {
            node.style.transform = 'scale(0)';
            node.style.opacity = '0';
            await sleep(animator.duration(400));
            this.render(this.container);
        }
    }

    async animateEdgeAppear(fromId, toId) {
        this.render(this.container);
        const edge = this.container?.querySelector(
            `[data-from="${fromId}"][data-to="${toId}"], [data-from="${toId}"][data-to="${fromId}"]`
        );
        if (edge) {
            const length = edge.getTotalLength?.() || 100;
            edge.style.strokeDasharray = length;
            edge.style.strokeDashoffset = length;
            edge.style.transition = `stroke-dashoffset ${animator.duration(500)}ms ease`;
            await sleep(50);
            edge.style.strokeDashoffset = '0';
            await sleep(animator.duration(500));
        }
    }

    async animateNodeVisit(nodeId, state) {
        const node = this.container?.querySelector(`[data-id="${nodeId}"]`);
        if (node) {
            // Remove previous state classes
            node.classList.remove('visited', 'current', 'path');
            node.classList.add(state);

            if (state === 'current') {
                soundEngine.playStep(1.0 + Math.random() * 0.3);
            }

            await sleep(animator.duration(600));

            if (state === 'current') {
                node.classList.remove('current');
                node.classList.add('visited');
            }
        }
    }

    async animateEdgeVisit(fromId, toId) {
        const edge = this.container?.querySelector(
            `[data-from="${fromId}"][data-to="${toId}"], [data-from="${toId}"][data-to="${fromId}"]`
        );
        if (edge) {
            edge.classList.add('visited');
            await sleep(animator.duration(200));
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'addNode': return await this.addNode(value);
            case 'addEdge':
                if (Array.isArray(value) && value.length === 2) {
                    return await this.addEdge(value[0], value[1]);
                }
                throw new Error('Use format: from-to (e.g., A-B)');
            case 'removeNode': return await this.removeNode(value);
            case 'bfs': return await this.bfs(value || 'A');
            case 'dfs': return await this.dfs(value || 'A');
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}