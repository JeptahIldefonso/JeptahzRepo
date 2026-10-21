"use client";

import React, { useEffect, useRef } from "react";

interface LeafParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: number; // 0: ginkgo silhouette, 1: willow/elm leaf, 2: botanical seed
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

    // Mouse tracking for cursor draft perturbation
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.vx = e.clientX - mouse.lastX;
      mouse.vy = e.clientY - mouse.lastY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Generate botanical particles
    const particleCount = Math.min(45, Math.floor(window.innerWidth / 32));
    const particles: LeafParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 9 + Math.random() * 11,
        speedY: 0.4 + Math.random() * 0.7,
        speedX: 0,
        swaySpeed: 0.008 + Math.random() * 0.012,
        swayAmplitude: 0.8 + Math.random() * 1.4,
        swayOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.12 + Math.random() * 0.18,
        type: Math.floor(Math.random() * 3),
      });
    }

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Base sway and gravity
        p.y += p.speedY;
        p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayAmplitude + p.speedX;
        p.rotation += p.rotationSpeed;

        // Friction dampening for cursor interaction
        p.speedX *= 0.95;

        // Mouse draft interaction
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 130;

        if (dist < radius && dist > 0) {
          const force = (1 - dist / radius) * 1.5;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 2;
          p.rotation += (dx > 0 ? 1 : -1) * force * 0.05;
        }

        // Screen wrap
        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 40) p.x = -30;
        if (p.x < -40) p.x = width + 30;

        // Draw botanical leaf silhouette
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(10, 10, 10, ${p.opacity})`;
        ctx.strokeStyle = `rgba(10, 10, 10, ${p.opacity * 1.2})`;
        ctx.lineWidth = 0.8;

        if (p.type === 0) {
          // Ginkgo fan shape
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.size * 0.8, -p.size * 0.6, -p.size, -p.size * 1.2, 0, -p.size * 1.4);
          ctx.bezierCurveTo(p.size, -p.size * 1.2, p.size * 0.8, -p.size * 0.6, 0, 0);
          ctx.fill();
        } else if (p.type === 1) {
          // Classic willow/elm leaf
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.2);
          ctx.quadraticCurveTo(p.size * 0.5, 0, 0, p.size * 1.2);
          ctx.quadraticCurveTo(-p.size * 0.5, 0, 0, -p.size * 1.2);
          ctx.fill();
          // Subtle vein
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.1);
          ctx.lineTo(0, p.size * 1.1);
          ctx.stroke();
        } else {
          // Minimalist winged seed
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.35, p.size * 0.9, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-80"
    />
  );
}
