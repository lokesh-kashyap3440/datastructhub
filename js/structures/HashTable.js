/**
 * HashTable — Key-Value store with chaining visualization
 */
class HashTable {
    constructor() {
        this.buckets = new Array(8).fill(null).map(() => []);
        this._count = 0;
        this.container = null;
    }

    init() {
        this.buckets = new Array(8).fill(null).map(() => []);
        this._count = 0;
    }

    size() {
        return this._count;
    }

    isEmpty() {
        return this._count === 0;
    }

    _hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash << 5) - hash + key.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash) % this.buckets.length;
    }

    async insert(key, value) {
        if (this._count >= 32) {
            throw new Error('Hash table is full');
        }
        if (!key) {
            throw new Error('Key is required');
        }

        const index = this._hash(String(key));

        // Check if key already exists
        const bucket = this.buckets[index];
        for (const item of bucket) {
            if (item.key === String(key)) {
                item.value = value;
                await this.animateHighlight(index);
                soundEngine.playInsert(1.2);
                return `Updated ${key}: ${value}`;
            }
        }

        // Add new entry
        bucket.push({ key: String(key), value: String(value) });
        this._count++;

        await this.animateHighlight(index);
        soundEngine.playInsert();
        return `Inserted ${key}: ${value} at bucket ${index}`;
    }

    async search(key) {
        const index = this._hash(String(key));

        // Animate highlight
        await this.animateHighlight(index);
        await this.animateScanBucket(index, String(key));

        const bucket = this.buckets[index];
        for (const item of bucket) {
            if (item.key === String(key)) {
                soundEngine.playSearchHit();
                await this.animateFound(index, bucket.indexOf(item));
                return `Found ${key}: ${item.value}`;
            }
        }

        soundEngine.playSearchMiss();
        return null;
    }

    async delete(key) {
        const index = this._hash(String(key));
        const bucket = this.buckets[index];
        const itemIndex = bucket.findIndex(item => item.key === String(key));

        if (itemIndex === -1) {
            throw new Error(`Key "${key}" not found`);
        }

        await this.animateHighlight(index);
        await sleep(animator.duration(300));

        bucket.splice(itemIndex, 1);
        this._count--;

        soundEngine.playDelete();
        await this.animateDelete(index, itemIndex);
        return `Deleted ${key}`;
    }

    clear() {
        this.buckets = new Array(8).fill(null).map(() => []);
        this._count = 0;
    }

    render(container) {
        this.container = container;
        container.innerHTML = '';

        if (this.isEmpty()) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.5"><div style="font-size:36px">🔐</div><div style="font-size:15px;font-weight:600;color:#8888aa">Hash table is empty</div><div style="font-size:12px;color:#55557a">Insert key:value pairs</div></div>';
            return;
        }

        const htContainer = document.createElement('div');
        htContainer.className = 'hashtable-container';

        this.buckets.forEach((bucket, index) => {
            const bucketEl = document.createElement('div');
            bucketEl.className = 'hashtable-bucket';
            bucketEl.setAttribute('data-index', index);

            // Bucket label
            const label = document.createElement('div');
            label.className = 'ht-bucket-label';
            label.textContent = index;
            bucketEl.appendChild(label);

            // Bucket items
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'ht-bucket-items';

            if (bucket.length === 0) {
                const nullLabel = document.createElement('div');
                nullLabel.className = 'ht-null-label';
                nullLabel.textContent = '∅';
                itemsContainer.appendChild(nullLabel);
            } else {
                bucket.forEach((item, i) => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'ht-item';
                    itemEl.style.animationDelay = `${i * 100}ms`;

                    const valueEl = document.createElement('div');
                    valueEl.className = 'ht-value';
                    valueEl.textContent = `${item.key}→${item.value}`;
                    valueEl.setAttribute('title', `${item.key}: ${item.value}`);
                    itemEl.appendChild(valueEl);

                    itemsContainer.appendChild(itemEl);

                    // Arrow between items (chain)
                    if (i < bucket.length - 1) {
                        const arrow = document.createElement('div');
                        arrow.className = 'ht-arrow';
                        arrow.textContent = '→';
                        itemsContainer.appendChild(arrow);
                    }
                });
            }

            bucketEl.appendChild(itemsContainer);
            htContainer.appendChild(bucketEl);
        });

        container.appendChild(htContainer);

        // Animate entrance
        const buckets = htContainer.querySelectorAll('.hashtable-bucket');
        animator.stagger(buckets, { delay: 60 });
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔐</div>
                <p class="empty-title">Hash table is empty</p>
                <p class="empty-hint">Insert key:value pairs (e.g., name:Bob)</p>
            </div>
        `;
    }

    async animateHighlight(bucketIndex) {
        const bucket = this.container?.querySelector(`[data-index="${bucketIndex}"]`);
        if (bucket) {
            const label = bucket.querySelector('.ht-bucket-label');
            if (label) {
                anime({ targets: label, scale: [1, 1.15, 1], duration: animator.duration(500), easing: 'easeOutElastic(1, 0.5)' });
            }
            bucket.classList.add('highlight');
            await sleep(animator.duration(500));
            bucket.classList.remove('highlight');
        }
    }

    async animateScanBucket(bucketIndex, targetKey) {
        const bucket = this.container?.querySelector(`[data-index="${bucketIndex}"]`);
        if (!bucket) return;

        const items = bucket.querySelectorAll('.ht-item');
        for (let i = 0; i < items.length; i++) {
            const valueEl = items[i].querySelector('.ht-value');
            if (valueEl) {
                const isMatch = valueEl.textContent.startsWith(targetKey);
                anime({ targets: valueEl, scale: [1, 1.15, 1], borderColor: isMatch ? ['var(--active-color)', 'var(--success)', 'var(--active-color)'] : ['var(--active-color)', 'var(--warning)', 'var(--active-color)'], duration: animator.duration(250), easing: 'easeInOutQuad' });
            }
            soundEngine.playStep(1.0 + i * 0.1);
            await sleep(animator.duration(250));
        }
    }

    async animateFound(bucketIndex, itemIndex) {
        const bucket = this.container?.querySelector(`[data-index="${bucketIndex}"]`);
        if (!bucket) return;

        const items = bucket.querySelectorAll('.ht-item');
        if (items[itemIndex]) {
            const valueEl = items[itemIndex].querySelector('.ht-value');
            if (valueEl) {
                await anime({ targets: valueEl, scale: [1, 1.25, 1], borderColor: 'var(--success)', boxShadow: '0 0 30px rgba(0,255,136,0.6)', duration: animator.duration(600), easing: 'easeOutElastic(1, 0.5)' }).finished;
                anime({ targets: valueEl, borderColor: 'var(--active-color)', boxShadow: '0 0 8px rgba(155,89,255,0.15)', duration: animator.duration(300), easing: 'easeOutQuad' });
            }
        }
    }

    async animateDelete(bucketIndex, itemIndex) {
        const bucket = this.container?.querySelector(`[data-index="${bucketIndex}"]`);
        if (!bucket) return;

        const items = bucket.querySelectorAll('.ht-item');
        if (items[itemIndex]) {
            await anime({ targets: items[itemIndex], scale: [1, 0], opacity: [1, 0], duration: animator.duration(400), easing: 'easeInBack' }).finished;
        }
    }

    async execute(operation, value, index) {
        switch (operation) {
            case 'insert':
                if (typeof value === 'object' && value.key !== undefined) {
                    return await this.insert(value.key, value.value);
                }
                // value is "key:value" string
                const [key, val] = String(value).split(':').map(v => v.trim());
                return await this.insert(key, val);
            case 'search': return await this.search(value);
            case 'delete': return await this.delete(value);
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    }
}