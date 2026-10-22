import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import './projectUI.css';

/**
 * Immersive project space. Every project becomes a thick glass slab with floating layers
 * (cover → title → tech chips at different depths) hovering in a neon void.
 * The slabs are generated from the project list – adding a project adds a slab.
 *
 *   layout="flow"  cover-flow: focused slab in front, the rest fan out to the sides and back (never hidden)
 *   layout="ring"  the slabs sit on a ring around you and the ring turns to the one you pick
 *
 * Mouse = look around + tilt the slab, arrows / swipe / dots = travel, click = focus, click again = open.
 */

const PW = 4.4, PH = 2.75, DEPTH = 0.2;
const TEX_W = 768, TEX_H = Math.round((1024 * PH) / PW);

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};
const wrapText = (ctx, text, maxW) => {
  const lines = []; let line = '';
  text.split(' ').forEach((w) => {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  });
  if (line) lines.push(line);
  return lines;
};
const fonts = () => {
  const cs = getComputedStyle(document.documentElement);
  const f = (n, d) => cs.getPropertyValue(n).trim() || d;
  return { display: f('--font-display', 'sans-serif'), mono: f('--font-mono', 'monospace') };
};

const BAND = TEX_H * 0.42;

/** layer 0 – the slab face: cover, grid, number, frame */
const paintBase = (c, p, img) => {
  const ctx = c.getContext('2d'); const ft = fonts();
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  const g = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  g.addColorStop(0, '#141836'); g.addColorStop(1, '#06070f');
  ctx.fillStyle = g; rr(ctx, 0, 0, TEX_W, TEX_H, 30); ctx.fill();
  ctx.save(); rr(ctx, 0, 0, TEX_W, TEX_H, 30); ctx.clip();
  const bg = ctx.createLinearGradient(0, 0, TEX_W, BAND);
  bg.addColorStop(0, p.accent + '88'); bg.addColorStop(1, '#06070f');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, TEX_W, BAND);
  if (img) {
    const s = Math.max(TEX_W / img.width, BAND / img.height);
    ctx.globalAlpha = 0.9; ctx.drawImage(img, (TEX_W - img.width * s) / 2, (BAND - img.height * s) / 2, img.width * s, img.height * s); ctx.globalAlpha = 1;
  } else {
    ctx.strokeStyle = p.accent + '44'; ctx.lineWidth = 1;
    for (let x = 0; x <= TEX_W; x += 46) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, BAND); ctx.stroke(); }
    for (let y = 0; y <= BAND; y += 46) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TEX_W, y); ctx.stroke(); }
    ctx.font = `900 ${BAND * 0.9}px ${ft.display}`; ctx.fillStyle = p.accent + '40'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(p.num, TEX_W - 34, BAND * 0.55);
  }
  const fade = ctx.createLinearGradient(0, BAND * 0.5, 0, BAND);
  fade.addColorStop(0, 'rgba(6,7,15,0)'); fade.addColorStop(1, '#06070f');
  ctx.fillStyle = fade; ctx.fillRect(0, 0, TEX_W, BAND);
  // scan lines
  ctx.fillStyle = 'rgba(255,255,255,.025)';
  for (let y = 0; y < TEX_H; y += 6) ctx.fillRect(0, y, TEX_W, 2);
  ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = p.accent + 'dd'; rr(ctx, 3, 3, TEX_W - 6, TEX_H - 6, 28); ctx.stroke();
  // corner ticks
  ctx.lineWidth = 4; ctx.strokeStyle = '#ffffffaa';
  [[22, 22, 1, 1], [TEX_W - 22, TEX_H - 22, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(x, y + 34 * sy); ctx.lineTo(x, y); ctx.lineTo(x + 34 * sx, y); ctx.stroke();
  });
};

/** layer 1 – title block, floats in front of the face */
const paintTitle = (c, p, total) => {
  const ctx = c.getContext('2d'); const ft = fonts();
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let y = BAND + 60;
  if (p.tag) {
    ctx.font = `26px ${ft.mono}`; ctx.fillStyle = p.accent; ctx.shadowColor = p.accent; ctx.shadowBlur = 8;
    ctx.fillText(p.tag.toUpperCase().split('').join(' '), 52, y); y += 66;
  }
  ctx.shadowColor = p.accent; ctx.shadowBlur = 12;
  ctx.font = `900 64px ${ft.display}`; ctx.fillStyle = '#ffffff';
  wrapText(ctx, p.title, TEX_W - 104).slice(0, 2).forEach((l) => { ctx.fillText(l, 52, y); y += 74; });
  ctx.shadowBlur = 0;
  ctx.font = `24px ${ft.mono}`; ctx.fillStyle = '#9ca0c2';
  ctx.fillText(p.short.toUpperCase().slice(0, 46), 52, y);
  ctx.textAlign = 'right'; ctx.font = `22px ${ft.mono}`; ctx.fillStyle = '#7479a0';
  ctx.fillText(`${p.num} / ${String(total).padStart(2, '0')}`, TEX_W - 52, 48);
};

/** layer 2 – tech chips, floats furthest out */
const paintChips = (c, p) => {
  const ctx = c.getContext('2d'); const ft = fonts();
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.font = `25px ${ft.mono}`; ctx.textBaseline = 'alphabetic';
  const cy = TEX_H - 58; let x = 52;
  if (!p.tech.length) { ctx.fillStyle = '#7479a0'; ctx.fillText('CASE FILE COMING SOON', 52, cy + 4); return; }
  for (const t of p.tech.slice(0, 5)) {
    const w = ctx.measureText(t).width + 38;
    if (x + w > TEX_W - 52) break;
    ctx.shadowColor = p.accent; ctx.shadowBlur = 8;
    ctx.fillStyle = '#0b0d1fdd'; rr(ctx, x, cy - 32, w, 50, 14); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = p.accent; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = '#eef0ff'; ctx.fillText(t, x + 19, cy + 3);
    x += w + 14;
  }
};

const makeTex = () => {
  const c = document.createElement('canvas'); c.width = TEX_W; c.height = TEX_H;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

const glowTex = (() => {
  let t;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c); return t;
  };
})();

/* where a slab sits relative to the focused one */
const flowTarget = (d) => {
  const a = Math.abs(d), s = Math.sign(d);
  return { x: a ? s * (4.6 + (a - 1) * 2.1) : 0, z: a ? -(2.4 + (a - 1) * 1.5) : 0, ry: -Math.max(-1, Math.min(1, d)) * 0.62, y: 0 };
};

const Panel = ({ project, index, total, focus, layout, onSelect }) => {
  const root = useRef();
  const tilt = useRef();
  const halo = useRef();
  const edge = useRef();
  const shade = useRef([]);
  const ang = useRef(null);
  const [hover, setHover] = useState(false);
  const focused = index === focus;

  const radius = Math.max(6.2, (total * (PW + 0.7)) / (Math.PI * 2));
  const step = (Math.PI * 2) / total;

  const tex = useMemo(() => [makeTex(), makeTex(), makeTex()], []);
  useEffect(() => {
    let img = null; let dead = false;
    const draw = () => {
      paintBase(tex[0].image, project, img); paintTitle(tex[1].image, project, total); paintChips(tex[2].image, project);
      tex.forEach((t) => { t.needsUpdate = true; });
    };
    draw();
    document.fonts?.ready.then(() => { if (!dead) draw(); });
    if (project.image) {
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => { img = im; if (!dead) draw(); };
      im.src = project.image;
    }
    return () => { dead = true; };
  }, [tex, project, total]);
  useEffect(() => () => tex.forEach((t) => t.dispose()), [tex]);
  useEffect(() => { document.body.style.cursor = hover ? 'pointer' : ''; return () => { document.body.style.cursor = ''; }; }, [hover]);

  const white = useMemo(() => new THREE.Color(1, 1, 1), []);
  const dim = useMemo(() => new THREE.Color(0.38, 0.4, 0.5), []);

  useFrame(({ clock, pointer }, dt) => {
    const g = root.current; if (!g) return;
    const t = clock.elapsedTime + index * 1.7;
    let d = index - focus;
    let tx, tz, try_, ty = 0;
    if (layout === 'ring') {
      d = ((((d + total / 2) % total) + total) % total) - total / 2;
      const target = d * step;
      if (ang.current == null) ang.current = target;
      ang.current = THREE.MathUtils.damp(ang.current, target, 3.2, dt);
      tx = Math.sin(ang.current) * radius; tz = Math.cos(ang.current) * radius - radius; try_ = ang.current;
    } else {
      const f = flowTarget(d); tx = f.x; tz = f.z; try_ = f.ry; ty = f.y;
    }
    const k = layout === 'ring' ? 100 : 3.4;
    if (layout === 'ring') { g.position.set(tx, ty, tz); g.rotation.y = try_; }
    else {
      g.position.x = THREE.MathUtils.damp(g.position.x, tx, k, dt);
      g.position.z = THREE.MathUtils.damp(g.position.z, tz, k, dt);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, try_, k, dt);
    }
    g.position.y = ty + Math.sin(t * 0.8) * 0.1;
    const sc = THREE.MathUtils.damp(g.scale.x, focused ? 1.08 : hover ? 1.04 : 0.94, 6, dt);
    g.scale.setScalar(sc);

    // focused slab leans toward the cursor – the floating layers shift with it (parallax)
    const tr = tilt.current;
    tr.rotation.y = THREE.MathUtils.damp(tr.rotation.y, focused ? pointer.x * 0.28 : 0, 5, dt);
    tr.rotation.x = THREE.MathUtils.damp(tr.rotation.x, focused ? -pointer.y * 0.2 : 0, 5, dt);

    const c = focused || hover ? white : dim;
    shade.current.forEach((m) => m && m.color.lerp(c, Math.min(1, dt * 6)));
    if (halo.current) halo.current.material.opacity = THREE.MathUtils.damp(halo.current.material.opacity, focused ? 0.55 : 0.16, 5, dt);
    if (edge.current) edge.current.emissiveIntensity = THREE.MathUtils.damp(edge.current.emissiveIntensity, focused ? 1.6 : 0.35, 5, dt);
  });

  const click = (e) => { if (e.delta > 6) return; e.stopPropagation(); onSelect(index); };
  const over = (e) => { e.stopPropagation(); setHover(true); };

  return (
    <group ref={root}>
      <sprite ref={halo} scale={[PW * 2, PH * 2.3, 1]} position={[0, 0, -0.4]}>
        <spriteMaterial map={glowTex()} color={project.accent} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group ref={tilt}>
        <RoundedBox args={[PW + 0.16, PH + 0.16, DEPTH]} radius={0.1} smoothness={4}>
          <meshStandardMaterial ref={edge} color="#0a0c1c" metalness={0.7} roughness={0.25} emissive={project.accent} emissiveIntensity={0.35} />
        </RoundedBox>
        <mesh position={[0, 0, DEPTH / 2 + 0.01]} onClick={click} onPointerOver={over} onPointerOut={() => setHover(false)}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial ref={(m) => { shade.current[0] = m; }} map={tex[0]} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, DEPTH / 2 + 0.35]} onClick={click} onPointerOver={over} onPointerOut={() => setHover(false)}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial ref={(m) => { shade.current[1] = m; }} map={tex[1]} toneMapped={false} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, DEPTH / 2 + 0.7]} onClick={click} onPointerOver={over} onPointerOut={() => setHover(false)}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial ref={(m) => { shade.current[2] = m; }} map={tex[2]} toneMapped={false} transparent depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

/** wireframe rings drifting behind everything – pure atmosphere */
const Rings = ({ layout }) => {
  const a = useRef(); const b = useRef();
  useFrame((_, dt) => { a.current.rotation.z += dt * 0.1; a.current.rotation.x += dt * 0.04; b.current.rotation.z -= dt * 0.07; b.current.rotation.y += dt * 0.05; });
  const z = layout === 'ring' ? -16 : -14;
  return (
    <group position={[0, 0.5, z]}>
      <mesh ref={a}><torusGeometry args={[9, 0.025, 8, 120]} /><meshBasicMaterial color="#6d8bff" transparent opacity={0.35} /></mesh>
      <mesh ref={b}><torusGeometry args={[12.5, 0.02, 8, 120]} /><meshBasicMaterial color="#c36bff" transparent opacity={0.25} /></mesh>
    </group>
  );
};

const Rig = () => {
  const { camera, pointer, viewport } = useThree();
  useFrame((_, dt) => {
    // narrow screens pull the camera back so the slab still fits
    const dist = 7 + Math.max(0, 1.5 - viewport.aspect) * 4.5;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 1.6, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.5 + pointer.y * 0.9, 2.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, dist, 2.5, dt);
    camera.lookAt(0, 0, -1);
  });
  return null;
};

const Scene = ({ projects, focus, layout, onSelect }) => (
  <>
    <color attach="background" args={['#04050c']} />
    <directionalLight position={[2, 3, 6]} intensity={1.4} />
    <fog attach="fog" args={['#04050c', 12, 38]} />
    <ambientLight intensity={0.7} />
    <gridHelper args={[70, 70, '#3b4cff', '#1a2160']} position={[0, -2.6, -8]} />
    <Rings layout={layout} />
    {projects.map((p, i) => (
      <Panel key={p.id} project={p} index={i} total={projects.length} focus={focus} layout={layout} onSelect={onSelect} />
    ))}
    <Rig />
  </>
);

const ProjectSpace3D = ({ projects, focus, onFocus, onOpen, layout = 'flow', label = 'Project space' }) => {
  const down = useRef(null);
  const box = useRef(null);
  const [live, setLive] = useState(false);
  const n = projects.length;
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: '120px' });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);
  const go = (d) => onFocus(layout === 'ring' ? (focus + d + n) % n : Math.min(n - 1, Math.max(0, focus + d)));
  const select = (i) => { if (i === focus) onOpen(projects[i]); else onFocus(i); };

  return (
    <div
      ref={box} className="ps-wrap" tabIndex={0} aria-label={`${label} – 3D`}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'Enter') onOpen(projects[focus]); }}
      onPointerDown={(e) => { down.current = e.clientX; }}
      onPointerUp={(e) => {
        if (down.current == null) return;
        const dx = e.clientX - down.current; down.current = null;
        if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1);
      }}
    >
      <Canvas frameloop={live ? 'always' : 'never'} camera={{ position: [0, 0.5, 7], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Scene projects={projects} focus={focus} layout={layout} onSelect={select} />
      </Canvas>

      <p className="ps-title"><b />{label} · {n} online</p>
      <div className="ps-hud">
        <span className="ps-hint">move mouse to look · swipe / arrows to travel · click a slab, click again to open</span>
        <div className="ps-nav">
          <div className="ps-dots">{projects.map((p, i) => <i key={p.id} className={i === focus ? 'on' : ''} onClick={() => onFocus(i)} />)}</div>
          <button className="ps-btn" onClick={() => go(-1)} disabled={layout !== 'ring' && focus === 0} aria-label="Previous project"><ChevronLeft size={18} /></button>
          <span className="ps-count">{String(focus + 1).padStart(2, '0')}<small> / {String(n).padStart(2, '0')}</small></span>
          <button className="ps-btn" onClick={() => go(1)} disabled={layout !== 'ring' && focus === n - 1} aria-label="Next project"><ChevronRight size={18} /></button>
          <button className="ps-btn ps-open" onClick={() => onOpen(projects[focus])} aria-label="Open details"><Maximize2 size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSpace3D;
