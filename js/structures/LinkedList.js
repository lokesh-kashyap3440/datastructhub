/**
 * LinkedList — Singly Linked List with visualization
 */
class LinkedList {
    constructor() {
        this.head = null;
        this._count = 0;
        this.container = null;
    }

    init() {
        this.head = null;
        this._count = 0;
    }

    size() {
        return this._count;
    }

    isEmpty() {
        return this._count === 0;
    }

    // Create a new node
    createNode(value) {
        return {
            value: parseInt(value) || randomValue(),
            next: null
        };
    }

    async insertHead(value) {
        if (this._count >= 20) {
            throw new Error('List is full');
        }
        const newNode = this.createNode(value);
        newNode.next = this.head;
        this.head = newNode;
        this._count++;

        soundEngine.playInsert(1.5);
        await this.animateInsertHead();
        return `Inserted ${newNode.value} at head`;
    }

    async insertTail(value) {
        if (this._count >= 20) {
            throw new Error('List is full');
        }
        const newNode = this.createNode(value);

        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this._count++;

        soundEngine.playInsert(1.0);
        await this.animateInsertTail();
        return `Inserted ${newNode.value} at tail`;
    }

    async insertAt(value, index) {
        if (index < 0 || index > this._count) {
            throw new Error('Invalid index');
        }
        if (index === 0) return await this.insertHead(value);
        if (index === this._count) return await this.insertTail(value);

        const newNode = this.createNode(value);
        let current = this.head;
        for (let i = 0; i < index - 1; i++) {
            current = current.next;
        }
        newNode.next = current.next;
        current.next = newNode;
        this._count++;

        soundEngine.playInsert(1.2);
        await this.animateInsertAt(index);
        return `Inserted ${newNode.value} at index ${index}`;
    }

    async deleteHead() {
        if (!this.head) {
            throw new Error('List is empty');
        }
        const value = this.head.value;
        soundEngine.playDelete();
        await this.animateDeleteHead();
        this.head = this.head.next;
        this._count--;
        return `Deleted head: ${value}`;
    }

    async deleteTail() {
        if (!this.head) {
            throw new Error('List is empty');
        }
        if (!this.head.next) {
            return await this.deleteHead();
        }

        let current = this.head;
        while (current.next && current.next.next) {
            current = current.next;
        }
        const value = current.next.value;
        soundEngine.playDelete();
        await this.animateDeleteTail();
        current.next = null;
        this._count--;
        return `Deleted tail: ${value}`;
    }

    async deleteAt(index) {
        if (index < 0 || index >= this._count) {
            throw new Error('Invalid index');
        }
        if (index === 0) return await this.deleteHead();

        let current = this.head;
        for (let i = 0; i < index - 1; i++) {
            current = current.next;
        }
        const value = current.next.value;
        soundEngine.playDelete();
        await this.animateDeleteAt(index);
        current.next = current.next.next;
        this._count--;
        return `Deleted at index ${index}: ${value}`;
    }

    async search(value) {
        const target = parseInt(value);
        let current = this.head;
        let index = 0;

        while (current) {
            await this.animateNodeSearch(index, current.value === target);
            if (current.value === target) {
                soundEngine.playSearchHit();
                await this.animateNodeFound(index);
                return `Found ${target} at index ${index}`;
            }
            current = current.next;
            index++;
        }

        soundEngine.playSearchMiss();
        return null;
    }

    clear() {
        this.head = null;
        this._count = 0;
    }

    // Traverse and return array
    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push(current.value);
            current = current.next;
        }
        return arr;
    }

    render(container) {
        this.container = container;
        container.innerHTML = '';

        if (this.isEmpty()) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5"><div style="font-size:36px">🔗</div><div style="font-size:15px;font-weight:600;color:#8888aa">List is empty</div><div style="font-size:12px;color:#55557a">Insert nodes to see the chain</div></div>';
            return;
        }

        const listContainer = document.createElement('div');
        listContainer.className = 'linked-list-container';

        const arr = this.toArray();
        arr.forEach((value, index) => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'll-node';
            nodeEl.style.animationDelay = `${index * 80}ms`;
            nodeEl.innerHTML = `
                <div class="ll-node-box">
                    <div class="ll-value" data-index="${index}">${value}</div>
                    <span class="ll-index">[${index}]</span>
                </div>
            `;
            listContainer.appendChild(nodeEl);

            // Arrow between nodes
            if (index < arr.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'll-arrow';
                arrow.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                `;
                listContainer.appendChild(arrow);
            }
        });

        // Null indicator
        const nullEl = document.createElement('div');
        nullEl.className = 'll-null';
        nullEl.textContent = 'NULL';
        listContainer.appendChild(nullEl);

        container.appendChild(listContainer);

        // Animate entrance
        const nodes = listContainer.querySelectorAll('.ll-node');
        animator.stagger(nodes, { delay: 80 });
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔗</div>
                <p class="empty-title">Linked list is empty</p>
                <p class="empty-hint">Insert nodes to see the chain</p>
            </div>
        `;
    }

    async animateInsertHead() {
        const firstNode = this.container?.querySelector('.ll-node');
        if (firstNode) {
            animator.appear(firstNode, { duration: 450 });
            await sleep(animator.duration(450));
        }
        const arrow = this.container?.querySelector('.ll-arrow');
        if (arrow) {
            anime({ targets: arrow, translateX: [20, 0], opacity: [0, 1], duration: animator.duration(300), easing: 'easeOutQuad' });
        }
    }

    async animateInsertTail() {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            animator.appear(lastNode, { translateX: [-40, 0], duration: 450 });
            await sleep(animator.duration(450));
        }
    }

    async animateInsertAt(index) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            animator.appear(nodes[index], { duration: 450 });
            await sleep(animator.duration(450));
        }
    }

    async animateDeleteHead() {
        const firstNode = this.container?.querySelector('.ll-node');
        if (firstNode) {
            await animator.disappear(firstNode, null, { duration: 400 });
            await sleep(animator.duration(50));
        }
        const arrow = this.container?.querySelector('.ll-arrow');
        if (arrow) {
            anime({ targets: arrow, translateX: [0, -20], opacity: [1, 0], duration: animator.duration(300), easing: 'easeInQuad' });
        }
    }

    async animateDeleteTail() {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            await animator.disappear(lastNode, null, { duration: 400 });
            await sleep(animator.duration(50));
        }
    }

    async animateDeleteAt(index) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            await animator.disappear(nodes[index], null, { duration: 400 });
            await sleep(animator.duration(50));
        }
    }

    async animateNodeSearch(index, found = false) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            const valueEl = nodes[index].querySelector('.ll-value');
            if (valueEl) {
                if (found) {
                    await anime({ targets: valueEl, scale: [1, 1.2, 1], borderColor: ['var(--active-color)', 'var(--success)', 'var(--active-color)'], boxShadow: ['0 0 12px rgba(255,0,128,0.15)', '0 0 24px rgba(0,255,136,0.5)', '0 0 12px rgba(255,0,128,0.15)'], duration: animator.duration(400), easing: 'easeInOutQuad' }).finished;
                } else {
                    anime({ targets: valueEl, scale: [1, 1.1, 1], borderColor: ['var(--active-color)', 'var(--warning)', 'var(--active-color)'], duration: animator.duration(300), easing: 'easeInOutQuad' });
                }
            }
            soundEngine.playStep(1.0 + index * 0.05);
            await sleep(animator.duration(250));
        }
    }

    async animateNodeFound(index) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            const valueEl = nodes[index].querySelector('.ll-value');
            if (valueEl) {
                anime({ targets: valueEl, scale: [1, 1.25, 1], borderColor: 'var(--success)', boxShadow: '0 0 30px rgba(0,255,136,0.6)', duration: animator.duration(600), easing: 'easeOutElastic(1, 0.5)' });
                await sleep(animator.duration(700));
                valueEl.style.borderColor = '';
                valueEl.style.boxShadow = '';
            }
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'insertHead': return await this.insertHead(value);
            case 'insertTail': return await this.insertTail(value);
            case 'insertAt': return await this.insertAt(value, index);
            case 'deleteHead': return await this.deleteHead();
            case 'deleteTail': return await this.deleteTail();
            case 'deleteAt': return await this.deleteAt(index);
            case 'search': return await this.search(value);
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}