import * as THREE from "three";
import { ViewerBase } from "./ViewerBase.js";
import { OrbitControls } from "../ext/OrbitControls.js";

const slideX = document.querySelector("[name=x]");
const slideY = document.querySelector("[name=y]");
const slideZ = document.querySelector("[name=z]");

const vertexShader = `
out vec3 coord;

void main() {
  coord = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
const fragmentShader = `
precision mediump sampler3D;
in vec3 coord;

uniform sampler3D tex3d;

void main() {
  vec4 tcolor = texture(tex3d, coord + 0.5);
  tcolor.a = 1.0;
  gl_FragColor = tcolor;
}
`;

export class Ribbon extends ViewerBase {
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();

    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const subBoxGeom = boxGeom.clone();

    // const u8 = new Uint8Array(512 * 512 * 512 * 4);
    const u8 = null; // (throws an error, but saves .5gb)

    this.tex3d = new THREE.Data3DTexture(u8, 512, 512, 300);

    this.tex3d.needsUpdate = true;

    const material2 = (this.material2 = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        tex3d: { value: this.tex3d },
      },
      vertexShader,
      fragmentShader,
    }));

    const cube = new THREE.Mesh(subBoxGeom, material2);
    cube.rotateX(Math.PI);
    scene.add(cube);

    const cubeBase = new THREE.Mesh(
      boxGeom,
      new THREE.MeshBasicMaterial({
        color: 0x111111,
        depthTest: false,
      })
    );
    scene.add(cubeBase);
    cubeBase.renderOrder = 1;
    cube.renderOrder = 2;

    camera.position.z = 4;

    function animate() {
      requestAnimationFrame(animate);
      subBoxGeom.copy(boxGeom);

      const x = slideX.valueAsNumber;
      const y = slideY.valueAsNumber;
      const z = slideZ.valueAsNumber;

      subBoxGeom.translate(-0.5, -0.5, -0.5);
      subBoxGeom.scale(x, y, z);
      subBoxGeom.translate(0.5, 0.5, 0.5);

      controls.update();

      renderer.render(scene, camera);
    }

    window.rwe = renderer;

    animate();
  }

  handle(bitmap) {
    const z = this.z++ % 512;

    if (this.z > 300) return;

    this.renderer.copyTextureToTexture3D(
      new THREE.Box3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(511, 511, 0)
      ),
      new THREE.Vector3(0, 0, z),
      { image: bitmap },
      this.tex3d
    );

    bitmap.close();
  }
}
