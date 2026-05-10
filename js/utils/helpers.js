/**
 * Helpers — Reusable utility functions
 */

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random value suitable for visualization
 */
function randomValue() {
    return randomInt(1, 99);
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Format a timestamp for the operation log
 */
function formatTime(date = new Date()) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Format relative time ("Just now", "2m ago", etc.)
 */
function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return formatTime(new Date(timestamp));
}

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - 'success' | 'error' | 'warning' | ''
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = '', duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'toast show';
    if (type) toast.classList.add(type);

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Deep clone an object/array
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(deepClone);
    if (obj instanceof Object) {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}

/**
 * Simple hash function for strings
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Determine if value is numeric
 */
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Normalize value to string for display
 */
function normalizeValue(value, maxLength = 4) {
    let str = String(value);
    if (str.length > maxLength) {
        str = str.substring(0, maxLength - 1) + '…';
    }
    return str;
}

/**
 * Sleep utility for async operations
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Add class with delay for staggered animations
 */
function delayedClass(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.add(className);
    }, delay);
}

/**
 * Remove class with delay
 */
function delayedRemoveClass(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.remove(className);
    }, delay);
}

/**
 * Create SVG element with attributes
 */
function createSVG(tag, attributes = {}) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) {
        svg.setAttribute(key, value);
    }
    return svg;
}

/**
 * Calculate distance between two points
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Linear interpolation
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Ease out quad function
 */
function easeOutQuad(t) {
    return t * (2 - t);
}

/**
 * Ease out elastic function approximation
 */
function easeOutElastic(t) {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

// Make helper functions globally accessible
window.dsHelpers = {
    randomInt,
    randomValue,
    debounce,
    throttle,
    clamp,
    formatTime,
    formatRelativeTime,
    showToast,
    escapeHtml,
    deepClone,
    simpleHash,
    isNumeric,
    normalizeValue,
    sleep,
    delayedClass,
    delayedRemoveClass,
    createSVG,
    distance,
    lerp,
    easeOutQuad,
    easeOutElastic
};