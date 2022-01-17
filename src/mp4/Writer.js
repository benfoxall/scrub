/*! https://github.com/w3c/webcodecs/tree/main/samples/mp4-decode */

export class Writer {
    constructor(size) {
        this.data = new Uint8Array(size);
        this.idx = 0;
        this.size = size;
    }

    getData() {
        if (this.idx != this.size)
            throw "Mismatch between size reserved and sized used"

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