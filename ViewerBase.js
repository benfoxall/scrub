
export class ViewerBase {
    constructor(src) {
        const decoder = new Worker('./decode-worker.js', { type: "module" })

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