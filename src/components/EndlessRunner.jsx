import { useEffect, useRef, useState, useCallback } from 'react';

const BG      = '#0d0221';
const GROUND  = '#1a0533';
const ACCENT  = '#f72585';
const CYAN    = '#4cc9f0';
const WHITE   = 'rgba(255,255,255,0.9)';

const ERRORS  = ['TypeError', '404', 'null', 'undefined', 'NaN', 'undefined', '500', 'CORS'];

function EndlessRunner({ onExit }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(null);
  const rafRef     = useRef(null);
  const [phase, setPhase]     = useState('entry');
  const [bootLines, setBootLines] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]     = useState(0);
  const [best, setBest]       = useState(() => parseInt(localStorage.getItem('runner-best') || '0', 10));
  const [dead, setDead]       = useState(false);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('play'), 600); return () => clearTimeout(t);
  }, [phase, countdown]);

  /* ── Boot sequence ── */
  useEffect(() => {
    if (phase !== 'entry') return;
    const lines = [
      'LOADING SYNTHWAVE RUNNER...',
      'NEON GRID ONLINE...',
      'PRESS SPACE / CLICK TO JUMP',
    ];
    let i = 0;
    const show = () => {
      setBootLines(prev => [...prev, lines[i]]);
      i++;
      if (i < lines.length) setTimeout(show, 700);
      else setTimeout(() => { setCountdown(3); setPhase('countdown'); }, 900);
    };
    const t = setTimeout(show, 400);
    return () => clearTimeout(t);
  }, [phase]);

  /* ── Game loop ── */
  useEffect(() => {
    if (phase !== 'play') return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* Initial state */
    stateRef.current = {
      speed:      7,
      speedTimer: 0,
      score:      0,
      groundY:    0,
      runner: {
        x: 0, y: 0,
        w: 24, h: 44,
        vy: 0,
        jumps: 0,
        maxJumps: 2,
      },
      obstacles: [],
      spawnTimer: 0,
      lastObstacleX: -999,
      particles: [],
      shaking: 0,
      dead: false,
    };

    const jump = () => {
      const s = stateRef.current;
      if (!s || s.dead) return;
      if (s.runner.jumps < s.runner.maxJumps) {
        s.runner.vy = -17;
        s.runner.jumps++;
        for (let i = 0; i < 8; i++) {
          s.particles.push({
            x: s.runner.x + s.runner.w / 2,
            y: s.runner.y + s.runner.h,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 4 - 1,
            life: 1,
            color: Math.random() > 0.5 ? ACCENT : CYAN,
          });
        }
      }
    };

    const handleKey = (e) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', jump);

    const spawnObstacle = (cw, groundY) => {
      const h = 30 + Math.random() * 50;
      stateRef.current.obstacles.push({
        x: cw + 60,
        w: 32 + Math.random() * 20,
        h,
        label: ERRORS[Math.floor(Math.random() * ERRORS.length)],
      });
    };

    const drawGrid = (cw, ch, t) => {
      const horizon = ch * 0.38;
      const vanishX = cw / 2;
      /* vertical neon lines */
      const numV = 12;
      for (let i = 0; i <= numV; i++) {
        const frac = i / numV;
        const bx = frac * cw;
        const speed = stateRef.current.speed;
        const offset = (t * speed * 0.3) % (cw / numV);
        const bxOff = (bx + offset) % cw;
        const tx = vanishX + (bxOff - cw / 2) * 0.18;
        ctx.beginPath();
        ctx.moveTo(tx, horizon);
        ctx.lineTo(bxOff, ch);
        ctx.strokeStyle = `rgba(76,201,240,0.2)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      /* horizontal lines */
      const numH = 10;
      for (let i = 0; i <= numH; i++) {
        const frac = Math.pow(i / numH, 1.6);
        const y = horizon + frac * (ch - horizon);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        const alpha = 0.06 + frac * 0.18;
        ctx.strokeStyle = `rgba(247,37,133,${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      /* horizon glow */
      const grd = ctx.createLinearGradient(0, horizon - 20, 0, horizon + 20);
      grd.addColorStop(0, 'transparent');
      grd.addColorStop(0.5, 'rgba(247,37,133,0.18)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, horizon - 20, cw, 40);
    };

    const drawRunner = (r) => {
      const x = r.x, y = r.y, w = r.w, h = r.h;
      /* glow */
      ctx.save();
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur  = 16;
      /* body */
      ctx.fillStyle = ACCENT;
      ctx.fillRect(x + 6, y + 14, w - 12, h - 14);
      /* head */
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 9, 9, 0, Math.PI * 2);
      ctx.fill();
      /* legs (alternating) */
      const legPhase = Date.now() / 120;
      const legL = Math.sin(legPhase) * 8;
      const legR = -Math.sin(legPhase) * 8;
      ctx.lineWidth = 4;
      ctx.strokeStyle = ACCENT;
      ctx.lineCap = 'round';
      /* left leg */
      ctx.beginPath();
      ctx.moveTo(x + 8, y + h - 8);
      ctx.lineTo(x + 8, y + h + legL);
      ctx.stroke();
      /* right leg */
      ctx.beginPath();
      ctx.moveTo(x + w - 8, y + h - 8);
      ctx.lineTo(x + w - 8, y + h + legR);
      ctx.stroke();
      ctx.restore();
    };

    const drawObstacle = (obs, groundY) => {
      const y = groundY - obs.h;
      ctx.save();
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur  = 12;
      ctx.fillStyle   = `rgba(247,37,133,0.15)`;
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth   = 1.5;
      ctx.fillRect(obs.x, y, obs.w, obs.h);
      ctx.strokeRect(obs.x, y, obs.w, obs.h);
      ctx.fillStyle = WHITE;
      ctx.font = `bold 8px "Share Tech Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(obs.label, obs.x + obs.w / 2, y + obs.h / 2 + 3);
      ctx.restore();
    };

    const drawParticles = () => {
      stateRef.current.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    let frame = 0;
    const loop = () => {
      const s = stateRef.current;
      if (!s || !canvas) return;
      const cw = canvas.width, ch = canvas.height;
      frame++;

      /* init positions */
      s.groundY   = ch * 0.78;
      s.runner.x  = cw * 0.14;
      if (s.runner.y === 0) s.runner.y = s.groundY - s.runner.h;

      /* shake offset */
      let sx = 0, sy = 0;
      if (s.shaking > 0) {
        sx = (Math.random() - 0.5) * 8;
        sy = (Math.random() - 0.5) * 8;
        s.shaking--;
      }

      /* BG */
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);

      /* grid */
      drawGrid(cw, ch, frame);

      /* ground strip */
      ctx.fillStyle = GROUND;
      ctx.fillRect(0, s.groundY, cw, ch - s.groundY);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(0, s.groundY, cw, 2);

      /* physics */
      if (!s.dead) {
        s.runner.vy += 0.85;
        s.runner.y  += s.runner.vy;
        if (s.runner.y >= s.groundY - s.runner.h) {
          s.runner.y = s.groundY - s.runner.h;
          s.runner.vy = 0;
          s.runner.jumps = 0;
        }

        /* spawn obstacles at fixed distance spacing */
        const SPACING = 420;
        const lastX = s.obstacles.length > 0
          ? s.obstacles[s.obstacles.length - 1].x
          : s.lastObstacleX;
        if (s.obstacles.length === 0 || lastX < cw - SPACING) {
          spawnObstacle(cw, s.groundY);
          s.lastObstacleX = cw + 60;
        }

        /* move obstacles */
        s.obstacles.forEach(o => { o.x -= s.speed; });
        s.obstacles = s.obstacles.filter(o => o.x + o.w > -10);

        /* collision */
        const rx = s.runner.x + 4, ry = s.runner.y + 4, rw = s.runner.w - 8, rh = s.runner.h - 6;
        for (const o of s.obstacles) {
          const oy = s.groundY - o.h;
          if (rx < o.x + o.w && rx + rw > o.x && ry < oy + o.h && ry + rh > oy) {
            s.dead = true;
            s.shaking = 18;
            break;
          }
        }

        /* score + speed */
        s.score++;
        s.speedTimer++;
        if (s.speedTimer >= 500) {
          s.speed    += 0.5;
          s.speedTimer = 0;
        }

        /* update particles */
        s.particles.forEach(p => {
          p.x   += p.vx;
          p.y   += p.vy;
          p.vy  += 0.15;
          p.life -= 0.04;
        });
        s.particles = s.particles.filter(p => p.life > 0);

        setScore(Math.floor(s.score / 6));
      }

      /* draw obstacles */
      s.obstacles.forEach(o => drawObstacle(o, s.groundY));

      /* draw runner */
      drawRunner(s.runner);

      /* draw particles */
      drawParticles();

      ctx.restore();

      if (s.dead && s.shaking <= 0) {
        const finalScore = Math.floor(s.score / 6);
        setBest(prev => {
          const nb = Math.max(prev, finalScore);
          localStorage.setItem('runner-best', String(nb));
          return nb;
        });
        setDead(true);
        setPhase('dead');
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', jump);
    };
  }, [phase]);

  const retry = useCallback(() => {
    stateRef.current = null;
    setScore(0);
    setDead(false);
    setCountdown(3);
    setPhase('countdown');
  }, []);

  /* ─── Entry screen ─── */
  if (phase === 'entry') return (
    <div style={{ position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 }}>
      <div style={{ fontSize: 'clamp(1.6rem,5vw,3rem)', fontWeight: 900, color: ACCENT, textShadow: `0 0 30px ${ACCENT}`, letterSpacing: '0.15em', marginBottom: 40 }}>
        ENDLESS RUNNER
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: CYAN }}>
        {bootLines.map((line, i) => (
          <div key={i} style={{ opacity: 0.9, letterSpacing: '0.08em' }}>
            {'> '}{line}{i === bootLines.length - 1 ? <span style={{ borderRight: `2px solid ${CYAN}`, marginLeft: 2, animation: 'blink 1s step-end infinite' }} />  : ''}
          </div>
        ))}
      </div>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.12em' }}>
        EXIT
      </button>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );

  /* ─── Countdown screen ─── */
  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? ACCENT : CYAN, textShadow: `0 0 60px ${ACCENT}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntP { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  /* ─── Dead screen ─── */
  if (phase === 'dead') return (
    <div style={{ position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 }}>
      <div style={{ fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 900, color: ACCENT, textShadow: `0 0 40px ${ACCENT}`, letterSpacing: '0.2em', marginBottom: 16 }}>
        GAME OVER
      </div>
      <div style={{ color: CYAN, fontSize: 15, marginBottom: 6, letterSpacing: '0.1em' }}>
        DISTANCE: <strong style={{ color: WHITE }}>{score}m</strong>
      </div>
      <div style={{ color: CYAN, fontSize: 13, marginBottom: 40, letterSpacing: '0.1em' }}>
        BEST: <strong style={{ color: ACCENT }}>{best}m</strong>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button onClick={retry} style={{ background: ACCENT, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>
          RETRY
        </button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${CYAN}`, color: CYAN, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>
          BACK
        </button>
      </div>
    </div>
  );

  /* ─── Play screen ─── */
  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* HUD */}
      <div style={{ position: 'absolute', top: 16, left: 20, fontFamily: '"Share Tech Mono", monospace', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
        <span style={{ color: ACCENT, fontSize: 13, letterSpacing: '0.1em', textShadow: `0 0 10px ${ACCENT}` }}>ENDLESS RUNNER</span>
        <span style={{ color: CYAN, fontSize: 12, letterSpacing: '0.08em' }}>DIST: {score}m</span>
      </div>
      <button onClick={onExit} style={{ position: 'absolute', top: 14, right: 20, background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT, padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.12em', zIndex: 1 }}>
        EXIT
      </button>
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: 'rgba(76,201,240,0.5)', fontSize: 11, letterSpacing: '0.12em' }}>
        SPACE / CLICK — JUMP &nbsp;·&nbsp; DOUBLE JUMP AVAILABLE
      </div>
    </div>
  );
}

export default EndlessRunner;
