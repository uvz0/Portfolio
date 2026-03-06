// ─────────────────────────────────────────────
//  CONFIG — Just assets fixings
// ─────────────────────────────────────────────
const ASSETS = {
  lofi: "assets/lofi.mp3",
  jumpscare: "assets/jumpscare.png",
  jumpAudio: "assets/jumpscare.mp3",
};

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const introSequence = [
  "Hmm, Tired? Scrolling Through Thousands of Portfolios?",
  "It's My Turn, I Guess...",
  "Don't Worry, You Won't Be Bored, I Will Play Music For You.",
  "Let's Begin, It's Not A Portfolio, It's An Experience.",
  "An Experience, Out Of The World :)",
];

const projects = [
  {
    title: "matha-lib",
    kind: "Python package",
    description:
      "One package, many bad decisions (productive ones). matha-lib bundles math utilities, plotting helpers, sorting implementations, ML bits, probability distributions, plus calculus and algebra tools. It\u2019s designed to be usable for real work and readable enough that future-me won\u2019t file a complaint.",
    tech: [
      "Python",
      "Math",
      "Plotting",
      "Sorting",
      "ML",
      "Calculus",
      "Algebra",
    ],
    link: "https://github.com/uvz0/matha-lib",
  },
  {
    title: "hyprcursor-sync-git",
    kind: "AUR project",
    description:
      "An AUR project for keeping cursor themes synced and sane\u2014especially in Hyprland setups. Because nothing says \u201cI have my life together\u201d like version-controlling your cursor. Lightweight, practical, and built for people who rebuild their desktop at 2AM for spiritual reasons.",
    tech: ["AUR", "Linux", "Hyprland", "Git"],
    link: "https://github.com/uvz0/hyprcursor-sync-git",
  },
  {
    title: "Tauri Authenticator",
    kind: "Desktop app (Linux/Windows/macOS)",
    description:
      "A cross-platform authenticator built with Tauri: small footprint, fast startup, and a UI that doesn\u2019t look like a warning dialog from 2009. The goal is daily-use smoothness\u2014clean flows, low friction, and desktop-native feel\u2014so security doesn\u2019t have to be a punishment.",
    tech: ["Tauri", "JavaScript", "Desktop", "UI/UX"],
    link: "https://github.com/uvz0/uvz-auther",
  },
];

const skillGroups = [
  { label: "Code", skills: ["JavaScript", "Python", "C++", "Tauri"] },
  { label: "Hardware", skills: ["ESP32"] },
  { label: "Web", skills: ["HTML", "CSS", "JavaScript"] },
  { label: "Design", skills: ["UI/UX design", "Figma", "Inkscape", "Canva"] },
];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let reducedMotion = false;
let musicAllowed = false;
let musicStatus = "off"; // 'off' | 'on' | 'muted'
let introStep = 0;
let typingDone = false;
let typingInterval = null;
let brandClicks = 0;
let konamiIndex = 0;
let konamiActive = false;

const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

// ─────────────────────────────────────────────
//  DOM REFS
// ─────────────────────────────────────────────
const mainEl = document.getElementById("main");
const lofiAudio = document.getElementById("lofi-audio");
const jumpscareAudio = document.getElementById("jumpscare-audio");
const jumpscareImg = document.getElementById("jumpscare-img");
const headphonesOvl = document.getElementById("headphones-overlay");
const introOvl = document.getElementById("intro-overlay");
const jumpscareOvl = document.getElementById("jumpscare-overlay");
const musicBtn = document.getElementById("music-btn");
const musicLabel = document.getElementById("music-label");
const brandBtn = document.getElementById("brand-btn");
const introText = document.getElementById("intro-text");
const introCursor = document.getElementById("intro-cursor");
const introNextBtn = document.getElementById("intro-next-btn");
const introMusicBtn = document.getElementById("intro-music-btn");
const thanksToast = document.getElementById("thanks-toast");
const projectsGrid = document.getElementById("projects-grid");
const skillsGrid = document.getElementById("skills-grid");
const glowEl = document.getElementById("glow-rehan");

// ─────────────────────────────────────────────
//  ASSET INIT
// ─────────────────────────────────────────────
lofiAudio.src = ASSETS.lofi;
jumpscareAudio.src = ASSETS.jumpAudio;
jumpscareImg.src = ASSETS.jumpscare;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
window.scrollToId = scrollToId; // expose for inline onclick in HTML

// ─────────────────────────────────────────────
//  RENDER PROJECTS
// ─────────────────────────────────────────────
projects.forEach((p, i) => {
  const article = document.createElement("article");
  article.className = "card project span-6";
  article.setAttribute("data-tilt", "");
  article.setAttribute("data-reveal", "pop");
  article.style.cssText = `--d:${180 + i * 90}ms`;

  const chips = p.tech
    .map(
      (t) =>
        `<span class="chip" data-reveal="fade" style="--d:${220 + i * 80}ms">${t}</span>`,
    )
    .join("");

  article.innerHTML = `
    <div class="project-head">
      <div>
        <div class="kicker">${p.kind}</div>
        <h3 class="h3"><span class="project-title">${p.title}</span></h3>
      </div>
      <a class="btn" data-magnetic href="${p.link}" target="_blank" rel="noreferrer">peek</a>
    </div>
    <p class="project-desc">${p.description}</p>
    <div class="chipset">${chips}</div>
  `;
  projectsGrid.appendChild(article);
});

// ─────────────────────────────────────────────
//  RENDER SKILLS
// ─────────────────────────────────────────────
skillGroups.forEach((g, i) => {
  const div = document.createElement("div");
  div.className = "card";
  div.setAttribute("data-tilt", "");
  div.setAttribute("data-reveal", "pop");
  div.style.cssText = `--d:${140 + i * 90}ms`;

  const chips = g.skills
    .map(
      (s) =>
        `<span class="chip accent" data-reveal="fade" style="--d:${200 + i * 90}ms">${s}</span>`,
    )
    .join("");

  div.innerHTML = `
    <div class="kicker" data-reveal="fade" style="--d:${170 + i * 90}ms">${g.label}</div>
    <div class="chipset">${chips}</div>
  `;
  skillsGrid.appendChild(div);
});

// ─────────────────────────────────────────────
//  PARTICLES
// ─────────────────────────────────────────────
const particlesEl = document.getElementById("particles");
for (let i = 0; i < 15; i++) {
  const p = document.createElement("div");
  p.className = "particle";
  p.style.cssText = `--i:${i}; --delay:${i * 1.2}s`;
  particlesEl.appendChild(p);
}

// ─────────────────────────────────────────────
//  MUSIC
// ─────────────────────────────────────────────
async function ensureAudio() {
  if (!musicAllowed) return;
  try {
    lofiAudio.volume = 0.3;
    await lofiAudio.play();
    musicStatus = "on";
    updateMusicBtn();
  } catch {
    /* autoplay blocked */
  }
}

function toggleMusic() {
  if (!musicAllowed) return;
  if (musicStatus === "muted" || lofiAudio.paused) {
    lofiAudio.play();
    musicStatus = "on";
  } else {
    lofiAudio.pause();
    musicStatus = "muted";
  }
  updateMusicBtn();
}

function updateMusicBtn() {
  musicLabel.textContent = musicStatus === "on" ? "music: on" : "music: off";
  if (introOvl && !introOvl.classList.contains("hidden")) {
    introMusicBtn.textContent = musicStatus === "on" ? "mute" : "unmute";
  }
}

// ─────────────────────────────────────────────
//  HEADPHONES OVERLAY
// ─────────────────────────────────────────────
function continueFromHeadphones(allowMusic) {
  musicAllowed = allowMusic;
  hide(headphonesOvl);
  if (allowMusic) {
    show(musicBtn);
    show(introMusicBtn);
  }
  openIntro();
}

document
  .getElementById("hp-yes")
  .addEventListener("click", () => continueFromHeadphones(true));
document
  .getElementById("hp-no")
  .addEventListener("click", () => continueFromHeadphones(false));

// ─────────────────────────────────────────────
//  INTRO SEQUENCE
// ─────────────────────────────────────────────
function openIntro() {
  introStep = 0;
  show(introOvl);
  introOvl.focus();
  startTyping();
}

function startTyping() {
  clearInterval(typingInterval);
  typingDone = false;
  introText.textContent = "";
  introCursor.textContent = "▌";
  introNextBtn.textContent = "skip typing";

  const full = introSequence[introStep] ?? "";
  if (reducedMotion) {
    introText.textContent = full;
    typingDone = true;
    introCursor.textContent = "";
    introNextBtn.textContent =
      introStep === introSequence.length - 1 ? "enter" : "next";
    return;
  }

  let i = 0;
  typingInterval = setInterval(() => {
    i = Math.min(full.length, i + 1);
    introText.textContent = full.slice(0, i);
    if (i >= full.length) {
      clearInterval(typingInterval);
      typingDone = true;
      introCursor.textContent = "";
      introNextBtn.textContent =
        introStep === introSequence.length - 1 ? "enter" : "next";
    }
  }, 18);
}

function nextIntro() {
  if (!typingDone) {
    clearInterval(typingInterval);
    introText.textContent = introSequence[introStep] ?? "";
    typingDone = true;
    introCursor.textContent = "";
    introNextBtn.textContent =
      introStep === introSequence.length - 1 ? "enter" : "next";
    return;
  }

  if (introStep < introSequence.length - 1) {
    introStep++;
    if (introStep === 2) ensureAudio();
    startTyping();
    return;
  }

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

introOvl.addEventListener("click", nextIntro);
introNextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  nextIntro();
});
introMusicBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMusic();
});
musicBtn.addEventListener("click", toggleMusic);

// ─────────────────────────────────────────────
//  HIRE BUTTONS
// ─────────────────────────────────────────────
document.getElementById("yes-btn").addEventListener("click", () => {
  show(thanksToast);
  setTimeout(() => hide(thanksToast), reducedMotion ? 900 : 1600);
});
document.getElementById('no-btn').addEventListener('click', () => {
  // go fullscreen first
  const el = document.documentElement;
  const requestFS = el.requestFullscreen?.() 
    || el.webkitRequestFullscreen?.() 
    || el.mozRequestFullScreen?.();

  show(jumpscareOvl);
  jumpscareAudio.currentTime = 0;
  const playPromise = jumpscareAudio.play();
  if (playPromise) playPromise.catch(() => {});

  let dismissed = false;
  const dismissJumpscare = () => {
    if (dismissed) return;
    dismissed = true;
    hide(jumpscareOvl);
    jumpscareAudio.pause();
    jumpscareAudio.currentTime = 0;
    // exit fullscreen
    const exitFS = document.exitFullscreen?.() 
      || document.webkitExitFullscreen?.() 
      || document.mozCancelFullScreen?.();
  };

  jumpscareAudio.addEventListener('ended', dismissJumpscare, { once: true });
  setTimeout(dismissJumpscare, reducedMotion ? 650 : 1300);
});
// ─────────────────────────────────────────────
//  BRAND EASTER EGG
// ─────────────────────────────────────────────
// ── KONAMI HINT — pulse on load + every 15s
const konamiHint = document.querySelector(".secret-hint");
if (konamiHint) {
  const pulse = () => {
    konamiHint.classList.remove("hint-pulse");
    void konamiHint.offsetWidth; // reflow to restart animation
    konamiHint.classList.add("hint-pulse");
  };
  setTimeout(pulse, 2500); // first pulse shortly after load
  setInterval(pulse, 15000); // repeat every 15s
}

brandBtn.addEventListener("click", () => {
  brandClicks++;
  brandBtn.textContent =
    brandClicks >= 5 ? "system compromised" : "student dev";
});

// ─────────────────────────────────────────────
//  KEYBOARD
// ─────────────────────────────────────────────
window.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Escape") {
      hide(jumpscareOvl);
      hide(introOvl);
      hide(headphonesOvl);
    }
    if (e.key === " " && !introOvl.classList.contains("hidden")) {
      e.preventDefault();
      nextIntro();
    }

    // Konami code
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiActive = !konamiActive;
        mainEl.classList.toggle("inverted", konamiActive);
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  },
  { passive: false },
);

// ─────────────────────────────────────────────
//  SCROLL PROGRESS
// ─────────────────────────────────────────────
const root = document.documentElement;
let scrollRaf = 0;

function updateScrollProgress() {
  const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
  root.style.setProperty(
    "--scroll",
    String(Math.min(1, Math.max(0, window.scrollY / max))),
  );
}
window.addEventListener(
  "scroll",
  () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      updateScrollProgress();
    });
  },
  { passive: true },
);
updateScrollProgress();

// ─────────────────────────────────────────────
//  POINTER GLOW
// ─────────────────────────────────────────────
let pointerRaf = 0;
window.addEventListener(
  "pointermove",
  (e) => {
    if (pointerRaf) return;
    pointerRaf = requestAnimationFrame(() => {
      pointerRaf = 0;
      root.style.setProperty(
        "--mx",
        `${Math.round((e.clientX / window.innerWidth) * 1000) / 10}%`,
      );
      root.style.setProperty(
        "--my",
        `${Math.round((e.clientY / window.innerHeight) * 1000) / 10}%`,
      );
    });
  },
  { passive: true },
);

// ─────────────────────────────────────────────
//  MAGNETIC EFFECT
// ─────────────────────────────────────────────
function attachMagnetic(el, strength = 12) {
  let raf = 0,
    lx = 0,
    ly = 0;
  const update = () => {
    raf = 0;
    const r = el.getBoundingClientRect();
    const rx = (lx - r.left) / Math.max(1, r.width);
    const ry = (ly - r.top) / Math.max(1, r.height);
    el.style.setProperty("--mag-x", `${((rx - 0.5) * strength).toFixed(2)}px`);
    el.style.setProperty("--mag-y", `${((ry - 0.5) * strength).toFixed(2)}px`);
    el.style.setProperty("--rip-x", `${Math.round(rx * 100)}%`);
    el.style.setProperty("--rip-y", `${Math.round(ry * 100)}%`);
  };
  el.addEventListener(
    "pointermove",
    (e) => {
      lx = e.clientX;
      ly = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  el.addEventListener(
    "pointerleave",
    () => {
      el.style.setProperty("--mag-x", "0px");
      el.style.setProperty("--mag-y", "0px");
    },
    { passive: true },
  );
}

// ─────────────────────────────────────────────
// GLOW EFFECT (MOVE TOP)
// ─────────────────────────────────────────────

if (glowEl) {
  const letters = glowEl.textContent.split("");
  glowEl.textContent = "";
  glowEl.style.display = "inline-flex";
  letters.forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "glow-letter";
    span.setAttribute("data-char", char);
    span.style.setProperty("--li", i);

    // ghost — static, sits behind everything
    const ghost = document.createElement("span");
    ghost.className = "glow-ghost";
    ghost.textContent = char;
    ghost.setAttribute("aria-hidden", "true");

    span.textContent = char; // the real text node (for layout sizing)
    span.appendChild(ghost);
    glowEl.appendChild(span);
  });
}
// ─────────────────────────────────────────────
//  TILT EFFECT
// ─────────────────────────────────────────────
function attachTilt(el, maxDeg = 8) {
  let raf = 0,
    lx = 0,
    ly = 0;
  const update = () => {
    raf = 0;
    const r = el.getBoundingClientRect();
    const dx = (lx - r.left) / Math.max(1, r.width) - 0.5;
    const dy = (ly - r.top) / Math.max(1, r.height) - 0.5;
    el.style.setProperty("--tilt-x", `${(-dy * maxDeg).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(dx * maxDeg).toFixed(2)}deg`);
  };
  el.addEventListener(
    "pointermove",
    (e) => {
      lx = e.clientX;
      ly = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  el.addEventListener(
    "pointerleave",
    () => {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    },
    { passive: true },
  );
}

// ─────────────────────────────────────────────
//  SCROLL REVEAL + ENHANCEMENT SYSTEM
// ─────────────────────────────────────────────
const enhancedMagnetic = new WeakSet();
const enhancedTilt = new WeakSet();
const enhancedReveal = new WeakSet();

const revealObserver = reducedMotion
  ? null
  : new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

function enhanceElement(el) {
  if (!(el instanceof HTMLElement)) return;
  if (
    !reducedMotion &&
    el.hasAttribute("data-magnetic") &&
    !enhancedMagnetic.has(el)
  ) {
    enhancedMagnetic.add(el);
    attachMagnetic(el);
  }
  if (!reducedMotion && el.hasAttribute("data-tilt") && !enhancedTilt.has(el)) {
    enhancedTilt.add(el);
    attachTilt(el);
  }
  if (el.hasAttribute("data-reveal") && !enhancedReveal.has(el)) {
    enhancedReveal.add(el);
    if (reducedMotion) el.classList.add("is-in");
    else revealObserver?.observe(el);
  }
}

function enhanceTree(rootEl) {
  if (!(rootEl instanceof Element)) return;
  if (rootEl instanceof HTMLElement) enhanceElement(rootEl);
  rootEl
    .querySelectorAll("[data-magnetic],[data-tilt],[data-reveal]")
    .forEach(enhanceElement);
}

enhanceTree(document.body);

// Watch for new DOM nodes (e.g. overlays being shown)
new MutationObserver((mutations) => {
  for (const m of mutations) for (const node of m.addedNodes) enhanceTree(node);
}).observe(document.body, { childList: true, subtree: true });

// ─────────────────────────────────────────────
//  REDUCED MOTION
// ─────────────────────────────────────────────
const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
reducedMotion = mql.matches;
mql.addEventListener("change", () => {
  reducedMotion = mql.matches;
});

// ─────────────────────────────────────────────
//  CONSOLE EASTER EGGS
// ─────────────────────────────────────────────
console.log(
  "%c ah, inspecting the console? I respect the paranoia.",
  "color:#39FF14;font-size:14px;font-weight:bold;background:#0D0D0D;padding:4px;",
);
console.log(
  "%c pst... try the konami code. (up up down down left right left right b a)",
  "color:#F2F2F2;font-size:11px;",
);
