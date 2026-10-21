import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase, Sparkles } from 'lucide-react';
import { experienceData } from '../../data';
import useTilt from '../hooks/useTilt';

gsap.registerPlugin(ScrollTrigger);

const initials = (name) =>
  name.split(/\s+/).filter((w) => w.length > 2).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const CompanyLogo = ({ src, company }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="xp-logo">
      <div className="xp-logo-core">
        {failed ? (
          <span className="xp-logo-fallback">{initials(company)}</span>
        ) : (
          <img src={src} alt={`${company} logo`} onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  );
};

const Experience = () => {
  const sectionRef = useRef(null);
  useTilt(sectionRef, '.xp-card', 7);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.xp-head > *', {
        opacity: 0, y: 28, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      });
      gsap.fromTo('.xp-line-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.xp-list', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
      });
      gsap.from('.xp-item', {
        opacity: 0, x: -50, rotateY: -14, transformPerspective: 900, duration: 0.9, stagger: 0.18, ease: 'power3.out',
        scrollTrigger: { trigger: '.xp-list', start: 'top 80%', once: true },
      });
      gsap.to('.xp-float', {
        yPercent: (i) => (i % 2 ? -30 : 30), ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="xp-section">
      <div className="xp-bg" aria-hidden="true">
        <span className="xp-float xp-blob" />
      </div>

      <div className="xp-head">
        <p className="xp-eyebrow"><span className="xp-dot" />Where I Work<span className="xp-dot" /></p>
        <h2 className="xp-title">Experience</h2>
        <p className="xp-sub">Currently shipping · Go-to-market engineering</p>
        <div className="xp-ruler"><i /><b /><i /></div>
      </div>

      <div className="xp-list">
        <div className="xp-line"><span className="xp-line-fill" /></div>

        {experienceData.map((e) => (
          <div key={e.id} className="xp-item">
            <div className="xp-node"><span /></div>

            <article className="xp-card">
              <span className="xp-border" aria-hidden="true" />
              <span className="xp-spot" aria-hidden="true" />

              <CompanyLogo src={e.logo} company={e.company} />

              <div className="xp-body">
                <div className="xp-top">
                  <div>
                    <h3 className="xp-role">{e.role}</h3>
                    <p className="xp-company">@ {e.company}</p>
                  </div>
                  <div className="xp-meta">
                    <span className="xp-badge xp-badge-live"><span className="xp-pulse" />{e.period}</span>
                    <span className="xp-badge"><Briefcase size={11} />{e.type}</span>
                  </div>
                </div>

                <p className="xp-summary">{e.summary}</p>

                <ul className="xp-points">
                  {e.points.map((p) => (
                    <li key={p}><Sparkles size={13} />{p}</li>
                  ))}
                </ul>

                <div className="xp-tags">
                  {e.tags.map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>

      <style>{`
        .xp-section { position:relative; overflow:hidden; background:var(--color-bg-sunken); color:var(--color-text-primary); padding:110px 24px 100px; }
        .xp-bg { position:absolute; inset:0; pointer-events:none; overflow:hidden;
          background:
            radial-gradient(ellipse 60% 50% at 50% 0%, var(--color-accent-muted), transparent 70%),
            linear-gradient(var(--color-border) 1px, transparent 1px) 0 0/56px 56px,
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0/56px 56px; }
        .xp-blob { position:absolute; width:520px; height:520px; right:-160px; bottom:-120px; border-radius:50%;
          background:radial-gradient(circle, var(--color-accent-muted), transparent 68%); filter:blur(30px); }


        .xp-head { position:relative; text-align:center; margin-bottom:56px; }
        .xp-eyebrow { display:inline-flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:11px; letter-spacing:.4em; text-transform:uppercase; color:var(--color-accent); margin-bottom:14px; }
        .xp-dot { width:5px; height:5px; border-radius:50%; background:var(--color-accent); box-shadow:0 0 8px var(--color-accent-glow); animation:xpPulse 2s ease-in-out infinite; }
        .xp-title { font-family:var(--font-display); font-size:clamp(2.2rem,5.5vw,3.8rem); font-weight:900; letter-spacing:.06em; margin:0 0 10px;
          background:linear-gradient(110deg,var(--color-text-primary) 25%,var(--color-accent) 50%,var(--color-text-primary) 75%); background-size:250% 100%;
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:xpShine 6s linear infinite; }
        @keyframes xpShine { to { background-position:-250% 0; } }
        .xp-sub { font-family:var(--font-mono); font-size:.7rem; letter-spacing:.28em; text-transform:uppercase; color:var(--color-text-muted); margin:0; }
        .xp-ruler { display:flex; justify-content:center; align-items:center; gap:14px; margin-top:22px; }
        .xp-ruler i { width:100px; height:1px; background:linear-gradient(to right,var(--color-accent-border),transparent); }
        .xp-ruler i:last-child { background:linear-gradient(to left,var(--color-accent-border),transparent); }
        .xp-ruler b { width:8px; height:8px; background:var(--color-accent); transform:rotate(45deg); box-shadow:0 0 14px var(--color-accent-glow); }

        /* timeline */
        .xp-list { position:relative; max-width:960px; margin:0 auto; padding-left:56px; }
        .xp-line { position:absolute; left:15px; top:12px; bottom:12px; width:2px; background:var(--color-border); border-radius:2px; }
        .xp-line-fill { position:absolute; inset:0; transform-origin:top; background:linear-gradient(var(--color-accent-light),var(--color-accent)); box-shadow:0 0 14px var(--color-accent-glow); }
        .xp-item { position:relative; perspective:1100px; }
        .xp-node { position:absolute; left:-49px; top:38px; width:20px; height:20px; border-radius:50%; background:var(--color-bg-sunken); border:2px solid var(--color-accent); display:flex; align-items:center; justify-content:center; z-index:2; }
        .xp-node span { width:8px; height:8px; border-radius:50%; background:var(--color-accent); animation:xpPulse 2s ease-in-out infinite; }
        @keyframes xpPulse { 0%,100% { box-shadow:0 0 0 0 var(--color-accent-glow); opacity:1; } 50% { box-shadow:0 0 0 9px transparent; opacity:.7; } }

        /* card */
        .xp-card { --rx:0deg; --ry:0deg; --mx:50%; --my:50%; position:relative; display:flex; gap:30px; padding:34px; border-radius:var(--radius-xl);
          background:linear-gradient(150deg,var(--color-bg-elevated),var(--color-bg-sunken)); box-shadow:var(--shadow-lg);
          transform:rotateX(var(--rx)) rotateY(var(--ry)); transform-style:preserve-3d; transition:transform .25s ease-out, box-shadow .3s; }
        .xp-card:hover { box-shadow:var(--shadow-lg), 0 0 46px var(--color-accent-muted); }
        .xp-border { position:absolute; inset:0; border-radius:inherit; padding:1.5px; pointer-events:none;
          background:conic-gradient(from var(--xp-a,0deg), transparent 0 55%, var(--color-accent) 80%, var(--color-accent-light) 90%, transparent 100%);
          -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude;
          animation:xpSweep 5s linear infinite; opacity:.9; }
        @property --xp-a { syntax:'<angle>'; inherits:false; initial-value:0deg; }
        @keyframes xpSweep { to { --xp-a:360deg; } }
        .xp-spot { position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0; transition:opacity .3s;
          background:radial-gradient(420px circle at var(--mx) var(--my), var(--color-accent-muted), transparent 60%); }
        .xp-card:hover .xp-spot { opacity:1; }

        /* circular logo */
        .xp-logo { position:relative; flex:0 0 112px; width:112px; height:112px; transform:translateZ(40px); }
        .xp-logo-core { position:absolute; inset:14px; border-radius:50%; overflow:hidden; background:var(--color-bg-elevated);
          box-shadow:0 0 0 2px var(--color-accent-border), 0 10px 30px rgba(0,0,0,.45), 0 0 34px var(--color-accent-muted); display:flex; align-items:center; justify-content:center; }
        .xp-logo-core img { width:100%; height:100%; object-fit:cover; border-radius:50%; display:block; }
        .xp-logo-fallback { font-family:var(--font-display); font-weight:900; font-size:1.6rem; color:var(--color-accent); }

        .xp-body { position:relative; flex:1; min-width:0; transform:translateZ(18px); }
        .xp-top { display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-start; }
        .xp-role { font-family:var(--font-display); font-size:1.45rem; font-weight:800; margin:0 0 6px; color:var(--color-text-primary); }
        .xp-company { font-family:var(--font-mono); font-size:.82rem; letter-spacing:.18em; text-transform:uppercase; color:var(--color-accent); margin:0; }
        .xp-meta { display:flex; gap:8px; flex-wrap:wrap; }
        .xp-badge { display:inline-flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase;
          color:var(--color-text-secondary); border:1px solid var(--color-border-strong); border-radius:var(--radius-full); padding:5px 12px; }
        .xp-badge-live { color:var(--color-accent); border-color:var(--color-accent-border); background:var(--color-accent-subtle); }
        .xp-pulse { width:6px; height:6px; border-radius:50%; background:var(--color-accent); animation:xpPulse 2s ease-in-out infinite; }
        .xp-summary { font-family:var(--font-body); font-size:.93rem; line-height:1.75; color:var(--color-text-secondary); margin:18px 0 14px; }
        .xp-points { margin:0 0 18px; padding:0; list-style:none; display:grid; gap:9px; }
        .xp-points li { display:flex; gap:10px; align-items:flex-start; font-family:var(--font-body); font-size:.86rem; color:var(--color-text-secondary); }
        .xp-points li svg { flex-shrink:0; margin-top:3px; color:var(--color-accent); }
        .xp-tags { display:flex; flex-wrap:wrap; gap:8px; }
        .xp-tags span { font-family:var(--font-mono); font-size:.62rem; letter-spacing:.12em; text-transform:uppercase; color:var(--color-accent);
          background:var(--color-accent-subtle); border:1px solid var(--color-accent-border); border-radius:8px; padding:4px 10px; transition:transform .25s, background .25s; }
        .xp-tags span:hover { transform:translateY(-3px); background:var(--color-accent-muted); }

        @media (max-width:700px) {
          .xp-section { padding:80px 16px 72px; }
          .xp-list { padding-left:34px; }
          .xp-line { left:7px; }
          .xp-node { left:-34px; top:30px; }
          .xp-card { flex-direction:column; padding:24px 20px; gap:20px; }
        }
        @media (prefers-reduced-motion:reduce) {
          .xp-border, .xp-title, .xp-dot, .xp-node span, .xp-pulse { animation:none; }
          .xp-card { transition:none; }
        }
      `}</style>
    </section>
  );
};

export default Experience;
