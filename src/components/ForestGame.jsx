import { useEffect, useRef, useState, useCallback } from 'react';

const BG      = '#020d06';
const GREEN   = '#22c55e';
const GOLD    = '#fde68a';
const DIM     = '#15803d';
const SPIDER_CLR = '#dc2626';
const MOON    = 'rgba(255,255,240,0.12)';

const PLAYER_R   = 9;
const PLAYER_SPD = 4;
const GAME_SECS  = 60;

function FireflyHunt({ onExit }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const [phase, setPhase]   = useState('entry');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECS);
  const [best, setBest]     = useState(() => parseInt(localStorage.getItem('firefly-best') || '0', 10));

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('play'), 600); return () => clearTimeout(t);
  }, [phase, countdown]);

  const initState = useCallback((cw, ch) => {
    /* spider lanes at fixed Y positions */
    const laneYs = [ch * 0.2, ch * 0.38, ch * 0.56, ch * 0.74];
    stateRef.current = {
      cw, ch,
      player:  { x: cw / 2, y: ch / 2 },
      keys:    { up: false, down: false, left: false, right: false },
      fireflies: [],
      spiders: laneYs.map((y, i) => ({
        x: Math.random() * cw, y, dir: i % 2 === 0 ? 1 : -1,
        speed: 1.5 + Math.random() * 1.2, laneY: y,
      })),
      bats: [],
      batTimer: 240,
      spawnTimer: 0,
      particles: [],
      score: 0,
      frame: 0,
      timeLeft: GAME_SECS * 60,
      dead: false,
      won:  false,
      tail: [],
      ambient: Array.from({ length: 200 }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.2,
      })),
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
      const map = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right',
      };
      if (map[e.key]) { e.preventDefault(); s.keys[map[e.key]] = e.type === 'keydown'; }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup',   handleKey);

    const spawnFirefly = () => {
      const { cw, ch } = s;
      s.fireflies.push({
        x: 60 + Math.random() * (cw - 120),
        y: 60 + Math.random() * (ch - 120),
        phase: Math.random() * Math.PI * 2,
        life:  240,
        alive: true,
      });
    };

    const loop = () => {
      if (!s || s.dead || s.won) return;
      s.frame++;
      const { cw, ch } = s;

      /* countdown */
      s.timeLeft--;
      if (s.timeLeft % 60 === 0) setTimeLeft(Math.ceil(s.timeLeft / 60));
      if (s.timeLeft <= 0) {
        s.won = true;
        setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('firefly-best', String(nb)); return nb; });
        setPhase('won');
        return;
      }

      /* player */
      const { keys, player } = s;
      if (keys.up)    player.y = Math.max(PLAYER_R, player.y - PLAYER_SPD);
      if (keys.down)  player.y = Math.min(ch - PLAYER_R, player.y + PLAYER_SPD);
      if (keys.left)  player.x = Math.max(PLAYER_R, player.x - PLAYER_SPD);
      if (keys.right) player.x = Math.min(cw - PLAYER_R, player.x + PLAYER_SPD);

      /* tail */
      s.tail.push({ x: player.x, y: player.y, life: 1 });
      if (s.tail.length > 10) s.tail.shift();
      s.tail.forEach(t => t.life -= 0.1);

      /* spawn fireflies */
      s.spawnTimer++;
      if (s.spawnTimer >= 80 && s.fireflies.filter(f => f.alive).length < 8) {
        spawnFirefly();
        s.spawnTimer = 0;
      }

      /* firefly life */
      s.fireflies.forEach(f => {
        if (!f.alive) return;
        f.phase += 0.05;
        f.life--;
        if (f.life <= 0) f.alive = false;
        /* collect */
        if (Math.hypot(player.x - f.x, player.y - f.y) < PLAYER_R + 10) {
          f.alive = false;
          s.score++;
          setScore(s.score);
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            s.particles.push({ x: f.x, y: f.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, life: 1, color: GOLD });
          }
        }
      });
      s.fireflies = s.fireflies.filter(f => f.alive);

      /* spiders patrol */
      s.spiders.forEach(sp => {
        sp.x += sp.speed * sp.dir;
        if (sp.x > cw + 30 || sp.x < -30) sp.dir *= -1;
        if (Math.hypot(player.x - sp.x, player.y - sp.y) < PLAYER_R + 14) s.dead = true;
      });

      /* bat spawning */
      s.batTimer--;
      if (s.batTimer <= 0) {
        const fromLeft = Math.random() < 0.5;
        s.bats.push({
          x: fromLeft ? -40 : cw + 40,
          y: 80 + Math.random() * (ch - 160),
          vx: fromLeft ? 10 : -10,
          vy: 0,
          alive: true, wing: 0,
        });
        s.batTimer = 200 + Math.floor(Math.random() * 120);
      }
      s.bats.forEach(bat => {
        bat.x += bat.vx; bat.wing += 0.25;
        if (Math.hypot(player.x - bat.x, player.y - bat.y) < PLAYER_R + 16) s.dead = true;
      });
      s.bats = s.bats.filter(b => b.alive && b.x > -80 && b.x < cw + 80);

      s.particles = s.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.05; return p.life > 0; });

      if (s.dead) {
        setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('firefly-best', String(nb)); return nb; });
        setPhase('dead');
        return;
      }

      /* ── DRAW ── */
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);

      /* moon */
      const moonGrad = ctx.createRadialGradient(cw / 2, 40, 0, cw / 2, 40, 120);
      moonGrad.addColorStop(0, 'rgba(255,255,240,0.18)');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, cw, ch);

      /* ambient particles */
      s.ambient.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = cw; if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch; if (p.y > ch) p.y = 0;
        ctx.fillStyle = `rgba(34,197,94,${p.alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill();
      });

      /* tree trunks */
      ctx.fillStyle = '#0a1a09';
      for (let i = 0; i < 8; i++) {
        const tx = (i * (cw / 7));
        const tw = 28 + (i % 3) * 8;
        ctx.fillRect(tx - tw / 2, 0, tw, ch);
        /* branches */
        ctx.strokeStyle = '#0a1a09'; ctx.lineWidth = 8;
        const numBranches = 4;
        for (let b = 0; b < numBranches; b++) {
          const by = ch * 0.15 + b * ch * 0.18;
          const blen = 50 + (i % 2) * 30;
          const bdir = b % 2 === 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(tx, by);
          ctx.lineTo(tx + bdir * blen, by - 20);
          ctx.stroke();
        }
      }

      /* spider branch lines (decorative) */
      s.spiders.forEach(sp => {
        ctx.strokeStyle = `rgba(10,26,9,0.8)`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, sp.laneY + 4); ctx.lineTo(cw, sp.laneY + 4);
        ctx.stroke();
      });

      /* fireflies */
      s.fireflies.forEach(f => {
        const pulse = 0.5 + Math.sin(f.phase) * 0.5;
        const fadeOut = f.life < 60 ? f.life / 60 : 1;
        ctx.save();
        ctx.globalAlpha = pulse * fadeOut;
        ctx.shadowColor = GOLD; ctx.shadowBlur = 20;
        ctx.fillStyle   = GOLD;
        ctx.beginPath(); ctx.arc(f.x, f.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = pulse * fadeOut * 0.3;
        ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.arc(f.x, f.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      /* particles */
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* spiders */
      s.spiders.forEach(sp => {
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.shadowColor = SPIDER_CLR; ctx.shadowBlur = 10;
        /* body */
        ctx.fillStyle = '#1a0000';
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a0000';
        ctx.beginPath(); ctx.arc(0, -6, 6, 0, Math.PI * 2); ctx.fill();
        /* eyes */
        ctx.fillStyle = SPIDER_CLR;
        ctx.beginPath(); ctx.arc(-3, -8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(3, -8, 2, 0, Math.PI * 2); ctx.fill();
        /* legs */
        ctx.strokeStyle = '#1a0000'; ctx.lineWidth = 1.5; ctx.shadowBlur = 0;
        for (let l = 0; l < 4; l++) {
          const lx = (l - 1.5) * 7;
          ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx - 4, -14); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + 4, 14); ctx.stroke();
        }
        ctx.restore();
      });

      /* bats */
      s.bats.forEach(bat => {
        ctx.save();
        ctx.translate(bat.x, bat.y);
        if (bat.vx < 0) ctx.scale(-1, 1);
        const flap = Math.sin(bat.wing) * 10;
        ctx.fillStyle = '#1a0d00';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-16, flap - 10, -28, flap - 6, -32, flap);
        ctx.bezierCurveTo(-28, flap + 6, -10, 4, 0, 0);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(16, flap - 10, 28, flap - 6, 32, flap);
        ctx.bezierCurveTo(28, flap + 6, 10, 4, 0, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });

      /* player tail */
      s.tail.forEach(t => {
        ctx.globalAlpha = t.life * 0.4;
        ctx.fillStyle = GREEN;
        ctx.beginPath(); ctx.arc(t.x, t.y, PLAYER_R * 0.6, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* player */
      ctx.save();
      ctx.shadowColor = GREEN; ctx.shadowBlur = 20;
      ctx.fillStyle   = GREEN;
      ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 40;
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_R * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      /* timer bar */
      const tFrac = s.timeLeft / (GAME_SECS * 60);
      ctx.fillStyle = 'rgba(34,197,94,0.12)';
      ctx.fillRect(0, ch - 4, cw, 4);
      ctx.fillStyle = GREEN;
      ctx.fillRect(0, ch - 4, cw * tFrac, 4);

      /* UI */
      ctx.textAlign = 'left';
      ctx.font = `bold 14px "Orbitron", sans-serif`;
      ctx.fillStyle = GREEN; ctx.shadowColor = GREEN; ctx.shadowBlur = 8;
      ctx.fillText(`${s.score}`, 20, 28);
      ctx.shadowBlur = 0;
      ctx.font = `12px monospace`; ctx.fillStyle = GOLD;
      ctx.fillText(`${Math.ceil(s.timeLeft / 60)}s`, 20, 46);
      ctx.fillStyle = `rgba(34,197,94,0.4)`; ctx.font = `10px monospace`;
      ctx.fillText(`BEST ${best}`, 20, 62);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [phase, initState, best]);

  const startPlay = useCallback(() => { setScore(0); setTimeLeft(GAME_SECS); setCountdown(3); setPhase('countdown'); }, []);
  const retry     = useCallback(() => { cancelAnimationFrame(rafRef.current); stateRef.current = null; setScore(0); setTimeLeft(GAME_SECS); setCountdown(3); setPhase('countdown'); }, []);

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: GREEN, textShadow: `0 0 24px ${GREEN}`, letterSpacing: '0.2em', marginBottom: 12 }}>FIREFLY HUNT</div>
      <div style={{ color: 'rgba(34,197,94,0.55)', fontSize: 12, marginBottom: 6, letterSpacing: '0.1em' }}>WASD / ↑↓←→ — MOVE</div>
      <div style={{ color: 'rgba(34,197,94,0.4)', fontSize: 11, marginBottom: 6, letterSpacing: '0.08em' }}>COLLECT FIREFLIES &nbsp;·&nbsp; AVOID SPIDERS + BATS</div>
      <div style={{ color: GOLD, fontSize: 11, marginBottom: 32, letterSpacing: '0.08em' }}>60 SECOND TIME ATTACK</div>
      <button onClick={startPlay} style={{ background: 'transparent', border: `1px solid ${GREEN}`, color: GREEN, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${GREEN}` }}>HUNT</button>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? GREEN : GOLD, textShadow: `0 0 60px ${GREEN}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntP { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'won') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: GOLD, textShadow: `0 0 30px ${GOLD}`, letterSpacing: '0.15em', marginBottom: 12 }}>TIME UP!</div>
      <div style={{ color: 'rgba(34,197,94,0.6)', fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>FIREFLIES <strong style={{ color: GREEN }}>{score}</strong></div>
      <div style={{ color: 'rgba(34,197,94,0.4)', fontSize: 12, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: GOLD }}>{best}</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: GREEN, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>AGAIN</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: '#ef4444', textShadow: '0 0 30px #ef4444', letterSpacing: '0.15em', marginBottom: 12 }}>CAUGHT!</div>
      <div style={{ color: 'rgba(34,197,94,0.6)', fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>FIREFLIES <strong style={{ color: GREEN }}>{score}</strong></div>
      <div style={{ color: 'rgba(34,197,94,0.4)', fontSize: 12, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: GOLD }}>{best}</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: GREEN, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RETRY</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <button onClick={onExit} style={{ position: 'absolute', top: 12, left: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
    </div>
  );
}

export default FireflyHunt;
