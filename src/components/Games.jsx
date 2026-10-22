import { lazy, Suspense, useState, useRef, useCallback } from 'react';
import { Crosshair, Zap, Flame, Terminal, Waves, Sun, Telescope, Play } from 'lucide-react';
import gsap from 'gsap';
import SkillShooter from './SkillShooter';
import EndlessRunner from './EndlessRunner';
import SunsetGame from './SunsetGame';
import LavaGame from './LavaGame';
import SnakeGame from './SnakeGame';
import CircleGame from './CircleGame';
import GalaxyGame from './GalaxyGame';
import { useTheme } from '../context/ThemeContext';
import Boundary from '../three/Boundary';
import { hasWebGL } from '../three/webgl';

const ArcadeStage3D = lazy(() => import('./ArcadeStage3D'));

const GAMES = [
  { id: 'cyberpunk', color: '#1abc9c', name: 'Arena Shooter',  blurb: 'Blast skills out of the arena.',  Icon: Crosshair, Comp: SkillShooter },
  { id: 'synthwave', color: '#f72585', name: 'Endless Runner', blurb: 'Dodge bugs on a neon grid.',       Icon: Zap,       Comp: EndlessRunner },
  { id: 'lava', color: '#ef4444',      name: 'Meteor Strike',  blurb: 'Survive the molten meteor rain.',  Icon: Flame,     Comp: LavaGame },
  { id: 'forest', color: '#22c55e',    name: 'Snake',          blurb: 'Eat skills, grow your stack.',     Icon: Terminal,  Comp: SnakeGame },
  { id: 'ocean', color: '#0ea5e9',     name: 'Circle Draw',    blurb: 'Trace the perfect circle.',        Icon: Waves,     Comp: CircleGame },
  { id: 'sunset', color: '#f97316',    name: 'Paper Glider',   blurb: 'Glide through the golden sky.',    Icon: Sun,       Comp: SunsetGame },
  { id: 'galaxy', color: '#8b5cf6',    name: 'Asteroid Blast', blurb: 'Clear the field of asteroids.',    Icon: Telescope, Comp: GalaxyGame },
];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Games() {
  const { theme } = useTheme();
  const [active, setActive] = useState(null);
  const busy = useRef(false);
  const sectionRef = useRef(null);
  const fxRef = useRef(null);

  /** box grows to fill the screen, bursts, then the game opens */
  const play = useCallback((id, box) => {
    if (busy.current) return;
    busy.current = true;
    const fx = fxRef.current;
    const done = () => {
      setActive(id);
      gsap.to(fx.children, {
        opacity: 0, duration: 0.45, delay: 0.1,
        onComplete: () => { fx.innerHTML = ''; busy.current = false; gsap.set(box, { opacity: 1, scale: 1 }); },
      });
    };
    if (reduced()) { done(); return; }

    const r = box.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue('--color-accent').trim() || '#1abc9c';
    const light = css.getPropertyValue('--color-accent-light').trim() || '#4dd9bc';

    const grow = document.createElement('div');
    Object.assign(grow.style, {
      position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
      borderRadius: '10px', background: `linear-gradient(135deg, ${accent}, ${light})`,
      boxShadow: `0 0 60px ${accent}`, zIndex: 9997, willChange: 'left,top,width,height',
    });
    fx.appendChild(grow);

    // shock rings + flash
    const rings = [0, 1].map(() => {
      const ring = document.createElement('div');
      Object.assign(ring.style, {
        position: 'fixed', left: `${cx - 40}px`, top: `${cy - 40}px`, width: '80px', height: '80px', borderRadius: '50%',
        border: `3px solid ${light}`, opacity: 0, zIndex: 9998, pointerEvents: 'none',
      });
      fx.appendChild(ring);
      return ring;
    });
    const flash = document.createElement('div');
    Object.assign(flash.style, { position: 'fixed', inset: 0, background: light, opacity: 0, zIndex: 9998, pointerEvents: 'none' });
    fx.appendChild(flash);

    // sparks
    const sparks = Array.from({ length: 44 }, (_, i) => {
      const s = document.createElement('div');
      const size = gsap.utils.random(4, 11);
      Object.assign(s.style, {
        position: 'fixed', left: `${cx}px`, top: `${cy}px`, width: `${size}px`, height: `${size}px`,
        background: i % 3 ? light : accent, borderRadius: i % 2 ? '50%' : '2px', opacity: 0, zIndex: 9998,
        boxShadow: `0 0 10px ${accent}`, pointerEvents: 'none',
      });
      fx.appendChild(s);
      return s;
    });

    gsap.to(box, { opacity: 0, duration: 0.12 });
    const tl = gsap.timeline({ onComplete: done });
    tl.fromTo(grow, { scale: 0.92 }, { scale: 1.06, duration: 0.18, ease: 'power2.out' })
      .to(grow, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, scale: 1, duration: 0.62, ease: 'power3.in' })
      .addLabel('boom', '-=0.22')
      .to(flash, { opacity: 0.55, duration: 0.08 }, 'boom')
      .to(flash, { opacity: 0, duration: 0.45 }, 'boom+=0.08')
      .fromTo(rings, { scale: 0.2, opacity: 0.9 }, { scale: (i) => 9 + i * 6, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.09 }, 'boom')
      .fromTo(sparks, { x: 0, y: 0, opacity: 1, scale: 1 }, {
        x: () => gsap.utils.random(-1, 1) * Math.max(window.innerWidth, 800) * 0.45,
        y: () => gsap.utils.random(-1, 1) * Math.max(window.innerHeight, 600) * 0.45,
        rotation: () => gsap.utils.random(-360, 360), opacity: 0, scale: 0.2, duration: 0.85, ease: 'power3.out',
      }, 'boom');
  }, []);

  const exit = useCallback(() => setActive(null), []);
  const Running = GAMES.find((g) => g.id === active)?.Comp;

  return (
    <>
      <div ref={fxRef} aria-hidden="true" />
      {Running && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <Running onExit={exit} />
        </div>
      )}

      <section id="arcade" ref={sectionRef} className="ar-section">
        <div className="ar-floor" aria-hidden="true" />
        <div className="ar-bg" aria-hidden="true" />

        <div className="ar-head">
          <p className="ar-eyebrow"><span className="ar-dot" />Take a Break<span className="ar-dot" /></p>
          <h2 className="ar-title">Arcade</h2>
          <p className="ar-sub">Seven games · pick one and play</p>
          <div className="ar-ruler"><i /><b /><i /></div>
        </div>

        {(() => {
          const fallback = (
            <div className="ar-list">
              {GAMES.map(({ id, name, blurb, Icon, color }) => (
                <button key={id} className="ar-item" style={{ '--c': color }} onClick={(e) => play(id, e.currentTarget)}>
                  <Icon size={34} /><b>{name}</b><span>{blurb}</span>
                </button>
              ))}
            </div>
          );
          return hasWebGL() ? (
            <Boundary fallback={fallback}>
              <Suspense fallback={<div style={{ minHeight: 680 }} />}>
                <ArcadeStage3D games={GAMES} onPlay={play} activeTheme={theme} />
              </Suspense>
            </Boundary>
          ) : fallback;
        })()}

        <style>{`
          .ar-section { position:relative; overflow:hidden; background:var(--color-bg-sunken); color:var(--color-text-primary); padding:110px 24px 110px; }
          .ar-bg { position:absolute; inset:0; pointer-events:none;
            background:radial-gradient(ellipse 60% 50% at 50% 0%, var(--color-accent-muted), transparent 70%),
              linear-gradient(var(--color-border) 1px, transparent 1px) 0 0/56px 56px, linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0/56px 56px; opacity:.6; }
          .ar-floor { position:absolute; left:0; right:0; bottom:0; height:46%; perspective:520px; overflow:hidden; pointer-events:none;
            -webkit-mask:linear-gradient(to top, #000 20%, transparent); mask:linear-gradient(to top, #000 20%, transparent); }
          .ar-floor::before { content:''; position:absolute; left:-50%; right:-50%; bottom:0; height:220%; transform-origin:50% 100%; transform:rotateX(74deg);
            background:linear-gradient(var(--color-accent-border) 1px, transparent 1px) 0 0/64px 64px, linear-gradient(90deg, var(--color-accent-border) 1px, transparent 1px) 0 0/64px 64px;
            animation:arGrid 3.4s linear infinite; }
          @keyframes arGrid { to { background-position:0 64px, 0 0; } }
          .ar-head { position:relative; text-align:center; margin-bottom:60px; }
          .ar-eyebrow { display:inline-flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:11px; letter-spacing:.4em; text-transform:uppercase; color:var(--color-accent); margin-bottom:14px; }
          .ar-dot { width:5px; height:5px; border-radius:50%; background:var(--color-accent); box-shadow:0 0 8px var(--color-accent-glow); }
          .ar-title { font-family:var(--font-display); font-size:clamp(2.2rem,5.5vw,3.8rem); font-weight:900; letter-spacing:.06em; margin:0 0 10px;
            background:linear-gradient(135deg,var(--color-text-primary) 30%,var(--color-accent) 70%,var(--color-accent-light)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
          .ar-sub { font-family:var(--font-mono); font-size:.7rem; letter-spacing:.28em; text-transform:uppercase; color:var(--color-text-muted); margin:0; }
          .ar-ruler { display:flex; justify-content:center; align-items:center; gap:14px; margin-top:22px; }
          .ar-ruler i { width:100px; height:1px; background:linear-gradient(to right,var(--color-accent-border),transparent); }
          .ar-ruler i:last-child { background:linear-gradient(to left,var(--color-accent-border),transparent); }
          .ar-ruler b { width:8px; height:8px; background:var(--color-accent); transform:rotate(45deg); box-shadow:0 0 14px var(--color-accent-glow); }

          .ar-list { position:relative; max-width:1000px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:18px; }
          .ar-item { display:grid; justify-items:center; gap:8px; padding:28px 18px; cursor:pointer; border-radius:var(--radius-lg); border:1px solid color-mix(in srgb, var(--c) 35%, transparent); background:var(--color-bg-glass); color:var(--c); }
          .ar-item b { font-family:var(--font-display); color:var(--color-text-primary); } .ar-item span { font-size:.82rem; color:var(--color-text-secondary); }

          @media (max-width:640px) { .ar-section { padding:80px 16px 80px; } }
          @media (prefers-reduced-motion:reduce) { .ar-floor::before { animation:none; } }
        `}</style>
      </section>
    </>
  );
}
