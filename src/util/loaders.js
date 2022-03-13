import * as THREE from "three";
import { BufferGeometry, Vector3 } from "three";

export class VideoCubeTexture {
  z = 0;

  constructor(x = 512, y = 512, depth = 512) {
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
  constructor(points2d, unfurl = false) {
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

    // if unfurl
    if (unfurl) {
      this.setAttribute("tex_position", this.getAttribute("position"));

      const points3dFlat = [];
      let v0 = new Vector3();
      const down = new THREE.Matrix4().makeTranslation(0, 1, 0);

      let length = 0;
      points2d.reduce((prev, next) => {
        if (prev) length += prev.distanceTo(next);
        return next;
      });
      const lengthsq = Math.sqrt(length);

      points2d
        .map((p) => new THREE.Vector3(...p.toArray()))
        .reduce((prev, next) => {
          if (prev) {
            const dist = prev.distanceTo(next);

            const a = v0.clone();
            const a2 = v0.clone().applyMatrix4(down);

            v0.add(new Vector3(dist, 0, 0));

            const b = v0.clone();
            const b2 = v0.clone().applyMatrix4(down);

            points3dFlat.push(a, b, b2, a2, a, b2);
          }

          if (v0.x > lengthsq) {
            v0.x = 0;
            v0.y -= 1.1;
          }

          return next;
        });

      this.setFromPoints(points3dFlat);
    }
    this.center();
  }
}
