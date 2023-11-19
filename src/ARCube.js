import * as THREE from "three";
import { ViewerBase } from "./ViewerBase.js";
import { OrbitControls } from "../ext/OrbitControls.js";
import { VideoCubeTexture } from "./util/loaders.js";
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D();




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

uniform sampler3D cube;

void main() {
  vec4 tcolor = texture(cube, coord + 0.5);
  tcolor.a = 1.0;
  gl_FragColor = tcolor;
}
`;

export class ARCube extends ViewerBase {
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
        renderer.xr.enabled = true;

        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.update();

        const boxGeom = new THREE.BoxGeometry(1, 1, 1);
        // wrong, but kind of cool
        //boxGeom.rotateX(0.4);

        const subBoxGeom = boxGeom.clone();

        this.videoCube = new VideoCubeTexture();

        const material2 = (this.material2 = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 1.0 },
                resolution: { value: new THREE.Vector2() },
                cube: { value: this.videoCube.texture },
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
        // scene.add(cubeBase);
        cubeBase.renderOrder = 1;
        cube.renderOrder = 2;

        // camera.position.set(1, 2, 2);
        camera.position.set(0, 0, 1.5);

        renderer.setAnimationLoop(function (time) {
            subBoxGeom.copy(boxGeom);

            const x = (noise2D(1, time * 0.0001) + 1) / 2;
            const y = (noise2D(7, time * 0.0001) + 1) / 2;
            const z = (noise2D(42, time * 0.0001) + 1) / 2;

            subBoxGeom.scale(x, y, z);
            subBoxGeom.translate(-0.5, -0.5, -0.5);

            subBoxGeom.translate(0.5, 0.5, 0.5);

            controls.update();

            renderer.render(scene, camera);

        });

        document.body.appendChild(ARButton.createButton(renderer));
    }

    handle(bitmap) {
        this.videoCube.handleBitmap(bitmap, this.renderer);
        bitmap.close();
    }
}
