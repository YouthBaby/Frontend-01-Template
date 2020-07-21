export class Timeline {
  constructor() {
    this.animations = [];
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
      let progression = animation.getProgression(t);
      animation.value = animation.valueFromProgression(progression);
      if (progression < 1) {
        this.animations.push(animation);
      }
    }
    if (this.animations.length > 0) {
      this.requestId = requestAnimationFrame(this.tick)
    }
  }
  pause() {
    if (this.requestId !== null && this.state === "playing") {
      this.state = "paused";
      this.pauseTime = Date.now();
      cancelAnimationFrame(this.requestId);
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
  restart() {
    if (this.state === "playing") {
      this.pause();
    }
    this.animations = [];
    this.requestId = null;
    this,status = "playing";
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
  }
  get value() {
    return this.object[this.property];
  }
  set value(val) {
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
