/*! https://github.com/w3c/webcodecs/tree/main/samples/mp4-decode */

import MP4Box from 'https://cdn.skypack.dev/mp4box';

export class MP4Source {
    constructor(uri) {
        this.file = MP4Box.createFile();
        this.file.onError = console.error.bind(console);
        this.file.onReady = this.onReady.bind(this);
        this.file.onSamples = this.onSamples.bind(this);

        fetch(uri).then(response => {
            const reader = response.body.getReader();
            let offset = 0;
            let mp4File = this.file;

            function appendBuffers({ done, value }) {
                if (done) {
                    mp4File.flush();
                    return;
                }

                let buf = value.buffer;
                buf.fileStart = offset;

                offset += buf.byteLength;

                mp4File.appendBuffer(buf);

                return reader.read().then(appendBuffers);
            }

            return reader.read().then(appendBuffers);
        })

        this.info = null;
        this._info_resolver = null;
    }

    onReady(info) {
        // TODO: Generate configuration changes.
        this.info = info;

        if (this._info_resolver) {
            this._info_resolver(info);
            this._info_resolver = null;
        }
    }

    getInfo() {
        if (this.info)
            return Promise.resolve(this.info);

        return new Promise((resolver) => { this._info_resolver = resolver; });
    }

    getAvccBox() {
        // TODO: make sure this is coming from the right track.
        return this.file.moov.traks[0].mdia.minf.stbl.stsd.entries[0].avcC
    }

    start(track, onChunk) {
        this._onChunk = onChunk;
        this.file.setExtractionOptions(track.id);
        this.file.start();
    }

    onSamples(track_id, ref, samples) {
        for (const sample of samples) {
            const type = sample.is_sync ? "key" : "delta";

            const chunk = new EncodedVideoChunk({
                type: type,
                timestamp: sample.cts,
                duration: sample.duration,
                data: sample.data
            });

            this._onChunk(chunk);
        }
    }
}