import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaCss3Alt, FaJava, FaCode } from 'react-icons/fa';
import {
  SiHtml5, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs, SiExpress,
  SiSocketdotio, SiMongodb, SiPostgresql, SiC, SiPython, SiGit, SiGnubash, SiPostman, SiVercel,
  SiFirebase, SiGreensock, SiScikitlearn, SiPlotly, SiPandas,
} from 'react-icons/si';
import { categoriesData, GAME_SKILLS } from '../../data';
import { useTheme } from '../context/ThemeContext';
import Boundary from '../three/Boundary';
import { useLiveColors } from '../three/ashok3d';

/**
 * Skills as a 3D carousel: five glass panels on a ring, the chosen one faces you.
 * Every skill is its own raised tile (real geometry) that lifts when you hover it.
 * Drag to spin the ring, or use the arrows / category chips.
 */

const LOGOS = {
  'HTML': SiHtml5, 'CSS': FaCss3Alt, 'JavaScript': SiJavascript, 'TypeScript': SiTypescript, 'React': SiReact,
  'Next.js': SiNextdotjs, 'Tailwind CSS': SiTailwindcss, 'React Native': SiReact,
  'Node.js': SiNodedotjs, 'Express': SiExpress, 'Socket.IO': SiSocketdotio, 'MongoDB': SiMongodb, 'PostgreSQL': SiPostgresql,
  'C': SiC, 'Python': SiPython, 'Java': FaJava,
  'Machine Learning': SiScikitlearn, 'Data Visualization': SiPlotly, 'Data Analysis': SiPandas,
  'Git': SiGit, 'GitBash': SiGnubash, 'VS Code': FaCode, 'Postman': SiPostman, 'Vercel': SiVercel,
  'Firebase': SiFirebase, 'GSAP': SiGreensock,
};
const BRAND = Object.fromEntries(GAME_SKILLS.map((s) => [s.name, s.color]));
const BLURB = {
  frontend: 'Interfaces, motion and 3D on the web',
  backend: 'APIs, real-time and data layers',
  languages: 'The foundations everything else sits on',
  ai: 'Turning data into decisions',
  tools: 'The workflow that ships it',
};

const N = categoriesData.length;
const STEP = (Math.PI * 2) / N;
const PW = 5.6, PH = 2.55, R = 6.2;           // panel width / height / ring radius
const TW = 1.14, TH = 0.5, COLS = 4;          // tile size, columns per row

const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};

/** draw a react-icons / lucide component onto a canvas (async, then flag the texture) */
const drawIcon = (ctx, Icon, x, y, size, color, tex) => {
  try {
    let svg = renderToStaticMarkup(<Icon size={size * 2} color={color} />);
    if (!svg.includes('xmlns=')) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, x, y, size, size); tex.needsUpdate = true; };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch { /* icon is optional */ }
};

const finish = (canvas) => {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const makeTile = (label, Icon, brand) => {
  const W = 512, H = 224;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const accent = css('--color-accent', '#1abc9c');
  const text = css('--color-text-primary', '#f5f5f7');
  const bg = css('--color-bg-elevated', '#252538');
  rr(ctx, 4, 4, W - 8, H - 8, 40);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, bg); g.addColorStop(1, css('--color-bg-sunken', '#16162a'));
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = accent; ctx.globalAlpha = 0.55; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = text;
  let size = 46;
  ctx.font = `700 ${size}px Inter, "Segoe UI", sans-serif`;
  while (ctx.measureText(label).width > W - 190 && size > 24) { size -= 2; ctx.font = `700 ${size}px Inter, "Segoe UI", sans-serif`; }
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(label, 150, H / 2 + 3);
  const tex = finish(c);
  drawIcon(ctx, Icon, 46, H / 2 - 38, 76, brand, tex);
  return tex;
};

const makeHeader = (cat) => {
  const W = 1400, H = 330;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const accent = css('--color-accent', '#1abc9c');
  const text = css('--color-text-primary', '#f5f5f7');
  const muted = css('--color-text-secondary', '#a0a0b0');
  rr(ctx, 56, 62, 150, 150, 36);
  ctx.fillStyle = css('--color-accent-subtle', 'rgba(26,188,156,.08)'); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = accent; ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = text; ctx.font = '900 88px Orbitron, Inter, sans-serif';
  ctx.fillText(cat.name, 250, 150);
  ctx.fillStyle = muted; ctx.font = '500 40px Inter, "Segoe UI", sans-serif';
  ctx.fillText(BLURB[cat.id] || '', 252, 214);
  ctx.textAlign = 'right'; ctx.fillStyle = accent; ctx.globalAlpha = 0.9; ctx.font = '900 120px Orbitron, Inter, sans-serif';
  ctx.fillText(String(cat.skills.length).padStart(2, '0'), W - 56, 170);
  const tex = finish(c);
  drawIcon(ctx, cat.icon, 56 + 37, 62 + 37, 76, accent, tex);
  return tex;
};

/* ───────────── a raised skill tile ───────────── */
const Tile = ({ name, tex, x, y, hovered, colors }) => {
  const g = useRef();
  const body = useRef();
  const lift = useRef(0);
  const brand = useMemo(() => new THREE.Color(BRAND[name] || '#1abc9c'), [name]);

  useFrame((_, dt) => {
    const on = hovered.current === name ? 1 : 0;
    lift.current += (on - lift.current) * Math.min(1, dt * 10);
    g.current.position.z = 0.12 + lift.current * 0.42;
    g.current.scale.setScalar(1 + lift.current * 0.1);
    body.current.material.emissive.copy(colors.current.accent).lerp(brand, lift.current);
    body.current.material.emissiveIntensity = 0.08 + lift.current * 0.7;
  });

  return (
    <group
      ref={g}
      position={[x, y, 0.12]}
      onPointerOver={(e) => { e.stopPropagation(); hovered.current = name; document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { if (hovered.current === name) hovered.current = null; document.body.style.cursor = ''; }}
    >
      <RoundedBox ref={body} args={[TW, TH, 0.12]} radius={0.07} smoothness={4}>
        <meshStandardMaterial color={colors.current.accent} metalness={0.2} roughness={0.5} emissive={colors.current.accent} emissiveIntensity={0.08} />
      </RoundedBox>
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[TW - 0.02, TH - 0.02]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ───────────── a category panel ───────────── */
const Panel = ({ cat, i, ringRot, textures, hovered, colors, bg }) => {
  const g = useRef();
  const dim = useRef();
  const a = i * STEP;

  const tiles = useMemo(() => {
    const out = [];
    const rows = Math.ceil(cat.skills.length / COLS);
    for (let r = 0; r < rows; r++) {
      const inRow = Math.min(COLS, cat.skills.length - r * COLS);
      for (let c = 0; c < inRow; c++) {
        const name = cat.skills[r * COLS + c];
        const rowW = inRow * TW + (inRow - 1) * 0.12;
        out.push({ name, x: -rowW / 2 + TW / 2 + c * (TW + 0.12), y: -0.12 - r * (TH + 0.14) });
      }
    }
    return out;
  }, [cat]);

  useFrame(() => {
    // 1 when this panel faces the camera, 0 a full step away
    let d = ((ringRot.current + a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    d = Math.abs(d);
    const focus = THREE.MathUtils.clamp(1 - d / STEP, 0, 1);
    dim.current.material.opacity = (1 - focus) * 0.7;
    const s = 0.9 + focus * 0.1;
    g.current.scale.setScalar(s);
  });

  return (
    <group position={[Math.sin(a) * R, 0, Math.cos(a) * R]} rotation={[0, a, 0]}>
      <group ref={g}>
        <RoundedBox args={[PW, PH, 0.2]} radius={0.16} smoothness={5}>
          <meshStandardMaterial color={bg} metalness={0.35} roughness={0.55} />
        </RoundedBox>
        <mesh position={[0, PH / 2 - 0.62, 0.105]}>
          <planeGeometry args={[PW - 0.3, (PW - 0.3) * (330 / 1400)]} />
          <meshBasicMaterial map={textures.header} transparent toneMapped={false} />
        </mesh>
        {tiles.map((t) => (
          <Tile key={t.name} name={t.name} tex={textures.tiles[t.name]} x={t.x} y={t.y} hovered={hovered} colors={colors} />
        ))}
        <mesh ref={dim} position={[0, 0, 0.7]} raycast={() => null}>
          <planeGeometry args={[PW + 0.3, PH + 0.3]} />
          <meshBasicMaterial color="#0a0a14" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

/* ───────────── the ring ───────────── */
const Ring = ({ index, onIndex, theme, active, texKey }) => {
  const { gl, camera, size } = useThree();
  const invalidate = useThree((s) => s.invalidate);
  const ring = useRef();
  const ringRot = useRef(0);
  const target = useRef(0);
  const drag = useRef({ on: false, x: 0, y: 0, off: 0, moved: false });
  const hovered = useRef(null);
  const enter = useRef(0);
  const lights = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const colors = useLiveColors(theme);

  const textures = useMemo(() => {
    void texKey;
    const tiles = {};
    categoriesData.forEach((c) => c.skills.forEach((s) => { tiles[s] = makeTile(s, LOGOS[s] || FaCode, BRAND[s] || css('--color-accent', '#1abc9c')); }));
    const header = {};
    categoriesData.forEach((c) => { header[c.id] = makeHeader(c); });
    return { tiles, header };
  }, [texKey]);
  const bg = useMemo(() => { void texKey; return new THREE.Color(css('--color-bg-sunken', '#16162a')); }, [texKey]);
  useEffect(() => () => {
    Object.values(textures.tiles).forEach((t) => t.dispose());
    Object.values(textures.header).forEach((t) => t.dispose());
  }, [textures]);

  // keep the ring on the shortest path to the chosen panel
  useEffect(() => {
    const base = -index * STEP;
    target.current = base + Math.round((ringRot.current - base) / (Math.PI * 2)) * Math.PI * 2;
  }, [index]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'pan-y';
    const down = (e) => { drag.current = { on: true, x: e.clientX, y: e.clientY, off: 0, moved: false, base: target.current }; };
    const move = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      const d = drag.current;
      if (!d.on) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { d.moved = true; el.setPointerCapture?.(e.pointerId); }
      if (d.moved) target.current = d.base + dx * 0.0075;
    };
    const up = () => {
      const d = drag.current;
      if (!d.on) return;
      d.on = false;
      if (d.moved) {
        const next = ((Math.round(-target.current / STEP) % N) + N) % N;
        onIndex(next);
        const base = -next * STEP;
        target.current = base + Math.round((target.current - base) / (Math.PI * 2)) * Math.PI * 2;
      }
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [gl, onIndex]);

  useEffect(() => {
    let raf = 0;
    const tick = () => { raf = requestAnimationFrame(tick); if (active.current && !window.__introActive) invalidate(); };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [invalidate, active]);

  useFrame((_, dt) => {
    if (active.current) enter.current = Math.min(1, enter.current + dt / 1.4);
    const e = 1 - Math.pow(1 - enter.current, 3);
    ringRot.current += (target.current - ringRot.current) * Math.min(1, dt * 5.5);
    ring.current.rotation.y = ringRot.current + (1 - e) * 1.2;
    ring.current.scale.setScalar(0.7 + 0.3 * e);

    const aspect = size.width / size.height;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max((PW * 1.06) / (2 * tan * aspect), (PH * 1.55) / (2 * tan));
    camera.position.set(mouse.current.x * 0.5, 0.35 + mouse.current.y * 0.25, R + dist);
    camera.lookAt(0, -0.05, R);
    lights.current.position.set(mouse.current.x * 6, mouse.current.y * 3 + 2, R + 7);
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight ref={lights} intensity={110} color="#ffffff" />
      <pointLight position={[-6, 3, R + 4]} intensity={45} color="#ffffff" />
      <group ref={ring}>
        {categoriesData.map((cat, i) => (
          <Panel key={cat.id} cat={cat} i={i} ringRot={ringRot} textures={{ tiles: textures.tiles, header: textures.header[cat.id] }} hovered={hovered} colors={colors} bg={bg} />
        ))}
      </group>
    </>
  );
};

/* ───────────── component ───────────── */
const Skills3D = () => {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [texKey, setTexKey] = useState(0);
  const active = useRef(false);
  const paused = useRef(false);
  const box = useRef(null);

  // regenerate canvases when the theme changes or once the display font has loaded
  useEffect(() => {
    const id = requestAnimationFrame(() => setTexKey((k) => k + 1));
    return () => cancelAnimationFrame(id);
  }, [theme]);
  useEffect(() => {
    let live = true;
    document.fonts?.load('900 48px Orbitron').then(() => { if (live) setTexKey((k) => k + 1); }).catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const el = box.current;
    const io = new IntersectionObserver(([e]) => { active.current = e.isIntersecting; }, { threshold: 0.15 });
    io.observe(el);
    const timer = setInterval(() => { if (active.current && !paused.current) setIndex((i) => (i + 1) % N); }, 6000);
    return () => { io.disconnect(); clearInterval(timer); };
  }, []);

  const go = useCallback((i) => setIndex(((i % N) + N) % N), []);

  return (
    <div className="s3">
      <div
        ref={box}
        className="s3-stage"
        onPointerEnter={() => { paused.current = true; }}
        onPointerLeave={() => { paused.current = false; }}
        aria-label="3D skills carousel — drag to rotate"
      >
        <Boundary>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{ fov: 36, position: [0, 0.3, 14], near: 0.1, far: 80 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Ring index={index} onIndex={go} theme={theme} active={active} texKey={texKey} />
          </Canvas>
        </Boundary>
        <button className="s3-arrow s3-prev" onClick={() => go(index - 1)} aria-label="Previous category"><ChevronLeft size={20} /></button>
        <button className="s3-arrow s3-next" onClick={() => go(index + 1)} aria-label="Next category"><ChevronRight size={20} /></button>
      </div>

      <div className="s3-tabs" role="tablist">
        {categoriesData.map((c, i) => {
          const Icon = c.icon;
          return (
            <button key={c.id} role="tab" aria-selected={index === i} className={`s3-tab${index === i ? ' on' : ''}`} onClick={() => go(i)}>
              <Icon size={14} />{c.name}
            </button>
          );
        })}
      </div>
      <p className="s3-hint">Drag the ring · hover a tile</p>

      <style>{`
        .s3 { position:relative; max-width:1240px; margin:0 auto; }
        .s3-stage { position:relative; width:100%; height:clamp(340px, 46vw, 560px); cursor:grab; }
        .s3-stage:active { cursor:grabbing; }
        .s3-stage::before { content:''; position:absolute; inset:6% 10%; border-radius:50%; pointer-events:none;
          background:radial-gradient(ellipse, var(--color-accent-muted), transparent 68%); }
        .s3-stage canvas { position:relative; }
        .s3-arrow { position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
          color:var(--color-accent); background:var(--color-bg-glass); border:1px solid var(--color-border-strong); backdrop-filter:blur(8px); transition:all .25s; z-index:2; }
        .s3-arrow:hover { background:var(--color-accent); color:var(--color-bg-primary); box-shadow:var(--shadow-accent); }
        .s3-prev { left:clamp(0px,1vw,12px); } .s3-next { right:clamp(0px,1vw,12px); }
        .s3-tabs { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:14px; }
        .s3-tab { display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:10px 18px; border-radius:var(--radius-full);
          font-family:var(--font-mono); font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; color:var(--color-text-secondary);
          background:var(--color-bg-glass); border:1px solid var(--color-border); transition:all .25s; }
        .s3-tab svg { color:var(--color-accent); }
        .s3-tab:hover { border-color:var(--color-accent-border); color:var(--color-text-primary); transform:translateY(-2px); }
        .s3-tab.on { color:var(--color-bg-primary); background:linear-gradient(135deg,var(--color-accent-dark),var(--color-accent)); border-color:var(--color-accent-light); box-shadow:var(--shadow-accent); }
        .s3-tab.on svg { color:var(--color-bg-primary); }
        .s3-hint { text-align:center; margin:14px 0 0; font-family:var(--font-mono); font-size:.6rem; letter-spacing:.3em; text-transform:uppercase; color:var(--color-text-muted); }
        @media (max-width:640px) { .s3-arrow { display:none; } .s3-stage { height:clamp(260px, 62vw, 340px); } }
      `}</style>
    </div>
  );
};

export default Skills3D;
