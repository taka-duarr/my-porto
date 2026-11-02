/* ═══════════════════════════════════════════════════════════
   UBUNTU DESKTOP PORTFOLIO — script.js
   Window Manager + Desktop Logic
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── Component Loader ────────────────────────────────────
async function loadComponents() {
  const components = ['about', 'projects', 'skills', 'terminal', 'contact', 'files', 'library', 'game', 'flappy', 'shooter', 'chatbot'];
  for (const comp of components) {
    try {
      const res = await fetch(`windows/${comp}.html`);
      if (res.ok) {
        const html = await res.text();
        const container = document.getElementById(`comp-${comp}`);
        if (container) container.outerHTML = html;
      } else {
        console.error(`Failed to load ${comp}: ${res.status}`);
      }
    } catch (e) {
      console.error(`Error loading ${comp}:`, e);
    }
  }
}


// ─── State ───────────────────────────────────────────────
const state = {
  openWindows: new Set(),
  minimizedWindows: new Set(),
  zTop: 100,
  dragging: null,
  resizing: null,
  wallpapers: [
    'url("img/wallpaper.png") center/cover no-repeat, linear-gradient(135deg, #300a24 0%, #1a0a1a 50%, #0f0f1e 100%)',
    'linear-gradient(135deg, #300a24 0%, #1a0a1a 50%, #0f0f1e 100%)',
    'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    'linear-gradient(160deg, #0d0d17, #1a0a1a, #300a24)',
  ],
  wallpaperIdx: 0,
  bootComplete: false,
};

// ─── Boot Sequence ────────────────────────────────────────
const bootMessages = [
  'Starting systemd...',
  'Starting Network Manager...',
  'Starting GNOME Display Manager...',
  'Loading Ubuntu 22.04.3 LTS...',
  'Starting desktop environment...',
  'Welcome!',
];

function startBoot() {
  const fill = document.getElementById('boot-fill');
  const status = document.getElementById('boot-status');
  let i = 0;
  const interval = setInterval(() => {
    const pct = Math.min(((i + 1) / bootMessages.length) * 100, 100);
    if (fill) fill.style.width = pct + '%';
    if (status) status.textContent = bootMessages[i] || '';
    i++;
    if (i >= bootMessages.length) {
      clearInterval(interval);
      setTimeout(showLockScreen, 600);
    }
  }, 400);
}

function showLockScreen() {
  const boot = document.getElementById('boot-screen');
  const lock = document.getElementById('lock-screen');
  const reveal = () => {
    if (boot) boot.style.display = 'none';
    if (lock) {
      lock.style.display = 'flex';
      updateLockClock();
      playClassAnimation(lock, 'lock-entering');
    }
  };
  if (boot && boot.style.display !== 'none') {
    playClassAnimation(boot, 'boot-leaving', reveal);
  } else {
    reveal();
  }
}

function showDesktop({ keepLock = false } = {}) {
  const lock = document.getElementById('lock-screen');
  const desktop = document.getElementById('desktop');
  if (lock && !keepLock) lock.style.display = 'none';
  if (desktop) {
    desktop.style.display = 'flex';
    playClassAnimation(desktop, 'desktop-entering');
    // Mobile home screen: app icons pop in like iOS after unlock
    if (isMobileLayout()) {
      staggerIn(desktop.querySelectorAll('.dicon'), { y: 30, scale: 0.5, step: 25, max: 16, duration: 560, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
    }
  }
  state.bootComplete = true;
  updatePanelClock();
  if (!state.clockInterval) {
    state.clockInterval = setInterval(updatePanelClock, 1000);
  }
  // Run neofetch in terminal on first open
  setTimeout(() => runNeofetch(), 100);
}

// ─── Lock Screen ─────────────────────────────────────────
function updateLockClock() {
  const t = document.getElementById('lock-time');
  const d = document.getElementById('lock-date');
  const iosEl = document.getElementById('ios-status-time');
  if (!t) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  t.textContent = `${h}:${m}`;
  if (iosEl) iosEl.textContent = `${h}:${m}`;
  const ccTime = document.getElementById('cc-status-time');
  if (ccTime) ccTime.textContent = `${h}:${m}`;
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  d.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  setTimeout(updateLockClock, 5000);
}

let unlocking = false;
function tryUnlock() {
  if (unlocking) return;
  const lock = document.getElementById('lock-screen');
  const btn = document.getElementById('lock-pass-btn');
  // Any password (or empty) unlocks — it's a portfolio, not real security!
  try {
    sessionStorage.setItem('ubuntu_unlocked', 'true');
  } catch (e) {}

  if (!lock || lock.style.display === 'none' || prefersReducedMotion()) {
    showDesktop();
    return;
  }

  unlocking = true;
  // Desktop: short "verifying" spinner like macOS login. Mobile swipe unlocks instantly.
  const verifyDelay = isMobileLayout() ? 0 : 650;
  if (verifyDelay) {
    btn?.classList.add('is-verifying');
    lock.querySelector('.lock-pass-wrap')?.classList.add('is-verifying');
  }
  setTimeout(() => {
    showDesktop({ keepLock: true });
    playClassAnimation(lock, 'lock-unlocking', () => {
      lock.style.display = 'none';
      btn?.classList.remove('is-verifying');
      lock.querySelector('.lock-pass-wrap')?.classList.remove('is-verifying');
      const input = document.getElementById('lock-pass');
      if (input) input.value = '';
      unlocking = false;
    });
  }, verifyDelay);
}
window.tryUnlock = tryUnlock;

// ─── Panel Clock ──────────────────────────────────────────
function updatePanelClock() {
  const el = document.getElementById('panel-clock');
  const iosEl = document.getElementById('ios-status-time');
  const ccTime = document.getElementById('cc-status-time');
  if (!el && !iosEl && !ccTime) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  if (el) el.textContent = `${h}:${m}`;
  if (iosEl) iosEl.textContent = `${h}:${m}`;
  if (ccTime) ccTime.textContent = `${h}:${m}`;
}

// ─── Window Management ────────────────────────────────────
function getWindow(appName) {
  return document.getElementById(`win-${appName}`);
}

// ─── macOS-style Motion ───────────────────────────────────
// Desktop only: mobile keeps its own iOS sheet animations from style.css.
function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
function isMobileLayout() {
  return window.innerWidth <= 768;
}
function canAnimateWindows() {
  return !prefersReducedMotion() && !isMobileLayout() && typeof Element.prototype.animate === 'function';
}

// The dock icon a window zooms out of / gets sucked into.
// Apps without their own dock icon use the "All Apps" button.
function getDockAnchor(appName) {
  const icon = document.querySelector(`.dock-item[data-app="${appName}"] .dock-icon`)
    || document.querySelector('#show-apps-btn .dock-icon');
  if (!icon) return null;
  const r = icon.getBoundingClientRect();
  if (!r.width) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width };
}

function stopWindowAnimation(win) {
  if (win._anim) {
    win._anim.cancel();
    win._anim = null;
  }
}

// Origin of the scale transform = dock icon position, in the window's own coordinates.
function dockOrigin(win, appName) {
  const anchor = getDockAnchor(appName);
  const r = win.getBoundingClientRect();
  if (!anchor || !r.width) return { origin: '50% 50%', scale: 0.9, r, oy: 50 };
  return {
    origin: `${anchor.x - r.left}px ${anchor.y - r.top}px`,
    scale: Math.max(anchor.size / r.width, 0.04),
    r,
    oy: ((anchor.y - r.top) / r.height) * 100,
  };
}

// Where the user clicked to launch an app (dock icon, app grid icon, menu item…).
// Captured on pointerdown so the balloon can inflate from that exact spot.
function initLaunchOriginTracking() {
  document.addEventListener('pointerdown', e => {
    const src = e.target.closest('.dock-item[data-app], .dicon[data-app], [onclick*="openApp"]');
    if (!src) return;
    const icon = src.querySelector('.dock-icon, .dicon-img') || src;
    const r = icon.getBoundingClientRect();
    state.launchOrigin = {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      size: Math.min(r.width, r.height) || 40,
      time: performance.now(),
    };
  }, true);
}

function getLaunchOrigin(appName) {
  const o = state.launchOrigin;
  if (o && performance.now() - o.time < 1500) {
    state.launchOrigin = null;
    return o;
  }
  return getDockAnchor(appName);
}

// Translate + start scale that put the window's center on the origin point.
function balloonGeometry(win, origin) {
  const r = win.getBoundingClientRect();
  if (!origin || !r.width) return { dx: 0, dy: 60, s: 0.1 };
  return {
    dx: origin.x - (r.left + r.width / 2),
    dy: origin.y - (r.top + r.height / 2),
    s: Math.max(origin.size / Math.max(r.width, r.height), 0.03),
  };
}

const t3 = (x, y, sx, sy = sx) => `translate(${x}px, ${y}px) scale(${sx}, ${sy})`;

function playBalloon(win, frames, opts, done) {
  win.classList.add('win-balloon');
  win._anim = win.animate(frames, { fill: 'both', ...opts });
  win._anim.onfinish = () => {
    done?.();
    win.classList.remove('win-balloon');
    stopWindowAnimation(win);
  };
  win._anim.oncancel = () => win.classList.remove('win-balloon');
}

// Open: a small balloon floats up from where it was clicked, inflates,
// overshoots, wobbles, and settles into the window.
function animateWindowOpen(win, appName) {
  stopWindowAnimation(win);
  if (!canAnimateWindows()) return;
  win._origin = getLaunchOrigin(appName);
  const { dx, dy, s } = balloonGeometry(win, win._origin);
  const out = 'cubic-bezier(0.25, 0.8, 0.4, 1)';
  playBalloon(win, [
    { transformOrigin: '50% 50%', transform: t3(dx, dy, s), borderRadius: '50%', opacity: 0, easing: out },
    { transformOrigin: '50% 50%', transform: t3(dx * 0.9, dy * 0.9, s * 2.4, s * 2.6), borderRadius: '50%', opacity: 1, offset: 0.12, easing: out },
    { transformOrigin: '50% 50%', transform: t3(dx * 0.12, dy * 0.12, 0.74, 0.66), borderRadius: '46%', offset: 0.42, easing: out },
    { transformOrigin: '50% 50%', transform: t3(0, 0, 1.06, 0.95), borderRadius: '30px', offset: 0.62, easing: 'ease-in-out' },
    { transformOrigin: '50% 50%', transform: t3(0, 0, 0.97, 1.03), borderRadius: '18px', offset: 0.77, easing: 'ease-in-out' },
    { transformOrigin: '50% 50%', transform: t3(0, 0, 1.012, 0.994), borderRadius: '13px', offset: 0.9, easing: 'ease-in-out' },
    { transformOrigin: '50% 50%', transform: t3(0, 0, 1), borderRadius: '12px', opacity: 1 },
  ], { duration: 760 });
}

// Close: the window puffs up for a moment, then deflates back into its spot.
function animateWindowClose(win, done, appName) {
  stopWindowAnimation(win);
  if (!canAnimateWindows()) { done(); return; }
  const target = getDockAnchor(appName) || win._origin;
  const { dx, dy, s } = balloonGeometry(win, target);
  playBalloon(win, [
    { transformOrigin: '50% 50%', transform: t3(0, 0, 1), borderRadius: '12px', opacity: 1, easing: 'ease-out' },
    { transformOrigin: '50% 50%', transform: t3(0, 0, 1.045, 1.035), borderRadius: '24px', offset: 0.2, easing: 'ease-in' },
    { transformOrigin: '50% 50%', transform: t3(dx * 0.18, dy * 0.18, 0.62, 0.68), borderRadius: '50%', offset: 0.48, easing: 'ease-in' },
    { transformOrigin: '50% 50%', transform: t3(dx * 0.75, dy * 0.75, s * 3, s * 2.6), borderRadius: '50%', opacity: 0.9, offset: 0.8, easing: 'ease-in' },
    { transformOrigin: '50% 50%', transform: t3(dx, dy, s), borderRadius: '50%', opacity: 0 },
  ], { duration: 560 }, done);
}

// ─── Tidy window placement ────────────────────────────────
// Fresh windows open centered in the free desktop area (cascading when others
// are open) and shrink to fit small screens. Once the user drags a window,
// it keeps that spot.
function placeWindow(win, appName) {
  if (isMobileLayout() || win.classList.contains('win-maximized') || win.dataset.userPlaced) return;
  const layer = win.parentElement;
  if (!layer) return;
  const lw = layer.clientWidth, lh = layer.clientHeight;
  if (!lw || !lh) return;

  if (!win.dataset.baseW) {
    win.dataset.baseW = parseInt(win.style.width) || win.offsetWidth;
    win.dataset.baseH = parseInt(win.style.height) || win.offsetHeight;
  }
  const M = 20;
  const w = Math.min(+win.dataset.baseW, lw - M * 2);
  const h = Math.min(+win.dataset.baseH, lh - M * 2);

  const others = [...state.openWindows].filter(a => {
    const o = getWindow(a);
    return a !== appName && o && o.style.display !== 'none' && !state.minimizedWindows.has(a);
  }).length;
  const step = 30 * (others % 5);

  const left = Math.max(M, Math.min((lw - w) / 2 + step, lw - w - M));
  const top = Math.max(M, Math.min((lh - h) * 0.42 + step, lh - h - M));
  Object.assign(win.style, { width: `${w}px`, height: `${h}px`, left: `${left}px`, top: `${top}px` });
}

// Keep open windows on screen when the browser is resized.
function keepWindowsInView() {
  if (isMobileLayout()) return;
  state.openWindows.forEach(app => {
    const win = getWindow(app);
    if (!win || win.classList.contains('win-maximized')) return;
    if (!win.dataset.userPlaced) { placeWindow(win, app); return; }
    const layer = win.parentElement;
    const maxL = Math.max(0, layer.clientWidth - 120);
    const maxT = Math.max(0, layer.clientHeight - 60);
    win.style.left = `${Math.min(parseInt(win.style.left) || 0, maxL)}px`;
    win.style.top = `${Math.min(parseInt(win.style.top) || 0, maxT)}px`;
  });
}

// ─── Focus & panel title ──────────────────────────────────
function setPanelAppName(text) {
  const el = document.getElementById('panel-app-name');
  if (!el || el.textContent === text) return;
  el.textContent = text;
  if (!prefersReducedMotion() && el.animate) {
    el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
      { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
  }
}

function setFocusedWindow(win) {
  const prev = state.focusedWin;
  if (prev === win) return;
  prev?.classList.remove('win-focused');
  state.focusedWin = win || null;
  if (!win) { setPanelAppName(''); return; }
  win.classList.add('win-focused');
  setPanelAppName(win.querySelector('.win-title')?.textContent?.trim() || '');
  // Small "pop" when switching between windows that are already open
  if (prev && !win._anim && canAnimateWindows()) {
    win._anim = win.animate([
      { transform: 'scale(0.985)' }, { transform: 'scale(1.004)', offset: 0.6 }, { transform: 'scale(1)' },
    ], { duration: 240, easing: 'ease-out' });
    win._anim.onfinish = () => { win._anim = null; };
  }
}

// After a close/minimize, hand focus to the top-most remaining window.
function focusTopWindow() {
  let top = null, maxZ = -1;
  state.openWindows.forEach(app => {
    const w = getWindow(app);
    if (!w || state.minimizedWindows.has(app) || w.style.display === 'none') return;
    const z = parseInt(w.style.zIndex) || 0;
    if (z > maxZ) { maxZ = z; top = w; }
  });
  setFocusedWindow(top);
}

// ─── Tab switching ────────────────────────────────────────
// Content enters with a soft staggered rise.
function staggerIn(els, { y = 12, scale = 0.97, step = 35, max = 12, duration = 420, easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)' } = {}) {
  if (prefersReducedMotion() || typeof Element.prototype.animate !== 'function') return;
  [...els].forEach((el, i) => {
    el.animate([
      { opacity: 0, transform: `translateY(${y}px) scale(${scale})` },
      { opacity: 1, transform: 'none' },
    ], { duration, delay: Math.min(i, max) * step, easing, fill: 'backwards' });
  });
}

// A pill slides behind the active sidebar item in every window.
function initSidebarPills() {
  document.querySelectorAll('.sidebar-nav').forEach(nav => {
    if (nav._updatePill) return;
    const pill = document.createElement('div');
    pill.className = 'sidebar-pill';
    nav.prepend(pill);
    nav.classList.add('has-pill');

    const update = (instant = false) => {
      const act = nav.querySelector('.sidebar-item.active');
      if (!act || !act.offsetHeight) { pill.style.opacity = '0'; return; }
      if (instant || pill.style.opacity !== '1') pill.classList.add('no-anim');
      pill.style.opacity = '1';
      pill.style.transform = `translate(${act.offsetLeft}px, ${act.offsetTop}px)`;
      pill.style.width = `${act.offsetWidth}px`;
      pill.style.height = `${act.offsetHeight}px`;
      if (pill.classList.contains('no-anim')) {
        void pill.offsetWidth;
        requestAnimationFrame(() => pill.classList.remove('no-anim'));
      }
    };
    new MutationObserver(() => update()).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
    nav._updatePill = update;
  });
}

function refreshSidebarPills(win) {
  win?.querySelectorAll('.sidebar-nav').forEach(nav => nav._updatePill?.(true));
}

// ─── Menus ────────────────────────────────────────────────
function openMenu(menu) {
  if (!menu) return;
  menu.classList.remove('menu-closing');
  menu.style.display = 'block';
  staggerIn(menu.querySelectorAll('.power-menu-item, .ctx-item, .power-user-info'), { y: -6, scale: 1, step: 28, duration: 300 });
}

function closeMenu(menu) {
  if (!menu || menu.style.display === 'none' || menu.classList.contains('menu-closing')) return;
  if (prefersReducedMotion()) { menu.style.display = 'none'; return; }
  menu.classList.add('menu-closing');
  setTimeout(() => {
    if (!menu.classList.contains('menu-closing')) return; // reopened meanwhile
    menu.style.display = 'none';
    menu.classList.remove('menu-closing');
  }, 160);
}

// Context menu: placed at the cursor, flipped so it never leaves the screen.
function openContextMenuAt(x, y) {
  const ctx = document.getElementById('context-menu');
  if (!ctx) return;
  openMenu(ctx);
  const M = 8;
  const w = ctx.offsetWidth, h = ctx.offsetHeight;
  const flipX = x + w + M > window.innerWidth;
  const flipY = y + h + M > window.innerHeight;
  const left = flipX ? Math.max(M, x - w) : x;
  const top = flipY ? Math.max(M, y - h) : y;
  ctx.style.left = `${left}px`;
  ctx.style.top = `${top}px`;
  ctx.style.transformOrigin = `${flipX ? 'right' : 'left'} ${flipY ? 'bottom' : 'top'}`;
}

// Genie effect: the window pinches toward the dock (on the left) and gets sucked in.
function genieKeyframes(win, appName) {
  const { origin, scale, oy } = dockOrigin(win, appName);
  const cy = Math.min(Math.max(oy, 12), 88);
  const full = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  const pinched = `polygon(0% ${cy - 10}%, 100% 0%, 100% 100%, 0% ${cy + 10}%)`;
  const funnel = `polygon(0% ${cy - 4}%, 100% ${cy - 30}%, 100% ${cy + 30}%, 0% ${cy + 4}%)`;
  return [
    { transformOrigin: origin, transform: 'scale(1, 1)', clipPath: full, opacity: 1 },
    { transformOrigin: origin, transform: 'scale(0.82, 0.96)', clipPath: pinched, opacity: 1, offset: 0.35 },
    { transformOrigin: origin, transform: `scale(${scale * 2}, ${scale * 3})`, clipPath: funnel, opacity: 0.85, offset: 0.8 },
    { transformOrigin: origin, transform: `scale(${scale})`, clipPath: funnel, opacity: 0 },
  ];
}

function animateWindowMinimize(win, appName, done) {
  stopWindowAnimation(win);
  win._anim = win.animate(genieKeyframes(win, appName), {
    duration: 520, easing: 'cubic-bezier(0.55, 0, 0.6, 1)', fill: 'forwards',
  });
  win._anim.onfinish = () => {
    done();
    stopWindowAnimation(win);
  };
}

function animateWindowRestore(win, appName) {
  stopWindowAnimation(win);
  if (!canAnimateWindows()) return;
  win._anim = win.animate(genieKeyframes(win, appName), {
    duration: 480, easing: 'cubic-bezier(0.25, 0, 0.3, 1)', direction: 'reverse',
  });
  win._anim.onfinish = () => { win._anim = null; };
}

// Dock icon bounce while an app launches.
function bounceDockIcon(appName) {
  if (prefersReducedMotion() || isMobileLayout()) return;
  const icon = document.querySelector(`.dock-item[data-app="${appName}"] .dock-icon`);
  if (!icon) return;
  icon.classList.remove('dock-bounce');
  void icon.offsetWidth; // restart the animation
  icon.classList.add('dock-bounce');
  icon.addEventListener('animationend', () => icon.classList.remove('dock-bounce'), { once: true });
}

// Dock magnification that follows the cursor (vertical dock).
function initDockMagnify() {
  const dock = document.getElementById('dock');
  if (!dock || !window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
  const items = [...dock.querySelectorAll('.dock-item')];
  const MAX = 0.45;      // extra scale at the cursor
  const RANGE = 120;     // px of influence
  let frame = null;
  let mouseY = null;

  const apply = () => {
    frame = null;
    const off = mouseY === null || isMobileLayout() || prefersReducedMotion();
    items.forEach(item => {
      const icon = item.querySelector('.dock-icon');
      if (!icon) return;
      if (off) {
        icon.style.transform = '';
        item.style.marginBlock = '';
        return;
      }
      const r = item.getBoundingClientRect();
      const dist = Math.abs(mouseY - (r.top + r.height / 2));
      const t = Math.max(0, 1 - dist / RANGE);
      const s = 1 + MAX * (1 - Math.cos(t * Math.PI)) / 2;
      const grow = icon.offsetHeight * (s - 1);
      icon.style.transform = `translateX(${grow * 0.45}px) scale(${s})`;
      item.style.marginBlock = `${grow / 2}px`;
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(apply); };

  dock.addEventListener('mousemove', e => { mouseY = e.clientY; schedule(); });
  dock.addEventListener('mouseleave', () => { mouseY = null; schedule(); });
  dock.classList.add('dock-magnify');
}

// ─── Screen transitions (boot → lock → desktop) ───────────
function playClassAnimation(el, cls, done) {
  if (!el) { done?.(); return; }
  if (prefersReducedMotion()) { done?.(); return; }
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  let finished = false;
  const onEnd = e => { if (e.target === el) finish(); };
  const finish = () => {
    if (finished) return;
    finished = true;
    el.removeEventListener('animationend', onEnd);
    done?.(); // run before removing the class so "forwards" end states don't flash back
    el.classList.remove(cls);
  };
  el.addEventListener('animationend', onEnd);
  setTimeout(finish, 1500); // safety net if animationend never fires
}

function openApp(appName) {
  const win = getWindow(appName);
  if (!win) return;

  if (state.minimizedWindows.has(appName)) {
    state.minimizedWindows.delete(appName);
    win.style.display = 'flex';
    win.classList.remove('win-minimizing');
    bringToFront(win);
    updateDockIndicator(appName, true);
    animateWindowRestore(win, appName);
    resumeGameAfterRestore(appName);
    return;
  }

  if (state.openWindows.has(appName)) {
    bringToFront(win);
    return;
  }

  state.openWindows.add(appName);
  win.style.display = 'flex';
  placeWindow(win, appName);
  refreshSidebarPills(win);
  bringToFront(win);
  updateDockIndicator(appName, true);
  bounceDockIcon(appName);
  animateWindowOpen(win, appName);

  // Animate skill bars when skills window opens
  if (appName === 'skills') animateSkillBars();
  // Init library cert count on first open
  if (appName === 'library') {
    const count = document.querySelectorAll('.cert-card').length;
    const el = document.getElementById('cert-count');
    if (el) el.textContent = `${count} certificate${count !== 1 ? 's' : ''}`;
  }
  // Run neofetch when terminal opens
  if (appName === 'terminal') {
    const output = document.getElementById('terminal-output');
    if (output && output.children.length <= 1) runNeofetch();
    setTimeout(() => document.getElementById('terminal-input')?.focus(), 100);
  }
  // Resume or init games
  if (appName === 'game') {
    initSnakeGame();
    if (typeof snakeGame !== 'undefined' && snakeGame.running) {
      snakeGame.paused = false;
    }
  }
  if (appName === 'flappy') {
    initFlappyGame();
    if (typeof flappyGame !== 'undefined' && flappyGame.running) {
      flappyGame.paused = false;
    }
  }
  if (appName === 'shooter') {
    initShooterGame();
    resizeShooterCanvas();
    if (typeof shooterGame !== 'undefined' && shooterGame.running) {
      shooterGame.paused = false;
      if (shooterGame.req) cancelAnimationFrame(shooterGame.req);
      shooterGame.req = requestAnimationFrame(shooterLoop);
    }
  }
  if (appName === 'chatbot') {
    initChatbot();
    setTimeout(() => document.getElementById('chatbot-input')?.focus(), 150);
  }
}

// Games pause on minimize; pick them back up when the window comes back.
function resumeGameAfterRestore(appName) {
  if (appName === 'game' && typeof snakeGame !== 'undefined' && snakeGame.running) snakeGame.paused = false;
  if (appName === 'flappy' && typeof flappyGame !== 'undefined' && flappyGame.running) flappyGame.paused = false;
  if (appName === 'shooter' && shooterGame.running) {
    shooterGame.paused = false;
    shooterGame.lastT = 0;
    if (shooterGame.req) cancelAnimationFrame(shooterGame.req);
    shooterGame.req = requestAnimationFrame(shooterLoop);
  }
}

function closeApp(appName) {
  const win = getWindow(appName);
  if (!win) return;
  if (appName === 'shooter' && document.pointerLockElement) document.exitPointerLock();
  state.openWindows.delete(appName);
  state.minimizedWindows.delete(appName);
  const hide = () => {
    // Skip if the app was reopened while the close animation was running
    if (!state.openWindows.has(appName)) win.style.display = 'none';
  };
  if (canAnimateWindows()) {
    animateWindowClose(win, hide, appName);
  } else if (isMobileLayout() && !prefersReducedMotion()) {
    // Mobile: slide the sheet down (iosSheetDown in style.css)
    win.classList.add('win-minimizing');
    setTimeout(() => { win.classList.remove('win-minimizing'); hide(); }, 240);
  } else {
    hide();
  }
  updateDockIndicator(appName, false);
  focusTopWindow();
  
  if (appName === 'game' && typeof snakeGame !== 'undefined') {
    snakeGame.paused = true;
  }
  if (appName === 'flappy' && typeof flappyGame !== 'undefined') {
    flappyGame.paused = true;
  }
  if (appName === 'shooter' && typeof shooterGame !== 'undefined') {
    shooterGame.paused = true;
    cancelAnimationFrame(shooterGame.req);
  }
}

function closeTopMobileApp() {
  if (state.openWindows.size > 0) {
    let topApp = null;
    let maxZ = -1;
    for (const app of state.openWindows) {
      const win = getWindow(app);
      if (win && win.style.display !== 'none') {
        const z = parseInt(win.style.zIndex) || 0;
        if (z >= maxZ) {
          maxZ = z;
          topApp = app;
        }
      }
    }
    if (topApp) {
      closeApp(topApp);
    }
  }
}
window.closeTopMobileApp = closeTopMobileApp;

// ─── iOS 27 Control Center & Island Features ───
function openControlCenter() {
  const cc = document.getElementById('ios-control-center');
  if (cc) cc.classList.add('active');
}
function closeControlCenter() {
  const cc = document.getElementById('ios-control-center');
  if (cc) cc.classList.remove('active');
}
function toggleControlCenter() {
  const cc = document.getElementById('ios-control-center');
  if (cc) cc.classList.toggle('active');
}
window.openControlCenter = openControlCenter;
window.closeControlCenter = closeControlCenter;
window.toggleControlCenter = toggleControlCenter;

function toggleDynamicIsland() {
  const island = document.getElementById('ios-dynamic-island');
  if (island) island.classList.toggle('expanded');
}
window.toggleDynamicIsland = toggleDynamicIsland;

function toggleTorch(btn) {
  if (btn) btn.classList.toggle('active');
  const lockTorch = document.querySelector('.ios-lock-btn[title="Flashlight"]');
  if (lockTorch) lockTorch.classList.toggle('active');
  document.body.classList.toggle('ios-torch-on');
  if (typeof notif === 'function') {
    const isOn = document.body.classList.contains('ios-torch-on');
    notif(isOn ? 'Flashlight On 🔦' : 'Flashlight Off');
  }
}
window.toggleTorch = toggleTorch;

function togglePlayPause() {
  const btn = document.getElementById('cc-play-pause');
  const waves = document.querySelector('.cc-media-soundwave');
  if (btn) {
    const isPlaying = btn.querySelector('i').classList.contains('fa-pause');
    if (isPlaying) {
      btn.innerHTML = '<i class="fas fa-play"></i>';
      if (waves) waves.style.opacity = '0.3';
      if (typeof notif === 'function') notif('Music Paused ⏸️');
    } else {
      btn.innerHTML = '<i class="fas fa-pause"></i>';
      if (waves) waves.style.opacity = '1';
      if (typeof notif === 'function') notif('Playing: Coding in Surabaya 🎵');
    }
  }
}
window.togglePlayPause = togglePlayPause;

function adjustBrightness(e) {
  const box = document.getElementById('cc-brightness-box');
  const level = document.getElementById('cc-brightness-level');
  if (!box || !level) return;
  const rect = box.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const pct = Math.max(15, Math.min(100, Math.round((1 - (clickY / rect.height)) * 100)));
  level.style.height = pct + '%';
  document.documentElement.style.setProperty('--ios-screen-brightness', (pct / 100).toString());
}
window.adjustBrightness = adjustBrightness;

function adjustVolume(e) {
  const box = document.getElementById('cc-volume-box');
  const level = document.getElementById('cc-volume-level');
  const icon = document.getElementById('cc-volume-icon');
  if (!box || !level) return;
  const rect = box.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const pct = Math.max(0, Math.min(100, Math.round((1 - (clickY / rect.height)) * 100)));
  level.style.height = pct + '%';
  if (icon) {
    if (pct === 0) icon.innerHTML = '<i class="fas fa-volume-xmark"></i>';
    else if (pct < 50) icon.innerHTML = '<i class="fas fa-volume-low"></i>';
    else icon.innerHTML = '<i class="fas fa-volume-high"></i>';
  }
}
window.adjustVolume = adjustVolume;

function minimizeApp(appName) {
  const win = getWindow(appName);
  if (!win) return;
  if (appName === 'shooter' && document.pointerLockElement) document.exitPointerLock();
  state.minimizedWindows.add(appName);
  const hide = () => {
    // Skip if the window was restored while the animation was running
    if (state.minimizedWindows.has(appName)) win.style.display = 'none';
  };
  if (canAnimateWindows()) {
    animateWindowMinimize(win, appName, hide);
  } else {
    win.classList.add('win-minimizing');
    setTimeout(() => { win.classList.remove('win-minimizing'); hide(); }, 200);
  }
  focusTopWindow();

  if (appName === 'game' && typeof snakeGame !== 'undefined') {
    snakeGame.paused = true;
  }
  if (appName === 'flappy' && typeof flappyGame !== 'undefined') {
    flappyGame.paused = true;
  }
  if (appName === 'shooter' && typeof shooterGame !== 'undefined') {
    shooterGame.paused = true;
    cancelAnimationFrame(shooterGame.req);
  }
}

function toggleMaximize(win) {
  if (!win) return;
  // Smoothly animate position/size (see .win-geom-anim in style.css)
  if (canAnimateWindows()) {
    win.classList.add('win-geom-anim');
    clearTimeout(win._geomTimer);
    win._geomTimer = setTimeout(() => win.classList.remove('win-geom-anim'), 420);
  }
  if (win.classList.contains('win-maximized')) {
    win.classList.remove('win-maximized');
    // restore previous position/size from dataset
    if (win.dataset.prevTop) {
      win.style.top = win.dataset.prevTop;
      win.style.left = win.dataset.prevLeft;
      win.style.width = win.dataset.prevWidth;
      win.style.height = win.dataset.prevHeight;
    }
  } else {
    win.dataset.prevTop = win.style.top;
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;
    win.classList.add('win-maximized');
  }
}

function bringToFront(win) {
  if (win.style.zIndex != state.zTop || state.focusedWin !== win) {
    state.zTop++;
    win.style.zIndex = state.zTop;
  }
  setFocusedWindow(win);
}

function updateDockIndicator(appName, open) {
  const dockItem = document.querySelector(`.dock-item[data-app="${appName}"]`);
  if (dockItem) dockItem.classList.toggle('app-open', open);
  // desktop icon selection
  const dicon = document.querySelector(`.dicon[data-app="${appName}"]`);
  if (dicon) dicon.classList.toggle('selected', open);
}

// ─── Drag ─────────────────────────────────────────────────
function initDrag(titlebar, win) {
  let startX, startY, startL, startT;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.win-btn')) return;
    if (win.classList.contains('win-maximized')) return;
    e.preventDefault();
    startX = e.clientX; startY = e.clientY;
    startL = parseInt(win.style.left) || 0;
    startT = parseInt(win.style.top) || 0;
    state.dragging = win;
    bringToFront(win);

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let newL = startL + dx;
      let newT = startT + dy;
      // Clamp within desktop area
      newT = Math.max(0, Math.min(newT, window.innerHeight - 100));
      newL = Math.max(-win.offsetWidth + 100, Math.min(newL, window.innerWidth - 100));
      win.style.left = newL + 'px';
      win.style.top = newT + 'px';
      if (dx || dy) win.dataset.userPlaced = '1';
    };
    const onUp = () => {
      state.dragging = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Double-click titlebar = maximize
  titlebar.addEventListener('dblclick', (e) => {
    if (e.target.closest('.win-btn')) return;
    toggleMaximize(win);
  });
}

// ─── Skill Cat Switch ─────────────────────────────────────
function switchSkillCat(cat, btn) {
  document.querySelectorAll('.skills-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#win-skills .sidebar-item').forEach(i => i.classList.remove('active'));
  const panel = document.getElementById(`sk-${cat}`);
  if (panel) {
    panel.classList.add('active');
    staggerIn(panel.children, { step: 45 });
    animateSkillBars();
  }
  if (btn) btn.classList.add('active');
}

function animateSkillBars() {
  document.querySelectorAll('.skills-panel.active .skill-bar-fill').forEach((bar, i) => {
    const w = bar.dataset.w || '0';
    bar.style.width = '0%'; // refill every time the tab is shown
    setTimeout(() => { bar.style.width = w + '%'; }, 80 + Math.min(i, 10) * 40);
  });
}

// ─── Project Filter ───────────────────────────────────────
function filterProjects(tag, btn) {
  const cards = document.querySelectorAll('.proj-card');
  let count = 0;
  const shown = [];
  cards.forEach(card => {
    const tags = card.dataset.tags || '';
    const show = tag === 'all' || tags.includes(tag);
    card.style.display = show ? 'block' : 'none';
    if (show) { count++; shown.push(card); }
  });
  staggerIn(shown, { y: 18, scale: 0.94 });
  const countEl = document.getElementById('proj-count');
  if (countEl) countEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  document.querySelectorAll('#win-projects .sidebar-item').forEach(i => i.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ─── Certificate Filter ────────────────────────────────────
function filterCerts(cat, btn) {
  const cards = document.querySelectorAll('.cert-card');
  let count = 0;
  const shown = [];
  cards.forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
    if (show) { count++; shown.push(card); }
  });
  staggerIn(shown, { y: 18, scale: 0.94 });
  const countEl = document.getElementById('cert-count');
  if (countEl) countEl.textContent = `${count} certificate${count !== 1 ? 's' : ''}`;
  document.querySelectorAll('#win-library .sidebar-item').forEach(i => i.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ─── Resume Section Scroll ─────────────────────────────────
function scrollResumeTo(id, el) {
  const target = document.getElementById(id);
  const container = document.getElementById('resume-scroll-container');
  if (target && container) {
    const topPos = target.offsetTop - container.offsetTop - 10;
    container.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    flashSection(target);
  }
  document.querySelectorAll('#win-files .sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

// ─── About Section Scroll & Language Switch ────────────────
function scrollAboutTo(id, el) {
  const target = document.getElementById(id);
  const container = document.getElementById('about-scroll-container');
  if (target && container) {
    const topPos = target.offsetTop - container.offsetTop - 10;
    container.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    flashSection(target);
  }
  document.querySelectorAll('#win-about .sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

// Briefly highlight the section a sidebar link scrolled to.
function flashSection(el) {
  if (prefersReducedMotion() || !el.animate) return;
  el.animate([
    { boxShadow: '0 0 0 0 rgba(233,84,32,0)', transform: 'translateY(8px)', opacity: 0.6 },
    { boxShadow: '0 0 0 2px rgba(233,84,32,0.45)', transform: 'none', opacity: 1, offset: 0.4 },
    { boxShadow: '0 0 0 0 rgba(233,84,32,0)', transform: 'none', opacity: 1 },
  ], { duration: 900, delay: 250, easing: 'ease-out', fill: 'backwards' });
}

function setAboutLang(lang) {
  const idEls = document.querySelectorAll('.about-lang-id');
  const enEls = document.querySelectorAll('.about-lang-en');
  const btnId = document.getElementById('btn-lang-id');
  const btnEn = document.getElementById('btn-lang-en');

  if (lang === 'id') {
    idEls.forEach(el => el.style.display = '');
    enEls.forEach(el => el.style.display = 'none');
    if (btnId) btnId.classList.add('active');
    if (btnEn) btnEn.classList.remove('active');
  } else {
    idEls.forEach(el => el.style.display = 'none');
    enEls.forEach(el => el.style.display = 'block');
    if (btnId) btnId.classList.remove('active');
    if (btnEn) btnEn.classList.add('active');
  }
  staggerIn(lang === 'id' ? idEls : enEls, { y: 6, scale: 1, step: 20, max: 10, duration: 320 });
}

// ─── Contact Form ─────────────────────────────────────────
function handleContactForm(e) {
  e.preventDefault();
  showToast('Message sent! I\'ll get back to you soon. 🎉');
  e.target.reset();
}

function showToast(msg) {
  const toast = document.getElementById('notif-toast');
  const msgEl = document.getElementById('notif-msg');
  if (!toast) return;
  msgEl.textContent = msg;
  toast.style.display = 'flex';
  setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// ─── Wallpaper Change ─────────────────────────────────────
function changeWallpaper() {
  state.wallpaperIdx = (state.wallpaperIdx + 1) % state.wallpapers.length;
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.background = state.wallpapers[state.wallpaperIdx];
  closeContextMenu();
}

// ─── Context Menu ─────────────────────────────────────────
function closeContextMenu() {
  closeMenu(document.getElementById('context-menu'));
}

// ─── Power Menu ───────────────────────────────────────────
function togglePowerMenu() {
  const menu = document.getElementById('power-menu');
  if (!menu) return;
  if (menu.style.display === 'none' || menu.classList.contains('menu-closing')) openMenu(menu);
  else closeMenu(menu);
}

// ─── Terminal Emulator ────────────────────────────────────
let termCurrentDir = '~';
const termVFS = {
  '~': {
    type: 'dir', perms: 'drwxr-xr-x', owner: 'firman',
    contents: {
      'Desktop': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman' },
      'Documents': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman' },
      'Downloads': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman' },
      'Projects': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman' },
      'Skills': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman' },
      'Contact': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman' },
      'about.txt': { type: 'file', perms: '-rw-r--r--', owner: 'firman', content: 'Firman Ardiansyah - Full Stack Developer & Network Engineer' },
      'server.sh': { type: 'file', perms: '-rwxr-xr-x', owner: 'firman', content: 'echo "Starting server..."' }
    }
  },
  '~/Desktop': {
    type: 'dir', perms: 'drwxr-xr-x', owner: 'firman',
    contents: {
      'portfolio.html': { type: 'file', perms: '-rw-r--r--', owner: 'firman' },
      'notes.txt': { type: 'file', perms: '-rw-r--r--', owner: 'firman' }
    }
  },
  '~/Documents': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman', contents: {} },
  '~/Downloads': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman', contents: {} },
  '~/Projects': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman', contents: {} },
  '~/Skills': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman', contents: {} },
  '~/Contact': { type: 'dir', perms: 'drwxr-xr-x', owner: 'firman', contents: {} }
};

function getTermPrompt() {
  return `firman@ubuntu:${termCurrentDir}$`;
}

const termCommands = {
  help: () => [
    { cls: 'term-yellow', text: 'Available commands:' },
    { cls: 'term-green', text: '  help           — Show this help message' },
    { cls: 'term-green', text: '  whoami         — Display user info' },
    { cls: 'term-green', text: '  neofetch       — System info (portfolio style)' },
    { cls: 'term-green', text: '  ls             — List portfolio sections' },
    { cls: 'term-green', text: '  cat about      — Show about info' },
    { cls: 'term-green', text: '  cat skills     — List all skills' },
    { cls: 'term-orange', text: '  cat networking — Show networking & server skills' },
    { cls: 'term-green', text: '  cat contact    — Show contact info' },
    { cls: 'term-green', text: '  open <app>     — Open an app (about/projects/skills/contact)' },
    { cls: 'term-green', text: '  clear          — Clear terminal' },
    { cls: 'term-green', text: '  date           — Show current date/time' },
    { cls: 'term-green', text: '  uname -a       — System info' },
    { cls: 'term-green', text: '  echo <text>    — Echo text' },
  ],
  whoami: () => [{ cls: 'term-output', text: 'firman' }],
  date: () => [{ cls: 'term-output', text: new Date().toString() }],
  'uname -a': () => [{ cls: 'term-output', text: 'Linux firman-ubuntu 6.5.0-21-generic #21-Ubuntu SMP Fri Feb 16 13:48:09 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux' }],
  ls: () => [
    { cls: 'term-blue', text: 'Desktop/    Documents/    Downloads/    Projects/    Skills/    Contact/' },
  ],
  'cat about': () => [
    { cls: 'term-yellow', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { cls: 'term-orange', text: '  Firman Ardiansyah' },
    { cls: 'term-output', text: '  Full Stack Developer & Network Engineer' },
    { cls: 'term-output', text: '  Surabaya, Indonesia 🇮🇩' },
    { cls: 'term-output', text: '  ITATS — Informatic Engineering (2023)' },
    { cls: 'term-yellow', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  ],
  'cat skills': () => [
    { cls: 'term-cyan', text: '[Frontend]    HTML5 · CSS3 · JavaScript · React' },
    { cls: 'term-green', text: '[Backend]     PHP · Laravel · MySQL · Java · Python' },
    { cls: 'term-orange', text: '[Networking]  Cisco · TCP/IP · Linux Server · Apache · Nginx · Firewall · DNS · DHCP' },
    { cls: 'term-yellow', text: '[Tools]       Git · GitHub · VS Code · Figma' },
  ],
  'cat networking': () => [
    { cls: 'term-yellow', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { cls: 'term-orange', text: '  Networking & Server Skills' },
    { cls: 'term-yellow', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { cls: 'term-cyan', text: '  🌐 Internet & Routing   : Cisco Packet Tracer, RIP, OSPF, Static Routing' },
    { cls: 'term-cyan', text: '  🔒 Security             : Firewall (iptables), ACL, VPN basics' },
    { cls: 'term-green', text: '  🐧 Linux Server Admin   : Ubuntu Server, Debian, user & permission mgmt' },
    { cls: 'term-green', text: '  🌍 Web Server           : Apache2, Nginx, SSL/TLS (Let\'s Encrypt)' },
    { cls: 'term-blue', text: '  📡 Services             : DNS, DHCP, FTP, SSH, Samba' },
    { cls: 'term-yellow', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  ],
  'cat contact': () => [
    { cls: 'term-output', text: '📧 firman@example.com' },
    { cls: 'term-green', text: '📱 +62 813-5739-8265 (WhatsApp)' },
    { cls: 'term-blue', text: '🐙 github.com/taka-duarr' },
    { cls: 'term-blue', text: '💼 linkedin.com/in/firman-ardiansyah-700786284' },
    { cls: 'term-blue', text: '📸 instagram.com/lord_takaa' },
  ],
  'open about': () => { openApp('about'); return [{ cls: 'term-green', text: 'Opening About Me...' }]; },
  'open projects': () => { openApp('projects'); return [{ cls: 'term-green', text: 'Opening Projects...' }]; },
  'open skills': () => { openApp('skills'); return [{ cls: 'term-green', text: 'Opening Skills...' }]; },
  'open contact': () => { openApp('contact'); return [{ cls: 'term-green', text: 'Opening Contact...' }]; },
  'open terminal': () => [{ cls: 'term-yellow', text: 'You are already in the terminal!' }],
};

function runNeofetch() {
  const output = document.getElementById('terminal-output');
  if (!output) return;

  const lines = [
    { cls: 'term-orange', text: '       _.-``__ \'\'-._' },
    { cls: 'term-orange', text: '   _.-``    `.  `_.  \'\'-._' },
    { cls: 'term-orange', text: '.-`` .-````.  ```\\/    _.,_ \'\'\'\'` ' },
    { cls: 'term-orange', text: '(    \'       ,       .-`  | `,    )    firman@ubuntu' },
    { cls: 'term-orange', text: ' `-.   ,---\'(   ) ,-` -._ |   /      ─────────────' },
    { cls: 'term-cyan',   text: '   `--..---.-`.....---..--`        OS: Ubuntu 22.04.3 LTS' },
    { cls: 'term-cyan',   text: '                                   Host: Portfolio OS v1.0' },
    { cls: 'term-green',  text: '                                   Shell: bash 5.1.16' },
    { cls: 'term-green',  text: '                                   DE: GNOME 42.5' },
    { cls: 'term-yellow', text: '                                   Name: Firman Ardiansyah' },
    { cls: 'term-yellow', text: '                                   Role: Full Stack Developer' },
    { cls: 'term-blue',   text: '                                   Stack: PHP · Laravel · React' },
    { cls: 'term-output', text: '                                   Location: Surabaya, ID 🇮🇩' },
    { cls: 'term-output', text: '' },
    { cls: 'term-output', text: '  Type \x1b[33mhelp\x1b[0m to see available commands.' },
  ];

  lines.forEach((l, i) => {
    setTimeout(() => {
      appendTermLine(l.cls, l.text);
    }, i * 35);
  });
}

function appendTermLine(cls, text) {
  const output = document.getElementById('terminal-output');
  if (!output) return;
  const div = document.createElement('div');
  div.className = `term-line ${cls}`;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function processCommand(raw) {
  const fullCmd = raw.trim();
  const cmdArgs = fullCmd.split(/\s+/);
  const baseCmd = cmdArgs[0].toLowerCase();

  if (!fullCmd) return;

  // Echo command back
  const output = document.getElementById('terminal-output');
  const cmdLine = document.createElement('div');
  cmdLine.className = 'term-line';
  cmdLine.innerHTML = `<span class="term-prompt">${escHtml(getTermPrompt())} </span> <span class="term-cmd">${escHtml(raw)}</span>`;
  output.appendChild(cmdLine);

  if (baseCmd === 'clear') {
    output.innerHTML = '';
    return;
  }

  // Handle dynamic commands
  if (baseCmd === 'pwd') {
    const pwd = termCurrentDir === '~' ? '/home/firman' : termCurrentDir.replace('~', '/home/firman');
    appendTermLine('term-output', pwd);
    updateTerminalScroll();
    return;
  }

  if (baseCmd === 'cd') {
    let target = cmdArgs[1] || '~';
    // Remove trailing slash for matching
    if (target.length > 1 && target.endsWith('/')) target = target.slice(0, -1);
    
    if (target === '~' || target === '') {
      termCurrentDir = '~';
    } else if (target === '..') {
      if (termCurrentDir !== '~') {
        const parts = termCurrentDir.split('/');
        parts.pop();
        termCurrentDir = parts.length > 0 ? parts.join('/') : '~';
      }
    } else {
      let checkDir = target.startsWith('~/') ? target : (termCurrentDir === '~' ? `~/${target}` : `${termCurrentDir}/${target}`);
      if (termVFS[checkDir] && termVFS[checkDir].type === 'dir') {
        termCurrentDir = checkDir;
      } else {
        appendTermLine('term-error', `bash: cd: ${target}: No such file or directory`);
      }
    }
    // Update the input prompt
    const promptInput = document.getElementById('term-prompt-input');
    if (promptInput) promptInput.textContent = getTermPrompt() + ' ';
    updateTerminalScroll();
    return;
  }

  if (baseCmd === 'ls') {
    const isLong = cmdArgs[1] === '-l' || cmdArgs[1] === '-la' || cmdArgs[1] === '-al';
    const dirObj = termVFS[termCurrentDir];
    if (!dirObj || !dirObj.contents) {
      appendTermLine('term-error', `ls: cannot access '${termCurrentDir}': No such file or directory`);
    } else {
      const keys = Object.keys(dirObj.contents);
      if (keys.length === 0) {
        // empty dir
      } else if (isLong) {
        keys.forEach(k => {
          const item = dirObj.contents[k];
          appendTermLine('term-output', `${item.perms} 1 ${item.owner} ${item.owner} 4096 Jan 16 14:00 ${item.type === 'dir' ? '<span class="term-blue">'+k+'</span>' : k}`);
        });
      } else {
        const out = keys.map(k => dirObj.contents[k].type === 'dir' ? `<span class="term-blue">${k}</span>` : k).join('    ');
        const d = document.createElement('div');
        d.className = 'term-line term-output';
        d.innerHTML = out;
        output.appendChild(d);
      }
    }
    updateTerminalScroll();
    return;
  }

  if (baseCmd === 'chmod') {
    const perms = cmdArgs[1];
    const file = cmdArgs[2];
    if (!perms || !file) {
      appendTermLine('term-error', `chmod: missing operand`);
    } else {
      const dirObj = termVFS[termCurrentDir];
      if (dirObj && dirObj.contents[file]) {
        const item = dirObj.contents[file];
        let permStr = item.type === 'dir' ? 'd' : '-';
        const map = {'7':'rwx','6':'rw-','5':'r-x','4':'r--','0':'---'};
        for(let i=0; i<3; i++) {
          permStr += map[perms[i]] || 'r-x'; 
        }
        item.perms = permStr;
      } else {
        appendTermLine('term-error', `chmod: cannot access '${file}': No such file or directory`);
      }
    }
    updateTerminalScroll();
    return;
  }

  if (baseCmd === 'htop') {
    renderHtop();
    return;
  }

  if (baseCmd === 'cat') {
    const file = cmdArgs[1];
    if (!file) {
      appendTermLine('term-error', `cat: missing operand`);
    } else {
      const dirObj = termVFS[termCurrentDir];
      if (dirObj && dirObj.contents[file] && dirObj.contents[file].type === 'file') {
        appendTermLine('term-output', dirObj.contents[file].content || 'No content.');
      } else if (termCommands[`cat ${file}`]) {
         // fallback to legacy cat commands (like `cat about`)
         const results = termCommands[`cat ${file}`]();
         results.forEach(r => appendTermLine(r.cls, r.text));
      } else {
        appendTermLine('term-error', `cat: ${file}: No such file or directory`);
      }
    }
    updateTerminalScroll();
    return;
  }

  // Fallback to legacy static commands
  const handler = termCommands[fullCmd.toLowerCase()];
  if (handler) {
    const results = handler();
    if (Array.isArray(results)) {
      results.forEach(r => appendTermLine(r.cls, r.text));
    }
  } else if (baseCmd === 'echo') {
    appendTermLine('term-output', raw.slice(5));
  } else {
    appendTermLine('term-error', `bash: ${baseCmd}: command not found`);
    appendTermLine('term-output', 'Type \x27help\x27 to see available commands.');
  }

  updateTerminalScroll();
}

function updateTerminalScroll() {
  const output = document.getElementById('terminal-output');
  if (output) output.scrollTop = output.scrollHeight;
}

function renderHtop() {
  const output = document.getElementById('terminal-output');
  if (!output) return;
  const htopView = document.createElement('div');
  htopView.className = 'term-line term-output';
  htopView.style.fontFamily = 'monospace';
  htopView.style.whiteSpace = 'pre';
  htopView.style.lineHeight = '1.2';
  htopView.innerHTML = `
<span class="term-cyan">1</span>  [<span class="term-green">|||||||||||||||||||||</span><span class="term-orange">||||||</span><span class="term-cyan">||</span>                48.1%]   Tasks: 97, 212 thr, 107 kthr; 1 running
<span class="term-cyan">2</span>  [<span class="term-green">|||||||||||||||||||</span><span class="term-orange">||||</span>                        33.9%]   Load average: 0.15 0.18 0.19 
<span class="term-cyan">3</span>  [<span class="term-green">|||||||||||||||||||||||||</span><span class="term-orange">|||||</span><span class="term-cyan">|||</span>             54.2%]   Uptime: 04:21:42
<span class="term-cyan">4</span>  [<span class="term-green">|||||||||||||||</span>                                22.0%]
<span class="term-cyan">Mem</span>[<span class="term-green">||||||||||||||||||||||||||||||</span><span class="term-orange">|||||||||||</span><span class="term-yellow">|</span> 3.42G/15.6G]
<span class="term-cyan">Swp</span>[<span class="term-red">|</span>                                        2.00M/2.00G]

<span class="term-black" style="background:#0f0;">  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command </span>
 1432 firman     20   0 4825M  542M  215M S  8.5  3.4  2:43.20 /opt/google/chrome/chrome
 8491 firman     20   0 2145M  241M  112M S  2.1  1.5  0:15.82 code /projects/portfolio
 9102 firman     20   0  982M   45M   21M R  1.0  0.3  0:00.15 htop
    1 root       20   0  165M   11M    8M S  0.0  0.1  0:04.12 /sbin/init
`;
  output.appendChild(htopView);
  updateTerminalScroll();
}


function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // Await dynamically loaded components
  await loadComponents();

  // Start boot or restore active desktop session
  let isUnlocked = false;
  try {
    isUnlocked = sessionStorage.getItem('ubuntu_unlocked') === 'true';
  } catch (e) {}

  if (isUnlocked) {
    const boot = document.getElementById('boot-screen');
    if (boot) boot.style.display = 'none';
    showDesktop();
  } else {
    startBoot();
  }

  // Lock screen unlock
  const lockBtn = document.getElementById('lock-pass-btn');
  const lockInput = document.getElementById('lock-pass');
  if (lockBtn) lockBtn.addEventListener('click', tryUnlock);
  if (lockInput) lockInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });

  // Mobile Lock Screen touch swipe-up unlock
  const lockScreen = document.getElementById('lock-screen');
  let lockTouchStartY = 0;
  if (lockScreen) {
    lockScreen.addEventListener('touchstart', e => {
      if (e.touches && e.touches[0]) {
        lockTouchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    lockScreen.addEventListener('touchend', e => {
      if (e.changedTouches && e.changedTouches[0]) {
        const lockTouchEndY = e.changedTouches[0].clientY;
        if (lockTouchStartY - lockTouchEndY > 40) {
          tryUnlock();
        }
      }
    }, { passive: true });
  }

  // Mobile swipe down from top (Wipe Down) to open Control Center or Dynamic Island
  let swipeDownStartX = 0;
  let swipeDownStartY = 0;

  document.addEventListener('touchstart', e => {
    if (window.innerWidth <= 768 && e.touches && e.touches[0]) {
      swipeDownStartX = e.touches[0].clientX;
      swipeDownStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (window.innerWidth <= 768 && e.changedTouches && e.changedTouches[0]) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffY = endY - swipeDownStartY;
      const diffX = Math.abs(endX - swipeDownStartX);

      // Swipe down started in top 75px
      if (swipeDownStartY <= 75 && diffY > 40 && diffY > diffX) {
        // Right side (top right status bar): Control Center
        if (swipeDownStartX > window.innerWidth * 0.45) {
          openControlCenter();
        } else {
          // Center / left: Apple Intelligence Dynamic Island
          toggleDynamicIsland();
        }
      }
    }
  }, { passive: true });

  // Swipe up inside Control Center to close it
  const ccPanel = document.getElementById('ios-control-center');
  let ccTouchStartY = 0;
  if (ccPanel) {
    ccPanel.addEventListener('touchstart', e => {
      if (e.touches && e.touches[0]) ccTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    ccPanel.addEventListener('touchend', e => {
      if (e.changedTouches && e.changedTouches[0]) {
        const ccTouchEndY = e.changedTouches[0].clientY;
        if (ccTouchStartY - ccTouchEndY > 45) {
          closeControlCenter();
        }
      }
    }, { passive: true });
  }

  // Dock items
  document.querySelectorAll('.dock-item[data-app]').forEach(item => {
    item.addEventListener('click', () => openApp(item.dataset.app));
  });

  // App Grid icons — single click opens and hides grid
  document.querySelectorAll('.dicon').forEach(icon => {
    icon.addEventListener('click', () => {
      openApp(icon.dataset.app);
      const grid = document.getElementById('app-grid-overlay');
      if (grid) grid.classList.add('hidden');
    });
  });

  // Show Applications / Activities toggle
  const showAppsBtn = document.getElementById('show-apps-btn');
  const activitiesBtn = document.getElementById('activities-btn');
  const appGridOverlay = document.getElementById('app-grid-overlay');

  function toggleAppGrid() {
    if (appGridOverlay) {
      appGridOverlay.classList.toggle('hidden');
      // Icons spring in one by one when the grid opens
      if (!appGridOverlay.classList.contains('hidden')) {
        staggerIn(appGridOverlay.querySelectorAll('.dicon'), { y: 24, scale: 0.6, step: 30, duration: 560, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
      }
    }
  }

  if (showAppsBtn) showAppsBtn.addEventListener('click', toggleAppGrid);
  if (activitiesBtn) activitiesBtn.addEventListener('click', toggleAppGrid);

  // Close app grid if clicking background
  if (appGridOverlay) {
    appGridOverlay.addEventListener('click', (e) => {
      if (e.target === appGridOverlay || e.target.classList.contains('app-grid-content')) {
        appGridOverlay.classList.add('hidden');
      }
    });
  }

  // Window controls
  document.querySelectorAll('.win-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      closeApp(btn.dataset.win);
    });
    btn.addEventListener('mousedown', (e) => e.stopPropagation());
  });
  document.querySelectorAll('.win-minimize').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      minimizeApp(btn.dataset.win);
    });
    btn.addEventListener('mousedown', (e) => e.stopPropagation());
  });
  document.querySelectorAll('.win-maximize').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleMaximize(getWindow(btn.dataset.win));
    });
    btn.addEventListener('mousedown', (e) => e.stopPropagation());
  });

  // Click on window brings to front
  document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win));
    const titlebar = win.querySelector('.win-titlebar');
    if (titlebar) initDrag(titlebar, win);
  });

  // Panel power button
  document.getElementById('tray-power')?.addEventListener('click', togglePowerMenu);

  // Lock from power menu
  document.getElementById('power-lock-btn')?.addEventListener('click', () => {
    try {
      sessionStorage.removeItem('ubuntu_unlocked');
    } catch (e) {}
    document.getElementById('power-menu').style.display = 'none';
    const desktop = document.getElementById('desktop');
    playClassAnimation(desktop, 'desktop-leaving', () => {
      desktop.style.display = 'none';
      showLockScreen();
    });
  });

  // macOS-style dock magnification
  initDockMagnify();

  // Close power menu on outside click
  document.addEventListener('click', e => {
    const menu = document.getElementById('power-menu');
    const btn = document.getElementById('tray-power');
    if (menu && !menu.contains(e.target) && !btn?.contains(e.target)) {
      closeMenu(menu);
    }
  });

  // Desktop right-click context menu
  const desktopArea = document.getElementById('desktop-area');
  desktopArea?.addEventListener('contextmenu', e => {
    e.preventDefault();
    openContextMenuAt(e.clientX, e.clientY);
  });
  document.addEventListener('click', () => {
    // Menu items run their own onclick first, then the menu folds away
    closeContextMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeContextMenu();
      closeMenu(document.getElementById('power-menu'));
      document.getElementById('app-grid-overlay')?.classList.add('hidden');
    }
  });

  // Motion setup
  initLaunchOriginTracking();
  initSidebarPills();
  window.addEventListener('resize', () => {
    clearTimeout(state.resizeTimer);
    state.resizeTimer = setTimeout(keepWindowsInView, 150);
  });

  // Terminal input
  const termInput = document.getElementById('terminal-input');
  const termHistory = [];
  let histIdx = -1;
  if (termInput) {
    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = termInput.value;
        if (val.trim()) { termHistory.unshift(val); histIdx = -1; }
        processCommand(val);
        termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < termHistory.length - 1) { histIdx++; termInput.value = termHistory[histIdx]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; termInput.value = termHistory[histIdx]; }
        else { histIdx = -1; termInput.value = ''; }
      }
    });
    // Click on terminal body focuses input
    document.querySelector('.terminal-body')?.addEventListener('click', () => termInput.focus());
  }

  // Activities button — cycle through opening apps


  // ESC closes context menu & power menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeContextMenu();
      const pm = document.getElementById('power-menu');
      if (pm) pm.style.display = 'none';
    }
  });

  // ─── APPS & GAMES INIT ───
  initSnakeGame();
  initFlappyGame();
  initShooterGame();
  initChatbot();

}); // end DOMContentLoaded

// ─── SNAKE GAME LOGIC ──────────────────────────────────────
let snakeGame = {
  ctx: null, grid: 20,
  snake: { 
    x: 160, y: 160,
    dx: 2, dy: 0, 
    path: [], 
    logicalLength: 4,
    queue: []
  },
  apple: { x: 320, y: 320 },
  score: 0, highScore: 0,
  req: null, running: false, paused: false,
  baseSpeed: 2, currentSpeed: 2, maxSpeed: 5
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function startSnakeGame() {
  const canvas = document.getElementById('snake-canvas');
  snakeGame.ctx = canvas.getContext('2d');
  document.getElementById('game-overlay').style.display = 'none';
  
  // reset
  snakeGame.snake.x = 160; 
  snakeGame.snake.y = 160;
  snakeGame.snake.path = [{x: 160, y: 160}];
  snakeGame.snake.logicalLength = 4;
  snakeGame.snake.queue = [];
  snakeGame.currentSpeed = snakeGame.baseSpeed;
  snakeGame.snake.dx = snakeGame.currentSpeed; 
  snakeGame.snake.dy = 0;
  
  snakeGame.score = 0;
  snakeGame.apple.x = getRandomInt(0, 20) * 20;
  snakeGame.apple.y = getRandomInt(0, 20) * 20;
  
  document.getElementById('snake-score').textContent = '0';
  snakeGame.running = true;
  snakeGame.paused = false;
  
  if (snakeGame.req) clearTimeout(snakeGame.req);
  snakeGame.req = setTimeout(snakeLoop, 16);
}

function stopSnakeGame(msg) {
  snakeGame.running = false;
  clearTimeout(snakeGame.req);
  const overlay = document.getElementById('game-overlay');
  overlay.style.display = 'flex';
  document.getElementById('game-overlay-title').textContent = msg || 'GAME OVER';
  document.getElementById('game-overlay-desc').textContent = 'Score: ' + snakeGame.score;
  document.getElementById('game-start-btn').textContent = 'Play Again';
}

function snakeLoop() {
  if (!snakeGame.running || snakeGame.paused) return;
  snakeGame.req = setTimeout(snakeLoop, 16); // 60 FPS Fixed

  const canvas = document.getElementById('snake-canvas');
  const ctx = snakeGame.ctx;
  const grid = snakeGame.grid;
  const speed = snakeGame.currentSpeed;
  const snake = snakeGame.snake;

  // 1. Grid Logic (Hanya eksekusi pas di tengah grid)
  if (snake.x % grid === 0 && snake.y % grid === 0) {
    // Proses Queue Belok
    if (snake.queue.length > 0) {
      const nextMove = snake.queue.shift();
      if (nextMove === 'LEFT' && snake.dx === 0) { snake.dx = -speed; snake.dy = 0; }
      else if (nextMove === 'UP' && snake.dy === 0) { snake.dx = 0; snake.dy = -speed; }
      else if (nextMove === 'RIGHT' && snake.dx === 0) { snake.dx = speed; snake.dy = 0; }
      else if (nextMove === 'DOWN' && snake.dy === 0) { snake.dx = 0; snake.dy = speed; }
    }
    
    // Cek Makan Apel
    if (snake.x === snakeGame.apple.x && snake.y === snakeGame.apple.y) {
      snake.logicalLength += 2;
      snakeGame.score += 10;
      
      // Tingkatkan kecepatan perlahan (faktor 20: 2 -> 4 -> 5)
      if (snakeGame.score % 50 === 0) {
        if (snakeGame.currentSpeed === 2) snakeGame.currentSpeed = 4;
        else if (snakeGame.currentSpeed === 4) snakeGame.currentSpeed = 5;
        
        // Sesuaikan dx/dy dengan speed baru
        snake.dx = Math.sign(snake.dx) * snakeGame.currentSpeed;
        snake.dy = Math.sign(snake.dy) * snakeGame.currentSpeed;
      }

      document.getElementById('snake-score').textContent = snakeGame.score;
      if (snakeGame.score > snakeGame.highScore) {
        snakeGame.highScore = snakeGame.score;
        document.getElementById('snake-high-score').textContent = snakeGame.highScore;
      }
      snakeGame.apple.x = getRandomInt(0, 20) * 20;
      snakeGame.apple.y = getRandomInt(0, 20) * 20;
    }
  }

  // 2. Update Pixel Position
  snake.x += snake.dx;
  snake.y += snake.dy;

  // Wrap around
  if (snake.x < 0) snake.x = canvas.width - grid;
  else if (snake.x >= canvas.width) snake.x = 0;
  if (snake.y < 0) snake.y = canvas.height - grid;
  else if (snake.y >= canvas.height) snake.y = 0;

  snake.path.push({ x: snake.x, y: snake.y });

  // 3. Batasi path history
  const framesPerBlock = grid / speed;
  const maxPathLength = snake.logicalLength * framesPerBlock;
  while (snake.path.length > maxPathLength) {
    snake.path.shift();
  }

  // 4. Deteksi Tabrakan (Self)
  if (snake.x % grid === 0 && snake.y % grid === 0 && snake.path.length > framesPerBlock * 2) {
    for (let i = 0; i < snake.path.length - framesPerBlock * 1.5; i++) {
      if (snake.path[i].x === snake.x && snake.path[i].y === snake.y) {
        stopSnakeGame('CRASHED!');
        return;
      }
    }
  }

  // 5. Render
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Apple
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(snakeGame.apple.x + grid/2, snakeGame.apple.y + grid/2, grid/2 - 2, 0, Math.PI*2);
  ctx.fill();

  // Draw Snake Line
  ctx.strokeStyle = '#2ecc71';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = grid - 4;

  ctx.beginPath();
  if (snake.path.length > 0) {
    ctx.moveTo(snake.path[0].x + grid/2, snake.path[0].y + grid/2);
    for (let i = 1; i < snake.path.length; i++) {
      const prev = snake.path[i-1];
      const curr = snake.path[i];
      // Jika terjadi teleport / wrap-around, putus garis
      if (Math.abs(curr.x - prev.x) > grid || Math.abs(curr.y - prev.y) > grid) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(curr.x + grid/2, curr.y + grid/2);
      } else {
        ctx.lineTo(curr.x + grid/2, curr.y + grid/2);
      }
    }
    ctx.stroke();
  }
  
  // Draw Head
  ctx.fillStyle = '#27ae60';
  ctx.beginPath();
  ctx.arc(snake.x + grid/2, snake.y + grid/2, grid/2 - 1, 0, Math.PI*2);
  ctx.fill();
}

function queueSnakeDirection(dir) {
  if (!snakeGame.running || snakeGame.paused) return;
  if (snakeGame.snake.queue.length > 2) return;
  snakeGame.snake.queue.push(dir);
}

let snakeInitialized = false;
function initSnakeGame() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  snakeGame.ctx = canvas.getContext('2d');

  if (snakeInitialized) return;
  snakeInitialized = true;

  const startBtn = document.getElementById('game-start-btn');
  if (startBtn) {
    const handleStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startSnakeGame();
    };
    startBtn.addEventListener('pointerdown', handleStart);
    startBtn.addEventListener('click', handleStart);
  }

  // Handle D-Pad on-screen buttons for mobile
  const dpad = document.getElementById('snake-dpad');
  if (dpad) {
    dpad.querySelectorAll('.dpad-btn').forEach(btn => {
      const handleDir = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = btn.dataset.dir;
        if (dir) queueSnakeDirection(dir);
      };
      btn.addEventListener('pointerdown', handleDir);
      btn.addEventListener('click', handleDir);
    });
  }

  // Touch swipe on snake canvas
  let touchStartX = 0;
  let touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (!snakeGame.running || snakeGame.paused) return;
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (Math.max(absX, absY) > 20) {
        if (absX > absY) {
          queueSnakeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          queueSnakeDirection(dy > 0 ? 'DOWN' : 'UP');
        }
      }
    }
  }, { passive: true });

  document.addEventListener('keydown', handleSnakeInput);
}

function handleSnakeInput(e) {
  if (!snakeGame.running || snakeGame.paused) return;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
    if (state.openWindows.has('game') && getWindow('game')?.style.display !== 'none') {
      e.preventDefault();
    } else {
      return;
    }
  }

  if (e.key === 'ArrowLeft' || e.key === 'a') queueSnakeDirection('LEFT');
  else if (e.key === 'ArrowUp' || e.key === 'w') queueSnakeDirection('UP');
  else if (e.key === 'ArrowRight' || e.key === 'd') queueSnakeDirection('RIGHT');
  else if (e.key === 'ArrowDown' || e.key === 's') queueSnakeDirection('DOWN');
}


// ─── Flappy Bird Game ─────────────────────────────────────
const flappyGame = {
  running: false,
  paused: false,
  req: null,
  canvas: null,
  ctx: null,
  score: 0,
  highScore: 0,
  frames: 0,
  bird: {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    velocity: 0,
    gravity: 0.25,
    jump: -5.5,
    radius: 10
  },
  pipes: [],
  pipeWidth: 40,
  pipeGap: 120,
  dx: 2 // speed of pipes
};

let flappyInitialized = false;
function initFlappyGame() {
  flappyGame.canvas = document.getElementById('flappy-canvas');
  if (!flappyGame.canvas) return;
  flappyGame.ctx = flappyGame.canvas.getContext('2d');

  if (flappyInitialized) return;
  flappyInitialized = true;

  const startBtn = document.getElementById('flappy-start-btn');
  if (startBtn) {
    const handleStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startFlappyGame();
    };
    startBtn.addEventListener('pointerdown', handleStart);
    startBtn.addEventListener('click', handleStart);
  }

  const tapBtn = document.getElementById('flappy-tap-btn');
  if (tapBtn) {
    const handleTap = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!flappyGame.running) {
        startFlappyGame();
      } else {
        handleFlappyJump();
      }
    };
    tapBtn.addEventListener('pointerdown', handleTap);
    tapBtn.addEventListener('click', handleTap);
  }

  const overlay = document.getElementById('flappy-overlay');
  if (overlay) overlay.style.display = 'flex';

  const handleCanvasTap = (e) => {
    e.preventDefault();
    if (!flappyGame.running) {
      if (document.getElementById('flappy-overlay')?.style.display !== 'none') {
        startFlappyGame();
      }
    } else {
      handleFlappyJump();
    }
  };

  flappyGame.canvas.addEventListener('pointerdown', handleCanvasTap);
  flappyGame.canvas.addEventListener('touchstart', handleCanvasTap, { passive: false });
  flappyGame.canvas.addEventListener('mousedown', handleCanvasTap);

  document.addEventListener('keydown', handleFlappyInput);
}

function startFlappyGame() {
  flappyGame.running = true;
  flappyGame.paused = false;
  flappyGame.score = 0;
  flappyGame.frames = 0;
  flappyGame.pipes = [];
  
  flappyGame.bird.y = 150;
  flappyGame.bird.velocity = 0;

  document.getElementById('flappy-score').textContent = '0';
  document.getElementById('flappy-overlay').style.display = 'none';

  if (flappyGame.req) cancelAnimationFrame(flappyGame.req);
  flappyLoop();
}

function stopFlappyGame(msg) {
  flappyGame.running = false;
  cancelAnimationFrame(flappyGame.req);
  const overlay = document.getElementById('flappy-overlay');
  const title = document.getElementById('flappy-overlay-title');
  const desc = document.getElementById('flappy-overlay-desc');
  if (overlay && title && desc) {
    title.textContent = 'GAME OVER';
    desc.textContent = msg || 'You hit something!';
    overlay.style.display = 'flex';
  }
}

function flappyLoop() {
  if (!flappyGame.running || flappyGame.paused) return;

  const ctx = flappyGame.ctx;
  const canvas = flappyGame.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  flappyGame.frames++;

  // Bird physics
  flappyGame.bird.velocity += flappyGame.bird.gravity;
  flappyGame.bird.y += flappyGame.bird.velocity;

  // Draw bird (simple yellow circle with eye)
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.arc(flappyGame.bird.x, flappyGame.bird.y, flappyGame.bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(flappyGame.bird.x + 4, flappyGame.bird.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(flappyGame.bird.x + 5, flappyGame.bird.y - 3, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e67e22'; // Beak
  ctx.beginPath();
  ctx.moveTo(flappyGame.bird.x + 8, flappyGame.bird.y);
  ctx.lineTo(flappyGame.bird.x + 15, flappyGame.bird.y + 2);
  ctx.lineTo(flappyGame.bird.x + 8, flappyGame.bird.y + 4);
  ctx.fill();

  // Floor collision
  if (flappyGame.bird.y + flappyGame.bird.radius >= canvas.height) {
    flappyGame.bird.y = canvas.height - flappyGame.bird.radius;
    stopFlappyGame('Fell down!');
    return;
  }
  // Ceiling collision (optional, can just block going too high)
  if (flappyGame.bird.y - flappyGame.bird.radius <= 0) {
    flappyGame.bird.y = flappyGame.bird.radius;
    flappyGame.bird.velocity = 0;
  }

  // Manage Pipes
  if (flappyGame.frames % 100 === 0) {
    // Generate new pipe
    const minHeight = 50;
    const maxHeight = canvas.height - flappyGame.pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    
    flappyGame.pipes.push({
      x: canvas.width,
      top: topHeight,
      bottom: topHeight + flappyGame.pipeGap,
      passed: false
    });
  }

  ctx.fillStyle = '#2ecc71';
  for (let i = 0; i < flappyGame.pipes.length; i++) {
    let p = flappyGame.pipes[i];
    p.x -= flappyGame.dx;

    // Draw Top Pipe
    ctx.fillRect(p.x, 0, flappyGame.pipeWidth, p.top);
    // Draw Bottom Pipe
    ctx.fillRect(p.x, p.bottom, flappyGame.pipeWidth, canvas.height - p.bottom);

    // Collision detection
    if (
      flappyGame.bird.x + flappyGame.bird.radius > p.x &&
      flappyGame.bird.x - flappyGame.bird.radius < p.x + flappyGame.pipeWidth
    ) {
      if (
        flappyGame.bird.y - flappyGame.bird.radius < p.top ||
        flappyGame.bird.y + flappyGame.bird.radius > p.bottom
      ) {
        stopFlappyGame('Hit a pipe!');
        return;
      }
    }

    // Score update
    if (p.x + flappyGame.pipeWidth < flappyGame.bird.x - flappyGame.bird.radius && !p.passed) {
      flappyGame.score++;
      p.passed = true;
      document.getElementById('flappy-score').textContent = flappyGame.score;
      if (flappyGame.score > flappyGame.highScore) {
        flappyGame.highScore = flappyGame.score;
        document.getElementById('flappy-high-score').textContent = flappyGame.highScore;
      }
    }
  }

  // Remove off-screen pipes
  if (flappyGame.pipes.length > 0 && flappyGame.pipes[0].x < -flappyGame.pipeWidth) {
    flappyGame.pipes.shift();
  }

  flappyGame.req = requestAnimationFrame(flappyLoop);
}

function handleFlappyJump() {
  if (!flappyGame.running || flappyGame.paused) return;
  flappyGame.bird.velocity = flappyGame.bird.jump;
}

function handleFlappyInput(e) {
  if (e.code === 'Space') {
    if (state.openWindows.has('flappy') && getWindow('flappy')?.style.display !== 'none') {
      e.preventDefault(); // Stop scrolling
      if (flappyGame.running && !flappyGame.paused) {
        handleFlappyJump();
      } else if (!flappyGame.running && document.getElementById('flappy-overlay').style.display !== 'none') {
        startFlappyGame();
      }
    }
  }
}

// (Flappy Bird init called in DOMContentLoaded & openApp)

// ─── FPS DUNGEON SHOOTER ───────────────────────────────────
// Textured raycaster (walls, floor and ceiling lit by a flickering torch)
// with enemies that hunt the player through the dungeon and fight back.

const SHOOTER_MAP = [
  '11111111111111111111',
  '10000000110000000001',
  '10000000110000000001',
  '10022000000000330001',
  '10020000000000030001',
  '10000001111110000001',
  '11101111000011110111',
  '10000010000001000001',
  '10000000000000000001',
  '10440010000001004401',
  '10040010000001004001',
  '10000000000000000001',
  '10000011100111000001',
  '11101110000001110111',
  '10000000000000000001',
  '10000300000000300001',
  '10003300022000330001',
  '10000000020000000001',
  '10000000000000000001',
  '11111111111111111111',
];

const SHOOTER_SPAWNS = [
  [3.5, 2.5], [16.5, 2.5], [10.5, 3.5], [2.5, 7.5], [17.5, 7.5], [10.5, 8.5],
  [4.5, 10.5], [15.5, 10.5], [10.5, 14.5], [16.5, 14.5], [5.5, 14.5], [17.5, 17.5],
];

const SHOOTER_PICKUPS = [
  { type: 'medkit', x: 10.5, y: 11.5 }, { type: 'medkit', x: 2.5, y: 4.5 }, { type: 'medkit', x: 17.5, y: 4.5 },
  { type: 'ammo', x: 7.5, y: 8.5 }, { type: 'ammo', x: 12.5, y: 17.5 }, { type: 'ammo', x: 17.5, y: 12.5 },
];

const SHOOTER_TYPES = {
  imp:    { hp: 60,  speed: 2.1,  radius: 0.3,  h: 0.82, melee: true, reach: 0.95, dmg: 9,  windup: 0.32, cooldown: 0.9, score: 100 },
  caster: { hp: 70,  speed: 1.5,  radius: 0.3,  h: 0.95, ranged: true, range: 11, dmg: 12, windup: 0.55, cooldown: 2.0,
            projSpeed: 5.5, keepMin: 3.2, keepMax: 6.5, score: 150, float: true },
  brute:  { hp: 220, speed: 1.25, radius: 0.42, h: 1.12, melee: true, reach: 1.15, dmg: 20, windup: 0.6, cooldown: 1.4, score: 300 },
};

const SHOOTER_WAVES = [
  { imp: 3, caster: 1, brute: 0 },
  { imp: 4, caster: 2, brute: 1 },
  { imp: 5, caster: 3, brute: 2 },
];

const shooterGame = {
  running: false, paused: false, req: null, lastT: 0,
  W: 480, H: 360, dpr: 1,      // canvas size in CSS pixels
  RW: 320, RH: 240,            // internal 3D render resolution
  map: [], player: null,
  enemies: [], projectiles: [], pickups: [], effects: [],
  keys: {}, mouseDown: false, touchFire: false, mouseLocked: false,
  wave: 0, waveTimer: 0, banner: null, ended: false,
  shake: 0, flashLight: 0, time: 0, hitMarker: 0, killMarker: 0,
  damageDirs: [], floaters: [],
  flow: null, flowTimer: 0,
  tex: null, sprites: null, audio: null, muted: false,
};

// ─────────────────────────────── Procedural art ────────────
function shooterHash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Tileable value noise over a 64px texture
function shooterNoise(x, y, cell, seed) {
  const n = 64 / cell;
  const gx = x / cell, gy = y / cell;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const fx = gx - x0, fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const h = (i, j) => shooterHash(((i % n) + n) % n, ((j % n) + n) % n, seed);
  const a = h(x0, y0), b = h(x0 + 1, y0), c = h(x0, y0 + 1), d = h(x0 + 1, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function shooterMakeTexture(fn) {
  const r = new Uint8ClampedArray(4096), g = new Uint8ClampedArray(4096), b = new Uint8ClampedArray(4096);
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const c = fn(x, y), i = y * 64 + x;
      r[i] = c[0]; g[i] = c[1]; b[i] = c[2];
    }
  }
  return { r, g, b };
}

function shooterBrick(x, y, base, seed, moss) {
  const row = y >> 3;
  const bx = (x + ((row & 1) ? 8 : 0)) & 63;
  const by = y & 7, bxx = bx & 15;
  if (by === 0 || bxx === 0) return [base[0] * 0.3, base[1] * 0.3, base[2] * 0.3];
  const id = row * 8 + (bx >> 4);
  let k = (0.72 + shooterHash(id, row, seed + 7) * 0.35) * (0.78 + shooterNoise(x, y, 8, seed) * 0.3 + shooterHash(x, y, seed) * 0.16);
  if (by === 1) k *= 1.2; else if (by === 7) k *= 0.78;
  if (bxx === 1) k *= 1.1; else if (bxx === 15) k *= 0.82;
  let r = base[0] * k, g = base[1] * k, b = base[2] * k;
  if (moss) {
    const m = shooterNoise(x, y, 16, seed + 3);
    if (m > 0.52) {
      const t = Math.min(1, (m - 0.52) * 2.6);
      r = r * (1 - t) + 38 * t * k; g = g * (1 - t) + 92 * t * k; b = b * (1 - t) + 34 * t * k;
    }
  }
  return [r, g, b];
}

function shooterBuildTextures() {
  return {
    walls: [
      null,
      shooterMakeTexture((x, y) => shooterBrick(x, y, [150, 132, 118], 1, false)),   // stone brick
      shooterMakeTexture((x, y) => shooterBrick(x, y, [128, 112, 96], 5, true)),     // mossy brick
      shooterMakeTexture((x, y) => {                                                 // riveted metal
        const sx = x & 31, sy = y & 31;
        const rivet = (sx === 4 || sx === 27) && (sy === 4 || sy === 27);
        let k = (0.8 + shooterNoise(x, y, 4, 11) * 0.2 + shooterHash(x, y, 12) * 0.1) * (0.92 + 0.08 * Math.sin(y * 0.7));
        if (sx === 0 || sy === 0) k = 0.3; else if (rivet) k = 1.45; else if (sx === 1 || sy === 1) k *= 1.22;
        let r = 78 * k, g = 88 * k, b = 102 * k;
        const rust = shooterNoise(x, y, 16, 13);
        if (rust > 0.6) { const t = Math.min(1, (rust - 0.6) * 2.5); r = r * (1 - t) + 120 * t * k; g = g * (1 - t) + 62 * t * k; b = b * (1 - t) + 34 * t * k; }
        return [r, g, b];
      }),
      shooterMakeTexture((x, y) => {                                                 // wooden planks
        const plank = x >> 4, px = x & 15;
        const grain = Math.sin((y + shooterHash(plank, 0, 21) * 64) * 0.33 + shooterNoise(x, y, 8, 22) * 6) * 0.5 + 0.5;
        let k = 0.62 + grain * 0.24 + shooterHash(plank, 1, 23) * 0.2 + shooterHash(x, y, 24) * 0.07;
        if (px === 0) k = 0.28; else if (px === 1) k *= 1.15;
        if ((y & 31) === 10 && px > 3 && px < 12) k *= 0.55; // iron band
        return [128 * k, 80 * k, 44 * k];
      }),
    ],
    floor: shooterMakeTexture((x, y) => {
      const tx = x & 31, ty = y & 31;
      let k = 0.7 + shooterNoise(x, y, 8, 31) * 0.3 + shooterHash(x, y, 32) * 0.12 + shooterHash((x >> 5) + (y >> 5) * 2, 0, 33) * 0.15;
      if (tx === 0 || ty === 0) k = 0.28;
      else if (tx === 1 || ty === 1) k *= 1.12;
      else if (tx === 31 || ty === 31) k *= 0.84;
      if (Math.abs(shooterNoise(x, y, 16, 34) - 0.5) < 0.025) k *= 0.55;
      return [92 * k, 84 * k, 76 * k];
    }),
    ceil: shooterMakeTexture((x, y) => {
      let k = 0.6 + shooterNoise(x, y, 8, 41) * 0.3 + shooterHash(x, y, 42) * 0.1;
      if ((y & 31) < 6) { k *= (y & 31) === 0 ? 0.3 : 0.62; return [74 * k, 52 * k, 36 * k]; }
      if ((x & 15) === 0) k *= 0.5;
      return [60 * k, 46 * k, 36 * k];
    }),
  };
}

// Sprite = 64x64 packed pixels. Alpha 255 = lit by the torch, 254 = glows (emissive).
function shooterSprite(draw) {
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = 64; return c; };
  const a = mk(), b = mk();
  const ca = a.getContext('2d', { willReadFrequently: true }), cb = b.getContext('2d', { willReadFrequently: true });
  draw(ca, cb);
  const da = ca.getImageData(0, 0, 64, 64).data, db = cb.getImageData(0, 0, 64, 64).data;
  const out = new Uint32Array(4096);
  for (let i = 0; i < 4096; i++) {
    const j = i * 4;
    if (db[j + 3] > 100) out[i] = ((254 << 24) | (db[j + 2] << 16) | (db[j + 1] << 8) | db[j]) >>> 0;
    else if (da[j + 3] > 110) out[i] = ((255 << 24) | (da[j + 2] << 16) | (da[j + 1] << 8) | da[j]) >>> 0;
  }
  return out;
}

const sCircle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
const sEllipse = (c, x, y, rx, ry) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
const sTri = (c, a, b, d, e, f, g) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, g); c.closePath(); c.fill(); };
const sPoly = (c, pts) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
const sLimb = (c, x1, y1, x2, y2, w, color) => {
  c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
};
const sClaws = (c, x, y, down) => {
  c.fillStyle = '#f2ead6';
  for (let i = 0; i < 3; i++) {
    const cx = x - 3 + i * 3;
    if (down) sTri(c, cx - 1, y, cx, y + 5, cx + 1, y); else sTri(c, cx - 1, y, cx, y - 6, cx + 1, y);
  }
};

function drawImpSprite(c, em, f) {
  if (f === 3) {
    c.fillStyle = 'rgba(96,12,8,1)'; sEllipse(c, 32, 59, 27, 4);
    c.fillStyle = '#5a1a12'; sEllipse(c, 30, 55, 18, 5);
    c.fillStyle = '#8b2e1f'; sEllipse(c, 25, 53, 12, 4); sCircle(c, 46, 53, 6);
    c.fillStyle = '#e8d8b0'; sTri(c, 47, 48, 53, 42, 51, 50);
    return;
  }
  const atk = f === 2, step = f === 1 ? 1 : -1;
  c.fillStyle = '#4a150e';
  c.fillRect(24 + step * 2, 44, 6, 15); c.fillRect(34 - step * 2, 44, 6, 15);
  c.fillStyle = '#2a0a06';
  c.fillRect(22 + step * 2, 58, 9, 5); c.fillRect(33 - step * 2, 58, 9, 5);
  const g = c.createRadialGradient(27, 29, 2, 32, 35, 17);
  g.addColorStop(0, '#d0634a'); g.addColorStop(0.6, '#8b2e1f'); g.addColorStop(1, '#4a150e');
  c.fillStyle = g; sEllipse(c, 32, 35, 13, 13);
  c.strokeStyle = 'rgba(40,8,4,0.6)'; c.lineWidth = 1;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(26, 33 + i * 4); c.quadraticCurveTo(32, 36 + i * 4, 38, 33 + i * 4); c.stroke(); }
  if (atk) {
    sLimb(c, 21, 28, 9, 9, 6, '#7a2818'); sLimb(c, 43, 28, 55, 9, 6, '#7a2818');
    sClaws(c, 9, 8, false); sClaws(c, 55, 8, false);
  } else {
    sLimb(c, 20, 30, 14, 45 + step, 5, '#7a2818'); sLimb(c, 44, 30, 50, 45 - step, 5, '#7a2818');
    sClaws(c, 14, 47 + step, true); sClaws(c, 50, 47 - step, true);
  }
  const hg = c.createRadialGradient(29, 13, 1, 32, 17, 11);
  hg.addColorStop(0, '#d8735a'); hg.addColorStop(1, '#6e2416');
  c.fillStyle = hg; sCircle(c, 32, 17, 10);
  c.fillStyle = '#e8d8b0'; sTri(c, 24, 12, 17, 0, 28, 9); sTri(c, 40, 12, 47, 0, 36, 9);
  c.fillStyle = '#1a0402'; sEllipse(c, 32, 23, atk ? 6 : 5, atk ? 4 : 2);
  c.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) sTri(c, 28 + i * 2.6, 21.5, 29.3 + i * 2.6, 24, 30.6 + i * 2.6, 21.5);
  em.fillStyle = atk ? '#ff6a2a' : '#ffd84a';
  sEllipse(em, 28, 15, 2.6, 1.8); sEllipse(em, 36, 15, 2.6, 1.8);
}

function drawCasterSprite(c, em, f) {
  if (f === 3) {
    c.fillStyle = '#1c0f30'; sEllipse(c, 32, 59, 24, 4);
    c.fillStyle = '#3b2163'; sPoly(c, [10, 60, 20, 50, 32, 46, 44, 51, 54, 60]);
    c.fillStyle = '#d9cbb5'; sCircle(c, 44, 57, 2.5);
    return;
  }
  const atk = f === 2, s = f === 1 ? 1.5 : -1.5;
  const g = c.createLinearGradient(18, 6, 46, 62);
  g.addColorStop(0, '#7b4cc0'); g.addColorStop(1, '#25133f');
  c.fillStyle = g;
  sPoly(c, [32 + s * 0.3, 5, 44, 12, 47 + s, 34, 50 + s, 58, 45 + s, 52, 41 + s, 59, 36 + s, 53, 32 + s, 60,
            28 + s, 53, 23 + s, 59, 19 + s, 52, 14 + s, 58, 17 + s, 34, 20, 12]);
  c.strokeStyle = '#c9a54a'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(21 + s * 0.5, 31); c.quadraticCurveTo(32, 36, 43 + s * 0.5, 31); c.stroke();
  c.fillStyle = '#0b0512'; sEllipse(c, 32 + s * 0.3, 18, 7, 8.5);
  em.fillStyle = '#86f7ff';
  sEllipse(em, 29.4 + s * 0.3, 18, 1.7, 1.2); sEllipse(em, 34.6 + s * 0.3, 18, 1.7, 1.2);
  c.fillStyle = '#d9cbb5';
  if (atk) {
    sLimb(c, 22, 28, 20, 12, 4, '#5b358f'); sLimb(c, 42, 28, 44, 12, 4, '#5b358f');
    sCircle(c, 20, 11, 3); sCircle(c, 44, 11, 3);
    const og = em.createRadialGradient(32, 7, 0, 32, 7, 9);
    og.addColorStop(0, '#ffffff'); og.addColorStop(0.4, '#ff7be6'); og.addColorStop(1, 'rgba(180,40,255,0)');
    em.fillStyle = og; sCircle(em, 32, 7, 9);
  } else {
    sLimb(c, 43 + s, 28, 45 + s, 36, 4, '#5b358f');
    sCircle(c, 45 + s, 37, 3);
    const og = em.createRadialGradient(46 + s, 32, 0, 46 + s, 32, 5);
    og.addColorStop(0, '#ffffff'); og.addColorStop(0.5, '#ff7be6'); og.addColorStop(1, 'rgba(180,40,255,0)');
    em.fillStyle = og; sCircle(em, 46 + s, 32, 5);
  }
}

function drawBruteSprite(c, em, f) {
  if (f === 3) {
    c.fillStyle = '#26301a'; sEllipse(c, 32, 59, 30, 5);
    c.fillStyle = '#5d6b3a'; sEllipse(c, 30, 54, 22, 7);
    c.fillStyle = '#6b4a2a'; c.fillRect(44, 55, 18, 5);
    return;
  }
  const atk = f === 2, step = f === 1 ? 1 : -1;
  c.fillStyle = '#3c4526';
  c.fillRect(18 + step * 2, 44, 11, 17); c.fillRect(35 - step * 2, 44, 11, 17);
  c.fillStyle = '#20261a'; c.fillRect(16 + step * 2, 59, 14, 5); c.fillRect(34 - step * 2, 59, 14, 5);
  const g = c.createRadialGradient(26, 26, 3, 32, 34, 22);
  g.addColorStop(0, '#9aab64'); g.addColorStop(0.55, '#5d6b3a'); g.addColorStop(1, '#2c3520');
  c.fillStyle = g; sEllipse(c, 32, 33, 20, 16);
  c.fillStyle = 'rgba(214,200,150,0.35)'; sEllipse(c, 32, 38, 11, 9);
  c.fillStyle = '#5a3b22'; c.fillRect(21, 44, 22, 7);
  const club = (x1, y1, x2, y2) => {
    sLimb(c, x1, y1, x2, y2, 6, '#6b4a2a');
    c.fillStyle = '#8d8d8d';
    const dx = x2 - x1, dy = y2 - y1;
    for (let i = 0; i < 3; i++) {
      const t = 0.55 + i * 0.2, px = x1 + dx * t, py = y1 + dy * t;
      sTri(c, px - 2, py, px + (dy > 0 ? 5 : -5), py - 1, px + 2, py + 2);
    }
  };
  if (atk) {
    sLimb(c, 46, 25, 52, 9, 8, '#4f5c31'); club(52, 9, 40, -2);
    sLimb(c, 18, 27, 10, 36, 8, '#4f5c31');
  } else {
    sLimb(c, 48, 27, 53, 42, 8, '#4f5c31'); club(53, 43, 58, 63);
    sLimb(c, 16, 27, 12, 43, 8, '#4f5c31');
  }
  const hg = c.createRadialGradient(30, 11, 1, 32, 14, 9);
  hg.addColorStop(0, '#a8b874'); hg.addColorStop(1, '#4a5630');
  c.fillStyle = hg; sCircle(c, 32, 14, 8);
  c.fillStyle = '#1a1208'; sEllipse(c, 32, 19, atk ? 4.5 : 4, atk ? 2.6 : 1.5);
  c.fillStyle = '#f1ead2'; sTri(c, 27.5, 19, 28.8, 13.5, 30, 19); sTri(c, 34, 19, 35.2, 13.5, 36.5, 19);
  em.fillStyle = '#ff3b2f'; sEllipse(em, 29, 12, 1.8, 1.3); sEllipse(em, 35, 12, 1.8, 1.3);
}

function shooterBuildSprites() {
  const frames = draw => [0, 1, 2, 3].map(f => shooterSprite((c, em) => draw(c, em, f)));
  const glowBall = (r, core, mid) => shooterSprite((c, em) => {
    const g = em.createRadialGradient(32, 32, 0, 32, 32, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, core); g.addColorStop(0.8, mid); g.addColorStop(1, 'rgba(0,0,0,0)');
    em.fillStyle = g; sCircle(em, 32, 32, r);
  });
  return {
    imp: frames(drawImpSprite),
    caster: frames(drawCasterSprite),
    brute: frames(drawBruteSprite),
    fireball: [glowBall(18, '#ffe08a', '#ff5a1a'), glowBall(15, '#fff0b0', '#ff3a7a')],
    boom: [glowBall(14, '#fff2a8', '#ff8a1a'), glowBall(22, '#ffd060', '#ff4a10'), glowBall(30, '#ff9a3a', '#a01a08')],
    spark: shooterSprite((c, em) => {
      em.fillStyle = '#fff3b0';
      sPoly(em, [32, 22, 34, 30, 42, 32, 34, 34, 32, 42, 30, 34, 22, 32, 30, 30]);
    }),
    blood: shooterSprite(c => {
      c.fillStyle = '#9a0f0f';
      for (let i = 0; i < 9; i++) sCircle(c, 32 + Math.cos(i * 2.4) * (6 + (i % 3) * 4), 32 + Math.sin(i * 2.4) * (5 + (i % 2) * 5), 3 - (i % 3) * 0.6);
    }),
    medkit: shooterSprite(c => {
      c.fillStyle = '#d9d9d9'; c.fillRect(16, 36, 32, 26);
      c.fillStyle = '#f5f5f5'; c.fillRect(16, 36, 32, 5);
      c.fillStyle = '#9a9a9a'; c.fillRect(16, 58, 32, 4);
      c.fillStyle = '#d42a2a'; c.fillRect(29, 41, 6, 16); c.fillRect(24, 46, 16, 6);
      c.fillStyle = '#6b6b6b'; c.fillRect(27, 32, 10, 4);
    }),
    ammo: shooterSprite(c => {
      c.fillStyle = '#4d5a2b'; c.fillRect(14, 42, 36, 20);
      c.fillStyle = '#65743a'; c.fillRect(14, 42, 36, 4);
      c.fillStyle = '#2f381a'; c.fillRect(14, 59, 36, 3);
      for (let i = 0; i < 5; i++) {
        c.fillStyle = '#c9a032'; c.fillRect(18 + i * 6, 32, 4, 11);
        c.fillStyle = '#e8c45a'; sTri(c, 18 + i * 6, 32, 20 + i * 6, 27, 22 + i * 6, 32);
      }
      c.fillStyle = '#e8d070'; c.font = 'bold 8px monospace'; c.fillText('AMMO', 22, 56);
    }),
  };
}

// ─────────────────────────────── Sound ─────────────────────
function shooterSfx(type) {
  const g = shooterGame;
  if (g.muted) return;
  try {
    if (!g.audio) g.audio = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { return; }
  const ac = g.audio;
  if (ac.state === 'suspended') ac.resume();
  const t = ac.currentTime;
  const tone = (wave, f0, f1, dur, vol) => {
    const o = ac.createOscillator(), v = ac.createGain();
    o.type = wave; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(v); v.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  };
  const noise = (dur, vol, freq, kind = 'lowpass', delay = 0) => {
    const len = Math.max(1, (ac.sampleRate * dur) | 0);
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), v = ac.createGain();
    s.buffer = buf; fl.type = kind; fl.frequency.value = freq; v.gain.value = vol;
    s.connect(fl); fl.connect(v); v.connect(ac.destination); s.start(t + delay);
  };
  switch (type) {
    case 'shot': noise(0.14, 0.32, 2200); tone('square', 150, 45, 0.09, 0.12); break;
    case 'hit': tone('triangle', 700, 220, 0.07, 0.08); break;
    case 'kill': tone('sawtooth', 320, 60, 0.35, 0.08); noise(0.2, 0.12, 700); break;
    case 'hurt': tone('sawtooth', 160, 70, 0.22, 0.14); noise(0.12, 0.15, 900, 'bandpass'); break;
    case 'fireball': tone('sine', 240, 620, 0.25, 0.06); break;
    case 'boom': noise(0.28, 0.2, 600); break;
    case 'pickup': tone('sine', 660, 1100, 0.14, 0.1); break;
    case 'reload': noise(0.04, 0.2, 3000, 'highpass'); noise(0.05, 0.22, 2500, 'highpass', 0.9); break;
    case 'empty': noise(0.03, 0.15, 4000, 'highpass'); break;
    case 'growl': tone('sawtooth', 95, 55, 0.35, 0.06); break;
    case 'swipe': noise(0.12, 0.16, 1200, 'bandpass'); break;
  }
}

// ─────────────────────────────── Init ──────────────────────
let shooterInitialized = false;

function shooterIsActive() {
  return shooterGame.running && !shooterGame.paused && state.focusedWin === getWindow('shooter');
}

function shooterTryShoot() {
  const p = shooterGame.player;
  if (!p || !shooterGame.running || shooterGame.paused) return;
  if (p.reloadT > 0 || p.fireCd > 0) return;
  if (p.mag <= 0) {
    if (p.reserve > 0) shooterStartReload(); else { shooterSfx('empty'); p.fireCd = 0.3; }
    return;
  }
  shooterShoot();
}

function shooterLockPointer(canvas) {
  // requestPointerLock returns a promise in newer browsers; ignore refusals (drag-to-look still works)
  try {
    const r = canvas.requestPointerLock();
    if (r && typeof r.catch === 'function') r.catch(() => {});
  } catch (e) {}
}

function initShooterGame() {
  const canvas = document.getElementById('shooter-canvas');
  if (!canvas) return;
  if (shooterInitialized) return;
  shooterInitialized = true;

  const startBtn = document.getElementById('shooter-start-btn');
  if (startBtn) {
    let lastStart = 0;
    const handleStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (performance.now() - lastStart < 500) return; // pointerdown + click fire together
      lastStart = performance.now();
      startShooterGame();
    };
    startBtn.addEventListener('pointerdown', handleStart);
    startBtn.addEventListener('click', handleStart);
  }

  // Mouse: hold to fire. Without pointer lock, drag with the button held to look around.
  canvas.addEventListener('mousedown', (e) => {
    if (!shooterGame.running || shooterGame.paused || e.button !== 0) return;
    if (window.innerWidth > 768 && document.pointerLockElement !== canvas) {
      shooterLockPointer(canvas);
    }
    shooterGame.mouseDown = true;
    shooterTryShoot();
  });
  canvas.addEventListener('mousemove', (e) => {
    if (shooterGame.mouseLocked || !shooterGame.mouseDown || !shooterGame.running || shooterGame.paused) return;
    shooterGame.player.angle += e.movementX * 0.005;
  });
  document.addEventListener('mouseup', () => { shooterGame.mouseDown = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // Touch: drag to look, tap to shoot
  let touchStartX = 0, lastTouchX = 0, dragging = false;
  canvas.addEventListener('touchstart', (e) => {
    if (!shooterGame.running || shooterGame.paused || !e.touches[0]) return;
    touchStartX = lastTouchX = e.touches[0].clientX;
    dragging = false;
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (!shooterGame.running || shooterGame.paused || !e.touches[0]) return;
    e.preventDefault();
    const x = e.touches[0].clientX;
    shooterGame.player.angle += (x - lastTouchX) * 0.008;
    lastTouchX = x;
    if (Math.abs(x - touchStartX) > 8) dragging = true;
  }, { passive: false });
  canvas.addEventListener('touchend', () => {
    if (!dragging) shooterTryShoot();
  }, { passive: true });

  // On-screen buttons: each one holds a key while pressed
  const holdKey = (id, key) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const press = (e) => { e.preventDefault(); e.stopPropagation(); shooterGame.keys[key] = true; };
    const release = (e) => { e.preventDefault(); shooterGame.keys[key] = false; };
    btn.addEventListener('pointerdown', press);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, release));
  };
  holdKey('sbtn-up', 'w'); holdKey('sbtn-down', 's');
  holdKey('sbtn-left', 'a'); holdKey('sbtn-right', 'd');
  holdKey('sbtn-turn-left', 'arrowleft'); holdKey('sbtn-turn-right', 'arrowright');

  const fireBtn = document.getElementById('sbtn-fire');
  if (fireBtn) {
    fireBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      shooterGame.touchFire = true;
      shooterTryShoot();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
      fireBtn.addEventListener(ev, () => { shooterGame.touchFire = false; }));
  }

  document.addEventListener('pointerlockchange', () => {
    shooterGame.mouseLocked = document.pointerLockElement === canvas;
    if (shooterGame.mouseLocked) document.addEventListener('mousemove', shooterMouseMove);
    else document.removeEventListener('mousemove', shooterMouseMove);
  });

  document.addEventListener('keydown', shooterKeyDown);
  document.addEventListener('keyup', e => { shooterGame.keys[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => {
    shooterGame.keys = {};
    shooterGame.mouseDown = false;
    shooterGame.touchFire = false;
  });
}

function shooterMouseMove(e) {
  if (!shooterGame.running || shooterGame.paused) return;
  shooterGame.player.angle += e.movementX * 0.0026;
}

function shooterKeyDown(e) {
  // Only steal keys while the shooter window is the focused one
  if (!shooterIsActive()) return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key.toLowerCase();
  shooterGame.keys[k] = true;
  if (k === 'r') shooterStartReload();
  if (k === 'm') shooterGame.muted = !shooterGame.muted;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(k)) e.preventDefault();
}

// ─────────────────────────────── Start / Stop ──────────────
function startShooterGame() {
  const canvas = document.getElementById('shooter-canvas');
  if (!canvas) return;
  const g = shooterGame;
  document.getElementById('shooter-overlay').style.display = 'none';

  if (!g.tex) g.tex = shooterBuildTextures();
  if (!g.sprites) g.sprites = shooterBuildSprites();
  g.map = SHOOTER_MAP.map(row => row.split('').map(Number));
  g.player = {
    x: 2.5, y: 17.5, angle: -Math.PI / 2, vx: 0, vy: 0,
    hp: 100, mag: 30, magSize: 30, reserve: 120,
    reloadT: 0, RELOAD: 1.35, fireCd: 0,
    bob: 0, bobZ: 0, moveAmt: 0, recoil: 0, spread: 0, pitchKick: 0,
    hurtT: 0, score: 0, kills: 0,
  };
  g.enemies = []; g.projectiles = []; g.effects = []; g.floaters = []; g.damageDirs = [];
  g.pickups = SHOOTER_PICKUPS.map(p => ({ ...p, taken: false }));
  g.wave = 0; g.waveTimer = 0; g.ended = false; g.banner = null;
  g.shake = 0; g.flashLight = 0; g.time = 0; g.hitMarker = 0; g.killMarker = 0;
  g.keys = {}; g.mouseDown = false; g.touchFire = false;
  g.flow = null; g.flowTimer = 0;

  resizeShooterCanvas();
  shooterNextWave();
  shooterSfx('pickup');

  g.running = true;
  g.paused = false;
  g.lastT = 0;
  bringToFront(getWindow('shooter'));
  if (window.innerWidth > 768) {
    shooterLockPointer(canvas);
  }
  if (g.req) cancelAnimationFrame(g.req);
  g.req = requestAnimationFrame(shooterLoop);
}

function stopShooterGame(msg) {
  const g = shooterGame;
  g.running = false;
  cancelAnimationFrame(g.req);
  if (document.pointerLockElement) document.exitPointerLock();
  const overlay = document.getElementById('shooter-overlay');
  if (overlay) {
    const t = document.getElementById('shooter-overlay-title');
    const d = document.getElementById('shooter-overlay-desc');
    const b = document.getElementById('shooter-start-btn');
    const p = g.player;
    if (t) t.textContent = msg || 'GAME OVER';
    if (d) d.textContent = `Score ${p.score} · Wave ${g.wave}/${SHOOTER_WAVES.length} · ${p.kills} kills`;
    if (b) b.textContent = 'PLAY AGAIN';
    overlay.style.display = 'flex';
  }
}

function shooterNextWave() {
  const g = shooterGame, p = g.player;
  const def = SHOOTER_WAVES[g.wave];
  if (!def) return;
  g.wave++;
  // Spawn far from the player, preferring spots out of sight
  const spots = SHOOTER_SPAWNS
    .map(([x, y]) => ({ x, y, d: Math.hypot(x - p.x, y - p.y), seen: shooterLOS(x, y, p.x, p.y) }))
    .filter(s => s.d > 5)
    .sort((a, b) => (a.seen - b.seen) || (b.d - a.d));
  const list = [];
  Object.entries(def).forEach(([type, n]) => { for (let i = 0; i < n; i++) list.push(type); });
  list.forEach((type, i) => {
    const s = spots[i % spots.length];
    const T = SHOOTER_TYPES[type];
    g.enemies.push({
      type, x: s.x + (Math.random() - 0.5) * 0.3, y: s.y + (Math.random() - 0.5) * 0.3,
      hp: T.hp, maxHp: T.hp, dead: false, deadT: 0,
      awake: g.wave > 1, state: 'chase', windT: 0, cool: 1 + Math.random(),
      hurtT: 0, animT: Math.random() * 3, moving: false, atkShow: 0,
      strafe: Math.random() < 0.5 ? 1 : -1, strafeT: 0,
    });
  });
  g.banner = { text: `WAVE ${g.wave}`, sub: g.wave === 1 ? 'Hunt them down' : 'They know where you are', t: 0, life: 2.6 };
}

// ─────────────────────────────── Game Loop ─────────────────
function shooterLoop(ts) {
  const g = shooterGame;
  if (!g.running || g.paused) return;
  let dt = g.lastT ? (ts - g.lastT) / 1000 : 1 / 60;
  if (!(dt > 0) || dt > 0.1) dt = 1 / 60;   // after a pause/tab switch
  g.lastT = ts;
  resizeShooterCanvas();
  shooterUpdate(dt);
  if (g.running) shooterRender();
  if (g.running) g.req = requestAnimationFrame(shooterLoop);
}

// ─────────────────────────────── World helpers ─────────────
function shooterIsWall(x, y) {
  const row = shooterGame.map[Math.floor(y)];
  return !row || (row[Math.floor(x)] || 0) > 0;
}

function shooterLOS(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
  const steps = Math.ceil(d / 0.15);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (shooterIsWall(ax + dx * t, ay + dy * t)) return false;
  }
  return true;
}

// Move a circle of radius r, sliding along walls
function shooterMoveCircle(o, vx, vy, r) {
  const nx = o.x + vx;
  if (!shooterIsWall(nx + Math.sign(vx) * r, o.y - r * 0.8) && !shooterIsWall(nx + Math.sign(vx) * r, o.y + r * 0.8)) o.x = nx;
  const ny = o.y + vy;
  if (!shooterIsWall(o.x - r * 0.8, ny + Math.sign(vy) * r) && !shooterIsWall(o.x + r * 0.8, ny + Math.sign(vy) * r)) o.y = ny;
}

// Distance field from the player's tile, so enemies can path around walls
function shooterUpdateFlow() {
  const g = shooterGame, map = g.map, rows = map.length, cols = map[0].length;
  if (!g.flow) g.flow = new Int16Array(rows * cols);
  const dist = g.flow;
  dist.fill(-1);
  const q = new Int32Array(rows * cols);
  let head = 0, tail = 0;
  const start = Math.floor(g.player.y) * cols + Math.floor(g.player.x);
  dist[start] = 0; q[tail++] = start;
  while (head < tail) {
    const cur = q[head++], cx = cur % cols, cy = (cur / cols) | 0;
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [ox, oy] of nb) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || map[ny][nx] > 0) continue;
      const ni = ny * cols + nx;
      if (dist[ni] !== -1) continue;
      dist[ni] = dist[cur] + 1;
      q[tail++] = ni;
    }
  }
}

function shooterFlowTarget(e) {
  const g = shooterGame, map = g.map, cols = map[0].length;
  const cx = Math.floor(e.x), cy = Math.floor(e.y);
  const here = g.flow[cy * cols + cx];
  if (here <= 0) return { x: g.player.x, y: g.player.y };
  let best = null, bestD = here;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      if (!ox && !oy) continue;
      const nx = cx + ox, ny = cy + oy;
      if (!map[ny] || map[ny][nx] > 0) continue;
      if (ox && oy && (map[cy][nx] > 0 || map[ny][cx] > 0)) continue; // no corner cutting
      const d = g.flow[ny * cols + nx];
      if (d >= 0 && d < bestD) { bestD = d; best = { x: nx + 0.5, y: ny + 0.5 }; }
    }
  }
  return best || { x: g.player.x, y: g.player.y };
}

function shooterDamagePlayer(dmg, srcX, srcY) {
  const g = shooterGame, p = g.player;
  if (g.ended) return;
  p.hp = Math.max(0, p.hp - dmg);
  p.hurtT = 0.45;
  g.shake = Math.min(1, g.shake + dmg / 25);
  g.damageDirs.push({ a: Math.atan2(srcY - p.y, srcX - p.x), t: 1.2 });
  shooterSfx('hurt');
  if (p.hp <= 0) {
    g.ended = true;
    setTimeout(() => stopShooterGame('YOU DIED 💀'), 700);
  }
}

function shooterAlert(x, y, radius) {
  for (const e of shooterGame.enemies) {
    if (!e.dead && !e.awake && Math.hypot(e.x - x, e.y - y) < radius) e.awake = true;
  }
}

function shooterStartReload() {
  const p = shooterGame.player;
  if (!p || p.reloadT > 0 || p.mag >= p.magSize || p.reserve <= 0) return;
  p.reloadT = p.RELOAD;
  shooterSfx('reload');
}

function shooterFloat(text, color) {
  shooterGame.floaters.push({ text, color, t: 0 });
}

// ─────────────────────────────── Update ────────────────────
function shooterUpdate(dt) {
  const g = shooterGame, p = g.player, keys = g.keys;
  g.time += dt;

  // ── Player movement (smoothed, frame-rate independent)
  const active = !g.ended;
  const turn = ((keys['arrowright'] || keys['e']) ? 1 : 0) - ((keys['arrowleft'] || keys['q']) ? 1 : 0);
  if (active) p.angle += turn * 2.6 * dt;
  const fwd = ((keys['w'] || keys['arrowup']) ? 1 : 0) - ((keys['s'] || keys['arrowdown']) ? 1 : 0);
  const side = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
  const dirX = Math.cos(p.angle), dirY = Math.sin(p.angle);
  let wx = (dirX * fwd - dirY * side), wy = (dirY * fwd + dirX * side);
  const wl = Math.hypot(wx, wy);
  const speed = keys['shift'] ? 4.6 : 3.1;
  if (wl > 0 && active) { wx = wx / wl * speed; wy = wy / wl * speed; } else { wx = 0; wy = 0; }
  const accel = 1 - Math.exp(-dt * 12);
  p.vx += (wx - p.vx) * accel; p.vy += (wy - p.vy) * accel;
  shooterMoveCircle(p, p.vx * dt, p.vy * dt, 0.24);
  const spd = Math.hypot(p.vx, p.vy);
  p.moveAmt += ((spd > 0.3 ? 1 : 0) - p.moveAmt) * Math.min(1, dt * 8);
  p.bob += dt * spd * 2.6;
  p.bobZ = Math.sin(p.bob * 2) * 0.014 * p.moveAmt;

  // ── Weapon
  p.fireCd = Math.max(0, p.fireCd - dt);
  p.recoil = Math.max(0, p.recoil - dt * 6);
  p.spread = Math.max(0, p.spread - dt * 2.5);
  p.pitchKick *= Math.exp(-dt * 12);
  if (p.reloadT > 0) {
    p.reloadT -= dt;
    if (p.reloadT <= 0) {
      const take = Math.min(p.magSize - p.mag, p.reserve);
      p.mag += take; p.reserve -= take; p.reloadT = 0;
    }
  }
  if ((keys[' '] || g.mouseDown || g.touchFire) && active) shooterTryShoot();
  if (p.mag === 0 && p.reserve > 0 && p.reloadT <= 0 && active) shooterStartReload();

  // ── Timers & FX
  p.hurtT = Math.max(0, p.hurtT - dt);
  g.shake = Math.max(0, g.shake - dt * 2.5);
  g.flashLight = Math.max(0, g.flashLight - dt * 9);
  g.hitMarker = Math.max(0, g.hitMarker - dt);
  g.killMarker = Math.max(0, g.killMarker - dt);
  g.damageDirs = g.damageDirs.filter(d => (d.t -= dt) > 0);
  g.floaters = g.floaters.filter(f => (f.t += dt) < 1.2);
  g.effects = g.effects.filter(fx => (fx.t += dt) < fx.life);
  if (g.banner && (g.banner.t += dt) > g.banner.life) g.banner = null;

  // ── Enemies
  g.flowTimer -= dt;
  if (g.flowTimer <= 0 || !g.flow) { shooterUpdateFlow(); g.flowTimer = 0.25; }
  for (const e of g.enemies) shooterUpdateEnemy(e, dt);

  // Keep enemies from stacking on each other
  const alive = g.enemies.filter(e => !e.dead);
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i], b = alive[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
      const min = SHOOTER_TYPES[a.type].radius + SHOOTER_TYPES[b.type].radius;
      if (d < min) {
        const push = (min - d) / 2;
        shooterMoveCircle(a, -dx / d * push, -dy / d * push, SHOOTER_TYPES[a.type].radius);
        shooterMoveCircle(b, dx / d * push, dy / d * push, SHOOTER_TYPES[b.type].radius);
      }
    }
  }

  // ── Enemy projectiles
  for (const pr of g.projectiles) {
    const steps = 3;
    for (let s = 0; s < steps && !pr.done; s++) {
      pr.x += pr.vx * dt / steps; pr.y += pr.vy * dt / steps;
      if (shooterIsWall(pr.x, pr.y)) {
        pr.done = true;
        g.effects.push({ type: 'boom', x: pr.x - pr.vx * 0.02, y: pr.y - pr.vy * 0.02, z: 0.3, t: 0, life: 0.35 });
        if (Math.hypot(pr.x - p.x, pr.y - p.y) < 6) shooterSfx('boom');
      } else if (Math.hypot(pr.x - p.x, pr.y - p.y) < 0.33) {
        pr.done = true;
        g.effects.push({ type: 'boom', x: pr.x, y: pr.y, z: 0.3, t: 0, life: 0.35 });
        shooterDamagePlayer(pr.dmg, pr.x - pr.vx, pr.y - pr.vy);
      }
    }
    pr.life -= dt;
    if (pr.life <= 0) pr.done = true;
  }
  g.projectiles = g.projectiles.filter(pr => !pr.done);

  // ── Pickups
  for (const it of g.pickups) {
    if (it.taken || Math.hypot(it.x - p.x, it.y - p.y) > 0.55) continue;
    if (it.type === 'medkit' && p.hp < 100) {
      p.hp = Math.min(100, p.hp + 30); it.taken = true;
      shooterFloat('+30 HP', '#5ef08a'); shooterSfx('pickup');
    } else if (it.type === 'ammo') {
      p.reserve += 45; it.taken = true;
      shooterFloat('+45 AMMO', '#f5d26b'); shooterSfx('pickup');
    }
  }
  g.pickups = g.pickups.filter(it => !it.taken);

  // ── Waves
  if (!g.ended && !g.enemies.some(e => !e.dead)) {
    if (g.waveTimer <= 0) {
      g.waveTimer = 3;
      if (g.wave >= SHOOTER_WAVES.length) {
        g.ended = true;
        g.banner = { text: 'DUNGEON CLEARED', sub: 'Well done, soldier', t: 0, life: 3 };
        setTimeout(() => stopShooterGame('MISSION COMPLETE! 🎖️'), 1800);
      } else {
        g.banner = { text: 'WAVE CLEARED', sub: 'Next wave incoming…', t: 0, life: 2.6 };
      }
    } else {
      g.waveTimer -= dt;
      if (g.waveTimer <= 0 && !g.ended) shooterNextWave();
    }
  }
}

function shooterUpdateEnemy(e, dt) {
  const g = shooterGame, p = g.player, T = SHOOTER_TYPES[e.type];
  e.animT += dt;
  e.hurtT = Math.max(0, e.hurtT - dt);
  if (e.dead) { e.deadT += dt; return; }
  e.atkShow = Math.max(0, e.atkShow - dt);
  e.cool -= dt;
  e.moving = false;

  const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy);
  const los = dist < 14 && shooterLOS(e.x, e.y, p.x, p.y);
  if (!e.awake && ((los && dist < 10) || dist < 2.2)) e.awake = true;
  if (!e.awake || g.ended) return;
  if (!e.alerted) { e.alerted = true; if (dist < 9) shooterSfx('growl'); }

  // Attack wind-up: the enemy telegraphs, then strikes
  if (e.state === 'windup') {
    e.windT -= dt;
    if (e.windT > 0) return;
    e.state = 'chase';
    e.cool = T.cooldown * (0.8 + Math.random() * 0.45);
    e.atkShow = 0.25;
    if (T.melee) {
      shooterSfx('swipe');
      if (dist < T.reach + 0.35) shooterDamagePlayer(T.dmg, e.x, e.y);
    } else {
      const a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.08;
      g.projectiles.push({ x: e.x + Math.cos(a) * 0.3, y: e.y + Math.sin(a) * 0.3, vx: Math.cos(a) * T.projSpeed, vy: Math.sin(a) * T.projSpeed, dmg: T.dmg, life: 4 });
      shooterSfx('fireball');
    }
    return;
  }

  if (T.melee && los && dist < T.reach && e.cool <= 0) { e.state = 'windup'; e.windT = T.windup; return; }
  if (T.ranged && los && dist < T.range && dist > 1.2 && e.cool <= 0) { e.state = 'windup'; e.windT = T.windup; return; }

  // Movement: straight at the player when visible, otherwise follow the flow field
  let tx, ty;
  if (los) {
    tx = p.x; ty = p.y;
    if (T.ranged) {
      e.strafeT -= dt;
      if (e.strafeT <= 0) { e.strafe = Math.random() < 0.5 ? 1 : -1; e.strafeT = 1 + Math.random() * 1.5; }
      if (dist < T.keepMin) { tx = e.x - dx; ty = e.y - dy; }
      else if (dist < T.keepMax) { tx = e.x - dy * e.strafe; ty = e.y + dx * e.strafe; }
    } else if (dist < T.reach * 0.7) {
      return; // close enough to swing
    }
  } else {
    const ft = shooterFlowTarget(e);
    tx = ft.x; ty = ft.y;
  }
  const mx = tx - e.x, my = ty - e.y, ml = Math.hypot(mx, my);
  if (ml > 0.02) {
    const sp = T.speed * (e.hurtT > 0 ? 0.35 : 1) * dt;
    shooterMoveCircle(e, mx / ml * sp, my / ml * sp, T.radius);
    e.moving = true;
  }
}

// ─────────────────────────────── Shoot ─────────────────────
function shooterShoot() {
  const g = shooterGame, p = g.player;
  p.mag--;
  p.fireCd = 0.11;
  p.recoil = 1;
  p.pitchKick = Math.min(p.pitchKick + 3, 8);
  p.spread = Math.min(1, p.spread + 0.35);
  g.flashLight = 1;
  shooterSfx('shot');
  shooterAlert(p.x, p.y, 9);

  const a = p.angle + (Math.random() - 0.5) * (0.012 + p.spread * 0.05);
  const rx = Math.cos(a), ry = Math.sin(a);

  // Distance to the wall along the shot
  let wallDist = 30;
  {
    let mx = Math.floor(p.x), my = Math.floor(p.y);
    const ddx = Math.abs(1 / (rx || 1e-30)), ddy = Math.abs(1 / (ry || 1e-30));
    let sdx = rx < 0 ? (p.x - mx) * ddx : (mx + 1 - p.x) * ddx;
    let sdy = ry < 0 ? (p.y - my) * ddy : (my + 1 - p.y) * ddy;
    const sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1;
    for (let i = 0; i < 64; i++) {
      let side;
      if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
      if ((g.map[my]?.[mx] || 0) > 0) { wallDist = side === 0 ? sdx - ddx : sdy - ddy; break; }
    }
  }

  // Closest enemy whose body the ray passes through
  let hit = null, hitAlong = wallDist;
  for (const e of g.enemies) {
    if (e.dead) continue;
    const ex = e.x - p.x, ey = e.y - p.y;
    const along = ex * rx + ey * ry;
    if (along <= 0 || along >= hitAlong) continue;
    const perp = Math.abs(ex * ry - ey * rx);
    if (perp < SHOOTER_TYPES[e.type].radius + 0.05) { hit = e; hitAlong = along; }
  }

  if (hit) {
    const T = SHOOTER_TYPES[hit.type];
    hit.hp -= 20 + Math.random() * 10;
    hit.hurtT = 0.12;
    hit.awake = true;
    if (hit.state === 'windup' && hit.type === 'imp') hit.state = 'chase'; // small enemies get staggered
    g.hitMarker = 0.18;
    g.effects.push({ type: 'blood', x: hit.x - rx * 0.25, y: hit.y - ry * 0.25, z: 0.35 + Math.random() * 0.2, t: 0, life: 0.3 });
    if (hit.hp <= 0) {
      hit.dead = true; hit.deadT = 0; hit.state = 'dead';
      p.score += T.score; p.kills++;
      g.killMarker = 0.35;
      shooterFloat(`+${T.score}`, '#ffd166');
      shooterSfx('kill');
      if (Math.random() < 0.4) g.pickups.push({ type: Math.random() < 0.5 ? 'medkit' : 'ammo', x: hit.x, y: hit.y, taken: false });
    } else {
      shooterSfx('hit');
    }
  } else {
    const d = Math.max(0.2, wallDist - 0.05);
    g.effects.push({ type: 'spark', x: p.x + rx * d, y: p.y + ry * d, z: 0.42 + (Math.random() - 0.5) * 0.15, t: 0, life: 0.15 });
  }
}

// ─────────────────────────────── Render: 3D scene ──────────
function shooterRenderScene() {
  const g = shooterGame, p = g.player, map = g.map, T = g.tex;
  const RW = g.RW, RH = g.RH, buf = g.buf32, zbuf = g.zbuf;

  const dirX = Math.cos(p.angle), dirY = Math.sin(p.angle);
  const planeLen = Math.min(0.85, RW / (2 * RH));
  const planeX = -dirY * planeLen, planeY = dirX * planeLen;
  const proj = RW / (2 * planeLen);
  const camZ = 0.5 + p.bobZ;
  const horizon = RH / 2 + p.pitchKick * (RH / 240);

  // Torch light: falls off with distance, flickers, flares on muzzle flash
  const flick = 1 + 0.05 * Math.sin(g.time * 11) + 0.035 * Math.sin(g.time * 17.3 + 1.3);
  const boost = g.flashLight * 0.9;
  const FOG_R = 8, FOG_G = 6, FOG_B = 11;
  const lightAt = d => Math.min(1.35, 1.55 * flick / (1 + 0.11 * d * d) + boost / (1 + 0.25 * d * d)) + 0.025;

  // ── Floor & ceiling
  const rdx0 = dirX - planeX, rdy0 = dirY - planeY;
  const rdx1 = dirX + planeX, rdy1 = dirY + planeY;
  const tf = T.floor, tc = T.ceil;
  for (let y = 0; y < RH; y++) {
    const isFloor = y > horizon;
    const dy = Math.max(0.5, isFloor ? y - horizon : horizon - y);
    const rowDist = (isFloor ? camZ : 1 - camZ) * proj / dy;
    const stepX = rowDist * (rdx1 - rdx0) / RW, stepY = rowDist * (rdy1 - rdy0) / RW;
    let fx = p.x + rowDist * rdx0, fy = p.y + rowDist * rdy0;
    const L = lightAt(rowDist) * (isFloor ? 1 : 0.8);
    const lr = L * 1.06, lg = L * 0.95, lb = L * 0.82;
    const w = Math.max(0, 1 - L);
    const fr = FOG_R * w, fg = FOG_G * w, fb = FOG_B * w;
    const tx = isFloor ? tf : tc;
    const tr = tx.r, tg = tx.g, tb = tx.b;
    let idx = y * RW;
    for (let x = 0; x < RW; x++) {
      const ti = ((((fy * 64) | 0) & 63) << 6) | (((fx * 64) | 0) & 63);
      let r = tr[ti] * lr + fr, gg = tg[ti] * lg + fg, b = tb[ti] * lb + fb;
      if (r > 255) r = 255; if (gg > 255) gg = 255; if (b > 255) b = 255;
      buf[idx++] = 0xFF000000 | (b << 16) | (gg << 8) | r;
      fx += stepX; fy += stepY;
    }
  }

  // ── Walls
  for (let x = 0; x < RW; x++) {
    const camX = 2 * x / RW - 1;
    const rx = dirX + planeX * camX, ry = dirY + planeY * camX;
    let mx = Math.floor(p.x), my = Math.floor(p.y);
    const ddx = Math.abs(1 / (rx || 1e-30)), ddy = Math.abs(1 / (ry || 1e-30));
    let stepX, stepY, sdx, sdy;
    if (rx < 0) { stepX = -1; sdx = (p.x - mx) * ddx; } else { stepX = 1; sdx = (mx + 1 - p.x) * ddx; }
    if (ry < 0) { stepY = -1; sdy = (p.y - my) * ddy; } else { stepY = 1; sdy = (my + 1 - p.y) * ddy; }
    let side = 0, type = 0;
    for (let s = 0; s < 64; s++) {
      if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
      type = map[my]?.[mx] ?? 1;
      if (type > 0) break;
    }
    const perp = Math.max(0.05, side === 0 ? sdx - ddx : sdy - ddy);
    zbuf[x] = perp;

    let wallX = side === 0 ? p.y + perp * ry : p.x + perp * rx;
    wallX -= Math.floor(wallX);
    let texX = (wallX * 64) | 0;
    if ((side === 0 && rx > 0) || (side === 1 && ry < 0)) texX = 63 - texX;

    const lineH = proj / perp;
    const top = horizon - lineH * (1 - camZ);
    const bottom = horizon + lineH * camZ;
    const y0 = Math.max(0, Math.ceil(top)), y1 = Math.min(RH, Math.ceil(bottom));
    const texStep = 64 / lineH;
    let texPos = (y0 - top) * texStep;

    const L = lightAt(perp) * (side === 1 ? 0.72 : 1);
    const lr = L * 1.06, lg = L * 0.95, lb = L * 0.82;
    const w = Math.max(0, 1 - L);
    const fr = FOG_R * w, fg = FOG_G * w, fb = FOG_B * w;
    const tex = T.walls[type] || T.walls[1];
    const tr = tex.r, tg = tex.g, tb = tex.b;
    for (let y = y0; y < y1; y++) {
      const ty = (texPos | 0) & 63;
      texPos += texStep;
      const ti = (ty << 6) | texX;
      const ao = ty > 58 ? 0.72 : ty < 3 ? 0.8 : 1; // darker where wall meets floor/ceiling
      let r = tr[ti] * lr * ao + fr, gg = tg[ti] * lg * ao + fg, b = tb[ti] * lb * ao + fb;
      if (r > 255) r = 255; if (gg > 255) gg = 255; if (b > 255) b = 255;
      buf[y * RW + x] = 0xFF000000 | (b << 16) | (gg << 8) | r;
    }
  }

  // ── Sprites (enemies, corpses, fireballs, pickups, effects), far to near
  const S = g.sprites, list = [];
  for (const e of g.enemies) {
    const Ty = SHOOTER_TYPES[e.type];
    let f;
    if (e.dead) f = 3;
    else if (e.state === 'windup' || e.atkShow > 0) f = 2;
    else f = Math.floor(e.animT * (e.moving ? 6 : 1.2)) % 2;
    const floatZ = Ty.float && !e.dead ? 0.06 + Math.sin(e.animT * 2.5) * 0.03 : 0;
    // windup glow pulse so the player sees the attack coming
    const charge = e.state === 'windup' ? 0.35 + 0.35 * Math.sin(g.time * 40) : 0;
    list.push({ x: e.x, y: e.y, tex: S[e.type][f], h: Ty.h, z: floatZ, hurt: e.hurtT > 0 ? 0.7 : 0, charge });
  }
  for (const pr of g.projectiles) list.push({ x: pr.x, y: pr.y, tex: S.fireball[Math.floor(g.time * 12) % 2], h: 0.34, z: 0.3 });
  for (const it of g.pickups) list.push({ x: it.x, y: it.y, tex: S[it.type], h: 0.42, z: 0.02 + Math.sin(g.time * 3 + it.x) * 0.02 });
  for (const fx of g.effects) {
    const k = fx.t / fx.life;
    if (fx.type === 'boom') list.push({ x: fx.x, y: fx.y, tex: S.boom[Math.min(2, Math.floor(k * 3))], h: 0.55, z: fx.z - 0.25 });
    else if (fx.type === 'spark') list.push({ x: fx.x, y: fx.y, tex: S.spark, h: 0.16, z: fx.z - 0.08 });
    else list.push({ x: fx.x, y: fx.y, tex: S.blood, h: 0.3 + k * 0.15, z: fx.z - 0.15 - k * 0.1 });
  }

  const invDet = 1 / (planeX * dirY - dirX * planeY);
  for (const s of list) s.d = (s.x - p.x) ** 2 + (s.y - p.y) ** 2;
  list.sort((a, b) => b.d - a.d);

  for (const s of list) {
    const sx = s.x - p.x, sy = s.y - p.y;
    const tX = invDet * (dirY * sx - dirX * sy);
    const tY = invDet * (-planeY * sx + planeX * sy);
    if (tY < 0.15) continue;
    const screenX = (RW / 2) * (1 + tX / tY);
    const scale = proj / tY;
    const sh = scale * s.h, sw = sh;
    const bottom = horizon + scale * (camZ - s.z);
    const top = bottom - sh, left = screenX - sw / 2;
    const x0 = Math.max(0, Math.floor(left)), x1 = Math.min(RW - 1, Math.floor(left + sw));
    const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(RH - 1, Math.floor(bottom));
    if (x1 < x0 || y1 < y0) continue;

    const L = lightAt(tY);
    const lr = L * 1.06, lg = L * 0.95, lb = L * 0.82;
    const w = Math.max(0, 1 - L);
    const fr = FOG_R * w, fg = FOG_G * w, fb = FOG_B * w;
    const hurt = s.hurt || 0, charge = s.charge || 0;
    const data = s.tex;
    const kx = 64 / sw, ky = 64 / sh;
    for (let x = x0; x <= x1; x++) {
      if (tY >= zbuf[x]) continue;
      const texX = Math.min(63, ((x - left) * kx) | 0);
      for (let y = y0; y <= y1; y++) {
        const texY = Math.min(63, ((y - top) * ky) | 0);
        const px = data[(texY << 6) | texX];
        const a = px >>> 24;
        if (a < 200) continue;
        let r = px & 255, gg = (px >>> 8) & 255, b = (px >>> 16) & 255;
        if (a === 254) {
          // emissive pixels ignore the darkness; charging attacks glow brighter
          if (charge) { r = r + (255 - r) * charge; gg = gg + (255 - gg) * charge * 0.6; b = b * (1 - charge * 0.5); }
        } else {
          r = r * lr + fr; gg = gg * lg + fg; b = b * lb + fb;
        }
        if (hurt) { r += (255 - r) * hurt; gg += (255 - gg) * hurt; b += (255 - b) * hurt; }
        if (r > 255) r = 255; if (gg > 255) gg = 255; if (b > 255) b = 255;
        buf[y * RW + x] = 0xFF000000 | (b << 16) | (gg << 8) | r;
      }
    }
  }

  g.bufCtx.putImageData(g.imageData, 0, 0);
}

// ─────────────────────────────── Render: weapon & HUD ──────
function shooterDrawGun(ctx, W, H) {
  const g = shooterGame, p = g.player;
  const s = Math.min(W / 720, H / 520) * 1.05;
  const swayX = Math.sin(p.bob) * 7 * p.moveAmt;
  const swayY = Math.abs(Math.cos(p.bob)) * 6 * p.moveAmt;
  const reload = p.reloadT > 0 ? Math.sin((1 - p.reloadT / p.RELOAD) * Math.PI) : 0;
  const kick = p.recoil;

  ctx.save();
  ctx.translate(W * 0.6 + swayX + kick * 4 * s, H + 34 * s + swayY + kick * 16 * s + reload * 120 * s);
  ctx.rotate(-0.28 - kick * 0.05 + reload * 0.5);
  ctx.scale(s, s);

  const metal = (x0, x1) => {
    const gr = ctx.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, '#121417'); gr.addColorStop(0.35, '#4d535c'); gr.addColorStop(0.55, '#2b2f35'); gr.addColorStop(1, '#0d0e10');
    return gr;
  };
  // magazine
  ctx.fillStyle = '#1b1d20';
  ctx.beginPath(); ctx.moveTo(-24, -8); ctx.lineTo(20, -8); ctx.lineTo(30, 80); ctx.lineTo(-12, 80); ctx.closePath(); ctx.fill();
  // receiver
  ctx.fillStyle = metal(-62, 62);
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-60, -80, 120, 130, 10); else ctx.rect(-60, -80, 120, 130); ctx.fill();
  ctx.fillStyle = '#0a0b0c'; ctx.fillRect(18, -58, 26, 12);                 // ejection port
  ctx.fillStyle = '#3a3f46'; ctx.fillRect(-16, -92, 32, 14);                // top rail
  ctx.fillStyle = '#16181b'; for (let i = 0; i < 5; i++) ctx.fillRect(-14 + i * 6.5, -92, 3, 14);
  // handguard
  ctx.fillStyle = metal(-36, 36);
  ctx.beginPath(); ctx.moveTo(-36, -80); ctx.lineTo(36, -80); ctx.lineTo(27, -200); ctx.lineTo(-27, -200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 5; i++) {
    const yy = -100 - i * 20;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-14, yy, 28, 8, 4); ctx.fill(); } else ctx.fillRect(-14, yy, 28, 8);
  }
  // barrel, muzzle, front sight
  ctx.fillStyle = metal(-9, 9); ctx.fillRect(-8, -262, 16, 66);
  ctx.fillStyle = metal(-12, 12); ctx.fillRect(-12, -276, 24, 18);
  ctx.fillStyle = '#0b0c0d'; ctx.fillRect(-3, -230, 6, -16);
  // gloved hand on the handguard
  ctx.save();
  ctx.translate(-30, -140); ctx.rotate(0.25);
  const hg = ctx.createRadialGradient(-6, -10, 4, 0, 0, 36);
  hg.addColorStop(0, '#4a3f36'); hg.addColorStop(1, '#1d1814');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, 0, 24, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(14, -24 + i * 14, 7, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // muzzle flash
  if (p.fireCd > 0.06 && p.recoil > 0.5) {
    ctx.globalCompositeOperation = 'lighter';
    const f = ctx.createRadialGradient(0, -290, 0, 0, -290, 70);
    f.addColorStop(0, 'rgba(255,255,230,1)'); f.addColorStop(0.25, 'rgba(255,200,80,0.9)'); f.addColorStop(1, 'rgba(255,90,0,0)');
    ctx.fillStyle = f;
    ctx.beginPath();
    const spikes = 7, rot = Math.random() * Math.PI;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 ? 22 : 60 + Math.random() * 25, a = rot + (i / (spikes * 2)) * Math.PI * 2;
      const x = Math.cos(a) * r, y = -290 + Math.sin(a) * r * 1.2;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function shooterRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
}

function shooterRender() {
  const g = shooterGame, p = g.player;
  const canvas = document.getElementById('shooter-canvas');
  if (!canvas || !g.buf32) return;
  const ctx = canvas.getContext('2d');
  const W = g.W, H = g.H;

  shooterRenderScene();

  ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const shx = (Math.random() - 0.5) * g.shake * 10, shy = (Math.random() - 0.5) * g.shake * 10;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(g.bufCanvas, shx - 4, shy - 4, W + 8, H + 8);

  // Vignette
  if (!g.vignette || g.vignette.w !== W || g.vignette.h !== H) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.65)');
    g.vignette = { w: W, h: H, grad: v };
  }
  ctx.fillStyle = g.vignette.grad; ctx.fillRect(0, 0, W, H);

  shooterDrawGun(ctx, W, H);

  const cx = W / 2, cy = H / 2;
  // Crosshair widens while firing
  const gap = 5 + p.spread * 9, len = 7;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(cx - gap - len, cy); ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + len, cy);
  ctx.moveTo(cx, cy - gap - len); ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + len);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Hit marker
  if (g.hitMarker > 0 || g.killMarker > 0) {
    const kill = g.killMarker > 0;
    ctx.strokeStyle = kill ? '#ff3b3b' : '#ffffff';
    ctx.globalAlpha = Math.min(1, (kill ? g.killMarker : g.hitMarker) * 6);
    ctx.lineWidth = kill ? 3 : 2;
    const r1 = 6, r2 = kill ? 15 : 12;
    ctx.beginPath();
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { ctx.moveTo(cx + a * r1, cy + b * r1); ctx.lineTo(cx + a * r2, cy + b * r2); });
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Damage direction arcs
  for (const d of g.damageDirs) {
    const rel = d.a - p.angle - Math.PI / 2;
    ctx.strokeStyle = `rgba(255,40,40,${Math.min(1, d.t) * 0.85})`;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.22, rel - 0.35, rel + 0.35); ctx.stroke();
  }

  // Hurt / low health overlay
  if (p.hurtT > 0 || p.hp < 35) {
    const pulse = p.hp < 35 ? (0.25 + 0.15 * Math.sin(g.time * 6)) : 0;
    const a = Math.max(pulse, p.hurtT * 1.2);
    const rg = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.25, cx, cy, Math.max(W, H) * 0.7);
    rg.addColorStop(0, 'rgba(160,0,0,0)'); rg.addColorStop(1, `rgba(190,0,0,${Math.min(0.75, a)})`);
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }

  // ── HUD
  const ui = Math.max(0.75, Math.min(1.25, W / 640));
  ctx.font = `700 ${Math.round(11 * ui)}px Ubuntu, sans-serif`;
  // Health
  const hx = 14, hy = H - 54 * ui;
  ctx.fillStyle = 'rgba(10,8,6,0.6)'; shooterRoundRect(ctx, hx, hy, 170 * ui, 40 * ui, 10); ctx.fill();
  ctx.fillStyle = p.hp > 60 ? '#5ef08a' : p.hp > 30 ? '#f6c344' : '#ff4d4d';
  ctx.font = `800 ${Math.round(22 * ui)}px Ubuntu, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`✚ ${Math.ceil(p.hp)}`, hx + 10 * ui, hy + 16 * ui);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(hx + 10 * ui, hy + 30 * ui, 150 * ui, 4 * ui);
  ctx.fillStyle = p.hp > 60 ? '#5ef08a' : p.hp > 30 ? '#f6c344' : '#ff4d4d';
  ctx.fillRect(hx + 10 * ui, hy + 30 * ui, 150 * ui * p.hp / 100, 4 * ui);

  // Ammo
  const ax = W - 14 - 150 * ui, ay = H - 54 * ui;
  ctx.fillStyle = 'rgba(10,8,6,0.6)'; shooterRoundRect(ctx, ax, ay, 150 * ui, 40 * ui, 10); ctx.fill();
  ctx.textAlign = 'right';
  if (p.reloadT > 0) {
    ctx.fillStyle = '#f6c344'; ctx.font = `800 ${Math.round(13 * ui)}px Ubuntu, sans-serif`;
    ctx.fillText('RELOADING', ax + 140 * ui, ay + 15 * ui);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(ax + 10 * ui, ay + 28 * ui, 130 * ui, 4 * ui);
    ctx.fillStyle = '#f6c344'; ctx.fillRect(ax + 10 * ui, ay + 28 * ui, 130 * ui * (1 - p.reloadT / p.RELOAD), 4 * ui);
  } else {
    ctx.fillStyle = p.mag > 8 ? '#ffffff' : p.mag > 0 ? '#ff8a4d' : '#ff4d4d';
    ctx.font = `800 ${Math.round(22 * ui)}px Ubuntu, sans-serif`;
    const reserveText = ` / ${p.reserve}`;
    ctx.font = `600 ${Math.round(13 * ui)}px Ubuntu, sans-serif`;
    const rw = ctx.measureText(reserveText).width;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(reserveText, ax + 140 * ui, ay + 20 * ui);
    ctx.font = `800 ${Math.round(22 * ui)}px Ubuntu, sans-serif`;
    ctx.fillStyle = p.mag > 8 ? '#ffffff' : p.mag > 0 ? '#ff8a4d' : '#ff4d4d';
    ctx.fillText(`${p.mag}`, ax + 140 * ui - rw, ay + 20 * ui);
    if (p.mag === 0 && p.reserve === 0) {
      ctx.fillStyle = '#ff4d4d'; ctx.font = `700 ${Math.round(10 * ui)}px Ubuntu, sans-serif`;
      ctx.fillText('NO AMMO — find a crate', ax + 140 * ui, ay + 34 * ui);
    }
  }

  // Top bar: wave, enemies, score
  const aliveCount = g.enemies.filter(e => !e.dead).length;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = `700 ${Math.round(12 * ui)}px Ubuntu, sans-serif`;
  const topText = `WAVE ${g.wave}/${SHOOTER_WAVES.length}   ·   ${aliveCount} ENEMIES   ·   ${p.score} PTS`;
  const tw = ctx.measureText(topText).width + 24;
  ctx.fillStyle = 'rgba(10,8,6,0.55)'; shooterRoundRect(ctx, cx - tw / 2, 10, tw, 24 * ui, 12); ctx.fill();
  ctx.fillStyle = '#f3e2c4'; ctx.fillText(topText, cx, 10 + 6 * ui);

  // Floating text (pickups, kills)
  for (const f of g.floaters) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
    ctx.fillStyle = f.color; ctx.font = `800 ${Math.round(16 * ui)}px Ubuntu, sans-serif`;
    ctx.fillText(f.text, cx, cy - 46 - f.t * 40);
  }
  ctx.globalAlpha = 1;

  // Wave banner
  if (g.banner) {
    const b = g.banner, k = b.t / b.life;
    ctx.globalAlpha = Math.min(1, b.t * 4, (1 - k) * 4);
    ctx.font = `900 ${Math.round(34 * ui)}px Ubuntu, sans-serif`;
    ctx.fillStyle = '#ffd9a0'; ctx.shadowColor = 'rgba(255,120,40,0.8)'; ctx.shadowBlur = 24;
    ctx.fillText(b.text, cx, H * 0.24);
    ctx.shadowBlur = 0;
    ctx.font = `600 ${Math.round(13 * ui)}px Ubuntu, sans-serif`;
    ctx.fillStyle = '#f3e2c4';
    ctx.fillText(b.sub, cx, H * 0.24 + 44 * ui);
    ctx.globalAlpha = 1;
  }

  // Minimap
  const map = g.map, rows = map.length, cols = map[0].length;
  const ms = Math.max(3, Math.min(5, W / 140)), mx0 = 12, my0 = 44 * ui;
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; shooterRoundRect(ctx, mx0 - 4, my0 - 4, cols * ms + 8, rows * ms + 8, 6); ctx.fill();
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (map[r][c] > 0) { ctx.fillStyle = '#6b5a48'; ctx.fillRect(mx0 + c * ms, my0 + r * ms, ms, ms); }
  }
  ctx.fillStyle = '#ff4d4d';
  for (const e of g.enemies) if (!e.dead && e.awake) ctx.fillRect(mx0 + e.x * ms - 1.5, my0 + e.y * ms - 1.5, 3, 3);
  ctx.fillStyle = '#5ef08a';
  for (const it of g.pickups) ctx.fillRect(mx0 + it.x * ms - 1, my0 + it.y * ms - 1, 2, 2);
  ctx.fillStyle = 'rgba(255,220,120,0.25)';
  ctx.beginPath(); ctx.moveTo(mx0 + p.x * ms, my0 + p.y * ms);
  ctx.arc(mx0 + p.x * ms, my0 + p.y * ms, ms * 4, p.angle - 0.55, p.angle + 0.55); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(mx0 + p.x * ms, my0 + p.y * ms, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Control hint while the mouse isn't captured (desktop)
  if (!g.mouseLocked && window.innerWidth > 768 && g.time < 12) {
    ctx.font = `600 ${Math.round(11 * ui)}px Ubuntu, sans-serif`;
    ctx.fillStyle = 'rgba(243,226,196,0.85)'; ctx.textBaseline = 'bottom';
    ctx.fillText('Klik untuk kunci mouse  ·  atau tahan klik + geser / ←→ untuk menoleh', cx, H - 62 * ui);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// (Shooter init called in DOMContentLoaded & openApp)

// ─────────────────────────────── Canvas Resize ─────────────
function resizeShooterCanvas() {
  const g = shooterGame;
  const canvas = document.getElementById('shooter-canvas');
  if (!canvas) return;
  const W = canvas.clientWidth || 480, H = canvas.clientHeight || 360;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (W === g.W && H === g.H && dpr === g.dpr && g.buf32) return;
  g.W = W; g.H = H; g.dpr = dpr;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  // 3D view renders at a lower resolution and is scaled up (chunky retro pixels, fast)
  g.RW = Math.max(200, Math.min(400, Math.round(W / 2)));
  g.RH = Math.max(140, Math.round(g.RW * H / W));
  if (!g.bufCanvas) g.bufCanvas = document.createElement('canvas');
  g.bufCanvas.width = g.RW; g.bufCanvas.height = g.RH;
  g.bufCtx = g.bufCanvas.getContext('2d');
  g.imageData = g.bufCtx.createImageData(g.RW, g.RH);
  g.buf32 = new Uint32Array(g.imageData.data.buffer);
  g.zbuf = new Float32Array(g.RW);
  g.vignette = null;
}

// ═══════════════════════════════════════════════════════════
//    AI CHATBOT (KIMI K3 via NVIDIA API)
// ═══════════════════════════════════════════════════════════
const chatbotConfig = {
  model: 'moonshotai/kimi-k3',
  systemPrompt: `Kamu adalah Kimi AI, asisten AI pribadi yang cerdas, santun, ramah, dan profesional untuk website portofolio Firman Ardiansyah.

Informasi Lengkap Firman Ardiansyah:
- Nama Lengkap: Firman Ardiansyah (biasa disapa Firman / Farel).
- Profesi: Fullstack Web Developer, Software Engineer, Frontend & Backend Specialist.
- Lokasi: Sidoarjo, Jawa Timur, Indonesia.
- Kontak:
  - Email: busfirman9@gmail.com
  - WhatsApp: +62 813-5739-8265
  - GitHub: https://github.com/taka-duarr
  - LinkedIn: https://www.linkedin.com/in/firman-ardiansyah-700786284
- Keahlian Teknis (Tech Stack):
  - Frontend: JavaScript (ES6+), React.js, Vue.js, Tailwind CSS, Bootstrap, HTML5, CSS3/Vanilla CSS.
  - Backend: PHP, Laravel, Node.js, Express, RESTful API.
  - Database: MySQL, PostgreSQL.
  - Tools & OS: Git, GitHub, Linux (Ubuntu/Debian), Nginx, Docker, Tailscale CI/CD.
- Proyek Unggulan:
  1. PT Conbloc Indotama Quarry: Website profil perusahaan terkemuka produsen paving block, ready-mix concrete, & quarry materials dengan Laravel, MySQL, Bootstrap.
  2. Nganime (anime.takaaa.my.id): Platform streaming & katalog anime interaktif dengan React, Tailwind CSS, REST API, pencarian real-time & watchlist.
  3. Berbagai modul aplikasi internal, POS, dan portofolio interaktif berbasis desktop/mobile OS.
- Sertifikasi: Memiliki 15 sertifikat keahlian di bidang pemrograman dan software engineering.

Pedoman Menjawab:
1. Jawab pertanyaan pengunjung seputar Firman, portofolio, proyek, dan skill-nya secara akurat dan menarik.
2. Kamu juga bisa menjawab pertanyaan pemrograman umum (PHP, Laravel, React, JS, database, dll) dengan solusi teknis yang jelas.
3. Selalu ramah, sopan, antusias, dan gunakan format markdown (bold, bullet points, code block) agar pesan rapi dan mudah dibaca.
4. Gunakan bahasa Indonesia secara default, atau sesuaikan jika pengguna bertanya dalam bahasa lain.`
};

let chatbotMessages = [
  { role: 'system', content: chatbotConfig.systemPrompt }
];
let isChatbotLoading = false;
let chatbotInitialized = false;

function initChatbot() {
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  if (!form || !input) return;

  if (chatbotInitialized) return;
  chatbotInitialized = true;

  // Auto-resize input
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Enter to send (Shift+Enter for newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e);
    }
  });

  // Clear chat buttons
  document.getElementById('chat-clear-btn')?.addEventListener('click', clearChatHistory);
  document.getElementById('chat-header-clear-btn')?.addEventListener('click', clearChatHistory);
}

function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chatbot-input');
  if (!input) return;
  const userText = input.value.trim();
  if (!userText || isChatbotLoading) return;

  input.value = '';
  input.style.height = 'auto';

  // Append user message
  appendChatMessage('user', userText);
  chatbotMessages.push({ role: 'user', content: userText });

  // Show typing indicator
  showChatTyping();
  isChatbotLoading = true;

  let assistantMsgEl = null;

  // Call AI API with streaming callbacks
  requestAIChat(
    chatbotMessages,
    (fullText) => {
      hideChatTyping();
      if (!assistantMsgEl) {
        assistantMsgEl = appendChatMessage('assistant', fullText);
      } else {
        updateChatMessageText(assistantMsgEl, fullText);
      }
    },
    () => {
      const typingLabel = document.querySelector('#chat-typing-indicator .chat-typing-label');
      if (typingLabel) {
        typingLabel.textContent = 'Kimi AI sedang berpikir & menalar...';
      }
    }
  )
    .then((reply) => {
      hideChatTyping();
      if (!assistantMsgEl) {
        appendChatMessage('assistant', reply);
      } else {
        updateChatMessageText(assistantMsgEl, reply);
      }
      chatbotMessages.push({ role: 'assistant', content: reply });
    })
    .catch((err) => {
      hideChatTyping();
      console.error('Chatbot API Error:', err);
      const errorMsg = err.message || 'Maaf, terjadi kendala saat menghubungi server AI. Pastikan server terhubung ke internet atau coba beberapa saat lagi.';
      appendChatMessage('assistant', errorMsg);
    })
    .finally(() => {
      isChatbotLoading = false;
      document.getElementById('chatbot-input')?.focus();
    });
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chatbot-input');
  if (!input) return;
  input.value = promptText;
  handleChatSubmit();
}

function getPhpStaticServerHelpMessage() {
  return (
    `⚠️ **Server Lokal Belum Menjalankan PHP**\n\n` +
    `Web portofolio ini saat ini dibuka melalui **static web server** (port 3000 / Live Server), sehingga file backend \`api/chat.php\` tidak dieksekusi oleh PHP melainkan terbaca sebagai file teks mentah.\n\n` +
    `**Cara Mengaktifkan AI di Komputer Lokal:**\n` +
    `1. Buka terminal di folder project ini (\`c:\\codingan\\new porto\`)\n` +
    `2. Jalankan perintah server lokal PHP:\n` +
    `\`\`\`bash\n` +
    `php -S localhost:8000\n` +
    `\`\`\`\n` +
    `3. Buka link **http://localhost:8000** di browser Anda.\n\n` +
    `*💡 Catatan: Saat website ini di-upload ke server hosting (cPanel/VPS) yang menjalankan Apache/Nginx + PHP, fitur AI ini akan langsung bekerja secara otomatis tanpa langkah tambahan.*`
  );
}

async function requestAIChat(messages, onChunk, onThinking) {
  // Call backend proxy api/chat.php (which loads API key securely from .env on server)
  const res = await fetch('api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: chatbotConfig.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: true
    })
  });

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let errMsg = `Server error (${res.status})`;
    try {
      const errText = await res.text();
      if (errText.trim().startsWith('<?php') || errText.includes('loadEnvFile(')) {
        throw new Error(getPhpStaticServerHelpMessage());
      }
      const errJson = JSON.parse(errText);
      if (errJson.error) errMsg = errJson.error;
    } catch (e) {
      if (e.message && e.message.includes('Server Lokal')) throw e;
    }
    throw new Error(errMsg);
  }

  // If static server served raw PHP file with 200 OK
  if (contentType.includes('php') || contentType.includes('text/plain')) {
    const rawText = await res.text();
    if (rawText.trim().startsWith('<?php') || rawText.includes('loadEnvFile(')) {
      throw new Error(getPhpStaticServerHelpMessage());
    }
  }

  // Handle SSE streaming
  if (contentType.includes('text/event-stream') && res.body && window.ReadableStream) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullReply = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Retain incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);

            if (parsed.error) {
              throw new Error(parsed.error);
            }

            const delta = parsed.choices?.[0]?.delta;
            if (delta) {
              if (delta.reasoning_content && onThinking) {
                onThinking(delta.reasoning_content);
              }
              if (delta.content) {
                fullReply += delta.content;
                if (onChunk) onChunk(fullReply, delta.content);
              }
            }
          } catch (jsonErr) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }

    if (fullReply.trim()) {
      return fullReply;
    }
  }

  // Fallback to plain JSON
  const rawText = await res.text();
  if (rawText.trim().startsWith('<?php') || rawText.includes('loadEnvFile(')) {
    throw new Error(getPhpStaticServerHelpMessage());
  }

  const data = JSON.parse(rawText);
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  if (data.error) {
    throw new Error(data.error);
  }
  return 'Tidak ada balasan dari model.';
}

function updateChatMessageText(msgDiv, newText) {
  if (!msgDiv) return;
  const textContainer = msgDiv.querySelector('.chat-msg-text');
  if (textContainer) {
    textContainer.innerHTML = formatChatText(newText);
  }
  const container = document.getElementById('chatbot-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function appendChatMessage(role, text) {
  const container = document.getElementById('chatbot-messages');
  if (!container) return null;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg chat-msg-${role}`;

  const isUser = role === 'user';
  const avatarHtml = isUser
    ? '<div class="chat-msg-avatar"><i class="fas fa-user"></i></div>'
    : '<div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>';

  const authorName = isUser ? 'Anda' : 'Kimi AI';
  const formattedText = formatChatText(text);

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.innerHTML = `
    ${avatarHtml}
    <div class="chat-msg-bubble">
      <div class="chat-msg-author">${authorName}</div>
      <div class="chat-msg-text">${formattedText}</div>
      <div class="chat-msg-time">${timeStr}</div>
    </div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  return msgDiv;
}

function showChatTyping() {
  const container = document.getElementById('chatbot-messages');
  if (!container || document.getElementById('chat-typing-indicator')) return;

  const typingDiv = document.createElement('div');
  typingDiv.id = 'chat-typing-indicator';
  typingDiv.className = 'chat-msg chat-msg-assistant chat-typing-msg';
  typingDiv.innerHTML = `
    <div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="chat-msg-bubble chat-typing-bubble">
      <div class="chat-typing-dots">
        <span></span><span></span><span></span>
      </div>
      <span class="chat-typing-label">Kimi AI sedang berpikir...</span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
}

function hideChatTyping() {
  const el = document.getElementById('chat-typing-indicator');
  if (el) el.remove();
}

function clearChatHistory() {
  chatbotMessages = [{ role: 'system', content: chatbotConfig.systemPrompt }];
  const container = document.getElementById('chatbot-messages');
  if (!container) return;
  container.innerHTML = `
    <div class="chat-msg chat-msg-assistant">
      <div class="chat-msg-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="chat-msg-bubble">
        <div class="chat-msg-author">Kimi AI</div>
        <div class="chat-msg-text">
          <p>Riwayat percakapan telah dibersihkan. Ada yang ingin Anda tanyakan seputar Firman Ardiansyah atau topik lainnya?</p>
        </div>
        <div class="chat-quick-suggestions">
          <button type="button" class="chat-quick-chip" onclick="sendQuickPrompt('Ceritakan tentang Firman Ardiansyah')">
            👨‍💻 Siapa Firman?
          </button>
          <button type="button" class="chat-quick-chip" onclick="sendQuickPrompt('Jelaskan proyek PT Conbloc Indotama Quarry dan Nganime')">
            🚀 Proyek Utama
          </button>
          <button type="button" class="chat-quick-chip" onclick="sendQuickPrompt('Apa teknologi utama yang dikuasai Firman?')">
            ⚡ Skill & Tech Stack
          </button>
        </div>
        <div class="chat-msg-time">Sekarang</div>
      </div>
    </div>
  `;
}

function formatChatText(str) {
  if (!str) return '';
  let s = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  s = s.replace(/```([a-z0-9]*)\n([\s\S]*?)```/gi, '<pre class="chat-code-block"><code>$2</code></pre>');
  s = s.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/\n\n+/g, '</p><p>');
  s = s.replace(/\n/g, '<br/>');

  return `<p>${s}</p>`;
}
