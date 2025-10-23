/*
  Futuristic Portfolio Interactions
  - Particle background (canvas)
  - Theme toggle (dark/light) with persistence
  - Nav active link + mobile toggle
  - Smooth section reveals
  - Contact form light validation
*/

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let width = 0, height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let currentTheme = 'dark';

function getSavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function rand(min, max) { return Math.random() * (max - min) + min; }

function initParticles() {
  const count = Math.floor(Math.min(120, width * height / 14000));
  particles = new Array(count).fill(0).map(() => ({
    x: rand(0, width),
    y: rand(0, height),
    vx: rand(-0.25, 0.25),
    vy: rand(-0.25, 0.25),
    r: rand(1, 2.2),
    hue: Math.random() < 0.5 ? 195 : 45, // blue or gold
    alpha: rand(0.3, 0.9)
  }));
}

function step() {
  ctx.clearRect(0, 0, width, height);

  // subtle grid lines
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  const s = 28;
  for (let x = 0; x < width; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0; y < height; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  ctx.restore();

  // connections
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
  }

  // draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * (currentTheme === 'light' ? 0.28 : 0.35);
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, `hsla(${a.hue}, 90%, 65%, ${alpha})`);
        g.addColorStop(1, `hsla(${b.hue}, 90%, 65%, ${alpha})`);
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }

  // draw particles
  for (const p of particles) {
    ctx.beginPath();
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
    glow.addColorStop(0, `hsla(${p.hue}, 90%, 60%, ${p.alpha})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(step);
}

// Smooth nav active state
function handleActiveLinks() {
  // Only consider in-page hash links; external/relative links are ignored on subpages
  const all = Array.from(document.querySelectorAll('.nav-link'));
  const links = all.filter(a => {
    const href = a.getAttribute('href') || '';
    return href.startsWith('#');
  });
  if (links.length === 0) return; // nothing to track on this page

  const sections = links.map(a => {
    const sel = a.getAttribute('href');
    try { return document.querySelector(sel); } catch { return null; }
  });

  function onScroll() {
    const y = window.scrollY + 120;
    let activeIdx = 0;
    sections.forEach((sec, idx) => {
      if (sec && y >= sec.offsetTop) activeIdx = idx;
    });
    links.forEach((l, i) => l.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Mobile menu toggle
function setupMobileMenu() {
  const header = document.querySelector('.nav');
  const btn = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  btn.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      header.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Section reveal animations
function setupReveals() {
  const items = document.querySelectorAll('.card, .tile, .tool-card');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.animate([
          { transform: 'translateY(12px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.14 });
  items.forEach(el => io.observe(el));
}

// Theme toggle
function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const saved = getSavedTheme();
  applyTheme(saved);
  btn.addEventListener('click', () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

// Contact form
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();
    if (!name || !email || !message) {
      alert('Please fill in your name, email, and message.');
      return;
    }
    const subject = encodeURIComponent('Portfolio Contact');
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
  });
}

function startCanvas() {
  resize();
  initParticles();
  requestAnimationFrame(step);
}

// UI/light init as soon as DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  handleActiveLinks();
  setupMobileMenu();
  setupReveals();
  setupThemeToggle();
  setupContactForm();
  initBeforeAfterSliders();
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

// Start heavy canvas after full load for better FID
window.addEventListener('load', () => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    startCanvas();
  }
});

// Keep canvas responsive when running
window.addEventListener('resize', () => { resize(); initParticles(); });

// Before/After slider
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('.before-after');
  sliders.forEach((root) => setupBA(root));

  function setupBA(root) {
    const afterClip = root.querySelector('.ba-after-clip');
    const handle = root.querySelector('.ba-handle');
    const sheen = root.querySelector('.ba-sheen');
    if (!afterClip || !handle) return;

    let rect = root.getBoundingClientRect();
    let pct = clampPct(parseFloat(root.getAttribute('data-initial')) || 50);
    let dragging = false;

    function clampPct(v) { return Math.max(0, Math.min(100, v)); }
    function setPct(v, withTransition = false) {
      pct = clampPct(v);
      const x = (pct / 100) * rect.width;
      afterClip.style.width = `${x}px`;
      handle.style.transform = `translateX(${x}px)`;
      if (withTransition) {
        afterClip.style.transition = 'width 500ms cubic-bezier(.4,0,.2,1)';
        handle.style.transition = 'transform 500ms cubic-bezier(.4,0,.2,1)';
        clearTimeout(handle._t);
        handle._t = setTimeout(() => {
          afterClip.style.transition = '';
          handle.style.transition = '';
        }, 520);
      }
    }

    function updateRect() { rect = root.getBoundingClientRect(); setPct(pct); }

    function pointerToPct(clientX) {
      const x = clientX - rect.left;
      return (x / rect.width) * 100;
    }

    function onDown(e) {
      dragging = true;
      root.classList.add('dragging');
      if (sheen) {
        sheen.classList.add('animate-[glassSheen_1.6s_ease-in-out]','opacity-100');
      }
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setPct(pointerToPct(x));
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setPct(pointerToPct(x));
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('dragging');
      if (sheen) {
        sheen.classList.remove('animate-[glassSheen_1.6s_ease-in-out]');
        // keep a subtle fade-out
        setTimeout(() => sheen.classList.remove('opacity-100'), 200);
      }
    }

    root.addEventListener('mousedown', onDown);
    root.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('touchend', onUp, { passive: true });
    window.addEventListener('resize', () => updateRect());

    // keyboard accessibility for handle
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft') { setPct(pct - step, true); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPct(pct + step, true); e.preventDefault(); }
      if (e.key === 'Home') { setPct(0, true); e.preventDefault(); }
      if (e.key === 'End') { setPct(100, true); e.preventDefault(); }
    });

    // Initialize
    setPct(pct, true);
  }
}
