import { useState, useRef, useCallback } from 'react';
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
import useTilt from '../hooks/useTilt';

const GAMES = [
  { id: 'cyberpunk', name: 'Arena Shooter',  blurb: 'Blast skills out of the arena.',  Icon: Crosshair, Comp: SkillShooter },
  { id: 'synthwave', name: 'Endless Runner', blurb: 'Dodge bugs on a neon grid.',       Icon: Zap,       Comp: EndlessRunner },
  { id: 'lava',      name: 'Meteor Strike',  blurb: 'Survive the molten meteor rain.',  Icon: Flame,     Comp: LavaGame },
  { id: 'forest',    name: 'Snake',          blurb: 'Eat skills, grow your stack.',     Icon: Terminal,  Comp: SnakeGame },
  { id: 'ocean',     name: 'Circle Draw',    blurb: 'Trace the perfect circle.',        Icon: Waves,     Comp: CircleGame },
  { id: 'sunset',    name: 'Paper Glider',   blurb: 'Glide through the golden sky.',    Icon: Sun,       Comp: SunsetGame },
  { id: 'galaxy',    name: 'Asteroid Blast', blurb: 'Clear the field of asteroids.',    Icon: Telescope, Comp: GalaxyGame },
];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Games() {
  const { theme } = useTheme();
  const [active, setActive] = useState(null);
  const busy = useRef(false);
  const sectionRef = useRef(null);
  const fxRef = useRef(null);
  useTilt(sectionRef, '.ar-box', 26);

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
        <div className="ar-bg" aria-hidden="true" />

        <div className="ar-head">
          <p className="ar-eyebrow"><span className="ar-dot" />Take a Break<span className="ar-dot" /></p>
          <h2 className="ar-title">Arcade</h2>
          <p className="ar-sub">Seven games · pick a box and play</p>
          <div className="ar-ruler"><i /><b /><i /></div>
        </div>

        <div className="ar-grid">
          {GAMES.map(({ id, name, blurb, Icon }, i) => (
            <div key={id} className="ar-slot">
              <div
                className="ar-box"
                role="button"
                tabIndex={0}
                aria-label={`Play ${name}`}
                onClick={(e) => play(id, e.currentTarget)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(id, e.currentTarget); } }}
              >
                {/* front */}
                <div className="ar-face ar-front">
                  <span className="ar-spot" aria-hidden="true" />
                  <span className="ar-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ar-icon"><Icon size={30} /></span>
                  <span className="ar-name">{name}</span>
                  <span className="ar-blurb">{blurb}</span>
                  <span className="ar-play"><Play size={12} />{theme === id ? 'Your theme · Play' : 'Play'}</span>
                </div>
                {/* sides */}
                <div className="ar-face ar-side ar-right" />
                <div className="ar-face ar-side ar-left" />
                <div className="ar-face ar-cap ar-top" />
                <div className="ar-face ar-cap ar-bottom" />
                <div className="ar-face ar-back" />
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .ar-section { position:relative; overflow:hidden; background:var(--color-bg-sunken); color:var(--color-text-primary); padding:110px 24px 110px; }
          .ar-bg { position:absolute; inset:0; pointer-events:none;
            background:radial-gradient(ellipse 60% 50% at 50% 0%, var(--color-accent-muted), transparent 70%),
              linear-gradient(var(--color-border) 1px, transparent 1px) 0 0/56px 56px, linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0/56px 56px; opacity:.6; }
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

          .ar-grid { position:relative; max-width:1120px; margin:0 auto; display:flex; flex-wrap:wrap; justify-content:center; gap:44px 40px; perspective:1300px; }
          .ar-slot { flex:0 1 250px; height:270px; }

          /* the 3D box: front face + four sides + back, depth 44px */
          .ar-box { --rx:0deg; --ry:0deg; --mx:50%; --my:50%; --d:22px;
            position:relative; width:100%; height:100%; cursor:pointer; outline:none; transform-style:preserve-3d;
            transform:rotateX(calc(var(--rx) + 9deg)) rotateY(calc(var(--ry) - 20deg));
            transition:transform .3s ease-out; }
          .ar-box:focus-visible .ar-front { outline:2px solid var(--color-accent); outline-offset:4px; }
          .ar-face { position:absolute; backface-visibility:hidden; }
          .ar-front { inset:0; transform:translateZ(var(--d)); display:flex; flex-direction:column; align-items:flex-start; gap:6px; padding:26px 24px 22px;
            border-radius:6px; border:1px solid var(--color-accent-border); overflow:hidden;
            background:linear-gradient(150deg,var(--color-bg-elevated),var(--color-bg-primary)); box-shadow:inset 0 0 30px var(--color-accent-subtle); }
          .ar-box:hover .ar-front { border-color:var(--color-accent); box-shadow:inset 0 0 40px var(--color-accent-muted), 0 0 40px var(--color-accent-muted); }
          .ar-side { background:linear-gradient(90deg,var(--color-accent-dark),color-mix(in srgb,var(--color-accent-dark) 40%,var(--color-bg-primary))); }
          .ar-right { top:0; right:calc(var(--d) * -1); width:calc(var(--d) * 2); height:100%; transform:rotateY(90deg); }
          .ar-left  { top:0; left:calc(var(--d) * -1);  width:calc(var(--d) * 2); height:100%; transform:rotateY(-90deg); filter:brightness(.7); }
          .ar-cap { background:linear-gradient(180deg,var(--color-accent-light),var(--color-accent)); }
          .ar-top    { left:0; top:calc(var(--d) * -1);    width:100%; height:calc(var(--d) * 2); transform:rotateX(90deg); }
          .ar-bottom { left:0; bottom:calc(var(--d) * -1); width:100%; height:calc(var(--d) * 2); transform:rotateX(-90deg); filter:brightness(.55); }
          .ar-back { inset:0; transform:translateZ(calc(var(--d) * -1)) rotateY(180deg); background:var(--color-bg-sunken); }

          .ar-spot { position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .3s;
            background:radial-gradient(300px circle at var(--mx) var(--my), var(--color-accent-muted), transparent 62%); }
          .ar-box:hover .ar-spot { opacity:1; }
          .ar-num { position:absolute; right:14px; top:6px; font-family:var(--font-display); font-size:4.4rem; font-weight:900; line-height:1; color:var(--color-accent-faint); pointer-events:none; }
          .ar-icon { position:relative; width:58px; height:58px; border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center; margin-bottom:10px; color:var(--color-accent);
            background:var(--color-accent-subtle); border:1px solid var(--color-accent-border); box-shadow:0 8px 24px var(--color-accent-muted); }
          .ar-name { position:relative; font-family:var(--font-display); font-size:1.08rem; font-weight:800; color:var(--color-text-primary); }
          .ar-blurb { position:relative; font-family:var(--font-body); font-size:.82rem; line-height:1.6; color:var(--color-text-secondary); min-height:2.6em; }
          .ar-play { position:relative; margin-top:auto; display:inline-flex; align-items:center; gap:7px; font-family:var(--font-mono); font-size:.62rem; letter-spacing:.18em; text-transform:uppercase; color:var(--color-accent);
            border:1px solid var(--color-accent-border); border-radius:var(--radius-full); padding:5px 13px; background:var(--color-accent-subtle); }

          @media (max-width:640px) { .ar-section { padding:80px 16px 80px; } .ar-slot { flex-basis:100%; max-width:280px; } .ar-box { transform:rotateX(calc(var(--rx) + 7deg)) rotateY(calc(var(--ry) - 12deg)); } }
          @media (prefers-reduced-motion:reduce) { .ar-box { transition:none; } }
        `}</style>
      </section>
    </>
  );
}
