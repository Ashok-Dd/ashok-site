import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categoriesData } from '../../data';
import { lazy, Suspense } from 'react';
const Skills3D = lazy(() => import('./Skills3D'));

gsap.registerPlugin(ScrollTrigger);

const total = categoriesData.reduce((n, c) => n + c.skills.length, 0);

export default function Skills() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sk-head > *', {
        opacity: 0, y: 26, duration: 0.8, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" ref={ref} className="sk-section">
      <div className="sk-bg" aria-hidden="true" />

      <div className="sk-head">
        <p className="sk-eyebrow"><span className="sk-dot" />Technical Expertise<span className="sk-dot" /></p>
        <h2 className="sk-title">Skills</h2>
        <p className="sk-sub">{total} tools across {categoriesData.length} disciplines</p>
        <div className="sk-ruler"><i /><b /><i /></div>
      </div>

      <Suspense fallback={<div style={{ minHeight: 560 }} />}><Skills3D /></Suspense>

      <style>{`
        .sk-section { position:relative; overflow:hidden; background:var(--color-bg-primary); color:var(--color-text-primary); padding:110px 24px 100px; margin-top:-30px; }
        .sk-bg { position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 55% 40% at 15% 20%, var(--color-accent-muted), transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 85%, var(--color-accent-subtle), transparent 70%),
            linear-gradient(var(--color-border) 1px, transparent 1px) 0 0/56px 56px, linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0/56px 56px;
          -webkit-mask:linear-gradient(#000 60%, transparent); mask:linear-gradient(#000 60%, transparent); opacity:.7; }

        .sk-head { position:relative; text-align:center; margin-bottom:28px; }
        .sk-eyebrow { display:inline-flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:11px; letter-spacing:.4em; text-transform:uppercase; color:var(--color-accent); margin-bottom:14px; }
        .sk-dot { width:5px; height:5px; border-radius:50%; background:var(--color-accent); box-shadow:0 0 8px var(--color-accent-glow); }
        .sk-title { font-family:var(--font-display); font-size:clamp(2.4rem,6vw,4.4rem); font-weight:900; letter-spacing:.06em; margin:0 0 10px;
          background:linear-gradient(135deg,var(--color-text-primary) 30%,var(--color-accent) 70%,var(--color-accent-light)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .sk-sub { font-family:var(--font-mono); font-size:.72rem; letter-spacing:.26em; text-transform:uppercase; color:var(--color-text-muted); margin:0; }
        .sk-ruler { display:flex; justify-content:center; align-items:center; gap:14px; margin-top:22px; }
        .sk-ruler i { width:100px; height:1px; background:linear-gradient(to right,var(--color-accent-border),transparent); }
        .sk-ruler i:last-child { background:linear-gradient(to left,var(--color-accent-border),transparent); }
        .sk-ruler b { width:8px; height:8px; background:var(--color-accent); transform:rotate(45deg); box-shadow:0 0 14px var(--color-accent-glow); }

        .sk-bento { position:relative; max-width:1160px; margin:0 auto; display:grid; gap:22px; perspective:1400px;
          grid-template-columns:repeat(12, 1fr);
          grid-template-areas:"fe fe fe fe fe fe fe be be be be be" "lg lg lg ai ai ai ai tl tl tl tl tl"; }

        .sk-slab { --rx:0deg; --ry:0deg; --mx:50%; --my:50%; position:relative; display:flex; flex-direction:column; gap:22px; padding:28px; border-radius:var(--radius-xl);
          border:1px solid var(--color-border); background:linear-gradient(150deg,var(--color-bg-elevated),var(--color-bg-sunken)); box-shadow:var(--shadow-md);
          transform:rotateX(var(--rx)) rotateY(var(--ry)); transform-style:preserve-3d; transition:transform .25s ease-out, border-color .3s, box-shadow .3s; }
        .sk-slab:hover { border-color:var(--color-accent-border); box-shadow:var(--shadow-lg), 0 0 44px var(--color-accent-muted); }
        .sk-spot { position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0; transition:opacity .3s;
          background:radial-gradient(380px circle at var(--mx) var(--my), var(--color-accent-muted), transparent 62%); }
        .sk-slab:hover .sk-spot { opacity:1; }

        .sk-slab-head { position:relative; display:flex; align-items:center; gap:14px; transform:translateZ(30px); }
        .sk-slab-icon { width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; color:var(--color-accent);
          background:var(--color-accent-subtle); border:1px solid var(--color-accent-border); box-shadow:0 8px 22px var(--color-accent-muted); }
        .sk-slab-head h3 { margin:0; font-family:var(--font-display); font-size:1.15rem; font-weight:800; color:var(--color-text-primary); flex:1; }
        .sk-slab-n { font-family:var(--font-display); font-size:1.5rem; font-weight:900; color:var(--color-accent-faint); }
        .sk-slab-n b { font-weight:900; color:var(--color-accent); opacity:.85; }

        .sk-chips { position:relative; list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:10px; transform:translateZ(18px); }
        .sk-chip { display:inline-flex; align-items:center; gap:9px; padding:9px 15px 9px 12px; border-radius:var(--radius-full); cursor:default;
          font-family:var(--font-body); font-size:.84rem; font-weight:600; color:var(--color-text-secondary);
          background:var(--color-bg-glass); border:1px solid var(--color-border); transition:transform .25s, border-color .25s, color .25s, box-shadow .25s; }
        .sk-chip svg { color:var(--b); flex-shrink:0; filter:saturate(.9); transition:transform .3s; }
        .sk-chip:hover { transform:translateY(-4px); color:var(--color-text-primary); border-color:color-mix(in srgb,var(--b) 55%,transparent); box-shadow:0 10px 24px color-mix(in srgb,var(--b) 22%,transparent); }
        .sk-chip:hover svg { transform:scale(1.2) rotate(-6deg); }

        @media (max-width:980px) {
          .sk-bento { grid-template-columns:1fr 1fr; grid-template-areas:"fe fe" "be lg" "ai tl"; }
        }
        @media (max-width:680px) {
          .sk-section { padding:80px 16px 72px; }
          .sk-bento { grid-template-columns:1fr; grid-template-areas:"fe" "be" "lg" "tl" "ai"; gap:16px; }
          .sk-slab { padding:22px 18px; }
        }
        @media (prefers-reduced-motion:reduce) { .sk-slab, .sk-chip, .sk-chip svg { transition:none; } }
      `}</style>
    </section>
  );
}
