const workerSrc = new URL("./worker.js", import.meta.url).href;
console.log(workerSrc)

export class ViewerBase {
    constructor(src) {

        const decoder = new Worker(workerSrc, { type: "module" })

        decoder.addEventListener('message', (event) => {
            if (event.data instanceof ImageBitmap) {
                this.handle(event.data);
            } else {
                console.error("unexpected")
            }
        })

        decoder.postMessage(src)
    }

    handle(bitmap) { }
}