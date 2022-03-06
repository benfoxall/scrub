import * as THREE from "three";

export class VideoCubeTexture {
  z = 0;

  constructor(x = 512, y = 512, depth = 300) {
    // const u8 = new Uint8Array(x * y * depth * 4);
    const u8 = null; // (throws an error, but saves .5gb)
    this.texture = new THREE.Data3DTexture(u8, x, y, depth);
    this.texture.needsUpdate = true;

    Object.assign(this, { x, y, depth });
  }

  // remember to dispose of bitmap
  handleBitmap(bitmap, renderer) {
    if (this.z >= this.depth) {
      console.log("Skipping");
      return;
    }

    renderer.copyTextureToTexture3D(
      new THREE.Box3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(511, 511, 0)
      ),
      new THREE.Vector3(0, 0, this.z % this.depth),
      { image: bitmap },
      this.texture
    );

    this.z++;
  }
}
