import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { freelanceData, FREELANCE_PROJECTS } from '../../data';
import useTilt from '../hooks/useTilt';
import { hasWebGL } from '../three/webgl';
import Boundary from '../three/Boundary';
import { normalizeProject } from '../utils/projects';
import FloatingProjectCard from './FloatingProjectCard';
import ProjectDetails from './ProjectDetails';
const ProjectSpace3D = lazy(() => import('./ProjectSpace3D'));

gsap.registerPlugin(ScrollTrigger);

/* ───────────── section ───────────── */
const Freelance = () => {
  const sectionRef = useRef(null);
  const projects = useMemo(() => FREELANCE_PROJECTS.map(normalizeProject), []);
  const [webgl] = useState(() => hasWebGL());
  const [focus, setFocus] = useState(0);
  const [open, setOpen] = useState(null);
  useTilt(sectionRef, '.fr-step', 14);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fr-head > *, .fr-blurb, .fr-status', {
        opacity: 0, y: 28, duration: 0.8, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      });
      gsap.fromTo('.fr-flow-fill', { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.fr-process', start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
      });
      gsap.from('.fr-step', {
        opacity: 0, y: 50, rotateX: -22, transformPerspective: 900, duration: 0.9, stagger: 0.14, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: '.fr-process', start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const goContact = () => {
    const el = document.getElementById(freelanceData.cta.target);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
  };

  const ticker = [...freelanceData.services, ...freelanceData.services, ...freelanceData.services];

  return (
    <section id="freelance" ref={sectionRef} className="fr-section">

      <div className="fr-head">
        <p className="fr-eyebrow"><span className="fr-dot" />{freelanceData.eyebrow}<span className="fr-dot" /></p>
        <h2 className="fr-title">{freelanceData.title}</h2>
        <p className="fr-sub">{freelanceData.subtitle}</p>
        <div className="fr-ruler"><i /><b /><i /></div>
      </div>

      <p className="fr-blurb">{freelanceData.blurb}</p>
      <div className="fr-status"><span className="fr-live" />Taking on new projects</div>

      <div className="fr-ticker" aria-hidden="true">
        <div className="fr-track">
          {ticker.map((s, i) => (<span key={i}><i />{s}</span>))}
        </div>
      </div>

      <div className="fr-process">
        <p className="fr-process-title"><span />How I work<span /></p>
        <div className="fr-flow" aria-hidden="true"><i className="fr-flow-fill" /></div>
        <div className="fr-steps">
          {freelanceData.process.map((s) => (
            <div key={s.n} className="fr-step">
              <span className="fr-step-n">{s.n}</span>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="fr-process-title fr-cases-title"><span />Case files<span /></p>

      {webgl ? (
        <Boundary fallback={<div className="fp-grid">{projects.map((p, i) => <FloatingProjectCard key={p.id} project={p} index={i} onOpen={setOpen} />)}</div>}>
          <Suspense fallback={<div className="ps-wrap" />}>
            <ProjectSpace3D projects={projects} focus={focus} onFocus={setFocus} onOpen={setOpen} />
          </Suspense>
        </Boundary>
      ) : (
        <div className="fp-grid">
          {projects.map((p, i) => <FloatingProjectCard key={p.id} project={p} index={i} onOpen={setOpen} />)}
        </div>
      )}

      <ProjectDetails project={open} onClose={() => setOpen(null)} />

      <div className="fr-cta-wrap">
        <button className="fr-cta" onClick={goContact}>
          <span>{freelanceData.cta.label}</span><ArrowRight size={15} />
          <i aria-hidden="true" />
        </button>
      </div>

      <style>{`
        .fr-section { position:relative; overflow:hidden; background:var(--color-bg-primary); color:var(--color-text-primary); padding:56px 24px 90px; }


        .fr-head { position:relative; text-align:center; margin-bottom:28px; }
        .fr-eyebrow { display:inline-flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:11px; letter-spacing:.4em; text-transform:uppercase; color:var(--color-accent); margin-bottom:14px; }
        .fr-dot { width:5px; height:5px; border-radius:50%; background:var(--color-accent); box-shadow:0 0 8px var(--color-accent-glow); animation:frPulse 2s ease-in-out infinite; }
        .fr-title { font-family:var(--font-display); font-size:clamp(2.2rem,5.5vw,3.8rem); font-weight:900; letter-spacing:.06em; margin:0 0 10px;
          background:linear-gradient(110deg,var(--color-text-primary) 25%,var(--color-accent) 50%,var(--color-text-primary) 75%); background-size:250% 100%;
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:frShine 6s linear infinite; }
        @keyframes frShine { to { background-position:-250% 0; } }
        .fr-sub { font-family:var(--font-mono); font-size:.7rem; letter-spacing:.28em; text-transform:uppercase; color:var(--color-text-muted); margin:0; }
        .fr-ruler { display:flex; justify-content:center; align-items:center; gap:14px; margin-top:22px; }
        .fr-ruler i { width:100px; height:1px; background:linear-gradient(to right,var(--color-accent-border),transparent); }
        .fr-ruler i:last-child { background:linear-gradient(to left,var(--color-accent-border),transparent); }
        .fr-ruler b { width:8px; height:8px; background:var(--color-accent); transform:rotate(45deg); box-shadow:0 0 14px var(--color-accent-glow); }

        .fr-blurb { position:relative; max-width:720px; margin:0 auto 18px; text-align:center; font-family:var(--font-body); font-size:.95rem; line-height:1.8; color:var(--color-text-secondary); }
        .fr-status { position:relative; width:max-content; margin:0 auto 38px; display:flex; align-items:center; gap:10px; font-family:var(--font-mono); font-size:.64rem; letter-spacing:.2em; text-transform:uppercase;
          color:var(--color-accent); border:1px solid var(--color-accent-border); background:var(--color-accent-subtle); border-radius:var(--radius-full); padding:7px 16px; }
        .fr-live { width:8px; height:8px; border-radius:50%; background:var(--color-success); animation:frLive 1.8s ease-out infinite; }
        @keyframes frLive { 0% { box-shadow:0 0 0 0 color-mix(in srgb, var(--color-success) 60%, transparent); } 100% { box-shadow:0 0 0 12px transparent; } }
        @keyframes frPulse { 0%,100% { opacity:1; } 50% { opacity:.35; } }

        .fr-ticker { position:relative; overflow:hidden; margin:0 -24px 64px; padding:14px 0; border-block:1px solid var(--color-border);
          background:var(--color-bg-glass); -webkit-mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); }
        .fr-track { display:flex; width:max-content; gap:44px; animation:frTick 38s linear infinite; }
        .fr-ticker:hover .fr-track { animation-play-state:paused; }
        .fr-track span { display:inline-flex; align-items:center; gap:14px; white-space:nowrap; font-family:var(--font-mono); font-size:.72rem; letter-spacing:.24em; text-transform:uppercase; color:var(--color-text-secondary); }
        .fr-track i { width:7px; height:7px; background:var(--color-accent); transform:rotate(45deg); box-shadow:0 0 10px var(--color-accent-glow); }
        @keyframes frTick { to { transform:translateX(-33.333%); } }

        /* process */
        .fr-process { position:relative; max-width:1120px; margin:0 auto 90px; }
        .fr-process-title { display:flex; align-items:center; justify-content:center; gap:14px; margin:0 0 28px; font-family:var(--font-mono); font-size:.66rem; letter-spacing:.36em; text-transform:uppercase; color:var(--color-accent); }
        .fr-process-title span { width:36px; height:1px; background:var(--color-accent-border); }
        .fr-cases-title { max-width:1120px; margin:0 auto 54px; }
        .fr-flow { position:absolute; left:6%; right:6%; top:calc(2.4rem + 34px); height:2px; background:var(--color-border); border-radius:2px; z-index:0; }
        .fr-flow-fill { position:absolute; inset:0; transform-origin:left; background:linear-gradient(90deg,var(--color-accent-light),var(--color-accent)); box-shadow:0 0 12px var(--color-accent-glow); }
        .fr-steps { position:relative; display:grid; grid-template-columns:repeat(4,1fr); gap:18px; perspective:1200px; z-index:1; }
        .fr-step { --rx:0deg; --ry:0deg; position:relative; padding:22px 20px; border-radius:var(--radius-lg); border:1px solid var(--color-border);
          background:linear-gradient(150deg,var(--color-bg-elevated),var(--color-bg-sunken)); box-shadow:var(--shadow-md);
          transform:rotateX(var(--rx)) rotateY(var(--ry)); transform-style:preserve-3d; transition:transform .25s ease-out, border-color .3s, box-shadow .3s; }
        .fr-step:hover { border-color:var(--color-accent-border); box-shadow:var(--shadow-lg), 0 0 34px var(--color-accent-muted); }
        .fr-step-n { display:inline-flex; width:46px; height:46px; align-items:center; justify-content:center; border-radius:50%; margin-bottom:14px;
          font-family:var(--font-display); font-weight:900; font-size:.95rem; color:var(--color-bg-primary); background:linear-gradient(135deg,var(--color-accent),var(--color-accent-light));
          box-shadow:0 0 0 5px var(--color-bg-primary), 0 0 22px var(--color-accent-glow); transform:translateZ(34px); }
        .fr-step h4 { margin:0 0 6px; font-family:var(--font-display); font-size:1rem; font-weight:800; color:var(--color-text-primary); transform:translateZ(20px); }
        .fr-step p { margin:0; font-family:var(--font-body); font-size:.82rem; line-height:1.65; color:var(--color-text-secondary); transform:translateZ(10px); }

        .fr-cta-wrap { position:relative; display:flex; justify-content:center; margin-top:96px; }
        .fr-cta { position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:10px; cursor:pointer; padding:16px 34px; border:0; border-radius:14px;
          font-family:var(--font-mono); font-size:.74rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-on-light);
          background:linear-gradient(135deg,var(--color-accent),var(--color-accent-light)); box-shadow:var(--shadow-accent); transition:transform .25s, box-shadow .25s; }
        .fr-cta:hover { transform:translateY(-3px) scale(1.02); box-shadow:var(--shadow-glow); }
        .fr-cta svg { transition:transform .25s; } .fr-cta:hover svg { transform:translateX(5px); }
        .fr-cta i { position:absolute; top:0; bottom:0; width:60px; left:-80px; background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent); transform:skewX(-20deg); animation:frGleam 3.6s ease-in-out infinite; }
        @keyframes frGleam { 0%,55% { left:-80px; } 100% { left:120%; } }

        @media (max-width:980px) {
          .fr-steps { grid-template-columns:1fr 1fr; } .fr-flow { display:none; }
        }
        @media (max-width:560px) {
          .fr-section { padding:80px 16px 72px; } .fr-ticker { margin-inline:-16px; } .fr-steps { grid-template-columns:1fr; }
        }
        @media (prefers-reduced-motion:reduce) {
          .fr-title, .fr-track, .fr-dot, .fr-live, .fr-cta i { animation:none; }
          .fr-step { transition:none; }
        }
      `}</style>
    </section>
  );
};

export default Freelance;
