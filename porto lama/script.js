/* ═══════════════════════════════════════════════════════════
   FIRMAN ARDIANSYAH PORTFOLIO — script.js
   Heavy animations: GSAP, Particles, Magnetic, SplitText,
   Custom Cursor, Counter, Scroll Reveal, etc.
   ═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   1. GSAP Plugin Registration
   ────────────────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
// SplitText is premium — we'll do manual split as fallback

/* ──────────────────────────────────────────────────────────
   2. LOADING SEQUENCE — runs immediately when DOM is ready
   ────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {

  /* ── Cursor ── */
  initCursor();

  /* ── Navbar Scroll ── */
  initNavbar();

  /* ── Mobile Nav ── */
  initMobileNav();

  /* ── Particle Canvas ── */
  initParticles();

  /* ── Hero Entrance Animation ── */
  initHeroAnimation();

  /* ── Scroll Reveal ── */
  initScrollReveal();

  /* ── Count Up ── */
  initCountUp();

  /* ── Skill Bars ── */
  initSkillBars();

  /* ── Exp Bar ── */
  initExpBar();

  /* ── Skills Tab ── */
  initSkillsTabs();

  /* ── Magnetic Elements ── */
  initMagnetic();

  /* ── Contact Form ── */
  initContactForm();

  /* ── Active Nav ── */
  initActiveNav();

  /* ── Parallax Tilt ── */
  initParallaxTilt();

  /* ── Typewriter ── */
  initTypewriter();

  /* ── Project Hover 3D ── */
  initProject3D();
});

/* ──────────────────────────────────────────────────────────
   3. CUSTOM CURSOR
   ────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0, ease: 'none' });
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    gsap.set(follower, { x: followerX, y: followerY });
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  const hoverables = document.querySelectorAll('a, button, .magnetic, .skill-card, .bento-card, .project-card, .trait-tag');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, follower], { opacity: 0, duration: 0.3 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, follower], { opacity: 1, duration: 0.3 });
  });
}

/* ──────────────────────────────────────────────────────────
   4. NAVBAR SCROLL BEHAVIOR
   ────────────────────────────────────────────────────────── */
function initNavbar() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ──────────────────────────────────────────────────────────
   5. MOBILE NAV
   ────────────────────────────────────────────────────────── */
function initMobileNav() {
  const hamburger   = document.getElementById('hamburger');
  const overlay     = document.getElementById('mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburger || !overlay) return;

  const toggle = () => {
    hamburger.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggle);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ──────────────────────────────────────────────────────────
   6. PARTICLE CANVAS (Hero Background)
   ────────────────────────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = { x: -9999, y: -9999 };

  const PARTICLE_COUNT = 80;
  const MAX_DIST = 140;
  const ACCENT_COLOR = '224,109,83';
  const BASE_COLOR   = '140,148,166';

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * w;
      this.y  = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      // bounce
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;

      // mouse repel
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        this.x -= dx * 0.02;
        this.y -= dy * 0.02;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${BASE_COLOR},${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticlesArr() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.15;
          // near mouse → accent color
          const mdx = mouse.x - particles[i].x;
          const mdy = mouse.y - particles[i].y;
          const md  = Math.sqrt(mdx*mdx + mdy*mdy);
          const color = md < 150 ? ACCENT_COLOR : BASE_COLOR;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener('resize', () => { resize(); initParticlesArr(); });
  resize();
  initParticlesArr();
  loop();
}

/* ──────────────────────────────────────────────────────────
   7. HERO ENTRANCE ANIMATION (GSAP Timeline)
   ────────────────────────────────────────────────────────── */
function initHeroAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  // Manual text line split for hero title
  const titleLines = document.querySelectorAll('.hero-line');
  const badge      = document.getElementById('hero-badge');
  const heroBadge  = document.getElementById('hero-badge');
  const heroSub    = document.getElementById('hero-sub');
  const heroCta    = document.getElementById('hero-cta');
  const heroSocials = document.getElementById('hero-socials');
  const heroImgSide = document.getElementById('hero-image-side');
  const scrollHint  = document.getElementById('scroll-hint');

  tl
    .to(badge, { opacity: 1, y: 0, duration: 0.6, delay: 0.2 })
    .to(titleLines, {
      opacity: 1, y: 0,
      duration: 0.9,
      stagger: 0.15,
    }, '-=0.2')
    .to(heroSub, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
    .to(heroCta, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to(heroSocials, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
    .to(heroImgSide, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.8')
    .to(scrollHint, { opacity: 1, duration: 0.5 }, '-=0.2');

  // Set initial states for img side
  gsap.set(heroImgSide, { x: 60 });
}

/* ──────────────────────────────────────────────────────────
   8. SCROLL REVEAL (Intersection Observer + GSAP)
   ────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = Array.from(entry.target.parentNode.querySelectorAll('.reveal-up'));
        const idx = siblings.indexOf(entry.target);

        gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay: idx * 0.1,
          ease: 'power3.out',
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────
   9. COUNT UP ANIMATION
   ────────────────────────────────────────────────────────── */
function initCountUp() {
  const counters = document.querySelectorAll('.count-up, .stat-num');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target') || el.textContent, 10);
      if (isNaN(target)) return;

      let start = 0;
      const duration = 1800;
      const step = target / (duration / 16);

      const update = () => {
        start = Math.min(start + step, target);
        el.textContent = Math.floor(start);
        if (start < target) requestAnimationFrame(update);
        else el.textContent = target;
      };
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ──────────────────────────────────────────────────────────
   10. SKILL BARS (triggered on scroll)
   ────────────────────────────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const width = bar.getAttribute('data-w') + '%';
      gsap.to(bar, { width, duration: 1.4, ease: 'power3.out', delay: 0.2 });
      observer.unobserve(bar);
    });
  }, { threshold: 0.5 });

  bars.forEach(b => observer.observe(b));
}

/* ──────────────────────────────────────────────────────────
   11. EXPERIENCE BAR
   ────────────────────────────────────────────────────────── */
function initExpBar() {
  const bar = document.querySelector('.exp-bar');
  if (!bar) return;

  ScrollTrigger.create({
    trigger: bar,
    start: 'top 85%',
    onEnter: () => {
      gsap.to(bar, {
        width: bar.getAttribute('data-width') + '%',
        duration: 1.5,
        ease: 'power3.out',
      });
    },
    once: true,
  });
}

/* ──────────────────────────────────────────────────────────
   12. SKILLS TAB SWITCHING
   ────────────────────────────────────────────────────────── */
function initSkillsTabs() {
  const btns   = document.querySelectorAll('.skill-cat-btn');
  const panels = document.querySelectorAll('.skills-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');

      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `cat-${cat}`) {
          panel.classList.add('active');
          // Animate in the cards
          const cards = panel.querySelectorAll('.skill-card');
          gsap.fromTo(cards,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
          );
          // Animate bars in the new panel
          panel.querySelectorAll('.skill-fill').forEach(bar => {
            gsap.to(bar, { width: bar.getAttribute('data-w') + '%', duration: 1.2, ease: 'power3.out', delay: 0.1 });
          });
        }
      });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   13. MAGNETIC ELEMENTS
   ────────────────────────────────────────────────────────── */
function initMagnetic() {
  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(el => {
    let bounds;

    el.addEventListener('mouseenter', () => {
      bounds = el.getBoundingClientRect();
    });

    el.addEventListener('mousemove', e => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const cx = bounds.left + bounds.width  / 2;
      const cy = bounds.top  + bounds.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   14. CONTACT FORM
   ────────────────────────────────────────────────────────── */
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('submit-btn');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const label  = btn.querySelector('.btn-label');
    const icon   = btn.querySelector('.btn-icon');

    // Animate button
    gsap.timeline()
      .to(btn, { scale: 0.96, duration: 0.1 })
      .to(btn, { scale: 1,    duration: 0.2, ease: 'back.out(3)' });

    label.textContent = 'Sending...';
    icon.className = 'fas fa-circle-notch fa-spin btn-icon';

    // Simulate send (replace with real logic)
    setTimeout(() => {
      label.textContent = 'Message Sent! 🎉';
      icon.className = 'fas fa-check btn-icon';
      btn.style.background = '#4CAF50';

      // Reset after 3s
      setTimeout(() => {
        form.reset();
        label.textContent = 'Send Message';
        icon.className = 'fas fa-arrow-right btn-icon';
        btn.style.background = '';
      }, 3000);
    }, 1500);
  });
}

/* ──────────────────────────────────────────────────────────
   15. ACTIVE NAV HIGHLIGHT ON SCROLL
   ────────────────────────────────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => observer.observe(s));
}

/* ──────────────────────────────────────────────────────────
   16. PARALLAX TILT ON PROFILE PHOTO
   ────────────────────────────────────────────────────────── */
function initParallaxTilt() {
  const frame = document.querySelector('.profile-frame');
  if (!frame) return;

  frame.addEventListener('mousemove', e => {
    const rect = frame.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rotateX = ((e.clientY - cy) / rect.height) * -15;
    const rotateY = ((e.clientX - cx) / rect.width)  *  15;
    gsap.to(frame, {
      rotateX, rotateY,
      transformPerspective: 800,
      duration: 0.4, ease: 'power2.out',
    });
  });

  frame.addEventListener('mouseleave', () => {
    gsap.to(frame, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  });
}

/* ──────────────────────────────────────────────────────────
   17. TYPEWRITER (Hero Title Subtitle)
   ────────────────────────────────────────────────────────── */
function initTypewriter() {
  const titleEl = document.querySelector('.hero-sub');
  if (!titleEl) return;

  // Animate a small typing indicator effect on the hero badge
  const badge = document.querySelector('.badge-dot');
  if (badge) {
    gsap.to(badge, {
      scale: 1.5, opacity: 0.5,
      duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
  }
}

/* ──────────────────────────────────────────────────────────
   18. PROJECT 3D HOVER EFFECT
   ────────────────────────────────────────────────────────── */
function initProject3D() {
  const projectItems = document.querySelectorAll('.project-item');

  projectItems.forEach(item => {
    const img = item.querySelector('.project-image-wrap');
    if (!img) return;

    img.addEventListener('mousemove', e => {
      const rect = img.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const rotateX = ((e.clientY - cy) / rect.height) * -8;
      const rotateY = ((e.clientX - cx) / rect.width)  *  8;
      gsap.to(img, {
        rotateX, rotateY,
        transformPerspective: 900,
        transformOrigin: 'center center',
        duration: 0.4, ease: 'power2.out',
      });
    });

    img.addEventListener('mouseleave', () => {
      gsap.to(img, {
        rotateX: 0, rotateY: 0,
        duration: 0.6, ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   19. SMOOTH SCROLL FOR NAV LINKS
   ────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
    gsap.to(window, {
      scrollTo: targetY,
      duration: 1.2,
      ease: 'power4.inOut',
    });
  });
});

/* ──────────────────────────────────────────────────────────
   20. GSAP SCROLL ANIMATIONS FOR SECTIONS
   ────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  // Section heading char split animation
  document.querySelectorAll('.section-heading').forEach(heading => {
    const text = heading.innerHTML;
    // Skip if already processed
    if (heading.dataset.split) return;
    heading.dataset.split = true;

    gsap.fromTo(heading,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
        }
      }
    );
  });

  // Project items stagger
  document.querySelectorAll('.project-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
      {
        opacity: 1, x: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
        }
      }
    );
  });

  // Bento cards pop-in
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, scale: 0.92, y: 30 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        }
      }
    );
  });

  // Horizontal scroll marquee-like label lines
  gsap.utils.toArray('.label-line').forEach(line => {
    gsap.fromTo(line,
      { scaleX: 0 },
      {
        scaleX: 1, transformOrigin: 'left center',
        duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: line, start: 'top 90%' }
      }
    );
  });

  // Footer entrance
  gsap.fromTo('.site-footer',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, duration: 0.8,
      scrollTrigger: { trigger: '.site-footer', start: 'top 95%' }
    }
  );
});

/* ──────────────────────────────────────────────────────────
   21. SCROLL PROGRESS INDICATOR
   ────────────────────────────────────────────────────────── */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  background: linear-gradient(90deg, #E06D53, #f0a694);
  z-index: 9998;
  width: 0%;
  transition: width 0.1s linear;
  pointer-events: none;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const pct = (scrollTop / docHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ──────────────────────────────────────────────────────────
   22. BACK TO TOP ON FOOTER LOGO CLICK
   ────────────────────────────────────────────────────────── */
document.querySelectorAll('.footer-logo, .nav-logo').forEach(logo => {
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    gsap.to(window, { scrollTo: 0, duration: 1.2, ease: 'power4.inOut' });
  });
});
