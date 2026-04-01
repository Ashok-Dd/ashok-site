import { useState, useEffect, useRef, useCallback } from 'react';
import { Flame, Code2, Server, Cpu, Brain, Wrench, Zap, X, Target } from 'lucide-react';
import PortalTrigger from './PortalTrigger';

// ─── SHARED DATA ─────────────────────────────────────────────────────────────
const categoriesData = [
  { id: 'frontend',  name: 'Frontend',  icon: Code2,  skills: ['HTML','CSS','JavaScript','TypeScript','React','Next.js','Tailwind CSS','React Native'] },
  { id: 'backend',   name: 'Backend',   icon: Server, skills: ['Node.js','Express','Socket.IO','MongoDB','PostgreSQL'] },
  { id: 'languages', name: 'Languages', icon: Cpu,    skills: ['C','Python','Java'] },
  { id: 'ai',        name: 'AI & Data', icon: Brain,  skills: ['Machine Learning','Data Visualization','Data Analysis'] },
  { id: 'tools',     name: 'Tools',     icon: Wrench, skills: ['Git','GitBash','VS Code','Postman','Firebase','Vercel'] },
];

const allSkills = categoriesData.flatMap(cat =>
  cat.skills.map(skill => ({ skill, category: cat.id }))
);

const GAME_SKILLS = [
  // 🔷 Frontend
  { name: 'HTML', color: '#E34F26', icon: '<>' },
  { name: 'CSS', color: '#1572B6', icon: '{}' },
  { name: 'JavaScript', color: '#F7DF1E', icon: 'JS' },
  { name: 'TypeScript', color: '#3178C6', icon: 'TS' },
  { name: 'React', color: '#61DAFB', icon: '⚛' },
  { name: 'Next.js', color: '#ffffff', icon: '▲' },
  { name: 'Tailwind CSS', color: '#38BDF8', icon: '💨' },
  { name: 'React Native', color: '#61DAFB', icon: '📱' },

  // 🔶 Backend
  { name: 'Node.js', color: '#68A063', icon: '⬢' },
  { name: 'Express', color: '#aaaaaa', icon: 'EX' },
  { name: 'Socket.IO', color: '#ffffff', icon: '⚡' },
  { name: 'MongoDB', color: '#47A248', icon: '🍃' },
  { name: 'PostgreSQL', color: '#336791', icon: '🐘' },

  // 🟣 Languages
  { name: 'C', color: '#A8B9CC', icon: 'C' },
  { name: 'Python', color: '#FFD43B', icon: '🐍' },
  { name: 'Java', color: '#f89820', icon: '☕' },

  // 🔴 AI & Data
  { name: 'Machine Learning', color: '#FF6F00', icon: '🤖' },
  { name: 'Data Visualization', color: '#FF4081', icon: '📊' },
  { name: 'Data Analysis', color: '#00C853', icon: '📈' },

  // ⚙️ Tools
  { name: 'Git', color: '#F05032', icon: '🔀' },
  { name: 'GitBash', color: '#4EAA25', icon: '💻' },
  { name: 'VS Code', color: '#007ACC', icon: '🧩' },
  { name: 'Postman', color: '#FF6C37', icon: '📮' },
  { name: 'Firebase', color: '#FFCA28', icon: '🔥' },
  { name: 'Vercel', color: '#ffffff', icon: '▲' },

  // 🧠 Core / Extra
  { name: 'DSA', color: '#FF6B6B', icon: '∑' },
  { name: 'GSAP', color: '#88CE02', icon: 'G' },
];

const rand  = (a, b) => a + Math.random() * (b - a);
const randI = (a, b) => Math.floor(rand(a, b));

// ═══════════════════════════════════════════════════════════════════════════
// SKILL SHOOTER GAME
// ═══════════════════════════════════════════════════════════════════════════
function SkillShooter({ onExit }) {
  const canvasRef = useRef(null);
  const gsRef     = useRef(null);   // entire mutable game state lives here
  const rafRef    = useRef(null);

  // React state — only for HUD rendering
  const [hud, setHud]         = useState({ score: 0, combo: 0, ammo: 30, kills: 0, phase: 'entry' });
  const [reloading, setReloading]   = useState(false);
  const [hitLabel, setHitLabel]     = useState(null);  // { text, color, id }
  const [entryStep, setEntryStep]   = useState(0);
  const [shaking,  setShaking]      = useState(false);

  // ── helpers to sync hud ──
  const syncHud = useCallback(() => {
    const s = gsRef.current;
    if (!s) return;
    setHud({ score: s.score, combo: s.combo, ammo: s.ammo, kills: s.kills, phase: s.phase });
  }, []);

  // ── init mutable state ──
  const initGs = useCallback(() => {
    gsRef.current = {
      phase:       'entry',
      score:       0,
      combo:       0,
      ammo:        30,
      kills:       0,
      maxKills:    20,
      reloading:   false,
      gunAngle:    0,
      mouseX:      window.innerWidth  / 2,
      mouseY:      window.innerHeight / 2,
      recoilX:     0,
      screenShake: 0,
      spawnTimer:  0,
      spawnRate:   2000,
      bullets:     [],
      targets:     [],
      particles:   [],
      flashes:     [],
      floatT:      0,
      bestCombo:   0,
    };
  }, []);

  // ── entry sequence ──
  const startEntry = useCallback(() => {
    setEntryStep(0);
    const t1 = setTimeout(() => setEntryStep(1), 300);
    const t2 = setTimeout(() => setEntryStep(2), 1400);
    const t3 = setTimeout(() => setEntryStep(3), 2400);
    const t4 = setTimeout(() => {
      if (gsRef.current) gsRef.current.phase = 'play';
      setEntryStep(4);
      syncHud();
    }, 3400);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [syncHud]);

  // ── shoot ──
  const shoot = useCallback(() => {
    const s = gsRef.current;
    if (!s || s.phase !== 'play' || s.reloading) return;
    if (s.ammo <= 0) return;

    const canvas = canvasRef.current;
    const GX = canvas.width  * 0.13;
    const GY = canvas.height * 0.80;
    const ang = s.gunAngle;
    const tipX = GX + Math.cos(ang) * 90;
    const tipY = GY + Math.sin(ang) * 90;

    s.bullets.push({
      x: tipX, y: tipY,
      vx: Math.cos(ang) * 900,
      vy: Math.sin(ang) * 900,
      trail: [],
      alive: true,
    });

    s.flashes.push({ x: tipX, y: tipY, life: 1, type: 'muzzle' });

    // muzzle particles
    for (let i = 0; i < 12; i++) {
      const a = ang + rand(-0.5, 0.5);
      const spd = rand(60, 200);
      s.particles.push({
        x: tipX, y: tipY,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: rand(2, 5), life: 1, decay: rand(2.5, 5),
        color: ['#FF8C00','#FFD700','#FF4500','#fff'][randI(0,4)], gravity: 80,
      });
    }

    s.ammo--;
    s.recoilX = -20;
    syncHud();
  }, [syncHud]);

  const doReload = useCallback(() => {
    const s = gsRef.current;
    if (!s || s.reloading || s.ammo >= 30) return;
    s.reloading = true;
    setReloading(true);
    setTimeout(() => {
      if (gsRef.current) { gsRef.current.ammo = 30; gsRef.current.reloading = false; }
      setReloading(false);
      syncHud();
    }, 1800);
  }, [syncHud]);

  // ── canvas loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width  = canvas.parentElement.clientWidth  || window.innerWidth;
      H = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    initGs();
    const cleanEntry = startEntry();

    // star field
    const STARS = Array.from({ length: 100 }, () => ({
      x: rand(0, 1), y: rand(0, 1), r: rand(0.4, 1.8), t: rand(0, Math.PI * 2),
    }));

    let lastTs = performance.now();

    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      const s = gsRef.current;
      if (!s) return;
      W = canvas.width; H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // ── BACKGROUND ──
      const bg = ctx.createRadialGradient(W*.5, H*.4, 0, W*.5, H*.5, Math.max(W,H)*.9);
      bg.addColorStop(0, '#0e0500'); bg.addColorStop(.6, '#060200'); bg.addColorStop(1,'#020100');
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      // grid
      ctx.save(); ctx.strokeStyle = 'rgba(255,70,0,0.05)'; ctx.lineWidth = 1;
      const gs = 55;
      for (let gx=0; gx<W; gx+=gs) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
      for (let gy=0; gy<H; gy+=gs) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }
      ctx.restore();

      // stars
      STARS.forEach(st => {
        st.t += dt * 1.2;
        const a = 0.25 + Math.sin(st.t) * 0.15;
        ctx.beginPath(); ctx.arc(st.x*W, st.y*H, st.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,200,150,${a})`; ctx.fill();
      });

      // vignette
      const vig = ctx.createRadialGradient(W*.5,H*.5,H*.15,W*.5,H*.5,H*.9);
      vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(255,20,0,0.06)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

      // ── SCREEN SHAKE ──
      let sx=0, sy=0;
      if (s.screenShake > 0) {
        s.screenShake = Math.max(0, s.screenShake - dt*7);
        sx = (Math.random()-0.5)*10*s.screenShake;
        sy = (Math.random()-0.5)*10*s.screenShake;
      }
      ctx.save(); ctx.translate(sx, sy);

      // ── RECOIL ──
      s.recoilX += (0 - s.recoilX) * 0.2;
      s.floatT  += dt;
      const floatY = Math.sin(s.floatT * 1.3) * 7;

      // ─ GUN (only in play/entry) ─
      if (s.phase === 'play' || s.phase === 'entry') {
        const GX = W * 0.13 + s.recoilX;
        const GY = H * 0.80 + floatY;

        const tAng = Math.atan2(s.mouseY - GY, s.mouseX - GX);
        s.gunAngle += (tAng - s.gunAngle) * 0.16;
        const ang = s.gunAngle;

        ctx.save();
        ctx.translate(GX, GY);
        ctx.rotate(ang);
        ctx.shadowColor = '#FF4500'; ctx.shadowBlur = 18;

        // suppressor
        ctx.fillStyle='#111'; roundRect(ctx, 60,-8,52,16,5); ctx.fill();
        for (let i=0;i<5;i++) { ctx.fillStyle='#0a0a0a'; roundRect(ctx,64+i*9,-5,5,10,1); ctx.fill(); }

        // barrel
        const bGr = ctx.createLinearGradient(0,-7,0,7);
        bGr.addColorStop(0,'#ff5533'); bGr.addColorStop(.5,'#cc2200'); bGr.addColorStop(1,'#881100');
        ctx.fillStyle=bGr; roundRect(ctx,8,-7,88,14,3); ctx.fill();
        ctx.fillStyle='rgba(255,180,100,0.15)'; roundRect(ctx,10,-6,84,5,2); ctx.fill();

        // slide
        const sGr=ctx.createLinearGradient(0,-16,0,16);
        sGr.addColorStop(0,'#ff6644'); sGr.addColorStop(1,'#991100');
        ctx.fillStyle=sGr; roundRect(ctx,-30,-17,92,34,6); ctx.fill();
        ctx.fillStyle='rgba(0,0,0,0.3)';
        for(let i=0;i<7;i++){roundRect(ctx,-24+i*9,-15,5,30,1); ctx.fill();}
        ctx.fillStyle='#330000'; ctx.strokeStyle='#ff4422'; ctx.lineWidth=.6;
        roundRect(ctx,8,-13,30,15,2); ctx.fill(); ctx.stroke();

        // sights
        ctx.fillStyle='#FFD700'; ctx.shadowColor='#FFD700'; ctx.shadowBlur=10;
        roundRect(ctx,52,-20,7,9,1); ctx.fill();
        ctx.fillStyle='#bb8800'; ctx.shadowBlur=0;
        roundRect(ctx,-22,-20,13,7,1); ctx.fill();

        // frame
        const fGr=ctx.createLinearGradient(0,-8,0,18);
        fGr.addColorStop(0,'#881100'); fGr.addColorStop(1,'#550000');
        ctx.fillStyle=fGr; ctx.shadowBlur=0; roundRect(ctx,-30,15,97,18,4); ctx.fill();

        // grip
        const gGr=ctx.createLinearGradient(0,30,0,88);
        gGr.addColorStop(0,'#550000'); gGr.addColorStop(1,'#1e0000');
        ctx.fillStyle=gGr;
        ctx.beginPath(); ctx.moveTo(-22,30); ctx.lineTo(12,30); ctx.lineTo(6,86); ctx.lineTo(-30,86); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='rgba(255,50,0,0.18)'; ctx.lineWidth=1;
        for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(-26+i*3.5,32);ctx.lineTo(-29+i*3.5,84);ctx.stroke();}
        ctx.fillStyle='#1a0000'; ctx.strokeStyle='#ff4422'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(-6,58,5,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle='#ff4422'; ctx.lineWidth=.8;
        ctx.beginPath(); ctx.moveTo(-9,58); ctx.lineTo(-3,58); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6,55); ctx.lineTo(-6,61); ctx.stroke();

        // trigger guard
        ctx.strokeStyle='#ff4422'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(6,30,23,0,Math.PI*.8); ctx.stroke();

        // trigger
        ctx.fillStyle='#FFD700'; ctx.shadowColor='#FFD700'; ctx.shadowBlur=8;
        roundRect(ctx,7,34,5,14,2); ctx.fill();

        // magazine
        ctx.shadowBlur=0; ctx.fillStyle='#330000'; ctx.strokeStyle='#550000'; ctx.lineWidth=1;
        roundRect(ctx,-24,83,33,12,3); ctx.fill(); ctx.stroke();

        // laser sight
        ctx.fillStyle='#111'; roundRect(ctx,8,17,40,10,2); ctx.fill();
        ctx.fillStyle='#00ff44'; ctx.shadowColor='#00ff44'; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.arc(28,22,3,0,Math.PI*2); ctx.fill();
        const lGr=ctx.createLinearGradient(32,22,350,22);
        lGr.addColorStop(0,'rgba(0,255,68,0.5)'); lGr.addColorStop(1,'rgba(0,255,68,0)');
        ctx.shadowBlur=0; ctx.strokeStyle=lGr; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(32,22); ctx.lineTo(350,22); ctx.stroke();

        ctx.restore();
      }

      // ─ TARGETS ─
      if (s.phase === 'play') {
        // spawn
        s.spawnTimer += dt * 1000;
        if (s.spawnTimer >= s.spawnRate && s.targets.length < 6) {
          spawnTarget(s, W, H);
          s.spawnTimer = 0;
          s.spawnRate = Math.max(800, s.spawnRate - 20);
        }

        s.targets.forEach(t => {
          if (!t.alive) return;
          t.age += dt;
          t.x += t.vx * dt; t.y += t.vy * dt;
          if (t.x < t.r)  { t.x = t.r;   t.vx = Math.abs(t.vx); }
          if (t.x > W-t.r){ t.x = W-t.r; t.vx = -Math.abs(t.vx); }
          if (t.y < t.r)  { t.y = t.r;   t.vy = Math.abs(t.vy); }
          if (t.y > H-t.r){ t.y = H-t.r; t.vy = -Math.abs(t.vy); }

          const pulse = 1 + Math.sin(t.age * 2.5) * 0.055;
          const R = t.r * pulse;

          ctx.save();

          // outer spin ring
          ctx.save(); ctx.translate(t.x,t.y); ctx.rotate(t.age*1.5);
          for(let seg=0;seg<8;seg++){
            const a1=(seg/8)*Math.PI*2, a2=a1+Math.PI*2/8*.55;
            ctx.beginPath(); ctx.arc(0,0,R+10,a1,a2);
            ctx.strokeStyle=t.skill.color; ctx.lineWidth=2.5; ctx.globalAlpha=0.65; ctx.stroke();
          }
          ctx.restore();

          // body glow
          const gr=ctx.createRadialGradient(t.x,t.y,0,t.x,t.y,R);
          gr.addColorStop(0, t.skill.color+'44'); gr.addColorStop(.7, t.skill.color+'18'); gr.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(t.x,t.y,R,0,Math.PI*2);
          ctx.fillStyle=gr; ctx.globalAlpha=1; ctx.fill();

          // border
          ctx.beginPath(); ctx.arc(t.x,t.y,R,0,Math.PI*2);
          ctx.strokeStyle=t.skill.color; ctx.lineWidth=2.2; ctx.globalAlpha=0.85; ctx.stroke();

          // crosshairs
          ctx.strokeStyle=t.skill.color; ctx.lineWidth=1; ctx.globalAlpha=0.3;
          ctx.beginPath(); ctx.moveTo(t.x-R*.85,t.y); ctx.lineTo(t.x+R*.85,t.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(t.x,t.y-R*.85); ctx.lineTo(t.x,t.y+R*.85); ctx.stroke();
          [0.5,0.28].forEach(f=>{
            ctx.beginPath(); ctx.arc(t.x,t.y,R*f,0,Math.PI*2); ctx.stroke();
          });

          ctx.globalAlpha=1;
          // icon
          ctx.font=`bold ${Math.floor(R*.58)}px monospace`;
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillStyle=t.skill.color; ctx.shadowColor=t.skill.color; ctx.shadowBlur=14;
          ctx.fillText(t.skill.icon, t.x, t.y-R*.08);
          ctx.shadowBlur=0;
          // name
          ctx.font=`bold 11px 'Courier New',monospace`;
          ctx.fillStyle='#fff'; ctx.globalAlpha=0.8;
          ctx.fillText(t.skill.name, t.x, t.y+R*.58);
          ctx.globalAlpha=1; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
          ctx.restore();
        });

        // ─ BULLETS ─
        const dead = [];
        s.bullets.forEach((b, bi) => {
          if (!b.alive) { dead.push(bi); return; }
          b.x += b.vx * dt; b.y += b.vy * dt;
          b.trail.push({ x:b.x, y:b.y });
          if (b.trail.length > 14) b.trail.shift();

          // hit check
          let hit = false;
          for (let ti=0; ti<s.targets.length; ti++) {
            const t = s.targets[ti];
            if (!t.alive) continue;
            const dx=b.x-t.x, dy=b.y-t.y;
            if (dx*dx+dy*dy < (t.r+8)*(t.r+8)) {
              t.alive = false;
              b.alive = false;
              hit = true;

              explodeTarget(s, t.x, t.y, t.skill.color);
              s.screenShake = 1;

              s.kills++;
              s.combo++;
              if (s.combo > s.bestCombo) s.bestCombo = s.combo;
              const pts = 100 + (s.combo - 1) * 50;
              s.score += pts;

              const label = s.combo >= 3
                ? `🔥 ${pts}  ×${s.combo} COMBO!`
                : `+${pts}`;

              setHitLabel({ text: label, color: t.skill.color, id: Date.now() });
              syncHud();

              if (s.kills >= s.maxKills) {
                setTimeout(() => {
                  if (gsRef.current) gsRef.current.phase = 'exit';
                  syncHud();
                }, 600);
              }
              break;
            }
          }

          // miss — left screen entirely
          if (!hit && (b.x > W+60 || b.x < -60 || b.y > H+60 || b.y < -60)) {
            b.alive = false;
            // miss only resets combo if bullet clearly missed (went off screen)
            if (s.combo > 0) {
              s.combo = 0;
              syncHud();
            }
          }

          if (!b.alive) { dead.push(bi); }

          // draw trail
          b.trail.forEach((pt,i) => {
            const a = (i/b.trail.length)*0.55;
            ctx.beginPath(); ctx.arc(pt.x,pt.y,3*(i/b.trail.length),0,Math.PI*2);
            ctx.fillStyle=`rgba(255,175,70,${a})`; ctx.fill();
          });
          // bullet core glow
          ctx.save();
          ctx.shadowColor='#FF8C00'; ctx.shadowBlur=18;
          ctx.beginPath(); ctx.arc(b.x,b.y,5.5,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
          ctx.beginPath(); ctx.arc(b.x,b.y,3.5,0,Math.PI*2); ctx.fillStyle='#FFD700'; ctx.fill();
          ctx.restore();
        });
        // prune dead bullets (reverse so indices stay valid)
        for (let i=dead.length-1;i>=0;i--) s.bullets.splice(dead[i],1);

        // prune dead targets
        s.targets = s.targets.filter(t=>t.alive);
      }

      // ─ PARTICLES ─
      s.particles = s.particles.filter(p => {
        p.life = Math.max(0, p.life - dt * p.decay);
        if (p.life<=0) return false;
        p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=(p.gravity||0)*dt;
        const a=p.life;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.globalAlpha=a; ctx.fill(); ctx.globalAlpha=1;
        return true;
      });

      // ─ FLASHES ─
      s.flashes = s.flashes.filter(f => {
        f.life = Math.max(0, f.life - dt * (f.type==='muzzle' ? 8 : 3));
        if (f.life<=0) return false;
        const a=f.life;
        if (f.type==='muzzle') {
          const mg=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,55*(1-a*.5));
          mg.addColorStop(0,`rgba(255,255,200,${a*.9})`);
          mg.addColorStop(.4,`rgba(255,140,0,${a*.6})`);
          mg.addColorStop(1,'transparent');
          ctx.globalAlpha=a; ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(f.x,f.y,55,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
        } else {
          // ring shockwave
          const progress = 1 - a;
          const r = 15 + progress * 75;
          ctx.beginPath(); ctx.arc(f.x,f.y,r,0,Math.PI*2);
          ctx.strokeStyle=f.color; ctx.lineWidth=3*(a); ctx.globalAlpha=a*.7; ctx.stroke(); ctx.globalAlpha=1;
        }
        return true;
      });

      ctx.restore(); // screen shake
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      if (cleanEntry) cleanEntry();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── keyboard ──
  useEffect(() => {
    const down = (e) => {
      if (e.key===' ') { e.preventDefault(); shoot(); }
      if (e.key==='r'||e.key==='R') doReload();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [shoot, doReload]);

  // ── hit label auto-clear ──
  useEffect(() => {
    if (!hitLabel) return;
    const t = setTimeout(() => setHitLabel(null), 1000);
    return () => clearTimeout(t);
  }, [hitLabel]);

  const isPlay = hud.phase === 'play';
  const isExit = hud.phase === 'exit';
  const isEntry= hud.phase === 'entry';
  const ammoPercent = (hud.ammo / 30) * 100;

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', overflowY:'hidden', background:'#020100', cursor: isPlay ? 'crosshair' : 'default' }}
      onMouseMove={e => { if(gsRef.current){ gsRef.current.mouseX=e.clientX; gsRef.current.mouseY=e.clientY; } }}
      onClick={() => { if(isPlay) shoot(); }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');
        @keyframes ssGlitch {
          0%{opacity:0;clip-path:inset(60% 0 40% 0)} 25%{opacity:1;clip-path:inset(20% 0 30% 0)}
          55%{clip-path:inset(5% 0 8% 0)} 100%{clip-path:inset(0 0 0 0)}
        }
        @keyframes ssFadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ssPulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes ssHitPop   { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-120%) scale(1.5)} }
        @keyframes ssShake    { 0%,100%{transform:translate(0)} 20%{transform:translate(-7px,3px)} 40%{transform:translate(7px,-3px)} 60%{transform:translate(-5px,2px)} 80%{transform:translate(4px,-4px)} }
        @keyframes ssReload   { from{width:0} to{width:100%} }
        @keyframes ssExitIn   { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        @keyframes ssOrbit    { to{transform:translate(-50%,-50%) rotate(360deg) translateX(80px) rotate(-360deg)} }
        .ss-orb { font-family:'Orbitron',monospace; }
        .ss-mono{ font-family:'Share Tech Mono','Courier New',monospace; }
      `}</style>

      {/* ── CANVAS ── */}
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, display:'block', width:'100%', height:'100%' }} />

      {/* ── ENTRY OVERLAY ── */}
      {isEntry && (
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none',zIndex:10 }}>
          {entryStep>=1 && (
            <div style={{ animation:'ssGlitch .65s ease forwards', textAlign:'center' }}>
              <div className="ss-orb" style={{ fontSize:'clamp(26px,6vw,72px)', fontWeight:900, letterSpacing:'.15em', color:'#FF4500',  }}>
                TEST MY SKILLS
              </div>
              <div className="ss-mono" style={{ color:'rgba(255,140,0,.55)', letterSpacing:'.4em', fontSize:'clamp(9px,1.2vw,13px)', marginTop:10 }}>
                ◈ INTERACTIVE ARENA ◈
              </div>
            </div>
          )}
          {entryStep>=2 && (
            <div className="ss-mono" style={{ animation:'ssFadeUp .5s ease both', marginTop:44, color:'rgba(255,100,50,.65)', fontSize:13, letterSpacing:'.2em' }}>
              INITIALIZING TARGETS...
            </div>
          )}
          {entryStep>=3 && (
            <div className="ss-mono" style={{ animation:'ssPulse .6s infinite', marginTop:12, color:'rgba(255,200,100,.45)', fontSize:12, letterSpacing:'.3em' }}>
              LOADING WEAPONS SYSTEM...
            </div>
          )}
        </div>
      )}

      {/* ── PLAY HUD ── */}
      {isPlay && (
        <>
          {/* Top bar */}
          <div style={{ position:'absolute',top:0,left:0,right:0,display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'16px 22px',pointerEvents:'none',zIndex:10 }}>

            {/* Score */}
            <div style={{ background:'rgba(0,0,0,.75)',border:'1px solid rgba(255,80,0,.4)',padding:'10px 18px',backdropFilter:'blur(8px)' }}>
              <div className="ss-mono" style={{ color:'rgba(255,80,0,.55)', fontSize:9, letterSpacing:'.35em', marginBottom:3 }}>SCORE</div>
              <div className="ss-orb" style={{ color:'#FFD700', fontSize:'clamp(20px,2.8vw,34px)', fontWeight:900, textShadow:'0 0 18px rgba(255,215,0,.5)' }}>
                {String(hud.score).padStart(6,'0')}
              </div>
            </div>

            {/* Center title */}
            <div style={{ textAlign:'center' }}>
              <div className="ss-orb" style={{ color:'#FF4500', fontSize:'clamp(11px,1.6vw,17px)', letterSpacing:'.3em', textShadow:'0 0 18px #FF4500' }}>
                ◈ SKILL SHOOTER ◈
              </div>
              <div className="ss-mono" style={{ color:'rgba(255,100,50,.4)', fontSize:10, letterSpacing:'.35em', marginTop:4 }}>
                DESTROY {gsRef.current?.maxKills - hud.kills} MORE
              </div>
            </div>

            {/* Combo */}
            <div style={{ background:'rgba(0,0,0,.75)', border:`1px solid ${hud.combo>=3?'rgba(255,215,0,.6)':'rgba(255,80,0,.4)'}`, padding:'10px 18px', backdropFilter:'blur(8px)', textAlign:'right' }}>
              <div className="ss-mono" style={{ color:'rgba(255,80,0,.55)', fontSize:9, letterSpacing:'.35em', marginBottom:3 }}>COMBO</div>
              <div className="ss-orb" style={{ color:hud.combo>=3?'#FFD700':'#FF8C00', fontSize:'clamp(20px,2.8vw,34px)', fontWeight:900,
                textShadow: hud.combo>=3?'0 0 20px #FFD700,0 0 40px #FF8C00':'none',
                animation: hud.combo>=5?'ssPulse .4s infinite':'none' }}>
                {hud.combo > 0 ? `×${hud.combo}` : '—'}
              </div>
            </div>
          </div>

          {/* Exit button — top right corner */}
          <button
            style={{ position:'absolute',top:16,right:22,zIndex:20,pointerEvents:'all',background:'rgba(255,50,0,.08)',border:'1px solid rgba(255,80,0,.3)',color:'rgba(255,80,0,.6)',padding:'7px 16px',fontSize:11,letterSpacing:'.25em',cursor:'pointer',fontFamily:"'Orbitron',monospace",transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,50,0,.2)';e.currentTarget.style.color='#FF4500';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,50,0,.08)';e.currentTarget.style.color='rgba(255,80,0,.6)';}}
            onClick={e=>{ e.stopPropagation(); if(onExit) onExit(); }}
          >← EXIT</button>

          {/* Kills progress — left side */}
          <div style={{ position:'absolute',left:18,top:'50%',transform:'translateY(-50%)',zIndex:10,pointerEvents:'none' }}>
            <div className="ss-mono" style={{ color:'rgba(255,80,0,.4)', fontSize:9, letterSpacing:'.3em', marginBottom:8, writingMode:'vertical-rl', textAlign:'center' }}>KILLS</div>
            {Array.from({length:20}).map((_,i)=>(
              <div key={i} style={{ width:7,height:7,borderRadius:'50%',margin:'3px auto',
                background: i<hud.kills?'#FF4500':'rgba(255,80,0,.12)',
                border:`1px solid ${i<hud.kills?'#FF4500':'rgba(255,80,0,.25)'}`,
                boxShadow: i<hud.kills?'0 0 6px #FF4500':'none',
                transition:'all .2s'
              }} />
            ))}
          </div>

          {/* Ammo + controls — bottom center */}
          <div style={{ position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:10,pointerEvents:'none' }}>
            <div style={{ display:'flex',gap:3,justifyContent:'center',marginBottom:7 }}>
              {Array.from({length:30}).map((_,i)=>(
                <div key={i} style={{ width:5,height:14,borderRadius:2,
                  background: i<hud.ammo?'linear-gradient(180deg,#FFD700,#FF4500)':'#180800',
                  boxShadow: i<hud.ammo?'0 0 5px rgba(255,100,0,.55)':'none',
                  transition:'background .1s'
                }} />
              ))}
            </div>
            <div className="ss-mono" style={{ fontSize:11, color:'rgba(255,100,50,.55)', letterSpacing:'.2em' }}>
              {reloading
                ? <span style={{ color:'#FF4500', animation:'ssPulse .4s infinite' }}>⟳ RELOADING...</span>
                : <>{hud.ammo}<span style={{ opacity:.4 }}>/30  ·  CLICK or SPACE to fire  ·  R reload</span></>
              }
            </div>
            {reloading && (
              <div style={{ width:180,height:3,background:'rgba(255,80,0,.15)',border:'1px solid rgba(255,80,0,.3)',borderRadius:2,margin:'6px auto 0',overflow:'hidden' }}>
                <div style={{ height:'100%',background:'#FF8C00',animation:'ssReload 1.8s linear forwards',boxShadow:'0 0 8px #FF8C00' }} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HIT LABEL ── */}
      {hitLabel && isPlay && (
        <div key={hitLabel.id} style={{ position:'absolute',top:'38%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:30,animation:'ssHitPop 1s ease forwards',whiteSpace:'nowrap' }}>
          <div className="ss-orb" style={{ fontSize:'clamp(18px,3vw,36px)', fontWeight:900, color:hitLabel.color, textShadow:`0 0 28px ${hitLabel.color}`, letterSpacing:'.08em' }}>
            {hitLabel.text}
          </div>
        </div>
      )}

      {/* ── EXIT SCREEN ── */}
      {isExit && (
        <div style={{ position:'absolute',inset:0,background:'rgba(2,1,0,.92)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',animation:'ssExitIn .75s ease forwards',backdropFilter:'blur(6px)',zIndex:20 }}>
          <div style={{ textAlign:'center',maxWidth:580,padding:'36px 40px',border:'1px solid rgba(255,80,0,.3)',background:'rgba(0,0,0,.65)' }}>
            <div className="ss-mono" style={{ color:'rgba(255,80,0,.5)', fontSize:10, letterSpacing:'.5em', marginBottom:18 }}>MISSION COMPLETE</div>
            <div className="ss-orb" style={{ fontSize:'clamp(22px,4vw,50px)', fontWeight:900, color:'#FFD700', textShadow:'0 0 40px rgba(255,215,0,.5)', marginBottom:6 }}>
              YOU'VE EXPLORED
            </div>
            <div className="ss-orb" style={{ fontSize:'clamp(22px,4vw,50px)', fontWeight:900, color:'#FF4500', textShadow:'0 0 40px rgba(255,80,0,.5)', marginBottom:28 }}>
              MY SKILLS
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24 }}>
              {[
                { label:'FINAL SCORE', value:String(hud.score).padStart(6,'0'), color:'#FFD700' },
                { label:'TARGETS HIT',  value:`${hud.kills}/10`, color:'#FF8C00' },
                { label:'BEST COMBO',   value:`×${gsRef.current?.bestCombo||0}`, color:'#FF4500' },
              ].map(s=>(
                <div key={s.label} style={{ background:'rgba(255,80,0,.06)',border:'1px solid rgba(255,80,0,.18)',padding:'12px 8px' }}>
                  <div className="ss-mono" style={{ color:'rgba(255,80,0,.5)',fontSize:8,letterSpacing:'.3em',marginBottom:5 }}>{s.label}</div>
                  <div className="ss-orb" style={{ color:s.color,fontSize:20,fontWeight:900,textShadow:`0 0 14px ${s.color}` }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Skill tags */}
            <div style={{ display:'flex',flexWrap:'wrap',gap:7,justifyContent:'center',marginBottom:26 }}>
              {GAME_SKILLS.map(sk=>(
                <div key={sk.name} className="ss-mono" style={{ padding:'3px 10px',border:`1px solid ${sk.color}44`,color:sk.color,fontSize:11,letterSpacing:'.12em',background:`${sk.color}11` }}>
                  {sk.icon} {sk.name}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap' }}>
              <button
                onClick={e=>{ e.stopPropagation(); initGs(); startEntry(); syncHud(); setReloading(false); setHitLabel(null); }}
                className="ss-orb"
                style={{ background:'rgba(255,80,0,.1)',border:'2px solid #FF4500',color:'#FF4500',padding:'11px 30px',fontSize:12,letterSpacing:'.3em',cursor:'pointer',fontWeight:700,transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,80,0,.25)';e.currentTarget.style.textShadow='0 0 18px #FF4500';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,80,0,.1)';e.currentTarget.style.textShadow='none';}}
              >⟳ PLAY AGAIN</button>
              {onExit && (
                <button
                  onClick={e=>{ e.stopPropagation(); onExit(); }}
                  className="ss-orb"
                  style={{ background:'rgba(255,255,255,.04)',border:'2px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.5)',padding:'11px 30px',fontSize:12,letterSpacing:'.3em',cursor:'pointer',fontWeight:700,transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.12)';e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='rgba(255,255,255,.5)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.04)';e.currentTarget.style.color='rgba(255,255,255,.5)';e.currentTarget.style.borderColor='rgba(255,255,255,.2)';}}
                >← BACK TO SKILLS</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── helpers (outside component, no re-alloc) ──
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function spawnTarget(s, W, H) {
  const skill = GAME_SKILLS[randI(0, GAME_SKILLS.length)];
  const edge  = randI(0, 4);
  const margin = 60;
  let x, y;
  if      (edge===0) { x=rand(margin,W-margin); y=-55; }
  else if (edge===1) { x=W+55; y=rand(margin,H-margin); }
  else if (edge===2) { x=rand(margin,W-margin); y=H+55; }
  else               { x=-55; y=rand(margin,H-margin); }

  const cx = W*.5+rand(-100,100), cy = H*.5+rand(-80,80);
  const dx=cx-x, dy=cy-y, dist=Math.sqrt(dx*dx+dy*dy);
  const spd=rand(50,90);

  s.targets.push({ x,y, vx:(dx/dist)*spd, vy:(dy/dist)*spd, r:42, alive:true, age:0, skill });
}

function explodeTarget(s, x, y, color) {
  for (let i=0;i<30;i++){
    const a=rand(0,Math.PI*2), spd=rand(55,280);
    s.particles.push({ x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-30, r:rand(3,10), life:1, decay:rand(1.2,2.5), color:[color,'#fff','#FFD700'][randI(0,3)], gravity:130 });
  }
  s.flashes.push({ x,y, life:1, type:'ring', color });
}


// ═══════════════════════════════════════════════════════════════════════════
// PORTAL TRIGGER
// ═══════════════════════════════════════════════════════════════════════════
// function PortalTrigger({ onClick }) {
//   const [hovered, setHovered] = useState(false);
//   const [pulseScale, setPulseScale] = useState(1);

//   useEffect(() => {
//     let dir = 1, val = 1;
//     const id = setInterval(() => {
//       val += dir * 0.008;
//       if (val > 1.06) dir = -1;
//       if (val < 0.97) dir = 1;
//       setPulseScale(val);
//     }, 16);
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:16,cursor:'pointer',userSelect:'none',marginTop:48 }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       onClick={onClick}
//     >
//       <div style={{ fontFamily:"'Share Tech Mono',monospace", color:'rgba(255,80,0,.45)', fontSize:10, letterSpacing:'.45em' }}>
//         ◈ INTERACTIVE EXPERIENCE ◈
//       </div>

//       {/* Portal */}
//       <div style={{ position:'relative',width:220,height:220,display:'flex',alignItems:'center',justifyContent:'center' }}>
//         {/* glow blob */}
//         <div style={{ position:'absolute',width:140,height:140,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,50,0,.5) 0%,rgba(255,80,0,.12) 55%,transparent 70%)',filter:'blur(18px)',opacity: hovered ? 1 : 0.55, transform:`scale(${pulseScale})`,transition:'opacity .3s' }} />

//         {/* rings */}
//         <div style={{ position:'absolute',width:204,height:204,borderRadius:'50%',border:'2px dashed rgba(255,70,0,.4)',animation:'portalSpin 11s linear infinite',transform:`scale(${hovered?1.1:pulseScale})`,transition:'transform .35s',boxShadow: hovered?'0 0 20px rgba(255,70,0,.3)':'none' }} />
//         <div style={{ position:'absolute',width:170,height:170,borderRadius:'50%',border:'1.5px solid rgba(255,100,30,.28)',animation:'portalSpinR 7s linear infinite' }} />
//         <div style={{ position:'absolute',width:138,height:138,borderRadius:'50%',border:'2px solid rgba(255,60,0,.6)',boxShadow:'0 0 22px rgba(255,50,0,.4),inset 0 0 22px rgba(255,50,0,.12)',animation:'portalSpin 4.5s linear infinite' }} />

//         {/* orbit dots */}
//         {[0,1,2,3,4,5].map(i=>(
//           <div key={i} style={{ position:'absolute',width:6,height:6,borderRadius:'50%',background:i%2?'#FFD700':'#FF4500',boxShadow:`0 0 7px ${i%2?'#FFD700':'#FF4500'}`,top:'50%',left:'50%',animation:'portalOrbit 4.8s linear infinite',animationDelay:`${-(i*4.8/6)}s`,transformOrigin:'0 0',transform:`translate(-50%,-50%) rotate(${i*60}deg) translateX(96px)` }} />
//         ))}

//         {/* hex center */}
//         <div style={{ width:84,height:84,background:'linear-gradient(135deg,#7f0000,#cc1500 50%,#ff4500)',clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:`0 0 ${hovered?'40px':'24px'} rgba(255,50,0,.7)`,transition:'box-shadow .3s',position:'relative',zIndex:2 }}>
//           <Target style={{ width:26,height:26,color:'#fff',marginBottom:3 }} />
//           <span style={{ fontFamily:"'Orbitron',monospace",fontSize:7,fontWeight:900,letterSpacing:'.12em',color:'rgba(255,255,255,.9)' }}>ARENA</span>
//         </div>
//       </div>

//       {/* Text */}
//       <div style={{ fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:'clamp(14px,2.2vw,24px)',letterSpacing: hovered?'.25em':'.15em',color:'#FF4500',textShadow: hovered?'0 0 28px rgba(255,80,0,.9),0 0 60px rgba(255,50,0,.4)':'0 0 14px rgba(255,80,0,.5)',transition:'all .35s ease' }}>
//         ENTER SKILL ARENA →
//       </div>
//       <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'rgba(255,100,50,.35)',letterSpacing:'.28em' }}>
//         CLICK TO BEGIN · REQUIRES AIM
//       </div>

//       <style>{`
//         @keyframes portalSpin  { to{transform:rotate(360deg)} }
//         @keyframes portalSpinR { to{transform:rotate(-360deg)} }
//         @keyframes portalOrbit { to{transform:translate(-50%,-50%) rotate(calc(var(--d,0deg) + 360deg)) translateX(96px)} }
//       `}</style>
//     </div>
//   );
// }


// ═══════════════════════════════════════════════════════════════════════════
// SKILLS SECTION  (main export)
// ═══════════════════════════════════════════════════════════════════════════
export default function Skills() {
  const [isVisible,        setIsVisible]        = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayedSkills,  setDisplayedSkills]  = useState(allSkills);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [gameActive,       setGameActive]        = useState(false);
  const [transitioning,    setTransitioning]    = useState(false); // overlay phase
  const skillsPerPage = 8;

  const sectionRef = useRef();
  const overlayRef = useRef();

  // intersection observer
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) setIsVisible(true); }), { threshold:.1 });
    const el = document.getElementById('skills');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // filter
  useEffect(() => {
    setCurrentPage(1);
    if (selectedCategory==='all') { setDisplayedSkills(allSkills); return; }
    const cat = categoriesData.find(c=>c.id===selectedCategory);
    setDisplayedSkills(cat ? cat.skills.map(s=>({skill:s,category:cat.id})) : []);
  }, [selectedCategory]);

  const totalPages    = Math.ceil(displayedSkills.length / skillsPerPage);
  const currentSkills = displayedSkills.slice((currentPage-1)*skillsPerPage, currentPage*skillsPerPage);

  // ── ENTER GAME ──
  const enterGame = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);

    // 1. fade + scale section out
    const sec = sectionRef.current;
    sec.style.transition = 'transform .5s ease-in, opacity .5s ease-in';
    sec.style.transform  = 'scale(1.05)';
    sec.style.opacity    = '0';

    // 2. iris overlay
    const ov = overlayRef.current;
    ov.style.display = 'block';
    ov.style.transition = 'none';
    ov.style.clipPath = 'circle(0% at 50% 50%)';

    setTimeout(() => {
      ov.style.transition = 'clip-path .7s cubic-bezier(.76,0,.24,1)';
      ov.style.clipPath    = 'circle(150% at 50% 50%)';
    }, 50);

    // 3. show game
    setTimeout(() => {
      setGameActive(true);
      setTransitioning(false);
    }, 750);
  }, [transitioning]);

  // ── EXIT GAME ──
  const exitGame = useCallback(() => {
    setGameActive(false);

    const ov = overlayRef.current;
    const sec = sectionRef.current;

    // iris close
    ov.style.transition = 'clip-path .5s cubic-bezier(.76,0,.24,1)';
    ov.style.clipPath    = 'circle(0% at 50% 50%)';

    // restore section
    sec.style.transition = 'transform .55s ease-out, opacity .55s ease-out';
    sec.style.transform  = 'scale(1)';
    sec.style.opacity    = '1';

    setTimeout(() => {
      ov.style.display = 'none';
    }, 520);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');
        @keyframes spillIn {
          from{opacity:0;transform:translateX(-28px) scale(.82)}
          to{opacity:1;transform:translateX(0) scale(1)}
        }
        @keyframes revolve {
          0%  {transform:translate(-50%,-50%) rotate(0deg)   translateX(180px) rotate(0deg)}
          100%{transform:translate(-50%,-50%) rotate(360deg) translateX(180px) rotate(-360deg)}
        }
        @keyframes counterRev { to{transform:rotate(360deg)} }
        @media(max-width:1024px){
          @keyframes revolve {
            0%  {transform:translate(-50%,-50%) rotate(0deg)   translateX(112px) rotate(0deg)}
            100%{transform:translate(-50%,-50%) rotate(360deg) translateX(112px) rotate(-360deg)}
          }
        }
      `}</style>

      {/* ── IRIS OVERLAY ── */}
      <div ref={overlayRef} style={{ display:'none',position:'fixed',inset:0,zIndex:9998,background:'#020100',clipPath:'circle(0% at 50% 50%)',pointerEvents:'none' }} />

      {/* ── GAME LAYER ── */}
      {gameActive && (
        <div style={{ position:'fixed',inset:0,zIndex:9999 }}>
          <SkillShooter onExit={exitGame} />
        </div>
      )}

      {/* ── SKILLS SECTION ── */}
      <section ref={sectionRef} id="skills" className="min-h-screen bg-black text-white relative overflow-hidden py-20" style={{ marginTop:'-30px' }}>

        {/* bg */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay:'1s' }} />
        </div>
        {/* grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(239,68,68,.5)" strokeWidth=".5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">

          {/* Header */}
          <div className={`text-center mb-8 lg:mb-12 transition-all duration-1000 ${isVisible?'translate-y-0 opacity-100':'-translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Flame className="w-10 h-10 text-red-500 animate-pulse" />
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">SKILLS</h2>
              <Flame className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
            <p className="text-red-300/80 text-lg">Click the center or any node to explore</p>
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">

            {/* Chakra */}
            <div className={`flex justify-center transition-all duration-1000 delay-200 ${isVisible?'scale-100 opacity-100':'scale-0 opacity-0'}`}>
              <div className="relative w-[500px] h-[500px]">
                <div className="absolute inset-0 border-2 border-red-600/30 rounded-full"/>
                <div className="absolute inset-8 border-2 border-red-600/20 rounded-full"/>
                <div className="absolute inset-16 border-2 border-red-600/10 rounded-full"/>
                {/* center */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 ${selectedCategory==='all'?'scale-110':''}`} onClick={()=>setSelectedCategory('all')}>
                  <div className={`w-32 h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center border-4 transition-all duration-300 group-hover:scale-110 ${selectedCategory==='all'?'border-red-300 shadow-2xl shadow-red-500/50':'border-red-400/50'}`} style={{ clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)' }}>
                    <div className="text-center"><Zap className="w-10 h-10 text-white mx-auto mb-1 animate-pulse"/><p className="text-white font-bold text-sm">SKILLS</p></div>
                  </div>
                </div>
                {/* category nodes */}
                {categoriesData.map((cat,idx)=>{
                  const Icon=cat.icon;
                  return (
                    <div key={cat.id} className={`absolute top-1/2 left-1/2 cursor-pointer transition-all duration-700 ${isVisible?'opacity-100':'opacity-0'} ${selectedCategory===cat.id?'z-10':''}`}
                      style={{ animation:`revolve 20s linear infinite`,animationDelay:`${-idx*4}s` }}
                      onClick={()=>setSelectedCategory(cat.id)}>
                      <div className={`w-24 h-24 bg-gradient-to-br from-rose-500 to-red-900 flex flex-col items-center justify-center border-4 transition-all duration-300 group-hover:scale-110 ${selectedCategory===cat.id?'border-red-300 shadow-2xl shadow-red-500/50':'border-red-400/30'}`}
                        style={{ clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',animation:'counterRev 20s linear infinite',animationDelay:`${-idx*4}s` }}>
                        <Icon className="w-7 h-7 text-white mb-1"/><p className="text-white font-semibold text-[10px] text-center">{cat.name}</p>
                      </div>
                      {selectedCategory===cat.id && <div className="absolute inset-0 border-4 border-red-400 rounded-full animate-ping opacity-75"/>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills panel */}
            <div className={`transition-all duration-500 ${isVisible?'opacity-100':'opacity-0'}`}>
              <div className="relative bg-gradient-to-br from-red-950/20 to-black/40 backdrop-blur-sm border-2 border-red-600/30 rounded-3xl p-8 min-h-[500px]">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                      {selectedCategory==='all'?'All Skills':categoriesData.find(c=>c.id===selectedCategory)?.name}
                    </h3>
                    <p className="text-red-400/60 text-sm mt-1">{displayedSkills.length} skills mastered</p>
                  </div>
                  {selectedCategory!=='all' && <button onClick={()=>setSelectedCategory('all')} className="text-red-400 hover:text-red-300"><X className="w-6 h-6"/></button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentSkills.map((item,idx)=>(
                    <div key={`${item.category}-${idx}`} className="relative group" style={{ opacity:0,animation:`spillIn .4s ease-out ${idx*.05}s forwards` }}>
                      <div className="absolute inset-0 bg-rose-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"/>
                      <div className="relative bg-black/60 border-2 border-red-900/50 rounded-xl px-4 py-3 text-center group-hover:border-rose-500 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                        <p className="text-red-200 font-semibold text-sm group-hover:text-white transition-colors">{item.skill}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages>1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 hover:bg-red-900/50 transition-all">←</button>
                    {[...Array(totalPages)].map((_,i)=>(
                      <button key={i} onClick={()=>setCurrentPage(i+1)} className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage===i+1?'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/50 scale-110':'bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-900/50'}`}>{i+1}</button>
                    ))}
                    <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 hover:bg-red-900/50 transition-all">→</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="lg:hidden space-y-8">
            <div className={`flex justify-center transition-all duration-1000 delay-200 ${isVisible?'scale-100 opacity-100':'scale-0 opacity-0'}`}>
              <div className="relative w-[320px] h-[320px]">
                <div className="absolute inset-0 border-2 border-red-600/30 rounded-full"/>
                <div className="absolute inset-6 border-2 border-red-600/20 rounded-full"/>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer ${selectedCategory==='all'?'scale-110':''}`} onClick={()=>setSelectedCategory('all')}>
                  <div className={`w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center border-4 ${selectedCategory==='all'?'border-red-300':'border-red-400/50'}`} style={{ clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)' }}>
                    <div className="text-center"><Zap className="w-6 h-6 text-white mx-auto animate-pulse"/><p className="text-white text-[8px]">SKILLS</p></div>
                  </div>
                </div>
                {categoriesData.map((cat,idx)=>{ const Icon=cat.icon; return (
                  <div key={cat.id} className={`absolute top-1/2 left-1/2 cursor-pointer ${isVisible?'opacity-100':'opacity-0'}`}
                    style={{ animation:`revolve 20s linear infinite`,animationDelay:`${-idx*4}s` }}
                    onClick={()=>setSelectedCategory(cat.id)}>
                    <div className={`w-16 h-16 bg-gradient-to-br from-rose-500 to-red-900 flex flex-col items-center justify-center border-2 ${selectedCategory===cat.id?'border-red-300':'border-red-400/30'}`}
                      style={{ clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',animation:'counterRev 20s linear infinite',animationDelay:`${-idx*4}s` }}>
                      <Icon className="w-5 h-5 text-white mb-0.5"/><p className="text-white text-[8px] text-center">{cat.name}</p>
                    </div>
                  </div>
                );})}
              </div>
            </div>
            <div className={`transition-all duration-500 ${isVisible?'opacity-100':'opacity-0'}`}>
              <div className="bg-gradient-to-br from-red-950/20 to-black/40 backdrop-blur-sm border-2 border-red-600/30 rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">{selectedCategory==='all'?'All Skills':categoriesData.find(c=>c.id===selectedCategory)?.name}</h3><p className="text-red-400/60 text-xs mt-1">{displayedSkills.length} skills</p></div>
                  {selectedCategory!=='all' && <button onClick={()=>setSelectedCategory('all')} className="text-red-400"><X className="w-5 h-5"/></button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currentSkills.map((item,idx)=>(
                    <div key={`${item.category}-${idx}`} style={{ opacity:0,animation:`spillIn .4s ease-out ${idx*.05}s forwards` }}>
                      <div className="bg-black/60 border-2 border-red-900/50 rounded-lg px-3 py-2 text-center"><p className="text-red-200 font-semibold text-xs">{item.skill}</p></div>
                    </div>
                  ))}
                </div>
                {totalPages>1&&(
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="px-2 py-1 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 text-sm">←</button>
                    {[...Array(totalPages)].map((_,i)=>(<button key={i} onClick={()=>setCurrentPage(i+1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage===i+1?'bg-gradient-to-br from-red-500 to-red-700 text-white':'bg-red-900/30 border border-red-700/50 text-red-400'}`}>{i+1}</button>))}
                    <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-2 py-1 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 text-sm">→</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`mt-10 flex justify-center gap-12 transition-all duration-1000 delay-1000 ${isVisible?'translate-y-0 opacity-100':'translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">{allSkills.length}</div>
              <div className="text-red-300/60 text-sm font-medium">Total Skills</div>
            </div>
            <div className="w-px bg-gradient-to-b from-transparent via-red-600/50 to-transparent"/>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">{categoriesData.length}</div>
              <div className="text-red-300/60 text-sm font-medium">Categories</div>
            </div>
          </div>

          {/* Portal */}
          <div className={`flex justify-center transition-all duration-1000 delay-500 ${isVisible?'opacity-100 translate-y-0':'opacity-0 translate-y-8'}`}>
            <PortalTrigger onClick={enterGame} />
          </div>

        </div>
      </section>
    </>
  );
}