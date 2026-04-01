import { useEffect, useRef, useState, useCallback } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────
const SKILLS = [
  { name: "React",       color: "#61DAFB", icon: "⚛" },
  { name: "Node.js",     color: "#68A063", icon: "⬡" },
  { name: "MongoDB",     color: "#47A248", icon: "🍃" },
  { name: "Python",      color: "#FFD43B", icon: "🐍" },
  { name: "TypeScript",  color: "#3178C6", icon: "TS" },
  { name: "TensorFlow",  color: "#FF8C00", icon: "🧠" },
  { name: "Socket.IO",   color: "#ffffff", icon: "⚡" },
  { name: "Docker",      color: "#2496ED", icon: "🐳" },
  { name: "DSA",         color: "#FF6B6B", icon: "∑" },
  { name: "GSAP",        color: "#88CE02", icon: "G" },
];

const PHASES = { ENTRY: "entry", PLAY: "play", EXIT: "exit" };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b));

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function SkillShooter() {
  const canvasRef    = useRef();
  const stateRef     = useRef(null); // mutable game state, not re-rendered
  const rafRef       = useRef();
  const phaseTimerRef = useRef();

  const [phase, setPhase]         = useState(PHASES.ENTRY);
  const [score, setScore]         = useState(0);
  const [combo, setCombo]         = useState(0);
  const [ammo, setAmmo]           = useState(30);
  const [shaking, setShaking]     = useState(false);
  const [entryStep, setEntryStep] = useState(0); // 0=fade 1=text 2=gun
  const [hitMsg, setHitMsg]       = useState(null);
  const [reloading, setReloading] = useState(false);
  const [targetsKilled, setTargetsKilled] = useState(0);

  // ── INIT STATE ──
  const initState = useCallback((canvas) => {
    stateRef.current = {
      bullets:   [],
      targets:   [],
      particles: [],
      flashes:   [],
      gunAngle:  0,
      mouseX:    canvas.width / 2,
      mouseY:    canvas.height / 2,
      score:     0,
      combo:     0,
      ammo:      30,
      reloading: false,
      phase:     PHASES.ENTRY,
      targetsKilled: 0,
      lastTargetSpawn: 0,
      spawnInterval: 2200,
      recoilOffset: 0,
      screenShake: 0,
    };
  }, []);

  // ── ENTRY SEQUENCE ──
  useEffect(() => {
    if (phase !== PHASES.ENTRY) return;
    const t1 = setTimeout(() => setEntryStep(1), 400);
    const t2 = setTimeout(() => setEntryStep(2), 1600);
    const t3 = setTimeout(() => setEntryStep(3), 2800);
    const t4 = setTimeout(() => {
      setPhase(PHASES.PLAY);
      if (stateRef.current) stateRef.current.phase = PHASES.PLAY;
    }, 3800);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [phase]);

  // ── SPAWN TARGET ──
  const spawnTarget = useCallback((canvas) => {
    const s = stateRef.current;
    if (!s) return;
    const skill = SKILLS[randInt(0, SKILLS.length)];
    const margin = 100;
    // spawn on edges
    const edge = randInt(0,4);
    let x, y;
    if      (edge === 0) { x = rand(margin, canvas.width-margin); y = -60; }
    else if (edge === 1) { x = canvas.width+60;  y = rand(margin, canvas.height-margin); }
    else if (edge === 2) { x = rand(margin, canvas.width-margin); y = canvas.height+60; }
    else                 { x = -60; y = rand(margin, canvas.height-margin); }

    const cx = canvas.width  * 0.5 + rand(-80,80);
    const cy = canvas.height * 0.5 + rand(-60,60);
    const dx = cx - x, dy = cy - y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = rand(55, 95);

    s.targets.push({
      x, y,
      vx: (dx/dist)*speed, vy: (dy/dist)*speed,
      skill,
      r: 44,
      hp: 1,
      alive: true,
      age: 0,
      wobble: rand(0, Math.PI*2),
      wobbleSpeed: rand(1.5, 3),
      pulseT: 0,
    });
  }, []);

  // ── SHOOT ──
  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== PHASES.PLAY) return;
    if (s.reloading) return;
    if (s.ammo <= 0) {
      // auto reload
      s.reloading = true;
      setReloading(true);
      setTimeout(() => {
        if (stateRef.current) {
          stateRef.current.ammo = 30;
          stateRef.current.reloading = false;
        }
        setAmmo(30);
        setReloading(false);
      }, 2000);
      return;
    }

    const canvas = canvasRef.current;
    const gunX = canvas.width  * 0.15;
    const gunY = canvas.height * 0.78;
    const angle = s.gunAngle;

    s.bullets.push({
      x: gunX + Math.cos(angle) * 50,
      y: gunY + Math.sin(angle) * 50,
      vx: Math.cos(angle) * 820,
      vy: Math.sin(angle) * 820,
      trail: [],
      life: 1.5,
      hit: false,
    });

    // muzzle flash
    s.flashes.push({ x: gunX + Math.cos(angle)*80, y: gunY + Math.sin(angle)*80, life: 0.18, maxLife: 0.18 });

    // muzzle particles
    for (let i=0; i<14; i++) {
      const a = angle + rand(-0.4, 0.4);
      const spd = rand(80,220);
      s.particles.push({ x: gunX+Math.cos(angle)*60, y: gunY+Math.sin(angle)*60, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, r: rand(2,5), life: rand(0.15,0.35), maxLife: 0.35, color: ["#FF8C00","#FFD700","#FF4500","#fff"][randInt(0,4)], gravity: 60 });
    }

    s.ammo--;
    s.recoilOffset = -22;
    setAmmo(s.ammo);
  }, []);

  // ── MISS SHAKE ──
  const triggerMiss = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 350);
    if (stateRef.current) stateRef.current.combo = 0;
    setCombo(0);
  }, []);

  // ── EXPLOSION PARTICLES ──
  const explode = useCallback((x, y, color) => {
    const s = stateRef.current;
    if (!s) return;
    for (let i=0; i<28; i++) {
      const a = rand(0, Math.PI*2);
      const spd = rand(60,260);
      s.particles.push({ x, y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd - 40, r: rand(3,9), life: rand(0.4,0.9), maxLife: 0.9, color: [color,"#fff","#FFD700"][randInt(0,3)], gravity: 120 });
    }
    // ring shockwave stored as flash
    s.flashes.push({ x, y, life: 0.4, maxLife: 0.4, ring: true, color });
  }, []);

  // ── CANVAS LOOP ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    initState(canvas);

    let lastTs = 0;
    let bgStars = Array.from({length:90}, ()=>({ x: rand(0,1), y: rand(0,1), r: rand(0.5,2), blink: rand(0,Math.PI*2) }));

    const draw = (ts) => {
      rafRef.current = requestAnimationFrame(draw);
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      const s = stateRef.current;
      if (!s) return;

      W = canvas.width; H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── SCREEN SHAKE ──
      let sx = 0, sy = 0;
      if (s.screenShake > 0) {
        s.screenShake -= dt * 8;
        sx = rand(-6,6) * s.screenShake;
        sy = rand(-6,6) * s.screenShake;
      }
      ctx.save();
      ctx.translate(sx, sy);

      // ── BACKGROUND ──
      const bgGrad = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.5, Math.max(W,H)*0.8);
      bgGrad.addColorStop(0, "#0d0800");
      bgGrad.addColorStop(0.5, "#060300");
      bgGrad.addColorStop(1, "#020100");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // grid floor
      ctx.save();
      ctx.strokeStyle = "rgba(255,80,0,0.06)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let gx=0; gx<W; gx+=gridSize) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
      for (let gy=0; gy<H; gy+=gridSize) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }
      ctx.restore();

      // stars
      bgStars.forEach(star => {
        star.blink += dt*1.5;
        const a = 0.3 + Math.sin(star.blink)*0.2;
        ctx.beginPath();
        ctx.arc(star.x*W, star.y*H, star.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,200,150,${a})`;
        ctx.fill();
      });

      // arena glow vignette
      const vig = ctx.createRadialGradient(W*0.5, H*0.5, H*0.2, W*0.5, H*0.5, H*0.85);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(255,30,0,0.07)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      if (s.phase === PHASES.PLAY) {
        // ── SPAWN TARGETS ──
        s.lastTargetSpawn = (s.lastTargetSpawn || 0) + dt*1000;
        if (s.lastTargetSpawn >= s.spawnInterval && s.targets.length < 7) {
          spawnTarget(canvas);
          s.lastTargetSpawn = 0;
          s.spawnInterval = Math.max(900, s.spawnInterval - 15);
        }

        // ── GUN ANGLE ──
        const gunX = W * 0.15;
        const gunY = H * 0.78;
        const targetAngle = Math.atan2(s.mouseY - gunY, s.mouseX - gunX);
        s.gunAngle += (targetAngle - s.gunAngle) * 0.18;

        // recoil
        s.recoilOffset += (0 - s.recoilOffset) * 0.22;

        // ── DRAW TARGETS ──
        s.targets.forEach(t => {
          if (!t.alive) return;
          t.age += dt;
          t.pulseT += dt * t.wobbleSpeed;
          t.x += t.vx * dt;
          t.y += t.vy * dt;

          // bounce off walls
          if (t.x < t.r || t.x > W-t.r) t.vx *= -1;
          if (t.y < t.r || t.y > H-t.r) t.vy *= -1;
          t.x = Math.max(t.r, Math.min(W-t.r, t.x));
          t.y = Math.max(t.r, Math.min(H-t.r, t.y));

          const pulse = 1 + Math.sin(t.pulseT) * 0.06;
          const R = t.r * pulse;

          // outer ring glow
          ctx.save();
          ctx.shadowColor = t.skill.color;
          ctx.shadowBlur  = 20;

          // spinning ring
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.age * 1.4);
          for (let seg=0; seg<8; seg++) {
            const a1 = (seg/8)*Math.PI*2;
            const a2 = a1 + Math.PI*2/8*0.6;
            ctx.beginPath();
            ctx.arc(0, 0, R+8, a1, a2);
            ctx.strokeStyle = t.skill.color;
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
          }
          ctx.restore();

          // target body
          const grad = ctx.createRadialGradient(t.x-R*0.2, t.y-R*0.2, 0, t.x, t.y, R);
          grad.addColorStop(0, `${t.skill.color}33`);
          grad.addColorStop(0.6, `${t.skill.color}18`);
          grad.addColorStop(1, `${t.skill.color}08`);
          ctx.beginPath();
          ctx.arc(t.x, t.y, R, 0, Math.PI*2);
          ctx.fillStyle = grad;
          ctx.globalAlpha = 1;
          ctx.fill();

          // border
          ctx.beginPath();
          ctx.arc(t.x, t.y, R, 0, Math.PI*2);
          ctx.strokeStyle = t.skill.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.8;
          ctx.stroke();

          // crosshair lines
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = t.skill.color;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(t.x-R*0.9, t.y); ctx.lineTo(t.x+R*0.9, t.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(t.x, t.y-R*0.9); ctx.lineTo(t.x, t.y+R*0.9); ctx.stroke();

          // inner rings
          [0.5, 0.25].forEach(frac => {
            ctx.beginPath(); ctx.arc(t.x, t.y, R*frac, 0, Math.PI*2);
            ctx.strokeStyle = t.skill.color; ctx.lineWidth = 1; ctx.globalAlpha = 0.3; ctx.stroke();
          });

          ctx.globalAlpha = 1;
          ctx.restore();

          // icon
          ctx.font = `bold ${R*0.55}px monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = t.skill.color;
          ctx.shadowColor = t.skill.color;
          ctx.shadowBlur = 12;
          ctx.fillText(t.skill.icon, t.x, t.y - R*0.1);
          ctx.shadowBlur = 0;

          // name
          ctx.font = `bold 11px 'Courier New', monospace`;
          ctx.fillStyle = "#fff";
          ctx.globalAlpha = 0.85;
          ctx.fillText(t.skill.name, t.x, t.y + R*0.55);
          ctx.globalAlpha = 1;
          ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        });

        // ── BULLETS ──
        s.bullets = s.bullets.filter(b => {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.life -= dt;
          if (b.life <= 0) return false;

          b.trail.push({ x: b.x, y: b.y });
          if (b.trail.length > 12) b.trail.shift();

          // hit detection
          let hit = false;
          s.targets.forEach(t => {
            if (!t.alive || b.hit) return;
            const dx = b.x-t.x, dy = b.y-t.y;
            if (dx*dx+dy*dy < (t.r+6)*(t.r+6)) {
              t.alive = false;
              b.hit = true;
              hit = true;
              explode(t.x, t.y, t.skill.color);
              s.score += 100 + s.combo * 25;
              s.combo++;
              s.targetsKilled++;
              s.screenShake = 1;
              setScore(s.score);
              setCombo(s.combo);
              setTargetsKilled(s.targetsKilled);
              setHitMsg({ text: `+${100 + (s.combo-1)*25} ${s.combo > 1 ? `×${s.combo} COMBO!` : ""}`, color: t.skill.color, id: Date.now() });

              // exit after 10 kills
              if (s.targetsKilled >= 10) {
                s.phase = PHASES.EXIT;
                setTimeout(() => setPhase(PHASES.EXIT), 800);
              }
            }
          });

          if (!hit && b.x > W+20) {
            triggerMiss();
            return false;
          }
          if (b.hit) return false;

          // draw trail
          b.trail.forEach((pt, i) => {
            const a = (i / b.trail.length) * 0.6;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3*(i/b.trail.length), 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,180,80,${a})`;
            ctx.fill();
          });

          // glow
          ctx.save();
          ctx.shadowColor = "#FF8C00";
          ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI*2);
          ctx.fillStyle = "#fff"; ctx.fill();
          ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI*2);
          ctx.fillStyle = "#FFD700"; ctx.fill();
          ctx.restore();

          return true;
        });

        // remove dead targets
        s.targets = s.targets.filter(t => t.alive);

        // ── DRAW GUN ──
        ctx.save();
        ctx.translate(gunX + s.recoilOffset, gunY);
        ctx.rotate(s.gunAngle);

        // gun glow
        ctx.shadowColor = "#FF4500";
        ctx.shadowBlur = 24;

        // suppressor
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.roundRect(55, -8, 50, 16, 5); ctx.fill();
        ctx.strokeStyle = "#333"; ctx.lineWidth = 0.5; ctx.stroke();
        // suppressor vents
        for (let i=0; i<5; i++) { ctx.fillStyle="#0a0a0a"; ctx.beginPath(); ctx.roundRect(60+i*8,-5,4,10,1); ctx.fill(); }

        // barrel
        const barGrad = ctx.createLinearGradient(0,-7,0,7);
        barGrad.addColorStop(0,"#ff5533"); barGrad.addColorStop(0.5,"#cc2200"); barGrad.addColorStop(1,"#881100");
        ctx.fillStyle = barGrad;
        ctx.beginPath(); ctx.roundRect(8, -7, 90, 14, 3); ctx.fill();
        ctx.fillStyle = "rgba(255,180,100,0.15)";
        ctx.beginPath(); ctx.roundRect(10,-6,86,5,2); ctx.fill();

        // slide
        const slGrad = ctx.createLinearGradient(0,-15,0,15);
        slGrad.addColorStop(0,"#ff6644"); slGrad.addColorStop(1,"#991100");
        ctx.fillStyle = slGrad;
        ctx.beginPath(); ctx.roundRect(-28,-16,90,32,6); ctx.fill();
        // serrations
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        for (let i=0; i<7; i++) { ctx.beginPath(); ctx.roundRect(-22+i*8,-14,4,28,1); ctx.fill(); }
        // ejection port
        ctx.fillStyle="#330000"; ctx.strokeStyle="#ff4422"; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.roundRect(10,-12,28,14,2); ctx.fill(); ctx.stroke();
        // sights
        ctx.fillStyle="#FFD700"; ctx.shadowColor="#FFD700"; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.roundRect(52,-18,6,8,1); ctx.fill();
        ctx.fillStyle="#cc9900"; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.roundRect(-20,-18,12,7,1); ctx.fill();
        ctx.fillStyle="#1a0a00";
        ctx.beginPath(); ctx.roundRect(-17,-17,6,5,0.5); ctx.fill();

        // frame
        const fmGrad = ctx.createLinearGradient(0,-8,0,16);
        fmGrad.addColorStop(0,"#881100"); fmGrad.addColorStop(1,"#550000");
        ctx.fillStyle = fmGrad; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.roundRect(-28,14,95,18,4); ctx.fill();

        // grip
        const grGrad = ctx.createLinearGradient(0,0,0,55);
        grGrad.addColorStop(0,"#550000"); grGrad.addColorStop(1,"#200000");
        ctx.fillStyle = grGrad;
        ctx.beginPath();
        ctx.moveTo(-20,30); ctx.lineTo(10,30); ctx.lineTo(5,82); ctx.lineTo(-28,82); ctx.closePath();
        ctx.fill();
        // grip texture
        ctx.strokeStyle = "rgba(255,50,0,0.18)"; ctx.lineWidth=1;
        for (let i=0; i<9; i++) { ctx.beginPath(); ctx.moveTo(-25+i*3,32); ctx.lineTo(-28+i*3,80); ctx.stroke(); }
        // grip screw
        ctx.fillStyle="#1a0000"; ctx.strokeStyle="#ff4422"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(-8, 56, 5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle="#ff4422"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(-11,56); ctx.lineTo(-5,56); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8,53); ctx.lineTo(-8,59); ctx.stroke();

        // trigger guard arc
        ctx.strokeStyle="#ff4422"; ctx.lineWidth=3; ctx.fillStyle="none";
        ctx.beginPath(); ctx.arc(5, 30, 22, 0, Math.PI*0.8); ctx.stroke();

        // trigger
        ctx.fillStyle="#FFD700"; ctx.shadowColor="#FFD700"; ctx.shadowBlur=6;
        ctx.beginPath(); ctx.roundRect(6,32,5,14,2); ctx.fill();

        // magazine
        ctx.shadowBlur=0; ctx.fillStyle="#330000"; ctx.strokeStyle="#550000"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(-22,80,32,12,3); ctx.fill(); ctx.stroke();
        ctx.fillStyle="#220000";
        ctx.beginPath(); ctx.roundRect(-19,82,26,8,2); ctx.fill();

        // laser
        ctx.fillStyle="#111"; ctx.beginPath(); ctx.roundRect(8,16,38,10,2); ctx.fill();
        ctx.fillStyle="#003300"; ctx.beginPath(); ctx.roundRect(10,18,14,6,1); ctx.fill();
        ctx.fillStyle="#00ff44"; ctx.shadowColor="#00ff44"; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.arc(26,21,3,0,Math.PI*2); ctx.fill();
        // laser beam
        ctx.shadowBlur=0;
        ctx.save();
        const laserGrad = ctx.createLinearGradient(30,21,300,21);
        laserGrad.addColorStop(0,"rgba(0,255,68,0.6)");
        laserGrad.addColorStop(1,"rgba(0,255,68,0)");
        ctx.strokeStyle = laserGrad; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(30,21); ctx.lineTo(300,21); ctx.stroke();
        ctx.restore();

        // muzzle flash point
        ctx.shadowBlur=0;
        ctx.restore(); // gun transform

        // ── FLASHES ──
        s.flashes = s.flashes.filter(f => {
          f.life -= dt;
          if (f.life<=0) return false;
          const a = f.life / f.maxLife;

          if (f.ring) {
            const progress = 1 - a;
            const r = 20 + progress * 80;
            ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI*2);
            ctx.strokeStyle = f.color;
            ctx.lineWidth = 3*(1-progress);
            ctx.globalAlpha = a*0.7;
            ctx.stroke();
            ctx.globalAlpha = 1;
          } else {
            // muzzle flash
            const muzzleGrad = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,50*(1-(f.life/f.maxLife)*0.5));
            muzzleGrad.addColorStop(0,"rgba(255,255,200,0.9)");
            muzzleGrad.addColorStop(0.3,"rgba(255,140,0,0.6)");
            muzzleGrad.addColorStop(1,"transparent");
            ctx.globalAlpha = a;
            ctx.fillStyle = muzzleGrad;
            ctx.beginPath(); ctx.arc(f.x,f.y,50,0,Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1;
          }
          return true;
        });
      }

      // ── PARTICLES ──
      s.particles = s.particles.filter(p => {
        p.x += p.vx*dt; p.y += p.vy*dt;
        p.vy += (p.gravity||0)*dt;
        p.life -= dt;
        if (p.life<=0) return false;
        const a = p.life / p.maxLife;
        ctx.beginPath(); ctx.arc(p.x,p.y, p.r*a, 0, Math.PI*2);
        ctx.fillStyle = p.color; ctx.globalAlpha=a; ctx.fill(); ctx.globalAlpha=1;
        return true;
      });

      ctx.restore(); // screen shake
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initState, spawnTarget, explode, triggerMiss]);

  // ── MOUSE MOVE ──
  const onMouseMove = useCallback((e) => {
    if (stateRef.current) {
      stateRef.current.mouseX = e.clientX;
      stateRef.current.mouseY = e.clientY;
    }
  }, []);

  // ── CLICK ──
  const onClick = useCallback((e) => {
    if (phase === PHASES.PLAY) shoot();
  }, [phase, shoot]);

  // ── KEY ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key === " ") { e.preventDefault(); shoot(); }
      if (e.key === "r" || e.key === "R") {
        const s = stateRef.current;
        if (!s || s.reloading) return;
        s.reloading = true; setReloading(true);
        setTimeout(() => { if(stateRef.current){stateRef.current.ammo=30;stateRef.current.reloading=false;} setAmmo(30); setReloading(false); }, 2000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shoot]);

  // ── HIT MSG AUTO CLEAR ──
  useEffect(() => {
    if (!hitMsg) return;
    const t = setTimeout(() => setHitMsg(null), 900);
    return () => clearTimeout(t);
  }, [hitMsg]);

  // ── STYLES ──
  const isPlay = phase === PHASES.PLAY;
  const isExit = phase === PHASES.EXIT;
  const isEntry = phase === PHASES.ENTRY;

  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:9999, background:"#020100",
        cursor: isPlay ? "crosshair" : "default",
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      }}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glitchIn { 0%{opacity:0;clip-path:inset(50% 0 50% 0)} 30%{opacity:1;clip-path:inset(20% 0 30% 0)} 60%{clip-path:inset(5% 0 10% 0)} 100%{clip-path:inset(0 0 0 0)} }
        @keyframes gunSlide { from{opacity:0;transform:translateX(-120px) rotate(-15deg)} to{opacity:1;transform:translateX(0) rotate(0deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes hitPop { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(1.4)} }
        @keyframes comboGlow { 0%,100%{text-shadow:0 0 20px #FF8C00} 50%{text-shadow:0 0 40px #FFD700,0 0 80px #FF4500} }
        @keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes reloadBar { from{width:0%} to{width:100%} }
        @keyframes exitFadeIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        .orbitron { font-family:'Orbitron',monospace; }
        .scan::after { content:''; position:absolute; inset:0; background:linear-gradient(transparent 50%,rgba(255,80,0,0.03) 50%); background-size:100% 4px; pointer-events:none; }
      `}</style>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, display:"block" }} />

      {/* Scanline overlay */}
      <div className="scan" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />

      {/* ── ENTRY PHASE ── */}
      {isEntry && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
          {entryStep >= 1 && (
            <div style={{ animation:"glitchIn 0.6s ease forwards", textAlign:"center" }}>
              <div className="orbitron" style={{ fontSize:"clamp(28px,5vw,72px)", fontWeight:900, letterSpacing:"0.15em", color:"#FF4500", textShadow:"0 0 40px #FF4500,0 0 80px #FF2200" }}>
                TEST MY SKILLS
              </div>
              <div style={{ color:"rgba(255,140,0,0.6)", letterSpacing:"0.4em", fontSize:"clamp(10px,1.5vw,14px)", marginTop:12 }}>
                ◈ INTERACTIVE ARENA ◈
              </div>
            </div>
          )}
          {entryStep >= 2 && (
            <div style={{ animation:"fadeIn 0.5s 0.1s ease both", marginTop:48, color:"rgba(255,100,50,0.7)", fontSize:14, letterSpacing:"0.2em" }}>
              INITIALIZING TARGETS...
            </div>
          )}
          {entryStep >= 3 && (
            <div style={{ animation:"fadeIn 0.4s ease both", marginTop:16, color:"rgba(255,200,100,0.5)", fontSize:12, letterSpacing:"0.3em", animation:"pulse 0.6s infinite" }}>
              LOADING WEAPONS SYSTEM...
            </div>
          )}
        </div>
      )}

      {/* ── PLAY HUD ── */}
      {isPlay && (
        <>
          {/* Top bar */}
          <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"18px 24px", pointerEvents:"none" }}>

            {/* Score */}
            <div style={{ background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,80,0,0.4)", padding:"10px 20px", backdropFilter:"blur(8px)" }}>
              <div style={{ color:"rgba(255,80,0,0.6)", fontSize:10, letterSpacing:"0.3em", marginBottom:4 }}>SCORE</div>
              <div className="orbitron" style={{ color:"#FFD700", fontSize:"clamp(22px,3vw,36px)", fontWeight:900, textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>
                {score.toString().padStart(6,"0")}
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign:"center", pointerEvents:"none" }}>
              <div className="orbitron" style={{ color:"#FF4500", fontSize:"clamp(12px,1.8vw,18px)", letterSpacing:"0.3em", textShadow:"0 0 20px #FF4500" }}>
                ◈ SKILL SHOOTER ◈
              </div>
              <div style={{ color:"rgba(255,100,50,0.4)", fontSize:10, letterSpacing:"0.4em", marginTop:4 }}>
                DESTROY {10 - targetsKilled} MORE
              </div>
            </div>

            {/* Combo */}
            <div style={{ background:"rgba(0,0,0,0.7)", border:`1px solid ${combo > 2 ? "rgba(255,215,0,0.6)" : "rgba(255,80,0,0.4)"}`, padding:"10px 20px", backdropFilter:"blur(8px)", textAlign:"right" }}>
              <div style={{ color:"rgba(255,80,0,0.6)", fontSize:10, letterSpacing:"0.3em", marginBottom:4 }}>COMBO</div>
              <div className="orbitron" style={{ color: combo > 2 ? "#FFD700" : "#FF8C00", fontSize:"clamp(22px,3vw,36px)", fontWeight:900, animation: combo > 2 ? "comboGlow 0.6s infinite" : "none" }}>
                {combo > 0 ? `×${combo}` : "—"}
              </div>
            </div>
          </div>

          {/* Ammo bar — bottom center */}
          <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", textAlign:"center", pointerEvents:"none" }}>
            <div style={{ display:"flex", gap:3, justifyContent:"center", marginBottom:6 }}>
              {Array.from({length:30}).map((_,i)=>(
                <div key={i} style={{ width:6, height:16, borderRadius:2, background: i < ammo ? "linear-gradient(180deg,#FFD700,#FF4500)" : "#1a0800", boxShadow: i < ammo ? "0 0 6px rgba(255,100,0,0.6)" : "none", transition:"all 0.1s" }} />
              ))}
            </div>
            <div style={{ color:"rgba(255,100,50,0.6)", fontSize:11, letterSpacing:"0.25em" }}>
              {reloading
                ? <span style={{ color:"#FF4500", animation:"pulse 0.4s infinite" }}>⟳ RELOADING...</span>
                : <>{ammo}<span style={{ opacity:0.4 }}>/30 AMMO · [CLICK] FIRE · [R] RELOAD · [SPACE] FIRE</span></>
              }
            </div>
            {reloading && (
              <div style={{ width:200, height:3, background:"rgba(255,80,0,0.2)", border:"1px solid rgba(255,80,0,0.3)", borderRadius:2, margin:"6px auto 0", overflow:"hidden" }}>
                <div style={{ height:"100%", background:"#FF8C00", animation:"reloadBar 2s linear forwards", boxShadow:"0 0 8px #FF8C00" }} />
              </div>
            )}
          </div>

          {/* Targets left indicator */}
          <div style={{ position:"absolute", left:24, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
            <div style={{ color:"rgba(255,80,0,0.4)", fontSize:10, letterSpacing:"0.3em", marginBottom:8, writingMode:"vertical-rl" }}>TARGETS</div>
            {Array.from({length:10}).map((_,i)=>(
              <div key={i} style={{ width:8, height:8, borderRadius:"50%", margin:"3px auto", background: i < targetsKilled ? "#FF4500" : "rgba(255,80,0,0.15)", border:`1px solid ${i < targetsKilled ? "#FF4500" : "rgba(255,80,0,0.3)"}`, boxShadow: i < targetsKilled ? "0 0 6px #FF4500" : "none", transition:"all 0.2s" }} />
            ))}
          </div>
        </>
      )}

      {/* ── MISS SHAKE ── */}
      {shaking && (
        <div style={{ position:"absolute", inset:0, border:"2px solid rgba(255,0,0,0.3)", pointerEvents:"none", animation:"shake 0.35s ease" }} />
      )}

      {/* ── HIT POPUP ── */}
      {hitMsg && (
        <div key={hitMsg.id} style={{ position:"absolute", top:"35%", left:"50%", transform:"translateX(-50%)", pointerEvents:"none", animation:"hitPop 0.9s ease forwards", whiteSpace:"nowrap" }}>
          <div className="orbitron" style={{ fontSize:"clamp(20px,3vw,38px)", fontWeight:900, color:hitMsg.color, textShadow:`0 0 30px ${hitMsg.color}`, letterSpacing:"0.1em" }}>
            {hitMsg.text}
          </div>
        </div>
      )}

      {/* ── EXIT PHASE ── */}
      {isExit && (
        <div style={{ position:"absolute", inset:0, background:"rgba(2,1,0,0.88)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", animation:"exitFadeIn 0.8s ease forwards", backdropFilter:"blur(4px)" }}>
          <div style={{ textAlign:"center", maxWidth:600, padding:40, border:"1px solid rgba(255,80,0,0.3)", background:"rgba(0,0,0,0.6)" }}>
            <div style={{ color:"rgba(255,80,0,0.5)", fontSize:11, letterSpacing:"0.5em", marginBottom:20 }}>MISSION COMPLETE</div>
            <div className="orbitron" style={{ fontSize:"clamp(24px,4vw,52px)", fontWeight:900, color:"#FFD700", textShadow:"0 0 40px rgba(255,215,0,0.5)", marginBottom:8 }}>
              YOU'VE EXPLORED
            </div>
            <div className="orbitron" style={{ fontSize:"clamp(24px,4vw,52px)", fontWeight:900, color:"#FF4500", textShadow:"0 0 40px rgba(255,80,0,0.5)", marginBottom:32 }}>
              MY SKILLS
            </div>

            {/* Final stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:32 }}>
              {[
                { label:"FINAL SCORE", value: stateRef.current?.score?.toString().padStart(6,"0") || "000000", color:"#FFD700" },
                { label:"TARGETS HIT", value:`${targetsKilled}/10`, color:"#FF8C00" },
                { label:"BEST COMBO", value:`×${combo}`, color:"#FF4500" },
              ].map(s => (
                <div key={s.label} style={{ background:"rgba(255,80,0,0.06)", border:"1px solid rgba(255,80,0,0.2)", padding:"14px 10px" }}>
                  <div style={{ color:"rgba(255,80,0,0.5)", fontSize:9, letterSpacing:"0.3em", marginBottom:6 }}>{s.label}</div>
                  <div className="orbitron" style={{ color:s.color, fontSize:22, fontWeight:900, textShadow:`0 0 16px ${s.color}` }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Skills hit */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:28 }}>
              {SKILLS.map(sk => (
                <div key={sk.name} style={{ padding:"4px 12px", border:`1px solid ${sk.color}44`, color:sk.color, fontSize:11, letterSpacing:"0.15em", background:`${sk.color}11`, fontFamily:"'Share Tech Mono',monospace" }}>
                  {sk.icon} {sk.name}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setPhase(PHASES.ENTRY); setScore(0); setCombo(0); setAmmo(30); setTargetsKilled(0); setHitMsg(null); setEntryStep(0); initState(canvasRef.current); setTimeout(()=>setEntryStep(1),400); }}
              style={{ background:"rgba(255,80,0,0.1)", border:"2px solid #FF4500", color:"#FF4500", padding:"12px 36px", fontSize:13, letterSpacing:"0.3em", cursor:"pointer", fontFamily:"'Orbitron',monospace", fontWeight:700, transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.target.style.background="rgba(255,80,0,0.25)"; e.target.style.textShadow="0 0 20px #FF4500"; }}
              onMouseLeave={e=>{ e.target.style.background="rgba(255,80,0,0.1)"; e.target.style.textShadow="none"; }}
            >
              ⟳ PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}