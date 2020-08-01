import { create } from '../../utils/create-element';
import { Timeline, Animation } from '../../animation';
import { ease, linear } from '../../cubicBezier';
import './index.css';

export class Carousel {
  constructor({
    autoplay = true,
    duration = 3000
  } = {}) {
    this.position = 0;
    this.width = null;
    this.timer = null;
    this.autoplay = autoplay;
    this.duration = duration;
    this.children = [];
    this.childNodeList = null;
    this.timeLine = new Timeline;
    this.timeLine.start();
  }

  setAttribute(key, value) {
    this[key] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  setAnimation(pos, start, end) {
    let el = this.childNodeList[pos];
    let animation = new Animation(el.style, "transform", start, end, 500, 0, ease, v => `translateX(${v}px)`);
    this.timeLine.add(animation);
  }

  swipe() {
    let width = this.width;
    let position = this.position;
    let nextPosition = (position + 1) % this.data.length;
    this.setAnimation(position, - width * position, - width - width * position);
    this.setAnimation(nextPosition, width - width * nextPosition, - width * nextPosition);
    this.position = nextPosition;
    this.start();
  }

  start() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(this.swipe.bind(this), this.duration);
  }

  render() {
    let length = this.data.length;
    let children = this.childNodeList = this.data.map((url, currentPosition) => {
      let lastPosition = (currentPosition - 1 + length) % length;
      let nextPosition = (currentPosition + 1) % length;
      let offset = 0;
      let onStart = event => {
        this.timeLine.pause();
        clearTimeout(this.timer);
        let currentElement = children[currentPosition];
        let currentTransformValue = Number(currentElement.style.transform.match(/translateX\(([\s\S]+)px\)/)[1]);
        offset = currentTransformValue + this.width * currentPosition;
      }

      let onPan = event => {
        let width = this.width;
        let deltaX = event.detail.clientX - event.detail.startX + offset;
        let lastElement = children[lastPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];

        let currentTransformValue = - width * currentPosition + deltaX;
        let lastTransformValue = - width - width * lastPosition + deltaX;
        let nextTransformValue = width - width * nextPosition + deltaX;

        lastElement.style.transform = `translateX(${lastTransformValue}px)`;
        currentElement.style.transform = `translateX(${currentTransformValue}px)`;
        nextElement.style.transform = `translateX(${nextTransformValue}px)`;
      }

      let onPanend = event => {
        let width = this.width;
        let deltaX = event.detail.clientX - event.detail.startX + offset;
        let direction = deltaX > 250 ? 1 : deltaX < -250 ? -1 : 0;
        this.timeLine.reset();
        this.timeLine.start();
        this.setAnimation(lastPosition, - width - width * lastPosition + deltaX, - width - width * lastPosition + direction * width);
        this.setAnimation(currentPosition, - width * currentPosition + deltaX, - width * currentPosition + direction * width);
        this.setAnimation(nextPosition, width - width * nextPosition + deltaX, width - width * nextPosition + direction * width);

        this.position = (currentPosition - direction + length) % length;
        this.start();
      }

      let element = <img src={url} onStart={onStart} onPan={onPan} onPanend={onPanend} enableGesture={true} />;
      element.style.transform = "translateX(0px)";
      element.addEventListener("dragstart", e => e.preventDefault());
      return element;
    });

    return <div class="carousel">
      {children}
    </div>;
  }

  mountTo(parent) {
    let vnode = this.render();
    vnode.mountTo(parent);
    this.width = vnode.root.offsetWidth;
    this.autoplay && this.start();
  }
}
