import { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, Github, Code2, Laptop, Wrench, Star, X, ArrowRight, Zap, Globe, Shield, Lock, ChevronUp, Terminal, Database, Layers } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/all';
import { PROJECTS } from '../../data'

gsap.registerPlugin(ScrollTrigger, Draggable);



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
        background: 'linear-gradient(180deg, #16162e 0%, #0d0d1e 100%)',
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
                <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#4b4b70', margin: '5px 0 0' }}>{project.short}</p>
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
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a80', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
            <div style={{ flex: '1 1 80px', padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 14, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{project.rating}</span>
              </div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a80', marginTop: 3 }}>Rating</div>
            </div>
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
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', lineHeight: 1.8, color: '#a0a0c0', marginBottom: 24 }}>{project.longDesc}</p>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 999, padding: '3px 9px' }}>
            <Star size={9} fill="currentColor" />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', fontWeight: 700 }}>{project.rating}</span>
          </div>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: `${accent}10`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 16, boxShadow: `0 4px 20px ${accent}20`, transition: 'transform 0.4s ease, box-shadow 0.4s ease' }} className="card-icon-enhanced">
          <Icon size={24} />
        </div>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#f0f0f8', letterSpacing: '0.03em', marginBottom: 4, lineHeight: 1.2, transition: 'color 0.3s' }} className="card-title-enhanced">{project.title}</h3>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4b4b70', marginBottom: 14 }}>{project.short}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.83rem', lineHeight: 1.65, color: '#888898', marginBottom: 18, flex: 1 }}>{project.description}</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {project.stats.slice(0, 2).map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '7px 10px', background: `${accent}06`, border: `1px solid ${accent}15`, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.75rem', fontWeight: 800, color: accent }}>{s.val}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a4a65', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
          {project.tech.slice(0, 3).map(t => (
            <span key={t} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.07em', color: '#8080a0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '3px 9px', transition: 'all 0.25s' }} className="card-chip-enhanced">{t}</span>
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

/* ─── SVGs (unchanged) ──────────────────────────────────── */
const ArmorChestSVG = ({ unlocked, lidOpen }) => (
  <svg viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '380px', height: 'auto', filter: 'drop-shadow(0 12px 32px rgba(26,188,156,0.15))' }}>
    <defs>
      <linearGradient id="g-body-main" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a2a45"/><stop offset="40%" stopColor="#1e1e38"/><stop offset="100%" stopColor="#0e0e1e"/></linearGradient>
      <linearGradient id="g-lid-main" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#32324e"/><stop offset="100%" stopColor="#1a1a30"/></linearGradient>
      <linearGradient id="g-metal-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(26,188,156,0.0)"/><stop offset="25%" stopColor="rgba(26,188,156,0.55)"/><stop offset="50%" stopColor="rgba(26,188,156,0.8)"/><stop offset="75%" stopColor="rgba(26,188,156,0.55)"/><stop offset="100%" stopColor="rgba(26,188,156,0.0)"/></linearGradient>
      <linearGradient id="g-metal-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(26,188,156,0.0)"/><stop offset="50%" stopColor="rgba(26,188,156,0.45)"/><stop offset="100%" stopColor="rgba(26,188,156,0.0)"/></linearGradient>
      <linearGradient id="g-plate-shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.06)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></linearGradient>
      <radialGradient id="g-inner-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(26,188,156,0.25)"/><stop offset="100%" stopColor="rgba(26,188,156,0)"/></radialGradient>
      <filter id="f-body-shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.6)"/></filter>
      <filter id="f-glow-strong" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
      <filter id="f-glow-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
      <clipPath id="clip-body"><rect x="20" y="138" width="320" height="152" rx="10"/></clipPath>
      <pattern id="rivets" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="2" fill="rgba(26,188,156,0.2)"/><circle cx="15" cy="15" r="1" fill="rgba(26,188,156,0.4)"/></pattern>
    </defs>
    <g filter="url(#f-body-shadow)">
      <rect x="20" y="138" width="320" height="152" rx="10" fill="url(#g-body-main)" stroke="rgba(26,188,156,0.22)" strokeWidth="1.5"/>
      <rect x="20" y="138" width="320" height="152" rx="10" fill="url(#rivets)" opacity="0.7" clipPath="url(#clip-body)"/>
      <rect x="20" y="138" width="320" height="152" rx="10" fill="url(#g-plate-shine)"/>
      <rect x="20" y="165" width="320" height="9" fill="url(#g-metal-h)" opacity="0.75"/>
      <rect x="20" y="165" width="320" height="2" fill="rgba(26,188,156,0.3)"/>
      <rect x="20" y="172" width="320" height="2" fill="rgba(0,0,0,0.3)"/>
      <rect x="20" y="218" width="320" height="9" fill="url(#g-metal-h)" opacity="0.65"/>
      <rect x="20" y="218" width="320" height="2" fill="rgba(26,188,156,0.25)"/>
      <rect x="20" y="225" width="320" height="2" fill="rgba(0,0,0,0.3)"/>
      <line x1="115" y1="138" x2="115" y2="290" stroke="url(#g-metal-v)" strokeWidth="1.5" opacity="0.5"/>
      <line x1="245" y1="138" x2="245" y2="290" stroke="url(#g-metal-v)" strokeWidth="1.5" opacity="0.5"/>
      {[[20,138],[300,138],[20,258],[300,258]].map(([cx,cy],i)=>(
        <g key={i}><rect x={cx} y={cy} width="40" height="32" rx="6" fill="rgba(26,188,156,0.06)" stroke="rgba(26,188,156,0.28)" strokeWidth="1.2"/><rect x={cx+4} y={cy+4} width="32" height="24" rx="4" fill="rgba(26,188,156,0.04)" stroke="rgba(26,188,156,0.15)" strokeWidth="0.8"/></g>
      ))}
      {[148,175,202,230,257].map(y=>(
        <g key={y}><rect x="20" y={y} width="8" height="8" rx="2" fill="rgba(26,188,156,0.25)" stroke="rgba(26,188,156,0.4)" strokeWidth="0.8"/><rect x="332" y={y} width="8" height="8" rx="2" fill="rgba(26,188,156,0.25)" stroke="rgba(26,188,156,0.4)" strokeWidth="0.8"/></g>
      ))}
      <line x1="20" y1="138" x2="115" y2="290" stroke="rgba(26,188,156,0.04)" strokeWidth="1.5"/>
      <line x1="115" y1="138" x2="20" y2="290" stroke="rgba(26,188,156,0.04)" strokeWidth="1.5"/>
      <line x1="245" y1="138" x2="340" y2="290" stroke="rgba(26,188,156,0.04)" strokeWidth="1.5"/>
      <line x1="340" y1="138" x2="245" y2="290" stroke="rgba(26,188,156,0.04)" strokeWidth="1.5"/>
      <rect x="115" y="180" width="130" height="80" rx="8" fill="rgba(26,188,156,0.04)" stroke="rgba(26,188,156,0.15)" strokeWidth="1"/>
      <polygon points="180,188 196,194 196,206 180,212 164,206 164,194" fill="none" stroke="rgba(26,188,156,0.35)" strokeWidth="1.2"/>
      <circle cx="180" cy="200" r="6" fill="rgba(26,188,156,0.12)" stroke="rgba(26,188,156,0.45)" strokeWidth="1"/>
      <text x="180" y="228" textAnchor="middle" fontSize="6" fontFamily="Share Tech Mono" fill="rgba(26,188,156,0.4)" letterSpacing="0.35em">CLASSIFIED</text>
      <text x="180" y="238" textAnchor="middle" fontSize="4.5" fontFamily="Share Tech Mono" fill="rgba(26,188,156,0.25)" letterSpacing="0.25em">TOP-SECRET</text>
      <rect x="20" y="282" width="320" height="8" rx="0" fill="rgba(26,188,156,0.08)" stroke="rgba(26,188,156,0.18)" strokeWidth="0.8"/>
    </g>
    <g style={{ transform: unlocked ? 'scale(0) translate(-180px,-188px)' : 'scale(1)', transformOrigin: '180px 188px', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <rect x="148" y="156" width="64" height="64" rx="9" fill="rgba(10,10,20,0.8)" stroke="rgba(26,188,156,0.5)" strokeWidth="1.8"/>
      <rect x="152" y="160" width="56" height="56" rx="7" fill="rgba(26,188,156,0.04)" stroke="rgba(26,188,156,0.18)" strokeWidth="0.8"/>
      <path d="M172,176 L172,169 Q172,160 180,160 Q188,160 188,169 L188,176" fill="none" stroke="rgba(26,188,156,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="156" y="176" width="48" height="34" rx="6" fill="rgba(26,188,156,0.1)" stroke="rgba(26,188,156,0.55)" strokeWidth="1.5"/>
      <circle cx="180" cy="189" r="5.5" fill="rgba(0,0,0,0.6)" stroke="rgba(26,188,156,0.6)" strokeWidth="1.2"/>
      <rect x="178" y="189" width="4" height="8" rx="1.5" fill="rgba(26,188,156,0.3)"/>
      <text x="180" y="218" textAnchor="middle" fontSize="5" fontFamily="Share Tech Mono" fill="rgba(26,188,156,0.45)" letterSpacing="0.18em">LOCKED</text>
    </g>
    <rect className="chest-slot-rect" x="144" y="152" width="72" height="72" rx="11" fill="none" stroke="#1abc9c" strokeWidth="2.5" strokeDasharray="5 3" opacity="0" filter="url(#f-glow-strong)"/>
    <g style={{ transformOrigin: '180px 138px', transform: lidOpen ? 'perspective(700px) rotateX(-118deg)' : 'perspective(700px) rotateX(0deg)', transition: 'transform 0.75s cubic-bezier(0.34,1.1,0.64,1)' }}>
      <rect x="20" y="92" width="320" height="50" rx="10" fill="url(#g-lid-main)" stroke="rgba(26,188,156,0.35)" strokeWidth="1.5" filter="url(#f-body-shadow)"/>
      <rect x="20" y="92" width="320" height="50" rx="10" fill="url(#g-plate-shine)"/>
      <rect x="20" y="108" width="320" height="8" fill="url(#g-metal-h)" opacity="0.55"/>
      <rect x="20" y="108" width="320" height="2" fill="rgba(26,188,156,0.2)"/>
      {[[20,92],[300,92]].map(([cx,cy],i)=>(<g key={i}><rect x={cx} y={cy} width="40" height="50" rx={i===0?'10 0 0 0':'0 10 0 0'} fill="rgba(26,188,156,0.06)" stroke="rgba(26,188,156,0.25)" strokeWidth="1"/></g>))}
      {[50,85,120,155,180,205,240,275,310].map(x=>(<g key={x}><circle cx={x} cy={104} r="3" fill="rgba(26,188,156,0.3)" stroke="rgba(26,188,156,0.5)" strokeWidth="0.6"/><circle cx={x} cy={104} r="1.2" fill="rgba(26,188,156,0.6)"/></g>))}
      <text x="180" y="131" textAnchor="middle" fontSize="7" fontFamily="Share Tech Mono" fill="rgba(26,188,156,0.35)" letterSpacing="0.5em">SECURE VAULT</text>
      <line x1="60" y1="92" x2="180" y2="142" stroke="rgba(26,188,156,0.06)" strokeWidth="1.5"/>
      <line x1="300" y1="92" x2="180" y2="142" stroke="rgba(26,188,156,0.06)" strokeWidth="1.5"/>
      {[150,178,206].map(y=>(<g key={y}><rect x="20" y={y-16} width="7" height="7" rx="2" fill="rgba(26,188,156,0.22)" stroke="rgba(26,188,156,0.38)" strokeWidth="0.7"/><rect x="333" y={y-16} width="7" height="7" rx="2" fill="rgba(26,188,156,0.22)" stroke="rgba(26,188,156,0.38)" strokeWidth="0.7"/></g>))}
    </g>
    <rect x="138" y="134" width="84" height="11" rx="5.5" fill="rgba(26,188,156,0.22)" stroke="rgba(26,188,156,0.5)" strokeWidth="1.2"/>
    {[154,172,180,188,206].map(x=>(<circle key={x} cx={x} cy={139.5} r="3.2" fill="rgba(26,188,156,0.55)" stroke="rgba(26,188,156,0.8)" strokeWidth="0.8"/>))}
    {lidOpen&&(<><ellipse cx="180" cy="148" rx="120" ry="26" fill="url(#g-inner-glow)" filter="url(#f-glow-soft)"/><ellipse cx="180" cy="148" rx="70" ry="16" fill="rgba(26,188,156,0.15)" filter="url(#f-glow-strong)"/><rect x="20" y="138" width="320" height="30" fill="url(#g-inner-glow)" opacity="0.6"/></>)}
    <rect x="20" y="138" width="320" height="3" fill="rgba(26,188,156,0.2)" style={{ animation: 'chestScan 2.6s ease-in-out infinite' }}/>
    <ellipse cx="180" cy="298" rx="145" ry="8" fill="rgba(0,0,0,0.4)" opacity="0.6"/>
  </svg>
);

const MilitaryKeySVG = () => (
  <svg viewBox="0 0 160 65" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '180px', height: 'auto', filter: 'drop-shadow(0 6px 20px rgba(26,188,156,0.55))' }}>
    <defs>
      <linearGradient id="g-key-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5ee8c8"/><stop offset="50%" stopColor="#1abc9c"/><stop offset="100%" stopColor="#0d8f75"/></linearGradient>
      <linearGradient id="g-key-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.35)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></linearGradient>
      <filter id="f-key-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
    </defs>
    <circle cx="28" cy="32" r="21" fill="none" stroke="url(#g-key-body)" strokeWidth="4.5" filter="url(#f-key-glow)"/>
    <circle cx="28" cy="32" r="14" fill="none" stroke="rgba(26,188,156,0.35)" strokeWidth="1.5"/>
    <circle cx="28" cy="32" r="7" fill="rgba(26,188,156,0.15)" stroke="rgba(26,188,156,0.55)" strokeWidth="1.5"/>
    <circle cx="28" cy="32" r="3.5" fill="#1abc9c" filter="url(#f-key-glow)"/>
    <line x1="28" y1="18" x2="28" y2="46" stroke="rgba(26,188,156,0.25)" strokeWidth="1"/>
    <line x1="14" y1="32" x2="42" y2="32" stroke="rgba(26,188,156,0.25)" strokeWidth="1"/>
    <rect x="47" y="28.5" width="90" height="8" rx="4" fill="url(#g-key-body)"/>
    <rect x="47" y="28.5" width="90" height="3.5" rx="1.8" fill="url(#g-key-shine)"/>
    <rect x="58" y="31" width="3" height="6" rx="1.2" fill="rgba(0,0,0,0.3)"/>
    <rect x="70" y="31" width="3" height="6" rx="1.2" fill="rgba(0,0,0,0.3)"/>
    <rect x="80" y="31" width="2" height="6" rx="1" fill="rgba(0,0,0,0.3)"/>
    <rect x="100" y="36" width="9" height="15" rx="2.5" fill="url(#g-key-body)"/>
    <rect x="100" y="36" width="9" height="4" rx="1" fill="rgba(255,255,255,0.2)"/>
    <rect x="113" y="36" width="7" height="10" rx="2" fill="#1abc9c"/>
    <rect x="124" y="36" width="9" height="17" rx="2.5" fill="url(#g-key-body)"/>
    <rect x="124" y="36" width="9" height="4" rx="1" fill="rgba(255,255,255,0.2)"/>
    <rect x="65" y="19" width="6" height="9" rx="2" fill="rgba(26,188,156,0.6)" stroke="rgba(26,188,156,0.8)" strokeWidth="0.8"/>
    <text x="28" y="60" textAnchor="middle" fontSize="5.5" fontFamily="Share Tech Mono" fill="rgba(26,188,156,0.55)" letterSpacing="0.25em">VLT-K01</text>
  </svg>
);

/* ─── MAIN COMPONENT ────────────────────────────────────── */
const Projects = () => {
  // phase: 'chest' | 'transitioning' | 'cards'
  const [phase, setPhase] = useState('chest');
  const [unlocked, setUnlocked] = useState(false);
  const [lidOpen, setLidOpen] = useState(false);
  const [activeProject, setActive] = useState(null);
  const [nearSlot, setNearSlot] = useState(false);

  const sectionRef    = useRef(null);
  const headerRef     = useRef(null);
  const chestAreaRef  = useRef(null);
  const keyWrapRef    = useRef(null);
  const keyInnerRef   = useRef(null);
  const slotRectRef   = useRef(null);
  const cardsAreaRef  = useRef(null);   // the outer wrapper — always mounted
  const cardsGridRef  = useRef(null);   // inner grid of actual cards
  const particlesRef  = useRef(null);
  const hintRef       = useRef(null);
  const hideRef       = useRef(null);
  const draggableInst = useRef(null);

  /* ── hide cards wrapper initially so there's no flicker ── */
  useEffect(() => {
    if (cardsAreaRef.current) {
      gsap.set(cardsAreaRef.current, { display: 'none', opacity: 0 });
    }
  }, []);

  /* ── scroll reveal ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -28 },
        { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true } }
      );
      gsap.fromTo(chestAreaRef.current,
        { opacity: 0, scale: 0.82, y: 48 },
        { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 74%', once: true } }
      );
      gsap.fromTo(keyWrapRef.current,
        { opacity: 0, x: -44, rotation: -8 },
        { opacity: 1, x: 0, rotation: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── key ambient float ── */
  useEffect(() => {
    if (phase !== 'chest') return;
    const tween = gsap.to(keyInnerRef.current, { y: -10, rotation: 5, duration: 2.0, repeat: -1, yoyo: true, ease: 'power1.inOut' });
    return () => tween.kill();
  }, [phase]);

  /* ── hint pulse ── */
  useEffect(() => {
    if (phase !== 'chest' || !hintRef.current) return;
    const tween = gsap.to(hintRef.current, { opacity: 0.22, duration: 1.1, repeat: -1, yoyo: true, ease: 'power1.inOut' });
    return () => tween.kill();
  }, [phase]);

  /* ── init draggable ── */
  const initDraggable = useCallback(() => {
    if (!keyWrapRef.current || !chestAreaRef.current) return;
    const keyEl  = keyWrapRef.current;
    const slotEl = slotRectRef.current;

    draggableInst.current = Draggable.create(keyEl, {
      type: 'x,y',
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDragStart() {
        gsap.killTweensOf(keyInnerRef.current);
        gsap.to(keyInnerRef.current, { y: 0, rotation: 0, scale: 1.1, duration: 0.18 });
        gsap.to(slotEl, { opacity: 0.85, duration: 0.28 });
      },
      onDrag() {
        const kBox = keyEl.getBoundingClientRect();
        const cBox = chestAreaRef.current.getBoundingClientRect();
        const d = Math.hypot(
          kBox.left + kBox.width / 2 - (cBox.left + cBox.width * 0.5),
          kBox.top  + kBox.height / 2 - (cBox.top  + cBox.height * 0.55)
        );
        const close = d < 100;
        setNearSlot(close);
        gsap.to(slotEl, { opacity: close ? 1 : 0.65, scale: close ? 1.18 : 1, duration: 0.16 });
      },
      onDragEnd() {
        const kBox = keyEl.getBoundingClientRect();
        const cBox = chestAreaRef.current.getBoundingClientRect();
        const d = Math.hypot(
          kBox.left + kBox.width / 2 - (cBox.left + cBox.width * 0.5),
          kBox.top  + kBox.height / 2 - (cBox.top  + cBox.height * 0.55)
        );
        if (d < 100) {
          doUnlock(keyEl);
        } else {
          gsap.to(keyEl, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1,0.55)' });
          gsap.to(keyInnerRef.current, { scale: 1, duration: 0.35 });
          gsap.to(slotEl, { opacity: 0, duration: 0.35 });
          setNearSlot(false);
        }
      },
    })[0];
  }, []);

  useEffect(() => {
    if (phase === 'chest') {
      const t = setTimeout(initDraggable, 120);
      return () => clearTimeout(t);
    }
    return () => draggableInst.current?.kill();
  }, [phase, initDraggable]);

  /* ── particle burst ── */
  const spawnBurst = useCallback(() => {
    const cont = particlesRef.current;
    if (!cont) return;
    const cBox = chestAreaRef.current?.getBoundingClientRect();
    const pBox = cont.getBoundingClientRect();
    const cx = (cBox?.left ?? 0) + (cBox?.width ?? 0) / 2 - pBox.left;
    const cy = (cBox?.top  ?? 0) + (cBox?.height ?? 0) / 2 - pBox.top;
    const colors = ['#1abc9c', '#4dd9bc', '#00fff0', '#148f77', '#7fffd4'];
    for (let i = 0; i < 44; i++) {
      const p   = document.createElement('div');
      const sz  = 3 + Math.random() * 9;
      const ang = (Math.PI * 2 * i) / 44 + (Math.random() - 0.5) * 0.5;
      const dist = 80 + Math.random() * 150;
      const color = colors[i % colors.length];
      p.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:${Math.random()>.55?'2px':'50%'};background:${color};box-shadow:0 0 8px ${color};pointer-events:none;left:${cx}px;top:${cy}px;`;
      cont.appendChild(p);
      gsap.fromTo(p,
        { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0 },
        { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 55, opacity: 0, scale: 0, rotation: Math.random() * 360, duration: 0.85 + Math.random() * 0.5, ease: 'power2.out', delay: Math.random() * 0.12, onComplete: () => p.remove() }
      );
    }
  }, []);

  /* ── UNLOCK SEQUENCE ── */
  const doUnlock = useCallback((keyEl) => {
    setPhase('transitioning');
    draggableInst.current?.disable();

    const cBox = chestAreaRef.current.getBoundingClientRect();
    const kBox = keyEl.getBoundingClientRect();
    const tl   = gsap.timeline();

    tl
      /* snap key to lock */
      .to(keyEl, {
        x: `+=${cBox.left + cBox.width * 0.5  - (kBox.left + kBox.width  / 2)}`,
        y: `+=${cBox.top  + cBox.height * 0.55 - (kBox.top  + kBox.height / 2)}`,
        duration: 0.3, ease: 'power3.in',
      })
      /* key rotates / inserts */
      .to(keyInnerRef.current, { rotation: 90, scale: 0.55, duration: 0.28, ease: 'power2.inOut' })
      /* chest shakes — no flash, just physical impact */
      .to(chestAreaRef.current, { x: -10, duration: 0.045, ease: 'none' })
      .to(chestAreaRef.current, { x: 13,  duration: 0.045, ease: 'none' })
      .to(chestAreaRef.current, { x: -9,  duration: 0.04,  ease: 'none' })
      .to(chestAreaRef.current, { x: 11,  duration: 0.04,  ease: 'none' })
      .to(chestAreaRef.current, { x: -6,  duration: 0.035, ease: 'none' })
      .to(chestAreaRef.current, { x: 5,   duration: 0.035, ease: 'none' })
      .to(chestAreaRef.current, { x: -2,  duration: 0.03,  ease: 'none' })
      .to(chestAreaRef.current, { x: 0,   duration: 0.05,  ease: 'power2.out' })
      /* key vanishes */
      .to(keyEl,         { opacity: 0, scale: 0, duration: 0.25, ease: 'back.in(2)' })
      .to(slotRectRef.current, { opacity: 0, duration: 0.18 }, '<')
      /* mark unlocked → SVG lock pops off */
      .call(() => setUnlocked(true))
      /* short green glow on the chest */
      .to(chestAreaRef.current, {
        filter: 'drop-shadow(0 0 36px rgba(26,188,156,0.85)) drop-shadow(0 0 70px rgba(26,188,156,0.35))',
        duration: 0.38,
      })
      /* lid opens */
      .call(() => setLidOpen(true))
      /* particles */
      .call(spawnBurst, [], '+=0.18')
      /* glow fades */
      .to(chestAreaRef.current, { filter: 'drop-shadow(0 12px 32px rgba(26,188,156,0.15))', duration: 0.9, ease: 'power2.out' }, '+=0.05')
      /* chest + key scene shrinks and fades out */
      .to('.chest-scene-e', {
        opacity: 0, scale: 0.88, y: 40,
        duration: 0.65, ease: 'power2.in',
      }, '+=0.55')

      .call(() => {
        const chestScene = sectionRef.current?.querySelector('.chest-scene-e');
        if (chestScene) gsap.set(chestScene, { display: 'none' });
      })    

      /* ── cards come in right after chest vanishes ── */
      .call(() => {
        /* make wrapper visible but still transparent */
        gsap.set(cardsAreaRef.current, { display: 'block', opacity: 0, height: 'auto' });
      })
      .to(cardsAreaRef.current, { opacity: 1, duration: 0.01 }) // instant reveal of container
      /* stagger cards from above, no flicker: they start invisible via GSAP */
      .call(() => {
        const cards = cardsGridRef.current?.querySelectorAll('.proj-card-enhanced') ?? [];
        gsap.fromTo(cards,
          { opacity: 0, y: -70, rotation: () => -10 + Math.random() * 20, scale: 0.7 },
          { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.78, stagger: 0.18, ease: 'expo.out' }
        );
        gsap.fromTo(hideRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.72 }
        );
      })
      .call(() => setPhase('cards'), [], '+=0.1');
  }, [spawnBurst]);

  /* ── HIDE / RESET ── */
  const handleHide = useCallback(() => {
    if (phase !== 'cards') return;
    setPhase('transitioning');

    const cards = cardsGridRef.current?.querySelectorAll('.proj-card-enhanced') ?? [];
    const tl = gsap.timeline({
      onComplete: () => {
        /* fully hide cards wrapper */
        gsap.set(cardsAreaRef.current, { display: 'none', opacity: 0 });
        /* reset chest + key */
        setUnlocked(false);
        setLidOpen(false);
        gsap.set(keyWrapRef.current, { x: 0, y: 0, opacity: 0, rotation: 0 });
        gsap.set(keyInnerRef.current, { rotation: 0, scale: 1 });
        gsap.set(chestAreaRef.current, { filter: 'none', x: 0 });
        setPhase('chest');
        /* re-entrance animation for chest scene */
        setTimeout(() => {
          const chestScene = sectionRef.current?.querySelector('.chest-scene-e');
          if (chestScene) gsap.set(chestScene, { display: 'flex', opacity: 1, scale: 1, y: 0 });
          gsap.fromTo(chestAreaRef.current,
            { opacity: 0, scale: 0.85, y: 40 },
            { opacity: 1, scale: 1,    y: 0,  duration: 0.8, ease: 'expo.out' }
          );
          gsap.fromTo(keyWrapRef.current,
            { opacity: 0, x: -36 },
            { opacity: 1, x: 0,     duration: 0.7, ease: 'expo.out', delay: 0.15 }
          );
        }, 40);
      },
    });

    tl.to(hideRef.current, { opacity: 0, y: 8, duration: 0.22 })
      .to(cards, { y: -55, opacity: 0, rotation: () => -7 + Math.random() * 14, scale: 0.72, duration: 0.45, stagger: 0.08, ease: 'power2.in' }, '-=0.1')
      .to(cardsAreaRef.current, { opacity: 0, duration: 0.18 });
  }, [phase]);

  return (
    <>
      <section id="projects" ref={sectionRef} className="proj-section-enhanced">
        {/* Background */}
        <div className="proj-bg-enhanced">
          <div className="bg-grid-e" />
          <div className="bg-blob-1" />
          <div className="bg-blob-2" />
          <div className="bg-scan-lines" />
          <span className="bg-glyph bg-g1">{'</>'}</span>
          <span className="bg-glyph bg-g2">{'{ }'}</span>
          <span className="bg-glyph bg-g3">{'[ ]'}</span>
        </div>

        {/* Header */}
        <div ref={headerRef} className="proj-header-enhanced" style={{ opacity: 0 }}>
          <p className="proj-eyebrow-e">
            <span className="eyebrow-dot-e" />
            <span>What I've Built</span>
            <span className="eyebrow-dot-e" />
          </p>
          <h2 className="proj-title-e">My Projects</h2>
          <p className="proj-sub-e">
            {phase === 'cards' ? 'Click any card to explore the full details.' : 'Drag the key into the chest to unlock your projects.'}
          </p>
          <div className="proj-divider-e">
            <div className="div-line-e" />
            <div className="div-gem-e" />
            <div className="div-line-e div-line-r-e" />
          </div>
        </div>

        {/* Particles */}
        <div ref={particlesRef} className="particles-layer-e" />

        {/* ─── CHEST SCENE (always in DOM, hidden by CSS when cards visible) ─── */}
        <div className="chest-scene-e">
          <div ref={chestAreaRef} style={{ opacity: 0 }} className="chest-wrap-e">
            <div className="chest-badge-e">
              <Shield size={10} />
              <span>CLASSIFIED · VAULT A7</span>
              <div className="chest-badge-dot" />
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
              <ArmorChestSVG unlocked={unlocked} lidOpen={lidOpen} />
              <div ref={slotRectRef} className="slot-glow-e" style={{ opacity: 0 }} />
            </div>
            <div className="chest-status-e">
              <div className="status-dot-e" />
              <span>{unlocked ? 'UNLOCKED' : 'SECURED'}</span>
            </div>
          </div>

          {phase === 'chest' && (
            <div ref={keyWrapRef} style={{ opacity: 0 }} className="key-wrap-e">
              <div ref={keyInnerRef} className="">
                <MilitaryKeySVG />
                {nearSlot && <div className="key-near-pulse" />}
              </div>
            </div>
          )}

          {phase === 'chest' && (
            <div ref={hintRef} className="drag-hint-e" style={{ opacity: 0.55 }}>
              <div className="hint-arr-wrap"><ArrowRight size={12} /></div>
              <span>drag key → chest</span>
            </div>
          )}
        </div>

        {/* ─── CARDS AREA — always mounted, visibility controlled by GSAP ─── */}
        <div ref={cardsAreaRef} style={{ display: 'none', opacity: 0 }}>
          <div ref={cardsGridRef} className="cards-area-e">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={setActive} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
            <button ref={hideRef} onClick={handleHide} className="hide-btn-e" style={{ opacity: 0 }}>
              <ChevronUp size={14} />
              <span>Hide Projects</span>
              <div className="hide-btn-shine" />
            </button>
          </div>
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
          0%,100% { box-shadow: 0 0 6px #1abc9c; opacity: 1; }
          50%     { box-shadow: 0 0 14px #1abc9c, 0 0 28px rgba(26,188,156,0.5); opacity: 0.7; }
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
          background: #0d0d1e;
          color: #f0f0f8;
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
          background-image: linear-gradient(rgba(26,188,156,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,188,156,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .bg-blob-1 { position:absolute;width:580px;height:580px;top:-140px;right:-110px;border-radius:50%;background:radial-gradient(circle,rgba(26,188,156,0.06) 0%,transparent 70%);animation:float-blob 11s ease-in-out infinite; }
        .bg-blob-2 { position:absolute;width:460px;height:460px;bottom:-90px;left:-75px;border-radius:50%;background:radial-gradient(circle,rgba(0,180,255,0.04) 0%,transparent 70%);animation:float-blob 15s ease-in-out infinite 5s; }
        .bg-scan-lines { position:absolute;inset:0;background:repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(26,188,156,0.007) 3px, rgba(26,188,156,0.007) 4px);pointer-events:none; }
        .bg-glyph { position:absolute;font-family:'Share Tech Mono',monospace;color:rgba(26,188,156,1);font-size:5.5rem;user-select:none;animation:glyph-drift 8s ease-in-out infinite; }
        .bg-g1 { top:10%;left:1.5%;animation-delay:0s; }
        .bg-g2 { bottom:10%;right:2%;animation-delay:3.5s; }
        .bg-g3 { top:48%;left:48%;font-size:3rem;animation-delay:6s; }

        /* ── HEADER ── */
        .proj-header-enhanced { text-align:center;margin-bottom:40px;position:relative;z-index:2;padding:0 24px; }
        .proj-eyebrow-e { display:inline-flex;align-items:center;gap:12px;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:#1abc9c;margin-bottom:14px; }
        .eyebrow-dot-e  { width:5px;height:5px;border-radius:50%;background:#1abc9c;animation:dot-pulse 2s infinite; }
        .proj-title-e   { font-family:'Orbitron',sans-serif;font-size:clamp(2.2rem,5.5vw,3.8rem);font-weight:900;letter-spacing:0.06em;background:linear-gradient(135deg,#f5f5f7 30%,#1abc9c 70%,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px; }
        .proj-sub-e     { font-family:'Inter',sans-serif;font-size:0.9rem;color:#5a5a80;max-width:400px;margin:0 auto; }
        .proj-divider-e { display:flex;align-items:center;justify-content:center;gap:14px;margin-top:24px; }
        .div-line-e     { width:100px;height:1px;background:linear-gradient(to right,rgba(26,188,156,0.5),transparent); }
        .div-line-r-e   { background:linear-gradient(to left,rgba(26,188,156,0.5),transparent); }
        .div-gem-e      { width:8px;height:8px;background:#1abc9c;transform:rotate(45deg);box-shadow:0 0 14px rgba(26,188,156,0.8); }

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
        .chest-badge-e      { display:inline-flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.45em;text-transform:uppercase;color:rgba(26,188,156,0.55);background:rgba(26,188,156,0.05);border:1px solid rgba(26,188,156,0.15);border-radius:999px;padding:5px 14px;margin-bottom:4px; }
        .chest-badge-dot    { width:5px;height:5px;border-radius:50%;background:#1abc9c;animation:dot-pulse 1.8s infinite; }
        .chest-status-e     { display:flex;align-items:center;gap:7px;margin-top:6px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(26,188,156,0.45); }
        .status-dot-e       { width:6px;height:6px;border-radius:50%;background:#1abc9c;animation:dot-pulse 2s infinite; }

        /* ── SLOT GLOW ── */
        .slot-glow-e { position:absolute;width:76px;height:76px;border-radius:12px;border:2.5px solid #1abc9c;box-shadow:0 0 22px rgba(26,188,156,0.65),inset 0 0 12px rgba(26,188,156,0.15);top:50%;left:50%;transform:translate(-50%,-14%);pointer-events:none; }

        /* ── KEY ── */
        .key-wrap-e   { position:relative;cursor:grab;user-select:none;z-index:10; }
        .key-wrap-e:active { cursor:grabbing; }
        .key-inner-e  { display:flex;flex-direction:column;align-items:center;gap:6px;position:relative; }
        .key-near-pulse { position:absolute;inset:-18px;border-radius:18px;background:rgba(26,188,156,0.06);border:1px solid rgba(26,188,156,0.35);pointer-events:none;animation:near-pulse 0.6s ease-in-out infinite; }

        /* ── DRAG HINT ── */
        .drag-hint-e    { display:flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(26,188,156,0.5); }
        .hint-arr-wrap  { animation:hint-slide 1.1s ease-in-out infinite;color:#1abc9c; }

        /* ── CARDS AREA ── */
        .cards-area-e { display:flex;justify-content:center;flex-wrap:wrap;gap:24px;padding:16px 32px 8px;position:relative;z-index:2;max-width:1200px;margin:0 auto; }

        /* ── CARD ── */
        .proj-card-enhanced {
          position:relative;width:340px;min-height:510px;
          background:linear-gradient(150deg,#1e1e35 0%,#161628 60%,#111120 100%);
          border:1px solid rgba(26,188,156,0.1);border-radius:22px;
          padding:26px 24px 24px;display:flex;flex-direction:column;
          cursor:pointer;overflow:hidden;
          box-shadow:0 10px 50px rgba(0,0,0,0.5);
          transform-style:preserve-3d;will-change:transform;
          transition:border-color 0.32s ease, box-shadow 0.32s ease;
        }
        .proj-card-enhanced:hover { border-color:rgba(26,188,156,0.32);box-shadow:0 16px 60px rgba(0,0,0,0.6),0 0 40px var(--accent,rgba(26,188,156,0.1)); }
        .proj-card-enhanced:hover .card-icon-enhanced  { transform:rotate(10deg) scale(1.1);box-shadow:0 6px 28px var(--accent,rgba(26,188,156,0.3)); }
        .proj-card-enhanced:hover .card-title-enhanced { color:var(--accent,#4dd9bc); }
        .proj-card-enhanced:hover .card-chip-enhanced  { color:var(--accent,#1abc9c);border-color:var(--accent,rgba(26,188,156,0.25)); }
        .proj-card-enhanced:hover .card-cta-enhanced   { background:color-mix(in srgb,var(--accent,#1abc9c) 12%,transparent);border-color:var(--accent,rgba(26,188,156,0.4)); }
        .proj-card-enhanced:hover .cta-arrow-enhanced  { transform:translateX(5px) !important; }
        .proj-card-enhanced:hover .card-bottom-line    { transform:scaleX(1) !important; }

        /* ── HIDE BTN ── */
        .hide-btn-e { position:relative;overflow:hidden;display:flex;align-items:center;gap:9px;padding:13px 32px;background:rgba(255,255,255,0.03);border:1px solid rgba(26,188,156,0.25);border-radius:14px;color:#1abc9c;font-family:'Share Tech Mono',monospace;font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 24px rgba(0,0,0,0.3); }
        .hide-btn-e:hover { background:rgba(26,188,156,0.08);border-color:rgba(26,188,156,0.5);box-shadow:0 0 28px rgba(26,188,156,0.2),0 4px 24px rgba(0,0,0,0.4);transform:translateY(-2px); }
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