const workerSrc = new URL("./worker.js", import.meta.url).href;

export class ViewerBase {
  constructor(path) {
    const decoder = new Worker(workerSrc, { type: "module" });

    decoder.addEventListener("message", (event) => {
      if (event.data instanceof ImageBitmap) {
        this.handle(event.data);
      } else {
        console.error("unexpected");
      }
    });

    Promise.resolve(path).then((path) => {
      decoder.postMessage({ path, maxFrames: 512 });
    });
  }

  handle(bitmap) {}
}
