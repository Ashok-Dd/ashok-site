import { useState, useEffect, useRef } from 'react';
import { ArrowDown, Download, FolderOpen, Palette } from 'lucide-react';
import gsap from 'gsap';
import { roles, heroData, SOCIALS } from '../../data';
import { useTheme } from '../context/ThemeContext';

const HERO_SOCIAL_IDS = ['github', 'linkedin', 'email'];

const THEME_PROFILE = {
  cyberpunk: '/profile-cyber.png',
  synthwave: '/profile-pink.png',
  sunset:    '/profile-orange.png',
  lava:      '/profile-red.png',
  forest:    '/profile-green.png',
  ocean:     '/profile-skyblue.png',
  galaxy:    '/profile-violet.png',
};

const THEME_CYCLE = ['cyberpunk', 'synthwave', 'lava', 'forest', 'ocean', 'sunset', 'galaxy'];
const NAME_LETTERS = heroData.name.toUpperCase().split('');

const hexToRgb = (hex) => {
  let c = (hex || '').replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const n = parseInt(c || '1abc9c', 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const fmtTime = () => {
  try {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Home = () => {
  const { theme, setTheme } = useTheme();
  const profileImage = THEME_PROFILE[theme] || heroData.profileImage;
  const [roleIndex, setRoleIndex] = useState(0);
  const [clock, setClock] = useState(fmtTime);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const wordRef = useRef(null);

  /* ── Local clock ── */
  useEffect(() => {
    const id = setInterval(() => setClock(fmtTime()), 20000);
    return () => clearInterval(id);
  }, []);

  /* ── Role rotator: soft vertical slide + blur swap ── */
  useEffect(() => {
    const id = setInterval(() => {
      if (prefersReduced() || !wordRef.current) {
        setRoleIndex((i) => (i + 1) % roles.length);
        return;
      }
      gsap.to(wordRef.current, {
        yPercent: -80,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.42,
        ease: 'power2.in',
        onComplete: () => setRoleIndex((i) => (i + 1) % roles.length),
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (prefersReduced() || !wordRef.current) return;
    gsap.fromTo(
      wordRef.current,
      { yPercent: 80, opacity: 0, filter: 'blur(8px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }
    );
  }, [roleIndex]);

  /* ── Interactive constellation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReduced();

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points = [];
    const mouse = { x: -9999, y: -9999 };
    const par = { x: 0, y: 0, tx: 0, ty: 0 };

    const readAccent = () =>
      hexToRgb(
        getComputedStyle(document.documentElement).getPropertyValue('--color-accent')
      );
    let rgb = readAccent();

    const mo = new MutationObserver(() => {
      rgb = readAccent();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(88, Math.floor((w * h) / 16000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.6,
      }));
    };

    const draw = () => {
      const [ar, ag, ab] = rgb;
      par.x += (par.tx - par.x) * 0.06;
      par.y += (par.ty - par.y) * 0.06;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const px = p.x + par.x;
        const py = p.y + par.y;

        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 128) {
            ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(1 - d / 128) * 0.13})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(q.x + par.x, q.y + par.y);
            ctx.stroke();
          }
        }

        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (md < 168) {
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(1 - md / 168) * 0.32})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(${ar},${ag},${ab},0.5)`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) draw();
    else loop();

    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resize();
    };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      par.tx = (mouse.x / w - 0.5) * 24;
      par.ty = (mouse.y / h - 0.5) * 24;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      par.tx = 0;
      par.ty = 0;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerout', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
    };
  }, []);

  /* ── GSAP intro + magnetic buttons + parallax + spotlight ── */
  useEffect(() => {
    const reduced = prefersReduced();

    const ctx = gsap.context(() => {
      gsap.set('.hero-k-stage', { opacity: 1 });

      if (reduced) return;

      const tl = gsap.timeline({ delay: 0.12, defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-k-sweep',
          { xPercent: -120, opacity: 0.9 },
          { xPercent: 130, opacity: 0, duration: 1.15, ease: 'power2.inOut' }, 0)
        .from('.hero-k-halo', { scale: 0.4, opacity: 0, duration: 1, ease: 'power2.out' }, 0.1)
        .from('.hero-k-name > *', {
          y: () => gsap.utils.random(50, 130),
          x: () => gsap.utils.random(-55, 55),
          rotation: () => gsap.utils.random(-22, 22),
          opacity: 0,
          stagger: 0.07,
          duration: 0.9,
          ease: 'back.out(1.5)',
        }, 0.18)
        .from('.hero-k-oframe img', { clipPath: 'circle(0% at 50% 50%)', duration: 0.7, ease: 'power2.out' }, 0.45)
        .from('.hero-k-role', { y: 20, opacity: 0, duration: 0.55 }, '-=0.25')
        .from('.hero-k-meta', { y: 14, opacity: 0, duration: 0.5 }, '-=0.35')
        .from('.hero-k-bio', { y: 20, opacity: 0, duration: 0.55 }, '-=0.35')
        .from('.hero-k-actions > *', { y: 18, opacity: 0, stagger: 0.07, duration: 0.5 }, '-=0.35')
        .from('.hero-scroll-hint', { opacity: 0, y: 10, duration: 0.5 }, '-=0.2');

      gsap.to('.hero-k-letter-i', {
        yPercent: -7,
        duration: 2.8,
        ease: 'sine.inOut',
        stagger: { each: 0.16, from: 'center', yoyo: true, repeat: -1 },
      });

      /* pointer parallax on name / photo / halo + cursor spotlight */
      const nameX = gsap.quickTo('.hero-k-name', 'x', { duration: 0.8, ease: 'power3' });
      const nameY = gsap.quickTo('.hero-k-name', 'y', { duration: 0.8, ease: 'power3' });
      const oX = gsap.quickTo('.hero-k-oframe', 'x', { duration: 1, ease: 'power3' });
      const oY = gsap.quickTo('.hero-k-oframe', 'y', { duration: 1, ease: 'power3' });
      const oRy = gsap.quickTo('.hero-k-oframe', 'rotationY', { duration: 0.7, ease: 'power3' });
      const oRx = gsap.quickTo('.hero-k-oframe', 'rotationX', { duration: 0.7, ease: 'power3' });

      const root = containerRef.current;
      const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        nameX(nx * 14);
        nameY(ny * 9);
        oX(nx * -22);
        oY(ny * -13);
        oRy(nx * 12);
        oRx(ny * -12);
        if (root) {
          const rect = root.getBoundingClientRect();
          root.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          root.style.setProperty('--my', `${e.clientY - rect.top}px`);
        }
      };
      window.addEventListener('pointermove', onMove);

      /* magnetic CTA buttons */
      const magnets = gsap.utils.toArray('.hero-k-actions .btn-cta-primary, .hero-k-actions .btn-cta-outline');
      const magCleanups = magnets.map((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
        const move = (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
        };
        const reset = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', reset);
        return () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', reset);
        };
      });

      return () => {
        window.removeEventListener('pointermove', onMove);
        magCleanups.forEach((fn) => fn());
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const cycleTheme = () => {
    const i = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(i + 1) % THEME_CYCLE.length];
    setTheme(next);
    if (prefersReduced()) return;
    gsap.fromTo('.hero-k-oframe',
      { scale: 0.9 },
      { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    gsap.fromTo('.hero-k-sweep',
      { xPercent: -120, opacity: 0.8 },
      { xPercent: 130, opacity: 0, duration: 0.85, ease: 'power2.inOut' });
  };

  const heroSocials = SOCIALS.filter((s) => HERO_SOCIAL_IDS.includes(s.id));

  return (
    <section id="home" ref={containerRef} className="portfolio-home hero-kinetic">

      <canvas ref={canvasRef} className="hero-constellation" aria-hidden="true" />

      {/* ── Background ── */}
      <div className="home-bg">
        <div className="home-glow home-glow-1" />
        <div className="home-glow home-glow-2" />
        <div className="hero-k-vignette" />
      </div>
      <div className="hero-k-grain" aria-hidden="true" />
      <div className="hero-k-spot" aria-hidden="true" />
      <div className="hero-k-sweep" aria-hidden="true" />

      <div className="hero-k-stage">
        <div className="hero-k-inner">

          {/* Giant name — photo is the "O" and switches the theme */}
          <div className="hero-k-namewrap">
            <span className="hero-k-halo" aria-hidden="true" />
            <span className="hero-k-halo hero-k-halo-2" aria-hidden="true" />

            <h1 className="hero-k-name" aria-label={heroData.name}>
              {NAME_LETTERS.map((ch, i) =>
                ch === 'O' ? (
                  <button
                    key={i}
                    type="button"
                    className="hero-k-oframe"
                    onClick={cycleTheme}
                    aria-label="Switch colour theme"
                  >
                    <span className="hero-k-oring" aria-hidden="true" />
                    <span className="hero-k-oring hero-k-oring-2" aria-hidden="true" />
                    <img src={profileImage} alt={heroData.name} />
                    <span className="hero-k-ohint" aria-hidden="true">
                      <Palette />
                      switch theme
                    </span>
                  </button>
                ) : (
                  <span key={i} className="hero-k-letter" aria-hidden="true">
                    <span className="hero-k-letter-i" data-ch={ch}>{ch}</span>
                  </span>
                )
              )}
            </h1>
          </div>

          {/* Role */}
          <div className="hero-k-role">
            <span className="hero-k-role-caret">{'>'}</span>
            <span className="hero-k-role-prefix">a</span>
            <span className="hero-k-role-slot">
              <span ref={wordRef} className="hero-k-role-word">
                {roles[roleIndex]}
              </span>
            </span>
          </div>

          {/* Location + local time */}
          <div className="hero-k-meta">
            <span className="hero-k-meta-dot" />
            <span>India</span>
            <span className="hero-k-meta-sep">/</span>
            <span>{clock} IST</span>
          </div>

          {/* Bio */}
          <p className="hero-k-bio">{heroData.bio}</p>

          {/* Actions */}
          <div className="hero-k-actions">
            <a href={heroData.cvUrl} download className="btn-cta-primary">
              <Download size={15} />
              Resume
            </a>
            <button
              className="btn-cta-outline"
              onClick={() =>
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <FolderOpen size={15} />
              View Projects
            </button>
            <div className="hero-k-socials">
              {heroSocials.map(({ id, Icon, href, label }) => (
                <a
                  key={id}
                  href={href}
                  target={id !== 'email' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="social-btn"
                  title={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll-hint scroll-hint">
        <ArrowDown size={14} />
        <span>scroll</span>
      </div>
    </section>
  );
};

export default Home;
