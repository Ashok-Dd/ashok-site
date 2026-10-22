import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { renderToStaticMarkup } from 'react-dom/server';
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

const PW = 5.8, PH = 3.625, DEPTH = 0.24;
const TEX_W = 768, TEX_H = Math.round((TEX_W * PH) / PW);   // layout units; the canvas is drawn K× denser for sharpness
const K = 1.4;

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

const PAD = 60;                       // keeps text and pills well inside the edge
const BAND = TEX_H * 0.46;
const seeded = (n) => { let x = n; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; };

/** cover artwork: neon horizon grid, orbit rings, a glowing project glyph and drifting marks */
const paintArt = (ctx, p, icon) => {
  const W = TEX_W, H = BAND;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, p.accent + '70'); base.addColorStop(0.55, '#0a0d1e'); base.addColorStop(1, '#070914');
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);

  const cx = W * 0.72, cy = H * 0.5;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 1.1);
  glow.addColorStop(0, p.accent + 'aa'); glow.addColorStop(0.45, p.accent + '30'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // perspective grid floor running to the horizon
  const hy = H * 0.62;
  ctx.strokeStyle = p.accent + '55'; ctx.lineWidth = 1.5;
  for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 9, hy); ctx.lineTo(cx + i * 120, H); ctx.stroke(); }
  for (let k = 0; k < 8; k++) { const y = hy + (H - hy) * Math.pow(k / 7, 1.7); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const fadeFloor = ctx.createLinearGradient(0, hy, 0, hy + 20);
  fadeFloor.addColorStop(0, 'rgba(10,13,30,1)'); fadeFloor.addColorStop(1, 'rgba(10,13,30,0)');
  ctx.fillStyle = fadeFloor; ctx.fillRect(0, hy - 2, W, 22);

  // orbit rings
  ctx.lineWidth = 2;
  [[70, 0.9], [104, 0.55], [140, 0.3]].forEach(([r, al], i) => {
    ctx.strokeStyle = p.accent; ctx.globalAlpha = al; ctx.setLineDash(i === 1 ? [10, 14] : i === 2 ? [3, 12] : []);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  // satellites on the rings
  [[70, 0.8], [104, 3.4], [140, 5.4]].forEach(([r, a], i) => {
    ctx.fillStyle = i ? '#ffffff' : p.accent; ctx.shadowColor = p.accent; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 5 - i, 0, Math.PI * 2); ctx.fill();
  }); ctx.shadowBlur = 0;

  // glyph badge
  ctx.fillStyle = 'rgba(8,10,24,0.72)'; ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.shadowColor = p.accent; ctx.shadowBlur = 22; ctx.stroke(); ctx.shadowBlur = 0;
  if (icon) { ctx.shadowColor = p.accent; ctx.shadowBlur = 16; ctx.drawImage(icon, cx - 30, cy - 30, 60, 60); ctx.shadowBlur = 0; }

  // drifting marks
  const R = seeded(p.num.length * 97 + (p.title.charCodeAt(0) || 7));
  for (let i = 0; i < 26; i++) {
    const x = R() * W, y = R() * H * 0.62, sz = 1.5 + R() * 2.5;
    ctx.fillStyle = i % 4 ? 'rgba(255,255,255,0.45)' : p.accent; ctx.fillRect(x, y, sz, sz);
    if (i % 7 === 0) { ctx.strokeStyle = p.accent + 'aa'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke(); }
  }
  // ghost number
  const ft = fonts();
  ctx.font = `900 ${H * 0.95}px ${ft.display}`; ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(p.num, 28, H * 0.54);
  // fade into the body
  const fade = ctx.createLinearGradient(0, H * 0.62, 0, H);
  fade.addColorStop(0, 'rgba(7,9,20,0)'); fade.addColorStop(1, '#070914');
  ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);
  ctx.restore();
};

/** layer 0 – the slab face: artwork, glass body, frame */
const paintBase = (c, p, img, icon) => {
  const ctx = c.getContext('2d');
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  const g = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  g.addColorStop(0, '#131733'); g.addColorStop(1, '#06070f');
  ctx.fillStyle = g; rr(ctx, 0, 0, TEX_W, TEX_H, 30); ctx.fill();

  ctx.save(); rr(ctx, 0, 0, TEX_W, TEX_H, 30); ctx.clip();
  if (img) {
    const sc = Math.max(TEX_W / img.width, BAND / img.height);
    ctx.drawImage(img, (TEX_W - img.width * sc) / 2, (BAND - img.height * sc) / 2, img.width * sc, img.height * sc);
    const fade = ctx.createLinearGradient(0, BAND * 0.55, 0, BAND);
    fade.addColorStop(0, 'rgba(6,7,15,0)'); fade.addColorStop(1, '#06070f');
    ctx.fillStyle = fade; ctx.fillRect(0, 0, TEX_W, BAND);
  } else paintArt(ctx, p, icon);

  // body: soft accent wash from the bottom + faint scanlines
  const body = ctx.createLinearGradient(0, BAND, 0, TEX_H);
  body.addColorStop(0, 'rgba(255,255,255,0.0)'); body.addColorStop(1, p.accent + '22');
  ctx.fillStyle = body; ctx.fillRect(0, BAND, TEX_W, TEX_H - BAND);
  ctx.fillStyle = 'rgba(255,255,255,0.022)';
  for (let y = 0; y < TEX_H; y += 5) ctx.fillRect(0, y, TEX_W, 1.5);
  // holographic sheen
  const sheen = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  sheen.addColorStop(0.28, 'rgba(255,255,255,0)'); sheen.addColorStop(0.4, 'rgba(255,255,255,0.09)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.restore();
};

/** layer 1 – title block, floats in front of the face */
const paintTitle = (c, p, total) => {
  const ctx = c.getContext('2d'); const ft = fonts();
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.textBaseline = 'alphabetic';

  // tag pill + counter
  const tag = (p.tag || 'Project').toUpperCase();
  ctx.font = `600 22px ${ft.mono}`;
  const tw = ctx.measureText(tag.split('').join(' ')).width + 34;
  const ty = BAND - 38;
  ctx.shadowColor = p.accent; ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(8,10,24,0.85)'; rr(ctx, PAD, ty - 26, tw, 40, 20); ctx.fill();
  ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.strokeStyle = p.accent; ctx.stroke();
  ctx.fillStyle = p.accent; ctx.textAlign = 'left'; ctx.fillText(tag.split('').join(' '), PAD + 17, ty + 1);
  ctx.textAlign = 'right'; ctx.font = `20px ${ft.mono}`; ctx.fillStyle = '#9aa0c8';
  ctx.fillText(`${p.num} / ${String(total).padStart(2, '0')}`, TEX_W - PAD, 66);

  // title with glow + accent underline; shrinks to stay on one line, two small lines at the very most
  ctx.textAlign = 'left';
  const maxW = TEX_W - PAD * 2;
  let fs = 56;
  ctx.font = `900 ${fs}px ${ft.display}`;
  while (fs > 36 && ctx.measureText(p.title).width > maxW) { fs -= 2; ctx.font = `900 ${fs}px ${ft.display}`; }
  const lines = wrapText(ctx, p.title, maxW).slice(0, 2);
  const lh = fs * 1.12;
  let y = BAND + 46 + (lines.length > 1 ? 0 : 10);
  ctx.shadowColor = p.accent; ctx.shadowBlur = 20; ctx.fillStyle = '#ffffff';
  lines.forEach((l) => { ctx.fillText(l, PAD, y); y += lh; });
  ctx.shadowBlur = 0;
  const ul = ctx.createLinearGradient(PAD, 0, PAD + 220, 0);
  ul.addColorStop(0, p.accent); ul.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = ul; ctx.fillRect(PAD, y - lh + 14, 220, 3);

  ctx.font = `20px ${ft.mono}`; ctx.fillStyle = '#a4a9cf';
  let sh = p.short.toUpperCase();
  while (sh.length > 4 && ctx.measureText(sh).width > maxW) sh = sh.slice(0, -2);
  ctx.fillText(sh === p.short.toUpperCase() ? sh : sh.trimEnd() + '…', PAD, y - lh + 44);
};

/** layer 2 – tech chips, floats furthest out */
const paintChips = (c, p) => {
  const ctx = c.getContext('2d'); const ft = fonts();
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.font = `600 22px ${ft.mono}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const cy = TEX_H - 66; let x = PAD;
  if (!p.tech.length) {
    ctx.fillStyle = 'rgba(8,10,24,0.8)'; rr(ctx, x, cy - 30, 330, 44, 14); ctx.fill();
    ctx.strokeStyle = p.accent + '88'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#b9bde0'; ctx.fillText('CASE FILE COMING SOON', x + 18, cy);
    return;
  }
  for (const t of p.tech.slice(0, 5)) {
    const w = ctx.measureText(t).width + 34;
    if (x + w > TEX_W - PAD) break;
    ctx.shadowColor = p.accent; ctx.shadowBlur = 14;
    const gr = ctx.createLinearGradient(x, cy - 30, x, cy + 14);
    gr.addColorStop(0, 'rgba(18,22,48,0.95)'); gr.addColorStop(1, 'rgba(8,10,24,0.95)');
    ctx.fillStyle = gr; rr(ctx, x, cy - 30, w, 44, 14); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#f1f3ff'; ctx.fillText(t, x + 17, cy);
    x += w + 12;
  }
};

const makeTex = () => {
  const c = document.createElement('canvas'); c.width = Math.round(TEX_W * K); c.height = Math.round(TEX_H * K);
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
  return { x: a ? s * (6.6 + (a - 1) * 2.5) : 0, z: a ? -(3 + (a - 1) * 1.7) : 0, ry: -Math.max(-1, Math.min(1, d)) * 0.62, y: 0 };
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

  const radius = Math.max(7.4, (total * (PW + 1)) / (Math.PI * 2));
  const step = (Math.PI * 2) / total;

  const tex = useMemo(() => [makeTex(), makeTex(), makeTex()], []);
  useEffect(() => {
    let img = null, icon = null, dead = false;
    const draw = () => {
      paintBase(tex[0].image, project, img, icon); paintTitle(tex[1].image, project, total); paintChips(tex[2].image, project);
      tex.forEach((t) => { t.needsUpdate = true; });
    };
    draw();
    document.fonts?.ready.then(() => { if (!dead) draw(); });
    if (project.image) {
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => { img = im; if (!dead) draw(); };
      im.src = project.image;
    } else if (project.Icon) {
      try {
        let svg = renderToStaticMarkup(<project.Icon size={120} color="#ffffff" strokeWidth={1.6} />);
        if (!svg.includes('xmlns=')) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        const im = new Image();
        im.onload = () => { icon = im; if (!dead) draw(); };
        im.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      } catch { /* the badge simply stays empty */ }
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
    const sc = THREE.MathUtils.damp(g.scale.x, focused ? 1.22 : hover ? 0.92 : 0.84, 5, dt);
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
        <mesh position={[0, 0, DEPTH / 2 + 0.16]} onClick={click} onPointerOver={over} onPointerOut={() => setHover(false)}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial ref={(m) => { shade.current[1] = m; }} map={tex[1]} toneMapped={false} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, DEPTH / 2 + 0.3]} onClick={click} onPointerOver={over} onPointerOut={() => setHover(false)}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial ref={(m) => { shade.current[2] = m; }} map={tex[2]} toneMapped={false} transparent depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

const Rig = () => {
  const { camera, pointer, viewport } = useThree();
  useFrame((_, dt) => {
    // narrow screens pull the camera back so the slab still fits
    const dist = 8.8 + Math.max(0, 1.6 - viewport.aspect) * 5.5;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 1.6, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.5 + pointer.y * 0.9, 2.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, dist, 2.5, dt);
    camera.lookAt(0, 0, -1);
  });
  return null;
};

const Scene = ({ projects, focus, layout, onSelect }) => (
  <>
    <directionalLight position={[2, 3, 6]} intensity={1.4} />
    <ambientLight intensity={0.7} />
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
      <Canvas frameloop={live ? 'always' : 'never'} camera={{ position: [0, 0.5, 8.8], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
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
