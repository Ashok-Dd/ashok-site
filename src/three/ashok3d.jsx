import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/* ───────────── helpers ───────────── */
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeOutBack = (t) => {
  const c1 = 1.5, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export { hasWebGL } from './webgl';

export const THEME_PROFILE = {
  cyberpunk: '/profile-cyber.webp',
  synthwave: '/profile-pink.webp',
  sunset:    '/profile-orange.webp',
  lava:      '/profile-red.webp',
  forest:    '/profile-green.webp',
  ocean:     '/profile-skyblue.webp',
  galaxy:    '/profile-violet.webp',
};

/* ───────────── profile photos: loaded once, up-front, never suspend the scene ───────────── */
const photoCache = new Map(); // theme → { tex, promise }

const loadPhoto = (theme) => {
  const key = THEME_PROFILE[theme] ? theme : 'cyberpunk';
  let entry = photoCache.get(key);
  if (!entry) {
    entry = { tex: null };
    entry.promise = new Promise((resolve) => {
      new THREE.TextureLoader().load(THEME_PROFILE[key], (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const img = tex.image;
        if (img?.width && img?.height) {
          const r = img.width / img.height;
          if (r < 1) { tex.repeat.set(1, r); tex.offset.set(0, 1 - r); }
          else { tex.repeat.set(1 / r, 1); tex.offset.set((1 - 1 / r) / 2, 0); }
        }
        entry.tex = tex;
        resolve(tex);
      }, undefined, () => resolve(null));
    });
    photoCache.set(key, entry);
  }
  return entry;
};

/** start fetching every theme's photo right away so a theme switch is instant */
Object.keys(THEME_PROFILE).forEach(loadPhoto);

/** Returns the photo for the theme; keeps showing the previous one until the new one is ready (no flicker). */
const usePhoto = (theme) => {
  const [tex, setTex] = useState(() => loadPhoto(theme).tex);
  useEffect(() => {
    const entry = loadPhoto(theme);
    if (entry.tex) { setTex(entry.tex); return undefined; }
    let live = true;
    entry.promise.then((t) => { if (live && t) setTex(t); });
    return () => { live = false; };
  }, [theme]);
  return tex;
};

/* ───────────── theme colours (live from CSS variables) ───────────── */
const cssColor = (name, fallback) => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return new THREE.Color(v || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
};
export const readColors = () => ({
  accent: cssColor('--color-accent', '#1abc9c'),
  light: cssColor('--color-accent-light', '#4dd9bc'),
  text: cssColor('--color-text-primary', '#f5f5f7'),
});

/** Colours that glide to the new theme whenever `theme` changes. */
export const useLiveColors = (theme) => {
  const colors = useRef(readColors());
  const target = useRef(readColors());
  useEffect(() => {
    const id = requestAnimationFrame(() => { target.current = readColors(); });
    return () => cancelAnimationFrame(id);
  }, [theme]);
  useFrame((_, dt) => {
    ['accent', 'light', 'text'].forEach((k) => colors.current[k].lerp(target.current[k], Math.min(1, dt * 4)));
  });
  return colors;
};

/* ───────────── letter shapes (Orbitron-style, built by hand) ───────────── */
const T = 0.38; // stroke
const V = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
const poly = (pts, holes = []) => {
  const s = new THREE.Shape(V(pts));
  holes.forEach((h) => s.holes.push(new THREE.Path(V(h))));
  return s;
};

const SHAPES = {
  A: poly(
    [[-0.9, -1], [-0.9, 0.6], [-0.5, 1], [0.5, 1], [0.9, 0.6], [0.9, -1], [0.9 - T, -1], [0.9 - T, -0.15], [-0.9 + T, -0.15], [-0.9 + T, -1]],
    [[[-0.52, 0.2], [0.52, 0.2], [0.52, 0.5], [0.38, 0.62], [-0.38, 0.62], [-0.52, 0.5]]],
  ),
  S: poly([
    [-0.8, 1], [0.8, 1], [0.8, 0.62], [-0.42, 0.62], [-0.42, 0.19], [0.8, 0.19], [0.8, -1], [-0.8, -1],
    [-0.8, -0.62], [0.42, -0.62], [0.42, -0.19], [-0.8, -0.19],
  ]),
  H: poly([
    [-0.8, -1], [-0.8 + T, -1], [-0.8 + T, -0.19], [0.8 - T, -0.19], [0.8 - T, -1], [0.8, -1], [0.8, 1],
    [0.8 - T, 1], [0.8 - T, 0.19], [-0.8 + T, 0.19], [-0.8 + T, 1], [-0.8, 1],
  ]),
  K: poly([
    [-0.8, -1], [-0.42, -1], [-0.42, -0.22], [0.38, -1], [0.88, -1], [0.15, 0], [0.88, 1], [0.38, 1], [-0.42, 0.22], [-0.42, 1], [-0.8, 1],
  ]),
  O: (() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 1, 0, Math.PI * 2, false);
    const h = new THREE.Path();
    h.absarc(0, 0, 0.62, 0, Math.PI * 2, true);
    s.holes.push(h);
    return s;
  })(),
};

/** The "O" keeps its outer size; when the photo is stamped in, its hollow widens and the ring gets thinner. */
export const O_HOLE_A = 0.62;
export const O_HOLE_B = 0.9;
const RING_STEPS = 28;

export const LETTERS = [
  { ch: 'A', w: 1.8 },
  { ch: 'S', w: 1.6 },
  { ch: 'H', w: 1.6 },
  { ch: 'O', w: 2.15 },
  { ch: 'K', w: 1.76 },
];
const GAP = 0.45;
export const TOTAL_W = LETTERS.reduce((a, l) => a + l.w, 0) + GAP * (LETTERS.length - 1);
export const XS = (() => {
  let x = -TOTAL_W / 2;
  return LETTERS.map((l) => {
    const c = x + l.w / 2;
    x += l.w + GAP;
    return c;
  });
})();

const ringShape = (inner) => {
  const s = new THREE.Shape();
  s.absarc(0, 0, 1, 0, Math.PI * 2, false);
  const h = new THREE.Path();
  h.absarc(0, 0, inner, 0, Math.PI * 2, true);
  s.holes.push(h);
  return s;
};

const makeGeo = (ch, shape = SHAPES[ch], curveSegments = 64) => {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.55,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments,
  });
  g.center();
  return g;
};

/* ───────────── environment for metallic reflections ───────────── */
export const Env = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    gl.setClearColor(0x000000, 0); // PMREM leaves the clear alpha at 1 → opaque canvas
    return () => {
      scene.environment = null;
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

/* ───────────── one 3D letter ───────────── */
const Letter = ({ idx, geo, geoFn, mat, letterT, seed, children }) => {
  const ref = useRef();
  const inner = useRef();
  const meshRef = useRef();
  useFrame(({ clock }) => {
    const g = ref.current;
    const t = clamp(letterT(idx));
    const e = easeOutBack(t);
    const inv = 1 - clamp(e, 0, 1.2);
    g.visible = t > 0;
    g.position.set(XS[idx] + seed.x * inv, seed.y * inv + Math.sin(clock.elapsedTime * 0.9 + idx) * 0.05 * t, -34 * inv);
    g.rotation.set(seed.rx * inv, seed.ry * inv, seed.rz * inv);
    const pulse = t < 1 ? Math.sin(Math.PI * t) * 0.1 : 0;
    g.scale.setScalar(Math.max(0.0001, (0.5 + 0.5 * clamp(e, 0, 1.1)) * (1 + pulse)));
    if (geoFn) {
      const next = geoFn();
      if (meshRef.current.geometry !== next) meshRef.current.geometry = next;
    }
  });
  return (
    <group ref={ref} visible={false}>
      <group ref={inner}>
        <mesh ref={meshRef} geometry={geo} material={mat} />
        {children}
      </group>
    </group>
  );
};

/* ───────────── the photo stamped into the "O" ───────────── */
const PhotoO = ({ photoT, holeR, colors, theme, onClick }) => {
  const tex = usePhoto(theme);
  const disc = useRef();
  const back = useRef();
  const hit = useRef(0);
  const pop = useRef(0);
  const hover = useRef(false);

  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  useFrame(({ clock }, dt) => {
    const t = photoT();
    const s = t <= 0 ? 0.0001 : easeOutBack(t);
    hit.current += ((hover.current ? 1 : 0) - hit.current) * Math.min(1, dt * 8);
    pop.current *= Math.pow(0.04, dt);
    const extra = 1 + hit.current * 0.06 + pop.current * 0.16 * Math.sin(clock.elapsedTime * 22);
    disc.current.visible = t > 0;
    disc.current.scale.setScalar(Math.max(0.0001, s * extra * holeR() * 0.985));
    disc.current.rotation.y = (1 - t) * Math.PI * 1.5;
    back.current.visible = t > 0;
    back.current.scale.copy(disc.current.scale);
    back.current.rotation.y = disc.current.rotation.y;
    back.current.material.color.copy(colors.current.accent).multiplyScalar(0.42);
  });

  const interactive = !!onClick;
  return (
    <group>
      <mesh ref={back} position={[0, 0, 0.19]} visible={false}>
        <circleGeometry args={[1, 96]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      <mesh ref={disc} position={[0, 0, 0.2]} visible={false}>
        <circleGeometry args={[1, 96]} />
        {/* keyed on the texture: a material compiled without a map ignores one that arrives later (renders plain white) */}
        <meshBasicMaterial key={tex ? tex.uuid : 'pending'} map={tex} transparent opacity={tex ? 1 : 0} toneMapped={false} />
      </mesh>
      {interactive && (
        <mesh
          position={[0, 0, 0.3]}
          onClick={(e) => { e.stopPropagation(); pop.current = 1; onClick(); }}
          onPointerOver={() => { hover.current = true; document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { hover.current = false; document.body.style.cursor = ''; }}
        >
          <circleGeometry args={[1.0, 48]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

/* ───────────── the whole word ───────────── */
/**
 * letterT(i) → 0..1 entrance progress for letter i
 * photoT()   → 0..1 how far the photo has been stamped into the O (also grows the O)
 */
export const AshokWord = ({ theme, colors, letterT, photoT, onOClick }) => {
  const seeds = useMemo(
    () => LETTERS.map(() => ({
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 10,
      rx: (Math.random() - 0.5) * Math.PI * 3,
      ry: (Math.random() - 0.5) * Math.PI * 4,
      rz: (Math.random() - 0.5) * Math.PI,
    })),
    [],
  );
  const geos = useMemo(() => LETTERS.map((l) => makeGeo(l.ch)), []);
  const rings = useMemo(
    () => Array.from({ length: RING_STEPS }, (_, k) =>
      makeGeo('O', ringShape(O_HOLE_A + ((O_HOLE_B - O_HOLE_A) * k) / (RING_STEPS - 1)), 48)),
    [],
  );
  const holeR = () => O_HOLE_A + (O_HOLE_B - O_HOLE_A) * photoT();
  const ringGeo = () => rings[Math.round(clamp(photoT()) * (RING_STEPS - 1))];
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      metalness: 0.92, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.3,
    }),
    [],
  );
  useEffect(() => () => { geos.forEach((g) => g.dispose()); rings.forEach((g) => g.dispose()); mat.dispose(); }, [geos, rings, mat]);

  useFrame(() => {
    mat.color.copy(colors.current.light).lerp(colors.current.text, 0.35);
    mat.emissive.copy(colors.current.accent).multiplyScalar(0.18);
  });

  return LETTERS.map((l, i) => (
    <Letter
      key={l.ch + i}
      idx={i}
      geo={geos[i]}
      mat={mat}
      letterT={letterT}
      seed={seeds[i]}
      geoFn={l.ch === 'O' ? ringGeo : undefined}
    >
      {l.ch === 'O' && <PhotoO photoT={photoT} holeR={holeR} colors={colors} theme={theme} onClick={onOClick} />}
    </Letter>
  ));
};
