import anime from 'animejs'

export class Animator {
  constructor() {
    this.speed = 1
    this.defaultDuration = 800
  }

  setSpeed(speed) { this.speed = speed }

  duration(baseMs) { return baseMs / this.speed }

  appear(element, options = {}) {
    return anime({
      targets: element, scale: [0, 1], opacity: [0, 1], rotate: [-10, 0],
      easing: 'easeOutElastic(1, 0.6)',
      duration: this.duration(options.duration || 500), ...options
    })
  }

  disappear(element, onComplete, options = {}) {
    return anime({
      targets: element, scale: [1, 0], opacity: [1, 0], rotate: [0, 15],
      easing: 'easeInBack',
      duration: this.duration(options.duration || 350),
      complete: onComplete, ...options
    })
  }

  highlight(element, options = {}) {
    return anime({
      targets: element, scale: [1, 1.15, 1],
      easing: 'easeInOutQuad',
      duration: this.duration(options.duration || 400), ...options
    })
  }

  move(element, toPosition, options = {}) {
    return anime({
      targets: element, left: toPosition.left, top: toPosition.top,
      easing: 'easeOutQuad',
      duration: this.duration(options.duration || 500), ...options
    })
  }

  stagger(elements, options = {}) {
    return anime({
      targets: elements, opacity: [0, 1], translateY: [20, 0],
      delay: anime.stagger(options.delay || 60, { start: options.startDelay || 0 }),
      easing: 'easeOutQuad',
      duration: this.duration(options.duration || 400), ...options
    })
  }

  count(element, from, to, options = {}) {
    const obj = { value: from }
    return anime({
      targets: obj, value: to, round: 1,
      easing: 'easeOutQuad',
      duration: this.duration(options.duration || 600),
      update: () => { if (element) element.textContent = Math.round(obj.value) },
      ...options
    })
  }

  fade(element, from, to, onComplete, options = {}) {
    element.style.opacity = from
    return anime({
      targets: element, opacity: to,
      easing: 'easeOutQuad',
      duration: this.duration(options.duration || 300),
      complete: onComplete, ...options
    })
  }

  cancel(element) { anime.remove(element) }
  cancelAll() { anime.remove('*') }
}

export const animator = new Animator()
