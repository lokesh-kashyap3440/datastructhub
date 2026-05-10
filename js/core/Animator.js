/**
 * Animator — Animation orchestration using anime.js
 */
class Animator {
    constructor() {
        this.speed = 1;
        this.defaultDuration = 800;
    }

    /**
     * Set animation speed multiplier
     * @param {number} speed - Speed multiplier (0.5 to 3)
     */
    setSpeed(speed) {
        this.speed = speed;
    }

    /**
     * Get adjusted duration based on speed
     * @param {number} baseMs - Base duration in ms
     * @returns {number} Adjusted duration
     */
    duration(baseMs) {
        return baseMs / this.speed;
    }

    /**
     * Animate element appearing (scale + fade in with bounce)
     * @param {HTMLElement} element - Target element
     * @param {Object} options - Additional anime options
     * @returns {Object} Anime instance
     */
    appear(element, options = {}) {
        return anime({
            targets: element,
            scale: [0, 1],
            opacity: [0, 1],
            rotate: [-10, 0],
            easing: 'easeOutElastic(1, 0.6)',
            duration: this.duration(options.duration || 500),
            ...options
        });
    }

    /**
     * Animate element disappearing
     * @param {HTMLElement} element - Target element
     * @param {Function} onComplete - Callback after animation
     * @param {Object} options - Additional anime options
     * @returns {Object} Anime instance
     */
    disappear(element, onComplete, options = {}) {
        return anime({
            targets: element,
            scale: [1, 0],
            opacity: [1, 0],
            rotate: [0, 15],
            easing: 'easeInBack',
            duration: this.duration(options.duration || 350),
            complete: onComplete,
            ...options
        });
    }

    /**
     * Animate highlight/pulse
     * @param {HTMLElement} element - Target element
     * @param {Object} options - Additional anime options
     * @returns {Object} Anime instance
     */
    highlight(element, options = {}) {
        return anime({
            targets: element,
            scale: [1, 1.15, 1],
            easing: 'easeInOutQuad',
            duration: this.duration(options.duration || 400),
            ...options
        });
    }

    /**
     * Animate movement from one position to another
     * @param {HTMLElement} element - Target element
     * @param {Object} toPosition - Target position {left, top}
     * @param {Object} options - Additional anime options
     * @returns {Object} Anime instance
     */
    move(element, toPosition, options = {}) {
        return anime({
            targets: element,
            left: toPosition.left,
            top: toPosition.top,
            easing: 'easeOutQuad',
            duration: this.duration(options.duration || 500),
            ...options
        });
    }

    /**
     * Stagger animation for multiple elements
     * @param {NodeList|Array} elements - Elements to animate
     * @param {Object} options - Anime options
     * @returns {Object} Anime instance
     */
    stagger(elements, options = {}) {
        return anime({
            targets: elements,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(options.delay || 60, { start: options.startDelay || 0 }),
            easing: 'easeOutQuad',
            duration: this.duration(options.duration || 400),
            ...options
        });
    }

    /**
     * Animate value counting up
     * @param {HTMLElement} element - Target element
     * @param {number} from - Start value
     * @param {number} to - End value
     * @param {Object} options - Additional options
     * @returns {Object} Anime instance
     */
    count(element, from, to, options = {}) {
        const obj = { value: from };
        return anime({
            targets: obj,
            value: to,
            round: 1,
            easing: 'easeOutQuad',
            duration: this.duration(options.duration || 600),
            update: () => {
                if (element) element.textContent = Math.round(obj.value);
            },
            ...options
        });
    }

    /**
     * Animate opacity transition
     * @param {HTMLElement} element - Target element
     * @param {number} from - Start opacity
     * @param {number} to - End opacity
     * @param {Function} onComplete - Callback
     * @param {Object} options - Additional options
     * @returns {Object} Anime instance
     */
    fade(element, from, to, onComplete, options = {}) {
        element.style.opacity = from;
        return anime({
            targets: element,
            opacity: to,
            easing: 'easeOutQuad',
            duration: this.duration(options.duration || 300),
            complete: onComplete,
            ...options
        });
    }

    /**
     * Animate color transition on element
     * @param {HTMLElement} element - Target element
     * @param {string} property - CSS property (background, borderColor, etc.)
     * @param {string} fromColor - Start color
     * @param {string} toColor - End color
     * @param {Object} options - Additional options
     * @returns {Object} Anime instance
     */
    color(element, property, fromColor, toColor, options = {}) {
        const fromHex = this.hexToRgb(fromColor);
        const toHex = this.hexToRgb(toColor);
        const obj = { ...fromHex };

        return anime({
            targets: obj,
            r: toHex.r,
            g: toHex.g,
            b: toHex.b,
            easing: 'easeOutQuad',
            duration: this.duration(options.duration || 400),
            update: () => {
                element.style[property] = `rgb(${Math.round(obj.r)}, ${Math.round(obj.g)}, ${Math.round(obj.b)})`;
            },
            ...options
        });
    }

    /**
     * Parallel animations for multiple elements
     * @param {Array} animations - Array of animation objects
     * @param {Function} onComplete - Callback when all complete
     * @returns {Array} Anime instances
     */
    parallel(animations, onComplete) {
        return anime({
            targets: animations.map(a => a.target),
            duration: () => this.duration(animations[0]?.duration || 500),
            updates: () => {},
            complete: onComplete
        });
    }

    /**
     * Sequential animations
     * @param {Array} timeline - Array of animation objects with time offsets
     * @param {Function} onComplete - Callback when done
     */
    sequence(timeline, onComplete) {
        const tl = anime.timeline({
            complete: onComplete
        });

        timeline.forEach(step => {
            tl.add({
                targets: step.target,
                ...step.props,
                duration: this.duration(step.duration || 400),
                easing: step.easing || 'easeOutQuad'
            }, step.at || 0);
        });

        return tl;
    }

    /**
     * Utility: Convert hex color to RGB object
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Cancel all animations on an element
     * @param {HTMLElement} element - Target element
     */
    cancel(element) {
        anime.remove(element);
    }

    /**
     * Cancel all running animations
     */
    cancelAll() {
        anime.remove('*');
    }
}

// Export singleton instance
const animator = new Animator();