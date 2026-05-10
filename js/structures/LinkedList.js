/**
 * LinkedList — Singly Linked List with visualization
 */
class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
        this.container = null;
    }

    init() {
        this.head = null;
        this.size = 0;
    }

    size() {
        return this.size;
    }

    isEmpty() {
        return this.size === 0;
    }

    // Create a new node
    createNode(value) {
        return {
            value: parseInt(value) || randomValue(),
            next: null
        };
    }

    async insertHead(value) {
        if (this.size >= 20) {
            throw new Error('List is full');
        }
        const newNode = this.createNode(value);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;

        soundEngine.playInsert(1.5);
        await this.animateInsertHead();
        return `Inserted ${newNode.value} at head`;
    }

    async insertTail(value) {
        if (this.size >= 20) {
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
        this.size++;

        soundEngine.playInsert(1.0);
        await this.animateInsertTail();
        return `Inserted ${newNode.value} at tail`;
    }

    async insertAt(value, index) {
        if (index < 0 || index > this.size) {
            throw new Error('Invalid index');
        }
        if (index === 0) return await this.insertHead(value);
        if (index === this.size) return await this.insertTail(value);

        const newNode = this.createNode(value);
        let current = this.head;
        for (let i = 0; i < index - 1; i++) {
            current = current.next;
        }
        newNode.next = current.next;
        current.next = newNode;
        this.size++;

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
        this.size--;
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
        this.size--;
        return `Deleted tail: ${value}`;
    }

    async deleteAt(index) {
        if (index < 0 || index >= this.size) {
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
        this.size--;
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
        this.size = 0;
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
            this.showEmptyState(container);
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
            firstNode.style.transform = 'scale(0)';
            firstNode.style.opacity = '0';
            await sleep(50);
            firstNode.style.transform = '';
            firstNode.style.opacity = '';
            animator.appear(firstNode);
            await sleep(animator.duration(400));
        }
    }

    async animateInsertTail() {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            lastNode.style.transform = 'translateX(-40px)';
            lastNode.style.opacity = '0';
            await sleep(50);
            animator.appear(lastNode);
            await sleep(animator.duration(400));
        }
    }

    async animateInsertAt(index) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            nodes[index].style.transform = 'scale(0)';
            nodes[index].style.opacity = '0';
            await sleep(50);
            animator.appear(nodes[index]);
            await sleep(animator.duration(400));
        }
    }

    async animateDeleteHead() {
        const firstNode = this.container?.querySelector('.ll-node');
        if (firstNode) {
            firstNode.classList.add('deleting');
            await sleep(animator.duration(400));
        }
    }

    async animateDeleteTail() {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            lastNode.classList.add('deleting');
            await sleep(animator.duration(400));
        }
    }

    async animateDeleteAt(index) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            nodes[index].classList.add('deleting');
            await sleep(animator.duration(400));
        }
    }

    async animateNodeSearch(index, found = false) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            nodes[index].querySelector('.ll-value')?.classList.add('searching');
            soundEngine.playStep(1.0 + index * 0.05);
            await sleep(animator.duration(300));
            nodes[index].querySelector('.ll-value')?.classList.remove('searching');
        }
    }

    async animateNodeFound(index) {
        const nodes = this.container?.querySelectorAll('.ll-node');
        if (nodes && nodes[index]) {
            nodes[index].querySelector('.ll-value')?.classList.add('found');
            await sleep(animator.duration(600));
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