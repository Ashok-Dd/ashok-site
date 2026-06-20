import { useEffect, useRef, useState, useCallback } from 'react';

const BG      = '#180d02';
const ORANGE  = '#f97316';
const WARM    = '#fde68a';
const PIPE_CLR = '#3d1500';
const RIM_CLR  = '#f97316';

const BALL_R   = 18;
const GRAVITY  = 0.46;
const FLAP_V   = -9.2;
const PIPE_W   = 58;
const GAP_H    = 155;
const PIPE_ITV = 230;

function FlappyDunk({ onExit }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const [phase, setPhase]       = useState('entry');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]       = useState(0);
  const [best, setBest]         = useState(() => parseInt(localStorage.getItem('flappydunk-best') || '0', 10));

  /* ── countdown ── */
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('play'), 600);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const initState = useCallback((cw, ch) => {
    stateRef.current = {
      cw, ch,
      ball:   { x: cw * 0.25, y: ch / 2, vy: 0, rot: 0 },
      pipes:  [],
      pTimer: Math.floor(PIPE_ITV * 0.55), /* first hoop comes sooner */
      speed:  3,
      score:  0,
      frame:  0,
      dead:   false,
      mountainX: 0,
      clouds: Array.from({ length: 5 }, (_, i) => ({
        x: i * (cw / 5),
        y: 30 + Math.random() * (ch * 0.35),
        w: 60 + Math.random() * 90,
        spd: 0.25 + Math.random() * 0.4,
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

    const flap = () => { if (!s.dead) s.ball.vy = FLAP_V; };
    const onKey   = (e) => { if (e.code === 'Space') { e.preventDefault(); flap(); } };
    const onClick = () => flap();
    window.addEventListener('keydown', onKey);
    canvas.addEventListener('click', onClick);

    const spawnPipe = () => {
      const { cw, ch } = s;
      const minY = 80, maxY = ch - GAP_H - 80;
      const gapY = minY + Math.random() * (maxY - minY);
      s.pipes.push({ x: cw + PIPE_W, gapY, scored: false });
    };

    const drawBg = () => {
      const { cw, ch } = s;
      const grad = ctx.createLinearGradient(0, 0, 0, ch);
      grad.addColorStop(0,   '#120400');
      grad.addColorStop(0.4, '#4a1200');
      grad.addColorStop(0.75,'#7c2d12');
      grad.addColorStop(1,   '#c2410c');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, cw, ch);

      /* sun */
      ctx.save();
      const sg = ctx.createRadialGradient(cw * 0.72, ch * 0.22, 0, cw * 0.72, ch * 0.22, 85);
      sg.addColorStop(0, WARM); sg.addColorStop(0.5, ORANGE); sg.addColorStop(1, 'transparent');
      ctx.shadowColor = WARM; ctx.shadowBlur = 60;
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cw * 0.72, ch * 0.22, 85, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      /* clouds */
      s.clouds.forEach(c => {
        c.x -= c.spd; if (c.x + c.w < 0) { c.x = cw + c.w; c.y = 30 + Math.random() * (ch * 0.35); }
        ctx.fillStyle = 'rgba(180,65,15,0.22)';
        ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w / 2, 18, 0, 0, Math.PI * 2); ctx.fill();
      });

      /* mountains */
      s.mountainX -= 0.9;
      ctx.fillStyle = 'rgba(35,8,0,0.92)';
      ctx.beginPath(); ctx.moveTo(0, ch);
      for (let i = 0; i <= 11; i++) {
        const bx = ((i * (cw / 10)) + s.mountainX) % (cw + 110) - 55;
        const ph = 55 + ((i * 137) % 80);
        ctx.lineTo(bx - 55, ch - 8); ctx.lineTo(bx, ch - ph); ctx.lineTo(bx + 55, ch - 8);
      }
      ctx.lineTo(cw, ch); ctx.closePath(); ctx.fill();
    };

    const drawPipe = (pipe) => {
      const { x, gapY } = pipe;
      const { ch } = s;
      const rimOW = 10; /* rim overhang each side */

      /* top block */
      ctx.fillStyle = PIPE_CLR;
      ctx.fillRect(x - PIPE_W / 2, 0, PIPE_W, gapY - 16);
      /* top rim */
      ctx.shadowColor = RIM_CLR; ctx.shadowBlur = 14;
      ctx.fillStyle = RIM_CLR;
      ctx.fillRect(x - PIPE_W / 2 - rimOW, gapY - 22, PIPE_W + rimOW * 2, 9);
      /* net lines top */
      ctx.strokeStyle = 'rgba(249,115,22,0.45)'; ctx.lineWidth = 1; ctx.shadowBlur = 0;
      for (let i = 0; i < 5; i++) {
        const nx = x - PIPE_W / 2 - rimOW + i * (PIPE_W + rimOW * 2) / 4;
        ctx.beginPath(); ctx.moveTo(nx, gapY - 13); ctx.lineTo(nx - 5, gapY); ctx.stroke();
      }

      /* bottom block */
      ctx.fillStyle = PIPE_CLR;
      ctx.fillRect(x - PIPE_W / 2, gapY + GAP_H + 16, PIPE_W, ch - gapY - GAP_H - 16);
      /* bottom rim */
      ctx.shadowColor = RIM_CLR; ctx.shadowBlur = 14;
      ctx.fillStyle = RIM_CLR;
      ctx.fillRect(x - PIPE_W / 2 - rimOW, gapY + GAP_H + 13, PIPE_W + rimOW * 2, 9);
      /* net lines bottom */
      ctx.strokeStyle = 'rgba(249,115,22,0.45)'; ctx.lineWidth = 1; ctx.shadowBlur = 0;
      for (let i = 0; i < 5; i++) {
        const nx = x - PIPE_W / 2 - rimOW + i * (PIPE_W + rimOW * 2) / 4;
        ctx.beginPath(); ctx.moveTo(nx, gapY + GAP_H + 22); ctx.lineTo(nx - 5, gapY + GAP_H + 35); ctx.stroke();
      }

      /* subtle gap glow when ball is near */
      if (Math.abs(s.ball.x - x) < 60) {
        ctx.fillStyle = 'rgba(249,115,22,0.06)';
        ctx.fillRect(x - PIPE_W / 2 - rimOW, gapY, PIPE_W + rimOW * 2, GAP_H);
      }
    };

    const drawBall = () => {
      const { x, y, rot } = s.ball;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot);
      ctx.shadowColor = ORANGE; ctx.shadowBlur = 18;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
      /* highlight */
      ctx.fillStyle = 'rgba(253,230,138,0.25)';
      ctx.beginPath(); ctx.arc(-4, -5, 8, 0, Math.PI * 2); ctx.fill();
      /* basketball seam lines */
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 2; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(-BALL_R, 0); ctx.lineTo(BALL_R, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -BALL_R); ctx.lineTo(0, BALL_R); ctx.stroke();
      ctx.beginPath(); ctx.arc(-BALL_R * 0.45, 0, BALL_R * 0.7, -0.85, 0.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(BALL_R * 0.45, 0, BALL_R * 0.7, Math.PI - 0.85, Math.PI + 0.85); ctx.stroke();
      ctx.restore();
    };

    const loop = () => {
      if (!s || s.dead) return;
      s.frame++;
      const { cw, ch } = s;

      /* physics */
      s.ball.vy += GRAVITY;
      s.ball.vy  = Math.max(-13, Math.min(13, s.ball.vy));
      s.ball.y  += s.ball.vy;
      s.ball.rot += s.ball.vy * 0.04;

      if (s.ball.y - BALL_R < 0 || s.ball.y + BALL_R > ch) { s.dead = true; }

      /* spawn pipes */
      s.pTimer++;
      if (s.pTimer >= PIPE_ITV) {
        spawnPipe();
        s.pTimer = 0;
        s.speed  = 3 + Math.floor(s.score / 6) * 0.25;
      }

      /* update pipes + collision */
      s.pipes.forEach(p => {
        p.x -= s.speed;
        if (!p.scored && p.x < s.ball.x - BALL_R) {
          p.scored = true;
          s.score++;
          setScore(s.score);
        }
        const inX = s.ball.x + BALL_R > p.x - PIPE_W / 2 - 10 && s.ball.x - BALL_R < p.x + PIPE_W / 2 + 10;
        if (inX) {
          const inGap = s.ball.y - BALL_R > p.gapY && s.ball.y + BALL_R < p.gapY + GAP_H;
          if (!inGap) s.dead = true;
        }
      });
      s.pipes = s.pipes.filter(p => p.x > -PIPE_W - 20);

      if (s.dead) {
        setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('flappydunk-best', String(nb)); return nb; });
        setPhase('dead');
        return;
      }

      drawBg();
      s.pipes.forEach(drawPipe);
      drawBall();

      /* score */
      ctx.textAlign  = 'center';
      ctx.font       = `bold 48px "Orbitron", sans-serif`;
      ctx.fillStyle  = 'rgba(253,230,138,0.85)';
      ctx.shadowColor = ORANGE; ctx.shadowBlur = 20;
      ctx.fillText(s.score, cw / 2, 70);
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('click', onClick);
    };
  }, [phase, initState]);

  const startPlay = useCallback(() => { setScore(0); setCountdown(3); setPhase('countdown'); }, []);
  const retry     = useCallback(() => { cancelAnimationFrame(rafRef.current); stateRef.current = null; setScore(0); setCountdown(3); setPhase('countdown'); }, []);

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.8rem)', fontWeight: 700, color: ORANGE, textShadow: `0 0 24px ${ORANGE}`, letterSpacing: '0.2em', marginBottom: 10 }}>FLAPPY DUNK</div>
      <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🏀</div>
      <div style={{ color: 'rgba(253,230,138,0.55)', fontSize: 12, marginBottom: 6, letterSpacing: '0.1em' }}>SPACE / TAP — FLAP</div>
      <div style={{ color: 'rgba(253,230,138,0.38)', fontSize: 11, marginBottom: 32, letterSpacing: '0.08em' }}>FLY THROUGH THE HOOPS TO SCORE</div>
      <button onClick={startPlay} style={{ background: 'transparent', border: `1px solid ${ORANGE}`, color: ORANGE, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${ORANGE}` }}>PLAY</button>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid #7c2d12`, color: '#7c2d12', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? ORANGE : WARM, textShadow: `0 0 60px ${ORANGE}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntPulse 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntPulse { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: '#ef4444', textShadow: '0 0 30px #ef4444', letterSpacing: '0.15em', marginBottom: 12 }}>MISSED!</div>
      <div style={{ color: 'rgba(253,230,138,0.6)', fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>DUNKS <strong style={{ color: ORANGE }}>{score}</strong></div>
      <div style={{ color: 'rgba(253,230,138,0.4)', fontSize: 12, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: WARM }}>{best}</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: ORANGE, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RETRY</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid #7c2d12`, color: '#7c2d12', padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <button onClick={onExit} style={{ position: 'absolute', top: 12, left: 20, background: 'transparent', border: `1px solid #7c2d12`, color: '#7c2d12', padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: 'rgba(249,115,22,0.3)', fontSize: 10, letterSpacing: '0.12em', zIndex: 1 }}>SPACE / TAP — FLAP</div>
    </div>
  );
}

export default FlappyDunk;
