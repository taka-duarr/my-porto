// Runs the page in slow motion (RATE < 1) so recording keeps up even on a busy machine.
// CSS/WAAPI animations are slowed separately through CDP Animation.setPlaybackRate.
(() => {
  const RATE = __RATE__;
  const realNow = performance.now.bind(performance);
  const t0 = realNow();
  const vnow = () => t0 + (realNow() - t0) * RATE;
  performance.now = vnow;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(ts => cb(t0 + (ts - t0) * RATE));
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
  window.setTimeout = (fn, ms = 0, ...a) => st(fn, ms / RATE, ...a);
  window.setInterval = (fn, ms = 0, ...a) => si(fn, ms / RATE, ...a);
})();
