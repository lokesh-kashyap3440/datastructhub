/**
 * Queue — FIFO data structure with visualization
 */
class Queue {
    constructor() {
        this.items = [];
        this.maxSize = 12;
        this.container = null;
    }

    init() {
        this.items = [];
    }

    size() {
        return this.items.length;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    isFull() {
        return this.items.length >= this.maxSize;
    }

    async enqueue(value) {
        if (this.isFull()) {
            throw new Error('Queue is full');
        }
        const numValue = parseInt(value) || randomValue();
        this.items.push(numValue);

        soundEngine.playPush();
        await this.animateEnqueue();
        return `Enqueued ${numValue}`;
    }

    async dequeue() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        const value = this.items.shift();

        soundEngine.playPop();
        await this.animateDequeue();
        return `Dequeued ${value}`;
    }

    async front() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        const value = this.items[0];
        await this.animateFront();
        soundEngine.playSearchHit();
        return `Front: ${value}`;
    }

    clear() {
        this.items = [];
    }

    render(container) {
        this.container = container;
        container.innerHTML = '';

        if (this.isEmpty()) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5"><div style="font-size:36px">🚶</div><div style="font-size:15px;font-weight:600;color:#8888aa">Queue is empty</div><div style="font-size:12px;color:#55557a">Enqueue elements to form a line</div></div>';
            return;
        }

        const queueContainer = document.createElement('div');
        queueContainer.className = 'queue-container';

        this.items.forEach((value, index) => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            if (index === 0) item.classList.add('front');
            if (index === this.items.length - 1) item.classList.add('rear');
            item.style.animationDelay = `${index * 80}ms`;
            item.innerHTML = `
                <div class="queue-value" data-index="${index}">${value}</div>
                <span class="queue-index">[${index}]</span>
            `;
            queueContainer.appendChild(item);

            // Pointer labels
            if (index === 0) {
                const label = document.createElement('div');
                label.className = 'queue-pointer';
                label.textContent = '← Front';
                queueContainer.appendChild(label);
            }
        });

        // Rear pointer
        const rearLabel = document.createElement('div');
        rearLabel.className = 'queue-pointer';
        rearLabel.textContent = 'Rear →';
        queueContainer.appendChild(rearLabel);

        container.appendChild(queueContainer);

        // Animate entrance
        const items = queueContainer.querySelectorAll('.queue-item');
        animator.stagger(items, { delay: 80 });
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚶</div>
                <p class="empty-title">Queue is empty</p>
                <p class="empty-hint">Enqueue elements to form a line</p>
            </div>
        `;
    }

    async animateEnqueue() {
        const items = this.container?.querySelectorAll('.queue-item');
        if (items && items.length > 0) {
            const lastItem = items[items.length - 1];
            lastItem.style.transform = 'translateX(-40px)';
            lastItem.style.opacity = '0';
            await sleep(50);
            animator.appear(lastItem);
            await sleep(animator.duration(400));
        }
    }

    async animateDequeue() {
        const firstItem = this.container?.querySelector('.queue-item');
        if (firstItem) {
            firstItem.classList.add('dequeuing');
            await sleep(animator.duration(400));
        }
    }

    async animateFront() {
        const frontItem = this.container?.querySelector('.queue-item.front');
        if (frontItem) {
            const valueEl = frontItem.querySelector('.queue-value');
            if (valueEl) {
                valueEl.style.transform = 'scale(1.15)';
                valueEl.style.boxShadow = '0 0 24px rgba(0, 255, 136, 0.5)';
                await sleep(animator.duration(600));
                valueEl.style.transform = '';
                valueEl.style.boxShadow = '';
            }
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'enqueue': return await this.enqueue(value);
            case 'dequeue': return await this.dequeue();
            case 'front': return await this.front();
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}