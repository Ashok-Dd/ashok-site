import React, { useRef, useState, useCallback, useEffect } from "react";
import { GAME_SKILLS } from '../../data';

import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs , FaJava, FaGitAlt } from 'react-icons/fa';
import {
  SiTypescript, SiNextdotjs, SiTailwindcss, SiExpress,
  SiSocketdotio, SiMongodb, SiPostgresql, SiPython,
  SiPostman, SiFirebase, SiVercel, SiGreensock,
} from 'react-icons/si';

import { VscVscode } from 'react-icons/vsc';
import ReactDOMServer from 'react-dom/server';

// Call this once at the top of your component


const CIcon       = () => <span style={{ fontSize: 12, fontWeight: 700 }}>C</span>;
const MLIcon      = () => <span style={{ fontSize: 10, fontWeight: 700 }}>ML</span>;
const DataVizIcon = () => <span style={{ fontSize: 12 }}>📊</span>;
const DataIcon    = () => <span style={{ fontSize: 12 }}>📈</span>;
const DSAIcon     = () => <span style={{ fontSize: 12 }}>∑</span>;

const ICON_MAP = {
  html: FaHtml5,
  css: FaCss3Alt,
  js: FaJs,
  ts: SiTypescript,
  react: FaReact,
  next: SiNextdotjs,
  tailwind: SiTailwindcss,
  node: FaNodeJs,
  express: SiExpress,
  socket: SiSocketdotio,
  mongo: SiMongodb,
  postgres: SiPostgresql,
  python: SiPython,
  java: FaJava,
  git: FaGitAlt,
  gitbash: FaGitAlt ,
  vscode: VscVscode ,
  postman: SiPostman,
  firebase: SiFirebase,
  vercel: SiVercel,
  gsap: SiGreensock,
  c:       CIcon,
  ml:      MLIcon,
  dataviz: DataVizIcon,
  data:    DataIcon,
  dsa:     DSAIcon,
};


/* ── helpers ── */
const rand = (a, b) => Math.random() * (b - a) + a;
const randI = (a, b) => Math.floor(rand(a, b));

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function spawnTarget(s, W, H) {
  const skill = GAME_SKILLS[randI(0, GAME_SKILLS.length)];
  const r = rand(34, 50);
  const margin = r + 20;
  const edge = randI(0, 4);
  let x, y;
  if (edge === 0) { x = rand(margin, W - margin); y = margin; }
  else if (edge === 1) { x = W - margin; y = rand(margin, H - margin); }
  else if (edge === 2) { x = rand(margin, W - margin); y = H - margin; }
  else { x = margin; y = rand(margin, H - margin); }
  const speed = rand(55, 120);
  const ang = rand(0, Math.PI * 2);
  s.targets.push({ x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, r, skill, alive: true, age: 0 });
}

function explodeTarget(s, x, y, color) {
  for (let i = 0; i < 22; i++) {
    const a = rand(0, Math.PI * 2), spd = rand(50, 280);
    s.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: rand(2, 6), life: 1, decay: rand(1.8, 4), color: [color, "#1ABC9C", "#4DD9BC", "#F5F5F7"][randI(0, 4)], gravity: 60 });
  }
  s.flashes.push({ x, y, life: 1, type: "hit", color });
}

/* Sliding combo notification */
function ComboToast({ items }) {
  return (
    <div style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", zIndex: 30, pointerEvents: "none", display: "flex", flexDirection: "column-reverse", gap: 8 }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            animation: "comboSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards, comboFadeOut 0.4s ease 0.9s forwards",
            background: "rgba(14,14,26,0.9)",
            border: `1px solid ${item.color}55`,
            borderLeft: `3px solid ${item.color}`,
            padding: "8px 16px",
            borderRadius: "0 8px 8px 0",
            backdropFilter: "blur(8px)",
            minWidth: 160,
          }}
        >
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, color: item.color, letterSpacing: ".08em" }}>
            {item.combo > 1 ? `× ${item.combo} COMBO` : "HIT"}
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "rgba(245,245,247,0.6)", letterSpacing: ".1em", marginTop: 2 }}>
            +{item.pts} pts
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillShooter({ onExit }) {
  const canvasRef = useRef(null);
  const gsRef     = useRef(null);
  const rafRef    = useRef(null);
  const iconImagesRef = useRef({});



  const [hud, setHud]               = useState({ score: 0, ammo: 30, kills: 0, phase: "entry" });
  const [reloading, setReloading]   = useState(false);
  const [comboItems, setComboItems] = useState([]);
  const [entryStep, setEntryStep]   = useState(0);

  useEffect(() => {
  GAME_SKILLS.forEach((sk) => {
    const IconComp = ICON_MAP[sk.icon];
    if (!IconComp) return;

    // Render the icon to an SVG string
    const svgString = ReactDOMServer.renderToStaticMarkup(
      <IconComp size={24} color={sk.color} />
    );

    const blob = new Blob(
      [`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">${svgString}</svg>`],
      { type: 'image/svg+xml' }
    );
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      iconImagesRef.current[sk.icon] = img;
      URL.revokeObjectURL(url);
    };
  });
}, []);


  const syncHud = useCallback(() => {
    const s = gsRef.current; if (!s) return;
    setHud({ score: s.score, ammo: s.ammo, kills: s.kills, phase: s.phase });
  }, []);

  const initGs = useCallback(() => {
    gsRef.current = {
      phase: "entry", score: 0, combo: 0, ammo: 30, kills: 0, maxKills: 20,
      reloading: false, gunAngle: 0,
      mouseX: window.innerWidth / 2, mouseY: window.innerHeight / 2,
      recoilX: 0, screenShake: 0, spawnTimer: 0, spawnRate: 2000,
      bullets: [], targets: [], particles: [], flashes: [],
      floatT: 0, bestCombo: 0,
    };
  }, []);

  const startEntry = useCallback(() => {
    setEntryStep(0);
    const t1 = setTimeout(() => setEntryStep(1), 300);
    const t2 = setTimeout(() => setEntryStep(2), 1400);
    const t3 = setTimeout(() => setEntryStep(3), 2400);
    const t4 = setTimeout(() => {
      if (gsRef.current) gsRef.current.phase = "play";
      setEntryStep(4); syncHud();
    }, 3400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [syncHud]);

  const shoot = useCallback(() => {
    const s = gsRef.current;
    if (!s || s.phase !== "play" || s.reloading || s.ammo <= 0) return;
    const canvas = canvasRef.current;
    const GX = canvas.width * 0.13, GY = canvas.height * 0.80, ang = s.gunAngle;
    const tipX = GX + Math.cos(ang) * 90, tipY = GY + Math.sin(ang) * 90;
    s.bullets.push({ x: tipX, y: tipY, vx: Math.cos(ang) * 900, vy: Math.sin(ang) * 900, trail: [], alive: true });
    s.flashes.push({ x: tipX, y: tipY, life: 1, type: "muzzle" });
    for (let i = 0; i < 10; i++) {
      const a = ang + rand(-0.5, 0.5), spd = rand(60, 180);
      s.particles.push({ x: tipX, y: tipY, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: rand(2, 4), life: 1, decay: rand(2.5, 5), color: ["#1ABC9C", "#4DD9BC", "#F5F5F7", "#A0A0B0"][randI(0, 4)], gravity: 80 });
    }
    s.ammo--; s.recoilX = -18; syncHud();
  }, [syncHud]);

  const doReload = useCallback(() => {
    const s = gsRef.current;
    if (!s || s.reloading || s.ammo >= 30) return;
    s.reloading = true; setReloading(true);
    setTimeout(() => {
      if (gsRef.current) { gsRef.current.ammo = 30; gsRef.current.reloading = false; }
      setReloading(false); syncHud();
    }, 1800);
  }, [syncHud]);

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      H = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };
    resize(); window.addEventListener("resize", resize);
    initGs(); const cleanEntry = startEntry();

    const STARS = Array.from({ length: 80 }, () => ({ x: rand(0, 1), y: rand(0, 1), r: rand(0.3, 1.5), t: rand(0, Math.PI * 2) }));
    let lastTs = performance.now();

    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((ts - lastTs) / 1000, 0.05); lastTs = ts;
      const s = gsRef.current; if (!s) return;
      W = canvas.width; H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* Background */
      const bg = ctx.createRadialGradient(W * .5, H * .4, 0, W * .5, H * .5, Math.max(W, H) * .9);
      bg.addColorStop(0, "#0d1a17"); bg.addColorStop(.6, "#070f0e"); bg.addColorStop(1, "#030808");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      /* Grid */
      ctx.save(); ctx.strokeStyle = "rgba(26,188,156,0.04)"; ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 55) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 55) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      ctx.restore();

      /* Stars */
      STARS.forEach(st => {
        st.t += dt; const a = 0.2 + Math.sin(st.t) * 0.12;
        ctx.beginPath(); ctx.arc(st.x * W, st.y * H, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,255,240,${a})`; ctx.fill();
      });

      /* Vignette */
      const vig = ctx.createRadialGradient(W * .5, H * .5, H * .2, W * .5, H * .5, H * .85);
      vig.addColorStop(0, "transparent"); vig.addColorStop(1, "rgba(0,20,18,0.08)");
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

      let sx = 0, sy = 0;
      if (s.screenShake > 0) { s.screenShake = Math.max(0, s.screenShake - dt * 7); sx = (Math.random() - .5) * 9 * s.screenShake; sy = (Math.random() - .5) * 9 * s.screenShake; }
      ctx.save(); ctx.translate(sx, sy);

      s.recoilX += (0 - s.recoilX) * 0.18; s.floatT += dt;
      const floatY = Math.sin(s.floatT * 1.3) * 7;

      /* Gun */
      if (s.phase === "play" || s.phase === "entry") {
        const GX = W * 0.13 + s.recoilX, GY = H * 0.80 + floatY;
        const tAng = Math.atan2(s.mouseY - GY, s.mouseX - GX);
        s.gunAngle += (tAng - s.gunAngle) * 0.15;
        const ang = s.gunAngle;
        ctx.save(); ctx.translate(GX, GY); ctx.rotate(ang);
        ctx.shadowColor = "#1ABC9C"; ctx.shadowBlur = 14;

        /* Barrel */
        ctx.fillStyle = "#0a1a15"; roundRect(ctx, 60, -8, 52, 16, 5); ctx.fill();
        for (let i = 0; i < 5; i++) { ctx.fillStyle = "#081210"; roundRect(ctx, 64 + i * 9, -5, 5, 10, 1); ctx.fill(); }

        /* Main body */
        const bGr = ctx.createLinearGradient(0, -7, 0, 7);
        bGr.addColorStop(0, "#1ABC9C"); bGr.addColorStop(.5, "#0e8870"); bGr.addColorStop(1, "#065544");
        ctx.fillStyle = bGr; roundRect(ctx, 8, -7, 88, 14, 3); ctx.fill();
        ctx.fillStyle = "rgba(77,217,188,0.12)"; roundRect(ctx, 10, -6, 84, 5, 2); ctx.fill();

        /* Grip */
        const sGr = ctx.createLinearGradient(0, -16, 0, 16);
        sGr.addColorStop(0, "#1ABC9C"); sGr.addColorStop(1, "#065544");
        ctx.fillStyle = sGr; roundRect(ctx, -30, -17, 92, 34, 6); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.2)"; for (let i = 0; i < 7; i++) { roundRect(ctx, -24 + i * 9, -15, 5, 30, 1); ctx.fill(); }

        /* Detail */
        ctx.fillStyle = "#0a2a22"; ctx.strokeStyle = "#1ABC9C"; ctx.lineWidth = .6;
        roundRect(ctx, 8, -13, 30, 15, 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#4DD9BC"; ctx.shadowColor = "#4DD9BC"; ctx.shadowBlur = 8;
        roundRect(ctx, 52, -20, 7, 9, 1); ctx.fill();

        /* Scope indicator */
        ctx.strokeStyle = "#1ABC9C"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(6, 30, 23, 0, Math.PI * .8); ctx.stroke();
        ctx.fillStyle = "#4DD9BC"; ctx.shadowColor = "#4DD9BC"; ctx.shadowBlur = 8;
        roundRect(ctx, 7, 34, 5, 14, 2); ctx.fill();

        /* LED */
        ctx.fillStyle = "#00ff9f"; ctx.shadowColor = "#00ff9f"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(28, 22, 3, 0, Math.PI * 2); ctx.fill();
        const lGr = ctx.createLinearGradient(32, 22, 350, 22);
        lGr.addColorStop(0, "rgba(0,255,159,0.45)"); lGr.addColorStop(1, "rgba(0,255,159,0)");
        ctx.shadowBlur = 0; ctx.strokeStyle = lGr; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(32, 22); ctx.lineTo(350, 22); ctx.stroke();
        ctx.restore();
      }

      /* Targets */
      if (s.phase === "play") {
        s.spawnTimer += dt * 1000;
        if (s.spawnTimer >= s.spawnRate && s.targets.length < 6) {
          spawnTarget(s, W, H); s.spawnTimer = 0; s.spawnRate = Math.max(800, s.spawnRate - 15);
        }

        s.targets.forEach(t => {
          if (!t.alive) return;
          t.age += dt; t.x += t.vx * dt; t.y += t.vy * dt;
          if (t.x < t.r) { t.x = t.r; t.vx = Math.abs(t.vx); }
          if (t.x > W - t.r) { t.x = W - t.r; t.vx = -Math.abs(t.vx); }
          if (t.y < t.r) { t.y = t.r; t.vy = Math.abs(t.vy); }
          if (t.y > H - t.r) { t.y = H - t.r; t.vy = -Math.abs(t.vy); }
          const pulse = 1 + Math.sin(t.age * 2.5) * 0.05, R = t.r * pulse;
          ctx.save();

          /* Orbit segments */
          ctx.translate(t.x, t.y); ctx.rotate(t.age * 1.4);
          for (let seg = 0; seg < 8; seg++) {
            const a1 = (seg / 8) * Math.PI * 2, a2 = a1 + Math.PI * 2 / 8 * 0.5;
            ctx.beginPath(); ctx.arc(0, 0, R + 10, a1, a2);
            ctx.strokeStyle = t.skill.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.55; ctx.stroke();
          }
          ctx.restore();

          /* Fill */
          const gr = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, R);
          gr.addColorStop(0, t.skill.color + "33"); gr.addColorStop(.7, t.skill.color + "11"); gr.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(t.x, t.y, R, 0, Math.PI * 2);
          ctx.fillStyle = gr; ctx.globalAlpha = 1; ctx.fill();

          /* Border */
          ctx.beginPath(); ctx.arc(t.x, t.y, R, 0, Math.PI * 2);
          ctx.strokeStyle = t.skill.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; ctx.stroke();

          /* Crosshair inside */
          ctx.strokeStyle = t.skill.color; ctx.lineWidth = 1; ctx.globalAlpha = 0.25;
          ctx.beginPath(); ctx.moveTo(t.x - R * .8, t.y); ctx.lineTo(t.x + R * .8, t.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(t.x, t.y - R * .8); ctx.lineTo(t.x, t.y + R * .8); ctx.stroke();
          [0.5, 0.28].forEach(f => { ctx.beginPath(); ctx.arc(t.x, t.y, R * f, 0, Math.PI * 2); ctx.stroke(); });

          /* Icon & label */
          ctx.globalAlpha = 1;
          const iconImg = iconImagesRef.current[t.skill.icon];
          if (iconImg) {
            const iconSize = R * 0.9;
            ctx.shadowColor = t.skill.color; ctx.shadowBlur = 12;
            ctx.drawImage(iconImg, t.x - iconSize / 2, t.y - R * 0.55, iconSize, iconSize);
            ctx.shadowBlur = 0;
          } else {
            ctx.font = `bold ${Math.floor(R * .55)}px monospace`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillStyle = t.skill.color; ctx.shadowColor = t.skill.color; ctx.shadowBlur = 12;
            ctx.fillText(t.skill.name.slice(0, 2).toUpperCase(), t.x, t.y - R * .08); ctx.shadowBlur = 0;
          }
          ctx.font = "bold 11px 'Courier New',monospace"; ctx.fillStyle = "#F5F5F7"; ctx.globalAlpha = 0.75;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(t.skill.name, t.x, t.y + R * .56);
          ctx.globalAlpha = 1; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        });

        /* Bullets */
        const dead = [];
        s.bullets.forEach((b, bi) => {
          if (!b.alive) { dead.push(bi); return; }
          b.x += b.vx * dt; b.y += b.vy * dt;
          b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 12) b.trail.shift();
          let hit = false;
          for (let ti = 0; ti < s.targets.length; ti++) {
            const t = s.targets[ti]; if (!t.alive) continue;
            const dx = b.x - t.x, dy = b.y - t.y;
            if (dx * dx + dy * dy < (t.r + 8) * (t.r + 8)) {
              t.alive = false; b.alive = false; hit = true;
              explodeTarget(s, t.x, t.y, t.skill.color); s.screenShake = 1;
              s.kills++; s.combo++; if (s.combo > s.bestCombo) s.bestCombo = s.combo;
              const pts = 100 + (s.combo - 1) * 50; s.score += pts;
              /* Sliding combo toast */
              const newItem = { id: Date.now() + Math.random(), combo: s.combo, pts, color: t.skill.color };
              setComboItems(prev => [...prev.slice(-4), newItem]);
              setTimeout(() => setComboItems(prev => prev.filter(i => i.id !== newItem.id)), 1400);
              syncHud();
              if (s.kills >= s.maxKills) { setTimeout(() => { if (gsRef.current) gsRef.current.phase = "exit"; syncHud(); }, 600); }
              break;
            }
          }
          if (!hit && (b.x > W + 60 || b.x < -60 || b.y > H + 60 || b.y < -60)) {
            b.alive = false; if (s.combo > 0) { s.combo = 0; syncHud(); }
          }
          if (!b.alive) dead.push(bi);

          /* Trail */
          b.trail.forEach((pt, i) => {
            const a = (i / b.trail.length) * 0.5;
            ctx.beginPath(); ctx.arc(pt.x, pt.y, 3 * (i / b.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(26,188,156,${a})`; ctx.fill();
          });

          /* Bullet */
          ctx.save(); ctx.shadowColor = "#1ABC9C"; ctx.shadowBlur = 14;
          ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fillStyle = "#F5F5F7"; ctx.fill();
          ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fillStyle = "#4DD9BC"; ctx.fill();
          ctx.restore();
        });
        for (let i = dead.length - 1; i >= 0; i--) s.bullets.splice(dead[i], 1);
        s.targets = s.targets.filter(t => t.alive);
      }

      /* Particles */
      s.particles = s.particles.filter(p => {
        p.life = Math.max(0, p.life - dt * p.decay); if (p.life <= 0) return false;
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.gravity || 0) * dt;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fill(); ctx.globalAlpha = 1;
        return true;
      });

      /* Flashes */
      s.flashes = s.flashes.filter(f => {
        f.life = Math.max(0, f.life - dt * (f.type === "muzzle" ? 8 : 3)); if (f.life <= 0) return false;
        const a = f.life;
        if (f.type === "muzzle") {
          const mg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 50 * (1 - a * .5));
          mg.addColorStop(0, `rgba(77,217,188,${a * .9})`); mg.addColorStop(.4, `rgba(26,188,156,${a * .5})`); mg.addColorStop(1, "transparent");
          ctx.globalAlpha = a; ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(f.x, f.y, 50, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        } else {
          const progress = 1 - a, r = 12 + progress * 65;
          ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = f.color; ctx.lineWidth = 2.5 * a; ctx.globalAlpha = a * .65; ctx.stroke(); ctx.globalAlpha = 1;
        }
        return true;
      });

      ctx.restore();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (cleanEntry) cleanEntry();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const down = (e) => { if (e.key === " ") { e.preventDefault(); shoot(); } if (e.key === "r" || e.key === "R") doReload(); };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [shoot, doReload]);

  const isPlay = hud.phase === "play";
  const isExit = hud.phase === "exit";
  const isEntry = hud.phase === "entry";

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#030808", cursor: isPlay ? "crosshair" : "default" }}
      onMouseMove={e => { if (gsRef.current) { gsRef.current.mouseX = e.clientX; gsRef.current.mouseY = e.clientY; } }}
      onClick={() => { if (isPlay) shoot(); }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');
        @keyframes ssGlitch{0%{opacity:0;clip-path:inset(60% 0 40% 0)}25%{opacity:1;clip-path:inset(20% 0 30% 0)}55%{clip-path:inset(5% 0 8% 0)}100%{clip-path:inset(0 0 0 0)}}
        @keyframes ssFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ssPulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes ssReload{from{width:0}to{width:100%}}
        @keyframes ssExitIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes comboSlideIn{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes comboFadeOut{from{opacity:1}to{opacity:0;transform:translateX(-12px)}}
        .ss-orb{font-family:'Orbitron',monospace;}
        .ss-mono{font-family:'Share Tech Mono','Courier New',monospace;}
      `}</style>

      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%" }} />

      {/* ENTRY */}
      {isEntry && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 10 }}>
          {entryStep >= 1 && (
            <div style={{ animation: "ssGlitch .65s ease forwards", textAlign: "center" }}>
              <div className="ss-orb" style={{ fontSize: "clamp(24px,5.5vw,66px)", fontWeight: 900, letterSpacing: ".12em", color: "#1ABC9C"}}>TEST MY SKILLS</div>
              <div className="ss-mono" style={{ color: "rgba(26,188,156,0.45)", letterSpacing: ".4em", fontSize: "clamp(9px,1.1vw,12px)", marginTop: 10 }}>◈ INTERACTIVE ARENA ◈</div>
            </div>
          )}
          {entryStep >= 2 && (<div className="ss-mono" style={{ animation: "ssFadeUp .5s ease both", marginTop: 44, color: "rgba(77,217,188,0.55)", fontSize: 12, letterSpacing: ".2em" }}>INITIALIZING TARGETS...</div>)}
          {entryStep >= 3 && (<div className="ss-mono" style={{ animation: "ssPulse .6s infinite", marginTop: 12, color: "rgba(26,188,156,0.35)", fontSize: 11, letterSpacing: ".3em" }}>LOADING WEAPONS SYSTEM...</div>)}
        </div>
      )}

      {/* PLAY HUD */}
      {isPlay && (
        <>
          {/* Top bar — compact: score + title + exit */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: "none",
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            padding: "12px 16px", gap: 10,
          }}>
            {/* Score — compact */}
            <div style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(26,188,156,0.3)", padding: "8px 14px", backdropFilter: "blur(8px)", borderRadius: 8 }}>
              <div className="ss-mono" style={{ color: "rgba(26,188,156,0.5)", fontSize: 8, letterSpacing: ".35em", marginBottom: 2 }}>SCORE</div>
              <div className="ss-orb" style={{ color: "#4DD9BC", fontSize: "clamp(16px,2vw,24px)", fontWeight: 900, textShadow: "0 0 14px rgba(26,188,156,0.5)" }}>
                {String(hud.score).padStart(6, "0")}
              </div>
            </div>

            {/* Center title */}
            <div style={{ textAlign: "center", paddingTop: 4 }}>
              <div className="ss-orb" style={{ color: "#1ABC9C", fontSize: "clamp(10px,1.4vw,15px)", letterSpacing: ".25em", textShadow: "0 0 14px #1ABC9C" }}>◈ SKILL ARENA ◈</div>
              <div className="ss-mono" style={{ color: "rgba(26,188,156,0.35)", fontSize: 9, letterSpacing: ".3em", marginTop: 3 }}>
                DESTROY {(gsRef.current?.maxKills || 20) - hud.kills} MORE
              </div>
            </div>

            {/* Exit — pointerEvents on */}
            <div style={{ pointerEvents: "all" }}>
              <button
                style={{ background: "rgba(26,188,156,0.06)", border: "1px solid rgba(26,188,156,0.25)", color: "rgba(26,188,156,0.55)", padding: "8px 14px", fontSize: 10, letterSpacing: ".2em", cursor: "pointer", fontFamily: "'Orbitron',monospace", borderRadius: 8, transition: "all .2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,188,156,0.15)"; e.currentTarget.style.color = "#1ABC9C"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,188,156,0.06)"; e.currentTarget.style.color = "rgba(26,188,156,0.55)"; }}
                onClick={e => { e.stopPropagation(); if (onExit) onExit(); }}
              >← EXIT</button>
            </div>
          </div>

          {/* Kill tracker — right side vertical dots */}
          <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 10, pointerEvents: "none" }}>
            <div className="ss-mono" style={{ color: "rgba(26,188,156,0.35)", fontSize: 8, letterSpacing: ".25em", marginBottom: 8, writingMode: "vertical-rl", textAlign: "center" }}>KILLS</div>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", margin: "3px auto", background: i < hud.kills ? "#1ABC9C" : "rgba(26,188,156,0.1)", border: `1px solid ${i < hud.kills ? "#1ABC9C" : "rgba(26,188,156,0.2)"}`, boxShadow: i < hud.kills ? "0 0 5px #1ABC9C" : "none", transition: "all .2s" }} />
            ))}
          </div>

          {/* Sliding combo toasts — left side */}
          <ComboToast items={comboItems} />

          {/* Ammo — bottom center */}
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10, pointerEvents: "none" }}>
            <div style={{ display: "flex", gap: 2.5, justifyContent: "center", marginBottom: 6 }}>
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} style={{ width: 4, height: 13, borderRadius: 2, background: i < hud.ammo ? "linear-gradient(180deg,#4DD9BC,#1ABC9C)" : "rgba(26,188,156,0.08)", boxShadow: i < hud.ammo ? "0 0 4px rgba(26,188,156,0.4)" : "none", transition: "background .1s" }} />
              ))}
            </div>
            <div className="ss-mono" style={{ fontSize: 10, color: "rgba(26,188,156,0.45)", letterSpacing: ".18em" }}>
              {reloading
                ? <span style={{ color: "#1ABC9C", animation: "ssPulse .4s infinite" }}>⟳ RELOADING...</span>
                : <>{hud.ammo}<span style={{ opacity: .35 }}>/30 · CLICK or SPACE to fire · R to reload</span></>}
            </div>
            {reloading && (
              <div style={{ width: 160, height: 2, background: "rgba(26,188,156,0.1)", border: "1px solid rgba(26,188,156,0.2)", borderRadius: 2, margin: "5px auto 0", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#1ABC9C,#4DD9BC)", animation: "ssReload 1.8s linear forwards", boxShadow: "0 0 6px #1ABC9C" }} />
              </div>
            )}
          </div>
        </>
      )}

      {/* EXIT SCREEN */}
      {isExit && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,8,8,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "ssExitIn .7s ease forwards", backdropFilter: "blur(8px)", zIndex: 20 }}>
          <div style={{ textAlign: "center", maxWidth: 560, padding: "36px 40px", border: "1px solid rgba(26,188,156,0.25)", background: "rgba(0,0,0,0.6)", borderRadius: 16 }}>
            <div className="ss-mono" style={{ color: "rgba(26,188,156,0.45)", fontSize: 10, letterSpacing: ".5em", marginBottom: 18 }}>MISSION COMPLETE</div>
            <div className="ss-orb" style={{ fontSize: "clamp(20px,4vw,46px)", fontWeight: 900, color: "#4DD9BC", textShadow: "0 0 36px rgba(26,188,156,0.5)", marginBottom: 4 }}>YOU'VE EXPLORED</div>
            <div className="ss-orb" style={{ fontSize: "clamp(20px,4vw,46px)", fontWeight: 900, color: "#1ABC9C", textShadow: "0 0 36px rgba(26,188,156,0.4)", marginBottom: 28 }}>MY SKILLS</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
              {[
                { label: "FINAL SCORE", value: String(hud.score).padStart(6, "0"), color: "#4DD9BC" },
                { label: "TARGETS HIT", value: `${hud.kills}/20`, color: "#1ABC9C" },
                { label: "BEST COMBO", value: `×${gsRef.current?.bestCombo || 0}`, color: "#A0A0B0" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(26,188,156,0.05)", border: "1px solid rgba(26,188,156,0.15)", padding: "10px 8px", borderRadius: 8 }}>
                  <div className="ss-mono" style={{ color: "rgba(26,188,156,0.4)", fontSize: 8, letterSpacing: ".3em", marginBottom: 5 }}>{s.label}</div>
                  <div className="ss-orb" style={{ color: s.color, fontSize: 18, fontWeight: 900, textShadow: `0 0 12px ${s.color}` }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 24 }}>
              {GAME_SKILLS.map((sk) => {
                console.log(ICON_MAP[sk.icon] ? "present in map" : "absent in map");
                const Icon = ICON_MAP[sk.icon] || (() => <span>{sk.icon}</span>);


                return (
                  <div
                    key={sk.name}
                    className="ss-mono"
                    style={{
                      padding: "3px 10px",
                      border: `1px solid ${sk.color}40`,
                      color: sk.color,
                      fontSize: 10,
                      letterSpacing: ".1em",
                      background: `${sk.color}0d`,
                      borderRadius: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <Icon size={14} />
                    {sk.name}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={e => { e.stopPropagation(); initGs(); startEntry(); syncHud(); setReloading(false); setComboItems([]); }}
                className="ss-orb"
                style={{ background: "rgba(26,188,156,0.08)", border: "2px solid #1ABC9C", color: "#1ABC9C", padding: "11px 28px", fontSize: 11, letterSpacing: ".28em", cursor: "pointer", fontWeight: 700, transition: "all .2s", borderRadius: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,188,156,0.2)"; e.currentTarget.style.textShadow = "0 0 14px #1ABC9C"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,188,156,0.08)"; e.currentTarget.style.textShadow = "none"; }}
              >⟳ PLAY AGAIN</button>
              {onExit && (
                <button
                  onClick={e => { e.stopPropagation(); onExit(); }}
                  className="ss-orb"
                  style={{ background: "rgba(255,255,255,0.03)", border: "2px solid rgba(245,245,247,0.15)", color: "rgba(245,245,247,0.4)", padding: "11px 28px", fontSize: 11, letterSpacing: ".28em", cursor: "pointer", fontWeight: 700, transition: "all .2s", borderRadius: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#F5F5F7"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(245,245,247,0.4)"; }}
                >← BACK TO SKILLS</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillShooter;