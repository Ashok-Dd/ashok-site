import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Boundary from '../three/Boundary';

const GAP = 0.09;

const Arc = ({ from, size, color, delay, grow }) => {
  const mesh = useRef();
  const geo = useMemo(() => {
    const arc = Math.max(0.05, size * Math.PI * 2 - GAP);
    return new THREE.TorusGeometry(1, 0.13, 28, Math.max(12, Math.round(arc * 40)), arc);
  }, [size]);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    const t = Math.min(1, Math.max(0, (grow.current - delay) / 1.2));
    const e = 1 - Math.pow(1 - t, 3);
    const count = geo.index.count;
    geo.setDrawRange(0, Math.floor((count * e) / 6) * 6);
  });

  // clockwise from 12 o'clock
  const rot = Math.PI / 2 - from * Math.PI * 2 - (size * Math.PI * 2 - GAP);
  return (
    <mesh ref={mesh} geometry={geo} rotation={[0, 0, rot]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.35} roughness={0.3} />
    </mesh>
  );
};

const Scene = ({ easy, medium, hard, visible }) => {
  const group = useRef();
  const grow = useRef(0);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const total = easy + medium + hard;

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (visible.current && !window.__introActive) invalidate();
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); };
  }, [invalidate, visible]);

  useFrame(({ clock }, dt) => {
    if (visible.current) grow.current += dt;
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;
    group.current.rotation.x = -0.5 + m.y * 0.2;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.25 + m.x * 0.35;
    group.current.position.y = Math.sin(clock.elapsedTime * 1.1) * 0.04;
  });

  const eStart = 0, mStart = easy / total, hStart = (easy + medium) / total;
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 4, 5]} intensity={40} color="#ffffff" />
      <pointLight position={[-4, -2, 3]} intensity={20} color="#88aaff" />
      <group ref={group}>
        <mesh>
          <torusGeometry args={[1, 0.13, 12, 72]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
        <Arc from={eStart} size={easy / total} color="#2ecc71" delay={0} grow={grow} />
        <Arc from={mStart} size={medium / total} color="#f39c12" delay={0.25} grow={grow} />
        <Arc from={hStart} size={hard / total} color="#e74c3c" delay={0.5} grow={grow} />
      </group>
    </>
  );
};

/** 3D donut chart of solved problems — replaces the flat SVG ring */
const Donut3D = ({ easy, medium, hard }) => {
  const visible = useRef(false);
  const box = useRef(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} aria-hidden="true" style={{ position: 'absolute', inset: -22, pointerEvents: 'none' }}>
      <Boundary>
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ fov: 32, position: [0, 0, 5.6] }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene easy={easy} medium={medium} hard={hard} visible={visible} />
        </Canvas>
      </Boundary>
    </div>
  );
};

export default Donut3D;
