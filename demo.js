import { MP4Demuxer } from './mp4_demuxer.js'

// importScripts('./mp4box.all.min.js');
// importScripts('./mp4_demuxer.js');


// let offscreen = e.data.canvas;
// let ctx = offscreen.getContext('2d');

const offscreen = document.createElement('canvas')
const ctx = offscreen.getContext('2d')
document.body.appendChild(offscreen)

let startTime = 0;
let frameCount = 0;

let demuxer = new MP4Demuxer("water-low.mp4");
// let demuxer = new MP4Demuxer("VID_20190103_140152.mp4");


function getFrameStats() {
    let now = performance.now();
    let fps = "";

    if (frameCount++) {
        let elapsed = now - startTime;
        fps = " (" + (1000.0 * frameCount / (elapsed)).toFixed(0) + " fps)"
    } else {
        // This is the first frame.
        startTime = now;
    }

    return "Extracted " + frameCount + " frames" + fps;
}


const bitmaps = window.bitmaps = []

let idx = 0;

function render() {
    const bitmap = bitmaps[idx]
    if (bitmap) {
        ctx.drawImage(bitmap, 0, 0, offscreen.width, offscreen.height);
    }
}

window.addEventListener('mousemove', (e) => {
    const idx2 = Math.floor((e.clientX / window.innerWidth) * bitmaps.length)

    if (idx !== idx2) {
        idx = idx2;
        requestAnimationFrame(render)
    }

    e.preventDefault()
})

window.addEventListener('touchmove', (e) => {
    const x = e.touches[0].clientX

    const idx2 = Math.floor((x / window.innerWidth) * bitmaps.length)

    if (idx !== idx2) {
        idx = idx2;
        requestAnimationFrame(render)
    }


    e.preventDefault()
}, { passive: false })


let decoder = new VideoDecoder({
    output: async frame => {
        // ctx.drawImage(frame, 0, 0, offscreen.width, offscreen.height);

        // frames.push(frame)
        bitmaps.push(await createImageBitmap(frame))
        // Close ASAP.
        frame.close();

        requestAnimationFrame(render)

        // Draw some optional stats.
        // ctx.font = '35px sans-serif';
        // ctx.fillStyle = "#ffffff";
        // ctx.fillText(getFrameStats(), 40, 40, offscreen.width);
    },
    error: e => console.error(e),
});

demuxer.getConfig().then((config) => {
    offscreen.height = config.codedHeight;
    offscreen.width = config.codedWidth;

    decoder.configure(config);
    demuxer.start((chunk) => { decoder.decode(chunk); })
});
