/* ═══════════════════════════════════════════════════════════
   VOICE AVATAR 3D — original toon-shaded chibi character (Shiro)
   Built from Three.js primitives only: no external models or textures.
   Requires window.THREE (loaded on demand by voice-avatar.js).
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const PI = Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

  function create(container) {
    const T = window.THREE;
    if (!T) throw new Error('Three.js belum dimuat');

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.className = 'vv-canvas';
    container.appendChild(canvas);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(28, 1, 0.1, 60);

    // ── lights ──
    scene.add(new T.HemisphereLight(0xffffff, 0xe6dcf5, 1.25));
    const key = new T.DirectionalLight(0xfff6f0, 1.5); key.position.set(2.5, 3.5, 4.5); scene.add(key);
    const rim = new T.DirectionalLight(0xa493ff, 1.5); rim.position.set(-3.5, 2.5, -3.5); scene.add(rim);

    // ── materials ──
    const grad = new T.DataTexture(new Uint8Array([165, 215, 255]), 3, 1, T.RedFormat);
    grad.minFilter = grad.magFilter = T.NearestFilter;
    grad.needsUpdate = true;
    const toon = (hex, extra) => new T.MeshToonMaterial(Object.assign({ color: hex, gradientMap: grad }, extra || {}));
    const flat = (hex, extra) => new T.MeshBasicMaterial(Object.assign({ color: hex }, extra || {}));
    const OUTLINE = 0x2b2457;
    const addOutline = (mesh, k) => {
      const o = new T.Mesh(mesh.geometry, new T.MeshBasicMaterial({ color: OUTLINE, side: T.BackSide }));
      o.scale.setScalar(k || 1.04);
      mesh.add(o);
      return mesh;
    };
    const HAIR = 0xeeeaff, HAIR_DARK = 0xcfc8f2, SKIN = 0xffe4d4, HOOD = 0x7c6cf0, SKIRT = 0x3f3a8a;
    const hairMat = toon(HAIR, { side: T.DoubleSide });
    const hairMatSolid = toon(HAIR);

    // ── rig ──
    const rig = new T.Group(); scene.add(rig);          // drag spin + gentle sway
    const body = new T.Group(); rig.add(body);          // breathing

    const torso = addOutline(new T.Mesh(new T.CapsuleGeometry(0.42, 0.3, 6, 18), toon(HOOD)), 1.06);
    torso.position.y = 0.46; torso.scale.set(1, 1, 0.84); body.add(torso);
    const collar = new T.Mesh(new T.TorusGeometry(0.3, 0.07, 8, 28), toon(0xf4f2ff));
    collar.rotation.x = PI / 2; collar.position.y = 0.98; body.add(collar);
    const neck = new T.Mesh(new T.CylinderGeometry(0.14, 0.15, 0.3, 12), toon(SKIN));
    neck.position.y = 1.05; body.add(neck);
    const pocket = new T.Mesh(new T.BoxGeometry(0.46, 0.2, 0.05), toon(0x6a59d8));
    pocket.position.set(0, 0.28, 0.36); body.add(pocket);
    const skirt = addOutline(new T.Mesh(new T.CylinderGeometry(0.46, 0.7, 0.42, 22, 1, true), toon(SKIRT, { side: T.DoubleSide })), 1.03);
    skirt.position.y = -0.02; body.add(skirt);

    const legs = [];
    [-1, 1].forEach((s) => {
      const leg = addOutline(new T.Mesh(new T.CapsuleGeometry(0.13, 0.46, 4, 12), toon(0xf6f4ff)), 1.08);
      leg.position.set(s * 0.22, -0.66, 0.02); body.add(leg);
      const shoe = addOutline(new T.Mesh(new T.SphereGeometry(0.17, 14, 10), toon(0x3d3480)), 1.08);
      shoe.scale.set(1, 0.6, 1.5); shoe.position.set(s * 0.22, -1.04, 0.1); body.add(shoe);
      legs.push(leg);
    });

    const arms = [];
    [-1, 1].forEach((s) => {
      const arm = new T.Group(); arm.position.set(s * 0.56, 0.82, 0); body.add(arm);
      const upper = addOutline(new T.Mesh(new T.CapsuleGeometry(0.115, 0.34, 4, 12), toon(HOOD)), 1.08);
      upper.position.y = -0.27; arm.add(upper);
      const hand = addOutline(new T.Mesh(new T.SphereGeometry(0.13, 14, 10), toon(SKIN)), 1.1);
      hand.position.y = -0.56; arm.add(hand);
      arm.rotation.z = s * 0.16;
      arms.push(arm);
    });

    // ── head ──
    const head = new T.Group(); head.position.set(0, 1.92, 0); rig.add(head);
    const skull = addOutline(new T.Mesh(new T.SphereGeometry(1, 48, 36), toon(SKIN)), 1.035);
    skull.scale.set(1, 0.95, 0.95); head.add(skull);

    const _up = new T.Vector3(0, 0, 1);
    function surf(x, y, off) {
      const z = 0.95 * Math.sqrt(Math.max(0, 1 - x * x - (y / 0.95) * (y / 0.95)));
      const p = new T.Vector3(x, y, z);
      const n = new T.Vector3(x, y / 0.9025, z / 0.9025).normalize();
      p.addScaledVector(n, off);
      return { p, n };
    }
    function decal(group, x, y, off) {
      const s = surf(x, y, off);
      group.position.copy(s.p);
      group.quaternion.setFromUnitVectors(_up, s.n);
      head.add(group);
      return group;
    }
    const circle = (r, mat, seg) => new T.Mesh(new T.CircleGeometry(r, seg || 32), mat);
    const put = (m, x, y, z) => { m.position.set(x, y, z); return m; };

    // blush
    [-1, 1].forEach((s) => {
      const g = new T.Group();
      const m = circle(0.12, flat(0xff8fb0, { transparent: true, opacity: 0.4, depthWrite: false }));
      m.scale.set(1.25, 0.7, 1); g.add(m);
      decal(g, s * 0.58, -0.3, 0.03);
    });

    // eyes
    const eyes = [];
    [-1, 1].forEach((s) => {
      const g = new T.Group();
      const open = new T.Group(); g.add(open);
      const sclera = circle(0.2, flat(0xffffff)); sclera.scale.set(0.84, 1.1, 1); open.add(sclera);
      const irisG = new T.Group(); open.add(irisG);
      irisG.add(put(circle(0.155, flat(0x6a58ef)), 0, 0, 0.003));
      irisG.children[0].scale.set(0.92, 1.06, 1);
      irisG.add(put(circle(0.115, flat(0x9b8dff)), 0, -0.035, 0.005));
      irisG.add(put(circle(0.07, flat(0x211a52)), 0, 0, 0.007));
      irisG.add(put(circle(0.048, flat(0xffffff)), -0.05, 0.07, 0.01));
      irisG.add(put(circle(0.022, flat(0xffffff)), 0.05, -0.06, 0.01));
      const lash = new T.Mesh(new T.RingGeometry(0.176, 0.238, 32, 1, 0.08 * PI, 0.84 * PI), flat(0x3b3370));
      lash.scale.set(0.9, 1.1, 1); lash.position.z = 0.012; open.add(lash);
      const happy = new T.Mesh(new T.TorusGeometry(0.16, 0.03, 8, 24, PI), flat(0x3b3370));
      happy.position.y = -0.04; happy.visible = false; g.add(happy);
      decal(g, s * 0.37, -0.02, 0.03);
      eyes.push({ g, open, irisG, happy });
    });

    // brows
    const brows = [];
    [-1, 1].forEach((s) => {
      const g = new T.Group();
      const pivot = new T.Group(); g.add(pivot);
      const bar = new T.Mesh(new T.CapsuleGeometry(0.02, 0.15, 4, 8), flat(0x8d86b8));
      bar.rotation.z = PI / 2; pivot.add(bar);
      decal(g, s * 0.37, 0.3, 0.025);
      brows.push({ g, pivot, s, baseY: g.position.y });
    });

    // mouth
    const mouthG = new T.Group();
    const mClosed = new T.Mesh(new T.TorusGeometry(0.1, 0.017, 8, 20, PI), flat(0xa24a5f));
    mClosed.rotation.z = PI; mClosed.position.y = 0.03; mouthG.add(mClosed);
    const mSad = new T.Mesh(new T.TorusGeometry(0.09, 0.017, 8, 20, PI), flat(0xa24a5f));
    mSad.position.y = -0.04; mSad.visible = false; mouthG.add(mSad);
    const mHappy = new T.Group(); mHappy.visible = false; mouthG.add(mHappy);
    const hm = new T.Mesh(new T.CircleGeometry(0.115, 24, PI, PI), flat(0x8d2f48)); hm.position.y = 0.04; mHappy.add(hm);
    const ht = circle(0.05, flat(0xff8da1)); ht.scale.set(1.2, 0.7, 1); ht.position.set(0, -0.045, 0.003); mHappy.add(ht);
    const mOpen = new T.Group(); mOpen.visible = false; mouthG.add(mOpen);
    const om = circle(0.1, flat(0x8d2f48)); mOpen.add(om);
    const ot = circle(0.06, flat(0xff8da1)); ot.position.z = 0.003; mOpen.add(ot);
    decal(mouthG, 0, -0.4, 0.03);

    // tear
    const tear = new T.Mesh(new T.SphereGeometry(0.05, 10, 8), flat(0x8fd3ff));
    tear.scale.set(0.8, 1.5, 0.6); tear.visible = false;
    const tearG = new T.Group(); tearG.add(tear); decal(tearG, 0.5, -0.2, 0.04);

    // ── hair ──
    const capTop = new T.Mesh(new T.SphereGeometry(1.06, 40, 20, 0, 2 * PI, 0, 0.34 * PI), hairMat);
    capTop.scale.set(1, 0.97, 0.98); head.add(capTop);
    const capBack = new T.Mesh(new T.SphereGeometry(1.06, 40, 20, PI / 2 + 0.95, 2 * PI - 1.9, 0.34 * PI, 0.42 * PI), hairMat);
    capBack.scale.set(1, 0.97, 0.98); head.add(capBack);

    // bangs: cones hanging from the hairline
    const bangs = [];
    [-0.82, -0.52, -0.22, 0.08, 0.38, 0.68, 0.92].forEach((a, i) => {
      const h = 0.44 + (i % 2) * 0.08 - (Math.abs(a) < 0.3 ? 0.06 : 0);
      const cone = addOutline(new T.Mesh(new T.ConeGeometry(0.2, h, 10), hairMatSolid), 1.07);
      cone.rotation.x = PI;
      const r = 0.99;
      cone.position.set(Math.sin(a) * r * 0.98, 0.56 - h / 2, Math.cos(a) * r * 0.9 + 0.02);
      cone.rotation.z = -a * 0.35;
      cone.rotation.x = PI + 0.38;
      head.add(cone);
      bangs.push(cone);
    });

    // side locks
    [-1, 1].forEach((s) => {
      const lock = addOutline(new T.Mesh(new T.CapsuleGeometry(0.13, 0.55, 4, 10), hairMatSolid), 1.07);
      lock.position.set(s * 0.93, -0.18, 0.3); lock.rotation.z = s * 0.06; head.add(lock);
    });

    // ahoge
    const ahogeCurve = new T.QuadraticBezierCurve3(new T.Vector3(0, 0.98, 0.1), new T.Vector3(0.06, 1.35, 0.1), new T.Vector3(0.28, 1.36, 0.1));
    const ahoge = new T.Mesh(new T.TubeGeometry(ahogeCurve, 10, 0.045, 6), hairMatSolid); head.add(ahoge);

    // clips
    [-1, 1].forEach((s) => {
      const clip = new T.Mesh(new T.ConeGeometry(0.1, 0.22, 3), toon(HOOD));
      clip.position.set(s * 0.86, 0.48, 0.34); clip.rotation.z = -s * 1.1; clip.rotation.x = 0.3; head.add(clip);
    });

    // twin tails (chains that sway)
    const tails = [];
    [-1, 1].forEach((s) => {
      const base = new T.Group(); base.position.set(s * 1.0, 0.5, -0.12); base.rotation.z = -s * 0.32; head.add(base);
      const ribbon = new T.Mesh(new T.SphereGeometry(0.16, 12, 10), toon(HOOD));
      ribbon.scale.set(1, 0.8, 1); base.add(ribbon);
      const lens = [0.55, 0.5, 0.45, 0.4], rads = [0.2, 0.175, 0.145, 0.1];
      const cols = [0xeeeaff, 0xe3defa, 0xd6d0f4, 0xc9c3ee];
      const segs = []; let parent = base;
      lens.forEach((len, i) => {
        const pivot = new T.Group(); pivot.position.y = i === 0 ? -0.1 : -lens[i - 1] + 0.04; parent.add(pivot);
        const m = addOutline(new T.Mesh(new T.CapsuleGeometry(rads[i], len, 4, 10), toon(cols[i])), 1.07);
        m.position.y = -len / 2; pivot.add(m);
        segs.push(pivot); parent = pivot;
      });
      tails.push({ segs, s });
    });

    // ── effects ──
    const sparks = [];
    for (let i = 0; i < 3; i++) {
      const m = new T.Mesh(new T.OctahedronGeometry(0.1), flat(0xffe27a, { transparent: true }));
      m.scale.set(0.8, 1.5, 0.8); m.visible = false; rig.add(m); sparks.push(m);
    }
    const dots = [];
    for (let i = 0; i < 3; i++) {
      const m = new T.Mesh(new T.SphereGeometry(0.09 + i * 0.03, 12, 10), flat(0xc9c3ee, { transparent: true }));
      m.visible = false; rig.add(m); dots.push(m);
    }
    // floor shadow
    const sc = document.createElement('canvas'); sc.width = sc.height = 64;
    const sx = sc.getContext('2d'); const sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, 'rgba(60,40,140,0.55)'); sg.addColorStop(1, 'rgba(60,40,140,0)');
    sx.fillStyle = sg; sx.fillRect(0, 0, 64, 64);
    const shadow = new T.Mesh(new T.PlaneGeometry(2.6, 1.4), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -PI / 2; shadow.position.y = -1.14; scene.add(shadow);

    // ── interaction: drag to spin ──
    let spin = 0, spinV = 0, dragging = false, dragMoved = false, lastX = 0, releasedAt = 0;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', (e) => {
      dragging = true; dragMoved = false; lastX = e.clientX; spinV = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      if (Math.abs(dx) > 0) dragMoved = dragMoved || Math.abs(dx) > 1;
      spin += dx * 0.014; spinV = dx * 0.014;
    });
    const endDrag = () => { if (dragging) { dragging = false; releasedAt = performance.now(); } };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    // ── state ──
    let lastT = 0, w = 0, h = 0;
    let happy = 0, sad = 0, think = 0, blink = 0, nextBlink = 1800, blinkT = -1;
    let camY = 1.05, camD = 5.4, lookX = 0, lookY = 0, smile = 0;
    const view = { mode: 'bust' };

    function layoutView(dt, snap) {
      const bust = view.mode === 'bust';
      const aspect = w / Math.max(1, h);
      const visH = bust ? 2.9 : 4.7;
      const targetY = bust ? 1.75 : 1.12;
      let dist = (visH / 2) / Math.tan((camera.fov * PI) / 360);
      // keep the character's width inside the frame on narrow canvases
      const needW = bust ? 2.6 : 2.5;
      dist = Math.max(dist, (needW / 2) / (Math.tan((camera.fov * PI) / 360) * aspect));
      camY = snap ? targetY : damp(camY, targetY, 6, dt);
      camD = snap ? dist : damp(camD, dist, 6, dt);
      camera.position.set(0, camY + 0.15, camD);
      camera.lookAt(0, camY, 0);
      shadow.material.opacity = bust ? 0 : 1;
    }

    function resize() {
      const cw = container.clientWidth, ch = container.clientHeight;
      if (!cw || !ch) return false;
      if (cw !== w || ch !== h) {
        w = cw; h = ch;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        layoutView(0, true);
      }
      return true;
    }

    function update(t, s) {
      if (!resize()) return;
      const dt = clamp((t - lastT) / 1000, 0.001, 0.05); lastT = t;
      const emo = s.emo;

      happy = damp(happy, emo === 'happy' ? 1 : 0, 9, dt);
      sad = damp(sad, emo === 'sad' ? 1 : 0, 9, dt);
      const thinking = s.state === 'thinking' || s.state === 'loading';
      think = damp(think, thinking ? 1 : 0, 6, dt);
      const open = clamp(s.mouth, 0, 1);

      // spin: drag, then ease back to facing front
      if (!dragging) {
        if (t - releasedAt > 1400 || !releasedAt) {
          const target = Math.round(spin / (2 * PI)) * 2 * PI;
          spin = damp(spin, target, 2.6, dt);
        } else {
          spin += spinV; spinV *= 0.92;
        }
      }
      const sway = Math.sin(t / 2600) * 0.1;
      rig.rotation.y = spin + sway;
      rig.position.y = Math.max(0, Math.sin(t / 130)) * open * 0.02 + happy * Math.abs(Math.sin(t / 260)) * 0.05;

      // breathing
      const br = Math.sin(t / 900);
      body.scale.y = 1 + br * 0.012;
      torso.scale.x = 1 + br * 0.01;

      // head follows the pointer
      lookX = damp(lookX, s.look.x, 6, dt); lookY = damp(lookY, s.look.y, 6, dt);
      head.rotation.y = lookX * 0.5;
      head.rotation.x = lookY * 0.24 + sad * 0.2 + open * Math.sin(t / 110) * 0.04;
      head.rotation.z = think * -0.12 + sad * 0.05 + Math.sin(t / 3100) * 0.025;
      head.position.y = 1.92 + br * 0.012 - sad * 0.04;
      eyes.forEach((e) => e.irisG.position.set(lookX * 0.045, -lookY * 0.035 + think * 0.04, 0));

      // arms
      arms.forEach((a, i) => {
        const sgn = i === 0 ? -1 : 1;
        a.rotation.z = sgn * (0.16 + br * 0.02 + happy * 0.08 + open * Math.sin(t / 140 + i) * 0.05);
        a.rotation.x = Math.sin(t / 1700 + i * 2) * 0.05;
      });

      // blink
      nextBlink -= dt * 1000;
      if (nextBlink <= 0 && blinkT < 0) { blinkT = 0; nextBlink = 2200 + Math.random() * 3200; }
      if (blinkT >= 0) { blinkT += dt * 1000; blink = Math.sin(clamp(blinkT / 150, 0, 1) * PI); if (blinkT > 150) { blinkT = -1; blink = 0; } }
      const eyeOpen = 1 - blink * 0.92;
      const showHappyEyes = happy > 0.5;
      eyes.forEach((e) => {
        e.open.visible = !showHappyEyes;
        e.happy.visible = showHappyEyes;
        e.open.scale.y = Math.max(0.06, eyeOpen);
      });

      // brows
      brows.forEach((b) => {
        b.pivot.rotation.z = b.s * -1 * (-sad * 0.42) + b.s * -0.04 * (1 - sad);
        b.pivot.position.y = happy * 0.04 - sad * 0.01 + think * 0.02;
      });

      // mouth
      const speaking = open > 0.06;
      smile = damp(smile, happy, 8, dt);
      mOpen.visible = speaking;
      mClosed.visible = !speaking && happy < 0.5 && sad < 0.5;
      mHappy.visible = !speaking && happy >= 0.5;
      mSad.visible = !speaking && sad >= 0.5;
      if (speaking) {
        om.scale.set(1 - open * 0.15, 0.2 + open * 1.0, 1);
        ot.scale.set(0.9, 0.2 + open * 0.7, 1);
        ot.position.y = -0.03 - open * 0.04;
        mOpen.position.y = -open * 0.03;
      }

      // tear + blush feel
      tear.visible = sad > 0.5;
      if (tear.visible) tear.position.y = -((t / 700) % 1) * 0.18;

      // hair physics-ish
      const fast = Math.abs(spinV) * 6;
      tails.forEach((tl, k) => {
        tl.segs.forEach((seg, i) => {
          const phase = t / 760 + i * 0.7 + k * 1.3;
          seg.rotation.z = tl.s * (Math.sin(phase) * 0.06 * (i + 1)) + (tl.s * lookX * -0.1) + (dragging ? -spinV * 2 : 0) * tl.s;
          seg.rotation.x = Math.sin(phase * 0.8 + 1) * 0.03 * (i + 1) + open * Math.sin(t / 120) * 0.02;
        });
      });
      bangs.forEach((b, i) => { b.rotation.z = -((i - 3) * 0.12) * 0.35 + Math.sin(t / 1400 + i) * 0.03; });
      ahoge.rotation.z = Math.sin(t / 900) * 0.12;

      // sparkles (happy) and thinking dots
      sparks.forEach((m, i) => {
        m.visible = happy > 0.15;
        if (!m.visible) return;
        const a = t / 800 + i * 2.1;
        m.position.set(Math.cos(a) * 1.5, 2.1 + Math.sin(t / 520 + i) * 0.45, Math.sin(a) * 0.5 + 0.3);
        m.rotation.y = a * 2; m.material.opacity = 0.3 + 0.7 * happy * (0.5 + 0.5 * Math.sin(t / 150 + i));
      });
      dots.forEach((m, i) => {
        m.visible = think > 0.1;
        if (!m.visible) return;
        const pulse = 0.7 + 0.3 * Math.sin(t / 220 - i * 0.9);
        m.position.set(1.05 + i * 0.28, 2.85 + i * 0.3, 0.2);
        m.scale.setScalar(pulse * think); m.material.opacity = think;
      });

      layoutView(dt, false);
      renderer.render(scene, camera);
    }

    return {
      canvas,
      update,
      setView(mode) { view.mode = mode === 'full' ? 'full' : 'bust'; },
      wasDragged() { const d = dragMoved; dragMoved = false; return d; },
      isDragging() { return dragging; }
    };
  }

  window.VoiceAvatar3D = { create };
})();
