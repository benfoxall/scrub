/*! https://github.com/w3c/webcodecs/tree/main/samples/mp4-decode */

// todo - lock version
import MP4Box from "https://cdn.skypack.dev/mp4box";

export class MP4Transform extends TransformStream {
  constructor() {
    const file = MP4Box.createFile();

    let offset = 0;
    // let decoder;
    super({
      start(controller) {
        file.onReady = (info) => {
          this.info = info;

          // let info = await this.source.getInfo();
          const track = info.videoTracks[0];

          const getAvccBox =
            file.moov.traks[0].mdia.minf.stbl.stsd.entries[0].avcC;

          var extradata = getExtradata(getAvccBox);

          let config = {
            codec: track.codec,
            codedHeight: track.track_height,
            codedWidth: track.track_width,
            description: extradata,
          };

          // config as first chunk
          controller.enqueue(config);

          // then start the reset
          file.setExtractionOptions(track.id);
          file.start();
        };
        file.onError = (err) => {
          controller.error(err);
        };
        file.onSamples = (track_id, ref, samples) => {
          for (const sample of samples) {
            const type = sample.is_sync ? "key" : "delta";

            const chunk = new EncodedVideoChunk({
              type: type,
              timestamp: sample.cts,
              duration: sample.duration,
              data: sample.data,
            });

            // this._onChunk(chunk);
            controller.enqueue(chunk);
            // decoder.decode(chunk);
          }
        };
      },
      transform(chunk, controller) {
        let buf = chunk.buffer;
        buf.fileStart = offset;

        offset += buf.byteLength;

        file.appendBuffer(buf);
      },
      flush() {
        file.flush();

        return new Promise((resolve) => setTimeout(resolve, 1000));
      },
    });
  }
}

export class DecoderStream extends TransformStream {
  constructor() {
    let decoder;
    super({
      async transform(chunk, controller) {
        // config
        if (!decoder) {
          decoder = new VideoDecoder({
            output: async (frame) => {
              console.log("F");
              console.log("D", decoder.decodeQueueSize);
              await controller.enqueue(frame);
              frame.close();
            },
            error: (err) => controller.error(err),
          });

          decoder.configure(chunk);
        } else {
          console.log("D", decoder.decodeQueueSize);
          await decoder.decode(chunk);
          // await new Promise((resolve) => setTimeout(resolve, 100));

          self.dec = decoder;
        }
      },
    });
  }
}

class Writer {
  constructor(size) {
    this.data = new Uint8Array(size);
    this.idx = 0;
    this.size = size;
  }

  getData() {
    if (this.idx != this.size)
      throw "Mismatch between size reserved and sized used";

    return this.data.slice(0, this.idx);
  }

  writeUint8(value) {
    this.data.set([value], this.idx);
    this.idx++;
  }

  writeUint16(value) {
    // TODO: find a more elegant solution to endianess.
    var arr = new Uint16Array(1);
    arr[0] = value;
    var buffer = new Uint8Array(arr.buffer);
    this.data.set([buffer[1], buffer[0]], this.idx);
    this.idx += 2;
  }

  writeUint8Array(value) {
    this.data.set(value, this.idx);
    this.idx += value.length;
  }
}

function getExtradata(avccBox) {
  var i;
  var size = 7;
  for (i = 0; i < avccBox.SPS.length; i++) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.SPS[i].length;
  }
  for (i = 0; i < avccBox.PPS.length; i++) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.PPS[i].length;
  }

  var writer = new Writer(size);

  writer.writeUint8(avccBox.configurationVersion);
  writer.writeUint8(avccBox.AVCProfileIndication);
  writer.writeUint8(avccBox.profile_compatibility);
  writer.writeUint8(avccBox.AVCLevelIndication);
  writer.writeUint8(avccBox.lengthSizeMinusOne + (63 << 2));

  writer.writeUint8(avccBox.nb_SPS_nalus + (7 << 5));
  for (i = 0; i < avccBox.SPS.length; i++) {
    writer.writeUint16(avccBox.SPS[i].length);
    writer.writeUint8Array(avccBox.SPS[i].nalu);
  }

  writer.writeUint8(avccBox.nb_PPS_nalus);
  for (i = 0; i < avccBox.PPS.length; i++) {
    writer.writeUint16(avccBox.PPS[i].length);
    writer.writeUint8Array(avccBox.PPS[i].nalu);
  }

  return writer.getData();
}
