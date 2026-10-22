import { useEffect, useRef } from 'react';

/**
 * Ambient "life" layer: drifting fireflies that gently flee the cursor,
 * a soft cursor glow. All colours come from the
 * active theme, everything is pointer-events:none and reduced-motion aware.
 */
const readAccent = () => {
  const cs = getComputedStyle(document.documentElement);
  return {
    accent: cs.getPropertyValue('--color-accent').trim() || '#1abc9c',
    light: cs.getPropertyValue('--color-accent-light').trim() || '#4dd9bc',
  };
};

const Living = () => {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0, colors = readAccent();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const N = reduced ? 0 : Math.round(Math.min(28, (w * h) / 60000));
    const flies = Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 - 0.05,
      r: Math.random() * 1.8 + 0.6, ph: Math.random() * 6.28, sp: Math.random() * 0.02 + 0.008,
      hue: Math.random() < 0.5 ? 0 : 1,
    }));

    // one pre-rendered glow per colour instead of a canvas shadow per particle per frame
    const sprite = (color) => {
      const c = document.createElement('canvas'); c.width = c.height = 32;
      const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, color); g.addColorStop(0.35, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c;
    };
    let sprites = [sprite(colors.accent), sprite(colors.light)];

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.18;
      mouse.y += (mouse.ty - mouse.y) * 0.18;
      for (const f of flies) {
        f.ph += f.sp;
        const dx = f.x - mouse.x, dy = f.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          const d = Math.sqrt(d2) || 1;
          const push = (1 - d / 148) * 0.9;
          f.vx += (dx / d) * push * 0.08;
          f.vy += (dy / d) * push * 0.08;
        }
        f.vx *= 0.985; f.vy *= 0.985;
        f.x += f.vx + Math.sin(f.ph) * 0.18;
        f.y += f.vy + Math.cos(f.ph * 0.8) * 0.12;
        if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10;
        if (f.y < -10) f.y = h + 10; else if (f.y > h + 10) f.y = -10;
        ctx.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(f.ph * 2.3));
        const sz = f.r * 7;
        ctx.drawImage(sprites[f.hue], f.x - sz / 2, f.y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    };
    if (!reduced) tick();

    const onMove = (e) => {
      mouse.tx = e.clientX; mouse.ty = e.clientY;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    };
    const onLeave = () => { mouse.tx = mouse.ty = -9999; };
    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    window.addEventListener('resize', resize);

    /* freeze CSS animations in sections that are out of view (also covers sections mounted later) */
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.toggleAttribute('data-off', !e.isIntersecting));
    }, { rootMargin: '160px 0px' });
    const watch = () => document.querySelectorAll('section, footer').forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
    watch();
    const dom = new MutationObserver(watch);
    dom.observe(document.body, { childList: true, subtree: true });

    const mo = new MutationObserver(() => { requestAnimationFrame(() => { colors = readAccent(); sprites = [sprite(colors.accent), sprite(colors.light)]; }); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
      mo.disconnect();
      dom.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <>
      <div className="lv-glow" ref={glowRef} aria-hidden="true" />
      <canvas className="lv-canvas" ref={canvasRef} aria-hidden="true" />
      <style>{`
        .lv-canvas { position:fixed; inset:0; width:100vw; height:100vh; pointer-events:none; z-index:30; }
        .lv-glow { position:fixed; left:0; top:0; width:0; height:0; z-index:29; pointer-events:none; }
        .lv-glow::before { content:''; position:absolute; width:520px; height:520px; left:-260px; top:-260px; border-radius:50%;
          background:radial-gradient(circle, var(--color-accent-subtle), transparent 62%); }
        @media (hover:none) { .lv-glow { display:none; } }
      `}</style>
    </>
  );
};

export default Living;
