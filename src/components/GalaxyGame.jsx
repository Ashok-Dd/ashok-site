import { useEffect, useRef, useState, useCallback } from 'react';

const BG      = '#02000a';
const PURPLE  = '#7c3aed';
const LAVEND  = '#c4b5fd';
const WHITE   = 'rgba(255,255,255,0.9)';
const UFO_CLR = '#22d3ee';

const SHIP_DRAG = 0.985;
const THRUST_F  = 0.22;
const ROT_SPD   = 0.05;
const BULLET_SPD = 11;
const LIVES_MAX  = 3;

function AsteroidBlast({ onExit }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const [phase, setPhase]   = useState('entry');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]   = useState(0);
  const [lives, setLives]   = useState(LIVES_MAX);
  const [best, setBest]     = useState(() => parseInt(localStorage.getItem('asteroid-best') || '0', 10));

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 800); return () => clearTimeout(t); }
    const t = setTimeout(() => setPhase('play'), 600); return () => clearTimeout(t);
  }, [phase, countdown]);

  const makeAsteroid = useCallback((cw, ch, size, x, y) => {
    const r = size === 'L' ? 38 : size === 'M' ? 22 : 12;
    const spd = size === 'L' ? 0.8 : size === 'M' ? 1.4 : 2.2;
    const angle = Math.random() * Math.PI * 2;
    const cx = x ?? Math.random() * cw;
    const cy = y ?? Math.random() * ch;
    return {
      x: cx, y: cy, r, size,
      vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
      rot: 0, rotV: (Math.random() - 0.5) * 0.04,
      alive: true,
      /* irregular polygon points */
      pts: Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const jitter = r * (0.75 + Math.random() * 0.45);
        return { x: Math.cos(a) * jitter, y: Math.sin(a) * jitter };
      }),
    };
  }, []);

  const initState = useCallback((cw, ch) => {
    const asteroids = [];
    for (let i = 0; i < 5; i++) {
      let ax, ay;
      do { ax = Math.random() * cw; ay = Math.random() * ch; }
      while (Math.hypot(ax - cw/2, ay - ch/2) < 120);
      asteroids.push(makeAsteroid(cw, ch, 'L', ax, ay));
    }
    stateRef.current = {
      cw, ch,
      ship: { x: cw / 2, y: ch / 2, angle: -Math.PI / 2, vx: 0, vy: 0, invincible: 0 },
      keys: { left: false, right: false, up: false, fire: false },
      bullets: [],
      asteroids,
      ufo: null,
      ufoTimer: 1200,
      ufoBullets: [],
      particles: [],
      score: 0,
      lives: LIVES_MAX,
      frame: 0,
      dead: false,
      fireTimer: 0,
      stars: Array.from({ length: 200 }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        s: 0.4 + Math.random() * 2, alpha: 0.3 + Math.random() * 0.7,
      })),
      nebulaPhase: 0,
    };
  }, [makeAsteroid]);

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
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right',
        ArrowUp: 'up', w: 'up', W: 'up',
        ' ': 'fire',
      };
      if (map[e.key]) { e.preventDefault(); s.keys[map[e.key]] = e.type === 'keydown'; }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup',   handleKey);

    const wrap = (obj) => {
      const { cw, ch } = s;
      if (obj.x < -60) obj.x = cw + 60;
      if (obj.x > cw + 60) obj.x = -60;
      if (obj.y < -60) obj.y = ch + 60;
      if (obj.y > ch + 60) obj.y = -60;
    };

    const addFragment = (x, y, count, color) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 3;
        s.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, color, r: 2 + Math.random() * 3 });
      }
    };

    const respawnShip = () => {
      s.ship.x = s.cw / 2; s.ship.y = s.ch / 2;
      s.ship.vx = 0; s.ship.vy = 0;
      s.ship.angle = -Math.PI / 2;
      s.ship.invincible = 180;
    };

    const loop = () => {
      if (!s || s.dead) return;
      s.frame++;
      const { cw, ch } = s;

      /* ship input */
      if (s.keys.left)  s.ship.angle -= ROT_SPD;
      if (s.keys.right) s.ship.angle += ROT_SPD;
      if (s.keys.up) {
        s.ship.vx += Math.cos(s.ship.angle) * THRUST_F;
        s.ship.vy += Math.sin(s.ship.angle) * THRUST_F;
        /* exhaust particle */
        if (s.frame % 3 === 0) {
          const backA = s.ship.angle + Math.PI;
          s.particles.push({
            x: s.ship.x + Math.cos(backA) * 12, y: s.ship.y + Math.sin(backA) * 12,
            vx: Math.cos(backA) * (1 + Math.random()) + s.ship.vx * 0.3,
            vy: Math.sin(backA) * (1 + Math.random()) + s.ship.vy * 0.3,
            life: 0.8, color: PURPLE, r: 2,
          });
        }
      }
      s.ship.vx *= SHIP_DRAG; s.ship.vy *= SHIP_DRAG;
      s.ship.x += s.ship.vx; s.ship.y += s.ship.vy;
      wrap(s.ship);
      if (s.ship.invincible > 0) s.ship.invincible--;

      /* fire */
      s.fireTimer--;
      if (s.keys.fire && s.fireTimer <= 0) {
        s.bullets.push({
          x: s.ship.x + Math.cos(s.ship.angle) * 14,
          y: s.ship.y + Math.sin(s.ship.angle) * 14,
          vx: Math.cos(s.ship.angle) * BULLET_SPD + s.ship.vx,
          vy: Math.sin(s.ship.angle) * BULLET_SPD + s.ship.vy,
          life: 60, alive: true,
        });
        s.fireTimer = 12;
      }

      /* update bullets */
      s.bullets = s.bullets.filter(b => {
        b.x += b.vx; b.y += b.vy;
        wrap(b);
        b.life--;
        return b.life > 0 && b.alive;
      });

      /* asteroids */
      s.asteroids.forEach(a => {
        a.x += a.vx; a.y += a.vy;
        a.rot += a.rotV;
        wrap(a);

        /* bullet hit */
        s.bullets.forEach(b => {
          if (!b.alive || !a.alive) return;
          if (Math.hypot(b.x - a.x, b.y - a.y) < a.r) {
            b.alive = false; a.alive = false;
            const pts = a.size === 'L' ? 30 : a.size === 'M' ? 20 : 10;
            s.score += pts;
            setScore(s.score);
            addFragment(a.x, a.y, 10, LAVEND);
            /* split */
            if (a.size === 'L') {
              for (let i = 0; i < 2; i++) s.asteroids.push(makeAsteroid(cw, ch, 'M', a.x, a.y));
            } else if (a.size === 'M') {
              for (let i = 0; i < 2; i++) s.asteroids.push(makeAsteroid(cw, ch, 'S', a.x, a.y));
            }
          }
        });

        /* ship collision */
        if (a.alive && s.ship.invincible <= 0) {
          if (Math.hypot(s.ship.x - a.x, s.ship.y - a.y) < a.r + 10) {
            s.lives--;
            setLives(s.lives);
            addFragment(s.ship.x, s.ship.y, 16, LAVEND);
            if (s.lives <= 0) { s.dead = true; setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('asteroid-best', String(nb)); return nb; }); setPhase('dead'); return; }
            respawnShip();
          }
        }
      });
      s.asteroids = s.asteroids.filter(a => a.alive);

      /* spawn new asteroids when all gone */
      if (s.asteroids.length === 0) {
        const wave = Math.floor(s.score / 200) + 5;
        for (let i = 0; i < wave; i++) {
          let ax, ay;
          do { ax = Math.random() * cw; ay = Math.random() * ch; }
          while (Math.hypot(ax - s.ship.x, ay - s.ship.y) < 120);
          s.asteroids.push(makeAsteroid(cw, ch, 'L', ax, ay));
        }
      }

      /* UFO */
      s.ufoTimer--;
      if (!s.ufo && s.ufoTimer <= 0) {
        const fromLeft = Math.random() < 0.5;
        s.ufo = { x: fromLeft ? -30 : cw + 30, y: 80 + Math.random() * (ch - 160), vx: fromLeft ? 2.5 : -2.5, alive: true, fireTimer: 80 };
        s.ufoTimer = 1200 + Math.floor(Math.random() * 800);
      }
      if (s.ufo) {
        s.ufo.x += s.ufo.vx;
        if (s.ufo.x < -60 || s.ufo.x > cw + 60) { s.ufo = null; }
        else {
          s.ufo.fireTimer--;
          if (s.ufo.fireTimer <= 0) {
            const ang = Math.atan2(s.ship.y - s.ufo.y, s.ship.x - s.ufo.x);
            s.ufoBullets.push({ x: s.ufo.x, y: s.ufo.y, vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5, life: 90, alive: true });
            s.ufo.fireTimer = 70;
          }
          /* bullet hits UFO */
          s.bullets.forEach(b => {
            if (!b.alive || !s.ufo) return;
            if (Math.hypot(b.x - s.ufo.x, b.y - s.ufo.y) < 22) {
              b.alive = false; s.ufo.alive = false;
              s.score += 50; setScore(s.score);
              addFragment(s.ufo.x, s.ufo.y, 16, UFO_CLR);
              s.ufo = null;
            }
          });
          /* UFO bullet hits ship */
          if (s.ufo && s.ship.invincible <= 0) {
            s.ufoBullets.forEach(ub => {
              if (!ub.alive) return;
              if (Math.hypot(ub.x - s.ship.x, ub.y - s.ship.y) < 12) {
                ub.alive = false;
                s.lives--;
                setLives(s.lives);
                addFragment(s.ship.x, s.ship.y, 12, LAVEND);
                if (s.lives <= 0) { s.dead = true; setBest(prev => { const nb = Math.max(prev, s.score); localStorage.setItem('asteroid-best', String(nb)); return nb; }); setPhase('dead'); return; }
                respawnShip();
              }
            });
          }
        }
      }
      s.ufoBullets = s.ufoBullets.filter(b => { b.x += b.vx; b.y += b.vy; b.life--; return b.life > 0 && b.alive; });
      s.particles  = s.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.04; return p.life > 0; });
      s.nebulaPhase += 0.008;

      /* ── DRAW ── */
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);

      /* nebula */
      const nebGrad = ctx.createRadialGradient(cw * 0.4, ch * 0.4, 0, cw * 0.4, ch * 0.4, cw * 0.55);
      const nAlpha = 0.04 + Math.sin(s.nebulaPhase) * 0.015;
      nebGrad.addColorStop(0, `rgba(124,58,237,${nAlpha * 2})`);
      nebGrad.addColorStop(0.5, `rgba(80,0,200,${nAlpha})`);
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, cw, ch);

      /* stars */
      s.stars.forEach(st => {
        ctx.fillStyle = `rgba(255,255,255,${st.alpha * (0.5 + Math.sin(s.frame / 60 + st.x) * 0.3)})`;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2); ctx.fill();
      });

      /* asteroids */
      s.asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.shadowColor = LAVEND; ctx.shadowBlur = 8;
        ctx.strokeStyle = LAVEND; ctx.lineWidth = 1.5;
        ctx.fillStyle   = 'rgba(30,0,70,0.6)';
        ctx.beginPath();
        a.pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      });

      /* bullets */
      s.bullets.forEach(b => {
        ctx.shadowColor = LAVEND; ctx.shadowBlur = 12;
        ctx.strokeStyle = WHITE; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * 2, b.y - b.vy * 2); ctx.stroke();
        ctx.shadowBlur = 0;
      });

      /* UFO */
      if (s.ufo) {
        ctx.save();
        ctx.translate(s.ufo.x, s.ufo.y);
        ctx.shadowColor = UFO_CLR; ctx.shadowBlur = 18;
        ctx.strokeStyle = UFO_CLR; ctx.lineWidth = 2;
        /* dome */
        ctx.beginPath(); ctx.arc(0, -8, 14, Math.PI, 0); ctx.stroke();
        /* saucer */
        ctx.beginPath(); ctx.ellipse(0, -4, 24, 8, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        /* UFO bullets */
        s.ufoBullets.forEach(ub => {
          ctx.shadowColor = UFO_CLR; ctx.shadowBlur = 8;
          ctx.fillStyle   = UFO_CLR;
          ctx.beginPath(); ctx.arc(ub.x, ub.y, 3, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      /* particles */
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* ship */
      if (s.ship.invincible <= 0 || s.frame % 6 < 3) {
        ctx.save();
        ctx.translate(s.ship.x, s.ship.y);
        ctx.rotate(s.ship.angle);
        ctx.shadowColor = LAVEND; ctx.shadowBlur = 16;
        ctx.strokeStyle = LAVEND; ctx.fillStyle = 'rgba(124,58,237,0.3)';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-10, -9);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-10, 9);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      /* UI */
      ctx.textAlign = 'left';
      ctx.font = `bold 14px "Orbitron", sans-serif`;
      ctx.fillStyle = LAVEND; ctx.shadowColor = PURPLE; ctx.shadowBlur = 8;
      ctx.fillText(`${s.score}`, 20, 28);
      ctx.shadowBlur = 0;
      for (let l = 0; l < s.lives; l++) {
        ctx.fillStyle = PURPLE; ctx.shadowColor = PURPLE; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(cw - 24 - l * 22, 24, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.font = `10px monospace`; ctx.fillStyle = `rgba(196,181,253,0.4)`;
      ctx.fillText(`BEST ${best}`, 20, 44);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [phase, initState, makeAsteroid, best]);

  const startPlay = useCallback(() => { setScore(0); setLives(LIVES_MAX); setCountdown(3); setPhase('countdown'); }, []);
  const retry     = useCallback(() => { cancelAnimationFrame(rafRef.current); stateRef.current = null; setScore(0); setLives(LIVES_MAX); setCountdown(3); setPhase('countdown'); }, []);

  const overlay = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', zIndex: 9999 };

  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: PURPLE, textShadow: `0 0 24px ${PURPLE}`, letterSpacing: '0.2em', marginBottom: 12 }}>ASTEROID BLAST</div>
      <div style={{ color: 'rgba(196,181,253,0.55)', fontSize: 12, marginBottom: 6, letterSpacing: '0.1em' }}>← → ROTATE &nbsp;·&nbsp; W / ↑ THRUST &nbsp;·&nbsp; SPACE FIRE</div>
      <div style={{ color: 'rgba(196,181,253,0.4)', fontSize: 11, marginBottom: 32, letterSpacing: '0.08em' }}>ASTEROIDS SPLIT — DESTROY ALL &nbsp;·&nbsp; BEWARE UFO</div>
      <button onClick={startPlay} style={{ background: 'transparent', border: `1px solid ${PURPLE}`, color: LAVEND, padding: '10px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${PURPLE}` }}>LAUNCH</button>
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid #3b0764`, color: '#3b0764', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>EXIT</button>
    </div>
  );

  if (phase === 'countdown') return (
    <div style={{ position: 'fixed', inset: 0, background: `${BG}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div key={countdown} style={{ fontSize: 'clamp(5rem,22vw,13rem)', fontWeight: 900, color: countdown > 0 ? PURPLE : LAVEND, textShadow: `0 0 60px ${PURPLE}`, fontFamily: '"Orbitron", sans-serif', animation: 'cntP 0.75s ease-out forwards' }}>
        {countdown > 0 ? countdown : 'GO!'}
      </div>
      <style>{`@keyframes cntP { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: LAVEND, textShadow: `0 0 30px ${LAVEND}`, letterSpacing: '0.15em', marginBottom: 12 }}>SHIP LOST</div>
      <div style={{ color: 'rgba(196,181,253,0.6)', fontSize: 14, marginBottom: 6, letterSpacing: '0.1em' }}>SCORE <strong style={{ color: LAVEND }}>{score}</strong></div>
      <div style={{ color: 'rgba(196,181,253,0.4)', fontSize: 12, marginBottom: 36, letterSpacing: '0.1em' }}>BEST <strong style={{ color: UFO_CLR }}>{best}</strong></div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: PURPLE, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>RELAUNCH</button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid #3b0764`, color: '#3b0764', padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>BACK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <button onClick={onExit} style={{ position: 'absolute', top: 12, right: 20, background: 'transparent', border: `1px solid #3b0764`, color: '#3b0764', padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em', zIndex: 1 }}>EXIT</button>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: `rgba(124,58,237,0.4)`, fontSize: 10, letterSpacing: '0.12em', zIndex: 1 }}>← → ROTATE &nbsp;·&nbsp; W THRUST &nbsp;·&nbsp; SPACE FIRE</div>
    </div>
  );
}

export default AsteroidBlast;
