import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Play } from 'lucide-react';

/**
 * Arcade: no cards – every game is a real 3D object floating over the page.
 * One orthographic canvas (1 unit = 1 px) sits behind a layer of invisible buttons that carry the
 * labels, hover and click; the objects react to whichever button the pointer is on.
 */

const CELL_H = 410;

/* ───────────── shared bits ───────────── */
const glowTex = (() => {
  let t;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c); return t;
  };
})();

const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/** lumpy rock: an icosahedron with seeded vertex noise */
const rockGeo = (radius, detail, rough, seed) => {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const R = mulberry(seed), pos = g.attributes.position, v = new THREE.Vector3();
  const cache = new Map();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    if (!cache.has(key)) cache.set(key, 1 + (R() - 0.5) * rough);
    v.multiplyScalar(cache.get(key));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.32, emissive: color, emissiveIntensity: 0.22, ...o });

/* ───────────── the seven objects (unit space, roughly ±1.5) ───────────── */

/** Arena Shooter – a chunky sci-fi blaster: coloured armour, dark hardware, glowing core */
const Blaster = ({ color }) => {
  const armor = useMemo(() => mat(color, { metalness: 0.75, roughness: 0.22, emissiveIntensity: 0.18 }), [color]);
  const hard = useMemo(() => mat('#1b2231', { metalness: 0.85, roughness: 0.3, emissive: '#000000', emissiveIntensity: 0 }), []);
  const core = useMemo(() => new THREE.MeshBasicMaterial({ color: '#d9fff6' }), []);
  const pink = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff4d8d' }), []);
  return (
    <group rotation={[0, 0, 0.18]} scale={1.18}>
      <mesh material={armor} position={[0, 0.12, 0]}><boxGeometry args={[2.1, 0.62, 0.58]} /></mesh>
      <mesh material={armor} position={[-0.1, 0.56, 0]}><boxGeometry args={[1.25, 0.22, 0.44]} /></mesh>
      <mesh material={hard} position={[0.55, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 0.95, 20]} /></mesh>
      <mesh material={core} position={[1.04, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.11, 0.11, 0.04, 20]} /></mesh>
      <mesh material={hard} position={[1.55, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.16, 0.16, 1.15, 20]} /></mesh>
      <mesh material={armor} position={[1.9, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.21, 0.21, 0.28, 20]} /></mesh>
      <mesh material={core} position={[2.07, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.14, 0.04, 10, 24]} /></mesh>
      <mesh material={hard} position={[-0.6, -0.62, 0]} rotation={[0, 0, -0.22]}><boxGeometry args={[0.48, 1.0, 0.44]} /></mesh>
      <mesh material={armor} position={[0.15, -0.55, 0]}><boxGeometry args={[0.42, 0.78, 0.4]} /></mesh>
      <mesh material={pink} position={[0.15, -0.95, 0]}><boxGeometry args={[0.44, 0.07, 0.42]} /></mesh>
      <mesh material={core} position={[0.12, 0.12, 0.31]}><boxGeometry args={[1.5, 0.07, 0.02]} /></mesh>
      <mesh material={core} position={[0.12, 0.12, -0.31]}><boxGeometry args={[1.5, 0.07, 0.02]} /></mesh>
      <mesh material={hard} position={[-1.12, 0.16, 0]}><boxGeometry args={[0.3, 0.72, 0.52]} /></mesh>
      <mesh material={pink} position={[-0.22, -0.2, 0.3]}><boxGeometry args={[0.12, 0.12, 0.02]} /></mesh>
    </group>
  );
};

/** Endless Runner – a lightning bolt */
const Bolt = ({ color }) => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    [[0.22, 1.6], [-0.7, -0.1], [-0.08, -0.1], [-0.34, -1.6], [0.74, 0.3], [0.12, 0.3], [0.62, 1.6]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
    sh.closePath();
    return new THREE.ExtrudeGeometry(sh, { depth: 0.46, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 4 });
  }, []);
  const m = useMemo(() => mat(color, { emissiveIntensity: 0.75, metalness: 0.35, roughness: 0.25 }), [color]);
  const ref = useRef();
  useFrame(({ clock }) => { if (ref.current) ref.current.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 5) * 0.25; });
  return <mesh geometry={geo} position={[0, 0, -0.3]} scale={1.05}><primitive object={m} ref={ref} attach="material" /></mesh>;
};

/** Meteor Strike – a molten rock with a flaming tail */
const Meteor = ({ color }) => {
  const rock = useMemo(() => rockGeo(0.95, 1, 0.45, 11), []);
  const m = useMemo(() => mat('#5a2a22', { flatShading: true, roughness: 0.7, metalness: 0.2, emissive: color, emissiveIntensity: 0.55 }), [color]);
  const flames = useRef([]);
  useFrame(({ clock }) => {
    flames.current.forEach((f, i) => { if (f) { const k = 1 + Math.sin(clock.elapsedTime * 11 + i * 2) * 0.14; f.scale.set(1, k, 1); f.material.opacity = 0.55 - i * 0.12 + Math.sin(clock.elapsedTime * 9 + i) * 0.06; } });
  });
  return (
    <group rotation={[0, 0, 0.7]}>
      <mesh geometry={rock} material={m} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(f) => { flames.current[i] = f; }} position={[0, 1.1 + i * 0.45, (i - 1) * 0.12]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.78 - i * 0.18, 1.7 + i * 0.45, 20, 1, true]} />
          <meshBasicMaterial color={i === 0 ? '#ffd166' : i === 1 ? '#ff9a3c' : color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[0.4, 0.9, 1.5].map((y, i) => (
        <mesh key={i} position={[(i - 1) * 0.5, 1.7 + y * 0.9, 0.3]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color="#ffd166" /></mesh>
      ))}
    </group>
  );
};

/** Snake – a slithering serpent made of beads */
const SnakeToy = ({ color }) => {
  const N = 26;
  const beads = useRef([]);
  const tongue = useRef(); const headG = useRef();
  const bodyMat = useMemo(() => mat(color, { emissiveIntensity: 0.3, roughness: 0.4 }), [color]);
  const bellyMat = useMemo(() => mat('#baf5c9', { emissiveIntensity: 0.1, roughness: 0.5 }), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    beads.current.forEach((b, i) => {
      if (!b) return;
      const u = i / N;
      b.position.set(1.55 - i * 0.12 * 1.25 - Math.sin(i * 0.5 - t * 3) * 0.0, Math.sin(i * 0.52 - t * 3.2) * (0.42 + u * 0.5) , Math.cos(i * 0.52 - t * 3.2) * 0.22);
    });
    if (headG.current && beads.current[0]) headG.current.position.copy(beads.current[0].position);
    if (tongue.current) tongue.current.visible = Math.sin(t * 8) > 0.2;
  });
  return (
    <group rotation={[0.1, -0.25, 0.1]} scale={1.05}>
      {Array.from({ length: N }, (_, i) => {
        const u = i / N; const r = i === 0 ? 0.36 : 0.3 - u * 0.19;
        return (
          <mesh key={i} ref={(b) => { beads.current[i] = b; }} material={i % 2 ? bodyMat : bellyMat}>
            <sphereGeometry args={[r, 18, 14]} />
          </mesh>
        );
      })}
      <group ref={headG}>
        {[-1, 1].map((sz) => (
          <group key={sz} position={[0.17, 0.21, sz * 0.27]}>
            <mesh><sphereGeometry args={[0.13, 16, 12]} /><meshBasicMaterial color="#ffe14d" /></mesh>
            <mesh position={[0.07, 0, sz * 0.075]} scale={[0.4, 1.5, 0.5]}><sphereGeometry args={[0.06, 10, 8]} /><meshBasicMaterial color="#10061a" /></mesh>
          </group>
        ))}
        <group ref={tongue} position={[0.4, -0.04, 0]}>
          <mesh position={[0.14, 0, 0]}><boxGeometry args={[0.28, 0.025, 0.025]} /><meshBasicMaterial color="#ff3b5c" /></mesh>
          <mesh position={[0.34, 0, 0.05]} rotation={[0, -0.5, 0]}><boxGeometry args={[0.16, 0.02, 0.02]} /><meshBasicMaterial color="#ff3b5c" /></mesh>
          <mesh position={[0.34, 0, -0.05]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.16, 0.02, 0.02]} /><meshBasicMaterial color="#ff3b5c" /></mesh>
        </group>
      </group>
    </group>
  );
};

/** Circle Draw – a pen that really draws a ring, hold, fade, again */
const CIRCLE_R = 1.15, CIRCLE_ARC = Math.PI * 2 * 0.97, TUBE_SEG = 160, TUBE_RAD = 16;
const CircleDraw = ({ color }) => {
  const geo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 80; i++) { const a = (i / 80) * CIRCLE_ARC; pts.push(new THREE.Vector3(Math.cos(a) * CIRCLE_R, Math.sin(a) * CIRCLE_R, 0)); }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), TUBE_SEG, 0.1, TUBE_RAD, false);
    g.setDrawRange(0, 0);                       // starts empty – nothing is pre-drawn
    return g;
  }, []);
  const m = useMemo(() => mat(color, { emissiveIntensity: 0.55, transparent: true }), [color]);
  const pen = useRef();
  useFrame(({ clock }) => {
    const c = clock.elapsedTime % 4.6;
    let p = 0, fade = 1;
    if (c < 2.8) p = c / 2.8; else { p = 1; if (c > 3.9) fade = Math.max(0, 1 - (c - 3.9) / 0.7); }
    const eased = p < 1 ? 0.5 - Math.cos(p * Math.PI) / 2 : 1;
    geo.setDrawRange(0, Math.floor(TUBE_SEG * eased) * TUBE_RAD * 6);
    m.opacity = fade;
    if (pen.current) {
      const a = eased * CIRCLE_ARC;
      pen.current.position.set(Math.cos(a) * CIRCLE_R, Math.sin(a) * CIRCLE_R, 0);
      pen.current.rotation.z = a - Math.PI / 2 - 0.55;
      pen.current.visible = p < 1 && c > 0.02;
    }
  });
  return (
    <group rotation={[0, 0, -0.3]}>
      <mesh geometry={geo} material={m} />
      <group ref={pen} visible={false}>
        <mesh position={[0, 0.3, 0]}><coneGeometry args={[0.14, 0.5, 16]} /><meshStandardMaterial color="#e8f6ff" metalness={0.6} roughness={0.25} /></mesh>
        <mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.1, 0.1, 0.55, 14]} /><meshStandardMaterial color={color} metalness={0.5} roughness={0.35} emissive={color} emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, -0.02, 0]}><sphereGeometry args={[0.08, 10, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
      </group>
    </group>
  );
};

/** Paper Glider – a folded paper plane */
const Glider = ({ color }) => {
  const parts = useMemo(() => {
    const tri = (a, b, c) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
      g.computeVertexNormals(); return g;
    };
    const N = [1.9, 0, 0], T = [-1.3, 0, 0], K = [-1.3, -0.55, 0];
    const L = [-1.3, 0.3, -1.45], Rr = [-1.3, 0.3, 1.45], Lm = [-0.2, 0.06, -0.55], Rm = [-0.2, 0.06, 0.55];
    return [
      { g: tri(N, L, Lm), c: '#fff6e6' }, { g: tri(Lm, L, T), c: '#ffd7a6' },
      { g: tri(N, Rm, Rr), c: '#fff6e6' }, { g: tri(Rm, T, Rr), c: '#ffd7a6' },
      { g: tri(N, T, K), c: color }, { g: tri(N, K, T), c: color },
    ];
  }, [color]);
  const g = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) { g.current.rotation.z = Math.sin(t * 1.1) * 0.12 + 0.12; g.current.rotation.x = Math.sin(t * 0.9) * 0.28; g.current.position.x = Math.sin(t * 0.8) * 0.22; }
  });
  return (
    <group ref={g} rotation={[0, -0.6, 0.12]} scale={0.92}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.g}><meshStandardMaterial color={p.c} side={THREE.DoubleSide} roughness={0.6} metalness={0.05} emissive={p.c} emissiveIntensity={0.12} /></mesh>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-1.7 - i * 0.34, -0.12 - i * 0.05, 0]}><sphereGeometry args={[0.055 - i * 0.007, 8, 8]} /><meshBasicMaterial color={color} transparent opacity={0.8 - i * 0.15} /></mesh>
      ))}
    </group>
  );
};

/** Asteroid Blast – a cratered asteroid with orbiting debris and a targeting ring */
const Asteroid = ({ color }) => {
  const big = useMemo(() => rockGeo(1.05, 2, 0.5, 5), []);
  const small = useMemo(() => [rockGeo(0.24, 1, 0.5, 21), rockGeo(0.18, 1, 0.5, 33), rockGeo(0.14, 1, 0.5, 47)], []);
  const m = useMemo(() => mat('#4a3a78', { flatShading: true, roughness: 0.8, metalness: 0.15, emissive: color, emissiveIntensity: 0.22 }), [color]);
  const dm = useMemo(() => mat('#7b6bb0', { flatShading: true, roughness: 0.8, emissiveIntensity: 0.1 }), []);
  const orbit = useRef([]); const ring = useRef(); const rock = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    orbit.current.forEach((o, i) => { if (o) { const a = t * (0.9 - i * 0.2) + i * 2.1; const rx = 1.7 + i * 0.28, ry = 0.7 + i * 0.12; o.position.set(Math.cos(a) * rx, Math.sin(a) * ry, Math.sin(a * 0.7) * 0.4); o.rotation.x += 0.02; o.rotation.y += 0.03; } });
    if (ring.current) ring.current.rotation.z = t * 0.5;
    if (rock.current) { rock.current.rotation.y += 0.004; rock.current.rotation.x += 0.002; }
  });
  return (
    <group rotation={[0.3, 0, 0.2]}>
      <mesh ref={rock} geometry={big} material={m} />
      {small.map((g, i) => <mesh key={i} ref={(o) => { orbit.current[i] = o; }} geometry={g} material={dm} />)}
      <group ref={ring}>
        <mesh><torusGeometry args={[1.55, 0.025, 8, 80]} /><meshBasicMaterial color={color} transparent opacity={0.7} /></mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 1.55, Math.sin((i * Math.PI) / 2) * 1.55, 0]} rotation={[0, 0, (i * Math.PI) / 2]}><boxGeometry args={[0.28, 0.06, 0.06]} /><meshBasicMaterial color={color} /></mesh>
        ))}
      </group>
    </group>
  );
};

const MODELS = { cyberpunk: Blaster, synthwave: Bolt, lava: Meteor, forest: SnakeToy, ocean: CircleDraw, sunset: Glider, galaxy: Asteroid };

/** a model on its stand: bobbing, slowly turning, leaning toward the pointer, glowing and growing when hovered */
const Item = ({ game, x, y, size, hover }) => {
  const root = useRef(); const sway = useRef(); const halo = useRef(); const shadow = useRef();
  const Model = MODELS[game.id];
  const k = useRef(0);
  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime, hot = hover.current === game.id ? 1 : 0;
    k.current = THREE.MathUtils.damp(k.current, hot, 7, dt);
    root.current.position.y = y + Math.sin(t * 1.1 + x * 0.01) * 8;
    root.current.scale.setScalar(size * (1 + k.current * 0.16));
    sway.current.rotation.y = Math.sin(t * 0.7 + x * 0.01) * 0.55 + t * 0.25 * k.current * 3 + pointer.x * 0.25;
    sway.current.rotation.x = -0.12 + pointer.y * 0.12 * (1 + k.current);
    halo.current.material.opacity = 0.2 + k.current * 0.4;
    shadow.current.material.opacity = 0.28 - k.current * 0.1;
    shadow.current.scale.set(size * (2.7 - k.current * 0.3), size * 0.5, 1);
  });
  return (
    <group position={[x, 0, 0]}>
      <sprite ref={halo} position={[0, y, -80]} scale={[size * 5, size * 5, 1]}>
        <spriteMaterial map={glowTex()} color={game.color} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={shadow} position={[0, y - size * 1.95, -60]}>
        <spriteMaterial map={glowTex()} color="#000000" transparent opacity={0.28} depthWrite={false} />
      </sprite>
      <group ref={root} position={[0, y, 0]}>
        <group ref={sway}><Model color={game.color} /></group>
      </group>
    </group>
  );
};

/* ───────────── layout + labels ───────────── */
const ArcadeStage3D = ({ games, onPlay, activeTheme }) => {
  const wrap = useRef(null);
  const hover = useRef(null);
  const [w, setW] = useState(1100);
  const [live, setLive] = useState(false);
  const [hot, setHot] = useState(null);

  useEffect(() => {
    const el = wrap.current; if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  const cols = w >= 1000 ? 4 : w >= 680 ? 3 : 2;
  const rows = Math.ceil(games.length / cols);
  const cellW = Math.min(300, w / cols);
  const H = rows * CELL_H;
  const size = Math.min(cellW, 300) * 0.19;

  const items = games.map((g, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const inRow = Math.min(cols, games.length - r * cols);
    const cx = w / 2 + (c - (inRow - 1) / 2) * cellW;
    const cy = r * CELL_H + CELL_H * 0.33;
    return { g, cx, cy, left: cx - cellW / 2, top: r * CELL_H };
  });

  return (
    <div ref={wrap} className="as-wrap" style={{ height: H }}>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 800], near: 0.1, far: 3000 }}
        frameloop={live ? 'always' : 'never'}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[300, 500, 700]} intensity={2.6} />
        <directionalLight position={[-500, -200, 400]} intensity={1.1} color="#9fb4ff" />
        <pointLight position={[0, 200, 500]} intensity={60000} distance={2000} />
        {items.map(({ g, cx, cy }) => (
          <Item key={g.id} game={g} x={cx - w / 2} y={H / 2 - cy} size={size} hover={hover} />
        ))}
      </Canvas>

      {items.map(({ g, left, top }) => (
        <button
          key={g.id}
          className={`as-cell${hot === g.id ? ' hot' : ''}`}
          style={{ left, top, width: cellW, height: CELL_H, '--c': g.color }}
          aria-label={`Play ${g.name}`}
          onPointerEnter={() => { hover.current = g.id; setHot(g.id); }}
          onPointerLeave={() => { hover.current = null; setHot(null); }}
          onFocus={() => { hover.current = g.id; setHot(g.id); }}
          onBlur={() => { hover.current = null; setHot(null); }}
          onClick={(e) => onPlay(g.id, e.currentTarget)}
        >
          <span className="as-name">{g.name}</span>
          <span className="as-blurb">{g.blurb}</span>
          <span className="as-play"><Play size={11} />{activeTheme === g.id ? 'Your theme · Play' : 'Play'}</span>
        </button>
      ))}

      <style>{`
        .as-wrap { position:relative; max-width:1200px; margin:0 auto; }
        .as-cell { position:absolute; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:8px; padding:0 14px 10px; cursor:pointer; background:none; border:0; outline:none; color:inherit; text-align:center; }
        .as-name { font-family:var(--font-display); font-size:1.12rem; font-weight:900; letter-spacing:.06em; color:var(--color-text-primary); transition:color .25s, text-shadow .25s; }
        .as-blurb { font-family:var(--font-body); font-size:.84rem; line-height:1.5; color:var(--color-text-secondary); min-height:2.6em; max-width:220px; }
        .as-play { display:inline-flex; align-items:center; gap:7px; padding:6px 15px; border-radius:var(--radius-full); border:1px solid color-mix(in srgb, var(--c) 40%, transparent); background:color-mix(in srgb, var(--c) 10%, transparent);
          font-family:var(--font-mono); font-size:.62rem; letter-spacing:.18em; text-transform:uppercase; color:var(--c); transition:all .25s; }
        .as-cell.hot .as-name, .as-cell:focus-visible .as-name { color:var(--c); text-shadow:0 0 22px color-mix(in srgb, var(--c) 60%, transparent); }
        .as-cell.hot .as-play, .as-cell:focus-visible .as-play { background:var(--c); color:#0a0a18; box-shadow:0 8px 24px color-mix(in srgb, var(--c) 45%, transparent); transform:translateY(-2px); }
        @media (max-width:680px) { .as-blurb { font-size:.78rem; } .as-name { font-size:1rem; } }
      `}</style>
    </div>
  );
};

export default ArcadeStage3D;
