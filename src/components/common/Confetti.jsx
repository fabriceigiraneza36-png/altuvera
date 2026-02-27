import { useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════
// GREEN & WHITE CONFETTI — Canvas-based
// ═══════════════════════════════════════════

const COLORS = [
  '#22C55E', '#16A34A', '#4ADE80', '#86EFAC',
  '#BBF7D0', '#DCFCE7', '#FFFFFF', '#15803D',
  '#F0FDF4', '#14532D', '#052E16',
];

const SHAPES = ['rect', 'circle', 'strip'];

class Particle {
  constructor(canvasW, canvasH) {
    this.x = canvasW * 0.5 + (Math.random() - 0.5) * canvasW * 0.4;
    this.y = canvasH * 0.6;
    this.vx = (Math.random() - 0.5) * 18;
    this.vy = -Math.random() * 22 - 8;
    this.gravity = 0.38 + Math.random() * 0.15;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 12;
    this.w = Math.random() * 10 + 4;
    this.h = Math.random() * 7 + 3;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.opacity = 1;
    this.decay = 0.003 + Math.random() * 0.004;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.05 + Math.random() * 0.1;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx + Math.sin(this.wobble) * 0.8;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.wobble += this.wobbleSpeed;
    this.opacity -= this.decay;
    this.vx *= 0.99;
  }

  draw(ctx) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.w * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'strip':
        ctx.fillRect(-this.w * 0.5, -1, this.w, 2.5);
        break;
      default:
        ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);
    }

    ctx.restore();
  }
}

const Confetti = ({ active, duration = 5000, particleCount = 180 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const startTimeRef = useRef(null);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const elapsed = Date.now() - startTimeRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = 0;
    for (const p of particlesRef.current) {
      p.update();
      p.draw(ctx);
      if (p.opacity > 0 && p.y < canvas.height + 50) alive++;
    }

    if (alive > 0 && elapsed < duration + 2000) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = [];
    }
  }, [duration]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create particles in multiple bursts
    particlesRef.current = [];
    startTimeRef.current = Date.now();

    // Initial burst
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle(canvas.width, canvas.height));
    }

    // Delayed secondary burst
    const burst2 = setTimeout(() => {
      for (let i = 0; i < Math.floor(particleCount * 0.5); i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height));
      }
    }, 400);

    // Delayed tertiary burst
    const burst3 = setTimeout(() => {
      for (let i = 0; i < Math.floor(particleCount * 0.3); i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height));
      }
    }, 900);

    // Start animation
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(burst2);
      clearTimeout(burst3);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, particleCount, animate]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      aria-hidden="true"
    />
  );
};

export default Confetti;