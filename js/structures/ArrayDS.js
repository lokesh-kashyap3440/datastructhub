/**
 * ArrayDS — Dynamic Array with visualization
 */
class ArrayDS {
    constructor() {
        this.data = [];
        this.maxCapacity = 12;
        this.container = null;
    }

    init() { this.data = []; }

    size() { return this.data.length; }
    isEmpty() { return this.data.length === 0; }
    isFull() { return this.data.length >= this.maxCapacity; }

    async insert(value) {
        if (this.isFull()) throw new Error('Array is full');
        const numValue = parseInt(value) || randomValue();
        this.data.push(numValue);
        soundEngine.playInsert();
        await this.animateInsert(this.data.length - 1);
        return `Inserted ${numValue}`;
    }

    async insertAt(value, index) {
        if (this.isFull()) throw new Error('Array is full');
        const idx = parseInt(index);
        if (idx < 0 || idx > this.data.length) throw new Error('Invalid index');
        const numValue = parseInt(value) || randomValue();
        this.data.splice(idx, 0, numValue);
        soundEngine.playInsert(1.2);
        await this.animateInsert(idx);
        return `Inserted ${numValue} at [${idx}]`;
    }

    async delete(value) {
        const numValue = parseInt(value);
        const index = this.data.indexOf(numValue);
        if (index === -1) {
            soundEngine.playSearchMiss();
            throw new Error(`Value ${numValue} not found`);
        }
        await this.animateSearch(index, true);
        soundEngine.playDelete();
        await this.animateDelete(index);
        this.data.splice(index, 1);
        return `Deleted ${numValue}`;
    }

    async deleteAt(index) {
        const idx = parseInt(index);
        if (idx < 0 || idx >= this.data.length) throw new Error('Invalid index');
        await this.animateSearch(idx, true);
        const value = this.data[idx];
        soundEngine.playDelete();
        await this.animateDelete(idx);
        this.data.splice(idx, 1);
        return `Deleted at [${idx}]`;
    }

    async search(value) {
        const numValue = parseInt(value);
        const index = this.data.indexOf(numValue);

        if (index === -1) {
            await this.animateScan();
            soundEngine.playSearchMiss();
            return null;
        }

        await this.animateSearch(index, false);
        soundEngine.playSearchHit();
        return `Found ${numValue} at [${index}]`;
    }

    async update(index, newValue) {
        const idx = parseInt(index);
        if (idx < 0 || idx >= this.data.length) throw new Error('Invalid index');
        const newVal = parseInt(newValue) || randomValue();
        const oldVal = this.data[idx];
        await this.animateSearch(idx, true);
        this.data[idx] = newVal;
        soundEngine.playInsert(0.8);
        await this.animateUpdateValue(idx, newVal);
        return `${oldVal} → ${newVal}`;
    }

    clear() { this.data = []; }

    render(container) {
        this.container = container;
        container.innerHTML = '';

        if (this.data.length === 0) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5"><div style="font-size:36px">📦</div><div style="font-size:15px;font-weight:600;color:#8888aa">Array is empty</div><div style="font-size:12px;color:#55557a">Enter a value and Execute</div></div>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'array-grid';

        this.data.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.className = 'array-cell';
            cell.style.animationDelay = `${index * 40}ms`;
            cell.innerHTML = `
                <div class="array-value" data-index="${index}">${value}</div>
                <span class="array-index">[${index}]</span>
            `;
            grid.appendChild(cell);
        });

        container.appendChild(grid);
        animator.stagger(grid.querySelectorAll('.array-cell'), { delay: 40 });
    }

    async animateInsert(index) {
        const cell = this.container?.querySelector(`[data-index="${index}"]`)?.closest('.array-cell');
        if (cell) {
            await animator.appear(cell, { duration: 500 });
            await sleep(animator.duration(200));
        }
    }

    async animateDelete(index) {
        const cell = this.container?.querySelector(`[data-index="${index}"]`)?.closest('.array-cell');
        if (cell) {
            await animator.disappear(cell, null, { duration: 400 });
            await sleep(animator.duration(50));
        }
    }

    async animateSearch(index, isDelete = false) {
        const cells = this.container?.querySelectorAll('.array-cell');
        if (!cells) return;

        for (let i = 0; i <= index; i++) {
            if (cells[i]) {
                const valueEl = cells[i].querySelector('.array-value');
                if (valueEl) {
                    anime({ targets: valueEl, scale: [1, 1.12, 1], borderColor: ['var(--active-color)', 'var(--warning)', 'var(--active-color)'], duration: animator.duration(300), easing: 'easeInOutQuad' });
                }
                soundEngine.playStep(0.8 + i * 0.1);
                await sleep(animator.duration(200));
            }
        }

        if (cells[index]) {
            const valueEl = cells[index].querySelector('.array-value');
            if (valueEl) {
                const color = isDelete ? 'var(--danger)' : 'var(--success)';
                await anime({ targets: valueEl, scale: [1, 1.2, 1], borderColor: [color, color], boxShadow: isDelete ? `0 0 24px rgba(255,61,113,0.5)` : `0 0 24px rgba(0,255,136,0.5)`, duration: animator.duration(500), easing: 'easeOutElastic(1, 0.5)' }).finished;
            }
        }
    }

    async animateScan() {
        const cells = this.container?.querySelectorAll('.array-cell');
        if (!cells) return;

        for (const cell of cells) {
            const valueEl = cell.querySelector('.array-value');
            if (valueEl) {
                anime({ targets: valueEl, scale: [1, 1.08, 1], duration: animator.duration(200), easing: 'easeInOutQuad' });
            }
            soundEngine.playStep(0.6);
            await sleep(animator.duration(120));
        }
    }

    async animateUpdateValue(index, newVal) {
        const valueEl = this.container?.querySelector(`[data-index="${index}"]`);
        if (valueEl) {
            await anime({ targets: valueEl, scale: [1, 1.3, 1], duration: animator.duration(400), easing: 'easeOutElastic(1, 0.5)' }).finished;
            valueEl.textContent = newVal;
            anime({ targets: valueEl, scale: [{ value: 1.3 }, { value: 1 }], boxShadow: [`0 0 30px var(--active-color)`, `none`], duration: animator.duration(400), easing: 'easeOutElastic(1, 0.5)' });
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'insert': return await this.insert(value);
            case 'insertAt': return await this.insertAt(value, index);
            case 'delete': return await this.delete(value);
            case 'deleteAt': return await this.deleteAt(index);
            case 'search': return await this.search(value);
            case 'update': return await this.update(index, value);
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}