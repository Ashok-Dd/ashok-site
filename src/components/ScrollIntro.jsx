import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error('3D intro failed:', err); }
  render() { return this.state.failed ? null : this.props.children; }
}

const Scene = lazy(() => import('./ScrollIntroScene'));

/** wheel/touch pixels needed to play the whole animation */
const TRAVEL = 2600;
/** extra scroll past the final frame before the intro dissolves into the hero */
const EXIT_PULL = 320;

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

const lockPage = (on) => {
  document.documentElement.style.overflow = on ? 'hidden' : '';
  document.body.style.overflow = on ? 'hidden' : '';
};

/**
 * Full-screen 3D intro. The page itself does NOT scroll while it plays:
 * wheel / touch / keyboard input drives the animation progress instead.
 * Once the final frame is reached, one more pull dissolves it into the hero
 * and normal scrolling is released. Scrolling up from the very top replays it.
 */
const ScrollIntro = () => {
  const { theme } = useTheme();
  const rootRef = useRef(null);
  const progress = useRef(0);
  const barRef = useRef(null);
  const hintRef = useRef(null);
  const hintTextRef = useRef(null);
  const [ok] = useState(() => hasWebGL());
  const [done, setDone] = useState(false);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (!ok || reduced) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const st = { active: window.scrollY <= 0, over: 0, leaving: false, y: 0 };
    window.__introActive = st.active;

    const paint = () => {
      const p = progress.current;
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
      if (hintRef.current) hintRef.current.style.opacity = String(p < 0.04 || p > 0.97 ? 1 : 0);
      if (hintTextRef.current) {
        const txt = p > 0.97 ? 'keep scrolling' : 'scroll';
        if (hintTextRef.current.textContent !== txt) hintTextRef.current.textContent = txt;
      }
    };

    const leave = () => {
      if (st.leaving) return;
      st.leaving = true;
      gsap.to(root, {
        opacity: 0, scale: 1.06, duration: 0.9, ease: 'power2.inOut',
        onComplete: () => {
          st.active = false; st.leaving = false;
          window.__introActive = false;
          root.style.display = 'none';
          lockPage(false);
          window.scrollTo(0, 0);
          setDone(true); // plays once per visit — unmounts the scene and frees the GPU
        },
      });
    };

    const push = (dy) => {
      if (st.leaving) return;
      if (dy > 0 && progress.current >= 1) {
        st.over += dy;
        if (st.over >= EXIT_PULL) leave();
        return;
      }
      st.over = 0;
      progress.current = Math.min(1, Math.max(0, progress.current + dy / TRAVEL));
      paint();
    };

    const onWheel = (e) => {
      if (st.active) { e.preventDefault(); push(e.deltaY); return; }
    };
    const onTouchStart = (e) => { st.y = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY;
      const dy = (st.y - y) * 2.4;
      st.y = y;
      if (st.active) { e.preventDefault(); push(dy); return; }
    };
    const onKey = (e) => {
      if (!st.active) return;
      const down = ['ArrowDown', 'PageDown', ' ', 'End'];
      const up = ['ArrowUp', 'PageUp', 'Home'];
      if (down.includes(e.key)) { e.preventDefault(); push(e.key === 'ArrowDown' ? 260 : 700); }
      else if (up.includes(e.key)) { e.preventDefault(); push(e.key === 'ArrowUp' ? -260 : -700); }
    };

    if (st.active) { lockPage(true); gsap.set(root, { display: 'block' }); }
    else root.style.display = 'none';
    paint();

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      gsap.killTweensOf(root);
      lockPage(false);
      window.__introActive = false;
    };
  }, [ok, reduced]);

  if (!ok || reduced || done) return null;

  return (
    <div ref={rootRef} className="intro3d" style={{ display: 'none' }}>
      <div className="intro3d-glow" />
      <SceneBoundary>
        <Suspense fallback={null}>
          <Scene progress={progress} theme={theme} />
        </Suspense>
      </SceneBoundary>

      <div className="intro3d-hud" aria-hidden="true">
        <div className="intro3d-rail"><i ref={barRef} /></div>
        <div className="intro3d-hint" ref={hintRef}>
          <span className="intro3d-mouse"><b /></span>
          <span ref={hintTextRef}>scroll</span>
        </div>
      </div>

      <style>{`
        .intro3d { position:fixed; inset:0; z-index:2000; background:var(--color-bg-primary); overflow:hidden; touch-action:none; overscroll-behavior:none; }
        .intro3d-glow { position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 55% 45% at 50% 50%, var(--color-accent-muted), transparent 70%),
            radial-gradient(ellipse 80% 60% at 50% 120%, var(--color-accent-subtle), transparent 70%); }
        .intro3d-hud { position:absolute; inset:0; pointer-events:none; font-family:var(--font-mono); text-transform:uppercase; }
        .intro3d-rail { position:absolute; right:clamp(14px,3vw,36px); top:22vh; bottom:22vh; width:2px; background:var(--color-border); border-radius:2px; overflow:hidden; }
        .intro3d-rail i { position:absolute; inset:0; transform-origin:top; transform:scaleY(0); background:linear-gradient(var(--color-accent-light),var(--color-accent)); box-shadow:0 0 12px var(--color-accent-glow); }
        .intro3d-hint { position:absolute; left:50%; bottom:clamp(24px,5vh,52px); transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:10px;
          font-size:.62rem; letter-spacing:.36em; color:var(--color-text-secondary); transition:opacity .4s; }
        .intro3d-mouse { width:22px; height:36px; border:1.5px solid var(--color-accent-border); border-radius:12px; display:flex; justify-content:center; padding-top:6px; }
        .intro3d-mouse b { width:3px; height:7px; border-radius:2px; background:var(--color-accent); animation:intro3dWheel 1.6s ease-in-out infinite; }
        @keyframes intro3dWheel { 0% { transform:translateY(0); opacity:1; } 80% { transform:translateY(10px); opacity:0; } 100% { opacity:0; } }
        @media (max-width:640px) { .intro3d-rail { display:none; } }
      `}</style>
    </div>
  );
};

export default ScrollIntro;
