/**
 * animations.js — Particle & Visual Effects — CrideviSPA
 * ========================================================
 * Floating golden petal particles on canvas.
 * Parallax hero effect.
 * ========================================================
 */

(function() {
  'use strict';

  /* ── Floating Petal Particles ─────────────────────── */
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* Gold color palette for petals */
  const COLORS = [
    'rgba(201, 169, 110, 0.6)',
    'rgba(226, 201, 138, 0.5)',
    'rgba(245, 223, 160, 0.4)',
    'rgba(160, 120, 64, 0.5)',
    'rgba(240, 230, 208, 0.4)',
  ];

  class Petal {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x     = randomRange(0, W);
      this.y     = initial ? randomRange(-H, H) : randomRange(-80, -20);
      this.size  = randomRange(4, 10);
      this.speedY = randomRange(0.4, 1.2);
      this.speedX = randomRange(-0.4, 0.4);
      this.rot   = randomRange(0, Math.PI * 2);
      this.rotSpeed = randomRange(-0.02, 0.02);
      this.alpha = randomRange(0.3, 0.8);
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.wobble = randomRange(0, Math.PI * 2);
      this.wobbleSpeed = randomRange(0.01, 0.03);
    }

    update() {
      this.y += this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.5;
      this.rot += this.rotSpeed;
      if (this.y > H + 20) this.reset();
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;

      // Draw a simple petal/leaf shape
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function initParticles() {
    const count = Math.min(Math.floor(W / 22), 50); // Responsive count, max 50
    particles = Array.from({ length: count }, () => new Petal());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
    animId = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    initParticles();
    loop();
  }

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      start();
    }, 250);
  }, { passive: true });

  // Only show particles in hero area — pause when scrolled far
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH = window.innerHeight;
    if (scrollY > heroH * 1.5) {
      // Fade out canvas when past hero
      canvas.style.opacity = Math.max(0, 1 - (scrollY - heroH) / (heroH * 0.5));
    } else {
      canvas.style.opacity = 0.5;
    }
  }, { passive: true });

  // Start on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  /* ── Hero Parallax ──────────────────────────────── */
  const heroImg = document.getElementById('hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;
      if (scrollY <= maxScroll) {
        heroImg.style.transform = `translateY(${scrollY * 0.25}px)`;
      }
    }, { passive: true });
  }

})();
