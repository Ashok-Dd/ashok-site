import { useEffect, useRef, useState, useCallback } from 'react';

const BG     = '#1a0000';
const RED    = '#ef4444';
const ORANGE = '#f97316';
const ASH    = '#78716c';
const SHIELD_CLR = '#60a5fa';

const PLAYER_W   = 24;
const PLAYER_H   = 36;
const PLAYER_SPD = 5;
const GROUND_Y_FRAC = 0.85;

function MeteorStrike({ onExit }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const [phase, setPhase]   = useState('entry');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]   = useState(0);
  const [best, setBest]     = useState(() => parseInt(localStorage.getItem('meteor-best') || '0', 10));

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('play'), 600); return () => clearTimeout(t);
  }, [phase, countdown]);

  const initState = useCallback((cw, ch) => {
    const groundY = Math.floor(ch * GROUND_Y_FRAC);
    stateRef.current = {
      cw, ch, groundY,
      player: { x: cw / 2, shield: 0 },
      keys:   { left: false, right: false },
      meteors: [],
      splashes: [],
      ashParticles: Array.from({ length: 80 }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 0.8,
        r: 0.8 + Math.random() * 1.8,
      })),
      shields: [],
      particles: [],
      spawnTimer: 0,
      shieldTimer: 300,
      score: 0,
      frame: 0,
      dead: false,
      flashTimer: 0,
      lavaPhase: 0,
    };
  }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const canvas = canvasRef.current;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx     = canvas.getContext('2d');
    initState(canvas.width, canvas.height);
    const s = stateRef.current;

    const handleKey = (e) => {
      const map = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
      if (map[e.key]) { e.preventDefault(); s.keys[map[e.key]] = e.type === 'keydown'; }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup',   handleKey);

    const spawnMeteor = () => {
      const { cw } = s;
      const types = ['large', 'small', 'small', 'small', 'splitting'];
      const type  = types[Math.floor(Math.random() * types.length)];
      const r     = type === 'large' ? 22 : type === 'small' ? 9 : 16;
      const spd   = type === 'large' ? 3 : type === 'small' ? 7 : 4.5;
      s.meteors.push({
        x: r + Math.random() * (cw - r * 2),
        y: -r,
        r, type, vy: spd * (1 + s.score / 3000), alive: true,
        trail: [],
      });
    };

    const addExplosion = (x, y, r, color) => {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        s.particles.push({ x, y, vx: Math.cos(a) * (2 + Math.random() * 3), vy: Math.sin(a) * (2 + Math.random() * 3), life: 1, color, r: 3 + Math.random() * 2 });
      }
    };

    const loop = () => {
      if (!s || s.dead) return;
      s.frame++;
      const { cw, ch, groundY } = s;

      /* player */
      if (s.keys.left)  s.player.x = Math.max(PLAYER_W / 2, s.player.x - PLAYER_SPD);
      if (s.keys.right) s.player.x = Math.min(cw - PLAYER_W / 2, s.player.x + PLAYER_SPD);
      if (s.player.shield > 0) s.player.shield--;

      /* spawn meteors */
      s.spawnTimer++;
      const spawnInterval = Math.max(40, 90 - Math.floor(s.score / 100));
      if (s.spawnTimer >= spawnInterval) { spawnMeteor(); s.spawnTimer = 0; }

      /* shield pickup */
      s.shieldTimer--;
      if (s.shieldTimer <= 0) {
        s.shields.push({ x: 80 + Math.random() * (cw - 160), y: -20, vy: 1.8, alive: true });
        s.shieldTimer = 400 + Math.floor(Math.random() * 300);
      }

      /* update meteors */
      s.meteors.forEach(m => {
        if (!m.alive) return;
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 14) m.trail.shift();
        m.y += m.vy;

        if (m.y + m.r >= groundY) {
          m.alive = false;
          /* splash zone */
          const splashR = m.type === 'large' ? 70 : m.type === 'small' ? 30 : 50;
          s.splashes.push({ x: m.x, y: groundY, r: splashR, life: 50 });
          s.flashTimer = m.type === 'large' ? 4 : 2;
          addExplosion(m.x, groundY, m.r, ORANGE);
          /* splitting meteor */
          if (m.type === 'splitting') {
            for (let i = 0; i < 2; i++) {
              s.meteors.push({
                x: m.x + (i === 0 ? -20 : 20), y: groundY - 20,
                r: 9, type: 'small', vy: 5 * (1 + s.score / 3000), alive: true, trail: [],
              });
            }
          }
        }

        /* player collision */
        if (m.alive && s.player.shield <= 0) {
          const px = s.player.x, py = groundY - PLAYER_H / 2;
          if (Math.abs(m.x - px) < m.r + PLAYER_W / 2 && Math.abs(m.y - py) < m.r + PLAYER_H / 2) {
            s.dead = true;
          }
        }
      });
      s.meteors = s.meteors.filter(m => m.alive && m.y < ch + 60);

      /* splash collision */
      s.splashes.forEach(sp => {
        sp.life--;
        if (s.player.shield <= 0 && sp.life > 20) {
          const dist = Math.abs(s.player.x - sp.x);
          if (dist < sp.r) s.dead = true;
        }
      });
      s.splashes = s.splashes.filter(sp => sp.life > 0);

      /* shield pickups */
      s.shields.forEach(sh => {
        sh.y += sh.vy;
        if (Math.abs(sh.x - s.player.x) < PLAYER_W / 2 + 16 && Math.abs(sh.y - groundY + PLAYER_H) < 36) {
          sh.alive = false;
          s.player.shield = 180;
          s.score += 5;
          setScore(s.score);
        }
      });
      s.shields = s.shields.filter(sh => sh.alive && sh.y < ch);

      /* score */
      if (s.frame % 60 === 0) { s.score++; setScore(s.score); }
      if (s.flashTimer > 0) s.flashTimer--;

      s.particles = s.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.04; return p.life > 0; });
      s.lavaPhase += 0.03;

      if (s.dead) {
        setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('meteor-best', String(nb)); return nb; });
        setPhase('dead');
        return;
      }

      /* ── DRAW ── */
      if (s.flashTimer > 0) {
        ctx.fillStyle = `rgba(249,115,22,0.25)`;
        ctx.fillRect(0, 0, cw, ch);
      } else {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, cw, ch);
      }

      /* sky gradient */
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#0a0000');
      skyGrad.addColorStop(0.6, '#1a0000');
      skyGrad.addColorStop(1, '#330500');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, groundY);

      /* distant volcano silhouette */
      ctx.fillStyle = '#220000';
      ctx.beginPath();
      ctx.moveTo(cw * 0.7 - 80, groundY);
      ctx.lineTo(cw * 0.7, groundY - 160);
      ctx.lineTo(cw * 0.7 + 80, groundY);
      ctx.closePath();
      ctx.fill();

      /* lava glow from volcano */
      const vGlow = ctx.createRadialGradient(cw * 0.7, groundY - 160, 0, cw * 0.7, groundY - 160, 100);
      vGlow.addColorStop(0, `rgba(249,115,22,${0.15 + Math.sin(s.lavaPhase) * 0.08})`);
      vGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = vGlow;
      ctx.fillRect(0, 0, cw, groundY);

      /* ash particles */
      s.ashParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y > ch) { p.y = -5; p.x = Math.random() * cw; }
        ctx.fillStyle = `rgba(120,113,108,0.35)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      /* ground */
      ctx.fillStyle = '#1a0000';
      ctx.fillRect(0, groundY, cw, ch - groundY);

      /* lava cracks */
      ctx.strokeStyle = `rgba(249,115,22,${0.3 + Math.sin(s.lavaPhase) * 0.1})`;
      ctx.lineWidth   = 2;
      ctx.shadowColor = ORANGE; ctx.shadowBlur = 8;
      for (let i = 0; i < 10; i++) {
        const cx2 = (i * (cw / 9));
        ctx.beginPath(); ctx.moveTo(cx2, groundY); ctx.lineTo(cx2 + 30, groundY + 20); ctx.stroke();
      }
      ctx.shadowBlur = 0;

      /* splash zones */
      s.splashes.forEach(sp => {
        const t = sp.life / 50;
        const spGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.r);
        spGrad.addColorStop(0, `rgba(249,115,22,${t * 0.7})`);
        spGrad.addColorStop(0.6, `rgba(239,68,68,${t * 0.3})`);
        spGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spGrad;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2); ctx.fill();
      });

      /* meteor trails */
      s.meteors.forEach(m => {
        m.trail.forEach((pt, i) => {
          const t = i / m.trail.length;
          ctx.globalAlpha = t * 0.5;
          const trailGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, m.r * t);
          trailGrad.addColorStop(0, RED);
          trailGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = trailGrad;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, m.r * t * 0.8, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowColor = ORANGE; ctx.shadowBlur = 18;
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        mg.addColorStop(0, 'white');
        mg.addColorStop(0.3, ORANGE);
        mg.addColorStop(1, RED);
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      /* particles */
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* shield pickups */
      s.shields.forEach(sh => {
        ctx.save();
        ctx.shadowColor = SHIELD_CLR; ctx.shadowBlur = 16;
        ctx.fillStyle   = SHIELD_CLR;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y - 12);
        ctx.lineTo(sh.x + 10, sh.y);
        ctx.lineTo(sh.x + 8, sh.y + 10);
        ctx.lineTo(sh.x, sh.y + 14);
        ctx.lineTo(sh.x - 8, sh.y + 10);
        ctx.lineTo(sh.x - 10, sh.y);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });

      /* player */
      const px = s.player.x, py = groundY - PLAYER_H;
      ctx.save();
      /* shield bubble */
      if (s.player.shield > 0) {
        ctx.globalAlpha = 0.25 + Math.sin(s.frame / 8) * 0.1;
        ctx.fillStyle = SHIELD_CLR; ctx.shadowColor = SHIELD_CLR; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(px, py + PLAYER_H / 2, PLAYER_W + 14, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      /* body */
      ctx.fillStyle   = '#c2410c';
      ctx.shadowColor = RED; ctx.shadowBlur = 8;
      ctx.fillRect(px - PLAYER_W / 2, py, PLAYER_W, PLAYER_H);
      /* helmet */
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(px - PLAYER_W / 2 + 2, py, PLAYER_W - 4, 12);
      ctx.restore();

      /* UI */
      ctx.textAlign = 'left';
      ctx.font = `bold 14px "Orbitron", sans-serif`;
      ctx.fillStyle = RED; ctx.shadowColor = RED; ctx.shadowBlur = 8;
      ctx.fillText(`${s.score}`, 20, 28);
      ctx.shadowBlur = 0;
      ctx.font = `10px monospace`; ctx.fillStyle = `rgba(239,68,68,0.45)`;
      ctx.fillText(`BEST ${best}`, 20, 44);
      if (s.player.shield > 0) {
        ctx.fillStyle = SHIELD_CLR;
        ctx.fillText(`SHIELD ${Math.ceil(s.player.shield / 60)}s`, 20, 60);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [phase, initState, best]);

  const startPlay = useCallback(() => { setScore(0); setCountdown(3); setPhase('countdown'); }, []);
  const retry     = useCallback(() => { cancelAnimationFrame(rafRef.current); stateRef.current = null; setScore(0); setCountdown(3); setPhase('countdown'); }, []);

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: RED, textShadow: `0 0 24px ${RED}`, letterSpacing: '0.2em', marginBottom: 12 }}>METEOR STRIKE</div>
      <div style={{ color: 'rgba(239,68,68,0.55)', fontSize: 12, marginBottom: 6, letterSpacing: '0.1em' }}>← → / A D — DODGE</div>
      <div style={{ color: 'rgba(239,68,68,0.4)', fontSize: 11, marginBottom: 32, letterSpacing: '0.08em' }}>AVOID METEORS AND LAVA SPLASHES &nbsp;·&nbsp; COLLECT SHIELDS</div>
      <button onClick={startPlay} style={{ background: 'transparent', border: `1px solid ${RED}`, color: RED, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${RED}` }}>SURVIVE</button>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid #7c2d12`, color: '#7c2d12', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? RED : ORANGE, textShadow: `0 0 60px ${RED}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntP { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: ORANGE, textShadow: `0 0 30px ${ORANGE}`, letterSpacing: '0.15em', marginBottom: 12 }}>OBLITERATED</div>
      <div style={{ color: 'rgba(239,68,68,0.6)', fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>SCORE <strong style={{ color: RED }}>{score}</strong></div>
      <div style={{ color: 'rgba(239,68,68,0.4)', fontSize: 12, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: ORANGE }}>{best}</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: RED, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RETRY</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid #7c2d12`, color: '#7c2d12', padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <button onClick={onExit} style={{ position: 'absolute', top: 12, left: 20, background: 'transparent', border: `1px solid #7c2d12`, color: '#7c2d12', padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: `rgba(239,68,68,0.3)`, fontSize: 10, letterSpacing: '0.12em', zIndex: 1 }}>← → DODGE &nbsp;·&nbsp; BLUE CRYSTAL = SHIELD</div>
    </div>
  );
}

export default MeteorStrike;
