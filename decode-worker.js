
import { MP4Demuxer } from './mp4_demuxer.js'


self.onmessage = (e) => {
    const file = e.data;

    let demuxer = new MP4Demuxer(file);


    let decoder = new VideoDecoder({
        output: async frame => {

            const bitmap = await createImageBitmap(frame)

            // Close ASAP.
            frame.close();

            self.postMessage(bitmap, [bitmap])

        },
        error: e => console.error(e),
    });

    demuxer.getConfig().then((config) => {
        
        decoder.configure(config);
        demuxer.start((chunk) => { decoder.decode(chunk); })

    });


}




