import * as THREE from "three";
import { ViewerBase } from "./ViewerBase.js";
import { OrbitControls, MapControls } from "../ext/OrbitControls.js";
import { RibbonGeometry, spiral, VideoCubeTexture } from "./util/loaders.js";
import { Mesh } from "three";

const vertexShader = `
out vec3 coord;
attribute vec3 tex_position;

void main() {
  coord = tex_position ;//position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
const fragmentShader = `
precision mediump sampler3D;
in vec3 coord;

uniform sampler3D cube;
uniform float time;

void main() {
    vec3 target = coord + 0.5;
    target.x = mod(target.x + time / 10.0, 1.0);

  vec4 tcolor = texture(cube, target);
  tcolor.a = 1.0;
  gl_FragColor = tcolor;
}
`;

export class SpiralFlat extends ViewerBase {
  bitmaps = [];
  canvas = document.createElement("canvas");
  z = 0;

  constructor(url) {
    super(url);

    document.body.appendChild(this.canvas);

    const rect = this.canvas.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = (this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    }));
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const controls = new MapControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();

    this.videoCube = new VideoCubeTexture();

    const material2 = (this.material2 = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        cube: { value: this.videoCube.texture },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    }));

    const ribbon = new RibbonGeometry(spiral(1500), true);
    ribbon.rotateX(-Math.PI / 2);

    const mesh = new Mesh(ribbon, material2);

    scene.add(mesh);

    camera.position.set(0, 2, 0);

    function animate(t = 0) {
      requestAnimationFrame(animate);

      controls.update();
      //   ribbon.rotateZ(0.001);
      material2.uniforms.time.value = t / 1000;

      renderer.render(scene, camera);
    }

    animate();
  }

  handle(bitmap) {
    this.videoCube.handleBitmap(bitmap, this.renderer);
    bitmap.close();
  }
}
