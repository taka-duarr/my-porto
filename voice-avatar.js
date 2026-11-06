/* ═══════════════════════════════════════════════════════════
   VOICE AVATAR — animated character + VOICEVOX (WhiteCUL) speech
   Voice: VOICEVOX:WhiteCUL via https://api.tts.quest (unofficial web API)
   The character artwork is original vector art drawn for this site.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const API = 'https://api.tts.quest/v3/voicevox/synthesis';
  // VOICEVOX WhiteCUL styles
  const SPEAKER = { normal: 23, happy: 24, sad: 25 };
  const MAX_CHARS = 900;
  const CANCEL = { cancelled: true };

  // Three.js is only downloaded when the chat window is opened (pinned version + SRI hash).
  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.159.0/three.min.js';
  const THREE_SRI = 'sha384-Lwojr+0fOVR25P8bdL6E0T2dv0q0ZT4Yy2Ia1dGOz6b5jLSzWZkdqlw0cKTQYKzT';

  const POKES = [
    { jp: 'こんにちは！ポートフォリオへようこそ。', emo: 'happy' },
    { jp: '質問があったら、チャットで聞いてね。', emo: 'normal' },
    { jp: 'えへへ、くすぐったいよ。', emo: 'happy' },
    { jp: 'プロジェクトも、ぜひ見てくださいね。', emo: 'normal' }
  ];

  const SVG = `
<svg class="vv-svg" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="vvHair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f2ff"/><stop offset="1" stop-color="#c9c3ee"/>
    </linearGradient>
    <linearGradient id="vvHood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7c6cf0"/><stop offset="1" stop-color="#4f3fb8"/>
    </linearGradient>
  </defs>
  <g class="vv-sway">
    <g class="vv-body">
      <g class="vv-tail vv-tail-l"><path d="M52 66 C22 88 14 148 30 200 C46 168 54 124 62 90Z" fill="url(#vvHair)"/></g>
      <g class="vv-tail vv-tail-r"><path d="M148 66 C178 88 186 148 170 200 C154 168 146 124 138 90Z" fill="url(#vvHair)"/></g>
      <path d="M100 16 C52 16 38 58 40 108 C42 146 34 170 46 196 L154 196 C166 170 158 146 160 108 C162 58 148 16 100 16Z" fill="#d9d4f6"/>
      <path d="M36 232 C36 192 68 172 100 172 C132 172 164 192 164 232Z" fill="url(#vvHood)"/>
      <path d="M78 174 Q100 196 122 174 L118 172 Q100 186 82 172Z" fill="#f4f2ff"/>
      <rect x="90" y="146" width="20" height="30" rx="8" fill="#ffd9c4"/>
      <g class="vv-head-bob">
        <g class="vv-head">
          <ellipse cx="100" cy="98" rx="46" ry="50" fill="#ffe4d4"/>
          <ellipse cx="72" cy="118" rx="9" ry="5" fill="#ff9fb4" opacity=".45"/>
          <ellipse cx="128" cy="118" rx="9" ry="5" fill="#ff9fb4" opacity=".45"/>
          <g class="vv-brows" stroke="#8d86b8" stroke-width="2.6" stroke-linecap="round" fill="none">
            <path class="vv-brow-l" d="M68 84 Q78 80 88 84"/>
            <path class="vv-brow-r" d="M112 84 Q122 80 132 84"/>
          </g>
          <g class="vv-eyes vv-eyes-open">
            <g class="vv-eye"><ellipse cx="78" cy="102" rx="10" ry="12" fill="#fff" stroke="#6f66a6" stroke-width="2"/>
              <g class="vv-pupil"><circle cx="78" cy="104" r="7.4" fill="#7f6bff"/><circle cx="78" cy="104" r="3.6" fill="#241c55"/><circle cx="75" cy="100" r="2.2" fill="#fff"/></g></g>
            <g class="vv-eye"><ellipse cx="122" cy="102" rx="10" ry="12" fill="#fff" stroke="#6f66a6" stroke-width="2"/>
              <g class="vv-pupil"><circle cx="122" cy="104" r="7.4" fill="#7f6bff"/><circle cx="122" cy="104" r="3.6" fill="#241c55"/><circle cx="119" cy="100" r="2.2" fill="#fff"/></g></g>
          </g>
          <g class="vv-eyes vv-eyes-happy" stroke="#4a4180" stroke-width="3.2" stroke-linecap="round" fill="none">
            <path d="M67 106 Q78 92 89 106"/><path d="M111 106 Q122 92 133 106"/>
          </g>
          <path class="vv-tear" d="M132 116 q-3 6 0 8 q3 -2 0 -8z" fill="#8fd3ff"/>
          <path class="vv-mouth vv-mouth-normal" d="M92 128 Q100 134 108 128" stroke="#a24a5f" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          <path class="vv-mouth vv-mouth-happy" d="M90 126 Q100 140 110 126 Z" fill="#a24a5f" stroke="#a24a5f" stroke-width="2" stroke-linejoin="round"/>
          <path class="vv-mouth vv-mouth-sad" d="M92 133 Q100 125 108 133" stroke="#a24a5f" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          <g class="vv-talk"><ellipse class="vv-talk-o" cx="100" cy="130" rx="6" ry="1" fill="#8d2f48"/><ellipse class="vv-talk-t" cx="100" cy="131" rx="3.4" ry="0.1" fill="#ff8da1"/></g>
          <path d="M52 94 C50 50 78 32 100 32 C124 32 150 50 148 94 C140 72 126 62 112 58 C106 74 92 74 86 60 C70 64 58 76 52 94Z" fill="url(#vvHair)"/>
          <path d="M52 94 C47 122 52 142 60 154 C64 134 63 112 60 98Z" fill="url(#vvHair)"/>
          <path d="M148 94 C153 122 148 142 140 154 C136 134 137 112 140 98Z" fill="url(#vvHair)"/>
          <path class="vv-ahoge" d="M100 34 C96 20 108 12 116 18 C110 20 106 26 106 36Z" fill="url(#vvHair)"/>
          <path d="M44 64 l12 -6 l-3 13 z M156 64 l-12 -6 l3 13 z" fill="#7c6cf0"/>
        </g>
      </g>
    </g>
  </g>
  <g class="vv-think" fill="#c9c3ee"><circle cx="160" cy="36" r="3"/><circle cx="170" cy="28" r="4"/><circle cx="182" cy="18" r="5"/></g>
  <g class="vv-spark" fill="#ffe27a"><path d="M30 44 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/><path d="M172 70 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/></g>
</svg>`;

  let ctx = null, analyser = null, curSrc = null, curAudio = null, curNode = null, rafId = 0, token = 0;
  let subtitle = null;
  let root = null, els = {}, muted = false, mouth = 0, state = 'idle', emo = 'normal';
  let thinking = false;
  let char = null, threePromise = null, view = 'bust';
  const ptr = { x: 0, y: 0, t: 0 };
  let idleLabel = 'Klik aku untuk menyapa';

  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (threePromise) return threePromise;
    threePromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = THREE_URL;
      s.integrity = THREE_SRI;
      s.crossOrigin = 'anonymous';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Gagal memuat Three.js'));
      document.head.appendChild(s);
    });
    return threePromise;
  }

  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let lingerTimer = 0;
  function setState(s) {
    if (root && s === 'idle' && (state === 'speaking' || state === 'silent' || state === 'error')) {
      root.classList.add('vv-linger');
      clearTimeout(lingerTimer);
      lingerTimer = setTimeout(() => root.classList.remove('vv-linger'), 4500);
    }
    state = s;
    if (!root) return;
    root.dataset.state = s;
    const label = {
      idle: idleLabel,
      thinking: 'Sedang berpikir...',
      loading: 'Menyiapkan suara...',
      speaking: 'Sedang berbicara',
      silent: 'Suara dimatikan',
      error: 'Suara belum tersedia, coba lagi nanti'
    }[s] || '';
    if (els.status) els.status.textContent = label;
  }

  function setEmo(e) {
    emo = SPEAKER[e] ? e : 'normal';
    if (root) root.dataset.emo = emo;
  }

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('Web Audio tidak didukung');
      ctx = new AC();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  // ── Speech synthesis through tts.quest ──
  // Asks tts.quest to start a job. The free API answers 429 with retryAfter when called too
  // often, so wait and retry (and tell the user why nothing is happening yet).
  async function requestJob(text, speaker, my) {
    let job = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(API + '?text=' + encodeURIComponent(text) + '&speaker=' + speaker);
      job = await res.json();
      if (job.success) break;
      if (job.retryAfter) {
        const wait = Number(job.retryAfter) + 0.3;
        if (els.status) els.status.textContent = 'Antre suara, menunggu ' + Math.ceil(wait) + ' dtk...';
        await sleep(wait * 1000);
        if (my !== token) throw CANCEL;
        if (els.status) els.status.textContent = 'Menyiapkan suara...';
        continue;
      }
      throw new Error(job.errorMessage || 'Sintesis suara gagal');
    }
    if (!job || !job.success) throw new Error('Server suara sedang sibuk');
    return job;
  }

  // Fallback when streaming fails: wait until the whole file is ready, then decode it.
  async function fetchFinished(job, my, textLength) {
    const started = Date.now();
    const limit = Math.max(25000, textLength * 450);
    for (;;) {
      if (my !== token) throw CANCEL;
      const st = await (await fetch(job.audioStatusUrl + '?t=' + Date.now())).json();
      if (st.isAudioError) throw new Error('Sintesis suara gagal');
      if (st.isAudioReady) break;
      if (Date.now() - started > limit) throw new Error('Sintesis suara terlalu lama');
      await sleep(400);
    }
    const data = await (await fetch(job.mp3DownloadUrl)).arrayBuffer();
    return ctx.decodeAudioData(data);
  }

  function stopAudio() {
    if (curAudio) {
      const a = curAudio;
      curAudio = null;
      try { a.onended = a.onerror = a.onplaying = null; a.pause(); a.removeAttribute('src'); a.load(); } catch (e) { /* ignore */ }
      try { if (curNode) curNode.disconnect(); } catch (e) { /* ignore */ }
      curNode = null;
    }
    subtitle = null;
    if (curSrc) {
      try { curSrc.onended = null; curSrc.stop(); } catch (e) { /* already stopped */ }
      try { curSrc.disconnect(); } catch (e) { /* ignore */ }
      curSrc = null;
    }
  }

  // Plays the chunked MP3 stream while the server is still generating it, with lip-sync.
  function playStream(url, my) {
    return new Promise((resolve, reject) => {
      const a = new Audio();
      a.crossOrigin = 'anonymous';
      a.preload = 'auto';
      let node;
      try {
        node = ctx.createMediaElementSource(a);
        node.connect(analyser);
      } catch (e) { reject(e); return; }
      curAudio = a; curNode = node;
      let started = false;
      const guard = setTimeout(() => { if (!started) { stopAudio(); reject(new Error('Stream suara tidak mulai')); } }, 40000);
      a.onplaying = () => {
        if (started) return;
        started = true; clearTimeout(guard);
        if (my === token) setState('speaking');
      };
      a.onended = () => { clearTimeout(guard); if (curAudio === a) stopAudio(); resolve(); };
      a.onerror = () => { clearTimeout(guard); if (curAudio === a) stopAudio(); reject(new Error('Stream suara gagal')); };
      a.src = url;
      a.play().catch((err) => { clearTimeout(guard); if (curAudio === a) stopAudio(); reject(err); });
    });
  }

  // Splits the spoken text into sentences so the bubble can follow along while it speaks.
  function makeSubtitle(text) {
    const parts = text.split(/(?<=[。！？!?\n])/).map((x) => x.trim()).filter(Boolean);
    const total = parts.reduce((n, x) => n + x.length, 0) || 1;
    return { parts: parts.length ? parts : [text], total: total, secs: total / 5.2 };
  }

  function playBuffer(buf) {
    return new Promise((resolve) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(analyser);
      curSrc = src;
      src.onended = () => { if (curSrc === src) curSrc = null; resolve(); };
      src.start();
    });
  }

  // ── Lip-sync / idle animation loop ──
  const timeData = new Uint8Array(512);
  function frame(t) {
    rafId = requestAnimationFrame(frame);
    if (!root || !root.isConnected) return;
    let target = 0;
    if ((curSrc || curAudio) && analyser) {
      analyser.getByteTimeDomainData(timeData);
      let sum = 0;
      for (let i = 0; i < timeData.length; i++) { const v = (timeData[i] - 128) / 128; sum += v * v; }
      target = clamp((Math.sqrt(sum / timeData.length) - 0.015) * 7, 0, 1);
    } else if (state === 'silent') {
      target = (Math.sin(t / 95) * 0.5 + 0.5) * (Math.sin(t / 310) * 0.5 + 0.5);
    }
    mouth += (target - mouth) * 0.5;
    if (subtitle && curAudio && els.sub && !curAudio.paused) {
      let k = clamp(curAudio.currentTime / subtitle.secs, 0, 0.9999) * subtitle.total, i = 0;
      while (i < subtitle.parts.length - 1 && k >= subtitle.parts[i].length) { k -= subtitle.parts[i].length; i++; }
      const line = subtitle.parts[i];
      if (els.sub.textContent !== line) els.sub.textContent = line;
    }
    const open = mouth > 0.06;
    root.classList.toggle('vv-mouth-open', open);
    if (els.mouthO) {
      if (open) {
        els.mouthO.setAttribute('ry', (1 + mouth * 9).toFixed(2));
        els.mouthO.setAttribute('rx', (6.4 - mouth * 1.6).toFixed(2));
        els.mouthT.setAttribute('ry', Math.max(0.1, mouth * 3.6).toFixed(2));
      }
      const bob = mouth * 2.2;
      els.bob.style.transform = 'translateY(' + bob.toFixed(2) + 'px) rotate(' + (Math.sin(t / 260) * mouth * 1.6).toFixed(2) + 'deg)';
    }
    if (char && els.avatar.offsetWidth > 0 && !document.hidden) {
      char.update(t, { mouth: mouth, emo: emo, state: state, look: lookVector(t) });
    }
  }

  // Pointer position relative to the character, -1..1 (drifts gently when the pointer is idle)
  function lookVector(t) {
    if (performance.now() - ptr.t > 3500) return { x: Math.sin(t / 2300) * 0.25, y: Math.sin(t / 3100) * 0.1 };
    const r = els.avatar.getBoundingClientRect();
    return {
      x: clamp((ptr.x - (r.left + r.width / 2)) / 320, -1, 1),
      y: clamp((ptr.y - (r.top + r.height * 0.3)) / 260, -1, 1)
    };
  }

  function lookAt(x, y) {
    ptr.x = x; ptr.y = y; ptr.t = performance.now();
    if (!els.pupils || !els.svg) return;
    const r = els.svg.getBoundingClientRect();
    if (!r.width) return;
    const dx = clamp((x - (r.left + r.width / 2)) / 260, -1, 1) * 3;
    const dy = clamp((y - (r.top + r.height * 0.45)) / 260, -1, 1) * 2.4;
    els.pupils.forEach((p) => { p.style.transform = 'translate(' + dx.toFixed(2) + 'px, ' + dy.toFixed(2) + 'px)'; });
  }

  // ── Public API ──
  async function speak(opts) {
    if (!root) return;
    let text = String((opts && opts.jp) || '').replace(/[*_`#>\[\]]/g, '').trim();
    if (text.length > MAX_CHARS) {
      const cut = text.lastIndexOf('。', MAX_CHARS);
      text = text.slice(0, cut > MAX_CHARS * 0.5 ? cut + 1 : MAX_CHARS);
    }
    if (!text) return;
    const my = ++token;
    stopAudio();
    setEmo(opts.emo);
    const sub = makeSubtitle(text);
    if (els.sub) els.sub.textContent = sub.parts[0];
    root.classList.add('vv-has-sub');

    if (muted) {
      setState('silent');
      await sleep(Math.min(5000, 900 + text.length * 120));
      if (my === token) { setState(thinking ? 'thinking' : 'idle'); setEmo('normal'); }
      return;
    }
    setState('loading');
    try {
      ensureCtx();
      const job = await requestJob(text, SPEAKER[emo], my);
      if (my !== token) return;
      let played = false;
      try {
        subtitle = sub;
        await playStream(job.mp3StreamingUrl, my);
        played = true;
      } catch (streamErr) {
        if (my !== token) return;
        console.warn('VoiceAvatar stream, falling back to the finished file:', streamErr);
      }
      if (!played && my === token) {
        subtitle = null;
        const buf = await fetchFinished(job, my, text.length);
        if (my !== token) return;
        setState('speaking');
        await playBuffer(buf);
      }
    } catch (e) {
      if (e !== CANCEL) { console.warn('VoiceAvatar:', e); if (my === token) setState('error'); }
    } finally {
      if (my === token) {
        subtitle = null;
        if (state !== 'error') setState(thinking ? 'thinking' : 'idle');
        setTimeout(() => { if (my === token) setEmo('normal'); }, 600);
      }
    }
  }

  // Plays an audio file bundled with the character (its own voice) with the same lip-sync.
  async function speakClip(url, e) {
    if (!root) return;
    const my = ++token;
    stopAudio();
    setEmo(e);
    if (els.sub) els.sub.textContent = '(suara asli karakter)';
    root.classList.add('vv-has-sub');
    if (muted) return;
    setState('loading');
    try {
      ensureCtx();
      const data = await (await fetch(url)).arrayBuffer();
      const buf = await ctx.decodeAudioData(data);
      if (my !== token) return;
      setState('speaking');
      await playBuffer(buf);
    } catch (err) {
      console.warn('VoiceAvatar clip:', err);
      if (my === token) setState('error');
    } finally {
      if (my === token) {
        if (state !== 'error') setState(thinking ? 'thinking' : 'idle');
        setTimeout(() => { if (my === token) setEmo('normal'); }, 600);
      }
    }
  }

  function stop() {
    token++;
    stopAudio();
    thinking = false;
    if (root) { setState('idle'); setEmo('normal'); }
  }

  function setThinking(on) {
    thinking = !!on;
    if (!root || state === 'speaking' || state === 'loading') return;
    setState(on ? 'thinking' : 'idle');
  }

  function applyMute() {
    if (!els.muteBtn) return;
    els.muteBtn.innerHTML = '<i class="fas ' + (muted ? 'fa-volume-xmark' : 'fa-volume-high') + '"></i> Suara' + (muted ? ' mati' : '');
    els.muteBtn.title = muted ? 'Nyalakan suara' : 'Matikan suara';
    els.muteBtn.setAttribute('aria-pressed', String(muted));
  }

  function wiggle() {
    els.avatar.classList.remove('vv-poke');
    void els.avatar.offsetWidth;
    els.avatar.classList.add('vv-poke');
  }

  function mount() {
    const host = document.getElementById('vv-stage');
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    root = host;
    els.avatar = host.querySelector('.vv-avatar');
    els.avatar.innerHTML = SVG;
    els.svg = els.avatar.querySelector('.vv-svg');
    els.pupils = Array.from(els.svg.querySelectorAll('.vv-pupil'));
    els.bob = els.svg.querySelector('.vv-head-bob');
    els.mouthO = els.svg.querySelector('.vv-talk-o');
    els.mouthT = els.svg.querySelector('.vv-talk-t');
    els.sub = host.querySelector('.vv-sub');
    els.status = host.querySelector('.vv-status');
    const scope = host.closest('.kc') || host.closest('.chatbot-content') || host;
    els.muteBtn = scope.querySelector('.vv-mute');
    els.foldBtn = scope.querySelector('.vv-fold');

    muted = lsGet('vv_muted') === '1';
    applyMute();
    host.classList.toggle('vv-folded', lsGet('vv_folded') === '1');
    applyFold();
    setState('idle');
    setEmo('normal');

    els.muteBtn.addEventListener('click', () => {
      muted = !muted;
      lsSet('vv_muted', muted ? '1' : '0');
      applyMute();
      if (muted) { token++; stopAudio(); setState(thinking ? 'thinking' : 'idle'); }
    });
    els.foldBtn.addEventListener('click', () => {
      const f = host.classList.toggle('vv-folded');
      lsSet('vv_folded', f ? '1' : '0');
      applyFold();
    });
    els.viewBtn = scope.querySelector('.vv-view');
    if (els.viewBtn) els.viewBtn.style.display = 'none';
    view = lsGet('vv_view2') === 'bust' ? 'bust' : 'full';
    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) view = 'bust';
    host.dataset.view = view;
    if (els.viewBtn) {
      els.viewBtn.addEventListener('click', () => {
        view = view === 'full' ? 'bust' : 'full';
        lsSet('vv_view2', view);
        host.dataset.view = view;
        if (char) char.setView(view);
        applyView();
      });
    }
    els.avatar.addEventListener('click', (e) => {
      if (char && char.wasDragged()) return;
      wiggle();
      if (char && char.motion) char.motion('tap_body');
      if (state === 'loading' || state === 'speaking') { stop(); return; }
      const area = char && char.hit ? char.hit(e.clientX, e.clientY) : null;
      if (area === 'body' && char.voiceUrl) { speakClip(char.voiceUrl, 'happy'); return; }
      speak(POKES[Math.floor(Math.random() * POKES.length)]);
    });
    let pending = null;
    document.addEventListener('pointermove', (e) => {
      if (pending) return;
      pending = requestAnimationFrame(() => { pending = null; lookAt(e.clientX, e.clientY); });
    }, { passive: true });

    if (!rafId) rafId = requestAnimationFrame(frame);
    els.name = host.querySelector('.vv-name');
    enableLive2D().catch((e) => { console.warn('VoiceAvatar Live2D:', e); enable3D(); });
  }

  function applyView() {
    if (!els.viewBtn) return;
    const small = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    els.viewBtn.style.display = char && !small ? '' : 'none';
    els.viewBtn.innerHTML = '<i class="fas ' + (view === 'full' ? 'fa-compress' : 'fa-expand') + '"></i>';
    els.viewBtn.title = view === 'full' ? 'Perkecil karakter' : 'Perbesar karakter';
  }

  function applyFold() {
    if (!els.foldBtn || !root) return;
    const f = root.classList.contains('vv-folded');
    els.foldBtn.innerHTML = '<i class="fas ' + (f ? 'fa-eye' : 'fa-eye-slash') + '"></i>';
    els.foldBtn.title = f ? 'Tampilkan karakter' : 'Sembunyikan karakter';
  }

  // Preferred character: the Live2D model in live2d/katou/. Rejects if it cannot load.
  function enableLive2D() {
    if (!window.VoiceAvatarL2D || char) return Promise.reject(new Error('Modul Live2D tidak tersedia'));
    const holder = document.createElement('div');
    holder.className = 'vv-3d-host';
    els.avatar.appendChild(holder);
    return window.VoiceAvatarL2D.create(holder).then((inst) => {
      if (!root || !root.isConnected || char) { holder.remove(); return; }
      const svg = els.avatar.querySelector('.vv-svg');
      if (svg) svg.remove();
      els.svg = els.pupils = els.bob = els.mouthO = els.mouthT = null;
      char = inst;
      char.setView(view);
      root.classList.add('vv-3d-mode');
      root.dataset.kind = 'l2d';
      if (els.name && els.name.firstChild) els.name.firstChild.textContent = inst.name + ' ';
      idleLabel = 'Klik kepala: menyapa. Klik badan: suara asli.';
      if (state === 'idle') setState('idle');
      applyView();
    }).catch((e) => { holder.remove(); throw e; });
  }

  // Fallback: the original 3D character built from Three.js primitives.
  // Upgrade the vector character to the 3D one; keep the vector one if anything fails.
  function enable3D() {
    if (!window.VoiceAvatar3D || char) return;
    loadThree().then(() => {
      if (!root || !root.isConnected || char) return;
      const holder = document.createElement('div');
      holder.className = 'vv-3d-host';
      let inst;
      try { inst = window.VoiceAvatar3D.create(holder); } catch (e) { console.warn('VoiceAvatar 3D:', e); return; }
      els.avatar.innerHTML = '';
      els.avatar.appendChild(holder);
      els.svg = els.pupils = els.bob = els.mouthO = els.mouthT = null;
      char = inst;
      char.setView(view);
      root.classList.add('vv-3d-mode');
      root.dataset.kind = '3d';
      applyView();
    }).catch((e) => console.warn('VoiceAvatar 3D:', e));
  }

  function unlock() { try { ensureCtx(); } catch (e) { /* audio unsupported */ } }

  window.VoiceAvatar = { mount, speak, stop, setThinking, unlock, character: () => char };
})();
