class Wrapper {
  constructor(type) {
    this.children = [];
    this.root = document.createElement(type);
  }
  setAttribute(key, value) {
    this.root.setAttribute(key, value);
  }

  appendChild(child) {
    this.children.push(child);
  }

  addEventListener(...args) {
    this.root.addEventListener(...args);
  }

  get style() {
    return this.root.style;
  }

  get offsetWidth() {
    return this.root.offsetWidth;
  }

  mountTo(parent) {
    for (let child of this.children) {
      child.mountTo(this.root);
    }
    parent.appendChild(this.root);
  }
}

class Text {
  constructor(text) {
    this.$el = document.createTextNode(text)
  }
  mountTo(parent) {
    parent.appendChild(this.$el)
  }
}

export function create(Cls, attrs, ...children) {
  let o;
  if (typeof Cls === 'string') {
    o = new Wrapper(Cls);
  } else {
    o = new Cls();
  }
  for (let key in attrs) {
    o.setAttribute(key, attrs[key]);
  }
  let visit = (children) => {
    for (let child of children) {
      if (Array.isArray(child)) {
        visit(child);
        continue;
      }
      if (typeof child === "string") {
        child = new Text(child);
      }
      o.appendChild(child);
    }
  }
  visit(children);
  return o;
}
