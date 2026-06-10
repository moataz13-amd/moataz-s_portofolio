/*
  Futuristic Premium Portfolio Interactions
  - Three.js WebGL 3D Point Cloud Background
  - Three.js WebGL 3D Interactive Morphing Hero Sculpture (with Orbiting Lights)
  - Lenis Smooth Scroll Momentum
  - GSAP ScrollTrigger Section & Element entrance reveals
  - Interactive 3D Card Hover & Shine Tilt Effects
  - Theme toggle (dark/light) with persistence
  - Nav active link + mobile menu toggle
  - Contact form validation
  - Before/after slider support
  - Seamless 2D Canvas Particle fallback when WebGL is unsupported
*/

// Mouse and Scroll tracking variables
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let currentTheme = 'dark';

// Three.js instances
let bgScene, bgCamera, bgRenderer, bgPoints1, bgPoints2;
let heroScene, heroCamera, heroRenderer, torusKnot;
let light1, light2, light3;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let torusRotationTarget = { x: 0, y: 0 };
let webGLActive = false;

// 2D Fallback Particle Variables
let canvas2D = null;
let ctx2D = null;
let particles2D = [];
let dpr2D = Math.min(window.devicePixelRatio || 1, 2);
let width2D = 0, height2D = 0;
let fallbackActive = false;
let fallbackRafId = null;

// Track window dimensions
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// --- 1. Theme Management ---
function getSavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Adjust 3D colors based on theme if active
  if (webGLActive) {
    if (theme === 'light') {
      if (bgPoints1) bgPoints1.material.color.setHex(0x2563eb); // solid blue
      if (bgPoints2) bgPoints2.material.color.setHex(0xeab308); // solid gold
      if (light1) light1.intensity = 2.5;
      if (light2) light2.intensity = 2.5;
    } else {
      if (bgPoints1) bgPoints1.material.color.setHex(0x00f0ff); // electric cyan
      if (bgPoints2) bgPoints2.material.color.setHex(0xffaa00); // sunset gold
      if (light1) light1.intensity = 3.5;
      if (light2) light2.intensity = 3.5;
    }
  }
}

function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  applyTheme(getSavedTheme());
  btn.addEventListener('click', () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

// --- 2. Three.js WebGL 3D Background Point Cloud ---
function init3DBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return false;

  try {
    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    bgCamera.position.z = 300;

    bgRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Group 1: Cyan points (Electric blue)
    const geo1 = new THREE.BufferGeometry();
    const count1 = 500;
    const pos1 = new Float32Array(count1 * 3);
    for (let i = 0; i < count1 * 3; i += 3) {
      pos1[i] = (Math.random() - 0.5) * 600;
      pos1[i + 1] = (Math.random() - 0.5) * 600;
      pos1[i + 2] = (Math.random() - 0.5) * 600;
    }
    geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
    const mat1 = new THREE.PointsMaterial({
      color: currentTheme === 'light' ? 0x2563eb : 0x00f0ff,
      size: 2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    bgPoints1 = new THREE.Points(geo1, mat1);
    bgScene.add(bgPoints1);

    // Group 2: Gold/Pink points
    const geo2 = new THREE.BufferGeometry();
    const count2 = 300;
    const pos2 = new Float32Array(count2 * 3);
    for (let i = 0; i < count2 * 3; i += 3) {
      pos2[i] = (Math.random() - 0.5) * 600;
      pos2[i + 1] = (Math.random() - 0.5) * 600;
      pos2[i + 2] = (Math.random() - 0.5) * 600;
    }
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    const mat2 = new THREE.PointsMaterial({
      color: currentTheme === 'light' ? 0xeab308 : 0xffaa00,
      size: 2.5,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    bgPoints2 = new THREE.Points(geo2, mat2);
    bgScene.add(bgPoints2);

    return true;
  } catch (e) {
    console.warn("Could not load WebGL Background:", e);
    return false;
  }
}

// --- 3. Three.js WebGL Hero Abstract Glass/Chrome sculpture ---
function initHero3D() {
  const container = document.getElementById('hero-3d-container');
  if (!container || typeof THREE === 'undefined') return;

  try {
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    heroCamera.position.z = 24;

    heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(heroRenderer.domElement);

    // Dynamic Torus Knot (Sculpture)
    const geometry = new THREE.TorusKnotGeometry(6.2, 1.8, 180, 20);
    
    // High-end glassmorphic / chrome physical material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.6,
      thickness: 1.5,
      ior: 1.6,
      side: THREE.DoubleSide
    });

    torusKnot = new THREE.Mesh(geometry, material);
    heroScene.add(torusKnot);

    // Orbiting/Specular Lights
    const ambientLight = new THREE.AmbientLight(0x0a0f26, 1.5);
    heroScene.add(ambientLight);

    light1 = new THREE.PointLight(0x00f0ff, currentTheme === 'light' ? 2.5 : 3.5, 100);
    light1.position.set(15, 15, 15);
    heroScene.add(light1);

    light2 = new THREE.PointLight(0xff007f, currentTheme === 'light' ? 2.5 : 3.5, 100);
    light2.position.set(-15, -15, 15);
    heroScene.add(light2);

    light3 = new THREE.PointLight(0xffaa00, 2.0, 100);
    light3.position.set(0, 15, -10);
    heroScene.add(light3);

    // Add mouse drag interactions
    const dom = heroRenderer.domElement;
    dom.style.cursor = 'grab';

    dom.addEventListener('mousedown', (e) => {
      isDragging = true;
      dom.style.cursor = 'grabbing';
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) {
        // Gentle tilt on hover
        const rect = dom.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        torusRotationTarget.y = x * 0.7;
        torusRotationTarget.x = y * 0.7;
        return;
      }

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      torusKnot.rotation.y += deltaMove.x * 0.005;
      torusKnot.rotation.x += deltaMove.y * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      dom.style.cursor = 'grab';
    });

    // Touch Support for Mobile
    dom.addEventListener('touchstart', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    dom.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };
      torusKnot.rotation.y += deltaMove.x * 0.008;
      torusKnot.rotation.x += deltaMove.y * 0.008;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    dom.addEventListener('touchend', () => {
      isDragging = false;
    });

  } catch (e) {
    console.warn("Could not load Hero 3D:", e);
  }
}

// --- 4. Main 3D WebGL Loop ---
function animate3D(time) {
  if (!webGLActive) return;

  // Background point cloud animate
  if (bgRenderer && bgScene && bgCamera) {
    bgPoints1.rotation.y += 0.00015;
    bgPoints1.rotation.x += 0.00008;
    bgPoints2.rotation.y -= 0.00010;
    bgPoints2.rotation.z += 0.00005;

    // Smooth lerped mouse movement
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    bgPoints1.rotation.x += targetY * 0.0008;
    bgPoints1.rotation.y += targetX * 0.0008;
    bgPoints2.rotation.x -= targetY * 0.0005;
    bgPoints2.rotation.y -= targetX * 0.0005;

    // Scroll depth effect
    bgCamera.position.z = 300 - window.scrollY * 0.06;
    bgRenderer.render(bgScene, bgCamera);
  }

  // Hero Torus sculpture animate
  if (torusKnot && heroRenderer && heroScene && heroCamera) {
    const t = time * 0.0005;

    if (!isDragging) {
      // Gentle auto-rotation
      torusKnot.rotation.y += 0.004;
      torusKnot.rotation.x += 0.002;

      // Mouse tilt tracking
      torusKnot.rotation.x += (torusRotationTarget.x - (torusKnot.rotation.x % Math.PI)) * 0.05;
      torusKnot.rotation.y += (torusRotationTarget.y - (torusKnot.rotation.y % Math.PI)) * 0.05;
    }

    // Orbit lights around sculpture
    light1.position.x = Math.sin(t * 1.5) * 16;
    light1.position.y = Math.cos(t * 1.2) * 16;
    light1.position.z = Math.sin(t * 0.8) * 12;

    light2.position.x = Math.cos(t * 1.0) * 16;
    light2.position.y = Math.sin(t * 1.6) * 16;
    light2.position.z = Math.cos(t * 0.9) * 12;

    light3.position.x = Math.sin(t * 0.8) * 14;
    light3.position.y = Math.sin(t * 0.5) * 14;
    light3.position.z = Math.cos(t * 1.2) * -12;

    // Scroll parallax position
    torusKnot.position.y = -window.scrollY * 0.008;

    heroRenderer.render(heroScene, heroCamera);
  }

  requestAnimationFrame(animate3D);
}

// --- 5. 2D Fallback Particles (Offline / No WebGL Support) ---
function start2DParticles() {
  canvas2D = document.getElementById('bg-canvas');
  if (!canvas2D) return;
  ctx2D = canvas2D.getContext('2d');
  fallbackActive = true;
  resize2D();
  init2DParticles();
  fallbackRafId = requestAnimationFrame(step2D);
}

function resize2D() {
  width2D = window.innerWidth;
  height2D = window.innerHeight;
  canvas2D.width = Math.floor(width2D * dpr2D);
  canvas2D.height = Math.floor(height2D * dpr2D);
  canvas2D.style.width = width2D + 'px';
  canvas2D.style.height = height2D + 'px';
  ctx2D.setTransform(dpr2D, 0, 0, dpr2D, 0, 0);
}

function rand(min, max) { return Math.random() * (max - min) + min; }

function init2DParticles() {
  const count = Math.floor(Math.min(80, width2D * height2D / 24000));
  particles2D = new Array(count).fill(0).map(() => ({
    x: rand(0, width2D),
    y: rand(0, height2D),
    vx: rand(-0.2, 0.2),
    vy: rand(-0.2, 0.2),
    r: rand(1, 2.2),
    hue: Math.random() < 0.5 ? 195 : 45,
    alpha: rand(0.3, 0.8)
  }));
}

function step2D() {
  if (!fallbackActive) return;
  ctx2D.clearRect(0, 0, width2D, height2D);

  // draw connections
  for (let i = 0; i < particles2D.length; i++) {
    const p = particles2D[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > width2D) p.vx *= -1;
    if (p.y < 0 || p.y > height2D) p.vy *= -1;
  }

  for (let i = 0; i < particles2D.length; i++) {
    for (let j = i + 1; j < particles2D.length; j++) {
      const a = particles2D[i], b = particles2D[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 110) {
        const alpha = (1 - dist / 110) * (currentTheme === 'light' ? 0.25 : 0.35);
        ctx2D.strokeStyle = currentTheme === 'light' 
          ? `rgba(37, 99, 235, ${alpha * 0.6})` 
          : `rgba(0, 240, 255, ${alpha * 0.6})`;
        ctx2D.lineWidth = 0.8;
        ctx2D.beginPath(); ctx2D.moveTo(a.x, a.y); ctx2D.lineTo(b.x, b.y); ctx2D.stroke();
      }
    }
  }

  // draw nodes
  for (const p of particles2D) {
    ctx2D.beginPath();
    ctx2D.fillStyle = currentTheme === 'light' 
      ? `rgba(37, 99, 235, ${p.alpha * 0.7})` 
      : `rgba(0, 240, 255, ${p.alpha * 0.7})`;
    ctx2D.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx2D.fill();
  }

  fallbackRafId = requestAnimationFrame(step2D);
}

// --- 6. Lenis Smooth Scroll & GSAP ScrollTrigger reveals ---
function initScrollAndReveals() {
  // 1. Lenis Smooth Scroll Init
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Link Lenis to GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. GSAP ScrollTrigger Reveal Timelines
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Initial page load reveal (Sidebar Links)
    gsap.from('.sidebar-link', {
      opacity: 0,
      scale: 0.8,
      x: -20,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out'
    });

    // Hero content reveal
    gsap.from('.headline', {
      opacity: 0,
      y: 45,
      duration: 1.1,
      delay: 0.1,
      ease: 'power4.out'
    });

    gsap.from('.subhead', {
      opacity: 0,
      y: 25,
      duration: 1.0,
      delay: 0.3,
      ease: 'power3.out'
    });

    gsap.from('.cta', {
      opacity: 0,
      y: 20,
      duration: 0.9,
      delay: 0.45,
      ease: 'power3.out'
    });

    gsap.from('.avatar-card', {
      opacity: 0,
      scale: 0.93,
      y: 40,
      duration: 1.2,
      delay: 0.3,
      ease: 'power4.out'
    });

    // Page sections reveals on scroll
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => {
      const title = sec.querySelector('.title');
      const desc = sec.querySelector('.section-desc');
      const cardsWrapper = sec.querySelector('.cards, .grid, .skills-grid, .contact-wrap, .about-card');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      });

      if (title) {
        tl.from(title, {
          opacity: 0,
          y: 30,
          duration: 0.75,
          ease: 'power3.out'
        });
      }

      if (desc) {
        tl.from(desc, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out'
        }, '-=0.55');
      }

      if (cardsWrapper) {
        const items = cardsWrapper.querySelectorAll('.card, .tile, .skill-card, .tool-card, .contact-form, .socials');
        if (items.length > 0) {
          tl.from(items, {
            opacity: 0,
            y: 30,
            scale: 0.97,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power3.out'
          }, '-=0.45');
        } else {
          tl.from(cardsWrapper, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out'
          }, '-=0.45');
        }
      }
    });
  } else {
    // If GSAP is missing, fall back to simple CSS visibility triggers (IntersectionObserver)
    setupIntersectionObserverReveals();
  }
}

// Fallback IntersectionObserver reveals in case GSAP is missing
function setupIntersectionObserverReveals() {
  const items = document.querySelectorAll('.card, .tile, .tool-card, .skill-card, .section');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.animate([
          { transform: 'translateY(15px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 600, easing: 'cubic-bezier(.25,.75,.25,1)', fill: 'both' });

        if (entry.target.classList.contains('skill-card')) {
          animateSkillCard(entry.target);
        }
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

function animateSkillCard(root) {
  const pct = Math.max(0, Math.min(100, parseFloat(root.getAttribute('data-pct')) || 0));
  const ring = root.querySelector('.skill-ring');
  const bar = root.querySelector('.skill-bar');
  const fill = root.querySelector('.skill-fill');
  if (ring) ring.style.setProperty('--pct', pct + '%');
  if (fill) fill.style.width = pct + '%';
  if (bar) bar.setAttribute('aria-valuenow', String(pct));
}

// --- 7. Vanilla JS Interactive 3D Tilt Card Hover ---
function init3DTilt() {
  const elements = document.querySelectorAll('.card, .tile, .about-card, .avatar-card');
  elements.forEach(el => {
    // Inject custom glow/shine element dynamically if not present
    let shine = el.querySelector('.card-shine');
    if (!shine) {
      shine = document.createElement('div');
      shine.className = 'card-shine';
      el.appendChild(shine);
    }

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Compute tilt factors (max 10 degrees)
      const tiltX = (yc - y) / yc * 8;
      const tiltY = (x - xc) / xc * 8;

      el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
      
      // Radial glow gradient follows mouse
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.1) 0%, transparent 65%)`;
      shine.style.opacity = '1';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      shine.style.opacity = '0';
    });
  });
}

// --- 8. Nav Link Highlight on Scroll ---
function handleActiveLinks() {
  const all = Array.from(document.querySelectorAll('.sidebar-link'));
  const links = all.filter(a => {
    const href = a.getAttribute('href') || '';
    return href.startsWith('#') || href.includes('#');
  });
  if (links.length === 0) return;

  const sections = links.map(a => {
    const href = a.getAttribute('href');
    const hash = href.substring(href.indexOf('#'));
    try { return document.querySelector(hash); } catch { return null; }
  });

  function onScroll() {
    const y = window.scrollY + 140;
    let activeIdx = 0;
    sections.forEach((sec, idx) => {
      if (sec && y >= sec.offsetTop) activeIdx = idx;
    });
    links.forEach((l, i) => l.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// --- 9. Mobile Menu Setup ---
function setupMobileMenu() {
  const header = document.querySelector('.nav');
  const btn = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  
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

// --- 10. Contact Form Submissions ---
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
    
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:mizoelzyat@gmail.com?subject=${subject}&body=${body}`;
  });
}

// --- 11. Before/After Sliders (For Design Artworks comparison) ---
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('.before-after');
  sliders.forEach((root) => setupBA(root));

  function setupBA(root) {
    const afterClip = root.querySelector('.ba-after-clip');
    const handle = root.querySelector('.ba-handle');
    const sheen = root.querySelector('.ba-sheen');
    if (!afterClip || !handle) return;

    let rect = root.getBoundingClientRect();
    let pct = Math.max(0, Math.min(100, parseFloat(root.getAttribute('data-initial')) || 50));
    let dragging = false;

    function setPct(v, withTransition = false) {
      pct = Math.max(0, Math.min(100, v));
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
      if (sheen) sheen.classList.add('opacity-100');
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
      if (sheen) setTimeout(() => sheen.classList.remove('opacity-100'), 200);
    }

    root.addEventListener('mousedown', onDown);
    root.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('touchend', onUp, { passive: true });
    window.addEventListener('resize', updateRect);

    handle.addEventListener('keydown', (e) => {
      const stepVal = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft') { setPct(pct - stepVal, true); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPct(pct + stepVal, true); e.preventDefault(); }
      if (e.key === 'Home') { setPct(0, true); e.preventDefault(); }
      if (e.key === 'End') { setPct(100, true); e.preventDefault(); }
    });

    setPct(pct, true);
  }
}

// --- 11.5. Typewriter Effect ---
function initTypewriter() {
  const element = document.getElementById('typing-text');
  if (!element) return;
  const words = ["Graphic Designer", "3D Creator", "UI/UX Specialist", "Visual Storyteller"];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentWord = words[wordIdx];
    if (isDeleting) {
      element.textContent = currentWord.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 50;
    } else {
      element.textContent = currentWord.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIdx === currentWord.length) {
      isDeleting = true;
      typingSpeed = 2000;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
  }
  
  type();
}

// --- 11.6. Back to Top Button ---
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  
  btn.addEventListener('click', () => {
    if (window.lenis) {
      window.lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Global Mouse Pos trackers
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) - 0.5;
  mouseY = (e.clientY / window.innerHeight) - 0.5;
});

// --- 12. Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Theme Setup
  setupThemeToggle();

  // Load UI components
  handleActiveLinks();
  setupMobileMenu();
  setupContactForm();
  initBeforeAfterSliders();
  init3DTilt();
  initTypewriter();
  initBackToTop();

  // Set footer copyright year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Initialize Three.js WebGL systems
  if (typeof THREE !== 'undefined') {
    const bgSuccess = init3DBackground();
    initHero3D();

    if (bgSuccess) {
      webGLActive = true;
      requestAnimationFrame(animate3D);
    } else {
      start2DParticles();
    }
  } else {
    // If THREE script didn't load, use 2D canvas particle fallback
    start2DParticles();
  }

  // Initialize Scroll triggers (GSAP/Lenis)
  initScrollAndReveals();
});

// Resize handler
window.addEventListener('resize', () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  if (webGLActive) {
    // Resize background Three.js scene
    if (bgRenderer && bgCamera) {
      bgCamera.aspect = windowWidth / windowHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(windowWidth, windowHeight);
    }

    // Resize Hero Three.js sculpture scene
    const container = document.getElementById('hero-3d-container');
    if (container && heroRenderer && heroCamera) {
      const w = container.clientWidth;
      const h = container.clientHeight;
      heroCamera.aspect = w / h;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(w, h);
    }
  }

  if (fallbackActive) {
    resize2D();
    init2DParticles();
  }
});

// Pause / Resume rendering on visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    webGLActive = false;
    fallbackActive = false;
    if (fallbackRafId) cancelAnimationFrame(fallbackRafId);
  } else {
    if (typeof THREE !== 'undefined' && bgScene) {
      webGLActive = true;
      requestAnimationFrame(animate3D);
    } else {
      fallbackActive = true;
      fallbackRafId = requestAnimationFrame(step2D);
    }
  }
});
