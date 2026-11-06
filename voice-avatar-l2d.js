/* ═══════════════════════════════════════════════════════════
   VOICE AVATAR LIVE2D — runs the Katou Live2D (Cubism 2) model from live2d/katou/
   Uses PixiJS + pixi-live2d-display (Cubism 2 build) + the Cubism 2 core runtime.
   Exposes the same small interface as voice-avatar-3d.js so voice-avatar.js can swap them.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const MODEL_URL = 'live2d/katou/model.json';
  const VOICE_URL = 'live2d/katou/voice/1.mp3';

  // Third-party runtime. Pinned versions + SRI hashes. Order matters.
  const DEPS = [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.5.10/browser/pixi.min.js', sri: 'sha384-98eYPI3XO3wKMBW5IUYk3WpffOsMLc+0WSK+ZMutD8S5R6e4E7hKIqFKcdHBLOMB', ready: () => window.PIXI },
    { src: 'https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js', sri: 'sha384-LWrKEMeBVbWko3WFDXTIBDN5SpFKepeYUI2JE6It+qbq+F+2NvN2QDO2J8H+8Y+O', ready: () => window.Live2D },
    { src: 'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism2.min.js', sri: 'sha384-410ROfU/36nOSxh+9HKnuS7NRhqQbOIkVaSutIA+NOfjyqSXLVQ8BvTWbmHcY7Gf', ready: () => window.PIXI && window.PIXI.live2d }
  ];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));
  const EXPRESSION = { normal: 'F_NOMAL', happy: 'F_FUN', sad: 'F_SAD' };

  let depsPromise = null;
  function loadScript(d) {
    if (d.ready()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = d.src; s.integrity = d.sri; s.crossOrigin = 'anonymous';
      s.onload = () => (d.ready() ? resolve() : reject(new Error('Library tidak aktif: ' + d.src)));
      s.onerror = () => reject(new Error('Gagal memuat ' + d.src));
      document.head.appendChild(s);
    });
  }
  function loadDeps() {
    if (!depsPromise) {
      depsPromise = DEPS.reduce((p, d) => p.then(() => loadScript(d)), Promise.resolve());
    }
    return depsPromise;
  }

  async function create(container) {
    await loadDeps();
    const PIXI = window.PIXI;
    if (PIXI.live2d.Live2DModel.registerTicker) PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);

    const canvas = document.createElement('canvas');
    canvas.className = 'vv-canvas';
    container.appendChild(canvas);

    const app = new PIXI.Application({
      view: canvas,
      width: Math.max(1, container.clientWidth),
      height: Math.max(1, container.clientHeight),
      transparent: true,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2)
    });

    let model;
    try {
      model = await PIXI.live2d.Live2DModel.from(MODEL_URL, { autoInteract: false });
    } catch (e) {
      app.destroy(true);
      throw e;
    }
    app.stage.addChild(model);
    const im = model.internalModel;
    // Real model canvas size (3000 x 3000 for this model); the art is a bust-up sitting
    // in the lower middle of it, so the views frame regions of that canvas.
    const mw = model.width / (model.scale.x || 1);
    const mh = model.height / (model.scale.y || 1);
    const REGIONS = {
      bust: { x0: 0.33, x1: 0.70, y0: 0.555, y1: 0.9 },
      // head to mid-thigh; the art extends below the nominal 3000px canvas
      full: { x0: 0.255, x1: 0.80, y0: 0.55, y1: 1.4 }
    };

    let mode = 'full';
    let cw = 0, ch = 0;
    const pose = { s: 0, x: 0, y: 0 };
    function targetPose() {
      const R = REGIONS[mode];
      const rw = (R.x1 - R.x0) * mw, rh = (R.y1 - R.y0) * mh;
      const s = Math.min(cw / rw, ch / rh);
      const x = cw / 2 - ((R.x0 + R.x1) / 2) * mw * s;
      // full view stands on the bottom edge of the box, the zoomed view is centered
      const y = mode === 'full' ? ch - R.y1 * mh * s : ch / 2 - ((R.y0 + R.y1) / 2) * mh * s;
      return { s: s, x: x, y: y };
    }
    function applyPose() {
      model.scale.set(pose.s);
      model.position.set(pose.x, pose.y);
    }
    function relayout(snap) {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return false;
      if (w !== cw || h !== ch) {
        cw = w; ch = h;
        app.renderer.resize(w, h);
        canvas.style.width = '100%'; canvas.style.height = '100%';
        snap = true;
      }
      if (snap) Object.assign(pose, targetPose());
      return true;
    }
    model.anchor.set(0, 0);
    relayout(true);
    applyPose();

    // ── state fed by voice-avatar.js ──
    const cur = { mouth: 0, emo: 'normal', state: 'idle', look: { x: 0, y: 0 } };
    let lastEmoKey = '', lastUpdate = performance.now(), lookX = 0, lookY = 0;

    // Parameters are written after the motion update so they override idle motions.
    im.on('afterMotionUpdate', () => {
      const core = im.coreModel;
      if (!core || !core.setParamFloat) return;
      if (cur.mouth > 0.02) {
        core.setParamFloat('PARAM_MOUTH_OPEN_Y', clamp(cur.mouth * 1.15, 0, 1));
        core.setParamFloat('PARAM_MOUTH_FORM', cur.emo === 'sad' ? -0.2 : 0.35);
      }
      const think = cur.state === 'thinking' || cur.state === 'loading' ? 1 : 0;
      if (think) core.addToParamFloat('PARAM_ANGLE_Z', -7, 1);
    });

    // keep the focus controller aimed at the pointer
    app.ticker.add((delta) => {
      const dt = clamp(delta / 60, 0.001, 0.05);
      lookX = damp(lookX, cur.look.x, 6, dt);
      lookY = damp(lookY, cur.look.y, 6, dt);
      if (im.focusController) im.focusController.focus(lookX, -lookY);
      // ease towards the requested framing
      const t = targetPose();
      pose.s = damp(pose.s, t.s, 7, dt);
      pose.x = damp(pose.x, t.x, 7, dt);
      pose.y = damp(pose.y, t.y, 7, dt);
      applyPose();
    });

    // render only while the stage is visible
    const watchdog = setInterval(() => {
      if (!container.isConnected) { clearInterval(watchdog); return; }
      if (performance.now() - lastUpdate > 700) { if (app.ticker.started) app.ticker.stop(); }
    }, 500);

    function update(t, s) {
      lastUpdate = performance.now();
      if (!app.ticker.started) app.ticker.start();
      relayout(false);
      cur.mouth = s.mouth; cur.emo = s.emo; cur.state = s.state; cur.look = s.look;
      const key = s.emo;
      if (key !== lastEmoKey) {
        lastEmoKey = key;
        try { model.expression(EXPRESSION[s.emo] || EXPRESSION.normal); } catch (e) { /* expression missing */ }
      }
    }

    function hit(x, y) {
      const r = canvas.getBoundingClientRect();
      try {
        const names = model.hitTest(x - r.left, y - r.top) || [];
        return names.indexOf('head') >= 0 ? 'head' : (names.indexOf('body') >= 0 ? 'body' : null);
      } catch (e) { return null; }
    }
    function motion(group) {
      try { model.motion(group); } catch (e) { /* ignore */ }
    }

    return {
      canvas: canvas,
      kind: 'live2d',
      name: 'Katou',
      voiceUrl: VOICE_URL,
      update: update,
      setView(m) { mode = m === 'full' ? 'full' : 'bust'; },
      wasDragged() { return false; },
      isDragging() { return false; },
      hit: hit,
      motion: motion,
      info() { return { mw: mw, mh: mh, cw: cw, ch: ch, mode: mode, pose: Object.assign({}, pose), scale: model.scale.x, anchor: [model.anchor.x, model.anchor.y], pos: [model.x, model.y] }; }
    };
  }

  window.VoiceAvatarL2D = { create };
})();
