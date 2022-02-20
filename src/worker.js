import { MP4Demuxer } from "./mp4/MP4Demuxer.js";

self.onmessage = (e) => {
  const path = e.data.path;

  let demuxer = new MP4Demuxer(path);
  let bitmapOpts = {};

  let decoder = new VideoDecoder({
    output: async (frame) => {
      const bitmap = await createImageBitmap(
        frame,
        // 500,
        // 200,
        // 1012,
        // 712,
        bitmapOpts
      );

      frame.close();

      self.postMessage(bitmap, [bitmap]);
    },
    error: (e) => console.error(e),
  });

  demuxer.getConfig().then((config) => {
    bitmapOpts.resizeHeight = config.codedHeight;
    bitmapOpts.resizeWidth = config.codedWidth;

    decoder.configure(config);
    demuxer.start((chunk) => {
      decoder.decode(chunk);
    });
  });
};
