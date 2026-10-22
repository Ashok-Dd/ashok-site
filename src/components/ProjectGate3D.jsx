import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import Boundary from '../three/Boundary';
import { Env, useLiveColors } from '../three/ashok3d';
import { useTheme } from '../context/ThemeContext';

/**
 * The portfolio's "project vault" door — painted entirely from the active theme's palette,
 * so it reads as part of the page. The section header sits BEHIND it.
 * Drag (or click) the access key into the lock: key turns → bolts retract → lock drops →
 * the two doors slide apart to opposite sides, revealing the section.
 *
 * Imperative API (ref): unlock(), close(), reset().
 * Callbacks: onBurst, onStart, onDoorsStart, onOpened, onClosed.
 */

const GH = 9;                    // gate height in design units (width follows the aspect)
const LOCK_Y = -0.4;
const LOCK_Z = 0.6;
const SNAP = 1.6;

const cssVar = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
const palette = () => ({
  accent: cssVar('--color-accent', '#1abc9c'),
  light: cssVar('--color-accent-light', '#4dd9bc'),
  dark: cssVar('--color-accent-dark', '#148f77'),
  bgEl: cssVar('--color-bg-elevated', '#252538'),
  bgSu: cssVar('--color-bg-sunken', '#16162a'),
  bg: cssVar('--color-bg-primary', '#1e1e2f'),
  text: cssVar('--color-text-primary', '#f5f5f7'),
  muted: cssVar('--color-text-muted', '#6b6b80'),
});

const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const radial = (inner) => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner); grad.addColorStop(0.5, inner.replace(/[\d.]+\)$/, '0.22)')); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/** paints the whole door face (albedo + neon + height) in the portfolio's visual language */
const paintFace = (cw, ch, P) => {
  const mk = () => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; };
  const A = mk(), E = mk(), B = mk();
  const a = A.getContext('2d'), e = E.getContext('2d'), b = B.getContext('2d');
  const R = mulberry(77);
  const u = cw / 2000;
  const half = cw / 2;

  // base: same elevated → sunken gradient the cards use
  const g = a.createLinearGradient(0, 0, cw, ch);
  g.addColorStop(0, P.bgEl); g.addColorStop(1, P.bgSu);
  a.fillStyle = g; a.fillRect(0, 0, cw, ch);
  e.fillStyle = '#000'; e.fillRect(0, 0, cw, ch);
  b.fillStyle = '#808080'; b.fillRect(0, 0, cw, ch);

  // the site's 56px blueprint grid
  const step = 56 * u * 1.6;
  a.strokeStyle = 'rgba(255,255,255,0.045)'; a.lineWidth = u;
  for (let x = 0; x <= cw; x += step) { a.beginPath(); a.moveTo(x, 0); a.lineTo(x, ch); a.stroke(); }
  for (let y = 0; y <= ch; y += step) { a.beginPath(); a.moveTo(0, y); a.lineTo(cw, y); a.stroke(); }
  for (let i = 0; i < cw * ch * 0.0025; i++) {
    a.fillStyle = `rgba(255,255,255,${R() * 0.05})`;
    a.fillRect(R() * cw, R() * ch, 1 + R() * 2 * u, 1 + R() * 2 * u);
  }

  // each door: inset glass plate with corner brackets
  [0, 1].forEach((side) => {
    const x0 = side === 0 ? 34 * u : half + 34 * u;
    const w = half - 68 * u;
    const y0 = 34 * u, h = ch - 68 * u;
    a.fillStyle = 'rgba(255,255,255,0.025)'; a.fillRect(x0, y0, w, h);
    a.strokeStyle = 'rgba(255,255,255,0.13)'; a.lineWidth = 2 * u; a.strokeRect(x0, y0, w, h);
    b.fillStyle = '#b8b8b8'; b.fillRect(x0, y0, w, h);
    b.strokeStyle = '#303030'; b.lineWidth = 6 * u; b.strokeRect(x0, y0, w, h);
    // brackets
    const L = 70 * u;
    [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0, y0 + h, 1, -1], [x0 + w, y0 + h, -1, -1]].forEach(([x, y, dx, dy]) => {
      e.save(); e.strokeStyle = P.accent; e.lineWidth = 5 * u; e.shadowColor = P.accent; e.shadowBlur = 18 * u; e.lineCap = 'round';
      e.beginPath(); e.moveTo(x + dx * L, y); e.lineTo(x, y); e.lineTo(x, y + dy * L); e.stroke(); e.restore();
    });
    // rails
    [y0 + 26 * u, y0 + h - 26 * u].forEach((y) => {
      e.save(); e.strokeStyle = P.accent; e.globalAlpha = 0.55; e.lineWidth = 2 * u; e.shadowColor = P.accent; e.shadowBlur = 10 * u;
      e.beginPath(); e.moveTo(x0 + 90 * u, y); e.lineTo(x0 + w - 90 * u, y); e.stroke(); e.restore();
    });
  });

  // diagonal accent hatch band along the bottom (replaces hazard stripes)
  const hb = 22 * u, hy = ch - 62 * u;
  a.save(); a.beginPath(); a.rect(60 * u, hy, cw - 120 * u, hb); a.clip();
  a.strokeStyle = 'rgba(255,255,255,0.08)'; a.lineWidth = 6 * u;
  for (let x = 0; x < cw; x += 22 * u) { a.beginPath(); a.moveTo(x, hy + hb); a.lineTo(x + hb, hy); a.stroke(); }
  a.restore();
  e.save(); e.beginPath(); e.rect(60 * u, hy, cw - 120 * u, hb); e.clip();
  e.strokeStyle = P.accent; e.globalAlpha = 0.35; e.lineWidth = 4 * u;
  for (let x = 0; x < cw; x += 22 * u) { e.beginPath(); e.moveTo(x, hy + hb); e.lineTo(x + hb, hy); e.stroke(); }
  e.restore();

  // no lettering on the door — just a quiet ruler of tick marks along the top
  const cx = cw / 2;
  e.save(); e.strokeStyle = P.accent; e.globalAlpha = 0.35; e.lineWidth = 2 * u;
  for (let i = -24; i <= 24; i++) {
    if (Math.abs(i) < 2) continue;
    const x = cx + i * 28 * u, long = i % 4 === 0;
    e.beginPath(); e.moveTo(x, 96 * u); e.lineTo(x, (long ? 128 : 114) * u); e.stroke();
  }
  e.restore();

  // glowing seam
  [half - 10 * u, half + 10 * u].forEach((x) => {
    e.save(); e.strokeStyle = P.light; e.lineWidth = 4 * u; e.shadowColor = P.accent; e.shadowBlur = 24 * u;
    e.beginPath(); e.moveTo(x, 40 * u); e.lineTo(x, ch - 40 * u); e.stroke(); e.restore();
  });
  // vignette + faint scanlines
  const v = a.createRadialGradient(cx, ch / 2, ch * 0.3, cx, ch / 2, cw * 0.65);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  a.fillStyle = v; a.fillRect(0, 0, cw, ch);
  a.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 0; y < ch; y += 4) a.fillRect(0, y, cw, 1.5);

  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  return { map: tex(A, true), emissive: tex(E, true), bump: tex(B, false) };
};

const labelTexture = (text, color) => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.font = '700 46px "Share Tech Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 18; g.fillStyle = color; g.fillText(text, 256, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* ───────────── the key ───────────── */
const KeyModel = ({ mat, glow }) => (
  <group>
    <mesh position={[-1.15, 0, 0]} material={mat}><torusGeometry args={[0.46, 0.13, 16, 40]} /></mesh>
    <mesh position={[-1.15, 0, 0]} material={mat}><torusGeometry args={[0.2, 0.05, 10, 28]} /></mesh>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <mesh key={i} position={[-1.15 + Math.cos((i * Math.PI) / 3) * 0.33, Math.sin((i * Math.PI) / 3) * 0.33, 0]} rotation={[0, 0, (i * Math.PI) / 3]} material={mat}>
        <boxGeometry args={[0.2, 0.045, 0.1]} />
      </mesh>
    ))}
    <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mat}><cylinderGeometry args={[0.095, 0.095, 2.15, 16]} /></mesh>
    <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mat}><cylinderGeometry args={[0.18, 0.18, 0.16, 18]} /></mesh>
    <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mat}><cylinderGeometry args={[0.14, 0.14, 0.1, 18]} /></mesh>
    <mesh position={[0.82, -0.24, 0]} material={mat}><boxGeometry args={[0.22, 0.38, 0.12]} /></mesh>
    <mesh position={[1.1, -0.17, 0]} material={mat}><boxGeometry args={[0.2, 0.24, 0.12]} /></mesh>
    <mesh position={[1.34, -0.28, 0]} material={mat}><boxGeometry args={[0.2, 0.44, 0.12]} /></mesh>
    {glow}
  </group>
);

/* ───────────── scene ───────────── */
const Scene = ({ ctrl, onBurst, onStart, onDoorsStart, onOpened, onClosed, theme, visible, fontsKey }) => {
  const { camera, size, gl, pointer } = useThree();
  const invalidate = useThree((s) => s.invalidate);
  const colors = useLiveColors(theme);

  const leftDoor = useRef(); const rightDoor = useRef();
  const lockG = useRef(); const boltL = useRef(); const boltR = useRef();
  const keyG = useRef(); const keyGlow = useRef(); const keyLabel = useRef();
  const spill = useRef(); const ledMats = useRef([]); const fog = useRef([]);
  const dragging = useRef(false);
  const down = useRef({ x: 0, y: 0, moved: false });

  const S = useRef({
    mode: 'idle',
    key: new THREE.Vector3(), keyRot: new THREE.Euler(0, 0, -0.25, 'YXZ'), keyAttached: 0, turn: 0,
    bolt: 0, fall: 0, door: 0, enter: 0, near: 0, shake: 0, led: 0, snap: false,
  });

  const aspect = size.width / Math.max(1, size.height);
  const W = GH * aspect;
  const narrow = aspect < 1.2;

  /* textures: rebuilt for size / theme / fonts */
  const bucket = Math.min(2560, Math.max(960, Math.round((size.width * Math.min(2, window.devicePixelRatio || 1)) / 128) * 128));
  const [themeKey, setThemeKey] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setThemeKey((k) => k + 1)); return () => cancelAnimationFrame(id); }, [theme]);
  const face = useMemo(() => {
    void themeKey; void fontsKey;
    return paintFace(bucket, Math.round(bucket / aspect), palette());
  }, [bucket, aspect, themeKey, fontsKey]);
  const faces = useMemo(() => {
    const mkSide = (off) => {
      const clone = (t) => { const c = t.clone(); c.repeat.set(0.5, 1); c.offset.set(off, 0); c.needsUpdate = true; return c; };
      return { map: clone(face.map), emissive: clone(face.emissive), bump: clone(face.bump) };
    };
    return { left: mkSide(0), right: mkSide(0.5) };
  }, [face]);
  useEffect(() => () => {
    [face.map, face.emissive, face.bump, ...Object.values(faces.left), ...Object.values(faces.right)].forEach((t) => t.dispose());
  }, [face, faces]);

  const frontMat = (f) => new THREE.MeshStandardMaterial({
    map: f.map, emissiveMap: f.emissive, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 1, bumpMap: f.bump, bumpScale: 3,
    metalness: 0.15, roughness: 0.8, envMapIntensity: 0.08,
  });
  const matL = useMemo(() => frontMat(faces.left), [faces]); // eslint-disable-line react-hooks/exhaustive-deps
  const matR = useMemo(() => frontMat(faces.right), [faces]); // eslint-disable-line react-hooks/exhaustive-deps
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10121a', metalness: 0.8, roughness: 0.5 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#232733', metalness: 0.8, roughness: 0.45, envMapIntensity: 0.35 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#07080d', metalness: 0.5, roughness: 0.7 }), []);
  const neon = useMemo(() => new THREE.MeshStandardMaterial({ color: '#06120f', emissive: '#1abc9c', emissiveIntensity: 2.2, roughness: 0.6, envMapIntensity: 0 }), []);
  const keyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4dd9bc', metalness: 0.95, roughness: 0.24, emissive: '#1abc9c', emissiveIntensity: 0.4, envMapIntensity: 1 }), []);
  const glowTex = useMemo(() => radial('rgba(255,255,255,1)'), []);
  const fogTex = useMemo(() => radial('rgba(255,255,255,0.5)'), []);
  const keyLabelTex = useMemo(() => { void themeKey; return labelTexture('ACCESS KEY  ▸', cssVar('--color-accent-light', '#4dd9bc')); }, [themeKey]);
  useEffect(() => () => { [matL, matR, edge, steel, dark, neon, keyMat, glowTex, fogTex].forEach((m) => m.dispose()); }, [matL, matR, edge, steel, dark, neon, keyMat, glowTex, fogTex]);
  useEffect(() => () => keyLabelTex.dispose(), [keyLabelTex]);

  const restPos = () => (narrow ? new THREE.Vector3(-W * 0.2, -GH * 0.34, 1.3) : new THREE.Vector3(-W * 0.3, -GH * 0.27, 1.3));
  const HOLE = useMemo(() => new THREE.Vector3(0, LOCK_Y, LOCK_Z + 0.3), []);

  useEffect(() => {
    if (S.current.mode === 'idle') S.current.key.copy(restPos());
    gsap.to(S.current, { enter: 1, duration: 1.4, ease: 'power3.out' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrow]);

  /* ── sequences ── */
  const slide = useMemo(() => (to, dur, resolve) => {
    gsap.to(S.current, { door: to, duration: dur, ease: 'power3.inOut', onComplete: resolve });
  }, []);

  const unlock = useMemo(() => () => new Promise((resolve) => {
    const s = S.current;
    if (s.mode === 'busy' || s.mode === 'open') { resolve(); return; }
    s.mode = 'busy';
    onStart?.();
    const front = new THREE.Vector3(HOLE.x, HOLE.y, HOLE.z + 1.34);
    gsap.timeline()
      .to(s.key, { x: front.x, y: front.y, z: front.z + 0.9, duration: 0.5, ease: 'power3.out' })
      .to(s.keyRot, { y: Math.PI / 2, z: 0, x: 0, duration: 0.5, ease: 'power3.out' }, '<')
      .to(s.key, { z: front.z - 0.34, duration: 0.34, ease: 'power2.in' })
      .to(s, { shake: 1, duration: 0.05 }).to(s, { shake: 0, duration: 0.12 })
      .to(s, { turn: Math.PI / 2, duration: 0.55, ease: 'power2.inOut' }, '+=0.08')
      .call(() => { s.keyAttached = 1; onBurst?.(); })
      .to(s, { led: 1, duration: 0.3 })
      .to(s, { bolt: 1, duration: 0.5, ease: 'power3.out' }, '+=0.1')
      .to(s, { fall: 1, duration: 0.9, ease: 'power2.in' }, '+=0.12')
      .call(() => { onDoorsStart?.(); onBurst?.(); })
      .call(() => slide(1, 2.3, () => { s.mode = 'open'; resolve(); onOpened?.(); }));
  }), [HOLE, onBurst, onStart, onDoorsStart, onOpened, slide]);

  const close = useMemo(() => () => new Promise((resolve) => {
    const s = S.current;
    gsap.killTweensOf(s);
    s.mode = 'busy';
    Object.assign(s, { keyAttached: 0, turn: 0, bolt: 0, fall: 0, led: 0, near: 0 });
    s.key.copy(restPos()); s.keyRot.set(0, 0, -0.25);
    s.enter = 0;
    slide(0, 1.7, () => {
      gsap.to(s, { enter: 1, duration: 1, ease: 'power3.out' });
      s.mode = 'idle'; resolve(); onClosed?.();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [slide, onClosed]);

  const reset = useMemo(() => () => {
    const s = S.current;
    gsap.killTweensOf(s); gsap.killTweensOf(s.key); gsap.killTweensOf(s.keyRot);
    Object.assign(s, { mode: 'idle', keyAttached: 0, turn: 0, bolt: 0, fall: 0, door: 0, led: 0, near: 0, shake: 0, enter: 0 });
    s.key.copy(restPos()); s.keyRot.set(0, 0, -0.25);
    gsap.to(s, { enter: 1, duration: 1.1, ease: 'power3.out' });
    invalidate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidate]);

  useEffect(() => { ctrl.current = { unlock, close, reset }; return () => { ctrl.current = null; }; }, [ctrl, unlock, close, reset]);

  /* ── dragging ── */
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.3), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const el = gl.domElement;
    const move = (e) => {
      if (!dragging.current) return;
      if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 6) down.current.moved = true;
      const r = el.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        const s = S.current;
        s.key.set(hit.x, hit.y, 1.3);
        const d = Math.hypot(hit.x - HOLE.x, hit.y - HOLE.y);
        s.near = THREE.MathUtils.clamp(1 - d / (SNAP * 2.2), 0, 1);
        s.snap = d < SNAP;
      }
    };
    const up = () => {
      if (!dragging.current) return;
      dragging.current = false;
      const s = S.current;
      document.body.style.cursor = '';
      if (!down.current.moved || s.snap) { unlock(); return; }
      s.mode = 'idle';
      const p = restPos();
      gsap.to(s.key, { x: p.x, y: p.y, z: p.z, duration: 0.8, ease: 'elastic.out(1, 0.6)' });
      gsap.to(s, { near: 0, duration: 0.4 });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera, unlock, HOLE]);

  useEffect(() => {
    let raf = 0;
    const tick = () => { raf = requestAnimationFrame(tick); if (visible.current && !window.__introActive) invalidate(); };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [invalidate, visible]);

  // make sure the first frame after the layer is shown again actually renders
  useEffect(() => { invalidate(); }, [size.width, size.height, invalidate]);

  const fogSeeds = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ x: (i / 5 - 0.5) * 1.1, ph: i * 1.7, sc: 0.8 + (i % 3) * 0.35 })), []);

  useFrame(({ clock }) => {
    const s = S.current;
    const t = clock.elapsedTime;

    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(pointer.x * 0.35, pointer.y * 0.2, GH / 2 / tan);
    camera.lookAt(0, 0, 0);

    // subtle neon flicker
    const dip = Math.sin(t * 37) * Math.sin(t * 11.3) > 0.94 ? 0.5 : 1;
    const flick = (0.92 + Math.sin(t * 2.1) * 0.06) * dip;
    [matL, matR].forEach((m) => { m.emissiveIntensity = flick * (1 + s.led * 0.3); });
    neon.emissive.copy(colors.current.accent);
    neon.emissiveIntensity = 2.2 * flick + s.near * 1.6;

    // doors slide to opposite sides
    const travel = (W / 2 + 0.3) * s.door;
    const jolt = s.door > 0 && s.door < 0.08 ? Math.sin(t * 90) * 0.02 : 0;
    leftDoor.current.position.set(-W / 4 - travel + jolt, 0, 0);
    rightDoor.current.position.set(W / 4 + travel - jolt, 0, 0);
    spill.current.material.opacity = Math.min(1, s.door * 1.6) * 0.6;
    spill.current.material.color.copy(colors.current.light);
    spill.current.scale.set(Math.max(0.001, s.door * W * 0.9), GH * 1.15, 1);

    // lock
    const L = lockG.current;
    L.position.set(s.shake ? Math.sin(t * 90) * 0.04 : 0, LOCK_Y - s.fall * (GH * 1.2), LOCK_Z + s.fall * 1.2);
    L.rotation.set(s.fall * 0.9, 0, s.fall * 0.5);
    L.visible = s.fall < 0.995;
    boltL.current.position.x = -1.7 + s.bolt * 0.9;
    boltR.current.position.x = 1.7 - s.bolt * 0.9;
    ledMats.current.forEach((m, i) => {
      if (!m) return;
      const col = s.led > 0.5 ? '#3dff9a' : '#ff5a6a';
      m.color.set(col); m.emissive.set(col);
      m.emissiveIntensity = 1.3 + (i === 1 ? Math.sin(t * 6) * 0.5 : 0);
    });

    // key — themed metal
    keyMat.color.copy(colors.current.light).lerp(new THREE.Color('#ffffff'), 0.25);
    keyMat.emissive.copy(colors.current.accent);
    const K = keyG.current;
    K.rotation.order = 'YXZ';
    const base = narrow ? 0.85 : 1.15;
    if (s.mode === 'idle') {
      K.position.set(s.key.x, s.key.y + Math.sin(t * 1.5) * 0.14 * s.enter, s.key.z);
      K.rotation.set(0, Math.sin(t * 0.8) * 0.12, s.keyRot.z + Math.sin(t * 1.1) * 0.05);
    } else if (s.mode === 'drag') {
      K.position.copy(s.key);
      K.rotation.set(0, 0, -0.12);
    } else {
      K.position.copy(s.key);
      K.rotation.set(s.turn, s.keyRot.y, s.keyRot.z);
      if (s.keyAttached) { K.position.y -= s.fall * (GH * 1.2); K.position.z += s.fall * 1.2; K.rotation.x += s.fall * 0.9; }
    }
    K.visible = s.fall < 0.995;
    K.scale.setScalar(base * (0.001 + s.enter * 0.999));
    keyGlow.current.material.opacity = (s.mode === 'busy' ? 0 : 0.45 + Math.sin(t * 3) * 0.15 + s.near * 0.4) * s.enter;
    keyGlow.current.material.color.copy(colors.current.light);
    keyLabel.current.material.opacity = (s.mode === 'idle' ? 0.95 : 0) * s.enter;

    fog.current.forEach((f, i) => {
      if (!f) return;
      const sd = fogSeeds[i];
      f.position.set(sd.x * W + Math.sin(t * 0.25 + sd.ph) * 1.2, -GH / 2 + 0.7 + Math.sin(t * 0.4 + sd.ph) * 0.15, 0.9);
      f.material.opacity = 0.16 * (1 - s.door * 0.6);
      f.material.color.copy(colors.current.light);
    });
  });

  const doorGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const doorMats = (front) => [edge, edge, edge, edge, front, edge];

  return (
    <>
      <Env />
      <ambientLight intensity={0.1} />
      <pointLight position={[-W * 0.25, GH * 0.25, 8]} intensity={17} color="#ffffff" />
      <pointLight position={[W * 0.3, -GH * 0.2, 6]} intensity={10} color="#ffffff" />

      <mesh ref={spill} position={[0, 0, -0.4]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={leftDoor} geometry={doorGeo} material={doorMats(matL)} scale={[W / 2 + 0.04, GH, 0.5]} />
      <mesh ref={rightDoor} geometry={doorGeo} material={doorMats(matR)} scale={[W / 2 + 0.04, GH, 0.5]} />

      {/* circular access lock bridging the seam */}
      <group ref={lockG} position={[0, LOCK_Y, LOCK_Z]}>
        <mesh ref={boltL} position={[-1.7, 0, -0.2]} material={steel}><boxGeometry args={[1.9, 0.34, 0.26]} /></mesh>
        <mesh ref={boltR} position={[1.7, 0, -0.2]} material={steel}><boxGeometry args={[1.9, 0.34, 0.26]} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={steel}><cylinderGeometry args={[1.25, 1.25, 0.56, 48]} /></mesh>
        <mesh position={[0, 0, 0.29]} rotation={[Math.PI / 2, 0, 0]} material={dark}><cylinderGeometry args={[1.05, 1.05, 0.04, 48]} /></mesh>
        <mesh position={[0, 0, 0.325]} material={neon}><torusGeometry args={[0.82, 0.05, 12, 56]} /></mesh>
        <mesh position={[0, 0, 0.31]} material={dark}><circleGeometry args={[0.76, 40]} /></mesh>
        {/* status LEDs */}
        {[-0.34, 0, 0.34].map((x, i) => (
          <mesh key={i} position={[x, 0.95, 0.31]}>
            <boxGeometry args={[0.2, 0.09, 0.02]} />
            <meshStandardMaterial ref={(m) => { ledMats.current[i] = m; }} color="#ff5a6a" emissive="#ff5a6a" emissiveIntensity={1.3} />
          </mesh>
        ))}
        {/* keyhole */}
        <mesh position={[0, 0.12, 0.33]}><circleGeometry args={[0.13, 24]} /><meshBasicMaterial color="#000000" /></mesh>
        <mesh position={[0, -0.08, 0.33]}><boxGeometry args={[0.09, 0.36, 0.01]} /><meshBasicMaterial color="#000000" /></mesh>
        <mesh position={[0, -1.0, 0.31]} material={neon}><boxGeometry args={[0.9, 0.035, 0.02]} /></mesh>
      </group>

      {/* the key */}
      <group
        ref={keyG}
        onPointerOver={() => { if (S.current.mode === 'idle') document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { if (!dragging.current) document.body.style.cursor = ''; }}
        onPointerDown={(e) => {
          if (S.current.mode !== 'idle') return;
          e.stopPropagation();
          S.current.mode = 'drag'; S.current.snap = false;
          dragging.current = true;
          down.current = { x: e.clientX, y: e.clientY, moved: false };
          document.body.style.cursor = 'grabbing';
          gsap.killTweensOf(S.current.key);
        }}
      >
        <KeyModel
          mat={keyMat}
          glow={(
            <>
              <mesh ref={keyGlow} position={[0.1, 0, -0.35]} scale={[4.6, 3.4, 1]}>
                <circleGeometry args={[0.62, 32]} />
                <meshBasicMaterial map={glowTex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
              </mesh>
              <mesh ref={keyLabel} position={[0.1, 0.95, 0.1]}>
                <planeGeometry args={[2.6, 0.65]} />
                <meshBasicMaterial map={keyLabelTex} transparent opacity={0} depthWrite={false} toneMapped={false} />
              </mesh>
              <mesh><boxGeometry args={[3.4, 1.7, 1.2]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
            </>
          )}
        />
      </group>

      {fogSeeds.map((sd, i) => (
        <mesh key={i} ref={(m) => { fog.current[i] = m; }} scale={[5 * sd.sc, 2.2 * sd.sc, 1]} position={[0, -GH / 2, 0.9]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={fogTex} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};

const ProjectGate3D = forwardRef(function ProjectGate3D({ onBurst, onStart, onDoorsStart, onOpened, onClosed }, ref) {
  const { theme } = useTheme();
  const ctrl = useRef(null);
  const visible = useRef(false);
  const box = useRef(null);
  const [fontsKey, setFontsKey] = useState(0);

  useImperativeHandle(ref, () => ({
    unlock: () => (ctrl.current ? ctrl.current.unlock() : Promise.resolve()),
    close: () => (ctrl.current ? ctrl.current.close() : Promise.resolve()),
    reset: () => ctrl.current?.reset(),
  }), []);

  useEffect(() => {
    let live = true;
    Promise.all([document.fonts?.load('900 80px Orbitron'), document.fonts?.load('600 30px "Share Tech Mono"')])
      .then(() => { if (live) setFontsKey((k) => k + 1); }).catch(() => {});
    const el = box.current;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);
    return () => { live = false; io.disconnect(); document.body.style.cursor = ''; };
  }, []);

  return (
    <div ref={box} className="gate3d" aria-label="Sealed door. Drag the access key into the lock to open it.">
      <Boundary>
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ fov: 28, position: [0, 0, 20], near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene ctrl={ctrl} onBurst={onBurst} onStart={onStart} onDoorsStart={onDoorsStart} onOpened={onOpened} onClosed={onClosed}
            theme={theme} visible={visible} fontsKey={fontsKey} />
        </Canvas>
      </Boundary>
      <style>{`
        .gate3d { position:absolute; inset:0; }
        .gate3d canvas { touch-action:pan-y; }
      `}</style>
    </div>
  );
});

export default ProjectGate3D;
