import { useEffect, useRef, useState, useCallback } from 'react';

const BG     = '#0a0a14';
const ACCENT = '#00d4ff';
const DIM    = '#007a99';
const GHOST  = '#39ff14';

const PLAYER_R    = 10;
const PLAYER_SPEED = 4.5;
const WARN_MS     = 900;
const FIRE_MS     = 380;
const FADE_MS     = 320;

function LaserDodge({ onExit }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(null);
  const rafRef     = useRef(null);
  const [phase, setPhase]         = useState('entry');
  const [bootLines, setBootLines] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]         = useState(0);
  const [best, setBest]           = useState(() => parseInt(localStorage.getItem('laser-best') || '0', 10));

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('play'), 600); return () => clearTimeout(t);
  }, [phase, countdown]);

  /* ── Boot ── */
  useEffect(() => {
    if (phase !== 'entry') return;
    const lines = ['LOADING DUEL PROTOCOL…', 'AI LASER GRID ONLINE…', 'DODGE OR DIE'];
    let i = 0;
    const show = () => { setBootLines(p => [...p, lines[i]]); i++; if (i < lines.length) setTimeout(show, 650); };
    const t = setTimeout(show, 350);
    return () => clearTimeout(t);
  }, [phase]);

  /* ── Init ── */
  const initState = useCallback((cw, ch) => {
    stateRef.current = {
      cw, ch,
      player:  { x: cw / 2, y: ch / 2, ghost: 0 },
      lasers:  [],
      crystal: null,
      crystalTimer: 0,
      laserTimer:   0,
      laserInterval: 120,
      score:   0,
      frame:   0,
      keys:    { up: false, down: false, left: false, right: false },
      dead:    false,
      rain:    Array.from({ length: 60 }, () => ({
        x: Math.random() * cw,
        y: Math.random() * ch,
        len: 8 + Math.random() * 14,
        speed: 4 + Math.random() * 4,
      })),
    };
  }, []);

  /* ── Game loop ── */
  useEffect(() => {
    if (phase !== 'play') return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
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

    const spawnLaser = () => {
      const axis = Math.random() < 0.6 ? 'h' : (Math.random() < 0.5 ? 'v' : 'd');
      const laser = { axis, age: 0, alive: true };
      if (axis === 'h')      laser.y = 80 + Math.random() * (s.ch - 160);
      else if (axis === 'v') laser.x = 80 + Math.random() * (s.cw - 160);
      else {
        /* diagonal: pick random start edge point */
        laser.slope = Math.random() < 0.5 ? 1 : -1;
        laser.offset = (Math.random() * (s.cw + s.ch)) - s.ch;
      }
      s.lasers.push(laser);
    };

    const isOnLaser = (laser) => {
      const { x, y } = s.player;
      const MARGIN = PLAYER_R + 4;
      if (laser.axis === 'h') return Math.abs(y - laser.y) < MARGIN;
      if (laser.axis === 'v') return Math.abs(x - laser.x) < MARGIN;
      /* diagonal: y = slope*(x - offset) roughly */
      const expectedY = laser.slope * x + laser.offset;
      return Math.abs(y - expectedY) < MARGIN * 1.5;
    };

    const drawGrid = () => {
      const cols = Math.ceil(s.cw / 48), rows = Math.ceil(s.ch / 48);
      ctx.strokeStyle = 'rgba(0,212,255,0.06)';
      ctx.lineWidth   = 0.5;
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath(); ctx.moveTo(i * 48, 0); ctx.lineTo(i * 48, s.ch); ctx.stroke();
      }
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * 48); ctx.lineTo(s.cw, j * 48); ctx.stroke();
      }
    };

    const drawRain = () => {
      ctx.strokeStyle = 'rgba(0,212,255,0.1)';
      ctx.lineWidth   = 0.8;
      s.rain.forEach(r => {
        r.y += r.speed;
        if (r.y > s.ch + 20) { r.y = -20; r.x = Math.random() * s.cw; }
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 1, r.y + r.len);
        ctx.stroke();
      });
    };

    const drawLaser = (laser) => {
      const totalMs  = WARN_MS + FIRE_MS + FADE_MS;
      const elapsed  = (laser.age / 60) * 1000;
      let alpha = 0;
      let firing = false;
      let dashed = false;

      if (elapsed < WARN_MS) {
        /* warning phase: dashed, pulsing */
        alpha  = 0.2 + Math.sin(elapsed / 80) * 0.15;
        dashed = true;
      } else if (elapsed < WARN_MS + FIRE_MS) {
        /* fire phase: solid, bright */
        alpha  = 1;
        firing = true;
      } else {
        /* fade phase */
        alpha = 1 - (elapsed - WARN_MS - FIRE_MS) / FADE_MS;
        if (alpha < 0) { laser.alive = false; return; }
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = firing ? '#ffffff' : ACCENT;
      ctx.shadowBlur  = firing ? 30 : 12;
      ctx.strokeStyle = firing ? '#ffffff' : ACCENT;
      ctx.lineWidth   = firing ? 3 : 1.5;
      if (dashed) ctx.setLineDash([12, 8]);

      ctx.beginPath();
      if (laser.axis === 'h') {
        ctx.moveTo(0, laser.y); ctx.lineTo(s.cw, laser.y);
      } else if (laser.axis === 'v') {
        ctx.moveTo(laser.x, 0); ctx.lineTo(laser.x, s.ch);
      } else {
        /* diagonal */
        const x0 = 0,  y0 = laser.slope * x0 + laser.offset;
        const x1 = s.cw, y1 = laser.slope * x1 + laser.offset;
        ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const drawPlayer = () => {
      const { x, y, ghost } = s.player;
      ctx.save();
      const isGhost = ghost > 0;
      ctx.shadowColor = isGhost ? GHOST : ACCENT;
      ctx.shadowBlur  = isGhost ? 28 : 16;
      ctx.fillStyle   = isGhost ? GHOST : ACCENT;
      ctx.globalAlpha = isGhost ? 0.7 + Math.sin(Date.now() / 120) * 0.3 : 1;
      ctx.beginPath();
      ctx.arc(x, y, PLAYER_R, 0, Math.PI * 2);
      ctx.fill();
      /* inner dot */
      ctx.fillStyle   = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawCrystal = () => {
      const cr = s.crystal;
      if (!cr) return;
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.2;
      ctx.save();
      ctx.translate(cr.x, cr.y);
      ctx.rotate(Date.now() / 800);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = GHOST;
      ctx.shadowBlur  = 20;
      ctx.fillStyle   = GHOST;
      ctx.beginPath();
      ctx.moveTo(0, -10); ctx.lineTo(7, 0); ctx.lineTo(0, 10); ctx.lineTo(-7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let flashFrames = 0;

    const loop = () => {
      s.frame++;
      const { cw, ch, keys, player } = s;
      if (!s || s.dead) return;

      /* movement */
      if (keys.up)    player.y = Math.max(PLAYER_R, player.y - PLAYER_SPEED);
      if (keys.down)  player.y = Math.min(ch - PLAYER_R, player.y + PLAYER_SPEED);
      if (keys.left)  player.x = Math.max(PLAYER_R, player.x - PLAYER_SPEED);
      if (keys.right) player.x = Math.min(cw - PLAYER_R, player.x + PLAYER_SPEED);
      if (player.ghost > 0) player.ghost--;

      /* spawn laser */
      s.laserTimer++;
      if (s.laserTimer >= s.laserInterval) {
        spawnLaser();
        s.laserTimer = 0;
        /* increase frequency over time */
        s.laserInterval = Math.max(45, s.laserInterval - 0.4);
      }

      /* crystal spawn every ~500 frames */
      s.crystalTimer++;
      if (s.crystalTimer >= 500 && !s.crystal) {
        s.crystal = {
          x: 80 + Math.random() * (cw - 160),
          y: 80 + Math.random() * (ch - 160),
        };
        s.crystalTimer = 0;
      }

      /* crystal collect */
      if (s.crystal) {
        const d = Math.hypot(player.x - s.crystal.x, player.y - s.crystal.y);
        if (d < PLAYER_R + 12) {
          player.ghost = Math.round(3 * 60); /* 3s ghost mode */
          s.score += 5;
          setScore(s.score);
          s.crystal = null;
          flashFrames = 2;
        }
      }

      /* age lasers + collision */
      s.lasers.forEach(l => {
        l.age++;
        const elapsed = (l.age / 60) * 1000;
        if (player.ghost <= 0 && elapsed >= WARN_MS && elapsed < WARN_MS + FIRE_MS) {
          if (isOnLaser(l)) {
            s.dead = true;
          }
        }
      });
      s.lasers = s.lasers.filter(l => l.alive);

      /* score tick */
      if (s.frame % 60 === 0) {
        s.score++;
        setScore(s.score);
      }

      /* draw */
      if (flashFrames > 0) {
        ctx.fillStyle = 'rgba(57,255,20,0.18)';
        ctx.fillRect(0, 0, cw, ch);
        flashFrames--;
      } else {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, cw, ch);
      }

      drawGrid();
      drawRain();
      s.lasers.forEach(drawLaser);
      drawCrystal();
      drawPlayer();

      /* score text on canvas */
      ctx.font      = `bold 14px "Orbitron", sans-serif`;
      ctx.fillStyle = `rgba(0,212,255,0.55)`;
      ctx.textAlign = 'right';
      ctx.fillText(`${s.score}s`, cw - 80, 28);

      if (s.dead) {
        setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('laser-best', String(nb)); return nb; });
        setPhase('dead');
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [phase, initState]);

  const startPlay = useCallback(() => { setScore(0); setCountdown(3); setPhase('countdown'); }, []);
  const retry     = useCallback(() => { cancelAnimationFrame(rafRef.current); stateRef.current = null; setScore(0); setCountdown(3); setPhase('countdown'); }, []);

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: ACCENT, textShadow: `0 0 24px ${ACCENT}`, letterSpacing: '0.2em', marginBottom: 36 }}>LASER DODGE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: DIM }}>
        {bootLines.map((line, i) => (
          <div key={i} style={{ letterSpacing: '0.06em' }}>{'> '}{line}{i === bootLines.length - 1 && <span style={{ borderRight: `2px solid ${ACCENT}`, marginLeft: 3, animation: 'blink 1s step-end infinite' }} />}</div>
        ))}
      </div>
      {bootLines.length === 3 && (
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, color: `rgba(0,212,255,0.55)`, letterSpacing: '0.1em' }}>WASD / ↑↓←→ TO MOVE &nbsp;·&nbsp; GREEN CRYSTAL = 3s GHOST</div>
          <button onClick={startPlay} style={{ background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${ACCENT}` }}>START</button>
        </div>
      )}
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? ACCENT : '#39ff14', textShadow: `0 0 60px ${ACCENT}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntP { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 700, color: '#ff3355', textShadow: '0 0 30px #ff3355', letterSpacing: '0.15em', marginBottom: 12 }}>TERMINATED</div>
      <div style={{ color: DIM, fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>SURVIVED <strong style={{ color: ACCENT }}>{score}s</strong></div>
      <div style={{ color: DIM, fontSize: 13, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: GHOST }}>{best}s</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: ACCENT, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RETRY</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', top: 14, left: 20, fontFamily: '"Share Tech Mono", monospace', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
        <span style={{ color: ACCENT, fontSize: 13, letterSpacing: '0.1em', textShadow: `0 0 10px ${ACCENT}` }}>LASER DODGE</span>
        <span style={{ color: ACCENT, fontSize: 12, letterSpacing: '0.08em' }}>SCORE {score}s &nbsp;·&nbsp; <span style={{ color: DIM }}>BEST {best}s</span></span>
      </div>
      <button onClick={onExit} style={{ position: 'absolute', top: 12, right: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: `rgba(0,212,255,0.3)`, fontSize: 10, letterSpacing: '0.12em', zIndex: 1 }}>WASD / ARROWS — MOVE &nbsp;·&nbsp; CRYSTAL = GHOST MODE</div>
    </div>
  );
}

export default LaserDodge;
