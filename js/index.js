import EasingFunctions from "./ease.js";
import { m3 } from "./matrix.js";
import { Point } from "./point.js";
import { Vector, VectorE } from "./vector.js";
import { Particle, Particles } from "./particle.js";

//頂點著色器
const VSHADER_SOURCE =
  "attribute vec2 a_position;" +
  "attribute vec4 a_color;" +
  "attribute float a_size;" +
  "varying vec4 v_color;" +
  "uniform mat3 u_matrix;" +
  "void main() {" +
  "gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);" +
  "v_color = a_color; " +
  "gl_PointSize = a_size; " +
  "} ";
//片段著色器
const FSHADER_SOURCE =
  "precision mediump float;" +
  "varying vec4 v_color;" +
  "void main() {" +
  "if(v_color[3] > 0.0) {" +
  "gl_FragColor = v_color;" +
  "}" +
  "}";

class Buffer {
  constructor(shaderProgram) {
    this.position_buffer = gl.createBuffer();
    this.color_buffer = gl.createBuffer();
    this.size_buffer = gl.createBuffer();
    bindBufferVertexAttribArray(this.position_buffer, shaderProgram, "a_position", 2);
    bindBufferVertexAttribArray(this.color_buffer, shaderProgram, "a_color", 4);
    bindBufferVertexAttribArray(this.size_buffer, shaderProgram, "a_size", 1);
  }
  render(positions, colors, sizes) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.size_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}

function getTextData(s, font) {
  if (s.length <= 0) return;
  const pool = document.createElement("canvas");
  const buffer = pool.getContext("2d");
  buffer.textAlign = "start";
  buffer.textBaseline = "hanging";
  buffer.font = font;
  const measureText = buffer.measureText(s);
  const tw = measureText.width;
  const th = measureText.actualBoundingBoxDescent + measureText.actualBoundingBoxAscent;
  pool.width = tw;
  pool.height = th;
  buffer.textAlign = "start";
  buffer.textBaseline = "hanging";
  buffer.font = font;
  const grd = buffer.createLinearGradient(0, 0, tw, th);
  grd.addColorStop(1 / 7, "#f00707");
  grd.addColorStop(2 / 7, "#ff5800");
  grd.addColorStop(3 / 7, "#ff5800");
  grd.addColorStop(4 / 7, "#0aff00");
  grd.addColorStop(5 / 7, "#0094a7");
  grd.addColorStop(6 / 7, "#001dff");
  grd.addColorStop(7 / 7, "#8900ff");
  buffer.fillStyle = grd;
  buffer.textAlign = "start";
  buffer.textBaseline = "hanging";
  buffer.fillText(s, 0, measureText.actualBoundingBoxAscent);
  return buffer.getImageData(0, 0, tw, th);
}

function createTextParticle(textData) {
  if (textData == undefined) {
    return {
      data: [],
      width: 0,
      height: 0,
    };
  }
  const data = [];
  for (let i = 0; i < textData.width; i++) {
    for (let j = 0; j < textData.height; j++) {
      const index = (j * textData.width + i) * 4;
      if (textData.data[index + 3] > 0) {
        data.push({
          pos: [-textData.width * 0.5 + i, -textData.height * 0.5 + j],
          color: [textData.data[index] / 255, textData.data[index + 1] / 255, textData.data[index + 2] / 255, 1],
        });
      }
    }
  }
  return {
    data: data,
    width: textData.width,
    height: textData.height,
  };
}

function explode(particles, x, y, range) {
  for (let i = 0; i < particles.length; i++) {
    const v = Point.getVector([x, y], particles[i].pos);
    const rr = Vector.length(v);
    if (rr <= range) {
      const angle = Math.atan2(v[1], v[0]);
      const direct = angle + Math.PI * (0.1 - Math.random() * 0.2);
      const weight = Math.random() * 20 + 60;
      const a = Math.PI * (0.5 + 0.1 - Math.random() * 0.2);
      const aweight = Math.random() * 20 + 20;
      const tt = 1 - EasingFunctions.easeOutCubic(rr / range);
      VectorE.add(particles[i].velocity, [Math.cos(direct) * weight * tt, Math.sin(direct) * weight * tt]);
      VectorE.add(particles[i].velocity, [Math.cos(direct + a) * aweight * tt, Math.sin(direct + a) * aweight * tt]);
      particles[i].showspan = particles[i].maxshow;
      particles[i].changeDisplay("active");
    }
  }
}

/*function createVBO(data) {
  let temp = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, temp);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return temp;
}*/

function bindBufferVertexAttribArray(vbo, shaderProgram, name, count) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  const temp = gl.getAttribLocation(shaderProgram, name);
  gl.enableVertexAttribArray(temp);
  gl.vertexAttribPointer(temp, count, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return temp;
}

function shader(vs, fs) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vs);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fs);
  gl.compileShader(fragShader);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  return shaderProgram;
}

function initText(particlesList, particlesData) {
  if (particlesData.data.length > 0) {
    const particles = new Particles(
      particlesData.data.map((el) => {
        return new Particle(el.pos, el.color);
      })
    );
    particles.onremove = () => {
      const index = particlesList.findIndex((el) => {
        return el === particles;
      });
      if (index != -1) {
        particlesList.splice(index, 1);
      }
    };
    particlesList.push(particles);
  }
}

function init() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.BLEND);
  //gl.disable(gl.DEPTH_TEST);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  //gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  shaderProgram01 = shader(VSHADER_SOURCE, FSHADER_SOURCE);

  buffer01 = new Buffer(shaderProgram01);

  particlesData = createTextParticle(getTextData(s, "100px Comic Sans MS"));
  initText(particlesList, particlesData);

  /*let matrix = m3.identity();
  const translationMatrix = m3.translation(0, 0);
  matrix = m3.multiply(matrix, translationMatrix);

  const matrixLocation = gl.getUniformLocation(shaderProgram01, "u_matrix");
  gl.uniformMatrix3fv(matrixLocation, false, matrix);*/

  const projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);
  const translationMatrix = m3.translation(gl.canvas.width * 0.5, gl.canvas.height * 0.5);
  const matrix = m3.multiply(projectionMatrix, translationMatrix);

  const matrixLocation = gl.getUniformLocation(shaderProgram01, "u_matrix");
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  loop();
}
function loop() {
  const now = new Date();
  const delta = now - lastRender;
  lastRender = now;
  const fps = (1000 / delta).toFixed(0);
  document.getElementById("fps").innerHTML = fps + " fps";
  requestAnimationFrame(loop);
  if (mousedown) {
    particlesList.forEach((el) => {
      if (!el.removeBool) {
        explode(el.particles, mousePos[0] - cWidth * 0.5, mousePos[1] - cHeight * 0.5, 150);
      }
    });
  }
  update();
  render();
}

function update() {
  particlesList.forEach((el) => {
    el.show(particlesData, s.length * 30, 0.5 * s.length);
    el.update();
  });
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  particlesList.forEach((el) => {
    buffer01.render(el.positions, el.colors, el.sizes);
    gl.drawArrays(gl.POINTS, 0, el.particles.length);
  });
  gl.flush();
}
let cWidth, cHeight;
const canvas = document.getElementById("canvas");
cWidth = canvas.width;
cHeight = canvas.height;
let particlesData, shaderProgram01, buffer01;
let s = "particles";
const particlesList = [];
const mousePos = [0, 0];
let lastRender = new Date();
let mousedown = false;

const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
if (!gl) {
  alert("Unable to initialize WebGL. Your browser may not support it.");
} else {
  init();
  const start = (e) => {
    if (!mousedown) {
      const el = e.touches ? e.touches[0] : e;
      mousePos[0] = el.pageX;
      mousePos[1] = el.pageY;
      mousedown = true;
    }
  };
  const move = (e) => {
    if (mousedown) {
      const el = e.touches ? e.touches[0] : e;
      mousePos[0] = el.pageX;
      mousePos[1] = el.pageY;
    }
  };
  const end = () => {
    if (mousedown) {
      mousedown = false;
    }
  };
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);

  canvas.addEventListener("touchstart", start);
  canvas.addEventListener("touchmove", move);
  canvas.addEventListener("touchend", end);

  let input_text = document.getElementById("input_text");
  input_text.value = s;

  input_text.addEventListener("change", onchange01);

  function onchange01(e) {
    s = e.currentTarget.value;
    particlesList.forEach((el) => {
      el.remove();
    });
    if (s.length) {
      particlesData = createTextParticle(getTextData(s, "100px Comic Sans MS"));
      initText(particlesList, particlesData);
    }
  }
  function resize(e) {
    canvas.width = cWidth = window.innerWidth;
    canvas.height = cHeight = window.innerHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    const projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);
    const translationMatrix = m3.translation(gl.canvas.width * 0.5, gl.canvas.height * 0.5);
    const matrix = m3.multiply(projectionMatrix, translationMatrix);

    const matrixLocation = gl.getUniformLocation(shaderProgram01, "u_matrix");
    gl.uniformMatrix3fv(matrixLocation, false, matrix);
  }
  window.addEventListener("resize", resize);
  resize();
}
