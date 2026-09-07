/* ═══════════════════════════════════════════════════════════
   UBUNTU DESKTOP PORTFOLIO — script.js
   Window Manager + Desktop Logic
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── Component Loader ────────────────────────────────────
async function loadComponents() {
  const components = ['about', 'projects', 'skills', 'terminal', 'contact', 'files', 'library', 'game', 'flappy', 'shooter'];
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
  if (boot) boot.style.display = 'none';
  if (lock) { lock.style.display = 'flex'; updateLockClock(); }
}

function showDesktop() {
  const lock = document.getElementById('lock-screen');
  const desktop = document.getElementById('desktop');
  if (lock) lock.style.display = 'none';
  if (desktop) { desktop.style.display = 'flex'; }
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
  if (!t) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  t.textContent = `${h}:${m}`;
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  d.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  setTimeout(updateLockClock, 5000);
}

function tryUnlock() {
  const input = document.getElementById('lock-pass');
  const hint = document.getElementById('lock-hint');
  // Any password (or empty) unlocks — it's a portfolio, not real security!
  try {
    sessionStorage.setItem('ubuntu_unlocked', 'true');
  } catch (e) {}
  showDesktop();
}

// ─── Panel Clock ──────────────────────────────────────────
function updatePanelClock() {
  const el = document.getElementById('panel-clock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}

// ─── Window Management ────────────────────────────────────
function getWindow(appName) {
  return document.getElementById(`win-${appName}`);
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
    return;
  }

  if (state.openWindows.has(appName)) {
    bringToFront(win);
    return;
  }

  state.openWindows.add(appName);
  win.style.display = 'flex';
  bringToFront(win);
  updateDockIndicator(appName, true);
  document.getElementById('panel-app-name').textContent = win.querySelector('.win-title')?.textContent?.trim() || '';

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
  // Resume snake game if it was running
  if (appName === 'game' && typeof snakeGame !== 'undefined' && snakeGame.running) {
    snakeGame.paused = false;
  }
  // Resume flappy game if it was running
  if (appName === 'flappy' && typeof flappyGame !== 'undefined' && flappyGame.running) {
    flappyGame.paused = false;
  }
  // Resume shooter game if it was running
  if (appName === 'shooter' && typeof shooterGame !== 'undefined' && shooterGame.running) {
    shooterGame.paused = false;
    if (shooterGame.req) cancelAnimationFrame(shooterGame.req);
    shooterGame.req = requestAnimationFrame(shooterLoop);
  }
}

function closeApp(appName) {
  const win = getWindow(appName);
  if (!win) return;
  state.openWindows.delete(appName);
  state.minimizedWindows.delete(appName);
  win.style.display = 'none';
  updateDockIndicator(appName, false);
  document.getElementById('panel-app-name').textContent = '';
  
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

function minimizeApp(appName) {
  const win = getWindow(appName);
  if (!win) return;
  state.minimizedWindows.add(appName);
  win.classList.add('win-minimizing');
  setTimeout(() => { win.style.display = 'none'; win.classList.remove('win-minimizing'); }, 200);

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
  state.zTop++;
  win.style.zIndex = state.zTop;
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
  if (panel) { panel.classList.add('active'); animateSkillBars(); }
  if (btn) btn.classList.add('active');
}

function animateSkillBars() {
  document.querySelectorAll('.skills-panel.active .skill-bar-fill').forEach(bar => {
    const w = bar.dataset.w || '0';
    setTimeout(() => { bar.style.width = w + '%'; }, 50);
  });
}

// ─── Project Filter ───────────────────────────────────────
function filterProjects(tag, btn) {
  const cards = document.querySelectorAll('.proj-card');
  let count = 0;
  cards.forEach(card => {
    const tags = card.dataset.tags || '';
    const show = tag === 'all' || tags.includes(tag);
    card.style.display = show ? 'block' : 'none';
    if (show) count++;
  });
  const countEl = document.getElementById('proj-count');
  if (countEl) countEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  document.querySelectorAll('#win-projects .sidebar-item').forEach(i => i.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ─── Certificate Filter ────────────────────────────────────
function filterCerts(cat, btn) {
  const cards = document.querySelectorAll('.cert-card');
  let count = 0;
  cards.forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
    if (show) count++;
  });
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
  }
  document.querySelectorAll('#win-about .sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
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
  const ctx = document.getElementById('context-menu');
  if (ctx) ctx.style.display = 'none';
}

// ─── Power Menu ───────────────────────────────────────────
function togglePowerMenu() {
  const menu = document.getElementById('power-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
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
    document.getElementById('desktop').style.display = 'none';
    document.getElementById('lock-screen').style.display = 'flex';
    updateLockClock();
  });

  // Close power menu on outside click
  document.addEventListener('click', e => {
    const menu = document.getElementById('power-menu');
    const btn = document.getElementById('tray-power');
    if (menu && !menu.contains(e.target) && !btn?.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // Desktop right-click context menu
  const desktopArea = document.getElementById('desktop-area');
  desktopArea?.addEventListener('contextmenu', e => {
    e.preventDefault();
    const ctx = document.getElementById('context-menu');
    if (!ctx) return;
    ctx.style.display = 'block';
    ctx.style.left = Math.min(e.clientX, window.innerWidth - 230) + 'px';
    ctx.style.top = Math.min(e.clientY, window.innerHeight - 200) + 'px';
  });
  document.addEventListener('click', e => {
    const ctx = document.getElementById('context-menu');
    if (ctx && !ctx.contains(e.target)) ctx.style.display = 'none';
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

  // ─── SNAKE GAME INIT ───
  const snakeCanvas = document.getElementById('snake-canvas');
  if (snakeCanvas) {
    const startBtn = document.getElementById('game-start-btn');
    startBtn.addEventListener('click', startSnakeGame);
    document.addEventListener('keydown', handleSnakeInput);
  }

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

function handleSnakeInput(e) {
  if (!snakeGame.running || snakeGame.paused) return;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
    if (state.openWindows.has('game') && getWindow('game').style.display !== 'none') {
      e.preventDefault();
    } else {
      return;
    }
  }

  if (snakeGame.snake.queue.length > 2) return;

  if (e.key === 'ArrowLeft' || e.key === 'a') snakeGame.snake.queue.push('LEFT');
  else if (e.key === 'ArrowUp' || e.key === 'w') snakeGame.snake.queue.push('UP');
  else if (e.key === 'ArrowRight' || e.key === 'd') snakeGame.snake.queue.push('RIGHT');
  else if (e.key === 'ArrowDown' || e.key === 's') snakeGame.snake.queue.push('DOWN');
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

function initFlappyGame() {
  flappyGame.canvas = document.getElementById('flappy-canvas');
  if (!flappyGame.canvas) return;
  flappyGame.ctx = flappyGame.canvas.getContext('2d');

  document.getElementById('flappy-start-btn')?.addEventListener('click', startFlappyGame);
  document.getElementById('flappy-overlay').style.display = 'flex';

  // Handle Input
  document.addEventListener('keydown', handleFlappyInput);
  flappyGame.canvas.addEventListener('mousedown', handleFlappyJump);
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

// Call init once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Slight delay to allow fetch components to load
  setTimeout(() => initFlappyGame(), 500);
});

// ─── FPS DUNGEON SHOOTER ───────────────────────────────────
const shooterGame = {
  running: false, paused: false, req: null,
  W: 480, H: 360,

  map: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,2,2,0,0,0,0,3,0,0,0,0,1],
    [1,0,0,0,2,0,0,0,0,0,3,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,4,0,0,0,0,0,0,0,0,0,0,4,0,1],
    [1,0,4,4,0,0,0,0,0,0,0,0,4,4,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,3,0,0,0,0,0,0,2,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  player: {
    x: 2.5, y: 2.5, angle: 0.3,
    hp: 100, ammo: 30, maxAmmo: 30, score: 0,
    shootTimer: 0, flashTimer: 0, hurtTimer: 0, bobPhase: 0,
    reloadTimer: 0,  // >0 means reloading
    RELOAD_TIME: 90, // frames (~1.5s at 60fps)
  },

  enemies: [
    { x: 8.5, y: 8.5, hp: 3, maxHp: 3, alive: true },
    { x: 4.5, y: 12.5, hp: 3, maxHp: 3, alive: true },
    { x: 12.5, y: 4.5, hp: 3, maxHp: 3, alive: true },
    { x: 13.5, y: 13.5, hp: 2, maxHp: 2, alive: true },
    { x: 6.5, y: 6.5, hp: 2, maxHp: 2, alive: true },
    { x: 10.5, y: 10.5, hp: 2, maxHp: 2, alive: true },
  ],

  keys: {},

  // Precomputed RGB wall colors [lit, dark]
  WALL_RGB: [
    null,
    { lit: [127,90,240], dark: [74,47,156] },   // purple
    { lit: [231,76,60],  dark: [123,28,28]  },   // red
    { lit: [41,128,185], dark: [21,67,96]   },   // blue
    { lit: [243,156,18], dark: [125,102,8]  },   // orange
  ],
};

// ─────────────────────────────── Init ──────────────────────
function initShooterGame() {
  const canvas = document.getElementById('shooter-canvas');
  if (!canvas) return;

  document.getElementById('shooter-start-btn')?.addEventListener('click', startShooterGame);

  // Click canvas: lock pointer (first click) or shoot (while locked)
  canvas.addEventListener('click', () => {
    if (!shooterGame.running || shooterGame.paused) return;
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    } else if (shooterGame.player.reloadTimer <= 0) {
      shooterShoot();
    }
  });

  // Pointer Lock events
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener('mousemove', shooterMouseMove);
      shooterGame.mouseLocked = true;
    } else {
      document.removeEventListener('mousemove', shooterMouseMove);
      shooterGame.mouseLocked = false;
    }
  });

  document.addEventListener('keydown', shooterKeyDown);
  document.addEventListener('keyup', e => { shooterGame.keys[e.key.toLowerCase()] = false; });
}

function shooterMouseMove(e) {
  if (!shooterGame.running || shooterGame.paused) return;
  shooterGame.player.angle += e.movementX * 0.003;
}

function shooterKeyDown(e) {
  shooterGame.keys[e.key.toLowerCase()] = true;
  if (e.key === ' ' && state.openWindows?.has('shooter') && getWindow('shooter')?.style.display !== 'none') {
    e.preventDefault();
  }
}

function startShooterGame() {
  const canvas = document.getElementById('shooter-canvas');
  if (!canvas) return;
  document.getElementById('shooter-overlay').style.display = 'none';

  // Resize canvas to fill window maintaining 4:3
  resizeShooterCanvas();

  const p = shooterGame.player;
  p.x = 2.5; p.y = 2.5; p.angle = 0.3;
  p.hp = 100; p.ammo = 30; p.maxAmmo = 30; p.score = 0;
  p.shootTimer = 0; p.flashTimer = 0; p.hurtTimer = 0; p.bobPhase = 0; p.reloadTimer = 0;

  shooterGame.enemies.forEach(e => { e.hp = e.maxHp; e.alive = true; });
  // Reset enemy texture so it regenerates at correct size
  shooterGame.enemyTex = null;

  shooterGame.running = true;
  shooterGame.paused = false;
  // Request pointer lock on start
  canvas.requestPointerLock();
  if (shooterGame.req) cancelAnimationFrame(shooterGame.req);
  shooterGame.req = requestAnimationFrame(shooterLoop);
}

function stopShooterGame(msg) {
  shooterGame.running = false;
  cancelAnimationFrame(shooterGame.req);
  if (document.pointerLockElement) document.exitPointerLock();
  const overlay = document.getElementById('shooter-overlay');
  if (overlay) {
    const t = document.getElementById('shooter-overlay-title');
    const d = document.getElementById('shooter-overlay-desc');
    const b = document.getElementById('shooter-start-btn');
    if (t) t.textContent = msg || 'GAME OVER';
    if (d) d.textContent = `Final Score: ${shooterGame.player.score} pts`;
    if (b) b.textContent = 'RETRY';
    overlay.style.display = 'flex';
  }
}

// ─────────────────────────────── Game Loop ─────────────────
function shooterLoop() {
  if (!shooterGame.running || shooterGame.paused) return;
  shooterUpdate();
  shooterRender();
  shooterGame.req = requestAnimationFrame(shooterLoop);
}

// ─────────────────────────────── Update ────────────────────
function shooterUpdate() {
  const p = shooterGame.player;
  const keys = shooterGame.keys;
  const isWall = (x, y) => (shooterGame.map[Math.floor(y)]?.[Math.floor(x)] || 0) > 0;
  const M = 0.28;

  const dx = Math.cos(p.angle);
  const dy = Math.sin(p.angle);
  const sx = Math.cos(p.angle + Math.PI/2);
  const sy = Math.sin(p.angle + Math.PI/2);

  const move = (vx, vy) => {
    const nx = p.x + vx, ny = p.y + vy;
    if (!isWall(nx + Math.sign(vx)*M, p.y-M) && !isWall(nx + Math.sign(vx)*M, p.y) && !isWall(nx + Math.sign(vx)*M, p.y+M)) p.x = nx;
    if (!isWall(p.x-M, ny + Math.sign(vy)*M) && !isWall(p.x, ny + Math.sign(vy)*M) && !isWall(p.x+M, ny + Math.sign(vy)*M)) p.y = ny;
    p.bobPhase += 0.15;
  };

  if (keys['w'] || keys['arrowup']) move(dx * 0.06, dy * 0.06);
  if (keys['s'] || keys['arrowdown']) move(-dx * 0.04, -dy * 0.04);
  if (keys['a'] || keys['arrowleft']) move(-sx * 0.05, -sy * 0.05);
  if (keys['d'] || keys['arrowright']) move(sx * 0.05, sy * 0.05);

  // Reload
  if (p.reloadTimer > 0) {
    p.reloadTimer--;
    if (p.reloadTimer === 0) {
      p.ammo = p.maxAmmo; // reload complete
    }
  }

  // Manual reload (R key) or auto-reload when empty
  const wantReload = keys['r'] && p.ammo < p.maxAmmo && p.reloadTimer <= 0;
  const autoReload = p.ammo <= 0 && p.reloadTimer <= 0;
  if (wantReload || autoReload) {
    p.reloadTimer = p.RELOAD_TIME;
  }

  // Shooting (blocked while reloading)
  if (keys[' '] && p.shootTimer <= 0 && p.reloadTimer <= 0) shooterShoot();
  if (p.shootTimer > 0) p.shootTimer--;
  if (p.flashTimer > 0) p.flashTimer--;
  if (p.hurtTimer > 0) p.hurtTimer--;


  // Enemy proximity damage
  for (const e of shooterGame.enemies) {
    if (!e.alive) continue;
    const ex = e.x - p.x, ey = e.y - p.y;
    if (ex*ex + ey*ey < 2.25 && Math.random() < 0.008) {
      p.hp = Math.max(0, p.hp - 8);
      p.hurtTimer = 25;
      if (p.hp <= 0) { stopShooterGame('YOU DIED'); return; }
    }
  }
}

// ─────────────────────────────── Render ────────────────────
function shooterWallColor(type, side, dist) {
  const w = shooterGame.WALL_RGB[type] || { lit:[80,80,80], dark:[50,50,50] };
  const [r, g, b] = side === 1 ? w.dark : w.lit;
  const fog = Math.min(1, dist / 7);
  // Fog target: rgb(26, 10, 26) - dark purple void
  return `rgb(${(r*(1-fog)+26*fog)|0},${(g*(1-fog)+10*fog)|0},${(b*(1-fog)+26*fog)|0})`;
}

function shooterRender() {
  const canvas = document.getElementById('shooter-canvas');
  const ctx = canvas.getContext('2d');
  const { W, H, player: p, map } = shooterGame;

  // ── 1. Background ─────────────────────────────────────────
  // Ceiling gradient
  const cg = ctx.createLinearGradient(0, 0, 0, H/2);
  cg.addColorStop(0, '#080310'); cg.addColorStop(1, '#1a0a2a');
  ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H/2);
  // Floor gradient
  const fg = ctx.createLinearGradient(0, H/2, 0, H);
  fg.addColorStop(0, '#10100e'); fg.addColorStop(1, '#080808');
  ctx.fillStyle = fg; ctx.fillRect(0, H/2, W, H/2);

  // ── 2. Raycasting ─────────────────────────────────────────
  const dirX = Math.cos(p.angle), dirY = Math.sin(p.angle);
  const planeX = -dirY * 0.66, planeY = dirX * 0.66;
  const zBuffer = new Float64Array(W);

  for (let x = 0; x < W; x++) {
    const camX = 2 * x / W - 1;
    const rayDX = dirX + planeX * camX;
    const rayDY = dirY + planeY * camX;

    let mx = Math.floor(p.x), my = Math.floor(p.y);
    const deltaX = Math.abs(1 / (rayDX || 1e-30));
    const deltaY = Math.abs(1 / (rayDY || 1e-30));
    let stepX, stepY, sdx, sdy;

    if (rayDX < 0) { stepX=-1; sdx=(p.x-mx)*deltaX; } else { stepX=1; sdx=(mx+1-p.x)*deltaX; }
    if (rayDY < 0) { stepY=-1; sdy=(p.y-my)*deltaY; } else { stepY=1; sdy=(my+1-p.y)*deltaY; }

    let hit=false, side=0, wallType=0;
    for (let s=0; s<32 && !hit; s++) {
      if (sdx < sdy) { sdx+=deltaX; mx+=stepX; side=0; }
      else            { sdy+=deltaY; my+=stepY; side=1; }
      if ((map[my]?.[mx] || 0) > 0) { hit=true; wallType=map[my][mx]; }
    }

    const perp = side===0 ? sdx-deltaX : sdy-deltaY;
    zBuffer[x] = perp;

    const wallH = Math.min(H*2, (H / Math.max(0.001, perp)) | 0);
    const ds = Math.max(0, (H-wallH)>>1);
    const de = Math.min(H-1, (H+wallH)>>1);

    ctx.fillStyle = shooterWallColor(wallType, side, perp);
    ctx.fillRect(x, ds, 1, de - ds);
  }

  // ── 3. Enemy Sprites ─────────────────────────────────────
  // Generate enemy texture once lazily
  if (!shooterGame.enemyTex) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const cx2 = c.getContext('2d');
    cx2.fillStyle = '#e74c3c';
    cx2.beginPath(); cx2.arc(32, 32, 28, 0, Math.PI*2); cx2.fill();
    const rg2 = cx2.createRadialGradient(32, 32, 10, 32, 32, 28);
    rg2.addColorStop(0, 'transparent'); rg2.addColorStop(1, 'rgba(0,0,0,0.6)');
    cx2.fillStyle = rg2; cx2.beginPath(); cx2.arc(32, 32, 28, 0, Math.PI*2); cx2.fill();
    cx2.fillStyle = '#fff';
    cx2.beginPath(); cx2.arc(32, 26, 12, 0, Math.PI*2); cx2.fill();
    cx2.fillStyle = '#f1c40f';
    cx2.beginPath(); cx2.arc(32, 26, 6, 0, Math.PI*2); cx2.fill();
    cx2.fillStyle = '#000';
    cx2.beginPath(); cx2.arc(32, 26, 2, 0, Math.PI*2); cx2.fill();
    cx2.fillStyle = '#000';
    cx2.beginPath(); cx2.arc(32, 46, 12, 0, Math.PI, false); cx2.fill();
    cx2.fillStyle = '#fff';
    for(let tx=22; tx<=42; tx+=4) {
      cx2.beginPath(); cx2.moveTo(tx, 46); cx2.lineTo(tx+2, 54); cx2.lineTo(tx+4, 46); cx2.fill();
    }
    shooterGame.enemyTex = c;
  }

  const alive2 = shooterGame.enemies.filter(e => e.alive);
  alive2.sort((a,b) => ((b.x-p.x)**2+(b.y-p.y)**2) - ((a.x-p.x)**2+(a.y-p.y)**2));
  const invDet = 1 / (planeX*dirY - dirX*planeY);

  for (const e of alive2) {
    const espx = e.x-p.x, espy = e.y-p.y;
    const tX = invDet*(dirY*espx - dirX*espy);
    const tY = invDet*(-planeY*espx + planeX*espy);
    if (tY <= 0.15) continue;

    const screenX = ((W/2)*(1+tX/tY)) | 0;
    const sH = Math.abs((H/tY)|0);
    const sW = Math.max(1, (sH * 0.6) | 0);
    const sY0 = Math.max(0, (H-sH)>>1);
    const sY1 = Math.min(H-1, (H+sH)>>1);
    const sX0 = Math.max(0, screenX-(sW>>1));
    const sX1 = Math.min(W-1, screenX+(sW>>1));
    const hR = e.hp / e.maxHp;

    // Fog: max 55% opacity, starts at distance 3, max at 10
    const fog = Math.max(0, Math.min(0.55, (tY - 1.5) / 9));

    if (sY1 > sY0 && sW > 0 && shooterGame.enemyTex) {
      for (let stripe=sX0; stripe<=sX1; stripe++) {
        if (tY < zBuffer[stripe]) {
          const texX = Math.max(0, Math.min(63, Math.floor(((stripe - sX0) / sW) * 64)));
          ctx.drawImage(shooterGame.enemyTex, texX, 0, 1, 64, stripe, sY0, 1, sY1-sY0);
          if (fog > 0) {
            ctx.fillStyle = `rgba(26,10,26,${fog.toFixed(2)})`;
            ctx.fillRect(stripe, sY0, 1, sY1-sY0);
          }
        }
      }
    }

    // HP bar above enemy
    if (tY < 8 && sY1 > sY0) {
      const bW = Math.max(20, Math.min(50, sW));
      const bX = Math.max(0, screenX-(bW>>1)), bY = Math.max(2, sY0-10);
      ctx.fillStyle = '#300'; ctx.fillRect(bX, bY, bW, 4);
      ctx.fillStyle = hR > 0.5 ? '#2ecc71' : '#e74c3c';
      ctx.fillRect(bX, bY, Math.max(0, bW*hR), 4);
    }
  }

  // ── 4. Crosshair ─────────────────────────────────────────
  const cx=W/2, cy=H/2;
  ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(cx-10,cy); ctx.lineTo(cx-4,cy);
  ctx.moveTo(cx+4,cy);  ctx.lineTo(cx+10,cy);
  ctx.moveTo(cx,cy-10); ctx.lineTo(cx,cy-4);
  ctx.moveTo(cx,cy+4);  ctx.lineTo(cx,cy+10);
  ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(cx,cy,2,0,Math.PI*2); ctx.fill();

  // ── 5. Gun ───────────────────────────────────────────────
  const bob = Math.sin(p.bobPhase)*5;
  const gY = H-112+bob+(p.flashTimer>0?-14:0);
  const gX = W/2;
  // Barrel
  ctx.fillStyle='#2d2d2d'; ctx.fillRect(gX-6, gY, 12, 34);
  // Sight
  ctx.fillStyle='#555'; ctx.fillRect(gX-3, gY-4, 6, 6);
  // Body
  ctx.fillStyle='#404040';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(gX-40,gY+26,80,22,4); else ctx.rect(gX-40,gY+26,80,22);
  ctx.fill();
  // Grip
  ctx.fillStyle='#5c3b1e';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(gX+12,gY+24,22,32,3); else ctx.rect(gX+12,gY+24,22,32);
  ctx.fill();
  // Trigger guard
  ctx.strokeStyle='#555'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(gX+6,gY+38,10,0,Math.PI); ctx.stroke();
  // Muzzle flash
  if (p.flashTimer>0) {
    const ft=p.flashTimer/8;
    ctx.fillStyle=`rgba(255,210,50,${ft*0.95})`;
    ctx.beginPath(); ctx.arc(gX,gY-10,ft*14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=`rgba(255,255,255,${ft*0.6})`;
    ctx.beginPath(); ctx.arc(gX,gY-10,ft*6,0,Math.PI*2); ctx.fill();
    // Flash streaks
    ctx.strokeStyle=`rgba(255,220,80,${ft*0.5})`;
    ctx.lineWidth=2;
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2;
      ctx.beginPath();
      ctx.moveTo(gX,gY-10);
      ctx.lineTo(gX+Math.cos(a)*22*ft,gY-10+Math.sin(a)*22*ft);
      ctx.stroke();
    }
  }

  // ── 6. HUD bar ────────────────────────────────────────────
  ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,H-40,W,40);

  // HP bar
  ctx.fillStyle='#1a0a1a'; ctx.fillRect(10,H-28,130,16);
  const hpR=p.hp/100;
  ctx.fillStyle=p.hp>60?'#2ecc71':p.hp>30?'#f39c12':'#e74c3c';
  ctx.fillRect(11,H-27,128*hpR,14);
  ctx.fillStyle='#fff'; ctx.font='bold 10px Ubuntu,monospace'; ctx.textAlign='left';
  ctx.fillText(`♥ ${p.hp}/100`,14,H-14);

  // Ammo / Reload
  if (p.reloadTimer > 0) {
    // Show RELOADING progress bar
    const reloadProg = 1 - (p.reloadTimer / p.RELOAD_TIME);
    const bW = 110, bX = W/2 - bW/2;
    ctx.fillStyle = '#222'; ctx.fillRect(bX, H-32, bW, 10);
    ctx.fillStyle = '#f39c12'; ctx.fillRect(bX, H-32, bW * reloadProg, 10);
    ctx.fillStyle = '#f39c12'; ctx.font = 'bold 10px Ubuntu,monospace'; ctx.textAlign = 'center';
    ctx.fillText('RELOADING...', W/2, H-14);
  } else {
    ctx.fillStyle = p.ammo > 8 ? '#f1c40f' : (p.ammo > 0 ? '#e74c3c' : '#666');
    ctx.font = 'bold 13px Ubuntu,monospace'; ctx.textAlign = 'center';
    ctx.fillText(`⬡ ${p.ammo} / ${p.maxAmmo}`, W/2, H-14);
    if (p.ammo === 0) {
      ctx.fillStyle = 'rgba(255,100,0,0.6)'; ctx.font = 'bold 10px Ubuntu,monospace';
      ctx.fillText('[R] RELOAD', W/2, H-28);
    }
  }

  // Score
  ctx.fillStyle='#c084fc'; ctx.textAlign='right';
  ctx.fillText(`${p.score} pts`,W-10,H-14);
  ctx.textAlign='left';

  // Enemies remaining indicator
  const aliveCount=shooterGame.enemies.filter(e=>e.alive).length;
  ctx.fillStyle=aliveCount>0?'#e74c3c':'#2ecc71';
  ctx.font='bold 10px Ubuntu,monospace'; ctx.textAlign='right';
  ctx.fillText(`${aliveCount} enemy left`,W-8,18);
  ctx.textAlign='left';

  // ── 7. Screen FX ─────────────────────────────────────────
  if (p.hurtTimer>0) {
    ctx.fillStyle=`rgba(231,76,60,${(p.hurtTimer/25)*0.45})`;
    ctx.fillRect(0,0,W,H);
  }

  // ── 8. Minimap ────────────────────────────────────────────
  const mms=7, mp=8, rows=shooterGame.map.length, cols=shooterGame.map[0].length;
  ctx.globalAlpha=0.75;
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(mp-2,mp-2,cols*mms+4,rows*mms+4);
  for (let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    ctx.fillStyle=shooterGame.map[r][c]>0?'#7f5af0':'#12091e';
    ctx.fillRect(mp+c*mms,mp+r*mms,mms-1,mms-1);
  }
  for(const e of shooterGame.enemies) {
    if(!e.alive) continue;
    ctx.fillStyle='#e74c3c';
    ctx.fillRect(mp+e.x*mms-2,mp+e.y*mms-2,4,4);
  }
  ctx.fillStyle='#f1c40f';
  ctx.fillRect(mp+p.x*mms-3,mp+p.y*mms-3,6,6);
  ctx.strokeStyle='#f1c40f'; ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(mp+p.x*mms,mp+p.y*mms);
  ctx.lineTo(mp+(p.x+Math.cos(p.angle)*2)*mms,mp+(p.y+Math.sin(p.angle)*2)*mms);
  ctx.stroke();
  ctx.globalAlpha=1;
}

// ─────────────────────────────── Shoot ─────────────────────
function shooterShoot() {
  const p = shooterGame.player;
  if (p.ammo<=0 || p.shootTimer>0) return;
  p.ammo--; p.shootTimer=18; p.flashTimer=9;

  const dirX=Math.cos(p.angle), dirY=Math.sin(p.angle);

  // Get wall distance along center ray
  let wallDist=20;
  {
    let mx=Math.floor(p.x), my=Math.floor(p.y);
    const ddx=Math.abs(1/(dirX||1e-30)), ddy=Math.abs(1/(dirY||1e-30));
    let sdx=dirX<0?(p.x-mx)*ddx:(mx+1-p.x)*ddx;
    let sdy=dirY<0?(p.y-my)*ddy:(my+1-p.y)*ddy;
    const sx=dirX<0?-1:1, sy=dirY<0?-1:1;
    for(let i=0;i<32;i++){
      if(sdx<sdy){sdx+=ddx;mx+=sx;}else{sdy+=ddy;my+=sy;}
      if((shooterGame.map[my]?.[mx]||0)>0){wallDist=Math.min(sdx-ddx,sdy-ddy);break;}
    }
  }

  let hitEnemy=null, minDist=wallDist;
  for(const e of shooterGame.enemies){
    if(!e.alive) continue;
    const ex=e.x-p.x, ey=e.y-p.y;
    const dist=Math.sqrt(ex*ex+ey*ey);
    if(dist>=minDist) continue;
    let ad=Math.atan2(ey,ex)-p.angle;
    while(ad>Math.PI)ad-=2*Math.PI; while(ad<-Math.PI)ad+=2*Math.PI;
    // Tolerance widens at close range
    if(Math.abs(ad) < 0.18+0.2/Math.max(0.5,dist)){
      minDist=dist; hitEnemy=e;
    }
  }

  if(hitEnemy){
    hitEnemy.hp--;
    if(hitEnemy.hp<=0){
      hitEnemy.alive=false;
      p.score+=100;
      if(!shooterGame.enemies.some(e=>e.alive)){
        setTimeout(()=>stopShooterGame('MISSION COMPLETE! 🎖️'),800);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initShooterGame(), 700);
});

// ─────────────────────────────── Canvas Resize ─────────────
function resizeShooterCanvas() {
  const canvas = document.getElementById('shooter-canvas');
  if (!canvas) return;

  // Canvas CSS is 100%x100% of win-body, so offsetWidth/Height is the actual display size
  const W = canvas.offsetWidth  || 480;
  const H = canvas.offsetHeight || 360;

  // Set internal render resolution to match display (no distortion, no letterboxing)
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width  = W;
    canvas.height = H;
    shooterGame.W = W;
    shooterGame.H = H;
  }
}
