// Injected into the page while recording: fake cursor, tap indicator, captions, outro card.
(() => {
  const css = `
  #__cursor { position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none; opacity: 0;
    width: 30px; height: 30px; transform: translate(-100px, -100px); filter: drop-shadow(0 2px 3px rgba(0,0,0,.55)); }
  #__cursor svg { width: 100%; height: 100%; }
  .__ripple { position: fixed; z-index: 2147483646; pointer-events: none; width: 46px; height: 46px; margin: -23px 0 0 -23px;
    border-radius: 50%; border: 3px solid rgba(255,255,255,.9); background: rgba(255,255,255,.18);
    animation: __rip .5s ease-out forwards; }
  @keyframes __rip { from { transform: scale(.3); opacity: 1 } to { transform: scale(1.4); opacity: 0 } }
  #__cap { position: fixed; left: 50%; top: 7.5%; z-index: 2147483640; pointer-events: none; width: 88vw;
    transform: translateX(-50%); text-align: center; font-family: 'Ubuntu', 'Segoe UI', system-ui, sans-serif; }
  #__cap .t { display: inline-block; font-size: 6vw; font-weight: 800; line-height: 1.15; color: #fff;
    padding: .28em .62em; border-radius: .7em; background: rgba(14,9,20,.78);
    box-shadow: 0 .3em 1.2em rgba(0,0,0,.45), inset 0 0 0 2px rgba(255,255,255,.12); letter-spacing: -.01em; }
  #__cap .s { display: block; margin-top: .55em; font-size: 3.9vw; font-weight: 700; color: #ffd9a0;
    text-shadow: 0 2px 10px rgba(0,0,0,.9); }
  #__cap.low { top: 34%; }
  #__cap.show .t { animation: __capIn .55s cubic-bezier(.34,1.56,.64,1) both; }
  #__cap.show .s { animation: __capIn .55s cubic-bezier(.34,1.56,.64,1) .12s both; }
  #__cap.hide { animation: __capOut .25s ease-in forwards; }
  @keyframes __capIn { from { opacity: 0; transform: translateY(-.6em) scale(.85) } to { opacity: 1; transform: none } }
  @keyframes __capOut { to { opacity: 0; transform: translateX(-50%) translateY(-.4em) } }
  #__outro { position: fixed; inset: 0; z-index: 2147483645; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 2.2vh; font-family: 'Ubuntu', 'Segoe UI', system-ui, sans-serif; color: #fff;
    background: radial-gradient(120% 70% at 50% 30%, #5a1f45 0%, #2a0d24 45%, #0d0610 100%);
    animation: __fadeIn .5s ease both; }
  #__outro img { width: 34vw; height: 34vw; border-radius: 50%; object-fit: cover;
    border: .9vw solid rgba(255,255,255,.18); box-shadow: 0 0 0 1.2vw rgba(233,84,32,.35), 0 2vh 6vh rgba(0,0,0,.5);
    animation: __pop .7s cubic-bezier(.34,1.56,.64,1) .1s both; }
  #__outro .n { font-size: 8.4vw; font-weight: 800; letter-spacing: -.02em; animation: __up .6s ease .3s both; }
  #__outro .r { font-size: 4.4vw; color: #ffb27a; font-weight: 700; animation: __up .6s ease .45s both; }
  #__outro .g { margin-top: 1vh; font-size: 4vw; color: rgba(255,255,255,.8); animation: __up .6s ease .6s both; }
  #__outro .b { margin-top: 2.5vh; font-size: 5vw; font-weight: 800; padding: .5em 1.2em; border-radius: 99px;
    background: linear-gradient(135deg, #ff7a3d, #e95420); box-shadow: 0 1.5vh 4vh rgba(233,84,32,.45);
    animation: __pop .6s cubic-bezier(.34,1.56,.64,1) .8s both; }
  @keyframes __fadeIn { from { opacity: 0 } }
  @keyframes __pop { from { opacity: 0; transform: scale(.5) } }
  @keyframes __up { from { opacity: 0; transform: translateY(3vh) } }
  `;
  const svg = `<svg viewBox="0 0 24 24"><path d="M5 2.5v17.2l4.3-4.1 2.7 6.1 2.8-1.2-2.7-6h6.1z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

  const setup = () => {
    if (document.getElementById('__cursor')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const cur = document.createElement('div'); cur.id = '__cursor'; cur.innerHTML = svg; document.body.appendChild(cur);
    const cap = document.createElement('div'); cap.id = '__cap'; document.body.appendChild(cap);

    const touchDevice = matchMedia('(pointer: coarse)').matches || innerWidth <= 768;
    document.addEventListener('mousemove', e => {
      if (touchDevice) return;
      cur.style.opacity = 1;
      cur.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 2}px)`;
    }, true);
    const ripple = (x, y) => {
      const r = document.createElement('div'); r.className = '__ripple';
      r.style.left = x + 'px'; r.style.top = y + 'px';
      document.body.appendChild(r); setTimeout(() => r.remove(), 600);
    };
    document.addEventListener('mousedown', e => { if (!touchDevice) ripple(e.clientX, e.clientY); }, true);
    document.addEventListener('touchstart', e => { const t = e.touches[0]; if (t) ripple(t.clientX, t.clientY); }, { capture: true, passive: true });

    window.__cap = (t, s, low) => {
      cap.className = '';
      cap.dataset.low = low ? '1' : '';
      cap.innerHTML = `<span class="t">${t}</span>${s ? `<span class="s">${s}</span>` : ''}`;
      void cap.offsetWidth;
      cap.className = 'show' + (low ? ' low' : '');
    };
    window.__capHide = () => { cap.className = 'hide' + (cap.dataset.low ? ' low' : ''); };
    window.__outro = () => {
      window.__capHide();
      const o = document.createElement('div'); o.id = '__outro';
      o.innerHTML = `<img src="img/img1.jpg" onerror="this.src='img/img2.jpg'">
        <div class="n">Firman Ardiansyah</div>
        <div class="r">Full Stack Developer</div>
        <div class="g">github.com/taka-duarr</div>
        <div class="b">Cek link di bio 👆</div>`;
      document.body.appendChild(o);
    };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
