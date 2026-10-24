"use client";

import React, { useEffect, useRef } from "react";

// ============================================================================
// CALM BOTANICAL AMBIENT CONFIGURATION
// Tweak these values easily to customize the mood, softness, and responsiveness
// ============================================================================
export const AMBIENT_CONFIG = {
  // 1. BLUR & COZINESS
  // Heavy CSS blur applied to melt shader waves into an out-of-focus gradient ("60px" - "120px")
  blurAmount: "90px",
  // Opacity of the center-protecting dark vignette (0.0 = transparent, 1.0 = solid dark)
  vignetteOpacity: 0.65,

  // 2. SPEED & MOTION
  // Idle drift animation speed (lower = slower, more serene; e.g. 0.03 = glacial, 0.05 = gentle drift)
  animationSpeed: 0.045,

  // 3. MOUSE REACTION (20-30% of original, gentle organic lag)
  // Displacement wave push strength on mouse hover (keep <= 0.02 for subtle fluid disturbance)
  mouseStrength: 0.015,
  // Lerp easing coefficient for mouse position (lower = more lag / floaty delay; 0.02 - 0.05)
  mouseLerp: 0.035,
  // Decay speed for mouse hover intensity (smooth fade-out over ~800ms)
  mouseIntensityDecay: 0.025,

  // 4. FILM GRAIN
  // Tactile film grain strength (subtle & non-sparkly; 0.008 - 0.012)
  grainStrength: 0.010,

  // 5. COLOR PALETTE (Normalized RGB: 0.0 to 1.0)
  // Deep, muted, low-contrast tones: dark teal, forest pine, rich moss, soft sage highlight (NO white/mint)
  colors: {
    darkTeal: [0.016, 0.102, 0.141],         // Base brand midnight cyan (#041a24)
    forestPine: [0.035, 0.145, 0.105],       // Deep muted forest (#09251b)
    earthyMoss: [0.065, 0.205, 0.145],       // Rich moss green (#113425)
    mutedSage: [0.115, 0.285, 0.210],        // Soft muted pine-sage (#1d4936)
    softSageHighlight: [0.185, 0.380, 0.285], // Brightest highlight is soft sage (#2f6149), NEVER white
  },
};

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

  // Soft, wide mouse interaction radius
  vec2 toMouse = uv - mouse;
  float dist = length(toMouse);
  float mouseRadius = 0.65;
  float mousePush = smoothstep(mouseRadius, 0.0, dist) * u_mouse_intensity;

  // Gentle diagonal wave rotation (~30 degree slope)
  float angle = -0.52;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = rot * uv;

  // Gentle fluid displacement (reduced to ~20-30% strength for calm disturbance)
  p += rot * (normalize(toMouse + 0.0001) * mousePush * ${AMBIENT_CONFIG.mouseStrength.toFixed(4)});

  float t = u_time * ${AMBIENT_CONFIG.animationSpeed.toFixed(4)};

  // Multi-frequency low-contrast wave synthesis with domain warping
  float n1 = snoise(p * 1.2 + vec2(t * 0.25, t * 0.10));
  float n2 = snoise(p * 2.2 - vec2(t * 0.18, n1 * 0.5));
  float n3 = snoise(p * 4.0 + vec2(n2 * 0.45, t * 0.12));

  // Organic wave folds with smooth undulating curves
  float wave = sin(p.y * 3.0 + n1 * 1.2 + n2 * 0.6 + t * 0.4);
  wave += sin(p.y * 6.0 + n2 * 0.8 + n3 * 0.3 - t * 0.25) * 0.4;
  wave += sin(p.x * 1.5 + p.y * 3.5 + n3 * 0.5 + t * 0.18) * 0.25;

  // Soft pattern normalization [0.0, 1.0]
  float pattern = clamp(wave * 0.26 + 0.5, 0.0, 1.0);

  // Soft highlight curve (soft sage, no harsh thresholding)
  float highlight = pow(smoothstep(0.48, 0.88, pattern), 1.8);

  // Muted, low-contrast palette
  vec3 c_darkTeal = vec3(${AMBIENT_CONFIG.colors.darkTeal.join(", ")});
  vec3 c_forest   = vec3(${AMBIENT_CONFIG.colors.forestPine.join(", ")});
  vec3 c_moss     = vec3(${AMBIENT_CONFIG.colors.earthyMoss.join(", ")});
  vec3 c_sage     = vec3(${AMBIENT_CONFIG.colors.mutedSage.join(", ")});
  vec3 c_hi       = vec3(${AMBIENT_CONFIG.colors.softSageHighlight.join(", ")});

  // Seamless gradient melt with low contrast (no white/mint glare)
  vec3 col = mix(c_darkTeal, c_forest, smoothstep(0.0, 0.35, pattern));
  col = mix(col, c_moss, smoothstep(0.20, 0.60, pattern));
  col = mix(col, c_sage, smoothstep(0.40, 0.80, pattern));
  col = mix(col, c_hi, highlight * 0.35);

  // Whisper-quiet hover luster (soft ambient bloom, zero glare)
  float mouseSheen = smoothstep(0.70, 0.0, dist) * u_mouse_intensity;
  col += c_hi * mouseSheen * 0.025;

  // Cinematic edge vignette
  float vig = 1.0 - smoothstep(0.50, 1.40, length(st - 0.5) * 1.25);
  col *= mix(0.70, 1.0, vig);

  // Subtle non-sparkly film grain
  float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * ${AMBIENT_CONFIG.grainStrength.toFixed(4)};
  col += vec3(grain);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function BotanicalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Accessibility: Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        mouse.intensity = 0;
        mouse.targetIntensity = 0;
      }
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    let gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) {
      gl = canvas.getContext("experimental-webgl", {
        alpha: false,
        antialias: false,
      }) as WebGLRenderingContext | null;
    }

    // 2D Fallback if WebGL is unavailable
    if (!gl) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#041a24");
      grad.addColorStop(0.5, "#0b281f");
      grad.addColorStop(1, "#183e2e");
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

    let mouse = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      intensity: 0,
      targetIntensity: 0,
    };
    let animationFrameId: number;
    let lastTime = 0;
    let accumulatedTime = 0;

    const handleResize = () => {
      if (!canvas) return;
      // High-performance resolution scaling (smooth 60fps)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      gl?.viewport(0, 0, width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isReducedMotion) return;
      mouse.targetX = e.clientX / window.innerWidth;
      // Invert Y for WebGL screen coordinates (0 at bottom, 1 at top)
      mouse.targetY = 1.0 - e.clientY / window.innerHeight;
      mouse.targetIntensity = 1.0;
    };

    const handleMouseLeave = () => {
      mouse.targetIntensity = 0.0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    handleResize();

    const render = (now: number) => {
      if (!gl) return;

      if (!isReducedMotion) {
        // Delta time progression for consistent pacing
        const delta = lastTime ? (now - lastTime) * 0.001 : 0.016;
        accumulatedTime += Math.min(delta, 0.1);
        lastTime = now;

        // Smooth spring interpolation with floaty lag
        mouse.x += (mouse.targetX - mouse.x) * AMBIENT_CONFIG.mouseLerp;
        mouse.y += (mouse.targetY - mouse.y) * AMBIENT_CONFIG.mouseLerp;
        mouse.intensity +=
          (mouse.targetIntensity - mouse.intensity) *
          AMBIENT_CONFIG.mouseIntensityDecay;
      } else {
        // Reduced motion: freeze at calm, static composition
        accumulatedTime = 0.5;
        mouse.intensity = 0;
      }

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, accumulatedTime);
      gl.uniform1f(uMouseIntensity, mouse.intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      mediaQuery.removeEventListener("change", handleMotionChange);
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
    <div
      className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Heavy-blurred WebGL Canvas - scaled slightly (1.12x) to eliminate border vignette clipping */}
      <canvas
        ref={canvasRef}
        className="h-full w-full scale-112 transform-gpu transition-[filter] duration-700 ease-out"
        style={{
          filter: `blur(${AMBIENT_CONFIG.blurAmount})`,
        }}
      />

      {/* Subtle radial dark vignette overlay to ensure center card readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 25%, rgba(4, 26, 36, ${AMBIENT_CONFIG.vignetteOpacity}) 85%)`,
        }}
      />

      {/* Soft uniform dark tint overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[#041a24]/15" />
    </div>
  );
}
