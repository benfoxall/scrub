import { ViewerBase } from "./ViewerBase.js";

import * as THREE from "https://cdn.skypack.dev/three@0.138.0";

const scrollStep = 12;

export class Cube extends ViewerBase {
  bitmaps = [];
  canvas = document.createElement("canvas");

  constructor(url) {
    super(url);

    document.body.appendChild(this.canvas);

    const rect = this.canvas.getBoundingClientRect();

    const width = rect.width; //window.innerWidth * 0.8;
    const height = rect.height; //window.innerHeight * 0.8;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();
  }

  handle(bitmap) {
    // const z = this.z++ % 512;

    // if (this.z > 512) return;

    // const { gl } = this;

    // gl.bindTexture(gl.TEXTURE_3D, this.texture);

    // gl.texSubImage3D(
    //   gl.TEXTURE_3D,
    //   0,
    //   -600, // x
    //   -600, // y
    //   z, // z
    //   512, // width
    //   512, // height
    //   1, // depth
    //   gl.RGBA,
    //   gl.UNSIGNED_BYTE,
    //   bitmap
    // );

    bitmap.close();
  }
}
