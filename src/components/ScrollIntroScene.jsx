import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  AshokWord, Env, LETTERS, TOTAL_W, XS, clamp, smooth, useLiveColors,
} from '../three/ashok3d';

/* timeline (0..1 of the whole animation) */
const L_START = 0.05, L_STEP = 0.14, L_LEN = 0.13;
const PHOTO_A = 0.8, PHOTO_B = 0.94;

/* ───────────── background: stars + slow rings ───────────── */
const Backdrop = ({ progress, colors }) => {
  const pts = useRef();
  const positions = useMemo(() => {
    const n = 1600;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 90;
      a[i * 3 + 1] = (Math.random() - 0.5) * 55;
      a[i * 3 + 2] = -70 + Math.random() * 58; // all stars stay well behind the letters
    }
    return a;
  }, []);

  useFrame((_, dt) => {
    const p = progress.current;
    pts.current.rotation.z += dt * (0.01 + p * 0.03);
    pts.current.position.z = p * 5;
    pts.current.material.color.copy(colors.current.light);
  });

  return (
    <>
      <points ref={pts}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={2.2} transparent opacity={0.85} sizeAttenuation={false} depthWrite={false} />
      </points>
    </>
  );
};

/* ───────────── camera rig + lights ───────────── */
const Rig = ({ progress }) => {
  const { camera, size, pointer } = useThree();
  const key = useRef();
  const fill = useRef();
  const mouse = useRef(new THREE.Vector2());

  useFrame(({ clock }) => {
    const p = progress.current;
    const aspect = size.width / size.height;
    const d = Math.min(46, Math.max(10, (TOTAL_W * 1.22) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect)));

    // focus slides from letter to letter while building, then settles on the whole word
    const f = clamp((p - L_START) / L_STEP, 0, LETTERS.length - 0.001);
    const i = Math.floor(f);
    const fx = THREE.MathUtils.lerp(XS[i], XS[Math.min(i + 1, LETTERS.length - 1)], smooth(0.35, 1, f - i));
    const build = 1 - smooth(0.72, 0.88, p);

    mouse.current.lerp(pointer, 0.06);
    const zPush = 0.96 - 0.34 * smooth(0, 0.1, p);
    const z = d * THREE.MathUtils.lerp(zPush, 1.0, smooth(0.72, 0.9, p));
    camera.position.set(fx * build * 0.85 + mouse.current.x * 0.7, mouse.current.y * 0.45, z);
    camera.lookAt(fx * build * 0.85, 0, 0);

    key.current.position.set(mouse.current.x * 9, mouse.current.y * 5 + 2, 7);
    fill.current.position.set(-7 + Math.sin(clock.elapsedTime * 0.5) * 3, 3, 6);
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight ref={key} intensity={90} color="#ffffff" />
      <pointLight ref={fill} intensity={70} color="#ffffff" />
    </>
  );
};

/* ───────────── scene content ───────────── */
/** the intro canvas only renders while the intro is on screen */
const Ticker = () => {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    const tick = () => { raf = requestAnimationFrame(tick); if (window.__introActive) invalidate(); };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
  return null;
};

const Content = ({ progress, theme }) => {
  const sp = useRef(0); // smoothed progress
  const colors = useLiveColors(theme);

  useFrame((_, dt) => {
    sp.current += (progress.current - sp.current) * Math.min(1, dt * 5);
  });

  const letterT = (i) => (sp.current - (L_START + i * L_STEP)) / L_LEN;
  const photoT = () => smooth(PHOTO_A, PHOTO_B, sp.current);

  return (
    <>
      <Ticker />
      <Env />
      <Rig progress={sp} />
      <Backdrop progress={sp} colors={colors} />
      <AshokWord theme={theme} colors={colors} letterT={letterT} photoT={photoT} />
    </>
  );
};

const ScrollIntroScene = ({ progress, theme }) => (
  <Canvas
    frameloop="demand"
    dpr={[1, 2]}
    camera={{ fov: 40, near: 0.1, far: 200, position: [0, 0, 14] }}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    style={{ position: 'absolute', inset: 0 }}
  >
    <Content progress={progress} theme={theme} />
  </Canvas>
);

export default ScrollIntroScene;
