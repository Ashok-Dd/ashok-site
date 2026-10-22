import { lazy, Suspense, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiLeetcode } from 'react-icons/si';
import { ArrowUpRight, Award, Flame, Target } from 'lucide-react';
import { LEETCODE_DATA, leetcodeProfile } from '../../data';
const Donut3D = lazy(() => import('./Donut3D'));
import useTilt from '../hooks/useTilt';

gsap.registerPlugin(ScrollTrigger);

const LEVELS = [
  { key: 'easy', label: 'Easy', color: '#2ecc71', glow: '#58d68d' },
  { key: 'medium', label: 'Medium', color: '#f39c12', glow: '#f7c04a' },
  { key: 'hard', label: 'Hard', color: '#e74c3c', glow: '#f1948a' },
];

const pct = (v) => (v / LEETCODE_DATA.total) * 100;

const insight = () => {
  const { easy, medium, hard } = LEETCODE_DATA;
  if (hard >= 20) return 'Hard problem solver, battle-hardened';
  if (medium > easy) return 'Medium specialist, the sweet spot';
  return 'Consistent grinder, no problem too small';
};

const LeetCodeSection = () => {
  const sectionRef = useRef(null);
  useTilt(sectionRef, '.lc-tile', 14);
  useTilt(sectionRef, '.lc-panel', 4);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
        defaults: { ease: 'power3.out' },
      });
      tl.from('.lc-head > *', { opacity: 0, y: 28, duration: 0.8, stagger: 0.1 })
        .from('.lc-panel', { opacity: 0, y: 70, rotateX: -16, transformPerspective: 1100, duration: 1, stagger: 0.14, clearProps: 'transform' }, '-=0.5')
        .from('.lc-tile', { opacity: 0, y: 40, scale: 0.9, duration: 0.7, stagger: 0.1, clearProps: 'transform' }, '-=0.6');

      gsap.utils.toArray('[data-count]').forEach((el, i) => {
        const target = Number(el.dataset.count);
        const o = { v: 0 };
        tl.to(o, { v: target, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }, 0.5 + i * 0.05);
      });
      gsap.utils.toArray('[data-fill]').forEach((el, i) => {
        tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'power2.out' }, 0.7 + i * 0.08);
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const { total, easy, medium, hard } = LEETCODE_DATA;
  const values = { easy, medium, hard };
  const upperShare = Math.round(pct(medium + hard));

  return (
    <section id="leetcode-section" ref={sectionRef} className="leetcode-section lc">
      <div className="lc-bg" aria-hidden="true"><span className="lc-glow lc-glow-1" /><span className="lc-glow lc-glow-2" /></div>

      <div className="lc-head">
        <p className="lc-eyebrow"><span className="lc-dot" />Battleground · Competitive Coding<span className="lc-dot" /></p>
        <h2 className="lc-title">LeetCode Arena</h2>
        <p className="lc-sub">Solved · Ranked · Victorious</p>
        <div className="lc-ruler"><i /><b /><i /></div>
      </div>

      <div className="lc-grid">
        {/* ── profile ── */}
        <aside className="lc-panel lc-profile">
          <span className="lc-edge" aria-hidden="true" />
          <div className="lc-avatar">
            <span className="lc-ring lc-ring-1" /><span className="lc-ring lc-ring-2" />
            <div className="lc-photo"><img src={leetcodeProfile.avatarImage} alt="Ashok Bongu" /></div>
            <span className="lc-logo"><SiLeetcode size={22} color="#ffa116" /></span>
          </div>
          <h3 className="lc-name">Ashok Bongu</h3>
          <p className="lc-handle">{leetcodeProfile.username}</p>
          <span className="lc-badge"><Award size={13} />{leetcodeProfile.rankBadge}</span>

          <ul className="lc-facts">
            <li><Target size={14} /><span><b data-count={total}>0</b> problems solved</span></li>
            <li><Flame size={14} /><span><b>{upperShare}%</b> medium or harder</span></li>
          </ul>

          <a className="lc-visit" href={leetcodeProfile.profileUrl} target="_blank" rel="noopener noreferrer">
            <SiLeetcode size={14} />View profile<ArrowUpRight size={14} />
          </a>
        </aside>

        {/* ── donut + breakdown ── */}
        <div className="lc-panel lc-main">
          <span className="lc-edge" aria-hidden="true" />
          <div className="lc-donut">
            <div className="lc-donut-box">
              <Suspense fallback={null}><Donut3D easy={easy} medium={medium} hard={hard} /></Suspense>
              <div className="lc-donut-core">
                <span className="lc-total" data-count={total}>0</span>
                <span className="lc-total-lbl">Solved</span>
              </div>
            </div>
          </div>

          <div className="lc-break">
            <div className="lc-break-head"><span>Difficulty breakdown</span><span>{total} / 3000+</span></div>
            {LEVELS.map((l) => (
              <div key={l.key} className="lc-row" style={{ '--c': l.color, '--g': l.glow }}>
                <span className="lc-row-name">{l.label}</span>
                <span className="lc-track"><i data-fill style={{ width: `${pct(values[l.key])}%` }} /></span>
                <span className="lc-row-val">{values[l.key]}</span>
              </div>
            ))}
            <div className="lc-insight"><span />{insight()}</div>
          </div>
        </div>

        {/* ── stat tiles ── */}
        <div className="lc-tiles">
          {LEVELS.map((l) => (
            <div key={l.key} className="lc-tile" style={{ '--c': l.color, '--g': l.glow }}>
              <span className="lc-tile-share">{pct(values[l.key]).toFixed(1)}%</span>
              <span className="lc-tile-num" data-count={values[l.key]}>0</span>
              <span className="lc-tile-lbl">{l.label}</span>
              <span className="lc-tile-bar"><i data-fill style={{ width: `${pct(values[l.key])}%` }} /></span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .lc { position:relative; overflow:hidden; background:var(--color-bg-sunken); color:var(--color-text-primary); padding:110px 24px 100px; }
        .lc-bg { position:absolute; inset:0; pointer-events:none; overflow:hidden;
          background:linear-gradient(var(--color-border) 1px, transparent 1px) 0 0/56px 56px, linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0/56px 56px;
          -webkit-mask:radial-gradient(ellipse 80% 70% at 50% 45%, #000, transparent 80%); mask:radial-gradient(ellipse 80% 70% at 50% 45%, #000, transparent 80%); }
        .lc-glow { position:absolute; border-radius:50%; filter:blur(60px); }
        .lc-glow-1 { width:520px; height:520px; left:-120px; top:-60px; background:radial-gradient(circle, var(--color-accent-muted), transparent 70%); }
        .lc-glow-2 { width:440px; height:440px; right:-100px; bottom:-60px; background:radial-gradient(circle, rgba(255,161,22,.12), transparent 70%); }

        .lc-head { position:relative; text-align:center; margin-bottom:56px; }
        .lc-eyebrow { display:inline-flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:11px; letter-spacing:.4em; text-transform:uppercase; color:var(--color-accent); margin:0 0 14px; }
        .lc-dot { width:5px; height:5px; border-radius:50%; background:var(--color-accent); box-shadow:0 0 8px var(--color-accent-glow); animation:lcPulse 2s ease-in-out infinite; }
        @keyframes lcPulse { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        .lc-title { margin:0 0 10px; font-family:var(--font-display); font-size:clamp(2.2rem,5.5vw,3.8rem); font-weight:900; letter-spacing:.06em;
          background:linear-gradient(110deg,var(--color-text-primary) 25%,var(--color-accent) 50%,var(--color-text-primary) 75%); background-size:250% 100%;
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:lcShine 6s linear infinite; }
        @keyframes lcShine { to { background-position:-250% 0; } }
        .lc-sub { margin:0; font-family:var(--font-mono); font-size:.7rem; letter-spacing:.28em; text-transform:uppercase; color:var(--color-text-muted); }
        .lc-ruler { display:flex; justify-content:center; align-items:center; gap:14px; margin-top:22px; }
        .lc-ruler i { width:100px; height:1px; background:linear-gradient(to right,var(--color-accent-border),transparent); }
        .lc-ruler i:last-child { background:linear-gradient(to left,var(--color-accent-border),transparent); }
        .lc-ruler b { width:8px; height:8px; background:var(--color-accent); transform:rotate(45deg); box-shadow:0 0 14px var(--color-accent-glow); }

        .lc-grid { position:relative; max-width:1120px; margin:0 auto; display:grid; grid-template-columns:330px 1fr; gap:26px; perspective:1400px; }
        .lc-tiles { grid-column:2; display:grid; grid-template-columns:repeat(3,1fr); gap:20px; perspective:1000px; }

        /* glass panels */
        .lc-panel { --rx:0deg; --ry:0deg; position:relative; border-radius:var(--radius-xl); padding:34px 30px; overflow:hidden;
          background:linear-gradient(150deg, var(--color-bg-elevated), var(--color-bg-sunken)); box-shadow:var(--shadow-lg);
          transform:rotateX(var(--rx)) rotateY(var(--ry)); transition:transform .25s ease-out, box-shadow .3s; }
        .lc-panel:hover { box-shadow:var(--shadow-lg), 0 0 46px var(--color-accent-muted); }
        .lc-edge { position:absolute; inset:0; border-radius:inherit; padding:1.5px; pointer-events:none;
          background:conic-gradient(from var(--lc-a,0deg), transparent 0 55%, var(--color-accent) 80%, var(--color-accent-light) 90%, transparent 100%);
          -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; animation:lcSweep 6s linear infinite; }
        @property --lc-a { syntax:'<angle>'; inherits:false; initial-value:0deg; }
        @keyframes lcSweep { to { --lc-a:360deg; } }

        /* profile */
        .lc-profile { grid-row:1 / span 2; display:flex; flex-direction:column; align-items:center; text-align:center; }
        .lc-avatar { position:relative; width:210px; height:210px; margin-bottom:22px; animation:lcFloat 6s ease-in-out infinite; }
        @keyframes lcFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        .lc-photo { position:absolute; inset:16px; border-radius:50%; overflow:hidden; background:var(--color-bg-elevated); box-shadow:0 0 0 3px var(--color-accent), 0 18px 40px rgba(0,0,0,.5), 0 0 40px var(--color-accent-muted); }
        .lc-photo img { width:100%; height:100%; object-fit:cover; display:block; }
        .lc-ring { position:absolute; inset:0; border-radius:50%; border:1px dashed var(--color-accent-border); animation:lcSpin 22s linear infinite; }
        .lc-ring-2 { inset:-14px; border-style:solid; border-color:var(--color-accent-faint); border-top-color:var(--color-accent); animation-duration:14s; animation-direction:reverse; }
        @keyframes lcSpin { to { transform:rotate(360deg); } }
        .lc-logo { position:absolute; right:2px; bottom:10px; width:50px; height:50px; border-radius:16px; display:flex; align-items:center; justify-content:center;
          background:var(--color-bg-elevated); border:1px solid rgba(255,161,22,.45); box-shadow:0 10px 24px rgba(0,0,0,.5), 0 0 22px rgba(255,161,22,.3); }
        .lc-name { margin:0; font-family:var(--font-display); font-size:1.5rem; font-weight:900; color:var(--color-text-primary); }
        .lc-handle { margin:4px 0 14px; font-family:var(--font-mono); font-size:.72rem; letter-spacing:.12em; color:var(--color-text-muted); }
        .lc-badge { display:inline-flex; align-items:center; gap:7px; font-family:var(--font-mono); font-size:.64rem; letter-spacing:.14em; text-transform:uppercase; color:#ffa116;
          padding:6px 14px; border-radius:var(--radius-full); background:rgba(255,161,22,.1); border:1px solid rgba(255,161,22,.35); }
        .lc-facts { list-style:none; margin:24px 0 24px; padding:20px 0 0; width:100%; display:grid; gap:12px; border-top:1px solid var(--color-border); }
        .lc-facts li { display:flex; align-items:center; gap:12px; font-family:var(--font-body); font-size:.88rem; color:var(--color-text-secondary); }
        .lc-facts svg { color:var(--color-accent); flex-shrink:0; }
        .lc-facts b { color:var(--color-text-primary); font-family:var(--font-display); }
        .lc-visit { margin-top:auto; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:14px; border-radius:14px; text-decoration:none;
          font-family:var(--font-mono); font-size:.72rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-on-light);
          background:linear-gradient(135deg,var(--color-accent),var(--color-accent-light)); box-shadow:var(--shadow-accent); transition:transform .25s, box-shadow .25s; }
        .lc-visit:hover { transform:translateY(-3px); box-shadow:var(--shadow-glow); }

        /* donut + breakdown */
        .lc-main { display:grid; grid-template-columns:minmax(220px, 280px) 1fr; gap:34px; align-items:center; }
        .lc-donut { display:flex; justify-content:center; }
        .lc-donut-box { position:relative; width:210px; height:210px; }
        .lc-donut-box > div:first-child { inset:-34px !important; }
        .lc-donut-core { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; }
        .lc-total { font-family:var(--font-display); font-weight:900; font-size:3rem; line-height:1; color:var(--color-text-primary); text-shadow:0 0 28px var(--color-accent-glow); }
        .lc-total-lbl { margin-top:6px; font-family:var(--font-mono); font-size:.62rem; letter-spacing:.3em; text-transform:uppercase; color:var(--color-accent); }
        .lc-break { min-width:0; }
        .lc-break-head { display:flex; justify-content:space-between; margin-bottom:16px; font-family:var(--font-mono); font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; color:var(--color-text-muted); }
        .lc-row { display:grid; grid-template-columns:70px 1fr 44px; align-items:center; gap:12px; margin-bottom:14px; }
        .lc-row-name { font-family:var(--font-mono); font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:var(--c); }
        .lc-row-val { text-align:right; font-family:var(--font-display); font-weight:800; font-size:.9rem; color:var(--color-text-primary); }
        .lc-track, .lc-tile-bar { position:relative; display:block; height:8px; border-radius:99px; background:rgba(255,255,255,.07); overflow:hidden; }
        .lc-track i, .lc-tile-bar i { display:block; height:100%; border-radius:99px; transform-origin:left; background:linear-gradient(90deg,var(--c),var(--g)); box-shadow:0 0 14px color-mix(in srgb, var(--c) 55%, transparent); }
        .lc-insight { margin-top:20px; display:flex; align-items:center; gap:10px; padding:11px 15px; border-radius:12px; font-family:var(--font-mono); font-size:.72rem; letter-spacing:.05em; color:var(--color-accent);
          background:var(--color-accent-subtle); border:1px solid var(--color-accent-border); }
        .lc-insight span { width:7px; height:7px; border-radius:50%; background:var(--color-accent); box-shadow:0 0 8px var(--color-accent); animation:lcPulse 1.8s ease-in-out infinite; }

        /* tiles */
        .lc-tile { --rx:0deg; --ry:0deg; position:relative; display:flex; flex-direction:column; align-items:center; padding:26px 18px 22px; border-radius:var(--radius-lg); text-align:center;
          background:linear-gradient(160deg, color-mix(in srgb, var(--c) 12%, var(--color-bg-elevated)), var(--color-bg-sunken)); border:1px solid color-mix(in srgb, var(--c) 32%, transparent);
          box-shadow:0 18px 36px rgba(0,0,0,.35); transform:rotateX(var(--rx)) rotateY(var(--ry)); transform-style:preserve-3d; transition:transform .25s ease-out, box-shadow .3s, border-color .3s; }
        .lc-tile:hover { border-color:var(--c); box-shadow:0 26px 50px rgba(0,0,0,.5), 0 0 40px color-mix(in srgb, var(--c) 30%, transparent); }
        .lc-tile-share { position:absolute; top:12px; right:14px; font-family:var(--font-mono); font-size:.6rem; letter-spacing:.1em; color:var(--c); transform:translateZ(20px); }
        .lc-tile-num { font-family:var(--font-display); font-weight:900; font-size:3rem; line-height:1; color:var(--c); text-shadow:0 0 26px color-mix(in srgb, var(--c) 60%, transparent), 0 3px 0 color-mix(in srgb, var(--c) 40%, #000); transform:translateZ(46px); }
        .lc-tile-lbl { margin:10px 0 16px; font-family:var(--font-mono); font-size:.66rem; letter-spacing:.3em; text-transform:uppercase; color:var(--color-text-secondary); transform:translateZ(24px); }
        .lc-tile-bar { width:100%; transform:translateZ(12px); }

        @media (max-width:980px) {
          .lc-grid { grid-template-columns:1fr; }
          .lc-tiles { grid-column:1; }
          .lc-profile { grid-row:auto; }
        }
        @media (max-width:720px) {
          .lc { padding:80px 16px 72px; }
          .lc-main { grid-template-columns:1fr; gap:26px; padding:28px 22px; }
          .lc-tiles { gap:10px; } .lc-tile { padding:20px 8px 16px; } .lc-tile-num { font-size:2rem; } .lc-tile-share { display:none; }
        }
        @media (prefers-reduced-motion:reduce) { .lc-title, .lc-dot, .lc-edge, .lc-avatar, .lc-ring, .lc-insight span { animation:none; } .lc-panel, .lc-tile { transition:none; } }
      `}</style>
    </section>
  );
};

export default LeetCodeSection;
