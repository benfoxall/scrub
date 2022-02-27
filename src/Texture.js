import { ViewerBase } from "./ViewerBase.js";
import * as twgl from "https://cdn.skypack.dev/twgl.js";

const scrollStep = 12;

const vs = `
#version 300 es
in vec4 position;

void main() {
  gl_Position = position;
}
`;
const fs = `
#version 300 es
precision mediump float;
precision mediump sampler3D;

uniform vec2 resolution;

uniform float u_slide;
uniform sampler3D u_cubetex;

out vec4 outColor;

void main() {
  // gl_FragCoord.y *= -1.0;
  vec2 point = gl_FragCoord.xy / resolution.xy;

  point.y = (point.y * -1.0) + 1.0;
  float c = 1.0 - length(point - vec2(0.5, 0.5));

  float x = point.x;
  float y = point.y;

  outColor = texture(u_cubetex, 
    vec3(
      point, 
      u_slide * c * 0.5
    )
  );

  // outColor.r = outColor.g = c;

}
`;

export class Texture extends ViewerBase {
  bitmaps = [];
  canvas = document.createElement("canvas");

  constructor(url) {
    super(url);

    document.body.appendChild(this.canvas);

    this.canvas.width = this.canvas.height = 512;

    const gl = (this.gl = twgl.getContext(this.canvas));
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

    console.log("using: " + gl.getParameter(gl.VERSION)); // eslint-disable-line
    if (!twgl.isWebGL2(gl)) {
      alert("Sorry, this example requires WebGL 2.0"); // eslint-disable-line
      return;
    }

    const arrays = {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    const texture = (this.texture = twgl.createTexture(gl, {
      target: gl.TEXTURE_3D,
      width: 512,
      height: 512,
      depth: 512,
      wrap: gl.CLAMP_TO_EDGE,
      minMag: gl.LINEAR, //gl.NEAREST
    }));

    gl.bindTexture(gl.TEXTURE_3D, texture);

    const ext = gl.getExtension("GMAN_webgl_memory");
    // ...
    if (ext) {
      const info = ext.getMemoryInfo();
      console.log(info);
    }

    function render(time) {
      // twgl.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      const uniforms = {
        time: time * 0.001,
        resolution: [gl.canvas.width, gl.canvas.height],
        u_cubetex: texture,
        u_slide: slide.valueAsNumber / 512,
      };

      // window.uu = uniforms;

      gl.useProgram(programInfo.program);
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      twgl.setUniforms(programInfo, uniforms);
      // gl.activeTexture(gl.TEXTURE0);
      // twgl.setTexture(texture);
      // gl.bindTexture(gl.TEXTURE_3D, texture);
      // window.twgl = twgl;
      twgl.drawBufferInfo(gl, bufferInfo);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    this.z = 0;
  }

  handle(bitmap) {
    const z = this.z++ % 512;

    if (this.z > 512) return;

    const { gl } = this;

    // const bm2 = createImageBitmap(bitmap, 300, 300, 512, 512);

    gl.bindTexture(gl.TEXTURE_3D, this.texture);

    gl.texSubImage3D(
      gl.TEXTURE_3D,
      0,
      0, // x
      0, // y
      z, // z
      512, // width
      512, // height
      1, // depth
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      bitmap
      // bm2
    );

    bitmap.close();
    // bm2.close();
  }
}
