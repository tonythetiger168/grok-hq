import * as THREE from 'three'

const deskVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const deskFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOn;
  uniform float uPhase;
  uniform float uMark;
  varying vec2 vUv;

  void main() {
    vec3 off = vec3(0.14, 0.16, 0.18);
    float t = uTime * 0.75 + uPhase;
    vec3 col = vec3(0.17, 0.23, 0.26);
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float x = 0.18 + fi * 0.18;
      float h = 0.22 + 0.42 * (0.5 + 0.5 * sin(t * 1.3 + fi * 1.7 + uPhase));
      float bar = smoothstep(x - 0.045, x - 0.03, vUv.x) * smoothstep(x + 0.045, x + 0.03, vUv.x);
      float y0 = 0.18;
      float vert = step(y0, vUv.y) * (1.0 - step(y0 + h, vUv.y));
      vec3 barCol = mix(vec3(0.42, 0.58, 0.54), vec3(0.78, 0.70, 0.52), fi / 3.0);
      col = mix(col, barCol, bar * vert);
    }
    float cx = 0.55 + 0.22 * sin(t * 0.65);
    float cursor = step(abs(vUv.x - cx), 0.035) * step(abs(vUv.y - 0.74), 0.028);
    col = mix(col, vec3(0.90, 0.92, 0.88), cursor);
    col = mix(off, col, clamp(uOn, 0.0, 1.0));
    vec3 mark = vec3(0.35, 0.72, 0.48);
    if (uMark > 1.5 && uMark < 2.5) mark = vec3(0.78, 0.28, 0.22);
    if (uMark > 2.5) mark = vec3(0.86, 0.68, 0.28);
    float band = step(0.08, vUv.y) * (1.0 - step(0.18, vUv.y)) * step(0.5, uMark);
    col = mix(col, mark, band);
    gl_FragColor = vec4(col, 1.0);
  }
`

const researchFragment = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;

  void main() {
    float t = uTime * 0.35 + uPhase;
    vec3 bg = vec3(0.16, 0.22, 0.26);
    float wave = 0.55 + 0.28 * sin(vUv.x * 9.0 + t) + 0.08 * sin(vUv.x * 21.0 - t * 1.4);
    float line = smoothstep(0.02, 0.0, abs(vUv.y - wave));
    vec3 col = mix(bg, vec3(0.62, 0.74, 0.70), line);
    float band = smoothstep(0.0, 0.02, vUv.y) * smoothstep(wave, wave - 0.35, vUv.y);
    col = mix(col, vec3(0.28, 0.40, 0.42), band * 0.55);
    float grid = step(0.97, fract(vUv.x * 8.0)) + step(0.97, fract(vUv.y * 6.0));
    col = mix(col, vec3(0.30, 0.36, 0.38), clamp(grid, 0.0, 1.0) * 0.35);
    gl_FragColor = vec4(col, 1.0);
  }
`

export function deskScreenMaterial(phase) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOn: { value: 0 },
      uPhase: { value: phase },
      uMark: { value: 0 },
    },
    vertexShader: deskVertex,
    fragmentShader: deskFragment,
  })
}

export function researchScreenMaterial(phase) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: phase },
    },
    vertexShader: deskVertex,
    fragmentShader: researchFragment,
  })
}
