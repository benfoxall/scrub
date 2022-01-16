const worker = new Worker('decode-worker.js', { type: "module" })

// worker.postMessage("videos/ferry-3.5mb.mp4")
// worker.postMessage("videos/ferry-20mb.mp4")
// worker.postMessage("videos/ferry-trim.mp4")
worker.postMessage("videos/earth.mp4")

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
document.body.appendChild(canvas)

const bitmaps = window.bitmaps = []

worker.addEventListener('message', (event) => {
    if (event.data instanceof ImageBitmap) {
        bitmaps.push(event.data)

        setScrollHeight()

        if (canvas.width !== event.data.width) {
            canvas.width = event.data.width
            canvas.height = event.data.height
            render()
        }
    } else {
        console.error("unexpected message")
    }
})


// scroll unit
const step = 24;
let raf = null;
let idx = 0;

function render() {
    const bitmap = bitmaps[idx]
    if (bitmap) {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    }
}

function setScrollHeight() {
    document.body.style.height = `calc(100vh + ${bitmaps.length * step}px)`
}
function onScroll() {
    const idx2 = Math.floor(window.scrollY / step);

    if (idx !== idx2) {
        idx = idx2;
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(render)
    }
}

window.addEventListener('scroll', onScroll)


// window.addEventListener('mousemove', (e) => {
//     const idx2 = Math.floor((e.clientY / window.innerHeight) * bitmaps.length)


//     if (idx !== idx2) {
//         idx = idx2;
//         requestAnimationFrame(render)
//     }

//     e.preventDefault()
// })

// window.addEventListener('touchmove', (e) => {
//     const y = e.touches[0].clientY
//     const idx2 = Math.floor((y / window.innerHeight) * bitmaps.length)

//     if (idx !== idx2) {
//         idx = idx2;
//         requestAnimationFrame(render)
//     }


//     e.preventDefault()
// }, { passive: false })

