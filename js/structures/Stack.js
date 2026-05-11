/**
 * Stack — LIFO data structure with visualization
 */
class Stack {
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

    async push(value) {
        if (this.isFull()) {
            throw new Error('Stack is full');
        }
        const numValue = parseInt(value) || randomValue();
        this.items.push(numValue);

        soundEngine.playPush();
        await this.animatePush();
        return `Pushed ${numValue}`;
    }

    async pop() {
        if (this.isEmpty()) {
            throw new Error('Stack is empty');
        }
        const value = this.items.pop();

        soundEngine.playPop();
        await this.animatePop();
        return `Popped ${value}`;
    }

    async peek() {
        if (this.isEmpty()) {
            throw new Error('Stack is empty');
        }
        const value = this.items[this.items.length - 1];
        await this.animatePeek();
        soundEngine.playSearchHit();
        return `Top: ${value}`;
    }

    clear() {
        this.items = [];
    }

    render(container) {
        this.container = container;
        container.innerHTML = '';

        if (this.isEmpty()) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5"><div style="font-size:36px">📚</div><div style="font-size:15px;font-weight:600;color:#8888aa">Stack is empty</div><div style="font-size:12px;color:#55557a">Push elements to build the stack</div></div>';
            return;
        }

        const stackContainer = document.createElement('div');
        stackContainer.className = 'stack-container';

        // Pointer label
        const pointerLabel = document.createElement('div');
        pointerLabel.className = 'stack-pointer-label';
        pointerLabel.textContent = 'TOP';
        stackContainer.appendChild(pointerLabel);

        // Stack items (reversed for top at top)
        const reversed = [...this.items].reverse();
        reversed.forEach((value, visualIndex) => {
            const actualIndex = this.items.length - 1 - visualIndex;
            const item = document.createElement('div');
            item.className = 'stack-item';
            if (visualIndex === 0) item.classList.add('top');
            item.style.animationDelay = `${visualIndex * 60}ms`;
            item.innerHTML = `<span>${value}</span>`;
            stackContainer.appendChild(item);
        });

        // Base
        const base = document.createElement('div');
        base.className = 'stack-base';
        stackContainer.appendChild(base);

        container.appendChild(stackContainer);

        // Animate entrance
        const items = stackContainer.querySelectorAll('.stack-item');
        animator.stagger(items, { delay: 50 });
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <p class="empty-title">Stack is empty</p>
                <p class="empty-hint">Push elements to build the stack</p>
            </div>
        `;
    }

    async animatePush() {
        const items = this.container?.querySelectorAll('.stack-item');
        if (items && items.length > 0) {
            const topItem = items[0];
            topItem.classList.remove('top');
            topItem.style.transform = 'scale(0.8)';
            topItem.style.opacity = '0.5';
            await sleep(50);

            topItem.style.transform = '';
            topItem.style.opacity = '';
            topItem.classList.add('top');

            // Animate new top appearing
            const newTop = this.container?.querySelector('.stack-item:first-child');
            if (newTop) {
                newTop.style.transform = 'translateY(-30px)';
                newTop.style.opacity = '0';
                await sleep(50);
                animator.appear(newTop);
                await sleep(animator.duration(400));
            }
        }
    }

    async animatePop() {
        const items = this.container?.querySelectorAll('.stack-item');
        if (items && items.length > 0) {
            const topItem = items[0];
            topItem.classList.add('popping');
            await sleep(animator.duration(400));
        }
    }

    async animatePeek() {
        const topItem = this.container?.querySelector('.stack-item.top');
        if (topItem) {
            topItem.style.transform = 'scale(1.1)';
            topItem.style.boxShadow = '0 0 24px rgba(255, 214, 0, 0.5)';
            await sleep(animator.duration(600));
            topItem.style.transform = '';
            topItem.style.boxShadow = '';
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'push': return await this.push(value);
            case 'pop': return await this.pop();
            case 'peek': return await this.peek();
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}