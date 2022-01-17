import { MP4Source } from './MP4Source.js'
import { Writer } from './Writer.js'

export class MP4Demuxer {
    constructor(uri) {
        this.source = new MP4Source(uri);
    }

    getExtradata(avccBox) {
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

    async getConfig() {
        let info = await this.source.getInfo();
        this.track = info.videoTracks[0];

        var extradata = this.getExtradata(this.source.getAvccBox());

        let config = {
            codec: this.track.codec,
            codedHeight: this.track.track_height,
            codedWidth: this.track.track_width,
            description: extradata,
        }

        return Promise.resolve(config);
    }

    start(onChunk) {
        this.source.start(this.track, onChunk);
    }
}
