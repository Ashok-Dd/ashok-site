import { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, Github, Code2, Laptop, Wrench, Star, X, ArrowRight, Zap, Globe, Shield, Lock, ChevronUp, Terminal, Database, Layers } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS } from '../../data';
import ProjectGate3D from './ProjectGate3D';
import { hasWebGL } from '../three/ashok3d';


gsap.registerPlugin(ScrollTrigger);



/* ─── PROJECT DETAIL DRAWER ─────────────────────────────── */
const ProjectDrawer = ({ project, onClose }) => {
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const Icon = project.icon;
  const accent = project.accentColor;

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .fromTo(drawerRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.55, ease: 'expo.out' }, '-=0.15')
      .fromTo(contentRef.current?.querySelectorAll('.drawer-animate') ?? [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }, '-=0.3');
    return () => tl.kill();
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(drawerRef.current, { y: '100%', opacity: 0, duration: 0.38, ease: 'power2.in' })
      .to(backdropRef.current, { opacity: 0, duration: 0.22 }, '-=0.18');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200 }}>
      <div ref={backdropRef} onClick={handleClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(5,5,15,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        opacity: 0,
      }} />
      <div ref={drawerRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-primary) 100%)',
        borderTop: `1px solid ${accent}33`,
        borderRadius: '28px 28px 0 0',
        maxHeight: '92vh',
        overflowY: 'auto',
        opacity: 0,
        boxShadow: `0 -24px 80px rgba(0,0,0,0.7), 0 -4px 32px ${accent}15`,
        scrollbarWidth: 'thin',
        scrollbarColor: `${accent}40 transparent`,
      }}>
        <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${accent}, ${accent}88, transparent)`, borderRadius: '28px 28px 0 0' }} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 44, height: 4, background: `${accent}33`, borderRadius: 4 }} />
        </div>
        <div ref={contentRef} style={{ padding: '16px 28px 48px', maxWidth: 800, margin: '0 auto' }}>
          <div className="drawer-animate" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${accent}15`, border: `1px solid ${accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0, boxShadow: `0 0 24px ${accent}20` }}>
                <Icon size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }} />
                  <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: accent }}>{project.tag} · {project.year}</span>
                </div>
                <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(1.2rem,4vw,1.8rem)', fontWeight: 900, background: `linear-gradient(135deg, #f5f5f7, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0, lineHeight: 1.2 }}>{project.title}</h2>
                <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '5px 0 0' }}>{project.short}</p>
              </div>
            </div>
            <button onClick={handleClose} style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#707090', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}15`; e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; e.currentTarget.style.transform = 'rotate(90deg)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#707090'; e.currentTarget.style.transform = 'rotate(0deg)'; }}>
              <X size={16} />
            </button>
          </div>

          <div className="drawer-animate" style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            {project.stats.map((s, i) => (
              <div key={i} style={{ flex: '1 1 80px', padding: '12px 16px', background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 14, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: accent }}>{s.val}</div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
            {project.rating && (
            <div style={{ flex: '1 1 80px', padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 14, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{project.rating}</span>
              </div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 3 }}>Rating</div>
            </div>
            )}
          </div>

          <div className="drawer-animate" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${accent}40, transparent)` }} />
            <div style={{ width: 8, height: 8, background: accent, transform: 'rotate(45deg)', boxShadow: `0 0 12px ${accent}` }} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, ${accent}40, transparent)` }} />
          </div>

          <div className="drawer-animate">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: accent }}>
              <Terminal size={11} /> Overview
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--color-text-secondary)', marginBottom: 24 }}>{project.longDesc}</p>
          </div>

          <div className="drawer-animate">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: accent }}>
              <Zap size={11} /> Key Features
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 24 }}>
              {project.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${accent}06`, border: `1px solid ${accent}18`, borderRadius: 12, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#c0c0d8' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="drawer-animate">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: accent }}>
              <Layers size={11} /> Stack
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {project.tech.map(t => (
                <span key={t} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', color: accent, background: `${accent}10`, border: `1px solid ${accent}28`, borderRadius: 9, padding: '6px 14px' }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="drawer-animate" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', background: 'transparent', color: accent, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', border: `1.5px solid ${accent}45`, borderRadius: 14, textDecoration: 'none', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}12`; e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 24px ${accent}25`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${accent}45`; e.currentTarget.style.boxShadow = 'none'; }}>
              <Github size={15} /> View Code
            </a>
            <a href={project.live} target="_blank" rel="noopener noreferrer" style={{ flex: 1.5, minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#0a0a18', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', borderRadius: 14, textDecoration: 'none', boxShadow: `0 6px 28px ${accent}40`, transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${accent}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 28px ${accent}40`; }}>
              <Globe size={15} /> Live Demo <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── PROJECT CARD ──────────────────────────────────────── */
const ProjectCard = ({ project, onOpen }) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const shineRef = useRef(null);
  const Icon = project.icon;
  const accent = project.accentColor;

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    gsap.to(card, { rotateX: (y - cy) / cy * 7, rotateY: (cx - x) / cx * 7, duration: 0.3, ease: 'power1.out', transformPerspective: 900 });
    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, ${accent}18 0%, transparent 55%)`;
    }
  };

  const handleMouseEnter = () => {
    gsap.to(glowRef.current, { opacity: 1, duration: 0.3 });
    gsap.to(cardRef.current, { scale: 1.022, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.55, ease: 'elastic.out(1,0.5)', transformPerspective: 900 });
    gsap.to(glowRef.current, { opacity: 0, duration: 0.3 });
  };

  return (
    <div ref={cardRef} className="proj-card-enhanced" onClick={() => onOpen(project)}
      onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      style={{ '--accent': accent }}>
      <div ref={shineRef} style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 1, transition: 'background 0.1s' }} />
      <div ref={glowRef} style={{ position: 'absolute', inset: -2, borderRadius: 'inherit', background: `linear-gradient(135deg, ${accent}15, transparent 60%)`, opacity: 0, pointerEvents: 'none', zIndex: 0, boxShadow: `0 0 40px ${accent}20, inset 0 0 40px ${accent}08` }} />
      <div style={{ position: 'absolute', top: 14, left: 14, width: 16, height: 16, borderTop: `2px solid ${accent}60`, borderLeft: `2px solid ${accent}60`, borderRadius: '4px 0 0 0', pointerEvents: 'none', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: 14, right: 14, width: 16, height: 16, borderBottom: `2px solid ${accent}60`, borderRight: `2px solid ${accent}60`, borderRadius: '0 0 4px 0', pointerEvents: 'none', zIndex: 2 }} />
      <svg style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 100, opacity: 0.07, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 120 100">
        <path d="M120,0 L80,0 L60,20 L20,20 L0,40" stroke={accent} strokeWidth="1" fill="none"/>
        <path d="M120,30 L90,30 L70,50" stroke={accent} strokeWidth="1" fill="none"/>
        <circle cx="80" cy="0" r="2.5" fill={accent}/><circle cx="60" cy="20" r="2" fill={accent}/><circle cx="90" cy="30" r="2" fill={accent}/>
      </svg>
      <div style={{ position: 'absolute', top: 10, right: 16, fontFamily: "'Orbitron', sans-serif", fontSize: '5rem', fontWeight: 900, color: `${accent}06`, lineHeight: 1, pointerEvents: 'none', zIndex: 0 }}>{project.num}</div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, background: `${accent}12`, border: `1px solid ${accent}30`, borderRadius: 999, padding: '3px 11px' }}>{project.tag}</span>
          {project.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 999, padding: '3px 9px' }}>
            <Star size={9} fill="currentColor" />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', fontWeight: 700 }}>{project.rating}</span>
          </div>
          )}
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: `${accent}10`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 16, boxShadow: `0 4px 20px ${accent}20`, transition: 'transform 0.4s ease, box-shadow 0.4s ease' }} className="card-icon-enhanced">
          <Icon size={24} />
        </div>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '0.03em', marginBottom: 4, lineHeight: 1.2, transition: 'color 0.3s' }} className="card-title-enhanced">{project.title}</h3>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>{project.short}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.83rem', lineHeight: 1.65, color: 'var(--color-text-secondary)', marginBottom: 18, flex: 1 }}>{project.description}</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {project.stats.slice(0, 2).map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '7px 10px', background: `${accent}06`, border: `1px solid ${accent}15`, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.75rem', fontWeight: 800, color: accent }}>{s.val}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
          {project.tech.slice(0, 3).map(t => (
            <span key={t} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.07em', color: 'var(--color-text-muted)', background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent-faint)', borderRadius: 7, padding: '3px 9px', transition: 'all 0.25s' }} className="card-chip-enhanced">{t}</span>
          ))}
          {project.tech.length > 3 && <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', color: `${accent}80`, background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 7, padding: '3px 9px' }}>+{project.tech.length - 3}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 15px', background: `${accent}08`, border: `1px solid ${accent}22`, borderRadius: 12, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.63rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, transition: 'all 0.3s ease' }} className="card-cta-enhanced">
          <span>View Details</span>
          <ArrowRight size={13} className="cta-arrow-enhanced" style={{ transition: 'transform 0.3s' }} />
        </div>
      </div>
      <div className="card-bottom-line" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, ${accent}80, transparent)`, borderRadius: '0 0 22px 22px', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s ease' }} />
    </div>
  );
};

/* ─── MAIN COMPONENT ────────────────────────────────────── */
const gateHeight = () => Math.round(Math.min(940, Math.max(600, window.innerHeight * 0.94)));

const Projects = () => {
  const [webgl] = useState(() => hasWebGL());
  // phase: 'gate' | 'transitioning' | 'cards'
  const [phase, setPhase] = useState(() => (hasWebGL() ? 'gate' : 'cards'));
  const [activeProject, setActive] = useState(null);

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
    const onResize = () => { if (!stage.classList.contains('open') && !stage.dataset.busy) stage.style.height = `${gateHeight()}px`; };
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
    gsap.fromTo(headerRef.current, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power3.out' });
    const cards = cardsGridRef.current?.querySelectorAll('.proj-card-enhanced') ?? [];
    gsap.fromTo(cards,
      { opacity: 0, scale: 0.9, y: 36, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.08, delay: 0.4, ease: 'power3.out', clearProps: 'filter' });
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
      const cards = cardsGridRef.current?.querySelectorAll('.proj-card-enhanced') ?? [];
      gsap.set(cards, { opacity: 0 });
      gsap.set(headerRef.current, { opacity: 0 });
      contentRef.current.style.visibility = 'hidden';
      stage.style.height = `${target}px`;
      delete stage.dataset.busy;
      setPhase('gate');
    });
  }, [phase]);

  return (
    <>
      <section id="projects" className="proj-section-enhanced">
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
              {PROJECTS.map((p) => (
                <ProjectCard key={p.id} project={p} onOpen={setActive} />
              ))}
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
              <ProjectGate3D
                ref={gateRef}
                onBurst={spawnBurst}
                onStart={() => setPhase('transitioning')}
                onDoorsStart={revealContent}
                onOpened={handleOpened}
              />
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

      {activeProject && (
        <ProjectDrawer project={activeProject} onClose={() => setActive(null)} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@400;500;600&display=swap');

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
        .proj-section-enhanced { padding:0 0 80px !important; }
        .gate-stage { position:relative; width:100vw; margin-left:calc(50% - 50vw); overflow:hidden; z-index:2; background:var(--color-bg-primary); }
        .gate-stage.open { overflow:visible; }
        .gate-room { position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 60% 45% at 50% 20%, var(--color-accent-muted), transparent 72%); }
        .gate-content { position:absolute; inset:0; overflow:hidden; padding-top:96px; }
        .gate-stage.open .gate-content { position:relative; inset:auto; overflow:visible; }
        .gate-layer { position:absolute; inset:0; z-index:5; }
        .gate-foot { position:absolute; left:0; right:0; bottom:26px; z-index:6; display:flex; flex-direction:column; align-items:center; gap:12px; transition:opacity .4s; pointer-events:none; }
        .gate-foot .drag-hint-e { text-shadow:0 0 14px rgba(0,0,0,.9); }
        .gate-skip { pointer-events:auto; display:inline-flex; align-items:center; gap:8px; cursor:pointer; background:var(--color-bg-glass); border:1px solid var(--color-border-strong); color:var(--color-text-secondary);
          border-radius:999px; padding:8px 18px; font-family:'Share Tech Mono',monospace; font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; backdrop-filter:blur(6px); transition:all .25s; }
        .gate-skip:hover { color:var(--color-accent); border-color:var(--color-accent-border); }

        /* ── CARDS AREA ── */
        .cards-area-e { display:flex;justify-content:center;flex-wrap:wrap;gap:24px;padding:16px 32px 8px;position:relative;z-index:2;max-width:1200px;margin:0 auto; }

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
          .proj-card-enhanced    { width:100%;min-width:280px;min-height:auto; }
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
