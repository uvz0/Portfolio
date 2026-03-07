// ── scroll to top on load ──
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const ASSETS = {
  lofi:      'assets/lofi.mp3',
  jumpscare: 'assets/jumpscare.png',
  jumpAudio: 'assets/jumpscare.mp3',
};

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const introSequence = [
  'Hmm, Tired? Scrolling Through Thousands of Portfolios?',
  "It's My Turn, I Guess...",
  "Don't Worry, You Won't Be Bored, I Will Play Music For You.",
  "Let's Begin, It's Not A Portfolio, It's An Experience.",
  'An Experience, Out Of The World :)'
];

const projects = [
  {
    title: 'matha-lib', kind: 'Python package',
    description: 'One package, many bad decisions (productive ones). matha-lib bundles math utilities, plotting helpers, sorting implementations, ML bits, probability distributions, plus calculus and algebra tools. Designed to be usable for real work and readable enough that future-me won\'t file a complaint.',
    tech: ['Python', 'Math', 'Plotting', 'Sorting', 'ML', 'Calculus', 'Algebra'],
    link: 'https://github.com/uvz0?tab=repositories&q=matha-lib'
  },
  {
    title: 'hyprcursor-sync-git', kind: 'AUR project',
    description: 'An AUR project for keeping cursor themes synced and sane—especially in Hyprland setups. Because nothing says "I have my life together" like version-controlling your cursor. Lightweight, practical, and built for people who rebuild their desktop at 2AM for spiritual reasons.',
    tech: ['AUR', 'Linux', 'Hyprland', 'Git'],
    link: 'https://github.com/uvz0?tab=repositories&q=hyprcursor-sync-git'
  },
  {
    title: 'Tauri Authenticator', kind: 'Desktop app (Linux/Windows/macOS)',
    description: 'A cross-platform authenticator built with Tauri: small footprint, fast startup, and a UI that doesn\'t look like a warning dialog from 2009. Daily-use smoothness—clean flows, low friction, desktop-native feel—so security doesn\'t have to be a punishment.',
    tech: ['Tauri', 'JavaScript', 'Desktop', 'UI/UX'],
    link: 'https://github.com/uvz0?tab=repositories&q=tauri'
  }
];

const skillGroups = [
  { label: 'Code',    skills: ['JavaScript', 'Python', 'C++', 'Tauri'] },
  { label: 'Hardware',skills: ['ESP32'] },
  { label: 'Web',     skills: ['HTML', 'CSS'] },
  { label: 'Design',  skills: ['UI/UX design', 'Figma', 'Inkscape', 'Canva'] }
];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let reducedMotion = false;
let musicAllowed  = false;
let musicStatus   = 'off';
let introStep     = 0;
let typingDone    = false;
let typingInterval = null;
let brandClicks   = 0;
let konamiIndex   = 0;
let konamiActive  = false;
const konamiCode  = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

// ─────────────────────────────────────────────
//  DOM REFS
// ─────────────────────────────────────────────
const mainEl         = document.getElementById('main');
const lofiAudio      = document.getElementById('lofi-audio');
const jumpscareAudio = document.getElementById('jumpscare-audio');
const jumpscareImg   = document.getElementById('jumpscare-img');
const headphonesOvl  = document.getElementById('headphones-overlay');
const introOvl       = document.getElementById('intro-overlay');
const jumpscareOvl   = document.getElementById('jumpscare-overlay');
const konamiOvl      = document.getElementById('konami-overlay');
const musicBtn       = document.getElementById('music-btn');
const musicLabel     = document.getElementById('music-label');
const brandBtn       = document.getElementById('brand-btn');
const introText      = document.getElementById('intro-text');
const introCursor    = document.getElementById('intro-cursor');
const introNextBtn   = document.getElementById('intro-next-btn');
const introMusicBtn  = document.getElementById('intro-music-btn');
const thanksToast    = document.getElementById('thanks-toast');
const projectsGrid   = document.getElementById('projects-grid');
const skillsGrid     = document.getElementById('skills-grid');
const root           = document.documentElement;

// ─────────────────────────────────────────────
//  NAV SCRAMBLE — letters glitch then resolve on hover
// ─────────────────────────────────────────────
const SCRAMBLE_CHARS = '✦⬡△◈⬢✸⊕∞⋆';
function scrambleText(el) {
  const original = el.dataset.original || el.textContent;
  el.dataset.original = original;
  let frame = 0;
  const total = 14;
  const id = setInterval(() => {
    el.textContent = original.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (frame / total > i / original.length) return char;
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }).join('');
    if (++frame >= total) { clearInterval(id); el.textContent = original; }
  }, 28);
}

document.querySelectorAll('.navlink').forEach(el => {
  el.addEventListener('mouseenter', () => scrambleText(el));
});

// ─────────────────────────────────────────────
//  ASSET INIT
// ─────────────────────────────────────────────
lofiAudio.src      = ASSETS.lofi;
jumpscareAudio.src = ASSETS.jumpAudio;
jumpscareImg.src   = ASSETS.jumpscare;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}
window.scrollToId = scrollToId;

// ─────────────────────────────────────────────
//  RENDER PROJECTS
// ─────────────────────────────────────────────
projects.forEach((p, i) => {
  const article = document.createElement('article');
  article.className = 'card project span-6';
  article.setAttribute('data-tilt', '');
  article.setAttribute('data-reveal', 'pop');
  article.style.cssText = `--d:${180 + i * 90}ms`;
  const chips = p.tech.map(t => `<span class="chip" data-reveal="fade" style="--d:${220 + i * 80}ms">${t}</span>`).join('');
  article.innerHTML = `
    <div class="project-head">
      <div><div class="kicker">${p.kind}</div><h3 class="h3"><span class="project-title">${p.title}</span></h3></div>
      <a class="btn" data-magnetic href="${p.link}" target="_blank" rel="noreferrer">peek →</a>
    </div>
    <p class="project-desc">${p.description}</p>
    <div class="chipset">${chips}</div>`;
  projectsGrid.appendChild(article);
});

// ─────────────────────────────────────────────
//  STAT COUNTER — numbers count up on reveal
// ─────────────────────────────────────────────
function animateCounter(el, target, duration = 1200) {
  if (target === '∞' || target === '0') {
    // for 0, flash from high to 0; for ∞, pulse in
    if (target === '0') {
      let v = 99, id = setInterval(() => {
        el.textContent = v;
        v -= Math.ceil(v * 0.35);
        if (v <= 0) { clearInterval(id); el.textContent = '0'; }
      }, 60);
    } else {
      el.style.opacity = '0';
      setTimeout(() => { el.style.transition = 'opacity 0.6s ease'; el.style.opacity = '1'; }, 100);
    }
    return;
  }
  const end = parseInt(target);
  if (isNaN(end)) return;
  const start = 0, step = 16;
  const steps = Math.floor(duration / step);
  let current = 0;
  const id = setInterval(() => {
    current++;
    el.textContent = Math.round(start + (end - start) * (current / steps));
    if (current >= steps) { clearInterval(id); el.textContent = target; }
  }, step);
}
// ─────────────────────────────────────────────
// STAT OBSERVER
// ─────────────────────────────────────────────
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const numEl = entry.target.querySelector('.stat-num');
    if (!numEl || numEl.dataset.counted) return;
    numEl.dataset.counted = '1';
    animateCounter(numEl, numEl.textContent.trim());
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(el => statObserver.observe(el));

// ─────────────────────────────────────────────
//  RENDER SKILLS
// ─────────────────────────────────────────────
skillGroups.forEach((g, i) => {
  const div = document.createElement('div');
  div.className = 'card';
  div.setAttribute('data-tilt', '');
  div.setAttribute('data-reveal', 'pop');
  div.style.cssText = `--d:${140 + i * 90}ms`;
  const chips = g.skills.map(s => `<span class="chip accent" data-reveal="fade" style="--d:${200 + i * 90}ms">${s}</span>`).join('');
  div.innerHTML = `<div class="kicker" data-reveal="fade" style="--d:${170 + i * 90}ms">${g.label}</div><div class="chipset">${chips}</div>`;
  skillsGrid.appendChild(div);
});
// ─────────────────────────────────────────────
// ── add scan line el to each project card ──
// ─────────────────────────────────────────────
document.querySelectorAll('.project').forEach(card => {
  const line = document.createElement('div');
  line.className = 'scan-line';
  card.appendChild(line);
  // re-trigger animation on every hover
  card.addEventListener('mouseenter', () => {
    line.style.animation = 'none';
    void line.offsetWidth;
    line.style.animation = '';
  });
});
// ─────────────────────────────────────────────
//  GLOW LETTER EFFECT
// ─────────────────────────────────────────────
const glowEl = document.getElementById('glow-rehan');
if (glowEl) {
  const letters = glowEl.textContent.split('');
  glowEl.textContent = '';
  letters.forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'glow-letter';
    span.setAttribute('data-char', char);
    span.style.setProperty('--li', i);
    const ghost = document.createElement('span');
    ghost.className = 'glow-ghost';
    ghost.textContent = char;
    ghost.setAttribute('aria-hidden', 'true');
    span.textContent = char;
    span.appendChild(ghost);
    glowEl.appendChild(span);
  });
}

// ─────────────────────────────────────────────
//  STAR FIELD CANVAS
// ─────────────────────────────────────────────
const starCanvas = document.getElementById('starfield');
const starCtx    = starCanvas.getContext('2d');
let stars = [];

function initStars() {
  starCanvas.width  = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = [];
  const count = Math.floor((window.innerWidth * window.innerHeight) / 3000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      r: Math.random() * 1.4 + 0.2,
      base: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.6 + 0.1,
      phase: Math.random() * Math.PI * 2,
      // colour: mostly white, some purple/cyan tinted
      hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 260 : 188) : 0,
      sat: Math.random() < 0.15 ? 80 : 0,
    });
  }
}

let starT = 0;
function drawStars() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  starT += 0.012;
  for (const s of stars) {
    const alpha = s.base + Math.sin(starT * s.speed + s.phase) * 0.3;
    starCtx.beginPath();
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starCtx.fillStyle = s.sat
      ? `hsla(${s.hue},${s.sat}%,80%,${alpha})`
      : `rgba(255,255,255,${alpha})`;
    starCtx.fill();
  }
  requestAnimationFrame(drawStars);
}

initStars();
drawStars();
window.addEventListener('resize', initStars, { passive: true });

// ─────────────────────────────────────────────
//  CUSTOM CURSOR + TRAIL
// ─────────────────────────────────────────────
const cursorOrb    = document.getElementById('cursor-orb');
const trailCanvas  = document.getElementById('cursor-trail');
const trailCtx     = trailCanvas.getContext('2d');
let mouseX = -200, mouseY = -200;
let trail  = []; // {x,y,age}
const TRAIL_LENGTH = 22;

function resizeTrail() {
  trailCanvas.width  = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}
resizeTrail();
window.addEventListener('resize', resizeTrail, { passive: true });

window.addEventListener('pointermove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorOrb.style.left = mouseX + 'px';
  cursorOrb.style.top  = mouseY + 'px';
  trail.push({ x: mouseX, y: mouseY, age: 0 });
  if (trail.length > TRAIL_LENGTH) trail.shift();

  // hover state on interactive elements
  const target = e.target;
  const isInteractive = target.closest('a,button,[data-magnetic]');
  cursorOrb.classList.toggle('cursor-hover', !!isInteractive);
}, { passive: true });

function drawTrail() {
  trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  for (let i = 0; i < trail.length; i++) {
    const t = trail[i];
    t.age++;
    const life = 1 - t.age / (TRAIL_LENGTH * 1.4);
    if (life <= 0) continue;
    const r = (i / trail.length) * 5 * life;
    const alpha = life * 0.55;
    // gradient from cyan to purple along trail
    const ratio = i / trail.length;
    const ri = Math.round(34  + (139 - 34)  * ratio);
    const gi = Math.round(211 + (92  - 211) * ratio);
    const bi = Math.round(238 + (246 - 238) * ratio);
    trailCtx.beginPath();
    trailCtx.arc(t.x, t.y, Math.max(0.5, r), 0, Math.PI * 2);
    trailCtx.fillStyle = `rgba(${ri},${gi},${bi},${alpha})`;
    trailCtx.fill();
  }
  trail = trail.filter(t => t.age < TRAIL_LENGTH * 1.4);
  requestAnimationFrame(drawTrail);
}
drawTrail();

// ─────────────────────────────────────────────
//  DOT SUPERNOVA — click the nav dot for a burst
// ─────────────────────────────────────────────
document.querySelector('.dot')?.addEventListener('click', e => {
  if (reducedMotion) return;
  const rect = e.target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const colors = ['rgba(139,92,246,0.7)', 'rgba(34,211,238,0.6)', 'rgba(232,121,249,0.5)', 'rgba(251,191,36,0.4)'];
  const sizes  = [120, 220, 340, 480];
  sizes.forEach((size, i) => {
    const ring = document.createElement('div');
    ring.className = 'supernova-ring';
    ring.style.cssText = `
      left:${cx}px; top:${cy}px;
      width:${size}px; height:${size}px;
      border: 1.5px solid ${colors[i]};
      box-shadow: 0 0 ${12 + i*6}px ${colors[i]};
      animation-delay:${i * 80}ms;
      animation-duration:${0.7 + i * 0.15}s;
    `;
    document.body.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove(), { once: true });
  });
});

// ─────────────────────────────────────────────
//  CLICK STARBURST RIPPLE
// ─────────────────────────────────────────────
document.addEventListener('click', e => {
  if (reducedMotion) return;
  // don't ripple on buttons/links (they have their own feedback)
  for (let n = 0; n < 3; n++) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.cssText = `left:${e.clientX}px; top:${e.clientY}px; animation-delay:${n * 80}ms; border-color: rgba(139,92,246,${0.6 - n*0.15});`;
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }
});

// ─────────────────────────────────────────────
//  IDLE COMET
// ─────────────────────────────────────────────
let idleTimer = null;

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(launchComet, 10000);
}

function launchComet() {
  if (reducedMotion) return;
  const comet = document.createElement('div');
  comet.className = 'comet';
  const startY = 10 + Math.random() * 30;
  comet.style.top = startY + 'vh';
  document.body.appendChild(comet);
  comet.addEventListener('animationend', () => { comet.remove(); resetIdleTimer(); }, { once: true });
}

window.addEventListener('pointermove', resetIdleTimer, { passive: true });
window.addEventListener('keydown', resetIdleTimer, { passive: true });
window.addEventListener('scroll', resetIdleTimer, { passive: true });
resetIdleTimer();

// ─────────────────────────────────────────────
//  MUSIC
// ─────────────────────────────────────────────
async function ensureAudio() {
  if (!musicAllowed) return;
  try {
    lofiAudio.volume = 0.3;
    await lofiAudio.play();
    musicStatus = 'on';
    updateMusicBtn();
  } catch { /* autoplay blocked */ }
}

function toggleMusic() {
  if (!musicAllowed) return;
  if (musicStatus === 'muted' || lofiAudio.paused) {
    lofiAudio.play(); musicStatus = 'on';
  } else {
    lofiAudio.pause(); musicStatus = 'muted';
  }
  updateMusicBtn();
}

function updateMusicBtn() {
  musicLabel.textContent = musicStatus === 'on' ? 'music: on' : 'music: off';
  introMusicBtn.textContent = musicStatus === 'on' ? 'mute' : 'unmute';
}

// ─────────────────────────────────────────────
//  HEADPHONES OVERLAY
// ─────────────────────────────────────────────
function continueFromHeadphones(allowMusic) {
  musicAllowed = allowMusic;
  hide(headphonesOvl);
  if (allowMusic) { show(musicBtn); show(introMusicBtn); }
  openIntro();
}
document.getElementById('hp-yes').addEventListener('click', () => continueFromHeadphones(true));
document.getElementById('hp-no').addEventListener('click',  () => continueFromHeadphones(false));

// ─────────────────────────────────────────────
//  INTRO SEQUENCE
// ─────────────────────────────────────────────
function openIntro() {
  introStep = 0;
  show(introOvl);
  introOvl.focus();
  startTyping();
}

// ─────────────────────────────────────────────
//  HEADING GLITCH — fires once when h2 scrolls in
// ─────────────────────────────────────────────
const glitchObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const h2 = entry.target;
    if (h2.dataset.glitched) return;
    h2.dataset.glitched = '1';
    setTimeout(() => {
      h2.classList.add('glitch-once');
      h2.addEventListener('animationend', () => h2.classList.remove('glitch-once'), { once: true });
    }, 300); // slight delay after fade-in
    glitchObserver.unobserve(h2);
  });
}, { threshold: 0.8 });

document.querySelectorAll('#projects .h2, #skills .h2, #hire .h2').forEach(el => glitchObserver.observe(el));


function startTyping() {
  clearInterval(typingInterval);
  typingDone = false;
  introText.textContent = '';
  introCursor.textContent = '▌';
  introNextBtn.textContent = 'skip typing';
  const full = introSequence[introStep] ?? '';
  if (reducedMotion) {
    introText.textContent = full; typingDone = true;
    introCursor.textContent = '';
    introNextBtn.textContent = introStep === introSequence.length - 1 ? 'enter' : 'next';
    return;
  }
  let i = 0;
  typingInterval = setInterval(() => {
    i = Math.min(full.length, i + 1);
    introText.textContent = full.slice(0, i);
    if (i >= full.length) {
      clearInterval(typingInterval);
      typingDone = true;
      introCursor.textContent = '';
      introNextBtn.textContent = introStep === introSequence.length - 1 ? 'enter' : 'next';
    }
  }, 18);
}

function nextIntro() {
  if (!typingDone) {
    clearInterval(typingInterval);
    introText.textContent = introSequence[introStep] ?? '';
    typingDone = true; introCursor.textContent = '';
    introNextBtn.textContent = introStep === introSequence.length - 1 ? 'enter' : 'next';
    return;
  }
  if (introStep < introSequence.length - 1) {
    introStep++;
    if (introStep === 2) ensureAudio();
    startTyping(); return;
  }
  // fade out transition
  introOvl.style.transition = 'opacity 0.7s ease, backdrop-filter 0.7s ease';
  introOvl.style.opacity = '0';
  introOvl.style.backdropFilter = 'blur(0px)';
  setTimeout(() => {
    hide(introOvl);
    introOvl.style.opacity = '';
    introOvl.style.transition = '';
    introOvl.style.backdropFilter = '';
    if (musicAllowed && musicStatus === 'off') ensureAudio();
  }, 700);
}

introOvl.addEventListener('click', nextIntro);
introNextBtn.addEventListener('click', e => { e.stopPropagation(); nextIntro(); });
introMusicBtn.addEventListener('click', e => { e.stopPropagation(); toggleMusic(); });
musicBtn.addEventListener('click', toggleMusic);

// ─────────────────────────────────────────────
//  HIRE BUTTONS
// ─────────────────────────────────────────────
document.getElementById('yes-btn').addEventListener('click', () => {
  show(thanksToast);
  setTimeout(() => hide(thanksToast), reducedMotion ? 900 : 1800);
});

document.getElementById('no-btn').addEventListener('click', () => {
  const el = document.documentElement;
  (el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || el.mozRequestFullScreen?.());
  show(jumpscareOvl);
  jumpscareAudio.currentTime = 0;
  const p = jumpscareAudio.play(); if (p) p.catch(() => {});
  let dismissed = false;
  const dismissJumpscare = () => {
    if (dismissed) return; dismissed = true;
    hide(jumpscareOvl);
    jumpscareAudio.pause(); jumpscareAudio.currentTime = 0;
    (document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.mozCancelFullScreen?.());
  };
  jumpscareAudio.addEventListener('ended', dismissJumpscare, { once: true });
  setTimeout(dismissJumpscare, reducedMotion ? 650 : 1300);
});

// ─────────────────────────────────────────────
//  BRAND EASTER EGG
// ─────────────────────────────────────────────
brandBtn.addEventListener('click', () => {
  brandClicks++;
  brandBtn.textContent = brandClicks >= 5 ? 'system compromised' : 'student dev';
});

// ─────────────────────────────────────────────
//  KONAMI CODE — shooting stars overlay
// ─────────────────────────────────────────────
function triggerKonami() {
  show(konamiOvl);
  const canvas = document.getElementById('konami-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const shots = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.5,
    vx: (Math.random() - 0.3) * 6 + 4,
    vy: Math.random() * 3 + 1,
    len: Math.random() * 120 + 60,
    alpha: Math.random() * 0.6 + 0.4,
    hue: Math.random() < 0.5 ? 260 : 188,
  }));

  let frame = 0;
  function animateKonami() {
    ctx.fillStyle = 'rgba(4,4,16,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const s of shots) {
      s.x += s.vx; s.y += s.vy;
      if (s.x > canvas.width + 200 || s.y > canvas.height + 100) {
        s.x = Math.random() * canvas.width * 0.3;
        s.y = Math.random() * canvas.height * 0.3;
      }
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * (s.len / 6), s.y - s.vy * (s.len / 6));
      const grad = ctx.createLinearGradient(s.x - s.vx * (s.len/6), s.y - s.vy * (s.len/6), s.x, s.y);
      grad.addColorStop(0, `hsla(${s.hue},80%,70%,0)`);
      grad.addColorStop(1, `hsla(${s.hue},80%,90%,${s.alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    frame++;
    if (frame < 300 && !konamiOvl.classList.contains('hidden')) {
      requestAnimationFrame(animateKonami);
    }
  }
  animateKonami();
}

document.getElementById('konami-close').addEventListener('click', () => hide(konamiOvl));

// ─────────────────────────────────────────────
//  KONAMI HINT PULSE
// ─────────────────────────────────────────────
const konamiHint = document.getElementById('konami-hint');
if (konamiHint) {
  const pulse = () => {
    konamiHint.classList.remove('hint-pulse');
    void konamiHint.offsetWidth;
    konamiHint.classList.add('hint-pulse');
  };
  setTimeout(pulse, 3000);
  setInterval(pulse, 15000);
}

// ─────────────────────────────────────────────
//  KEYBOARD
// ─────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hide(jumpscareOvl); hide(introOvl); hide(headphonesOvl); hide(konamiOvl);
  }
  if (e.key === ' ' && !introOvl.classList.contains('hidden')) {
    e.preventDefault(); nextIntro();
  }
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      konamiActive = !konamiActive;
      konamiIndex = 0;
      if (konamiActive) triggerKonami();
      else hide(konamiOvl);
    }
  } else { konamiIndex = 0; }
}, { passive: false });

// ─────────────────────────────────────────────
//  SCROLL PROGRESS
// ─────────────────────────────────────────────
let scrollRaf = 0;
function updateScrollProgress() {
  const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
  root.style.setProperty('--scroll', String(Math.min(1, Math.max(0, window.scrollY / max))));
}
window.addEventListener('scroll', () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; updateScrollProgress(); });
}, { passive: true });
updateScrollProgress();

// ─────────────────────────────────────────────
//  POINTER GLOW (nebula follows cursor)
// ─────────────────────────────────────────────
let pointerRaf = 0;
window.addEventListener('pointermove', e => {
  if (pointerRaf) return;
  pointerRaf = requestAnimationFrame(() => {
    pointerRaf = 0;
    root.style.setProperty('--mx', `${Math.round((e.clientX / window.innerWidth)  * 1000) / 10}%`);
    root.style.setProperty('--my', `${Math.round((e.clientY / window.innerHeight) * 1000) / 10}%`);
  });
}, { passive: true });

// ─────────────────────────────────────────────
//  MAGNETIC EFFECT
// ─────────────────────────────────────────────
function attachMagnetic(el, strength = 12) {
  let raf = 0, lx = 0, ly = 0;
  const update = () => {
    raf = 0;
    const r = el.getBoundingClientRect();
    const rx = (lx - r.left) / Math.max(1, r.width);
    const ry = (ly - r.top)  / Math.max(1, r.height);
    el.style.setProperty('--mag-x', `${((rx - 0.5) * strength).toFixed(2)}px`);
    el.style.setProperty('--mag-y', `${((ry - 0.5) * strength).toFixed(2)}px`);
    el.style.setProperty('--rip-x', `${Math.round(rx * 100)}%`);
    el.style.setProperty('--rip-y', `${Math.round(ry * 100)}%`);
  };
  el.addEventListener('pointermove', e => { lx=e.clientX; ly=e.clientY; if(!raf) raf=requestAnimationFrame(update); }, { passive:true });
  el.addEventListener('pointerleave', () => { el.style.setProperty('--mag-x','0px'); el.style.setProperty('--mag-y','0px'); }, { passive:true });
}

// ─────────────────────────────────────────────
//  TILT EFFECT
// ─────────────────────────────────────────────
function attachTilt(el, maxDeg = 8) {
  let raf = 0, lx = 0, ly = 0;
  const update = () => {
    raf = 0;
    const r  = el.getBoundingClientRect();
    const dx = (lx - r.left) / Math.max(1, r.width)  - 0.5;
    const dy = (ly - r.top)  / Math.max(1, r.height) - 0.5;
    el.style.setProperty('--tilt-x', `${(-dy * maxDeg).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${( dx * maxDeg).toFixed(2)}deg`);
  };
  el.addEventListener('pointermove', e => { lx=e.clientX; ly=e.clientY; if(!raf) raf=requestAnimationFrame(update); }, { passive:true });
  el.addEventListener('pointerleave', () => { el.style.setProperty('--tilt-x','0deg'); el.style.setProperty('--tilt-y','0deg'); }, { passive:true });
}

// ─────────────────────────────────────────────
//  SCROLL REVEAL + ENHANCEMENT SYSTEM
// ─────────────────────────────────────────────
const enhancedMagnetic = new WeakSet();
const enhancedTilt     = new WeakSet();
const enhancedReveal   = new WeakSet();

const revealObserver = reducedMotion ? null : new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

function enhanceElement(el) {
  if (!(el instanceof HTMLElement)) return;
  if (!reducedMotion && el.hasAttribute('data-magnetic') && !enhancedMagnetic.has(el)) {
    enhancedMagnetic.add(el); attachMagnetic(el);
  }
  if (!reducedMotion && el.hasAttribute('data-tilt') && !enhancedTilt.has(el)) {
    enhancedTilt.add(el); attachTilt(el);
  }
  if (el.hasAttribute('data-reveal') && !enhancedReveal.has(el)) {
    enhancedReveal.add(el);
    if (reducedMotion) el.classList.add('is-in');
    else revealObserver?.observe(el);
  }
}

function enhanceTree(rootEl) {
  if (!(rootEl instanceof Element)) return;
  if (rootEl instanceof HTMLElement) enhanceElement(rootEl);
  rootEl.querySelectorAll('[data-magnetic],[data-tilt],[data-reveal]').forEach(enhanceElement);
}

enhanceTree(document.body);
new MutationObserver(mutations => {
  for (const m of mutations) for (const node of m.addedNodes) enhanceTree(node);
}).observe(document.body, { childList: true, subtree: true });

// ─────────────────────────────────────────────
//  REDUCED MOTION
// ─────────────────────────────────────────────
const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
reducedMotion = mql.matches;
mql.addEventListener('change', () => { reducedMotion = mql.matches; });

// ─────────────────────────────────────────────
//  CONSOLE
// ─────────────────────────────────────────────
console.log('%c ✦ inspecting the void? smart.', 'color:#8b5cf6;font-size:14px;font-weight:bold;background:#08081a;padding:6px 10px;');
console.log('%c try the konami code → ⬆ ⬆ ⬇ ⬇ ⬅ ➡ ⬅ ➡ B A', 'color:#22d3ee;font-size:11px;');
