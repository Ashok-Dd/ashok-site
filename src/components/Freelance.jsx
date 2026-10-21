import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, ArrowRight, Lock, Bell, Clock } from 'lucide-react';
import { freelanceData, FREELANCE_PROJECTS } from '../../data';
import useTilt from '../hooks/useTilt';

gsap.registerPlugin(ScrollTrigger);

/* ───────────── 3D device mock-ups (pure CSS, theme-coloured) ───────────── */
const OpflowMock = () => (
  <div className="fr-device">
    <div className="fr-win">
      <div className="fr-win-bar"><i /><i /><i /><span>admin · queue</span></div>
      <div className="fr-win-body">
        <div className="fr-bars">{[46, 72, 38, 88, 60, 94, 52].map((h, i) => <b key={i} style={{ height: `${h}%` }} />)}</div>
        <div className="fr-lines"><i /><i style={{ width: '70%' }} /><i style={{ width: '85%' }} /></div>
      </div>
    </div>
    <div className="fr-phone">
      <div className="fr-phone-notch" />
      <div className="fr-phone-top"><span>OPflow</span><Bell size={12} /></div>
      <div className="fr-token"><small>NOW SERVING</small><b>#14</b></div>
      <div className="fr-doc"><i className="fr-av" /><div><u /><u style={{ width: '55%' }} /></div></div>
      {['09:30', '10:15', '11:00'].map((t) => (
        <div key={t} className="fr-row"><Clock size={11} /><span>{t}</span><em /></div>
      ))}
      <div className="fr-phone-nav"><i /><i className="on" /><i /><i /></div>
    </div>
  </div>
);

const CricketMock = () => (
  <div className="fr-device">
    {[-1, 0, 1].map((d) => (
      <div key={d} className={`fr-pcard fr-pcard-${d + 1}`}>
        <div className="fr-pcard-top"><b>{['82', '91', '77'][d + 1]}</b><small>OVR</small></div>
        <div className="fr-pcard-img"><i /></div>
        {['BAT', 'BOWL', 'FLD'].map((s, i) => (
          <div key={s} className="fr-stat"><small>{s}</small><span><em style={{ width: `${[88, 64, 76][(i + d + 1) % 3]}%` }} /></span></div>
        ))}
      </div>
    ))}
    <div className="fr-vs">VS</div>
  </div>
);

const ShieldMock = () => (
  <div className="fr-device">
    <div className="fr-shield"><Lock size={46} /></div>
    <div className="fr-classified"><span>CLASSIFIED</span><small>case file coming soon</small></div>
    <div className="fr-ring fr-ring-1" /><div className="fr-ring fr-ring-2" />
  </div>
);

const MOCKS = { opflow: OpflowMock, 'card-cricket': CricketMock, bsafe: ShieldMock };

/* ───────────── section ───────────── */
const Freelance = () => {
  const sectionRef = useRef(null);
  useTilt(sectionRef, '.fr-stage', 9);
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
      gsap.utils.toArray('.fr-case').forEach((row, i) => {
        const dir = i % 2 ? 1 : -1;
        gsap.from(row.querySelector('.fr-info'), { opacity: 0, x: 60 * dir, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%', once: true } });
        gsap.from(row.querySelector('.fr-stage'), { opacity: 0, x: -60 * dir, duration: 1.1, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: row, start: 'top 80%', once: true } });
      });
      gsap.to('.fr-orb', {
        yPercent: (i) => (i % 2 ? -40 : 40), ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
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
      <div className="fr-bg" aria-hidden="true">
        <span className="fr-orb fr-orb-1" />
        <span className="fr-orb fr-orb-2" />
        <span className="fr-grid-bg" />
      </div>

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

      <div className="fr-cases">
        {FREELANCE_PROJECTS.map((p, i) => {
          const Mock = MOCKS[p.id];
          const Icon = p.icon;
          return (
            <article key={p.id} className={`fr-case${i % 2 ? ' flip' : ''}`} style={{ '--fr-accent': p.accentColor }}>
              <div className="fr-info">
                <span className="fr-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="fr-title-row">
                  <span className="fr-icon"><Icon size={22} /></span>
                  <div>
                    <h3 className="fr-name">{p.title}</h3>
                    <p className="fr-short">{p.short}</p>
                  </div>
                </div>
                <p className="fr-desc">{p.description}</p>
                {p.tech.length > 0 && <div className="fr-tech">{p.tech.map((t) => <span key={t}>{t}</span>)}</div>}
                {p.parts.length > 0 && (
                  <div className="fr-parts">
                    {p.parts.map((part) => (
                      <div key={part.label} className="fr-part">
                        <span>{part.label}</span>
                        <span className="fr-links">
                          <a href={part.href} target="_blank" rel="noopener noreferrer" aria-label={`${part.label} source`}><Github size={14} /></a>
                          {part.live && <a href={part.live} target="_blank" rel="noopener noreferrer" aria-label={`${part.label} live`}><ExternalLink size={14} /></a>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="fr-stage" aria-hidden="true">
                <div className="fr-stage-glow" />
                <Mock />
              </div>
            </article>
          );
        })}
      </div>

      <div className="fr-cta-wrap">
        <button className="fr-cta" onClick={goContact}>
          <span>{freelanceData.cta.label}</span><ArrowRight size={15} />
          <i aria-hidden="true" />
        </button>
      </div>

      <style>{`
        .fr-section { position:relative; overflow:hidden; background:var(--color-bg-primary); color:var(--color-text-primary); padding:110px 24px 100px; }
        .fr-bg { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .fr-orb { position:absolute; border-radius:50%; filter:blur(36px); }
        .fr-orb-1 { width:460px; height:460px; right:-120px; top:6%; background:radial-gradient(circle, var(--color-accent-muted), transparent 68%); animation:frFloat 12s ease-in-out infinite; }
        .fr-orb-2 { width:380px; height:380px; left:-110px; bottom:8%; background:radial-gradient(circle, var(--color-accent-subtle), transparent 68%); animation:frFloat 15s ease-in-out infinite reverse; }
        .fr-grid-bg { position:absolute; inset:0; opacity:.5;
          background:linear-gradient(var(--color-border) 1px, transparent 1px) 0 0/56px 56px, linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0/56px 56px;
          -webkit-mask:radial-gradient(ellipse 70% 60% at 50% 40%, #000, transparent 75%); mask:radial-gradient(ellipse 70% 60% at 50% 40%, #000, transparent 75%); }
        @keyframes frFloat { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(-24px,22px) scale(1.06); } }

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

        /* case files */
        .fr-cases { position:relative; max-width:1120px; margin:0 auto; display:grid; gap:96px; }
        .fr-case { --fr-accent:var(--color-accent); position:relative; display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
        .fr-case.flip .fr-info { order:2; }
        .fr-info { position:relative; }
        .fr-num { position:absolute; left:-4px; top:-62px; font-family:var(--font-display); font-weight:900; font-size:6.5rem; line-height:1; color:color-mix(in srgb,var(--fr-accent) 11%,transparent); pointer-events:none; }
        .fr-title-row { display:flex; align-items:center; gap:16px; margin-bottom:18px; }
        .fr-icon { width:54px; height:54px; border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center; color:var(--fr-accent); flex-shrink:0;
          background:color-mix(in srgb,var(--fr-accent) 13%,transparent); border:1px solid color-mix(in srgb,var(--fr-accent) 34%,transparent); box-shadow:0 8px 24px color-mix(in srgb,var(--fr-accent) 24%,transparent); }
        .fr-name { margin:0; font-family:var(--font-display); font-size:clamp(1.5rem,3vw,2.1rem); font-weight:900; color:var(--color-text-primary); letter-spacing:.03em; }
        .fr-short { margin:4px 0 0; font-family:var(--font-mono); font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; color:var(--fr-accent); }
        .fr-desc { margin:0 0 18px; font-family:var(--font-body); font-size:.95rem; line-height:1.8; color:var(--color-text-secondary); }
        .fr-tech { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
        .fr-tech span { font-family:var(--font-mono); font-size:.62rem; letter-spacing:.1em; color:var(--color-text-secondary); background:var(--color-bg-glass); border:1px solid var(--color-border); border-radius:8px; padding:4px 11px; transition:all .25s; }
        .fr-tech span:hover { transform:translateY(-3px); color:var(--fr-accent); border-color:var(--fr-accent); }
        .fr-parts { display:grid; gap:2px; border-top:1px solid var(--color-border); padding-top:10px; max-width:420px; }
        .fr-part { display:flex; justify-content:space-between; align-items:center; padding:7px 0; font-family:var(--font-mono); font-size:.66rem; letter-spacing:.14em; text-transform:uppercase; color:var(--color-text-secondary); }
        .fr-links { display:inline-flex; gap:8px; }
        .fr-links a { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:9px; color:var(--color-text-secondary); border:1px solid var(--color-border-strong); transition:all .25s; }
        .fr-links a:hover { color:var(--fr-accent); border-color:var(--fr-accent); background:color-mix(in srgb,var(--fr-accent) 14%,transparent); transform:translateY(-2px); }

        /* device stage */
        .fr-stage { --rx:0deg; --ry:0deg; position:relative; height:430px; perspective:1300px; display:flex; align-items:center; justify-content:center; }
        .fr-stage-glow { position:absolute; width:78%; height:78%; border-radius:50%; background:radial-gradient(circle, color-mix(in srgb,var(--fr-accent) 28%,transparent), transparent 68%); filter:blur(10px); }
        .fr-device { position:relative; width:340px; height:400px; transform-style:preserve-3d; transform:rotateX(calc(var(--rx) + 8deg)) rotateY(calc(var(--ry) - 16deg)); transition:transform .3s ease-out; }
        .fr-case.flip .fr-device { transform:rotateX(calc(var(--rx) + 8deg)) rotateY(calc(var(--ry) + 16deg)); }

        /* OPflow */
        .fr-win { position:absolute; left:0; top:24px; width:290px; height:210px; border-radius:14px; border:1px solid color-mix(in srgb,var(--fr-accent) 40%,transparent);
          background:linear-gradient(160deg,var(--color-bg-elevated),var(--color-bg-sunken)); box-shadow:0 24px 50px rgba(0,0,0,.5); transform:translateZ(-30px); overflow:hidden; }
        .fr-win-bar { display:flex; align-items:center; gap:6px; padding:10px 12px; border-bottom:1px solid var(--color-border); }
        .fr-win-bar i { width:8px; height:8px; border-radius:50%; background:var(--color-border-strong); }
        .fr-win-bar span { margin-left:8px; font-family:var(--font-mono); font-size:.55rem; letter-spacing:.14em; color:var(--color-text-muted); text-transform:uppercase; }
        .fr-win-body { padding:14px; display:grid; gap:12px; }
        .fr-bars { display:flex; align-items:flex-end; gap:8px; height:84px; }
        .fr-bars b { flex:1; border-radius:4px 4px 0 0; background:linear-gradient(180deg,var(--fr-accent),color-mix(in srgb,var(--fr-accent) 25%,transparent)); }
        .fr-lines { display:grid; gap:7px; } .fr-lines i { height:7px; border-radius:4px; background:var(--color-border-strong); }
        .fr-phone { position:absolute; right:6px; top:0; width:176px; height:372px; border-radius:30px; padding:34px 14px 14px; display:grid; align-content:start; gap:10px;
          border:2px solid color-mix(in srgb,var(--fr-accent) 55%,transparent); background:linear-gradient(170deg,var(--color-bg-elevated),var(--color-bg-primary)); box-shadow:0 30px 70px rgba(0,0,0,.6), 0 0 40px color-mix(in srgb,var(--fr-accent) 25%,transparent); transform:translateZ(60px); }
        .fr-phone-notch { position:absolute; top:10px; left:50%; width:54px; height:12px; border-radius:8px; background:var(--color-bg-sunken); transform:translateX(-50%); }
        .fr-phone-top { display:flex; justify-content:space-between; align-items:center; font-family:var(--font-display); font-size:.8rem; font-weight:800; color:var(--color-text-primary); }
        .fr-phone-top svg { color:var(--fr-accent); }
        .fr-token { display:flex; flex-direction:column; align-items:center; padding:12px; border-radius:14px; background:color-mix(in srgb,var(--fr-accent) 16%,transparent); border:1px solid color-mix(in srgb,var(--fr-accent) 40%,transparent); }
        .fr-token small { font-family:var(--font-mono); font-size:.5rem; letter-spacing:.2em; color:var(--fr-accent); } .fr-token b { font-family:var(--font-display); font-size:1.7rem; color:var(--color-text-primary); }
        .fr-doc { display:flex; align-items:center; gap:10px; padding:8px; border-radius:12px; background:var(--color-bg-glass); border:1px solid var(--color-border); }
        .fr-av { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--fr-accent),var(--color-bg-elevated)); flex-shrink:0; }
        .fr-doc div { flex:1; display:grid; gap:5px; } .fr-doc u { display:block; height:6px; border-radius:3px; background:var(--color-border-strong); text-decoration:none; }
        .fr-row { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; background:var(--color-bg-glass); border:1px solid var(--color-border); font-family:var(--font-mono); font-size:.62rem; color:var(--color-text-secondary); }
        .fr-row svg { color:var(--fr-accent); } .fr-row em { margin-left:auto; width:34px; height:6px; border-radius:3px; background:color-mix(in srgb,var(--fr-accent) 50%,transparent); }
        .fr-phone-nav { position:absolute; left:0; right:0; bottom:12px; display:flex; justify-content:center; gap:14px; }
        .fr-phone-nav i { width:6px; height:6px; border-radius:50%; background:var(--color-border-strong); } .fr-phone-nav i.on { background:var(--fr-accent); box-shadow:0 0 8px var(--fr-accent); }

        /* Card Cricket */
        .fr-pcard { position:absolute; left:50%; top:50%; width:170px; height:240px; margin:-120px 0 0 -85px; border-radius:16px; padding:12px; display:grid; align-content:start; gap:8px;
          background:linear-gradient(160deg,var(--color-bg-elevated),var(--color-bg-sunken)); border:2px solid color-mix(in srgb,var(--fr-accent) 60%,transparent);
          box-shadow:0 24px 50px rgba(0,0,0,.55), 0 0 30px color-mix(in srgb,var(--fr-accent) 20%,transparent); transition:transform .4s; }
        .fr-pcard-0 { transform:translate3d(-96px,22px,0) rotateZ(-14deg); }
        .fr-pcard-1 { transform:translate3d(0,-14px,70px); }
        .fr-pcard-2 { transform:translate3d(96px,22px,0) rotateZ(14deg); }
        .fr-stage:hover .fr-pcard-0 { transform:translate3d(-118px,30px,0) rotateZ(-18deg); } .fr-stage:hover .fr-pcard-2 { transform:translate3d(118px,30px,0) rotateZ(18deg); }
        .fr-pcard-top { display:flex; justify-content:space-between; align-items:baseline; } .fr-pcard-top b { font-family:var(--font-display); font-size:1.5rem; color:var(--fr-accent); }
        .fr-pcard-top small { font-family:var(--font-mono); font-size:.5rem; letter-spacing:.2em; color:var(--color-text-muted); }
        .fr-pcard-img { height:78px; border-radius:10px; display:flex; align-items:flex-end; justify-content:center; background:linear-gradient(160deg,color-mix(in srgb,var(--fr-accent) 35%,transparent),var(--color-bg-sunken)); overflow:hidden; }
        .fr-pcard-img i { width:46px; height:58px; border-radius:23px 23px 0 0; background:color-mix(in srgb,var(--fr-accent) 60%,#000); }
        .fr-stat { display:grid; grid-template-columns:34px 1fr; align-items:center; gap:8px; } .fr-stat small { font-family:var(--font-mono); font-size:.5rem; letter-spacing:.14em; color:var(--color-text-muted); }
        .fr-stat span { height:6px; border-radius:3px; background:var(--color-border-strong); overflow:hidden; } .fr-stat em { display:block; height:100%; border-radius:3px; background:var(--fr-accent); }
        .fr-vs { position:absolute; left:50%; top:50%; width:58px; height:58px; margin:-29px 0 0 -29px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:900; color:var(--color-bg-primary);
          background:linear-gradient(135deg,var(--fr-accent),var(--color-text-primary)); transform:translateZ(130px); box-shadow:0 0 30px color-mix(in srgb,var(--fr-accent) 60%,transparent); }

        /* BSafe */
        .fr-shield { position:absolute; left:50%; top:50%; width:190px; height:230px; margin:-125px 0 0 -95px; display:flex; align-items:center; justify-content:center; color:var(--color-bg-primary);
          clip-path:polygon(50% 0, 100% 16%, 100% 58%, 50% 100%, 0 58%, 0 16%); background:linear-gradient(160deg,var(--fr-accent),color-mix(in srgb,var(--fr-accent) 30%,#000)); transform:translateZ(70px); }
        .fr-classified { position:absolute; left:50%; bottom:28px; transform:translate(-50%,0) translateZ(90px); display:grid; justify-items:center; gap:4px; }
        .fr-classified span { padding:6px 16px; border:2px solid var(--fr-accent); color:var(--fr-accent); font-family:var(--font-display); font-weight:900; letter-spacing:.3em; font-size:.8rem; transform:rotate(-6deg); }
        .fr-classified small { font-family:var(--font-mono); font-size:.56rem; letter-spacing:.2em; text-transform:uppercase; color:var(--color-text-muted); }
        .fr-ring { position:absolute; left:50%; top:50%; border-radius:50%; border:1px dashed color-mix(in srgb,var(--fr-accent) 45%,transparent); transform:translate(-50%,-50%); }
        .fr-ring-1 { width:270px; height:270px; animation:frSpin 22s linear infinite; } .fr-ring-2 { width:330px; height:330px; animation:frSpin 30s linear infinite reverse; }
        @keyframes frSpin { to { transform:translate(-50%,-50%) rotate(360deg); } }

        .fr-cta-wrap { position:relative; display:flex; justify-content:center; margin-top:96px; }
        .fr-cta { position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:10px; cursor:pointer; padding:16px 34px; border:0; border-radius:14px;
          font-family:var(--font-mono); font-size:.74rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-on-light);
          background:linear-gradient(135deg,var(--color-accent),var(--color-accent-light)); box-shadow:var(--shadow-accent); transition:transform .25s, box-shadow .25s; }
        .fr-cta:hover { transform:translateY(-3px) scale(1.02); box-shadow:var(--shadow-glow); }
        .fr-cta svg { transition:transform .25s; } .fr-cta:hover svg { transform:translateX(5px); }
        .fr-cta i { position:absolute; top:0; bottom:0; width:60px; left:-80px; background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent); transform:skewX(-20deg); animation:frGleam 3.6s ease-in-out infinite; }
        @keyframes frGleam { 0%,55% { left:-80px; } 100% { left:120%; } }

        @media (max-width:980px) {
          .fr-case { grid-template-columns:1fr; gap:34px; } .fr-case.flip .fr-info { order:0; } .fr-cases { gap:80px; }
          .fr-steps { grid-template-columns:1fr 1fr; } .fr-flow { display:none; }
          .fr-num { top:-54px; }
        }
        @media (max-width:560px) {
          .fr-section { padding:80px 16px 72px; } .fr-ticker { margin-inline:-16px; } .fr-steps { grid-template-columns:1fr; }
          .fr-stage { height:380px; } .fr-device { scale:.8; }
        }
        @media (prefers-reduced-motion:reduce) {
          .fr-orb, .fr-title, .fr-track, .fr-dot, .fr-live, .fr-cta i, .fr-ring { animation:none; }
          .fr-device, .fr-step, .fr-pcard { transition:none; }
        }
      `}</style>
    </section>
  );
};

export default Freelance;
