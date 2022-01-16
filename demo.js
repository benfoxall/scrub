const worker = window.worker = new Worker('decode-worker.js', { type: "module" })

// worker.postMessage("videos/ferry-3.5mb.mp4")
// worker.postMessage("videos/ferry-20mb.mp4")
// worker.postMessage("videos/ferry-trim.mp4")
worker.postMessage("videos/earth.mp4")

const offscreen = document.createElement('canvas')
const ctx = offscreen.getContext('2d')
document.body.appendChild(offscreen)

const full = document.createElement('button')
document.body.appendChild(full)
full.innerText = '↖︎'

full.addEventListener('click', () => {
    offscreen.requestFullscreen();
})


// function toggleFullScreen() {
//     if (!document.fullscreenElement) {
//         offscreen.requestFullscreen();
//     } else {
//         if (document.exitFullscreen) {
//             document.exitFullscreen();
//         }
//     }
// }



const bitmaps = window.bitmaps = []

worker.addEventListener('message', (event) => {
    if (event.data instanceof ImageBitmap) {
        bitmaps.push(event.data)

        setScrollHeight()

        if (offscreen.width !== event.data.width) {
            offscreen.width = event.data.width
            offscreen.height = event.data.height
            render()
        }
    } else {
        console.error("unexpected message")
    }
})


// import { MP4Demuxer } from './mp4_demuxer.js'

// importScripts('./mp4box.all.min.js');
// importScripts('./mp4_demuxer.js');


// let offscreen = e.data.canvas;
// let ctx = offscreen.getContext('2d');


// let startTime = 0;
// let frameCount = 0;

// let demuxer = new MP4Demuxer("water-low.mp4");
// let demuxer = new MP4Demuxer("videos/ferry-3.5mb.mp4");
// let demuxer = new MP4Demuxer("VID_20190103_140152.mp4");






// const bitmaps = window.bitmaps = []
const step = 24;
let raf = null;
let idx = 0;

function render() {
    const bitmap = bitmaps[idx]
    if (bitmap) {
        ctx.drawImage(bitmap, 0, 0, offscreen.width, offscreen.height);
    }

    // ctx.globalAlpha = 1 - mix;
    // ctx.clearRect(0, 0, offscreen.width, offscreen.height)

    // for (let i = 0; i < 10; i++) {


    //     const bitmap = bitmaps[idx + i];

    //     ctx.globalAlpha = i * 0.1;
    //     // ctx.globalAlpha = 0.2
    //     // ctx.globalCompositeOperation = 'lighter';
    //     ctx.drawImage(bitmap, i * 20, i * 20, offscreen.width - (i * 40), offscreen.height - (i * 40));

    // }
}

function setScrollHeight() {
    // document.body.style.height = `calc(100vh + ${bitmaps.length * step}px)`
}
// function onScroll() {
//     const idx2 = Math.floor(window.scrollY / step);

//     if (idx !== idx2) {
//         idx = idx2;
//         cancelAnimationFrame(raf)
//         raf = requestAnimationFrame(render)
//     }
// }

// window.addEventListener('scroll', onScroll)


window.addEventListener('mousemove', (e) => {
    const idx2 = Math.floor((e.clientY / window.innerHeight) * bitmaps.length)


    if (idx !== idx2) {
        idx = idx2;
        requestAnimationFrame(render)
    }

    e.preventDefault()
})

window.addEventListener('touchmove', (e) => {
    const y = e.touches[0].clientY
    const idx2 = Math.floor((y / window.innerHeight) * bitmaps.length)

    if (idx !== idx2) {
        idx = idx2;
        requestAnimationFrame(render)
    }


    e.preventDefault()
}, { passive: false })




// let decoder = new VideoDecoder({
//     output: async frame => {
//         // ctx.drawImage(frame, 0, 0, offscreen.width, offscreen.height);

//         // frames.push(frame)
//         bitmaps.push(await createImageBitmap(frame))
//         // Close ASAP.
//         frame.close();

//         // idx = bitmaps.length - 1;

//         // requestAnimationFrame(render)

//         setScrollHeight()

//         // Draw some optional stats.
//         // ctx.font = '35px sans-serif';
//         // ctx.fillStyle = "#ffffff";
//         // ctx.fillText(getFrameStats(), 40, 40, offscreen.width);
//     },
//     error: e => console.error(e),
// });

// demuxer.getConfig().then((config) => {
//     offscreen.height = config.codedHeight;
//     offscreen.width = config.codedWidth;

//     decoder.configure(config);
//     demuxer.start((chunk) => { decoder.decode(chunk); })
// });
