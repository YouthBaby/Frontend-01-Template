export class Timeline {
  constructor() {
    this.animations = [];
    this.finishedAnimations = [];
    this.requestId = null;
    this.startTime = null;
    this.pauseTime = null;
    this.state = "inited";
    this.tick = this.tick.bind(this);
  }
  tick() {
    let animations = this.animations.slice(0);
    let t = Date.now() - this.startTime;
    this.animations = [];
    for (let animation of animations) {
      if (t < animation.delay + animation.addTime) continue;
      let progression = animation.getProgression(t);
      animation.value = animation.valueFromProgression(progression);
      if (progression < 1) {
        this.animations.push(animation);
      } else {
        this.finishedAnimations.push(animations);
      }
    }
    if (this.animations.length > 0) {
      this.requestId = requestAnimationFrame(this.tick)
    } else {
      this.requestId = null;
    }
  }
  pause() {
    if (this.requestId !== null && this.state === "playing") {
      this.state = "paused";
      this.pauseTime = Date.now();
      if (this.requestId !== null) {
        cancelAnimationFrame(this.requestId);
        this.requestId = null;
      }
    }
  }
  resume() {
    if (this.state === "paused") {
      this.state = "playing";
      this.startTime += Date.now() - this.pauseTime;
      this.tick();
    }
  }
  start() {
    if (this.state === "inited") {
      this.state = "playing";
      this.startTime = Date.now();
      this.tick();
    }
  }
  reset() {
    if (this.state === "playing") {
      this.pause();
    }
    this.animations = [];
    this.finishedAnimations = [];
    this.requestId = null;
    this.startTime = Date.now();
    this.pauseTime = null;
    this.state = "inited";
  }
  restart() {
    if (this.state === "playing") {
      this.pause();
    }
    for (let animation of this.finishedAnimations) {
      this.animations.push(animation);
    }
    this.finishedAnimations = [];
    this.requestId = null;
    this.state = "playing";
    this.startTime = Date.now();
    this.pauseTime = null;
    this.tick();
  }

  add(animation, addTime) {
    this.animations.push(animation);
    animation.addTime = addTime !== void 0
      ? addTime
      : this.state === "playing"
        ? Date.now() - this.startTime
        : 0;
    if (this.state === "playing" && this.requestId === null) {
      this.tick();
    }
  }
}

export class Animation {
  /**
   * @param {object} object
   * @param {string} property
   * @param {number} start
   * @param {number} end
   * @param {number} duration
   * @param {number} delay
   * @param {Function} timingFunction
   * @param {Function} template
   * @param {number} addTime
   */
  constructor(object, property, start, end, duration, delay, timingFunction, template, addTime) {
    this.object = object;
    this.property = property;
    this.start = start;
    this.end = end;
    this.duration = duration || 1500;
    this.delay = delay || 0;
    this.timingFunction = timingFunction;
    this.template = template;
    this.addTime = addTime || 0;
    this.originValue = null;
  }
  get value() {
    return this.object[this.property];
  }
  set value(val) {
    this.originValue = val;
    return this.object[this.property] = this.template(val);
  }
  /**
   * @param {number} t
   * @return {number}
   */
  getProgression(t) {
    let progression = (t - this.delay - this.addTime) / this.duration;
    let computedProgression = progression >= 1 ? 1 : this.timingFunction(progression);
    return Math.min(computedProgression, 1);
  }
  /**
   * @param {number} progression
   * @return {number}
   */
  valueFromProgression(progression) {
    return this.start + progression * (this.end - this.start);
  }
}
