import * as THREE from "three";
import { BufferGeometry } from "three";

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

// generate 2d points in a spiral shape
export function spiral(n) {
  const points = [];
  for (let i = 0; i < n; i++) {
    const angle = i / 10;
    const length = i / n;

    const v = new THREE.Vector2(0, length / 2).rotateAround(
      new THREE.Vector2(0, 0),
      angle
    );

    points.push(v);
  }

  return points;
}

export class RibbonGeometry extends BufferGeometry {
  constructor(points2d) {
    super();

    const points3d = [];

    const left = new THREE.Matrix4().makeTranslation(0, 0, -0.5);
    const right = new THREE.Matrix4().makeTranslation(0, 0, 0.5);

    points2d
      .map((p) => new THREE.Vector3(...p.toArray()))
      .reduce((prev, next) => {
        if (prev) {
          const a = prev.clone().applyMatrix4(left);
          const b = next.clone().applyMatrix4(left);
          const c = prev.clone().applyMatrix4(right);
          const d = next.clone().applyMatrix4(right);

          points3d.push(a, b, d, c, a, d);
        }
        return next;
      });

    this.setFromPoints(points3d);
  }
}
