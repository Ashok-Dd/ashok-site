import { useEffect, useRef, useState, useCallback } from 'react';

const BG     = '#16091f';
const ACCENT = '#bf5af2';
const CYAN   = '#67e8f9';
const PINK   = '#f472b6';
const LAVEND = '#a78bfa';
const WHITE  = '#e0d7ff';

const ROW_COLORS  = [ACCENT, CYAN, PINK, LAVEND, WHITE];
const COLS = 10, ROWS = 5;
const BW   = 60, BH = 22, GAPX = 8, GAPY = 6;
const PADDLE_H = 14, BALL_R = 8;
const LIVES_MAX = 3;

function makeBlocks(wave) {
  const blocks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const hits = wave >= 2 && r < 2 ? 2 : 1;
      const prism = r === 2 && c === 5;
      blocks.push({ r, c, hits, maxHits: hits, prism, alive: true });
    }
  }
  return blocks;
}

function NeonBreakout({ onExit }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(null);
  const rafRef     = useRef(null);
  const [phase, setPhase]     = useState('entry');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(LIVES_MAX);
  const [best, setBest]       = useState(() => parseInt(localStorage.getItem('breakout-best') || '0', 10));

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('play'), 600); return () => clearTimeout(t);
  }, [phase, countdown]);

  const initState = useCallback((cw, ch, wave = 1) => {
    const blockAreaW = COLS * (BW + GAPX) - GAPX;
    const bx0 = (cw - blockAreaW) / 2;
    const by0 = 80;

    const paddleW = 100 + (wave - 1) * (-10);
    stateRef.current = {
      cw, ch, wave,
      paddle: { x: cw / 2, w: paddleW, y: ch - 60 },
      ball: { x: cw / 2, y: ch - 100, vx: 4 + wave * 0.3, vy: -(4 + wave * 0.3) },
      balls: [],
      blocks: makeBlocks(wave),
      bx0, by0,
      powerups: [],
      laserShots: [],
      laserActive: 0,
      wideActive:  0,
      score:  0,
      lives:  LIVES_MAX,
      combo:  0,
      frame:  0,
      keys:   { left: false, right: false },
      particles: [],
      mouseX: cw / 2,
      dead: false,
      won: false,
      stars: Array.from({ length: 120 }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        s: 0.5 + Math.random() * 1.5, vx: 0, vy: 0.15 + Math.random() * 0.3,
      })),
      gridY: 0,
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
    const handleMouse = (e) => { s.mouseX = e.clientX; };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup',   handleKey);
    window.addEventListener('mousemove', handleMouse);

    const blockRect = (b) => ({
      x: s.bx0 + b.c * (BW + GAPX),
      y: s.by0 + b.r * (BH + GAPY),
      w: BW, h: BH,
    });

    const spawnPowerup = (x, y) => {
      const types = ['WIDE', 'MULTI', 'LASER'];
      const type  = types[Math.floor(Math.random() * types.length)];
      if (Math.random() < 0.28) s.powerups.push({ x, y, type, vy: 2.5 });
    };

    const addParticles = (x, y, color) => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        s.particles.push({ x, y, vx: Math.cos(a) * (1.5 + Math.random() * 2), vy: Math.sin(a) * (1.5 + Math.random() * 2), life: 1, color });
      }
    };

    const breakBlock = (b, bx, by) => {
      b.hits--;
      if (b.hits <= 0) {
        b.alive = false;
        s.combo++;
        const pts = (6 - b.r) * s.combo;
        s.score += pts;
        setScore(s.score);
        spawnPowerup(bx + BW / 2, by + BH / 2);
        if (b.prism) {
          s.blocks.forEach(nb => {
            const dr = Math.abs(nb.r - b.r), dc = Math.abs(nb.c - b.c);
            if (nb.alive && dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0)) {
              nb.alive = false;
              s.score += 3;
              setScore(s.score);
              const nRect = blockRect(nb);
              addParticles(nRect.x + BW/2, nRect.y + BH/2, ACCENT);
            }
          });
        }
        addParticles(bx + BW/2, by + BH/2, ROW_COLORS[b.r]);
      }
    };

    const bounceBall = (ball) => {
      const { cw, ch } = s;
      if (ball.x - BALL_R < 0)  { ball.x = BALL_R;      ball.vx = Math.abs(ball.vx); }
      if (ball.x + BALL_R > cw) { ball.x = cw - BALL_R; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - BALL_R < 0)  { ball.y = BALL_R;      ball.vy = Math.abs(ball.vy); }

      const pw = s.wideActive > 0 ? s.paddle.w * 1.5 : s.paddle.w;
      const px = s.paddle.x - pw / 2;
      const py = s.paddle.y;
      if (ball.y + BALL_R >= py && ball.y + BALL_R <= py + PADDLE_H
          && ball.x >= px && ball.x <= px + pw) {
        const rel = (ball.x - (px + pw / 2)) / (pw / 2);
        ball.vx = rel * 6;
        ball.vy = -Math.abs(ball.vy);
        ball.y  = py - BALL_R;
        s.combo = 0;
      }

      s.blocks.forEach(b => {
        if (!b.alive) return;
        const r = blockRect(b);
        if (ball.x + BALL_R > r.x && ball.x - BALL_R < r.x + r.w
            && ball.y + BALL_R > r.y && ball.y - BALL_R < r.y + r.h) {
          const overlapL = (ball.x + BALL_R) - r.x;
          const overlapR = (r.x + r.w) - (ball.x - BALL_R);
          const overlapT = (ball.y + BALL_R) - r.y;
          const overlapB = (r.y + r.h) - (ball.y - BALL_R);
          const min = Math.min(overlapL, overlapR, overlapT, overlapB);
          if (min === overlapT || min === overlapB) ball.vy *= -1;
          else ball.vx *= -1;
          breakBlock(b, r.x, r.y);
        }
      });

      if (ball.y - BALL_R > ch) return false;
      return true;
    };

    const loop = () => {
      if (!s || s.dead || s.won) return;
      s.frame++;
      const { cw, ch } = s;

      const pw   = s.wideActive > 0 ? s.paddle.w * 1.5 : s.paddle.w;
      const minX = pw / 2, maxX = cw - pw / 2;
      let targetX = s.mouseX;
      if (s.keys.left)  targetX -= 5;
      if (s.keys.right) targetX += 5;
      s.paddle.x += (targetX - s.paddle.x) * 0.18;
      s.paddle.x  = Math.max(minX, Math.min(maxX, s.paddle.x));

      if (s.wideActive  > 0) s.wideActive--;
      if (s.laserActive > 0) s.laserActive--;

      if (s.laserActive > 0 && s.frame % 30 === 0) {
        s.laserShots.push({ x: s.paddle.x, y: s.paddle.y, vy: -12 });
        s.laserShots.push({ x: s.paddle.x + 30, y: s.paddle.y, vy: -12 });
      }
      s.laserShots = s.laserShots.filter(ls => {
        ls.y += ls.vy;
        s.blocks.forEach(b => {
          if (!b.alive) return;
          const r = blockRect(b);
          if (ls.x > r.x && ls.x < r.x + r.w && ls.y > r.y && ls.y < r.y + r.h) {
            breakBlock(b, r.x, r.y);
            ls.y = -999;
          }
        });
        return ls.y > 0;
      });

      const mainAlive = bounceBall(s.ball);
      if (!mainAlive) {
        s.lives--;
        setLives(s.lives);
        if (s.lives <= 0) {
          s.dead = true;
          setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('breakout-best', String(nb)); return nb; });
          setPhase('dead');
          return;
        }
        s.ball.x = cw / 2; s.ball.y = ch - 100;
        s.ball.vx = (Math.random() < 0.5 ? 1 : -1) * (4 + s.wave * 0.3);
        s.ball.vy = -(4 + s.wave * 0.3);
        s.balls = [];
      }
      s.balls = s.balls.filter(b => bounceBall(b));

      s.powerups = s.powerups.filter(pu => {
        pu.y += pu.vy;
        const pw2 = s.wideActive > 0 ? s.paddle.w * 1.5 : s.paddle.w;
        if (pu.y >= s.paddle.y && pu.y <= s.paddle.y + PADDLE_H
            && pu.x >= s.paddle.x - pw2/2 && pu.x <= s.paddle.x + pw2/2) {
          if (pu.type === 'WIDE')  s.wideActive  = 60 * 8;
          if (pu.type === 'LASER') s.laserActive = 60 * 5;
          if (pu.type === 'MULTI') {
            for (let i = 0; i < 2; i++) s.balls.push({ x: s.ball.x, y: s.ball.y, vx: s.ball.vx + (i === 0 ? -2 : 2), vy: s.ball.vy });
          }
          return false;
        }
        return pu.y < ch + 20;
      });

      s.particles = s.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.04; return p.life > 0; });

      if (s.blocks.every(b => !b.alive)) {
        const prevScore = s.score;
        const nextWave  = s.wave + 1;
        initState(cw, ch, nextWave);
        stateRef.current.score = prevScore;
        setScore(prevScore);
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      s.stars.forEach(st => { st.y += st.vy; if (st.y > ch) st.y = 0; });
      s.gridY = (s.gridY + 0.6) % 60;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);

      s.stars.forEach(st => {
        ctx.fillStyle = `rgba(167,139,250,${0.3 + st.s * 0.2})`;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2); ctx.fill();
      });

      ctx.strokeStyle = 'rgba(191,90,242,0.07)';
      ctx.lineWidth   = 0.5;
      for (let xi = 0; xi <= cw; xi += 60) {
        ctx.beginPath(); ctx.moveTo(xi, 0); ctx.lineTo(xi, ch); ctx.stroke();
      }
      for (let yi = s.gridY; yi <= ch; yi += 60) {
        ctx.beginPath(); ctx.moveTo(0, yi); ctx.lineTo(cw, yi); ctx.stroke();
      }

      s.blocks.forEach(b => {
        if (!b.alive) return;
        const r  = blockRect(b);
        const cr = ROW_COLORS[b.r];
        const t  = b.hits / b.maxHits;
        ctx.fillStyle   = b.prism ? `rgba(255,255,255,0.2)` : `${cr}${Math.round(t * 0.55 * 255).toString(16).padStart(2,'0')}`;
        ctx.strokeStyle = b.prism ? WHITE : cr;
        ctx.lineWidth   = b.prism ? 2 : 1;
        ctx.shadowColor = cr;
        ctx.shadowBlur  = b.hits < b.maxHits ? 6 : 10;
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        if (b.prism) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = `bold 9px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('★', r.x + r.w/2, r.y + r.h/2 + 3);
        }
        ctx.shadowBlur = 0;
      });

      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      s.powerups.forEach(pu => {
        const c = pu.type === 'WIDE' ? CYAN : pu.type === 'LASER' ? PINK : LAVEND;
        ctx.shadowColor = c; ctx.shadowBlur = 12;
        ctx.fillStyle   = c;
        ctx.fillRect(pu.x - 18, pu.y - 8, 36, 16);
        ctx.fillStyle = '#000';
        ctx.font = `bold 8px monospace`; ctx.textAlign = 'center';
        ctx.fillText(pu.type, pu.x, pu.y + 4);
        ctx.shadowBlur = 0;
      });

      s.laserShots.forEach(ls => {
        ctx.strokeStyle = PINK; ctx.lineWidth = 2; ctx.shadowColor = PINK; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(ls.x, ls.y); ctx.lineTo(ls.x, ls.y - 12); ctx.stroke();
        ctx.shadowBlur = 0;
      });

      [[s.ball, CYAN], ...s.balls.map(b => [b, ACCENT])].forEach(([ball, clr]) => {
        ctx.shadowColor = clr; ctx.shadowBlur = 18;
        ctx.fillStyle   = clr;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      const displayW = s.wideActive > 0 ? s.paddle.w * 1.5 : s.paddle.w;
      const pc = s.wideActive > 0 ? CYAN : s.laserActive > 0 ? PINK : ACCENT;
      ctx.shadowColor = pc; ctx.shadowBlur = 16;
      const grad = ctx.createLinearGradient(s.paddle.x - displayW/2, 0, s.paddle.x + displayW/2, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.2, pc);
      grad.addColorStop(0.8, pc);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(s.paddle.x - displayW/2, s.paddle.y, displayW, PADDLE_H);
      ctx.shadowBlur = 0;

      ctx.textAlign = 'left';
      ctx.font = `bold 13px "Orbitron", sans-serif`;
      ctx.fillStyle = ACCENT; ctx.shadowColor = ACCENT; ctx.shadowBlur = 8;
      ctx.fillText(`SCORE ${s.score}`, 20, 28);
      ctx.shadowBlur = 0;
      ctx.font = `11px monospace`; ctx.fillStyle = `rgba(167,139,250,0.6)`;
      ctx.fillText(`WAVE ${s.wave}`, 20, 46);
      for (let l = 0; l < s.lives; l++) {
        ctx.fillStyle = PINK; ctx.shadowColor = PINK; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(cw - 24 - l * 22, 24, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); window.removeEventListener('mousemove', handleMouse); };
  }, [phase, initState]);

  const startPlay = useCallback(() => { setScore(0); setLives(LIVES_MAX); setCountdown(3); setPhase('countdown'); }, []);
  const retry     = useCallback(() => { cancelAnimationFrame(rafRef.current); stateRef.current = null; setScore(0); setLives(LIVES_MAX); setCountdown(3); setPhase('countdown'); }, []);

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: ACCENT, textShadow: `0 0 24px ${ACCENT}`, letterSpacing: '0.2em', marginBottom: 12 }}>NEON BREAKOUT</div>
      <div style={{ color: 'rgba(167,139,250,0.55)', fontSize: 12, marginBottom: 32, letterSpacing: '0.1em' }}>MOUSE / ←→ MOVE PADDLE &nbsp;·&nbsp; BREAK ALL BLOCKS</div>
      <button onClick={startPlay} style={{ background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${ACCENT}` }}>START</button>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid #555`, color: '#555', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? ACCENT : CYAN, textShadow: `0 0 60px ${ACCENT}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP2 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntP2 { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 700, color: PINK, textShadow: `0 0 30px ${PINK}`, letterSpacing: '0.15em', marginBottom: 12 }}>GAME OVER</div>
      <div style={{ color: 'rgba(167,139,250,0.6)', fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>SCORE <strong style={{ color: ACCENT }}>{score}</strong></div>
      <div style={{ color: 'rgba(167,139,250,0.5)', fontSize: 13, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: CYAN }}>{best}</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: ACCENT, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RETRY</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid #555`, color: '#555', padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <button onClick={onExit} style={{ position: 'absolute', top: 12, left: 20, background: 'transparent', border: `1px solid #555`, color: '#555', padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: `rgba(191,90,242,0.3)`, fontSize: 10, letterSpacing: '0.12em', zIndex: 1 }}>MOUSE / ←→ MOVE &nbsp;·&nbsp; POWER-UPS: WIDE / MULTI / LASER</div>
    </div>
  );
}

export default NeonBreakout;
