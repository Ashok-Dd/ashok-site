import { useEffect, useRef, useState, useCallback } from 'react';

const BG     = '#020f1e';
const ACCENT = '#0ea5e9';
const BIOLUM = '#06b6d4';
const GOLD   = '#fbbf24';
const RED    = '#ef4444';
const SHARK  = '#1e3a5f';

const SUB_W = 42, SUB_H = 18;
const SPEED = 3.5;

function DeepDive({ onExit }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const [phase, setPhase]   = useState('entry');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]   = useState(0);
  const [best, setBest]     = useState(() => parseInt(localStorage.getItem('deepdive-best') || '0', 10));
  const [depth, setDepth]   = useState(0);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('play'), 600); return () => clearTimeout(t);
  }, [phase, countdown]);

  const initState = useCallback((cw, ch) => {
    stateRef.current = {
      cw, ch,
      sub:    { x: 140, y: ch / 2 },
      keys:   { up: false, down: false, left: false, right: false, space: false },
      objects: [],
      spawnTimer:  0,
      shakeTimer:  0,
      slowTimer:   0,
      depth:   0,
      score:   0,
      frame:   0,
      dead:    false,
      bubbles: Array.from({ length: 40 }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        r: 1.5 + Math.random() * 3, vy: -(0.4 + Math.random() * 0.6),
      })),
      biolum: Array.from({ length: 60 }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        r: 1 + Math.random() * 2, phase: Math.random() * Math.PI * 2,
      })),
      sonarPulse: null,
      sonarTimer: 0,
      parallaxX: [0, 0, 0],
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
        ' ': 'space',
      };
      if (map[e.key]) { e.preventDefault(); s.keys[map[e.key]] = e.type === 'keydown'; }
      if (e.type === 'keydown' && e.key === ' ') {
        s.sonarPulse = { x: s.sub.x, y: s.sub.y, r: 0, maxR: 200 };
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup',   handleKey);

    const spawnObj = () => {
      const types = ['treasure', 'treasure', 'jellyfish', 'mine', 'shark'];
      const type  = types[Math.floor(Math.random() * types.length)];
      const cw = s.cw, ch = s.ch;
      const y    = 60 + Math.random() * (ch - 120);
      const base = { x: cw + 60, y, alive: true };
      if (type === 'treasure')  return { ...base, type, vy: 0, vx: -(2.5 + s.depth / 2000), bobPhase: Math.random() * Math.PI * 2 };
      if (type === 'jellyfish') return { ...base, type, vy: Math.sin(Math.random()) * 0.6, vx: -(2 + s.depth / 2500), pulsePhase: 0 };
      if (type === 'mine')      return { ...base, type, vy: 0, vx: -(1.8 + s.depth / 3000), bobPhase: Math.random() * Math.PI * 2 };
      if (type === 'shark')     return { ...base, type, vx: -(3 + s.depth / 1500), vy: 0, target: null, lungeTimer: 80 + Math.floor(Math.random() * 60) };
    };

    const drawSub = (shakeX, shakeY) => {
      const { x, y } = s.sub;
      const sx = x + shakeX, sy = y + shakeY;
      ctx.save();
      ctx.translate(sx, sy);

      /* body */
      ctx.shadowColor = ACCENT; ctx.shadowBlur = 14;
      ctx.fillStyle   = '#1e3a5f';
      ctx.beginPath();
      ctx.ellipse(0, 0, SUB_W / 2, SUB_H / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      /* cockpit */
      ctx.fillStyle = ACCENT;
      ctx.beginPath(); ctx.ellipse(-6, -4, 7, 5, 0, 0, Math.PI * 2); ctx.fill();

      /* propeller */
      ctx.strokeStyle = BIOLUM; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(SUB_W / 2 - 2, -6); ctx.lineTo(SUB_W / 2 - 2, 6); ctx.stroke();

      /* periscope */
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-10, -SUB_H / 2); ctx.lineTo(-10, -SUB_H / 2 - 10); ctx.stroke();

      ctx.restore();
    };

    const loop = () => {
      if (!s || s.dead) return;
      s.frame++;
      const { cw, ch } = s;
      const spd = s.slowTimer > 0 ? SPEED * 0.6 : SPEED;

      /* movement */
      if (s.keys.up)    s.sub.y = Math.max(30, s.sub.y - spd);
      if (s.keys.down)  s.sub.y = Math.min(ch - 30, s.sub.y + spd);
      if (s.keys.left)  s.sub.x = Math.max(40, s.sub.x - spd);
      if (s.keys.right) s.sub.x = Math.min(cw - 40, s.sub.x + spd);
      if (s.slowTimer  > 0) s.slowTimer--;
      if (s.shakeTimer > 0) s.shakeTimer--;

      /* sonar pulse */
      if (s.sonarPulse) {
        s.sonarPulse.r += 5;
        if (s.sonarPulse.r >= s.sonarPulse.maxR) s.sonarPulse = null;
      }

      /* depth + score */
      s.depth += 0.08;
      if (s.frame % 60 === 0) {
        s.score += Math.floor(s.depth / 50) + 1;
        setScore(s.score);
        setDepth(Math.floor(s.depth));
      }

      /* spawn objects */
      s.spawnTimer++;
      const interval = Math.max(55, 110 - Math.floor(s.depth / 30));
      if (s.spawnTimer >= interval) { const o = spawnObj(); if (o) s.objects.push(o); s.spawnTimer = 0; }

      /* update + collision */
      s.objects.forEach(obj => {
        obj.x += obj.vx;
        if (obj.type === 'treasure')  obj.y = obj.y + Math.sin(s.frame / 30 + obj.bobPhase) * 0.3;
        if (obj.type === 'jellyfish') { obj.pulsePhase += 0.08; obj.y += Math.sin(obj.pulsePhase) * 0.5; }
        if (obj.type === 'mine')      obj.y = obj.y + Math.sin(s.frame / 24 + obj.bobPhase) * 0.25;
        if (obj.type === 'shark') {
          obj.lungeTimer--;
          if (obj.lungeTimer <= 0) {
            obj.vy = (s.sub.y - obj.y) * 0.06;
            obj.vx = -8;
            obj.lungeTimer = 999;
          } else {
            obj.y += obj.vy;
            obj.vx = Math.max(obj.vx, -(2.5 + s.depth / 1500));
          }
        }

        /* hit detection */
        const dx = s.sub.x - obj.x;
        const dy = s.sub.y - obj.y;
        const dist = Math.hypot(dx, dy);
        const hitR = obj.type === 'mine' ? 22 : obj.type === 'shark' ? 28 : 18;
        if (dist < hitR) {
          if (obj.type === 'treasure') { obj.alive = false; s.score += 10; setScore(s.score); }
          else if (obj.type === 'jellyfish') { obj.alive = false; s.slowTimer = 90; s.score += 3; setScore(s.score); }
          else if (obj.type === 'mine' || obj.type === 'shark') { s.dead = true; }
        }
      });
      s.objects = s.objects.filter(o => o.alive && o.x > -80);

      if (s.dead) {
        setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('deepdive-best', String(nb)); return nb; });
        setPhase('dead');
        return;
      }

      /* shake */
      const shakeX = s.shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
      const shakeY = s.shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;

      /* parallax */
      s.parallaxX[0] -= 0.3; s.parallaxX[1] -= 0.6; s.parallaxX[2] -= 1.2;

      /* ── DRAW ── */
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);

      /* ocean gradient */
      const oGrad = ctx.createLinearGradient(0, 0, 0, ch);
      oGrad.addColorStop(0, '#020f1e');
      oGrad.addColorStop(1, '#010508');
      ctx.fillStyle = oGrad;
      ctx.fillRect(0, 0, cw, ch);

      /* parallax seaweed silhouettes */
      const drawSeaweed = (xi, col) => {
        ctx.fillStyle = col;
        const bh = 40 + Math.sin(xi * 0.5) * 20;
        ctx.fillRect(xi, ch - bh, 6, bh);
      };
      for (let i = 0; i < 20; i++) {
        drawSeaweed(((i * 120 + s.parallaxX[0]) % (cw + 120)), 'rgba(6,182,212,0.07)');
      }
      for (let i = 0; i < 14; i++) {
        drawSeaweed(((i * 160 + s.parallaxX[1]) % (cw + 160)) - 40, 'rgba(6,182,212,0.12)');
      }

      /* bioluminescent particles */
      s.biolum.forEach(p => {
        p.phase += 0.04;
        const a = (0.3 + Math.sin(p.phase) * 0.3);
        ctx.fillStyle = `rgba(6,182,212,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        p.y -= 0.15; if (p.y < 0) { p.y = ch; p.x = Math.random() * cw; }
      });

      /* sonar pulse */
      if (s.sonarPulse) {
        const t = s.sonarPulse.r / s.sonarPulse.maxR;
        ctx.strokeStyle = `rgba(14,165,233,${(1 - t) * 0.7})`;
        ctx.lineWidth   = 2;
        ctx.shadowColor = ACCENT; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(s.sonarPulse.x, s.sonarPulse.y, s.sonarPulse.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* objects */
      s.objects.forEach(obj => {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        if (obj.type === 'treasure') {
          ctx.fillStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 16;
          ctx.fillRect(-12, -10, 24, 20);
          ctx.strokeStyle = '#a16207'; ctx.lineWidth = 1.5;
          ctx.strokeRect(-12, -10, 24, 20);
          ctx.fillStyle = '#a16207';
          ctx.fillRect(-2, -4, 4, 8);
        } else if (obj.type === 'jellyfish') {
          const pulse = 1 + Math.sin(obj.pulsePhase) * 0.15;
          ctx.scale(pulse, pulse);
          ctx.fillStyle = `rgba(6,182,212,0.4)`; ctx.shadowColor = BIOLUM; ctx.shadowBlur = 18;
          ctx.beginPath(); ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = BIOLUM; ctx.lineWidth = 1;
          for (let t = 0; t < 5; t++) {
            ctx.beginPath(); ctx.moveTo(-8 + t * 4, 12); ctx.lineTo(-10 + t * 4, 26); ctx.stroke();
          }
        } else if (obj.type === 'mine') {
          const near = Math.hypot(s.sub.x - obj.x, s.sub.y - obj.y) < 70;
          ctx.fillStyle = near ? 'rgba(239,68,68,0.3)' : 'rgba(100,100,100,0.2)';
          ctx.shadowColor = near ? RED : '#555';
          ctx.shadowBlur  = near ? 20 : 8;
          ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = near ? RED : '#888'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
          for (let sp = 0; sp < 8; sp++) {
            const ang = (sp / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * 18, Math.sin(ang) * 18);
            ctx.lineTo(Math.cos(ang) * 26, Math.sin(ang) * 26);
            ctx.stroke();
          }
        } else if (obj.type === 'shark') {
          ctx.fillStyle = SHARK; ctx.shadowColor = 'rgba(30,58,95,0.8)'; ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(34, 0); ctx.lineTo(-20, -12); ctx.lineTo(-28, 0); ctx.lineTo(-20, 12);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.beginPath(); ctx.arc(24, -3, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });

      /* bubble trail from sub */
      s.bubbles.forEach(b => {
        b.y += b.vy;
        b.x += Math.sin(s.frame / 30) * 0.3;
        if (b.y < 0) { b.y = s.sub.y + (Math.random() - 0.5) * 20; b.x = s.sub.x + 20 + Math.random() * 10; }
      });
      s.bubbles.slice(0, 8).forEach(b => {
        ctx.strokeStyle = `rgba(14,165,233,0.25)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
      });

      drawSub(shakeX, shakeY);

      /* depth vignette */
      const vAlpha = Math.min(0.5, s.depth / 3000);
      const vGrad = ctx.createRadialGradient(cw/2, ch/2, cw * 0.3, cw/2, ch/2, cw * 0.8);
      vGrad.addColorStop(0, `rgba(0,0,0,0)`);
      vGrad.addColorStop(1, `rgba(0,5,20,${vAlpha})`);
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, cw, ch);

      /* depth meter */
      ctx.fillStyle = `rgba(14,165,233,0.15)`;
      ctx.fillRect(0, 0, 6, ch);
      const meterH = Math.min(ch, (s.depth / 3000) * ch);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(0, 0, 6, meterH);

      /* UI text */
      ctx.textAlign = 'left';
      ctx.font = `bold 13px "Orbitron", sans-serif`;
      ctx.fillStyle = ACCENT; ctx.shadowColor = ACCENT; ctx.shadowBlur = 8;
      ctx.fillText(`${s.score}`, 20, 28);
      ctx.shadowBlur = 0;
      ctx.font = `10px monospace`; ctx.fillStyle = `rgba(14,165,233,0.5)`;
      ctx.fillText(`DEPTH ${Math.floor(s.depth)}m`, 20, 44);
      if (s.slowTimer > 0) {
        ctx.fillStyle = BIOLUM;
        ctx.fillText('SLOW MOTION', cw/2 - 40, 28);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [phase, initState]);

  const startPlay = useCallback(() => { setScore(0); setDepth(0); setCountdown(3); setPhase('countdown'); }, []);
  const retry     = useCallback(() => { cancelAnimationFrame(rafRef.current); stateRef.current = null; setScore(0); setDepth(0); setCountdown(3); setPhase('countdown'); }, []);

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: ACCENT, textShadow: `0 0 24px ${ACCENT}`, letterSpacing: '0.2em', marginBottom: 12 }}>DEEP DIVE</div>
      <div style={{ color: 'rgba(14,165,233,0.55)', fontSize: 12, marginBottom: 6, letterSpacing: '0.1em' }}>WASD / ↑↓←→ MOVE &nbsp;·&nbsp; SPACE = SONAR PULSE</div>
      <div style={{ color: 'rgba(14,165,233,0.4)', fontSize: 11, marginBottom: 32, letterSpacing: '0.08em' }}>COLLECT TREASURE + JELLYFISH &nbsp;·&nbsp; AVOID MINES + SHARKS</div>
      <button onClick={startPlay} style={{ background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${ACCENT}` }}>DIVE</button>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid #1e3a5f`, color: '#1e3a5f', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? ACCENT : BIOLUM, textShadow: `0 0 60px ${ACCENT}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntP { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 700, color: RED, textShadow: `0 0 30px ${RED}`, letterSpacing: '0.15em', marginBottom: 12 }}>HULL BREACH</div>
      <div style={{ color: 'rgba(14,165,233,0.6)', fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>SCORE <strong style={{ color: ACCENT }}>{score}</strong></div>
      <div style={{ color: 'rgba(14,165,233,0.5)', fontSize: 13, marginBottom: 6, letterSpacing: '0.1em' }}>DEPTH <strong style={{ color: BIOLUM }}>{depth}m</strong></div>
      <div style={{ color: 'rgba(14,165,233,0.4)', fontSize: 12, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: GOLD }}>{best}</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: ACCENT, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>REDIVE</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid #1e3a5f`, color: '#1e3a5f', padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <button onClick={onExit} style={{ position: 'absolute', top: 12, left: 20, background: 'transparent', border: `1px solid #1e3a5f`, color: '#1e3a5f', padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: `rgba(14,165,233,0.3)`, fontSize: 10, letterSpacing: '0.12em', zIndex: 1 }}>WASD / ARROWS — MOVE &nbsp;·&nbsp; SPACE — SONAR</div>
    </div>
  );
}

export default DeepDive;
