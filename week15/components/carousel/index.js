import { create } from '../../utils/create-element';
import './index.css';

export class Carousel {
  constructor({
    autoplay = true,
    duration = 3000
  } = {}) {
    this.position = 0;
    this.imgList = [];
    this.root = null;
    this.width = null;
    this.timer = null;
    this.autoplay = autoplay;
    this.duration = duration;
  }

  setAttribute(key, value) {
    this[key] = value;
    if (key === 'data') {
      this.setImgList(value);
    }
  }

  setImgList(imgList) {
    this.imgList = imgList.map(url=> {
      let element = <img src={url} />;
      element.addEventListener("dragstart", e => e.preventDefault());
      return element;
    })
    this.root = <div class="carousel">
      {this.imgList}
    </div>
  }

  appendChild(child) {

  }

  setTransform(pos, offset , setP = false) {
    let el = this.imgList[pos];
    el.style.transition = `all ease ${setP ? 0 : 0.5}s`;
    el.style.transform = `translateX(${offset})`;
  }

  swipe() {
    let position = this.position;
    let nextPosition = (position + 1) % this.data.length;
    this.setTransform(position, `${-100 * position}%`, true);
    this.setTransform(nextPosition, `${100 - 100 * nextPosition}%`, true);
    let offsetWidth = this.root.offsetWidth; // repaint
    this.setTransform(position, `${-100 - 100 * position}%`);
    this.setTransform(nextPosition, `${-100 * nextPosition}%`);
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
    this.root.addEventListener("mousedown", () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      let width = this.width;
      let startX = event.clientX;
      let length = this.data.length;
      let position = this.position;
      let nextPos = (position + 1) % length;
      let lastPos = (position - 1 + length) % length;

      this.setTransform(position, `${-width * position}px`, true);
      this.setTransform(lastPos, `${ -width - width * lastPos}px`, true);
      this.setTransform(nextPos, `${width - width * nextPos}px`, true);

      let move = event => {
        let offsetX = event.clientX - startX;
        this.setTransform(position, `${offsetX - width * position}px`, true);
        this.setTransform(lastPos, `${offsetX - width - width * lastPos}px`, true);
        this.setTransform(nextPos, `${offsetX + width - width * nextPos}px`, true);
      };
      let up = (event) => {
        let offsetX = event.clientX - startX;
        let offset = offsetX > 250 ? 1 : offsetX < -250 ? -1 : 0;

        this.setTransform(position, `${(offset - position) * width}px`);
        this.setTransform(lastPos, `${(offset - lastPos - 1) * width}px`);
        this.setTransform(nextPos, `${(offset - nextPos + 1) * width}px`);
        this.position = (position - offset + length) % length;
        this.start();
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    })

    return this.root;
  }

  mountTo(parent) {
    this.render().mountTo(parent);
    this.width = this.root.offsetWidth;
    this.autoplay && this.start();
  }
}
