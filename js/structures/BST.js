/**
 * BST — Binary Search Tree with SVG visualization
 */
class BST {
    constructor() {
        this.root = null;
        this.container = null;
        this.nodeRadius = 22;
        this.levelHeight = 70;
    }

    init() {
        this.root = null;
    }

    size() {
        return this._countNodes(this.root);
    }

    _countNodes(node) {
        if (!node) return 0;
        return 1 + this._countNodes(node.left) + this._countNodes(node.right);
    }

    _createNode(value) {
        return {
            value: parseInt(value) || randomValue(),
            left: null,
            right: null
        };
    }

    async insert(value) {
        const newNode = this._createNode(value);
        if (!this.root) {
            this.root = newNode;
            soundEngine.playGrow();
            await this.animateNodeAppear(newNode, 0, 0);
            return `Inserted ${newNode.value} as root`;
        }

        await this._insertRecursive(this.root, newNode);
        return `Inserted ${newNode.value}`;
    }

    async _insertRecursive(node, newNode) {
        if (newNode.value < node.value) {
            await this.animateComparison(node.value, true);
            if (!node.left) {
                node.left = newNode;
                soundEngine.playInsert(1.3);
                const position = this.getNodePosition(newNode);
                await this.animateNodeAppear(newNode, position.x, position.y);
            } else {
                await this._insertRecursive(node.left, newNode);
            }
        } else {
            await this.animateComparison(node.value, false);
            if (!node.right) {
                node.right = newNode;
                soundEngine.playInsert(1.0);
                const position = this.getNodePosition(newNode);
                await this.animateNodeAppear(newNode, position.x, position.y);
            } else {
                await this._insertRecursive(node.right, newNode);
            }
        }
    }

    async search(value) {
        const target = parseInt(value);
        const result = await this._searchRecursive(this.root, target, 0);
        return result;
    }

    async _searchRecursive(node, target, depth) {
        if (!node) {
            soundEngine.playSearchMiss();
            return null;
        }

        await this.animateNodeSearch(node, depth);
        if (node.value === target) {
            soundEngine.playSearchHit();
            await this.animateNodeFound(node);
            return `Found ${target} at depth ${depth}`;
        }

        const direction = target < node.value ? 'left' : 'right';
        const nextNode = node[direction];
        if (nextNode) {
            return await this._searchRecursive(nextNode, target, depth + 1);
        }

        soundEngine.playSearchMiss();
        return null;
    }

    async delete(value) {
        const target = parseInt(value);
        const existed = this._findNode(this.root, target);
        if (!existed.node) {
            throw new Error(`Value ${target} not found`);
        }

        await this.animateNodeSearch(existed.node, 0);
        this.root = this._deleteNode(this.root, target);
        soundEngine.playDelete();
        return `Deleted ${target}`;
    }

    _findNode(node, value) {
        if (!node) return { node: null, parent: null, direction: null };
        if (node.value === value) return { node, parent: null, direction: null };

        const left = this._findNodeInSubtree(node.left, value, node, 'left');
        if (left.node) return left;

        return this._findNodeInSubtree(node.right, value, node, 'right');
    }

    _findNodeInSubtree(node, value, parent, direction) {
        if (!node) return { node: null, parent, direction };
        if (node.value === value) return { node, parent, direction };
        if (value < node.value) return this._findNodeInSubtree(node.left, value, node, 'left');
        return this._findNodeInSubtree(node.right, value, node, 'right');
    }

    _deleteNode(node, value) {
        if (!node) return null;

        if (value < node.value) {
            node.left = this._deleteNode(node.left, value);
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value);
        } else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            // Node with two children: get inorder successor
            let successor = node.right;
            while (successor.left) successor = successor.left;
            node.value = successor.value;
            node.right = this._deleteNode(node.right, successor.value);
        }
        return node;
    }

    async traverseInorder() {
        const result = [];
        await this._traverseInorder(this.root, result);
        soundEngine.playComplete();
        return `Inorder: ${result.join(' → ')}`;
    }

    async _traverseInorder(node, result) {
        if (!node) return;
        await this._traverseInorder(node.left, result);
        await this.animateNodeSearch(node, 0);
        result.push(node.value);
        await sleep(animator.duration(300));
        await this._traverseInorder(node.right, result);
    }

    async traversePreorder() {
        const result = [];
        await this._traversePreorder(this.root, result);
        soundEngine.playComplete();
        return `Preorder: ${result.join(' → ')}`;
    }

    async _traversePreorder(node, result) {
        if (!node) return;
        await this.animateNodeSearch(node, 0);
        result.push(node.value);
        await sleep(animator.duration(300));
        await this._traversePreorder(node.left, result);
        await this._traversePreorder(node.right, result);
    }

    async traversePostorder() {
        const result = [];
        await this._traversePostorder(this.root, result);
        soundEngine.playComplete();
        return `Postorder: ${result.join(' → ')}`;
    }

    async _traversePostorder(node, result) {
        if (!node) return;
        await this._traversePostorder(node.left, result);
        await this._traversePostorder(node.right, result);
        await this.animateNodeSearch(node, 0);
        result.push(node.value);
        await sleep(animator.duration(300));
    }

    clear() {
        this.root = null;
    }

    getNodePosition(node, parent = null, isLeft = false) {
        const wrapper = this.container;
        if (!wrapper) return { x: 200, y: 60 };

        const rect = wrapper.getBoundingClientRect();
        const width = rect.width || 600;
        const height = rect.height || 400;

        if (!parent) return { x: width / 2, y: 50 };

        const level = this._getLevel(node);
        const siblings = this._countSiblings(parent);
        const siblingIndex = isLeft ? 0 : 1;
        const baseX = parent.x || width / 2;
        const baseY = parent.y || 50;

        const spread = Math.min(width / (level + 1), 200);
        const offset = (siblingIndex - 0.5) * spread;

        return {
            x: baseX + offset,
            y: baseY + this.levelHeight
        };
    }

    _getLevel(node, root = this.root, level = 0) {
        if (!root) return 0;
        if (root === node) return level;
        const leftLevel = this._getLevel(node, root.left, level + 1);
        if (leftLevel) return leftLevel;
        return this._getLevel(node, root.right, level + 1);
    }

    _countSiblings(node) {
        return (node.left ? 1 : 0) + (node.right ? 1 : 0);
    }

    render(container) {
        this.container = container;
        container.innerHTML = '';

        if (!this.root) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5"><div style="font-size:36px">🌳</div><div style="font-size:15px;font-weight:600;color:#8888aa">Tree is empty</div><div style="font-size:12px;color:#55557a">Insert values to grow the tree</div></div>';
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'bst-container';

        // Calculate positions first, track bounds
        const positions = new Map();
        const depth = this._getTreeDepth(this.root);
        const startSpread = Math.min(120 * Math.pow(2, depth), 600);
        const startX = startSpread;
        this._calculatePositions(this.root, null, null, positions, null, startX, 50, startSpread);

        // Compute bounding box from actual node positions
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const pos of positions.values()) {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);
        }

        const padding = this.nodeRadius + 20;
        const viewX = minX - padding;
        const viewY = minY - padding;
        const viewW = (maxX - minX) + padding * 2;
        const viewH = (maxY - minY) + padding * 2;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'bst-svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', `${viewX} ${viewY} ${viewW} ${viewH}`);

        wrapper.appendChild(svg);
        container.appendChild(wrapper);

        // Render edges first
        this._renderEdges(this.root, positions, svg);

        // Render nodes
        this._renderNodes(this.root, positions, svg);
    }

    _getTreeDepth(node) {
        if (!node) return 0;
        return 1 + Math.max(this._getTreeDepth(node.left), this._getTreeDepth(node.right));
    }

    _calculatePositions(node, parent, isLeft, positions, svg, x, y, spread) {
        if (!node) return;

        const pos = { x, y };
        positions.set(node, pos);

        const childSpread = spread / 2;
        const childY = y + this.levelHeight;

        if (node.left) {
            this._calculatePositions(node.left, node, true, positions, svg, x - childSpread, childY, childSpread);
        }
        if (node.right) {
            this._calculatePositions(node.right, node, false, positions, svg, x + childSpread, childY, childSpread);
        }
    }

    _renderEdges(node, positions, svg) {
        if (!node) return;

        const nodePos = positions.get(node);
        if (node.left) {
            const childPos = positions.get(node.left);
            this._createEdge(nodePos.x, nodePos.y, childPos.x, childPos.y, svg, 'left');
            this._renderEdges(node.left, positions, svg);
        }
        if (node.right) {
            const childPos = positions.get(node.right);
            this._createEdge(nodePos.x, nodePos.y, childPos.x, childPos.y, svg, 'right');
            this._renderEdges(node.right, positions, svg);
        }
    }

    _createEdge(x1, y1, x2, y2, svg, direction) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midY = (y1 + y2) / 2;
        const d = `M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`;
        line.setAttribute('d', d);
        line.setAttribute('class', 'bst-edge');
        line.setAttribute('data-direction', direction);
        svg.appendChild(line);
    }

    _renderNodes(node, positions, svg) {
        if (!node) return;

        const pos = positions.get(node);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'bst-node');
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.nodeRadius);
        g.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = node.value;
        text.setAttribute('dy', '0.35em');
        g.appendChild(text);

        svg.appendChild(g);

        this._renderNodes(node.left, positions, svg);
        this._renderNodes(node.right, positions, svg);
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌳</div>
                <p class="empty-title">Tree is empty</p>
                <p class="empty-hint">Insert values to grow the tree</p>
            </div>
        `;
    }

    async animateNodeAppear(node, x, y) {
        const svg = this.container?.querySelector('.bst-svg');
        if (!svg) return;

        this.render(this.container);

        const gElements = svg.querySelectorAll('.bst-node');
        const targetG = Array.from(gElements).find(g => {
            const text = g.querySelector('text');
            return text && text.textContent === String(node.value);
        });

        if (targetG) {
            const circle = targetG.querySelector('circle');
            const text = targetG.querySelector('text');
            if (circle) {
                anime({ targets: circle, attr: { r: [0, this.nodeRadius] }, duration: animator.duration(400), easing: 'easeOutElastic(1, 0.6)' });
            }
            if (text) {
                anime({ targets: text, opacity: [0, 1], duration: animator.duration(300), easing: 'easeOutQuad' });
            }
            await sleep(animator.duration(500));
        }

        const edges = svg.querySelectorAll('.bst-edge');
        if (edges.length > 0) {
            const lastEdge = edges[edges.length - 1];
            const prevEdge = edges.length > 1 ? edges[edges.length - 2] : null;
            [lastEdge, prevEdge].forEach(e => {
                if (e) {
                    const len = e.getTotalLength ? e.getTotalLength() : 100;
                    e.style.strokeDasharray = len;
                    e.style.strokeDashoffset = len;
                    anime({ targets: e, strokeDashoffset: [len, 0], opacity: [0, 1], duration: animator.duration(500), easing: 'easeOutQuad' });
                }
            });
        }
    }

    async animateComparison(value, goingLeft) {
        await sleep(animator.duration(300));
    }

    async animateNodeSearch(node, depth) {
        const svg = this.container?.querySelector('.bst-svg');
        if (!svg) return;

        const gElements = svg.querySelectorAll('.bst-node');
        gElements.forEach(g => {
            const circle = g.querySelector('circle');
            if (circle) {
                anime({ targets: circle, attr: { r: this.nodeRadius }, stroke: 'var(--active-color)', duration: 50 });
            }
        });

        const targetG = Array.from(gElements).find(g => {
            const text = g.querySelector('text');
            return text && text.textContent === String(node.value);
        });

        if (targetG) {
            const circle = targetG.querySelector('circle');
            if (circle) {
                const origColor = getComputedStyle(circle).stroke || 'var(--active-color)';
                anime({ targets: circle, attr: { r: this.nodeRadius + 4 }, stroke: 'var(--warning)', duration: animator.duration(200), easing: 'easeOutQuad' });
                await sleep(animator.duration(50));
                anime({ targets: circle, attr: { r: this.nodeRadius }, stroke: 'var(--active-color)', duration: animator.duration(200), easing: 'easeOutQuad' });
            }
            soundEngine.playStep(1.0 + depth * 0.1);
            await sleep(animator.duration(350));
        }
    }

    async animateNodeFound(node) {
        const svg = this.container?.querySelector('.bst-svg');
        if (!svg) return;

        const targetG = Array.from(svg.querySelectorAll('.bst-node')).find(g => {
            const text = g.querySelector('text');
            return text && text.textContent === String(node.value);
        });

        if (targetG) {
            const circle = targetG.querySelector('circle');
            if (circle) {
                await anime({ targets: circle, attr: { r: [this.nodeRadius, this.nodeRadius + 6, this.nodeRadius] }, fill: 'rgba(0,255,136,0.25)', stroke: 'var(--success)', duration: animator.duration(800), easing: 'easeOutElastic(1, 0.5)' }).finished;
                anime({ targets: circle, fill: 'var(--bg-tertiary)', stroke: 'var(--active-color)', duration: animator.duration(300), easing: 'easeOutQuad' });
            }
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'insert': return await this.insert(value);
            case 'search': return await this.search(value);
            case 'delete': return await this.delete(value);
            case 'traverseIn': return await this.traverseInorder();
            case 'traversePre': return await this.traversePreorder();
            case 'traversePost': return await this.traversePostorder();
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}