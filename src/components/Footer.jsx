import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Copy, Check } from 'lucide-react';
import { SOCIALS, footerData } from '../../data';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  ['Home', 'home'], ['Skills', 'skills'], ['Experience', 'experience'], ['Projects', 'projects'],
  ['Freelance', 'freelance'], ['Arcade', 'arcade'], ['LeetCode', 'leetcode'], ['Contact', 'contact'],
];
const MARQUEE = ['GTM Engineer @ CoComply', 'Freelance full-stack', 'React · Three.js · GSAP', 'Flutter & React Native', 'Open to collabs', 'Shipping from India'];
const WORD = 'ASHOK'.split('');
const RING = 2 * Math.PI * 21;

const fmtTime = () => {
  try { return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

const go = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (id === 'home' ? 0 : 64), behavior: 'smooth' });
};

const Footer = () => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState(fmtTime);
  const [progress, setProgress] = useState(0);
  const markRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(fmtTime()), 20000);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearInterval(t); window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(footerData.contact.email); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = footerData.contact.email; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  /* the giant wordmark leans toward the cursor and lights up under it */
  const onMark = (e) => {
    const el = markRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--ry', `${((x - 0.5) * 14).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - y) * 10).toFixed(2)}deg`);
  };
  const offMark = () => {
    const el = markRef.current;
    if (!el) return;
    el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--mx', '-40%');
  };

  const items = [...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <footer className="fx">
      {/* ── call to action ── */}
      <div className="fx-cta">
        <p className="fx-kicker"><span />Have a project in mind?</p>
        <h3 className="fx-big">Let&apos;s make it <em>real.</em></h3>
        <div className="fx-actions">
          <button className="fx-mail" onClick={copyEmail} aria-label="Copy email address">
            <span>{footerData.contact.email}</span>
            <i>{copied ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}</i>
          </button>
          <button className="fx-start" onClick={() => go('contact')}>Start a project<ArrowUpRight size={16} /></button>
        </div>
      </div>

      {/* ── marquee ── */}
      <div className="fx-marquee" aria-hidden="true">
        <div className="fx-track">
          {items.map((t, i) => (<span key={i}><b />{t}</span>))}
        </div>
      </div>

      {/* ── columns ── */}
      <div className="fx-cols">
        <div className="fx-brand">
          <div className="fx-logo">ASH<span>OK</span></div>
          <p>{footerData.tagline}</p>
          <p className="fx-dim">{footerData.taglineSub}</p>
          <div className="fx-clock"><span className="fx-live" />India · {time} IST</div>
        </div>

        <div>
          <h4>Navigate</h4>
          <nav className="fx-nav">
            {NAV.map(([label, id]) => (<button key={id} onClick={() => go(id)}>{label}</button>))}
          </nav>
        </div>

        <div>
          <h4>Elsewhere</h4>
          <div className="fx-soc">
            {SOCIALS.map(({ id, label, sub, href, Icon }) => (
              <a key={id} href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer">
                <Icon size={15} /><span>{label}</span><small>{sub}</small><ArrowUpRight size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── giant wordmark ── */}
      <div ref={markRef} className="fx-mark" onPointerMove={onMark} onPointerLeave={offMark} aria-hidden="true">
        {WORD.map((ch, i) => (<span key={i} style={{ '--i': i }}>{ch}</span>))}
      </div>

      {/* ── bottom bar ── */}
      <div className="fx-bottom">
        <span>© {new Date().getFullYear()} {footerData.copyright}</span>
        <span className="fx-built">{footerData.builtWith} · theme: {theme}</span>
        <button className="fx-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <svg viewBox="0 0 50 50" width="50" height="50" aria-hidden="true">
            <circle cx="25" cy="25" r="21" className="fx-ring-bg" />
            <circle cx="25" cy="25" r="21" className="fx-ring" strokeDasharray={RING} strokeDashoffset={RING * (1 - progress)} />
          </svg>
          <ArrowUp size={16} />
        </button>
      </div>

      <style>{`
        .fx { position:relative; overflow:hidden; background:var(--color-bg-primary); color:var(--color-text-primary); border-top:1px solid var(--color-border); }
        .fx::before { content:''; position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 60% 50% at 50% 0%, var(--color-accent-muted), transparent 70%), radial-gradient(ellipse 50% 40% at 0% 100%, var(--color-accent-subtle), transparent 70%); }

        .fx-cta { position:relative; max-width:1160px; margin:0 auto; padding:96px 24px 64px; text-align:center; }
        .fx-kicker { display:inline-flex; align-items:center; gap:12px; margin:0 0 18px; font-family:var(--font-mono); font-size:.68rem; letter-spacing:.38em; text-transform:uppercase; color:var(--color-accent); }
        .fx-kicker span { width:28px; height:1px; background:var(--color-accent); }
        .fx-big { margin:0 0 34px; font-family:var(--font-display); font-weight:900; font-size:clamp(2.4rem,7vw,5.4rem); line-height:1.05; letter-spacing:.02em; }
        .fx-big em { font-style:normal; background:linear-gradient(110deg,var(--color-accent) 20%,var(--color-accent-light) 50%,var(--color-accent) 80%); background-size:220% 100%;
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:fxShine 6s linear infinite; }
        @keyframes fxShine { to { background-position:-220% 0; } }
        .fx-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .fx-mail { display:inline-flex; align-items:center; gap:16px; cursor:pointer; padding:8px 8px 8px 22px; border-radius:var(--radius-full); border:1px solid var(--color-accent-border);
          background:var(--color-accent-subtle); color:var(--color-text-primary); font-family:var(--font-mono); font-size:.86rem; transition:all .25s; }
        .fx-mail i { display:inline-flex; align-items:center; gap:6px; font-style:normal; padding:9px 16px; border-radius:var(--radius-full); background:var(--color-accent); color:var(--color-bg-primary); font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; min-width:96px; justify-content:center; }
        .fx-mail:hover { border-color:var(--color-accent); box-shadow:var(--shadow-accent); transform:translateY(-3px); }
        .fx-start { display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:0 26px; height:54px; border-radius:var(--radius-full); border:1px solid var(--color-border-strong); background:transparent;
          color:var(--color-text-primary); font-family:var(--font-mono); font-size:.74rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; transition:all .25s; }
        .fx-start:hover { border-color:var(--color-accent); color:var(--color-accent); transform:translateY(-3px); }

        .fx-marquee { position:relative; overflow:hidden; border-block:1px solid var(--color-border); background:var(--color-bg-glass); padding:16px 0;
          -webkit-mask:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent); mask:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent); }
        .fx-track { display:flex; width:max-content; gap:46px; animation:fxTick 46s linear infinite; }
        .fx-track span { display:inline-flex; align-items:center; gap:14px; white-space:nowrap; font-family:var(--font-mono); font-size:.74rem; letter-spacing:.24em; text-transform:uppercase; color:var(--color-text-secondary); }
        .fx-track b { width:7px; height:7px; background:var(--color-accent); transform:rotate(45deg); box-shadow:0 0 10px var(--color-accent-glow); }
        @keyframes fxTick { to { transform:translateX(-33.333%); } }

        .fx-cols { position:relative; max-width:1160px; margin:0 auto; padding:64px 24px 28px; display:grid; grid-template-columns:1.3fr .8fr 1.4fr; gap:48px; }
        .fx-cols h4 { margin:0 0 18px; font-family:var(--font-mono); font-size:.64rem; letter-spacing:.34em; text-transform:uppercase; color:var(--color-accent); }
        .fx-logo { font-family:var(--font-display); font-weight:900; font-size:1.7rem; letter-spacing:.14em; color:var(--color-text-muted); margin-bottom:14px; }
        .fx-logo span { color:var(--color-accent); }
        .fx-brand p { margin:0 0 6px; font-family:var(--font-body); font-size:.92rem; color:var(--color-text-secondary); line-height:1.6; }
        .fx-brand .fx-dim { color:var(--color-text-muted); font-size:.84rem; }
        .fx-clock { display:inline-flex; align-items:center; gap:10px; margin-top:16px; padding:7px 14px; border-radius:var(--radius-full); border:1px solid var(--color-border-strong);
          font-family:var(--font-mono); font-size:.66rem; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-secondary); }
        .fx-live { width:7px; height:7px; border-radius:50%; background:var(--color-success); animation:fxLive 1.8s ease-out infinite; }
        @keyframes fxLive { 0% { box-shadow:0 0 0 0 color-mix(in srgb,var(--color-success) 60%,transparent); } 100% { box-shadow:0 0 0 10px transparent; } }
        .fx-nav { display:grid; grid-template-columns:1fr 1fr; gap:4px 18px; }
        .fx-nav button { text-align:left; cursor:pointer; background:none; border:0; padding:7px 0; font-family:var(--font-body); font-size:.92rem; color:var(--color-text-secondary); position:relative; transition:color .2s, transform .2s; }
        .fx-nav button::before { content:''; display:inline-block; width:0; height:1px; background:var(--color-accent); vertical-align:middle; margin-right:0; transition:width .25s, margin-right .25s; }
        .fx-nav button:hover { color:var(--color-text-primary); }
        .fx-nav button:hover::before { width:14px; margin-right:8px; }
        .fx-soc { display:grid; gap:6px; }
        .fx-soc a { display:grid; grid-template-columns:18px auto 1fr 14px; align-items:center; gap:12px; padding:10px 14px; border-radius:var(--radius-md); border:1px solid transparent; text-decoration:none; color:var(--color-text-secondary); transition:all .25s; }
        .fx-soc a span { font-family:var(--font-body); font-size:.9rem; font-weight:600; color:var(--color-text-primary); }
        .fx-soc a small { font-family:var(--font-mono); font-size:.64rem; letter-spacing:.06em; color:var(--color-text-muted); text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .fx-soc a svg:first-child { color:var(--color-accent); } .fx-soc a svg:last-child { opacity:0; transform:translate(-4px,4px); transition:all .25s; color:var(--color-accent); }
        .fx-soc a:hover { border-color:var(--color-accent-border); background:var(--color-accent-subtle); transform:translateX(4px); }
        .fx-soc a:hover svg:last-child { opacity:1; transform:none; }

        /* giant interactive wordmark */
        .fx-mark { --mx:-40%; --rx:0deg; --ry:0deg; position:relative; display:flex; justify-content:center; margin:12px auto 0; height:clamp(90px, 21vw, 300px); overflow:hidden; perspective:900px;
          font-family:var(--font-display); font-weight:900; font-size:clamp(5rem, 24vw, 22rem); line-height:.8; letter-spacing:-.02em; user-select:none; }
        .fx-mark span { display:inline-block; transform:rotateX(var(--rx)) rotateY(var(--ry)) translateY(calc(var(--i) * 0px)); transition:transform .3s ease-out, color .3s;
          color:transparent; -webkit-text-stroke:1.5px var(--color-accent-border);
          background:radial-gradient(circle 190px at var(--mx) 40%, var(--color-accent) 0%, transparent 70%); -webkit-background-clip:text; background-clip:text; }
        .fx-mark span:hover { -webkit-text-stroke-color:var(--color-accent); transform:rotateX(var(--rx)) rotateY(var(--ry)) translateY(-14px); }

        .fx-bottom { position:relative; max-width:1160px; margin:0 auto; padding:18px 24px 26px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
          border-top:1px solid var(--color-border); font-family:var(--font-mono); font-size:.66rem; letter-spacing:.14em; text-transform:uppercase; color:var(--color-text-muted); }
        .fx-built { flex:1; text-align:center; }
        .fx-top { position:relative; width:50px; height:50px; cursor:pointer; border:0; background:var(--color-bg-glass); border-radius:50%; color:var(--color-accent); display:flex; align-items:center; justify-content:center; transition:transform .25s, box-shadow .25s; }
        .fx-top svg:first-child { position:absolute; inset:0; transform:rotate(-90deg); }
        .fx-ring-bg { fill:none; stroke:var(--color-border-strong); stroke-width:2; }
        .fx-ring { fill:none; stroke:var(--color-accent); stroke-width:2.5; stroke-linecap:round; transition:stroke-dashoffset .15s linear; filter:drop-shadow(0 0 4px var(--color-accent-glow)); }
        .fx-top:hover { transform:translateY(-4px); box-shadow:var(--shadow-accent); }

        @media (max-width:900px) { .fx-cols { grid-template-columns:1fr 1fr; } .fx-brand { grid-column:1 / -1; } }
        @media (max-width:560px) {
          .fx-cta { padding:72px 16px 48px; } .fx-cols { grid-template-columns:1fr; gap:36px; padding:48px 16px 20px; }
          .fx-mail { font-size:.74rem; padding-left:16px; } .fx-built { order:3; flex-basis:100%; text-align:left; }
          .fx-bottom { padding:16px 16px 22px; }
        }
        @media (prefers-reduced-motion:reduce) { .fx-track, .fx-big em, .fx-live { animation:none; } .fx-mark span { transition:none; } }
      `}</style>
    </footer>
  );
};

export default Footer;
