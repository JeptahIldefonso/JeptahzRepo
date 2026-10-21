"use client";

import React, { useEffect, useRef } from "react";

interface CloudParticle {
  x: number;
  y: number;
  scale: number;
  speedX: number;
  opacity: number;
}

export function BotanicalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate floating pixel clouds like the reference image
    const cloudCount = Math.min(8, Math.max(4, Math.floor(window.innerWidth / 240)));
    const clouds: CloudParticle[] = [];

    for (let i = 0; i < cloudCount; i++) {
      clouds.push({
        x: Math.random() * width,
        y: 40 + Math.random() * (height * 0.75),
        scale: 0.9 + Math.random() * 1.1,
        speedX: 0.2 + Math.random() * 0.35,
        opacity: 0.75 + Math.random() * 0.2,
      });
    }

    // Function to draw pixel-art cloud
    const drawPixelCloud = (x: number, y: number, s: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(10, 10, 10, ${alpha * 0.08})`;
      ctx.lineWidth = 1;

      const unit = 6 * s;

      // Define block segments for 8-bit stepped pixel cloud: [col, row, width, height]
      const blocks = [
        // Top dome
        [-3, -2, 6, 1],
        [-5, -1, 10, 1],
        [-7, 0, 14, 1],
        // Middle main body
        [-9, 1, 18, 2],
        [-8, 3, 16, 1],
        // Bottom base
        [-6, 4, 12, 1],
      ];

      blocks.forEach(([col, row, w, h]) => {
        ctx.fillRect(col * unit, row * unit, w * unit, h * unit);
        ctx.strokeRect(col * unit, row * unit, w * unit, h * unit);
      });

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting clouds
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.x += c.speedX;

        // Wrap around edge
        if (c.x > width + 120) {
          c.x = -120;
          c.y = 40 + Math.random() * (height * 0.75);
        }

        drawPixelCloud(c.x, c.y, c.scale, c.opacity);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
