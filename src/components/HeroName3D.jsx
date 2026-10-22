import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AshokWord, Env, TOTAL_W, smooth, useLiveColors } from '../three/ashok3d';

/** Re-renders the demand-driven canvas every frame, except while the intro covers it or it is off-screen. */
const Ticker = ({ visible }) => {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (visible.current && !window.__introActive) invalidate();
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [invalidate, visible]);
  return null;
};

const Content = ({ theme, onCycle }) => {
  const { camera, size } = useThree();
  const group = useRef();
  const key = useRef();
  const fill = useRef();
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const settled = useRef(!!window.__introActive); // intro already showed the word → hero starts settled
  const elapsed = useRef(0);
  const colors = useLiveColors(theme);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ clock }) => {
    elapsed.current = clock.elapsedTime;
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;

    const aspect = size.width / size.height;
    // the word takes at most 1220px / 88% of the width, leaving clear margin on both sides
    const target = Math.min(1220, size.width * 0.88);
    const fitAspect = aspect * (target / size.width);
    const d = (TOTAL_W * 1.06) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * fitAspect);
    camera.position.set(0, 0, d);
    camera.lookAt(0, 0, 0);

    const lean = size.width < 900 ? 0.12 : 0.26; // gentler tilt on small screens
    group.current.rotation.y = m.x * lean;
    group.current.rotation.x = -m.y * lean * 0.5;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.06;
    key.current.position.set(m.x * 9, m.y * 5 + 2, 7);
    fill.current.position.set(-7 + Math.sin(clock.elapsedTime * 0.5) * 3, 3, 6);
  });

  const letterT = (i) => (settled.current ? 1 : (elapsed.current - 0.2 - i * 0.14) / 0.9);
  const photoT = () => (settled.current ? 1 : smooth(1.0, 2.0, elapsed.current));

  return (
    <>
      <Env />
      <ambientLight intensity={0.25} />
      <pointLight ref={key} intensity={90} color="#ffffff" />
      <pointLight ref={fill} intensity={70} color="#ffffff" />
      <group ref={group}>
        <AshokWord theme={theme} colors={colors} letterT={letterT} photoT={photoT} onOClick={onCycle} />
      </group>
    </>
  );
};

const HeroName3D = ({ theme, onCycle }) => {
  const visible = useRef(true);
  const boxRef = useRef(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="hero-k-3d" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0, 12] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Ticker visible={visible} />
        <Content theme={theme} onCycle={onCycle} />
      </Canvas>
    </div>
  );
};

export default HeroName3D;
