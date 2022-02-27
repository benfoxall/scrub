import { ViewerBase } from "./ViewerBase.js";

import * as THREE from "three";
import { OrbitControls } from "../ext/OrbitControls.js";

const slideX = document.querySelector("[name=x]");
const slideY = document.querySelector("[name=y]");
const slideZ = document.querySelector("[name=z]");

console.log("---", OrbitControls);

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

  gl_FragColor = vec4(coord.x, coord.y, coord.z, 1.0 );

  if(gl_FragColor.r > 0.5) {
    gl_FragColor.r = 1.0;
  }

  vec4 tcolor = texture(tex3d, coord + 0.5);

  // tcolor.g = 1.0;
  tcolor.a = 1.0;

  gl_FragColor = tcolor;

  // gl_FragColor.r = 1.0;

  // gl_FragColor = vec4(tcolor.rg, gl_FragCoord.y / 255.0, 1.0 );

}

      `;

export class Cube extends ViewerBase {
  bitmaps = [];
  canvas = document.createElement("canvas");
  z = 0;

  constructor(url) {
    super(url);

    document.body.appendChild(this.canvas);

    const rect = this.canvas.getBoundingClientRect();

    const width = rect.width; //window.innerWidth * 0.8;
    const height = rect.height; //window.innerHeight * 0.8;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = (this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    }));
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();

    const base = new THREE.BoxGeometry(1, 1, 1);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const v = geometry.getAttribute("position").clone();

    // const initial = geometry.attributes.position.clone();
    // console.log(initial);
    // const reset = () => {
    //   geometry.attributes.position.clo

    // }

    const u8 = new Uint8Array(512 * 512 * 512 * 4);

    // REMOVE THIS
    // for (let i = 0; i < u8.length; i += 4) u8[i] = Math.random() * 255;

    this.tex3d = new THREE.Data3DTexture(u8, 512, 512, 300);
    this.tex3d.format = THREE.RGBAFormat;
    // this.tex3d.format = THREE.sRGBEncoding;
    this.tex3d.type = THREE.UnsignedByteType;
    // this.tex3d.minFilter = this.tex3d.magFilter = THREE.LinearFilter;
    // this.tex3d.unpackAlignment = 1;
    this.tex3d.needsUpdate = true;

    // material2.uniforms.tex3d.value = this.tex3d;

    const material2 = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        tex3d: { value: this.tex3d },
      },

      vertexShader,

      fragmentShader,
    });

    const cube = new THREE.Mesh(geometry, material2);
    cube.rotateX(Math.PI);
    scene.add(cube);

    const cubeBase = new THREE.Mesh(
      base,
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

      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;
      geometry.copy(base);

      const x = (512 - slideX.valueAsNumber) / 512;
      const y = (512 - slideY.valueAsNumber) / 512;
      const z = (512 - slideZ.valueAsNumber) / 512;

      geometry.translate(-0.5, -0.5, -0.5);
      geometry.scale(x, y, z);
      geometry.translate(0.5, 0.5, 0.5);

      controls.update();

      renderer.render(scene, camera);

      // geometry.scale(-x, 1, 1);
    }

    window.rwe = renderer;

    animate();
  }

  handle(bitmap) {
    const z = this.z++ % 512;
    // if (this.z > 3) return;

    // return;

    if (this.z > 300) return;

    // const { gl } = this;

    // gl.bindTexture(gl.TEXTURE_3D, this.tex3d);

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
    console.log("x");

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
