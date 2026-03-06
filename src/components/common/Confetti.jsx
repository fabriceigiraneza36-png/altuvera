import { useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// GREEN & WHITE CONFETTI — Ultra-Realistic Burst System
// ═══════════════════════════════════════════════════════════════

const COLORS = [
  '#22C55E', '#16A34A', '#4ADE80', '#86EFAC',
  '#BBF7D0', '#DCFCE7', '#FFFFFF', '#15803D',
  '#F0FDF4', '#14532D', '#052E16', '#A7F3D0',
  '#6EE7B7', '#34D399', '#10B981', '#059669',
];

const SHAPES = ['rect', 'circle', 'strip', 'triangle', 'star', 'ring', 'diamond', 'streamer'];

// Easing function for explosive burst feel
const easeOutQuad = (t) => t * (2 - t);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

class Particle {
  constructor(canvasW, canvasH, originX, originY, burstPower = 1.0) {
    // Explosion origin point with slight randomness
    this.x = originX + (Math.random() - 0.5) * 20;
    this.y = originY + (Math.random() - 0.5) * 20;

    // Explosive radial velocity - particles shoot in all directions
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 28 + 12) * burstPower;
    this.vx = Math.cos(angle) * speed * (0.6 + Math.random() * 0.8);
    this.vy = Math.sin(angle) * speed * (0.6 + Math.random() * 0.8) - Math.random() * 15 * burstPower;

    // Physics
    this.gravity = 0.18 + Math.random() * 0.12;
    this.drag = 0.985 + Math.random() * 0.01;
    this.bounceFactor = 0.3 + Math.random() * 0.3;
    this.floorY = canvasH;

    // 3D rotation simulation
    this.rotationX = Math.random() * 360;
    this.rotationY = Math.random() * 360;
    this.rotationZ = Math.random() * 360;
    this.rotationSpeedX = (Math.random() - 0.5) * 15;
    this.rotationSpeedY = (Math.random() - 0.5) * 18;
    this.rotationSpeedZ = (Math.random() - 0.5) * 12;

    // Size with more variation
    this.w = Math.random() * 12 + 5;
    this.h = Math.random() * 8 + 4;
    this.originalW = this.w;
    this.originalH = this.h;

    // Appearance
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.secondaryColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    // Opacity and lifecycle
    this.opacity = 1;
    this.decay = 0.001 + Math.random() * 0.003;
    this.life = 0;
    this.maxLife = 300 + Math.random() * 200;

    // Wobble / flutter effect (simulates air resistance on flat confetti)
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.04 + Math.random() * 0.08;
    this.wobbleAmplitude = 1.5 + Math.random() * 2.5;

    // Flutter - simulates confetti flipping in air
    this.flutter = Math.random() * Math.PI * 2;
    this.flutterSpeed = 0.05 + Math.random() * 0.15;

    // Shimmer / sparkle
    this.shimmer = Math.random() * Math.PI * 2;
    this.shimmerSpeed = 0.08 + Math.random() * 0.12;
    this.hasShimmer = Math.random() > 0.5;

    // Wind effect
    this.windSensitivity = 0.3 + Math.random() * 0.7;

    // Scale oscillation for "tumbling" effect
    this.scalePhase = Math.random() * Math.PI * 2;
    this.scaleSpeed = 0.06 + Math.random() * 0.1;

    // Trail
    this.trail = [];
    this.maxTrailLength = this.shape === 'streamer' ? 8 : 0;
  }

  update(windX = 0, windY = 0) {
    this.life++;

    // Store trail position
    if (this.maxTrailLength > 0) {
      this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift();
      }
    }

    // Gravity
    this.vy += this.gravity;

    // Wind
    this.vx += windX * this.windSensitivity * 0.01;
    this.vy += windY * this.windSensitivity * 0.005;

    // Air resistance / drag
    this.vx *= this.drag;
    this.vy *= this.drag;

    // Wobble (lateral oscillation simulating air currents)
    this.wobble += this.wobbleSpeed;
    const wobbleForce = Math.sin(this.wobble) * this.wobbleAmplitude;
    this.x += this.vx + wobbleForce * 0.3;
    this.y += this.vy;

    // Floor bounce
    if (this.y >= this.floorY - 10) {
      this.y = this.floorY - 10;
      this.vy *= -this.bounceFactor;
      this.vx *= 0.8;
      this.rotationSpeedX *= 0.5;
      this.rotationSpeedY *= 0.5;
      this.rotationSpeedZ *= 0.5;
      if (Math.abs(this.vy) < 0.5) {
        this.vy = 0;
        this.gravity = 0;
        this.decay = 0.015; // Fade faster on ground
      }
    }

    // 3D rotation
    this.rotationX += this.rotationSpeedX;
    this.rotationY += this.rotationSpeedY;
    this.rotationZ += this.rotationSpeedZ;

    // Slow rotation over time (air resistance on spin)
    this.rotationSpeedX *= 0.998;
    this.rotationSpeedY *= 0.998;
    this.rotationSpeedZ *= 0.998;

    // Flutter effect
    this.flutter += this.flutterSpeed;
    this.shimmer += this.shimmerSpeed;

    // Scale oscillation (tumbling in 3D projected to 2D)
    this.scalePhase += this.scaleSpeed;
    const scaleX = Math.abs(Math.cos(this.scalePhase));
    const scaleY = Math.abs(Math.cos(this.scalePhase * 0.7 + 1.3));
    this.w = this.originalW * (0.3 + scaleX * 0.7);
    this.h = this.originalH * (0.3 + scaleY * 0.7);

    // Opacity decay - slow at first, then faster
    if (this.life > this.maxLife * 0.6) {
      this.opacity -= this.decay * 2;
    } else {
      this.opacity -= this.decay * 0.3;
    }

    this.opacity = Math.max(0, this.opacity);
  }

  draw(ctx) {
    if (this.opacity <= 0) return;

    // Draw trail for streamers
    if (this.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = 1; i < this.trail.length; i++) {
        const t = this.trail[i];
        const prev = this.trail[i - 1];
        ctx.globalAlpha = (i / this.trail.length) * this.opacity * 0.4;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Simulate 3D rotation projection
    const cosX = Math.cos((this.rotationX * Math.PI) / 180);
    const cosY = Math.cos((this.rotationY * Math.PI) / 180);
    ctx.rotate((this.rotationZ * Math.PI) / 180);
    ctx.scale(Math.abs(cosY) * 0.5 + 0.5, Math.abs(cosX) * 0.5 + 0.5);

    // Shimmer effect - alternating brightness
    let alpha = this.opacity;
    if (this.hasShimmer) {
      const shimmerVal = Math.sin(this.shimmer) * 0.3 + 0.7;
      alpha *= shimmerVal;
    }
    ctx.globalAlpha = Math.max(0, alpha);

    // Determine which face is showing (two-tone effect)
    const showFront = Math.cos((this.rotationY * Math.PI) / 180) > 0;
    ctx.fillStyle = showFront ? this.color : this.secondaryColor;

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.w * 0.45, 0, Math.PI * 2);
        ctx.fill();
        // Inner highlight
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-this.w * 0.1, -this.w * 0.1, this.w * 0.18, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'strip':
        // Curling ribbon/streamer
        ctx.beginPath();
        const ribbonW = this.w * 1.5;
        const curl = Math.sin(this.flutter) * 4;
        ctx.moveTo(-ribbonW * 0.5, -1.5);
        ctx.quadraticCurveTo(0, curl, ribbonW * 0.5, -1.5);
        ctx.lineTo(ribbonW * 0.5, 1.5);
        ctx.quadraticCurveTo(0, curl + 3, -ribbonW * 0.5, 1.5);
        ctx.closePath();
        ctx.fill();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -this.h * 0.6);
        ctx.lineTo(-this.w * 0.5, this.h * 0.4);
        ctx.lineTo(this.w * 0.5, this.h * 0.4);
        ctx.closePath();
        ctx.fill();
        break;

      case 'star': {
        const spikes = 5;
        const outerR = this.w * 0.5;
        const innerR = this.w * 0.22;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const a = (i * Math.PI) / spikes - Math.PI / 2;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'ring':
        ctx.beginPath();
        ctx.arc(0, 0, this.w * 0.45, 0, Math.PI * 2);
        ctx.arc(0, 0, this.w * 0.25, 0, Math.PI * 2, true);
        ctx.fill();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -this.h * 0.6);
        ctx.lineTo(this.w * 0.4, 0);
        ctx.lineTo(0, this.h * 0.6);
        ctx.lineTo(-this.w * 0.4, 0);
        ctx.closePath();
        ctx.fill();
        // Shine line
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-this.w * 0.15, -this.h * 0.2);
        ctx.lineTo(this.w * 0.05, -this.h * 0.35);
        ctx.stroke();
        break;

      case 'streamer': {
        // Long curling streamer
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const len = this.w * 2;
        const segments = 8;
        ctx.moveTo(-len * 0.5, 0);
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const sx = -len * 0.5 + len * t;
          const sy = Math.sin(t * Math.PI * 3 + this.flutter) * 5;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        break;
      }

      default:
        // Rectangle with subtle rounded corners and shadow
        const rw = this.w;
        const rh = this.h;
        const radius = Math.min(rw, rh) * 0.15;
        ctx.beginPath();
        ctx.moveTo(-rw * 0.5 + radius, -rh * 0.5);
        ctx.lineTo(rw * 0.5 - radius, -rh * 0.5);
        ctx.arcTo(rw * 0.5, -rh * 0.5, rw * 0.5, -rh * 0.5 + radius, radius);
        ctx.lineTo(rw * 0.5, rh * 0.5 - radius);
        ctx.arcTo(rw * 0.5, rh * 0.5, rw * 0.5 - radius, rh * 0.5, radius);
        ctx.lineTo(-rw * 0.5 + radius, rh * 0.5);
        ctx.arcTo(-rw * 0.5, rh * 0.5, -rw * 0.5, rh * 0.5 - radius, radius);
        ctx.lineTo(-rw * 0.5, -rh * 0.5 + radius);
        ctx.arcTo(-rw * 0.5, -rh * 0.5, -rw * 0.5 + radius, -rh * 0.5, radius);
        ctx.closePath();
        ctx.fill();

        // Subtle fold line
        ctx.globalAlpha = alpha * 0.15;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -rh * 0.5);
        ctx.lineTo(0, rh * 0.5);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }
}

// Spark particle for initial burst flash
class Spark {
  constructor(originX, originY) {
    this.x = originX;
    this.y = originY;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 35 + 15;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = 0.03 + Math.random() * 0.04;
    this.size = Math.random() * 3 + 1;
    this.color = Math.random() > 0.5 ? '#FFFFFF' : COLORS[Math.floor(Math.random() * 6)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.life -= this.decay;
    this.size *= 0.97;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const Confetti = ({ active, duration = 6000, particleCount = 250 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const sparksRef = useRef([]);
  const startTimeRef = useRef(null);
  const windRef = useRef({ x: 0, y: 0, targetX: 0 });

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const elapsed = Date.now() - startTimeRef.current;

    // Update wind - gentle shifting direction
    const wind = windRef.current;
    wind.targetX = Math.sin(elapsed * 0.0003) * 3;
    wind.x += (wind.targetX - wind.x) * 0.02;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw sparks
    let aliveSparks = 0;
    for (const s of sparksRef.current) {
      s.update();
      s.draw(ctx);
      if (s.life > 0) aliveSparks++;
    }

    // Update and draw particles
    let alive = 0;
    for (const p of particlesRef.current) {
      p.update(wind.x, wind.y);
      p.draw(ctx);
      if (p.opacity > 0 && p.y < canvas.height + 80) alive++;
    }

    if ((alive > 0 || aliveSparks > 0) && elapsed < duration + 4000) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = [];
      sparksRef.current = [];
    }
  }, [duration]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // High-DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: window.innerWidth, height: window.innerHeight };
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const logicalW = rect.width;
    const logicalH = rect.height;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    // Initialize
    particlesRef.current = [];
    sparksRef.current = [];
    startTimeRef.current = Date.now();
    windRef.current = { x: 0, y: 0, targetX: 0 };

    // Define multiple burst origins for a spectacular explosion
    const origins = [
      { x: logicalW * 0.5, y: logicalH * 0.45, count: Math.floor(particleCount * 0.4), power: 1.2, delay: 0 },
      { x: logicalW * 0.3, y: logicalH * 0.5, count: Math.floor(particleCount * 0.2), power: 1.0, delay: 100 },
      { x: logicalW * 0.7, y: logicalH * 0.5, count: Math.floor(particleCount * 0.2), power: 1.0, delay: 150 },
      { x: logicalW * 0.5, y: logicalH * 0.35, count: Math.floor(particleCount * 0.15), power: 0.9, delay: 300 },
      { x: logicalW * 0.4, y: logicalH * 0.55, count: Math.floor(particleCount * 0.12), power: 0.8, delay: 500 },
      { x: logicalW * 0.6, y: logicalH * 0.4, count: Math.floor(particleCount * 0.12), power: 0.8, delay: 600 },
      // Late surprise bursts
      { x: logicalW * 0.2, y: logicalH * 0.3, count: Math.floor(particleCount * 0.08), power: 0.7, delay: 1000 },
      { x: logicalW * 0.8, y: logicalH * 0.35, count: Math.floor(particleCount * 0.08), power: 0.7, delay: 1100 },
      { x: logicalW * 0.5, y: logicalH * 0.5, count: Math.floor(particleCount * 0.1), power: 1.1, delay: 1500 },
    ];

    const timeouts = [];

    origins.forEach(({ x, y, count, power, delay }) => {
      const t = setTimeout(() => {
        // Create sparks for burst flash
        for (let i = 0; i < 30; i++) {
          sparksRef.current.push(new Spark(x, y));
        }
        // Create confetti particles
        for (let i = 0; i < count; i++) {
          particlesRef.current.push(new Particle(logicalW, logicalH, x, y, power));
        }
      }, delay);
      timeouts.push(t);
    });

    // Start animation
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      timeouts.forEach(clearTimeout);
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