import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { ExternalLink, Github, Code2, Laptop, Wrench, Star, X, ArrowRight, Zap, Globe, Shield, Lock, ChevronUp, Terminal, Database, Layers } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS } from '../../data';
const ProjectGate3D = lazy(() => import('./ProjectGate3D'));
const FloatingProjectCard = lazy(() => import('./FloatingProjectCard'));
const ProjectSpace3D = lazy(() => import('./ProjectSpace3D'));
const ProjectDetails = lazy(() => import('./ProjectDetails'));
import Boundary from '../three/Boundary';
import { normalizeProject } from '../utils/projects';
import { hasWebGL } from '../three/webgl';


gsap.registerPlugin(ScrollTrigger);



/* ─── MAIN COMPONENT ────────────────────────────────────── */
const gateHeight = () => Math.round(Math.min(940, Math.max(600, window.innerHeight * 0.94)));

const Projects = ({ onOpenChange }) => {
  const [webgl] = useState(() => hasWebGL());
  // phase: 'gate' | 'transitioning' | 'cards'
  const [phase, setPhase] = useState(() => (hasWebGL() ? 'gate' : 'cards'));
  const [opened, setOpened] = useState(() => !hasWebGL());   // true from the moment the key turns until the door is sealed again
  const [activeProject, setActive] = useState(null);
  const cards = useMemo(() => PROJECTS.map(normalizeProject), []);
  const [focus, setFocus] = useState(0);
  const [detailsUsed, setDetailsUsed] = useState(false);
  const openProject = (c) => { setDetailsUsed(true); setActive(c); };

  const stageRef     = useRef(null);
  const layerRef     = useRef(null);   // the 3D door layer
  const gateRef      = useRef(null);
  const contentRef   = useRef(null);   // everything hidden behind the door: header + cards + button
  const headerRef    = useRef(null);
  const cardsGridRef = useRef(null);
  const particlesRef = useRef(null);
  const hideRef      = useRef(null);

  /* the closed stage is a full-height door; keep it that way across resizes */
  useEffect(() => {
    const stage = stageRef.current;
    if (!webgl) { stage.classList.add('open'); stage.style.height = 'auto'; return undefined; }
    stage.style.height = `${gateHeight()}px`;
    stage.style.setProperty('--gate-h', `${gateHeight()}px`);
    const onResize = () => {
      stage.style.setProperty('--gate-h', `${gateHeight()}px`);
      if (!stage.classList.contains('open') && !stage.dataset.busy) stage.style.height = `${gateHeight()}px`;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [webgl]);

  /* sparks from the lock */
  const spawnBurst = useCallback(() => {
    const cont = particlesRef.current;
    const layer = layerRef.current;
    if (!cont || !layer) return;
    const cBox = layer.getBoundingClientRect();
    const pBox = cont.getBoundingClientRect();
    const cx = cBox.left + cBox.width / 2 - pBox.left;
    const cy = cBox.top + cBox.height * 0.54 - pBox.top;
    const cs = getComputedStyle(document.documentElement);
    const colors = [cs.getPropertyValue('--color-accent').trim(), cs.getPropertyValue('--color-accent-light').trim(), cs.getPropertyValue('--color-accent-dark').trim(), 'rgba(255,255,255,0.9)'];
    for (let i = 0; i < 52; i++) {
      const p = document.createElement('div');
      const sz = 3 + Math.random() * 8;
      const ang = (Math.PI * 2 * i) / 52 + (Math.random() - 0.5) * 0.5;
      const dist = 90 + Math.random() * 220;
      const color = colors[i % colors.length];
      p.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:${Math.random() > 0.55 ? '2px' : '50%'};background:${color};box-shadow:0 0 8px ${color};pointer-events:none;left:${cx}px;top:${cy}px;`;
      cont.appendChild(p);
      gsap.fromTo(p,
        { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0 },
        { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist + 30, opacity: 0, scale: 0, rotation: Math.random() * 360, duration: 0.8 + Math.random() * 0.6, ease: 'power2.out', onComplete: () => p.remove() });
    }
  }, []);

  /* the lock is gone and the doors start sliding → the whole section comes out of the dark behind them */
  const revealContent = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    content.style.visibility = 'visible';
    const stage = stageRef.current;
    if (stage && !stage.classList.contains('open')) gsap.to(stage, { height: Math.max(stage.offsetHeight, content.scrollHeight + 40), duration: 1.4, ease: 'power2.inOut' });
    gsap.fromTo(headerRef.current, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power3.out' });
    gsap.fromTo(cardsGridRef.current,
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: 1.1, delay: 0.4, ease: 'power3.out', clearProps: 'opacity,transform' });
    gsap.fromTo(hideRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, delay: 1.5, ease: 'power2.out' });
  }, []);

  /* doors fully apart → let the section grow to show every project */
  const handleOpened = useCallback(() => {
    const stage = stageRef.current;
    stage.classList.add('open');
    stage.style.height = 'auto';
    if (layerRef.current) layerRef.current.style.display = 'none';
    setPhase('cards');
  }, []);

  const handleUnlock = useCallback(() => {
    if (phase === 'gate') gateRef.current?.unlock();
  }, [phase]);

  /* seal the door again: collapse back to the door height while the doors slide shut */
  const handleHide = useCallback(() => {
    if (phase !== 'cards') return;
    setPhase('transitioning');
    setOpened(false);
    const stage = stageRef.current;
    const layer = layerRef.current;
    const target = gateHeight();
    const h0 = stage.offsetHeight;
    stage.dataset.busy = '1';
    window.scrollTo({ top: stage.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
    stage.classList.remove('open');
    stage.style.height = `${h0}px`;
    layer.style.display = 'block';
    gsap.to(hideRef.current, { opacity: 0, duration: 0.2 });
    const collapse = new Promise((res) => gsap.to(stage, { height: target, duration: 0.9, ease: 'power2.inOut', onComplete: res }));
    Promise.all([collapse, gateRef.current?.close()]).then(() => {
      gsap.set(cardsGridRef.current, { opacity: 0 });
      gsap.set(headerRef.current, { opacity: 0 });
      contentRef.current.style.visibility = 'hidden';
      stage.style.height = `${target}px`;
      delete stage.dataset.busy;
      setPhase('gate');
    });
  }, [phase]);

  /* tell the page when the door is open – the sections below are only loaded then */
  useEffect(() => { onOpenChange?.(!webgl || phase === 'cards'); }, [phase, webgl, onOpenChange]);

  return (
    <>
      <section id="projects" className={`proj-section-enhanced${opened ? ' is-open' : ''}`}>
        <div className="proj-bg-enhanced">
          <div className="bg-grid-e" />
          <div className="bg-blob-1" />
          <div className="bg-blob-2" />
          <div className="bg-scan-lines" />
          <span className="bg-glyph bg-g1">{'</>'}</span>
          <span className="bg-glyph bg-g2">{'{ }'}</span>
          <span className="bg-glyph bg-g3">{'[ ]'}</span>
        </div>

        <div ref={particlesRef} className="particles-layer-e" />

        {/* ─── STAGE: title + projects wait behind the door ─── */}
        <div ref={stageRef} className="gate-stage">
          <div className="gate-room" aria-hidden="true" />

          <div ref={contentRef} className="gate-content" style={{ visibility: webgl ? 'hidden' : 'visible' }}>
            <div ref={headerRef} className="proj-header-enhanced" style={{ opacity: webgl ? 0 : 1 }}>
              <p className="proj-eyebrow-e">
                <span className="eyebrow-dot-e" />
                <span>What I've Built</span>
                <span className="eyebrow-dot-e" />
              </p>
              <h2 className="proj-title-e">My Projects</h2>
              <p className="proj-sub-e">Click any card to explore the full details.</p>
              <div className="proj-divider-e">
                <div className="div-line-e" />
                <div className="div-gem-e" />
                <div className="div-line-e div-line-r-e" />
              </div>
            </div>

            <div ref={cardsGridRef} className="cards-area-e">
              {(() => {
                const grid = (
                  <div className="fp-grid">
                    <Suspense fallback={null}>
                      {cards.map((p, i) => <FloatingProjectCard key={p.id} project={p} index={i} onOpen={openProject} />)}
                    </Suspense>
                  </div>
                );
                return webgl ? (
                  <Boundary fallback={grid}>
                    <Suspense fallback={<div className="ps-wrap" />}>
                    <ProjectSpace3D projects={cards} focus={focus} onFocus={setFocus} onOpen={openProject} layout="ring" label="Project orbit" paused={!opened} />
                    </Suspense>
                  </Boundary>
                ) : grid;
              })()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36, paddingBottom: 24 }}>
              <button ref={hideRef} onClick={handleHide} className="hide-btn-e" style={{ opacity: webgl ? 0 : 1 }}>
                <ChevronUp size={14} />
                <span>Seal the door</span>
                <div className="hide-btn-shine" />
              </button>
            </div>
          </div>

          {webgl && (
            <div ref={layerRef} className="gate-layer">
              <Suspense fallback={null}>
                <ProjectGate3D
                  ref={gateRef}
                  onBurst={spawnBurst}
                  onStart={() => { setPhase('transitioning'); setOpened(true); }}
                  onDoorsStart={revealContent}
                  onOpened={handleOpened}
                />
              </Suspense>
              <div className="gate-foot" style={{ opacity: phase === 'gate' ? 1 : 0, pointerEvents: phase === 'gate' ? 'auto' : 'none' }}>
                <div className="drag-hint-e" style={{ opacity: 0.9 }}>
                  <div className="hint-arr-wrap"><ArrowRight size={12} /></div>
                  <span>drag the access key → lock</span>
                </div>
                <button className="gate-skip" onClick={handleUnlock}>
                  <Lock size={12} /> or just open the door
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {detailsUsed && (
        <Suspense fallback={null}>
          <ProjectDetails project={activeProject} onClose={() => setActive(null)} />
        </Suspense>
      )}

      <style>{`

        @keyframes chestScan {
          0%   { transform: translateY(0);    opacity: 0.2; }
          50%  {                              opacity: 0.38; }
          100% { transform: translateY(140px); opacity: 0; }
        }
        @keyframes float-blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(20px,-14px) scale(1.03); }
          66%     { transform: translate(-10px,9px)  scale(0.98); }
        }
        @keyframes glyph-drift {
          0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.04; }
          50%     { transform: translateY(-16px) rotate(3deg); opacity: 0.07; }
        }
        @keyframes dot-pulse {
          0%,100% { box-shadow: 0 0 6px var(--color-accent); opacity: 1; }
          50%     { box-shadow: 0 0 14px var(--color-accent), 0 0 28px var(--color-accent-glow); opacity: 0.7; }
        }
        @keyframes hint-slide {
          0%,100% { transform: translateX(0); }
          50%     { transform: translateX(6px); }
        }
        @keyframes near-pulse {
          0%,100% { transform: scale(1);    opacity: 0.55; }
          50%     { transform: scale(1.16); opacity: 0.88; }
        }

        /* ── SECTION ── */
        .proj-section-enhanced {
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          position: relative;
          overflow: hidden;
          /* NO min-height — section shrinks to content */
          padding: 96px 0 80px;
        }

        .proj-section-enhanced.cards-visible {
          padding-top: 64px;
        }

        /* ── BG ── */
        .proj-bg-enhanced { position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden; }
        .bg-grid-e {
          position:absolute;inset:0;
          background-image: linear-gradient(var(--color-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .bg-blob-1 { position:absolute;width:580px;height:580px;top:-140px;right:-110px;border-radius:50%;background:radial-gradient(circle,var(--color-accent-muted) 0%,transparent 70%);animation:float-blob 11s ease-in-out infinite; }
        .bg-blob-2 { position:absolute;width:460px;height:460px;bottom:-90px;left:-75px;border-radius:50%;background:radial-gradient(circle,var(--color-accent-muted) 0%,transparent 70%);animation:float-blob 15s ease-in-out infinite 5s; }
        .bg-scan-lines { position:absolute;inset:0;background:repeating-linear-gradient(0deg, transparent, transparent 3px, var(--color-border) 3px, var(--color-border) 4px);pointer-events:none; }
        .bg-glyph { position:absolute;font-family:'Share Tech Mono',monospace;color:var(--color-accent);font-size:5.5rem;user-select:none;animation:glyph-drift 8s ease-in-out infinite; }
        .bg-g1 { top:10%;left:1.5%;animation-delay:0s; }
        .bg-g2 { bottom:10%;right:2%;animation-delay:3.5s; }
        .bg-g3 { top:48%;left:48%;font-size:3rem;animation-delay:6s; }

        /* ── HEADER ── */
        .proj-header-enhanced { text-align:center;margin-bottom:40px;position:relative;z-index:2;padding:0 24px; }
        .proj-eyebrow-e { display:inline-flex;align-items:center;gap:12px;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:var(--color-accent);margin-bottom:14px; }
        .eyebrow-dot-e  { width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:dot-pulse 2s infinite; }
        .proj-title-e   { font-family:'Orbitron',sans-serif;font-size:clamp(2.2rem,5.5vw,3.8rem);font-weight:900;letter-spacing:0.06em;background:linear-gradient(135deg,var(--color-text-primary) 30%,var(--color-accent) 70%,var(--color-accent-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px; }
        .proj-sub-e     { font-family:'Inter',sans-serif;font-size:0.9rem;color:var(--color-text-muted);max-width:400px;margin:0 auto; }
        .proj-divider-e { display:flex;align-items:center;justify-content:center;gap:14px;margin-top:24px; }
        .div-line-e     { width:100px;height:1px;background:linear-gradient(to right,var(--color-accent-border),transparent); }
        .div-line-r-e   { background:linear-gradient(to left,var(--color-accent-border),transparent); }
        .div-gem-e      { width:8px;height:8px;background:var(--color-accent);transform:rotate(45deg);box-shadow:0 0 14px var(--color-accent-glow); }

        /* ── PARTICLES ── */
        .particles-layer-e { position:absolute;inset:0;pointer-events:none;z-index:5;overflow:hidden; }

        /* ── CHEST SCENE ── */
        .chest-scene-e {
          position:relative;z-index:2;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:28px;
          /* key line — no huge padding, only what's needed */
          padding: 8px 24px 48px;
        }
        .chest-wrap-e       { display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;max-width:420px; }
        .chest-badge-e      { display:inline-flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.45em;text-transform:uppercase;color:var(--color-accent);opacity:0.7;background:var(--color-accent-muted);border:1px solid var(--color-accent-border);border-radius:999px;padding:5px 14px;margin-bottom:4px; }
        .chest-badge-dot    { width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:dot-pulse 1.8s infinite; }
        .chest-status-e     { display:flex;align-items:center;gap:7px;margin-top:6px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:var(--color-accent);opacity:0.55; }
        .status-dot-e       { width:6px;height:6px;border-radius:50%;background:var(--color-accent);animation:dot-pulse 2s infinite; }

        /* ── SLOT GLOW ── */
        .slot-glow-e { position:absolute;width:76px;height:76px;border-radius:12px;border:2.5px solid var(--color-accent);box-shadow:0 0 22px var(--color-accent-glow),inset 0 0 12px var(--color-accent-muted);top:50%;left:50%;transform:translate(-50%,-14%);pointer-events:none; }

        /* ── KEY ── */
        .key-wrap-e   { position:relative;cursor:grab;user-select:none;z-index:10; }
        .key-wrap-e:active { cursor:grabbing; }
        .key-inner-e  { display:flex;flex-direction:column;align-items:center;gap:6px;position:relative; }
        .key-near-pulse { position:absolute;inset:-18px;border-radius:18px;background:var(--color-accent-muted);border:1px solid var(--color-accent-border);pointer-events:none;animation:near-pulse 0.6s ease-in-out infinite; }

        /* ── DRAG HINT ── */
        .drag-hint-e    { display:flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:var(--color-accent);opacity:0.55; }
        .hint-arr-wrap  { animation:hint-slide 1.1s ease-in-out infinite;color:var(--color-accent); }

        /* ── GATE STAGE (full-bleed, the title and cards sit behind the door) ── */
        .proj-section-enhanced { padding:0 !important; }
        .proj-section-enhanced.is-open { padding:0 0 80px !important; }
        .gate-stage { position:relative; width:100vw; margin-left:calc(50% - 50vw); overflow:hidden; z-index:2; background:var(--color-bg-primary); }
        .gate-stage.open { overflow:visible; }
        .gate-room { position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 60% 45% at 50% 20%, var(--color-accent-muted), transparent 72%); }
        .gate-content { position:absolute; inset:0; overflow:hidden; padding-top:96px; }
        .gate-stage.open .gate-content { position:relative; inset:auto; overflow:visible; }
        .gate-layer { position:absolute; top:0; left:0; right:0; height:var(--gate-h, 100%); z-index:5; }
        .gate-foot { position:absolute; left:0; right:0; bottom:26px; z-index:6; display:flex; flex-direction:column; align-items:center; gap:12px; transition:opacity .4s; pointer-events:none; }
        .gate-foot .drag-hint-e { text-shadow:0 0 14px rgba(0,0,0,.9); }
        .gate-skip { pointer-events:auto; display:inline-flex; align-items:center; gap:8px; cursor:pointer; background:var(--color-bg-glass); border:1px solid var(--color-border-strong); color:var(--color-text-secondary);
          border-radius:999px; padding:8px 18px; font-family:'Share Tech Mono',monospace; font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; backdrop-filter:blur(6px); transition:all .25s; }
        .gate-skip:hover { color:var(--color-accent); border-color:var(--color-accent-border); }

        /* ── CARDS AREA ── */
        .cards-area-e { padding:16px 24px 8px;position:relative;z-index:2;max-width:1400px;margin:0 auto; }

        /* ── CARD ── */
        .proj-card-enhanced {
          position:relative;width:340px;min-height:510px;
          background:linear-gradient(150deg,var(--color-bg-elevated) 0%,var(--color-bg-sunken) 60%,var(--color-bg-primary) 100%);
          border:1px solid var(--color-border);border-radius:22px;
          padding:26px 24px 24px;display:flex;flex-direction:column;
          cursor:pointer;overflow:hidden;
          box-shadow:0 10px 50px rgba(0,0,0,0.5);
          transform-style:preserve-3d;will-change:transform;
          transition:border-color 0.32s ease, box-shadow 0.32s ease;
        }
        .proj-card-enhanced:hover { border-color:var(--color-accent-border);box-shadow:0 16px 60px rgba(0,0,0,0.6),0 0 40px var(--accent,var(--color-accent-muted)); }
        .proj-card-enhanced:hover .card-icon-enhanced  { transform:rotate(10deg) scale(1.1);box-shadow:0 6px 28px var(--accent,rgba(26,188,156,0.3)); }
        .proj-card-enhanced:hover .card-title-enhanced { color:var(--accent,#4dd9bc); }
        .proj-card-enhanced:hover .card-chip-enhanced  { color:var(--accent,#1abc9c);border-color:var(--accent,rgba(26,188,156,0.25)); }
        .proj-card-enhanced:hover .card-cta-enhanced   { background:color-mix(in srgb,var(--accent,#1abc9c) 12%,transparent);border-color:var(--accent,rgba(26,188,156,0.4)); }
        .proj-card-enhanced:hover .cta-arrow-enhanced  { transform:translateX(5px) !important; }
        .proj-card-enhanced:hover .card-bottom-line    { transform:scaleX(1) !important; }

        /* ── HIDE BTN ── */
        .hide-btn-e { position:relative;overflow:hidden;display:flex;align-items:center;gap:9px;padding:13px 32px;background:var(--color-bg-glass);border:1px solid var(--color-accent-border);border-radius:14px;color:var(--color-accent);font-family:'Share Tech Mono',monospace;font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 24px rgba(0,0,0,0.3); }
        .hide-btn-e:hover { background:var(--color-accent-muted);border-color:var(--color-accent);box-shadow:var(--shadow-accent),0 4px 24px rgba(0,0,0,0.4);transform:translateY(-2px); }
        .hide-btn-shine   { position:absolute;inset:0;border-radius:inherit;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.06) 50%,transparent 70%);pointer-events:none; }

        @media(max-width:768px){
          .proj-section-enhanced { padding:72px 0 60px; }
          .cards-area-e          { padding:14px 14px 8px;gap:16px; }
          .chest-scene-e         { gap:20px;padding:4px 16px 36px; }
          .bg-g3 { display:none; }
        }
        @media(max-width:480px){
          .proj-title-e { font-size:2rem; }
        }
      `}</style>
    </>
  );
};

export default Projects;
