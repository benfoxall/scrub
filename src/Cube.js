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
uniform float time;

uniform float u_slide;

out vec4 outColor;

uniform sampler3D u_cubetex;

void main() {
  // vec2 uv = gl_FragCoord.xy / resolution;
  // float color = 0.0;
  // // lifted from glslsandbox.com
  // color += sin( uv.x * cos( time / 3.0 ) * 60.0 ) + cos( uv.y * cos( time / 2.80 ) * 10.0 );
  // color += sin( uv.y * sin( time / 2.0 ) * 40.0 ) + cos( uv.x * sin( time / 1.70 ) * 40.0 );
  // color += sin( uv.x * sin( time / 1.0 ) * 10.0 ) + sin( uv.y * sin( time / 3.50 ) * 80.0 );
  // color *= sin( time / 10.0 ) * 0.5;

  // gl_FragColor = vec4( vec3( color * 0.5, sin( color + time / 2.5 ) * 0.75, color ), 1.0 );

  outColor = vec4(gl_FragCoord.x/100.0, gl_FragCoord.y/100.0, 1.0, 1.0);

  outColor = texture(u_cubetex, vec3(1.0,1.0,1.0));

  outColor = texture(u_cubetex, 
    vec3(
      (gl_FragCoord.x/100.0), 
      gl_FragCoord.y/100.0,
      u_slide
    )
  );

}
`;

export class Cube extends ViewerBase {
  bitmaps = [];
  canvas = document.createElement("canvas");
  //   ctx = this.canvas.getContext("2d");

  constructor(url) {
    super(url);

    document.body.appendChild(this.canvas);

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
      minMag: gl.NEAREST,
    }));

    gl.bindTexture(gl.TEXTURE_3D, texture);

    function render(time) {
      // twgl.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      const uniforms = {
        time: time * 0.001,
        resolution: [gl.canvas.width, gl.canvas.height],
        u_cubetex: texture,
        u_slide: slide.valueAsNumber / 512,
      };

      window.uu = uniforms;

      gl.useProgram(programInfo.program);
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      twgl.setUniforms(programInfo, uniforms);
      // gl.activeTexture(gl.TEXTURE0);
      // twgl.setTexture(texture);
      // gl.bindTexture(gl.TEXTURE_3D, texture);
      window.twgl = twgl;
      twgl.drawBufferInfo(gl, bufferInfo);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // document.body.appendChild(this.canvas);

    // this.render = memo(raf(this.render.bind(this)));

    // window.addEventListener("scroll", () => {
    //   const idx = Math.floor(window.scrollY / scrollStep);

    //   this.render(this.bitmaps[idx]);
    // });

    this.z = 0;
  }

  handle(bitmap) {
    // gl.texImage3D(gl.TEXTURE_3D, level, internalFormat,
    // srcFormat, srcType, image);

    const z = this.z++ % 512;

    // temp
    if (this.z > 512) return;

    const { gl } = this;

    gl.bindTexture(gl.TEXTURE_3D, this.texture);

    // console.log(z);

    gl.texSubImage3D(
      gl.TEXTURE_3D,
      0,
      0, //x
      0, //y
      // 0,//z
      z,

      // bitmap.width,
      // bitmap.height,
      512,
      512,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      bitmap
    );

    bitmap.close();
  }
}
