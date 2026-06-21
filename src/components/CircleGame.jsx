import { useEffect, useRef, useState, useCallback } from 'react';

const BG     = '#020f1e';
const ACCENT = '#0ea5e9';
const CYAN   = '#06b6d4';
const GOLD   = '#fbbf24';
const DIM    = '#1e3a5f';
const DRAW_TIME = 10;

function grade(pct) {
  if (pct >= 98) return { label: 'PERFECT', color: '#fbbf24' };
  if (pct >= 92) return { label: 'EXCELLENT', color: '#22c55e' };
  if (pct >= 82) return { label: 'GREAT', color: ACCENT };
  if (pct >= 68) return { label: 'GOOD', color: CYAN };
  if (pct >= 50) return { label: 'OKAY', color: '#a78bfa' };
  return { label: 'KEEP TRYING', color: '#ef4444' };
}

function calcPerfectness(pts) {
  if (pts.length < 20) return 0;
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const radii = pts.map(p => Math.hypot(p.x - cx, p.y - cy));
  const avg = radii.reduce((s, r) => s + r, 0) / radii.length;
  if (avg < 20) return 0;
  const variance = radii.reduce((s, r) => s + (r - avg) ** 2, 0) / radii.length;
  const stddev = Math.sqrt(variance);
  const raw = Math.max(0, 1 - stddev / avg);
  // also penalise if start/end are far apart (not a closed circle)
  const gap = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
  const closurePenalty = Math.min(1, gap / avg);
  return Math.round(Math.max(0, (raw - closurePenalty * 0.25)) * 100);
}

export default function CircleGame({ onExit }) {
  const canvasRef   = useRef(null);
  const pointsRef   = useRef([]);
  const drawingRef  = useRef(false);
  const timerRef    = useRef(null);
  const animRef     = useRef(null);

  const [phase, setPhase]     = useState('entry');   // entry | countdown | draw | result | timeout
  const [cdVal, setCdVal]     = useState(3);
  const [timeLeft, setTimeLeft] = useState(DRAW_TIME);
  const [score, setScore]     = useState(0);
  const [best, setBest]       = useState(() => parseInt(localStorage.getItem('circle-best') || '0', 10));

  /* ── countdown → draw ── */
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (cdVal > 0) { const t = setTimeout(() => setCdVal(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('draw'), 600);
    return () => clearTimeout(t);
  }, [phase, cdVal]);

  /* ── 10-second draw timer ── */
  useEffect(() => {
    if (phase !== 'draw') return;
    setTimeLeft(DRAW_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // if they drew something, show result; else timeout
          if (pointsRef.current.length >= 20) {
            const pct = calcPerfectness(pointsRef.current);
            setScore(pct);
            setBest(prev => { const nb = Math.max(prev, pct); localStorage.setItem('circle-best', String(nb)); return nb; });
            setPhase('result');
          } else {
            setPhase('timeout');
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  /* ── canvas draw loop ── */
  useEffect(() => {
    if (phase !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // bg grid
      ctx.strokeStyle = `${ACCENT}10`;
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      // guide ring (subtle)
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const r = Math.min(canvas.width, canvas.height) * 0.28;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `${ACCENT}15`; ctx.lineWidth = 1; ctx.setLineDash([6, 8]); ctx.stroke(); ctx.setLineDash([]);

      // drawn path
      const pts = pointsRef.current;
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // start dot
        ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, 5, 0, Math.PI * 2);
        ctx.fillStyle = GOLD; ctx.fill();
      }

      animRef.current = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [phase]);

  /* ── result canvas: show drawn circle + ideal overlay ── */
  useEffect(() => {
    if (phase !== 'result') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const pts = pointsRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // bg grid
    ctx.strokeStyle = `${ACCENT}10`; ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    if (pts.length > 1) {
      // compute centroid + avg radius
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const avg = pts.reduce((s, p) => s + Math.hypot(p.x - cx, p.y - cy), 0) / pts.length;

      // ideal circle
      ctx.beginPath(); ctx.arc(cx, cy, avg, 0, Math.PI * 2);
      ctx.strokeStyle = `${GOLD}55`; ctx.lineWidth = 1.5; ctx.setLineDash([5, 6]); ctx.stroke(); ctx.setLineDash([]);

      // drawn path
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = ACCENT; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;

      // centroid dot
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = GOLD; ctx.fill();
    }
  }, [phase]);

  /* ── pointer events ── */
  const onPointerDown = useCallback((e) => {
    if (phase !== 'draw') return;
    drawingRef.current = true;
    pointsRef.current = [{ x: e.clientX, y: e.clientY }];
  }, [phase]);

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current || phase !== 'draw') return;
    pointsRef.current.push({ x: e.clientX, y: e.clientY });
  }, [phase]);

  const onPointerUp = useCallback(() => {
    if (!drawingRef.current || phase !== 'draw') return;
    drawingRef.current = false;
    clearInterval(timerRef.current);
    if (pointsRef.current.length >= 20) {
      const pct = calcPerfectness(pointsRef.current);
      setScore(pct);
      setBest(prev => { const nb = Math.max(prev, pct); localStorage.setItem('circle-best', String(nb)); return nb; });
      setPhase('result');
    } else {
      setPhase('timeout');
    }
  }, [phase]);

  const startGame = () => { pointsRef.current = []; setCdVal(3); setPhase('countdown'); };
  const retry     = () => { cancelAnimationFrame(animRef.current); clearInterval(timerRef.current); pointsRef.current = []; setCdVal(3); setPhase('countdown'); };

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: ACCENT, textShadow: `0 0 24px ${ACCENT}`, letterSpacing: '0.2em', marginBottom: 12 }}>CIRCLE DRAW</div>
      <div style={{ color: `${ACCENT}88`, fontSize: 12, marginBottom: 6, letterSpacing: '0.1em' }}>DRAW A CIRCLE WITH YOUR MOUSE</div>
      <div style={{ color: `${ACCENT}55`, fontSize: 11, marginBottom: 6, letterSpacing: '0.08em' }}>YOU HAVE 10 SECONDS — RELEASE TO SUBMIT EARLY</div>
      <div style={{ color: GOLD, fontSize: 11, marginBottom: 32, letterSpacing: '0.08em' }}>SCORE = HOW ROUND YOUR CIRCLE IS</div>
      <button onClick={startGame} style={{ background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${ACCENT}` }}>START</button>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={cdVal} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: cdVal > 0 ? ACCENT : CYAN, textShadow: `0 0 60px ${ACCENT}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP 0.75s ease-out forwards' }}>
        {cdVal > 0 ? cdVal : 'DRAW!'}
      </div>
      <style>{`@keyframes cntP { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'timeout') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: '#ef4444', textShadow: '0 0 30px #ef4444', letterSpacing: '0.15em', marginBottom: 12 }}>TIME OUT</div>
      <div style={{ color: `${ACCENT}66`, fontSize: 13, marginBottom: 36, letterSpacing: '0.1em' }}>DRAW A CIRCLE WITHIN 10 SECONDS</div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: ACCENT, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>TRY AGAIN</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  if (phase === 'result') {
    const g = grade(score);
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'transparent', zIndex: 9999 }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', background: BG }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '10vh', fontFamily: '"Share Tech Mono", monospace', pointerEvents: 'none' }}>
          <div style={{ fontSize: 'clamp(3rem,12vw,7rem)', fontWeight: 900, color: g.color, textShadow: `0 0 40px ${g.color}`, fontFamily: '"Orbitron", sans-serif', lineHeight: 1 }}>{score}%</div>
          <div style={{ fontSize: 'clamp(1rem,3vw,1.6rem)', fontWeight: 700, color: g.color, letterSpacing: '0.25em', marginTop: 8, marginBottom: 4 }}>{g.label}</div>
          <div style={{ color: `${ACCENT}55`, fontSize: 11, letterSpacing: '0.1em', marginBottom: 28 }}>BEST: <span style={{ color: GOLD }}>{best}%</span></div>
          <div style={{ display: 'flex', gap: 14, pointerEvents: 'all' }}>
            <button onClick={retry} style={{ background: ACCENT, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>TRY AGAIN</button>
            <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
          </div>
        </div>
        <button onClick={onExit} style={{ position: 'absolute', top: 12, right: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.1em' }}>EXIT</button>
      </div>
    );
  }

  // draw phase
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999, cursor: 'crosshair', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      {/* timer */}
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Orbitron", sans-serif', fontSize: 'clamp(1.2rem,3vw,2rem)', fontWeight: 900, color: timeLeft <= 3 ? '#ef4444' : ACCENT, textShadow: `0 0 20px ${timeLeft <= 3 ? '#ef4444' : ACCENT}`, zIndex: 1, letterSpacing: '0.1em' }}>
        {timeLeft}s
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: `${ACCENT}40`, fontSize: 10, letterSpacing: '0.12em', zIndex: 1, pointerEvents: 'none' }}>CLICK + DRAG TO DRAW · RELEASE TO SUBMIT</div>
      <button onClick={onExit} style={{ position: 'absolute', top: 12, right: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
    </div>
  );
}
