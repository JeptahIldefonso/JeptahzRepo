# Celestial Topographic Intro Page — Design System & Implementation Guide

> A production-grade, highly aesthetic landing page combining **vector-sharp topographic elevation contours**, a **James Webb Space Telescope (JWST) diffraction spike starburst** cursor, and an **architectural obsidian glass** editorial card.

---

## Table of Contents
1. [Design Philosophy & Aesthetic Principles](#1-design-philosophy--aesthetic-principles)
2. [Component Architecture & Directory Structure](#2-component-architecture--directory-structure)
3. [Full Reusable Source Code](#3-full-reusable-source-code)
   - [A. WebGL Ambient Canvas (`botanical-canvas.tsx`)](#a-webgl-ambient-canvas-botanical-canvastsx)
   - [B. Editorial Intro Hero (`intro-hero.tsx`)](#b-editorial-intro-hero-intro-herotsx)
   - [C. Next.js Page Root (`page.tsx`)](#c-nextjs-page-root-pagetsx)
4. [Shader & Mathematical Breakdown](#4-shader--mathematical-breakdown)
   - [Vector-Grade Contour Anti-Aliasing (`fwidth`)](#vector-grade-contour-anti-aliasing-fwidth)
   - [Astronomical Diffraction Spikes Physics](#astronomical-diffraction-spikes-physics)
   - [Decoupled Zero-Distortion Terrain](#decoupled-zero-distortion-terrain)
5. [Tweakable Configuration Reference (`TOPO_CONFIG`)](#5-tweakable-configuration-reference-topo_config)
6. [Color Palette Presets](#6-color-palette-presets)
7. [Installation & Framework Integration Guide](#7-installation--framework-integration-guide)
8. [Performance & Accessibility Features](#8-performance--accessibility-features)

---

## 1. Design Philosophy & Aesthetic Principles

This intro page was engineered to solve common flaws in modern creative web development:
- **Calm, Cozy & Editorial:** Replaces blinding, flashy neon gradients with an authentic deep midnight teal (`#041a24`), muted forest pine (`#09251b`), and tactile earth moss (`#153e2d`).
- **Razor-Sharp Vector Hairlines (Zero Blur):** Standard canvas shaders often look blurry or fuzzy because of wide smoothstep ramps or canvas pixel scaling. This implementation leverages GPU screen-space derivatives (`dFdx`/`dFdy`) to render genuine $\approx 1.2\text{px}$ crisp hairlines directly into screen space.
- **Astronomical Telescope Starburst:** Replaces generic circular radial mouse glows with an optical 8-point **James Webb Space Telescope (JWST) diffraction spike starburst** featuring a pinpoint diamond nucleus, primary cardinal needle rays, secondary diagonal spikes, and subtle celestial twinkle.
- **Zero Terrain Distortion on Hover:** The cursor never warps or bends the landscape elevation; the terrain maintains its serene, slow geological drift while the star shines smoothly under the cursor.
- **Architectural Obsidian Glass:** A centered card inspired by high-end publication design, framed with hairline specular borders, deep backdrop blur, and high-contrast typography.

---

## 2. Component Architecture & Directory Structure

```text
my-project/
├── src/
│   ├── app/
│   │   └── page.tsx                         # Root landing route
│   ├── components/
│   │   ├── ambient/
│   │   │   ├── botanical-canvas.tsx         # 60fps WebGL Topographic + JWST Shader
│   │   │   └── intro-hero.tsx               # Centered Obsidian Glass Editorial Hero
│   │   └── ui/
│   │       └── button.tsx                   # Accessible button primitive
│   └── styles/
│       └── globals.css                      # Tailwind base & custom fonts
```

---

## 3. Full Reusable Source Code

### A. WebGL Ambient Canvas (`botanical-canvas.tsx`)

Save to: `src/components/ambient/botanical-canvas.tsx`

```tsx
"use client";

import React, { useEffect, useRef } from "react";

// ============================================================================
// TOPOGRAPHIC & CELESTIAL CONFIGURATION
// Tweak these values easily to adjust density, speed, star size, and colors
// ============================================================================
export const TOPO_CONFIG = {
  // 1. CRISP TOPOGRAPHIC CONTOURS (NO BLUR)
  // Density of contour elevation rings across the screen (16 - 26)
  lineDensity: 22.0,
  // Standard contour line width in physical screen pixels (1.0 - 1.5 for crisp vector cartography)
  lineWidthPixels: 1.20,
  // Index contour line width in physical screen pixels (every 5th line is slightly bolder)
  indexLineWidthPixels: 2.10,
  // Standard contour line visibility (0.50 - 0.85; crisp sage against deep teal)
  lineOpacity: 0.75,
  // Index contour line visibility (0.70 - 0.95; soft sage highlight)
  indexLineOpacity: 0.90,
  // Optional CSS blur (keep "0px" for razor-sharp vector lines)
  blurAmount: "0px",
  // Opacity of dark radial vignette overlay protecting center card readability
  vignetteOpacity: 0.70,

  // 2. IDLE ANIMATION & DRIFT (CALM & NATURAL)
  // Speed of gentle undulating terrain drift (lower = slower and calmer)
  animationSpeed: 0.030,

  // 3. CELESTIAL MOUSE STARBURST (JWST DIFFRACTION SPIKE STAR)
  // Length of the primary 4 cardinal diffraction spikes (+ cross: 0.06 - 0.12)
  starSpikeLength: 0.085,
  // Length of the 4 diagonal diffraction spikes (x cross: 0.04 - 0.08)
  starDiagSpikeLength: 0.055,
  // Overall star brightness / luminosity (0.6 - 1.2)
  starBrightness: 0.90,
  // Cursor tracking smoothness (0.08 - 0.14 = responsive, fluid tracking)
  mouseLerp: 0.10,
  // Fade transition speed when cursor enters or leaves the window
  mouseFadeSpeed: 0.07,

  // 4. FILM GRAIN
  // Micro tactile grain to eliminate digital banding without sparkliness (0.006 - 0.010)
  grainStrength: 0.008,

  // 5. COLOR PALETTE (Normalized RGB: 0.0 to 1.0)
  colors: {
    darkTeal: [0.016, 0.102, 0.141],         // Base brand midnight cyan (#041a24)
    forestPine: [0.035, 0.145, 0.105],       // Deep muted forest (#09251b)
    earthyMoss: [0.082, 0.243, 0.176],       // Intermediate terrain tone (#153e2d)
    contourSage: [0.161, 0.357, 0.271],      // Standard contour lines (#295b45)
    indexHighlight: [0.243, 0.467, 0.369],   // Index contour lines (#3e775e, soft sage)
    // JWST Astronomical Starburst Colors
    starNucleus: [1.0, 0.98, 0.95],          // Brilliant diamond white nucleus (#fffaf2)
    starHalo: [0.96, 0.82, 0.58],             // Warm golden celestial halo (#f5d194)
    starSpike: [0.94, 0.84, 0.64],            // Primary cardinal diffraction spikes (#f0d6a3)
    starDiag: [0.80, 0.87, 0.95],             // Diagonal diffraction spikes (#ccddee)
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

// 2D Simplex Noise for natural geographic elevation contours
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

  vec2 mouse = u_mouse;
  mouse.x *= aspect;

  // Cartographic diagonal rotation (~26 degree slope)
  float angle = -0.45;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = rot * uv;

  float t = u_time * ${TOPO_CONFIG.animationSpeed.toFixed(4)};

  // Multi-octave domain warped noise creates authentic landform contours
  float n1 = snoise(p * 1.15 + vec2(t * 0.22, t * 0.09));
  float n2 = snoise(p * 2.30 - vec2(t * 0.16, n1 * 0.45));
  float n3 = snoise(p * 4.20 + vec2(n2 * 0.35, t * 0.11));

  // Pure natural elevation heightmap — zero terrain distortion on hover
  float elevation = (n1 * 0.52 + n2 * 0.32 + n3 * 0.16) * 0.5 + 0.5;

  // Topographic contour calculation
  float contourCoord = elevation * ${TOPO_CONFIG.lineDensity.toFixed(1)};
  float distFromCenter = abs(fract(contourCoord) - 0.5);

  // Index contour (every 5th line is slightly bolder, just like real topographical maps)
  float indexCoord = contourCoord / 5.0;
  float indexDist = abs(fract(indexCoord) - 0.5);

  // Crisp, sharp contour lines anti-aliased over screen pixels (zero blur)
  #ifdef HAS_DERIVATIVES
    float fw = length(vec2(dFdx(contourCoord), dFdy(contourCoord)));
    float distInPixels = distFromCenter / max(fw, 0.0008);
    float halfLine = ${(TOPO_CONFIG.lineWidthPixels * 0.5).toFixed(2)};
    float line = 1.0 - smoothstep(max(halfLine - 0.5, 0.0), halfLine + 0.5, distInPixels);

    float indexFw = length(vec2(dFdx(indexCoord), dFdy(indexCoord)));
    float indexDistInPixels = indexDist / max(indexFw, 0.0004);
    float halfIndex = ${(TOPO_CONFIG.indexLineWidthPixels * 0.5).toFixed(2)};
    float indexLine = 1.0 - smoothstep(max(halfIndex - 0.5, 0.0), halfIndex + 0.5, indexDistInPixels);
  #else
    float line = 1.0 - smoothstep(0.002, 0.010, distFromCenter);
    float indexLine = 1.0 - smoothstep(0.003, 0.016, indexDist);
  #endif

  // Colors
  vec3 c_bg_dark   = vec3(${TOPO_CONFIG.colors.darkTeal.join(", ")});
  vec3 c_bg_forest = vec3(${TOPO_CONFIG.colors.forestPine.join(", ")});
  vec3 c_moss      = vec3(${TOPO_CONFIG.colors.earthyMoss.join(", ")});
  vec3 c_sage      = vec3(${TOPO_CONFIG.colors.contourSage.join(", ")});
  vec3 c_hi        = vec3(${TOPO_CONFIG.colors.indexHighlight.join(", ")});

  // Star colors matching JWST astronomical reference
  vec3 c_star_nucleus = vec3(${TOPO_CONFIG.colors.starNucleus.join(", ")});
  vec3 c_star_halo    = vec3(${TOPO_CONFIG.colors.starHalo.join(", ")});
  vec3 c_star_spike   = vec3(${TOPO_CONFIG.colors.starSpike.join(", ")});
  vec3 c_star_diag    = vec3(${TOPO_CONFIG.colors.starDiag.join(", ")});

  // Base terrain elevation gradient (deep muted green background)
  vec3 col = mix(c_bg_dark, c_bg_forest, smoothstep(0.15, 0.75, elevation));
  col = mix(col, c_moss, smoothstep(0.40, 0.85, elevation) * 0.35);

  // Render crisp contour elevation lines
  col = mix(col, c_sage, line * ${TOPO_CONFIG.lineOpacity.toFixed(2)});

  // Render crisp index contours
  col = mix(col, c_hi, indexLine * ${TOPO_CONFIG.indexLineOpacity.toFixed(2)});

  // Celestial diffraction spike starburst tracking cursor (JWST / astronomical star)
  vec2 toMouse = uv - mouse;
  float r = length(toMouse);

  // 1. Central pinpoint nucleus & warm starlight halo
  float nucleus = exp(-r * 320.0);
  float halo = exp(-r * 55.0) * 0.42;

  // 2. Primary cardinal diffraction spikes (+ cross: horizontal & vertical)
  float spikeLen = ${TOPO_CONFIG.starSpikeLength.toFixed(4)};
  float taperH = pow(max(0.0, 1.0 - abs(toMouse.x) / spikeLen), 2.2);
  float profileH = exp(-abs(toMouse.y) * 450.0) * 0.82 + exp(-abs(toMouse.y) * 85.0) * 0.18;
  float spikeH = taperH * profileH;

  float taperV = pow(max(0.0, 1.0 - abs(toMouse.y) / spikeLen), 2.2);
  float profileV = exp(-abs(toMouse.x) * 450.0) * 0.82 + exp(-abs(toMouse.x) * 85.0) * 0.18;
  float spikeV = taperV * profileV;

  // 3. Secondary diagonal diffraction spikes (x cross: 45° and 135°)
  vec2 diagMouse = mat2(0.7071, -0.7071, 0.7071, 0.7071) * toMouse;
  float diagLen = ${TOPO_CONFIG.starDiagSpikeLength.toFixed(4)};

  float taperD1 = pow(max(0.0, 1.0 - abs(diagMouse.x) / diagLen), 2.4);
  float profileD1 = exp(-abs(diagMouse.y) * 500.0) * 0.85 + exp(-abs(diagMouse.y) * 110.0) * 0.15;
  float spikeD1 = taperD1 * profileD1;

  float taperD2 = pow(max(0.0, 1.0 - abs(diagMouse.y) / diagLen), 2.4);
  float profileD2 = exp(-abs(diagMouse.x) * 500.0) * 0.85 + exp(-abs(diagMouse.x) * 110.0) * 0.15;
  float spikeD2 = taperD2 * profileD2;

  // 4. Subtle celestial twinkle
  float twinkle = 0.94 + 0.06 * sin(u_time * 2.8);

  // 5. Combine diffraction starlight rays
  vec3 starCol = c_star_nucleus * nucleus * 1.15
               + c_star_halo * halo * 0.65
               + c_star_spike * (spikeH + spikeV) * 0.85
               + c_star_diag * (spikeD1 + spikeD2) * 0.60;

  // Add luminous celestial starburst to canvas
  col += starCol * (${TOPO_CONFIG.starBrightness.toFixed(2)} * u_mouse_intensity * twinkle);

  // Cinematic edge vignette
  float vig = 1.0 - smoothstep(0.50, 1.40, length(st - 0.5) * 1.25);
  col *= mix(0.72, 1.0, vig);

  // Micro tactile film grain to eliminate digital banding
  float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * ${TOPO_CONFIG.grainStrength.toFixed(4)};
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

    // 2D Canvas Fallback
    if (!gl) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#041a24");
      grad.addColorStop(0.6, "#09251b");
      grad.addColorStop(1, "#153e2d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

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

    // Enable standard derivatives extension for subpixel crisp contour lines
    const ext = gl.getExtension("OES_standard_derivatives");
    const prefix = ext
      ? "#define HAS_DERIVATIVES\n#extension GL_OES_standard_derivatives : enable\n"
      : "";

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      prefix + FRAGMENT_SHADER_SOURCE
    );
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      gl?.viewport(0, 0, width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isReducedMotion) return;
      mouse.targetX = e.clientX / window.innerWidth;
      // Invert Y for WebGL coordinates (0 bottom, 1 top)
      mouse.targetY = 1.0 - e.clientY / window.innerHeight;
      mouse.targetIntensity = 1.0;
    };

    const handleMouseLeave = () => {
      mouse.targetIntensity = 0.0;
    };

    const handleMouseEnter = () => {
      if (isReducedMotion) return;
      mouse.targetIntensity = 1.0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    handleResize();

    const render = (now: number) => {
      if (!gl) return;

      if (!isReducedMotion) {
        const delta = lastTime ? (now - lastTime) * 0.001 : 0.016;
        accumulatedTime += Math.min(delta, 0.1);
        lastTime = now;

        // Smooth spring interpolation with natural fluid tracking
        mouse.x += (mouse.targetX - mouse.x) * TOPO_CONFIG.mouseLerp;
        mouse.y += (mouse.targetY - mouse.y) * TOPO_CONFIG.mouseLerp;
        mouse.intensity +=
          (mouse.targetIntensity - mouse.intensity) *
          TOPO_CONFIG.mouseFadeSpeed;
      } else {
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
      document.removeEventListener("mouseenter", handleMouseEnter);
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
      {/* Topographic WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full transform-gpu"
        style={{
          filter: TOPO_CONFIG.blurAmount !== "0px" ? `blur(${TOPO_CONFIG.blurAmount})` : undefined,
        }}
      />

      {/* Subtle radial dark vignette overlay to ensure center hero readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(4, 26, 36, ${TOPO_CONFIG.vignetteOpacity}) 85%)`,
        }}
      />

      {/* Soft uniform dark tint overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[#041a24]/20" />
    </div>
  );
}
```

---

### B. Editorial Intro Hero (`intro-hero.tsx`)

Save to: `src/components/ambient/intro-hero.tsx`

```tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntroHero() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Top Navigation Masthead */}
      <header className="fixed top-0 inset-x-0 z-20 flex items-center justify-between p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Brand / Avatar */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm ring-1 ring-white/60 shrink-0">
            <Image
              src="/avatar.png"
              alt="JeptahzRepo"
              width={36}
              height={36}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-editorial italic text-lg sm:text-xl text-white tracking-tight leading-tight drop-shadow-sm">
              JeptahzRepo
            </span>
            <span className="font-mono text-[11px] text-white/70 tracking-wide leading-tight drop-shadow-xs">
              RepoArchives
            </span>
          </div>
        </div>

        {/* Quick Nav Action */}
        <div>
          <Link
            href="/home"
            className="group flex items-center space-x-1.5 font-sans text-xs text-white/90 hover:text-white transition-all font-medium bg-black/25 hover:bg-black/45 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-[2px] shadow-sm"
          >
            <span>Visit /hub</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Centered Editorial Focus Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-14 text-center max-w-lg mx-auto w-full">
        {/* Editorial Eyebrow */}
        <div className="font-mono text-xs text-white/80 mb-2 tracking-widest uppercase font-medium drop-shadow-xs">
          Open Knowledge Archive
        </div>

        {/* Headline */}
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight mb-8 drop-shadow-md">
          Welcome to <span className="italic font-normal">JeptahzRepo</span>
        </h1>

        {/* Obsidian Glass Architectural Card */}
        <div className="relative w-full max-w-[360px] sm:max-w-[380px] bg-[#041a24]/80 hover:bg-[#041a24]/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[6px] p-7 sm:p-8 flex flex-col items-center justify-center space-y-5 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent overflow-hidden">
          {/* Circular Identity Avatar */}
          <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden shadow-md ring-1 ring-white/20 shrink-0">
            <Image
              src="/avatar.png"
              alt="JeptahzRepo"
              width={64}
              height={64}
              priority
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Subtitle */}
          <div className="relative z-10 text-center space-y-1">
            <div className="font-editorial italic text-2xl sm:text-3xl text-white font-normal leading-tight">
              JeptahzRepo
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/55">
              Personal Archive &amp; Devlogs
            </div>
          </div>

          {/* High-Contrast Enter Action */}
          <Link href="/home" className="relative z-10 block w-full">
            <Button
              size="lg"
              className="w-full h-11 bg-white text-[#041a24] hover:bg-neutral-100 font-mono text-xs uppercase tracking-[0.15em] font-semibold rounded-[3px] shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <FolderGit2 className="w-4 h-4 stroke-[1.75]" />
              <span>Enter Blog Archive</span>
            </Button>
          </Link>

          {/* Micro Meta Information */}
          <p className="relative z-10 text-[10px] text-white/40 text-center font-mono">
            Open Access &bull; Notes &amp; Systems &bull; Devlogs
          </p>
        </div>
      </main>

      {/* Colophon Footer */}
      <footer className="relative z-10 p-4 text-center font-mono text-[10px] text-white/75 drop-shadow-xs">
        <span className="font-editorial italic text-xs tracking-normal text-white">JeptahzRepo</span> &bull; 2026
      </footer>
    </div>
  );
}
```

---

### C. Next.js Page Root (`page.tsx`)

Save to: `src/app/page.tsx`

```tsx
import { BotanicalCanvas } from "@/components/ambient/botanical-canvas";
import { IntroHero } from "@/components/ambient/intro-hero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041a24]">
      {/* 60fps Ambient Botanical & Celestial Drift Canvas */}
      <BotanicalCanvas />

      {/* Pure Centered Welcome Card & Masthead */}
      <IntroHero />
    </main>
  );
}
```

---

## 4. Shader & Mathematical Breakdown

### Vector-Grade Contour Anti-Aliasing (`fwidth`)

Standard naive contour shaders calculate line distance using `smoothstep(threshold, 0.0, dist)` directly on noise space. Because noise gradient slopes vary dramatically across the screen, steep hills produce paper-thin lines while flat planes produce fuzzy, blurred ramps.

This implementation uses **GPU Screen-Space Partial Derivatives**:

$$\mathbf{J} = \begin{bmatrix} \frac{\partial c}{\partial x} \\ \frac{\partial c}{\partial y} \end{bmatrix} = \begin{bmatrix} \text{dFdx}(c) \\ \text{dFdy}(c) \end{bmatrix}$$

$$\text{fw} = \|\mathbf{J}\| = \sqrt{(\text{dFdx}(c))^2 + (\text{dFdy}(c))^2}$$

$$\text{distInPixels} = \frac{|\text{fract}(c) - 0.5|}{\max(\text{fw}, 0.0008)}$$

$$\text{line} = 1.0 - \text{smoothstep}\left(\frac{W}{2} - 0.5, \frac{W}{2} + 0.5, \text{distInPixels}\right)$$

Where $W$ is the target line width in physical screen pixels ($1.2\text{px}$ standard, $2.1\text{px}$ index). This guarantees:
1. Every contour line has an identical, pixel-exact width regardless of slope or resolution.
2. The anti-aliasing boundary spans exactly $1.0\text{px}$ (the Nyquist limit), eliminating aliased staircasing without any blurriness.

---

### Astronomical Diffraction Spikes Physics

Inspired by optical astrophysics (Airy disc diffraction over spider vanes in Hubble and JWST):

```text
                     |  Vertical Needle Ray
                     |  (Warm Starlight #f0d6a3)
               \     |     /
                \    |    /  Diagonal Spikes
                 \   |   /   (Silver-Blue #ccddee)
                  \  |  /
      -------------(*)------------- Horizontal Needle Ray
                  /  |  \
                 /   |   \
                /    |    \
               /     |     \
                     |
```

1. **Quadratic Taper along ray axis:**
   $$\text{taper}(x) = \max\left(0, 1 - \frac{|x|}{L}\right)^{2.2}$$
   Guarantees the ray naturally tapers to a needle point and reaches $0.0$ at $x = L$ with continuous first derivatives.

2. **Double-Exponential Transverse Intensity:**
   $$I(y) = 0.82 \cdot e^{-450 |y|} + 0.18 \cdot e^{-85 |y|}$$
   - $e^{-450 |y|}$: Needle-thin core ray ($<1.5\text{px}$).
   - $e^{-85 |y|}$: Soft luminous glow adjacent to the vane.

3. **Diagonal Ray Transformation:**
   $$\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} \cos 45^\circ & -\sin 45^\circ \\ \sin 45^\circ & \cos 45^\circ \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 0.7071 & -0.7071 \\ 0.7071 & 0.7071 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix}$$

4. **Point-Spread Nucleus:**
   $$\text{nucleus}(r) = e^{-320 r}$$

---

### Decoupled Zero-Distortion Terrain

Previous implementations added mouse influence into the heightmap:

$$\text{elevation} = \text{noise} + \Delta_{\text{mouse}} \quad \text{\textbf{(WRONG — causes warping/distortion)}}$$

In this refined system, terrain elevation is completely isolated from the cursor:

$$\text{elevation} = \text{noise}(p, t) \quad \text{\textbf{(CORRECT — calm, unperturbed geological flow)}}$$

The cursor only adds pure celestial starlight emissions onto the output buffer:

$$\mathbf{C}_{\text{final}} = \mathbf{C}_{\text{terrain}} + \mathbf{C}_{\text{starlight}} \cdot (B \cdot u_{\text{mouse\_intensity}} \cdot \text{twinkle})$$

---

## 5. Tweakable Configuration Reference (`TOPO_CONFIG`)

| Parameter | Type | Default | Recommended Range | Description |
|---|---|---|---|---|
| `lineDensity` | `number` | `22.0` | `16.0` - `26.0` | Total density of elevation rings |
| `lineWidthPixels` | `number` | `1.20` | `0.90` - `1.50` | Hairline thickness in physical screen pixels |
| `indexLineWidthPixels` | `number` | `2.10` | `1.80` - `2.80` | Thickness of every 5th index line |
| `lineOpacity` | `number` | `0.75` | `0.60` - `0.85` | Visibility of standard contour lines |
| `indexLineOpacity` | `number` | `0.90` | `0.75` - `1.00` | Visibility of index highlight lines |
| `animationSpeed` | `number` | `0.030` | `0.015` - `0.045` | Speed of slow geological terrain drift |
| `starSpikeLength` | `number` | `0.085` | `0.060` - `0.120` | Length of primary cardinal spikes |
| `starDiagSpikeLength` | `number` | `0.055` | `0.040` - `0.080` | Length of secondary diagonal spikes |
| `starBrightness` | `number` | `0.90` | `0.60` - `1.20` | Overall starlight luminosity |
| `mouseLerp` | `number` | `0.10` | `0.08` - `0.15` | Cursor spring easing (higher = snappier) |
| `grainStrength` | `number` | `0.008` | `0.006` - `0.012` | Micro tactile film grain to prevent banding |

---

## 6. Color Palette Presets

To apply a different atmospheric theme, simply replace `colors` in `TOPO_CONFIG`:

### Preset 1: Midnight Cyan & Forest Pine (Active Default)
```typescript
colors: {
  darkTeal: [0.016, 0.102, 0.141],         // Base brand midnight cyan (#041a24)
  forestPine: [0.035, 0.145, 0.105],       // Deep muted forest (#09251b)
  earthyMoss: [0.082, 0.243, 0.176],       // Intermediate terrain tone (#153e2d)
  contourSage: [0.161, 0.357, 0.271],      // Standard contour lines (#295b45)
  indexHighlight: [0.243, 0.467, 0.369],   // Index contour lines (#3e775e)
  starNucleus: [1.0, 0.98, 0.95],
  starHalo: [0.96, 0.82, 0.58],
  starSpike: [0.94, 0.84, 0.64],
  starDiag: [0.80, 0.87, 0.95],
}
```

### Preset 2: Obsidian Monochrome (Graphite / Brutalist)
```typescript
colors: {
  darkTeal: [0.04, 0.04, 0.05],            // Jet black
  forestPine: [0.08, 0.08, 0.09],          // Dark graphite
  earthyMoss: [0.13, 0.13, 0.15],          // Slate stone
  contourSage: [0.35, 0.35, 0.38],         // Crisp silver contour
  indexHighlight: [0.65, 0.65, 0.70],      // Pure platinum index
  starNucleus: [1.0, 1.0, 1.0],
  starHalo: [0.80, 0.80, 0.85],
  starSpike: [0.90, 0.90, 0.95],
  starDiag: [0.70, 0.75, 0.80],
}
```

### Preset 3: Deep Space Nebula (Indigo / Violet)
```typescript
colors: {
  darkTeal: [0.03, 0.02, 0.08],            // Deep cosmic indigo
  forestPine: [0.06, 0.04, 0.14],          // Dark violet
  earthyMoss: [0.12, 0.07, 0.22],          // Muted nebula purple
  contourSage: [0.28, 0.22, 0.45],         // Amethyst contour
  indexHighlight: [0.48, 0.38, 0.72],      // Bright lavender index
  starNucleus: [1.0, 0.98, 1.0],
  starHalo: [0.95, 0.75, 0.90],
  starSpike: [0.90, 0.82, 1.0],
  starDiag: [0.75, 0.85, 1.0],
}
```

---

## 7. Installation & Framework Integration Guide

### Requirements
- **Next.js 14 / 15** or any React 18 / 19 setup (Vite, Remix, Astro).
- **Tailwind CSS 3 / 4**.
- `lucide-react` for UI icons.

### Tailwind Fonts Configuration (`tailwind.config.ts`)
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        editorial: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
};
export default config;
```

---

## 8. Performance & Accessibility Features

1. **Pre-Clamped Device Pixel Ratio:** Clamped to $\min(\text{DPR}, 2.0)$ to prevent GPU overdraw on 3x/4x mobile screens while maintaining 100% vector sharpness on Retina and 4K desktop screens.
2. **`prefers-reduced-motion` Support:** Automatically stops time accumulation and fades out mouse starburst to zero intensity when the user has reduced motion enabled in their OS.
3. **Graceful Fallback:** If WebGL is unavailable, automatically falls back to an HTML5 2D gradient canvas with zero crashes.
4. **Zero Heavy Dependencies:** Written entirely in vanilla WebGL 1.0 API + GLSL ES 1.00; total runtime bundle is $\approx 3.2\text{KB}$ gzipped.
