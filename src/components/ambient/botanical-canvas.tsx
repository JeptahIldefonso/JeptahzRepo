"use client";

import React, { useEffect, useRef } from "react";

const VERTEX_SHADER_SOURCE = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_mouse_intensity;

// 2D Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = st;
  uv.x *= aspect;

  // Normalized mouse coordinate matching aspect ratio
  vec2 mouse = u_mouse;
  mouse.x *= aspect;

  // Mouse distance & interactive displacement wave
  vec2 toMouse = uv - mouse;
  float dist = length(toMouse);
  float mouseRadius = 0.55;
  float mousePush = smoothstep(mouseRadius, 0.0, dist) * u_mouse_intensity;

  // Rotation for sweeping diagonal waves (as in the reference image)
  float angle = -0.58; // ~33 degree diagonal slope
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = rot * uv;

  // Displace along wave normal with mouse hover (calmed, subtle fluid disturbance)
  p += rot * (normalize(toMouse + 0.0001) * mousePush * 0.05);

  float t = u_time * 0.2;

  // Multi-frequency wave synthesis with domain warping
  float n1 = snoise(p * 1.6 + vec2(t * 0.35, t * 0.15));
  float n2 = snoise(p * 3.0 - vec2(t * 0.25, n1 * 0.75));
  float n3 = snoise(p * 5.5 + vec2(n2 * 0.65, t * 0.2));

  // Primary wave curve with organic undulating folds
  float wave = sin(p.y * 3.8 + n1 * 1.5 + n2 * 0.75 + t * 0.55);
  wave += sin(p.y * 7.8 + n2 * 1.1 + n3 * 0.45 - t * 0.35) * 0.52;
  wave += sin(p.x * 2.0 + p.y * 4.5 + n3 * 0.75 + t * 0.28) * 0.32;

  // Normalize wave to [0, 1]
  float pattern = wave * 0.32 + 0.5;
  pattern = clamp(pattern, 0.0, 1.0);

  // Soft silk sheen contrast curve
  float highlight = pow(smoothstep(0.46, 0.86, pattern), 2.1);

  // Palette stops:
  // 1. Deep Midnight Brand Cyan & Dark Forest Pine
  vec3 c_deep = vec3(0.016, 0.102, 0.141); // #041a24
  vec3 c_pine = vec3(0.02, 0.16, 0.08);

  // 2. Rich Lush Emerald Green
  vec3 c_emerald = vec3(0.04, 0.36, 0.17);
  vec3 c_leaf = vec3(0.10, 0.56, 0.26);

  // 3. Vibrant Sunlit Jade Highlights
  vec3 c_bright = vec3(0.32, 0.80, 0.46);

  // 4. Silky Cream / White Ivory Streaks (matching reference)
  vec3 c_ivory = vec3(0.92, 0.96, 0.93);

  // Interpolate botanical gradient
  vec3 col = mix(c_deep, c_pine, smoothstep(0.0, 0.32, pattern));
  col = mix(col, c_emerald, smoothstep(0.22, 0.58, pattern));
  col = mix(col, c_leaf, smoothstep(0.42, 0.76, pattern));
  col = mix(col, c_bright, highlight * 0.82);
  col = mix(col, c_ivory, pow(highlight, 2.0) * 0.95);

  // Calmed, subtle ambient luster (eliminating flashy white glare & ivory washout)
  float mouseSheen = smoothstep(0.65, 0.0, dist) * u_mouse_intensity;
  col += c_bright * mouseSheen * 0.08;

  // Subtle vignette along edges for cinematic focus
  float vig = 1.0 - smoothstep(0.55, 1.45, length(st - 0.5) * 1.3);
  col *= mix(0.78, 1.0, vig);

  // Tactile film grain matching photographic texture in reference
  float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.035;
  col += vec3(grain);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function BotanicalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) {
      gl = canvas.getContext("experimental-webgl", { alpha: false, antialias: false }) as WebGLRenderingContext | null;
    }

    // 2D Fallback if WebGL is unavailable
    if (!gl) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#041a24");
      grad.addColorStop(0.5, "#064e3b");
      grad.addColorStop(1, "#10b981");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Compile helper
    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader compile error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouseIntensity = gl.getUniformLocation(program, "u_mouse_intensity");

    let mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, intensity: 0, targetIntensity: 0 };
    let animationFrameId: number;
    let startTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      // High-performance resolution scaling (max 1920x1080 internal buffer for buttery 60fps)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      gl?.viewport(0, 0, width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX / window.innerWidth;
      // Invert Y for WebGL screen coordinates (0 at bottom, 1 at top)
      mouse.targetY = 1.0 - e.clientY / window.innerHeight;
      mouse.targetIntensity = 1.0;
    };

    const handleMouseLeave = () => {
      mouse.targetIntensity = 0.0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    handleResize();

    const render = (now: number) => {
      if (!gl) return;

      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse spring interpolation (buttery 60fps easing without abrupt pops)
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;
      mouse.intensity += (mouse.targetIntensity - mouse.intensity) * 0.04;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uMouseIntensity, mouse.intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none"
    />
  );
}
