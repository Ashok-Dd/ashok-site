import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase, Check } from 'lucide-react';
import { experienceData } from '../../data';
import useTilt from '../hooks/useTilt';

gsap.registerPlugin(ScrollTrigger);

const initials = (name) =>
  name.split(/\s+/).filter((w) => w.length > 2).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/** a thick coin that keeps turning: the logo is on both faces (as a background, which paints reliably in 3D), rim is a short stack of discs */
const Coin = ({ src, company }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const im = new Image();
    im.onerror = () => setFailed(true);
    im.src = src;
  }, [src]);
  const face = failed
    ? <span className="xp-coin-fallback">{initials(company)}</span>
    : null;
  const bg = failed ? undefined : { backgroundImage: `url(${src})` };
  return (
    <div className="xp-stage">
      <div className="xp-coin">
        {Array.from({ length: 7 }, (_, i) => <i key={i} className="xp-rim" style={{ '--z': `${(i - 3) * 2}px` }} />)}
        <div className="xp-face xp-front" style={bg} role="img" aria-label={`${company} logo`}>{face}</div>
        <div className="xp-face xp-back" style={bg} aria-hidden="true">{face}</div>
      </div>
      <span className="xp-floor" />
    </div>
  );
};

const Experience = () => {
  const sectionRef = useRef(null);
  useTilt(sectionRef, '.xp-card', 6);

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
        opacity: 0, y: 70, rotateX: -18, transformPerspective: 1000, duration: 1, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.xp-list', start: 'top 82%', once: true },
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

              <aside className="xp-side">
                <Coin src={e.logo} company={e.company} />
                <span className="xp-badge xp-badge-live"><span className="xp-pulse" />{e.period}</span>
                <span className="xp-badge"><Briefcase size={11} />{e.type}</span>
              </aside>

              <div className="xp-body">
                <p className="xp-company">@ {e.company}</p>
                <h3 className="xp-role">{e.role}</h3>
                <p className="xp-summary">{e.summary}</p>

                <ul className="xp-points">
                  {e.points.map((p, i) => (
                    <li key={p} style={{ '--i': i }}><span><Check size={13} /></span>{p}</li>
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
        .xp-list { position:relative; max-width:1020px; margin:0 auto; padding-left:56px; display:grid; gap:40px; }
        .xp-line { position:absolute; left:15px; top:12px; bottom:12px; width:2px; background:var(--color-border); border-radius:2px; }
        .xp-line-fill { position:absolute; inset:0; transform-origin:top; background:linear-gradient(var(--color-accent-light),var(--color-accent)); box-shadow:0 0 14px var(--color-accent-glow); }
        .xp-item { position:relative; perspective:1200px; }
        .xp-node { position:absolute; left:-49px; top:46px; width:20px; height:20px; border-radius:50%; background:var(--color-bg-sunken); border:2px solid var(--color-accent); display:flex; align-items:center; justify-content:center; z-index:2; }
        .xp-node span { width:8px; height:8px; border-radius:50%; background:var(--color-accent); animation:xpPulse 2s ease-in-out infinite; }
        @keyframes xpPulse { 0%,100% { box-shadow:0 0 0 0 var(--color-accent-glow); opacity:1; } 50% { box-shadow:0 0 0 9px transparent; opacity:.7; } }

        /* card */
        .xp-card { --rx:0deg; --ry:0deg; --mx:50%; --my:50%; position:relative; display:grid; grid-template-columns:230px 1fr; gap:36px; align-items:center; padding:40px 40px 40px 30px; border-radius:var(--radius-xl);
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
          background:radial-gradient(460px circle at var(--mx) var(--my), var(--color-accent-muted), transparent 60%); }
        .xp-card:hover .xp-spot { opacity:1; }

        /* left column: spinning coin + status */
        .xp-side { display:grid; justify-items:center; gap:12px; transform:translateZ(46px); }
        .xp-stage { position:relative; width:170px; height:190px; perspective:700px; display:flex; align-items:center; justify-content:center; margin-bottom:6px; }
        .xp-coin { position:relative; width:150px; height:150px; transform-style:preserve-3d; animation:xpSpin 8s linear infinite; }
        .xp-stage:hover .xp-coin { animation-duration:3s; }
        @keyframes xpSpin { from { transform:rotateX(-8deg) rotateY(0deg); } to { transform:rotateX(-8deg) rotateY(360deg); } }
        .xp-rim, .xp-face { position:absolute; inset:0; border-radius:50%; }
        .xp-rim { transform:translateZ(var(--z)); background:linear-gradient(135deg,var(--color-accent-dark),var(--color-accent)); }
        .xp-face { background-color:var(--color-bg-elevated); background-size:100% 100%; background-repeat:no-repeat; background-position:center; backface-visibility:hidden; display:flex; align-items:center; justify-content:center; overflow:hidden;
          box-shadow:inset 0 0 0 5px var(--color-accent), inset 0 0 28px rgba(0,0,0,.35); }
        .xp-front { transform:translateZ(8px); }
        .xp-back { transform:rotateY(180deg) translateZ(8px); }
        .xp-coin-fallback { font-family:var(--font-display); font-weight:900; font-size:2.4rem; color:var(--color-accent); }
        .xp-floor { position:absolute; left:50%; bottom:0; width:120px; height:20px; margin-left:-60px; border-radius:50%; background:radial-gradient(ellipse, var(--color-accent-glow), transparent 70%); filter:blur(5px); animation:xpShadow 4.5s ease-in-out infinite; }
        @keyframes xpShadow { 0%,100% { transform:scaleX(1); opacity:.7; } 50% { transform:scaleX(.5); opacity:.35; } }

        .xp-badge { display:inline-flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase;
          color:var(--color-text-secondary); border:1px solid var(--color-border-strong); border-radius:var(--radius-full); padding:5px 12px; }
        .xp-badge-live { color:var(--color-accent); border-color:var(--color-accent-border); background:var(--color-accent-subtle); }
        .xp-pulse { width:6px; height:6px; border-radius:50%; background:var(--color-accent); animation:xpPulse 2s ease-in-out infinite; }

        /* right column */
        .xp-body { position:relative; min-width:0; transform:translateZ(20px); }
        .xp-company { font-family:var(--font-mono); font-size:.8rem; letter-spacing:.24em; text-transform:uppercase; color:var(--color-accent); margin:0 0 8px; }
        .xp-role { font-family:var(--font-display); font-size:clamp(1.9rem,4vw,2.8rem); font-weight:900; line-height:1.08; margin:0 0 18px; color:var(--color-text-primary);
          text-shadow:0 1px 0 var(--color-accent-dark), 0 2px 0 var(--color-accent-dark), 0 3px 0 var(--color-accent-dark), 0 4px 0 var(--color-accent-dark), 0 12px 22px rgba(0,0,0,.5); }
        .xp-summary { font-family:var(--font-body); font-size:.95rem; line-height:1.8; color:var(--color-text-secondary); margin:0 0 20px; }
        .xp-points { margin:0 0 20px; padding:0; list-style:none; display:grid; gap:10px; }
        .xp-points li { display:flex; gap:12px; align-items:center; padding:11px 14px; border-radius:12px; font-family:var(--font-body); font-size:.88rem; color:var(--color-text-primary);
          background:var(--color-bg-glass); border:1px solid var(--color-border); transform:translateZ(calc(8px + var(--i) * 6px)); transition:border-color .25s, transform .25s; }
        .xp-points li:hover { border-color:var(--color-accent-border); transform:translateZ(26px) translateX(4px); }
        .xp-points li span { flex:0 0 24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--color-bg-primary); background:var(--color-accent); box-shadow:0 0 12px var(--color-accent-glow); }
        .xp-tags { display:flex; flex-wrap:wrap; gap:8px; }
        .xp-tags span { font-family:var(--font-mono); font-size:.62rem; letter-spacing:.12em; text-transform:uppercase; color:var(--color-accent);
          background:var(--color-accent-subtle); border:1px solid var(--color-accent-border); border-radius:8px; padding:5px 11px; transition:transform .25s, background .25s; }
        .xp-tags span:hover { transform:translateY(-3px); background:var(--color-accent-muted); }

        @media (max-width:820px) {
          .xp-card { grid-template-columns:minmax(0,1fr); gap:24px; padding:30px 22px; transform:none; transform-style:flat; }
          .xp-side, .xp-body, .xp-points li { transform:none; }
          .xp-side { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; }
          .xp-stage { flex:0 0 100%; margin-bottom:0; }
          .xp-points li:hover { transform:translateX(3px); }
        }
        @media (max-width:700px) {
          .xp-section { padding:80px 16px 72px; }
          .xp-head { margin-bottom:40px; }
          .xp-list { padding-left:30px; gap:28px; }
          .xp-line { left:6px; }
          .xp-node { left:-30px; top:34px; width:16px; height:16px; }
          .xp-node span { width:6px; height:6px; }
          .xp-card { padding:24px 16px 22px; gap:20px; }
          .xp-stage { width:140px; height:156px; margin:0 auto; flex:0 0 100%; }
          .xp-coin { width:118px; height:118px; }
          .xp-company { font-size:.7rem; letter-spacing:.18em; }
          .xp-role { font-size:1.65rem; margin-bottom:14px; }
          .xp-summary { font-size:.88rem; line-height:1.7; }
          .xp-points li { padding:10px 12px; font-size:.84rem; gap:10px; align-items:flex-start; }
          .xp-points li span { margin-top:1px; }
          .xp-tags span { font-size:.58rem; }
        }
        @media (prefers-reduced-motion:reduce) {
          .xp-border, .xp-title, .xp-dot, .xp-node span, .xp-pulse, .xp-coin, .xp-floor { animation:none; }
          .xp-card { transition:none; }
        }
      `}</style>
    </section>
  );
};

export default Experience;
