import { ViewerBase } from "./ViewerBase.js";

const scrollStep = 12;

export class Scroller extends ViewerBase {
  bitmaps = [];
  canvas = document.createElement("canvas");
  ctx = this.canvas.getContext("2d");

  constructor(url) {
    super(url);
    document.body.appendChild(this.canvas);

    this.render = memo(raf(this.render.bind(this)));

    window.addEventListener("scroll", () => {
      const idx = Math.floor(window.scrollY / scrollStep);

      this.render(this.bitmaps[idx]);
    });
  }

  handle(bitmap) {
    this.bitmaps.push(bitmap);

    if (this.bitmaps.length === 1) this.render(bitmap);

    document.body.style.height = `calc(100vh + ${
      this.bitmaps.length * scrollStep
    }px)`;
  }

  render(bitmap) {
    if (bitmap) {
      const { width, height } = bitmap;

      if (this.canvas.width !== width) {
        this.canvas.width = width;
        this.canvas.height = height;
      }

      this.ctx.drawImage(bitmap, 0, 0, width, height);
    }
  }
}

function raf(fn) {
  let handle;
  return function (...args) {
    cancelAnimationFrame(handle);
    handle = requestAnimationFrame(() => fn(...args));
  };
}

function memo(fn) {
  let prev;
  return function (...arg) {
    if (arg !== prev) {
      prev = arg;
      fn(...arg);
    }
  };
}
