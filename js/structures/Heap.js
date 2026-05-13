/**
 * Heap — Max Heap with SVG visualization
 */
class Heap {
    constructor() {
        this.heap = [];
        this.container = null;
        this.nodeRadius = 18;
        this.levelHeight = 60;
    }

    init() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    // Parent index
    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    // Left child index
    leftChild(i) {
        return 2 * i + 1;
    }

    // Right child index
    rightChild(i) {
        return 2 * i + 2;
    }

    async insert(value) {
        const numValue = parseInt(value) || randomValue();
        this.heap.push(numValue);

        // Bubble up
        await this.bubbleUp(this.heap.length - 1);

        soundEngine.playGrow();
        return `Inserted ${numValue}`;
    }

    async bubbleUp(index) {
        while (index > 0) {
            const parentIdx = this.parent(index);
            if (this.heap[parentIdx] >= this.heap[index]) break;

            // Highlight both
            await this.animateSwapHighlight(parentIdx, index);

            // Swap
            [this.heap[parentIdx], this.heap[index]] = [this.heap[index], this.heap[parentIdx]];
            await this.animateSwap(parentIdx, index);

            index = parentIdx;
        }
    }

    async extract() {
        if (this.isEmpty()) {
            throw new Error('Heap is empty');
        }

        const max = this.heap[0];
        const last = this.heap.pop();

        if (!this.isEmpty()) {
            this.heap[0] = last;
            await this.bubbleDown(0);
        }

        soundEngine.playPop();
        return `Extracted max: ${max}`;
    }

    async bubbleDown(index) {
        const length = this.heap.length;

        while (true) {
            const leftIdx = this.leftChild(index);
            const rightIdx = this.rightChild(index);
            let largest = index;

            if (leftIdx < length && this.heap[leftIdx] > this.heap[largest]) {
                largest = leftIdx;
            }
            if (rightIdx < length && this.heap[rightIdx] > this.heap[largest]) {
                largest = rightIdx;
            }

            if (largest === index) break;

            await this.animateSwapHighlight(index, largest);
            [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
            await this.animateSwap(index, largest);

            index = largest;
        }
    }

    async heapify() {
        // Build max heap from existing array
        const startIdx = this.parent(this.heap.length - 1);

        for (let i = startIdx; i >= 0; i--) {
            await this.bubbleDown(i);
        }

        soundEngine.playComplete();
        return 'Heap built';
    }

    clear() {
        this.heap = [];
    }

    render(container) {
        this.container = container;
        container.innerHTML = '';


        if (this.heap.length === 0) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5"><div style="font-size:36px">🏔️</div><div style="font-size:15px;font-weight:600;color:#8888aa">Heap is empty</div><div style="font-size:12px;color:#55557a">Insert values to build the heap</div></div>';
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'heap-container';

        // Calculate layout
        const levels = Math.ceil(Math.log2(this.heap.length + 1));
        const width = 600;
        const height = levels * this.levelHeight + 40;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'heap-svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Calculate positions for each node
        const positions = [];
        this.heap.forEach((value, index) => {
            const level = Math.floor(Math.log2(index + 1));
            const levelStart = Math.pow(2, level) - 1;
            const positionInLevel = index - levelStart;
            const nodesInLevel = Math.pow(2, level);

            const xSpacing = width / (nodesInLevel + 1);
            const x = xSpacing * (positionInLevel + 1);
            const y = level * this.levelHeight + 40;

            positions.push({ x, y });
        });

        // Draw edges first
        this.heap.forEach((_, index) => {
            const leftIdx = this.leftChild(index);
            const rightIdx = this.rightChild(index);

            if (leftIdx < this.heap.length) {
                this._drawEdge(svg, positions[index], positions[leftIdx]);
            }
            if (rightIdx < this.heap.length) {
                this._drawEdge(svg, positions[index], positions[rightIdx]);
            }
        });

        // Draw nodes
        this.heap.forEach((value, index) => {
            this._drawNode(svg, value, positions[index], index);
        });

        wrapper.appendChild(svg);
        container.appendChild(wrapper);
    }

    _drawEdge(svg, from, to) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x);
        line.setAttribute('y1', from.y);
        line.setAttribute('x2', to.x);
        line.setAttribute('y2', to.y);
        line.setAttribute('class', 'heap-edge');
        svg.appendChild(line);
    }

    _drawNode(svg, value, pos, index) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'heap-node');
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        g.setAttribute('data-index', index);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.nodeRadius);
        g.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', '0.35em');
        text.textContent = value;
        g.appendChild(text);

        svg.appendChild(g);
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏔️</div>
                <p class="empty-title">Heap is empty</p>
                <p class="empty-hint">Insert values to build the heap</p>
            </div>
        `;
    }

    async animateSwapHighlight(i, j) {
        const nodes = this.container?.querySelectorAll('.heap-node');
        if (!nodes || !nodes[i] || !nodes[j]) return;

        const circleI = nodes[i].querySelector('circle');
        const circleJ = nodes[j].querySelector('circle');
        if (circleI) {
            anime({ targets: circleI, attr: { r: [this.nodeRadius, this.nodeRadius + 4, this.nodeRadius] }, fill: 'rgba(255,214,0,0.2)', stroke: 'var(--warning)', duration: animator.duration(300), easing: 'easeInOutQuad' });
        }
        if (circleJ) {
            anime({ targets: circleJ, attr: { r: [this.nodeRadius, this.nodeRadius + 4, this.nodeRadius] }, fill: 'rgba(255,214,0,0.2)', stroke: 'var(--warning)', duration: animator.duration(300), easing: 'easeInOutQuad' });
        }

        nodes[i].classList.add('highlight');
        nodes[j].classList.add('highlight');
        soundEngine.playStep(1.0 + i * 0.05);
        await sleep(animator.duration(400));
        nodes[i].classList.remove('highlight');
        nodes[j].classList.remove('highlight');

        if (circleI) {
            anime({ targets: circleI, fill: 'var(--bg-tertiary)', stroke: 'var(--active-color)', duration: animator.duration(200) });
        }
        if (circleJ) {
            anime({ targets: circleJ, fill: 'var(--bg-tertiary)', stroke: 'var(--active-color)', duration: animator.duration(200) });
        }
    }

    async animateSwap(i, j) {
        const svg = this.container?.querySelector('.heap-svg');
        if (!svg) return;

        const nodeI = svg.querySelector(`[data-index="${i}"]`);
        const nodeJ = svg.querySelector(`[data-index="${j}"]`);

        if (nodeI && nodeJ) {
            const transformI = nodeI.getAttribute('transform');
            const transformJ = nodeJ.getAttribute('transform');

            // Extract x,y coordinates
            const parseXY = (t) => {
                const match = t.match(/translate\(([\d.]+),\s*([\d.]+)\)/);
                return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : null;
            };

            const posI = parseXY(transformI);
            const posJ = parseXY(transformJ);

            if (posI && posJ) {
                // Animate movement
                anime({ targets: nodeI, translateX: [posI.x, posJ.x], translateY: [posI.y, posJ.y], duration: animator.duration(400), easing: 'easeInOutQuad' });
                anime({ targets: nodeJ, translateX: [posJ.x, posI.x], translateY: [posJ.y, posI.y], duration: animator.duration(400), easing: 'easeInOutQuad' });
                await sleep(animator.duration(50));
            }

            nodeI.setAttribute('transform', transformJ);
            nodeJ.setAttribute('transform', transformI);
            nodeI.setAttribute('data-index', j);
            nodeJ.setAttribute('data-index', i);

            await sleep(animator.duration(450));
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'insert': return await this.insert(value);
            case 'extract': return await this.extract();
            case 'heapify': return await this.heapify();
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}