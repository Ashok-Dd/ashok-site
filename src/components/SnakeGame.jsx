import { useEffect, useRef, useState, useCallback } from 'react';

const BG     = '#0a0a0a';
const GREEN  = '#00ff41';
const DIM    = '#00b32c';
const DARK   = '#003310';

const GRID   = 20;
const TICK   = 150;
const WIN_AT = 10;

const GAME_SKILLS = [
  { name: 'React',      color: '#61dafb' },
  { name: 'Node.js',    color: '#8cc84b' },
  { name: 'Python',     color: '#ffd43b' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'MongoDB',    color: '#13aa52' },
  { name: 'Docker',     color: '#2496ed' },
  { name: 'Git',        color: '#f05032' },
  { name: 'TailwindCSS',color: '#38bdf8' },
  { name: 'GraphQL',    color: '#e10098' },
  { name: 'Linux',      color: '#fcc624' },
  { name: 'Redis',      color: '#dc382d' },
  { name: 'AWS',        color: '#ff9900' },
];

function rand(n) { return Math.floor(Math.random() * n); }

function SnakeGame({ onExit }) {
  const canvasRef   = useRef(null);
  const stateRef    = useRef(null);
  const timerRef    = useRef(null);
  const pendingDirRef = useRef(null);
  const [phase, setPhase]       = useState('entry');
  const [bootLines, setBootLines] = useState([]);
  const [eaten, setEaten]       = useState([]);
  const [isDead, setIsDead]     = useState(false);
  const [isWin, setIsWin]       = useState(false);

  /* ── Boot sequence ── */
  useEffect(() => {
    if (phase !== 'entry') return;
    const lines = [
      '> RETRO TERMINAL v1.0',
      '> INITIALISING GRID 20×20...',
      '> SKILLS LOADED — EAT 10 TO WIN',
      '> PRESS ANY ARROW / WASD TO START',
    ];
    let i = 0;
    const show = () => {
      setBootLines(prev => [...prev, lines[i]]);
      i++;
      if (i < lines.length) setTimeout(show, 550);
    };
    const t = setTimeout(show, 300);
    return () => clearTimeout(t);
  }, [phase]);

  /* ── Helpers ── */
  const initState = useCallback((cw, ch) => {
    const cell = Math.min(Math.floor(cw / GRID), Math.floor(ch / GRID));
    const ox   = Math.floor((cw - cell * GRID) / 2);
    const oy   = Math.floor((ch - cell * GRID) / 2);

    const startX = Math.floor(GRID / 2);
    const startY = Math.floor(GRID / 2);
    const snake  = [
      { x: startX,     y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];

    const shuffled = [...GAME_SKILLS].sort(() => Math.random() - 0.5);
    let food = null;
    while (!food) {
      const fx = rand(GRID), fy = rand(GRID);
      if (!snake.find(s => s.x === fx && s.y === fy)) {
        food = { x: fx, y: fy, ...shuffled[0] };
      }
    }

    stateRef.current = {
      cell, ox, oy,
      snake, dir: { x: 1, y: 0 },
      food,
      eaten: [],
      tickMs: TICK,
      grow: 0,
      dead: false,
      win: false,
      skillQueue: shuffled.slice(1),
    };
  }, []);

  const spawnFood = useCallback((s) => {
    if (s.skillQueue.length === 0) { s.skillQueue = [...GAME_SKILLS].sort(() => Math.random() - 0.5); }
    const skill = s.skillQueue.shift();
    let food = null;
    while (!food) {
      const fx = rand(GRID), fy = rand(GRID);
      if (!s.snake.find(seg => seg.x === fx && seg.y === fy)) {
        food = { x: fx, y: fy, ...skill };
      }
    }
    s.food = food;
  }, []);

  /* ── Game tick ── */
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.dead || s.win) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw  = canvas.width, ch = canvas.height;

    /* apply pending direction */
    if (pendingDirRef.current) {
      const pd = pendingDirRef.current;
      if (!(pd.x === -s.dir.x || pd.y === -s.dir.y)) s.dir = pd;
      pendingDirRef.current = null;
    }

    /* move head */
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    /* wall collision */
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      s.dead = true;
      setIsDead(true);
      setPhase('dead');
      return;
    }
    /* self collision */
    if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      s.dead = true;
      setIsDead(true);
      setPhase('dead');
      return;
    }

    s.snake.unshift(head);

    /* eat food */
    if (head.x === s.food.x && head.y === s.food.y) {
      const newEaten = [...s.eaten, s.food];
      s.eaten = newEaten;
      s.grow += 3;
      s.tickMs = Math.max(80, s.tickMs - 5);
      setEaten(newEaten);

      if (newEaten.length >= WIN_AT) {
        s.win = true;
        setIsWin(true);
        setPhase('win');
        clearInterval(timerRef.current);
      } else {
        spawnFood(s);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(tick, s.tickMs);
      }
    }

    if (s.grow > 0) { s.grow--; }
    else { s.snake.pop(); }

    /* draw */
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cw, ch);

    const { cell, ox, oy } = s;

    /* grid lines */
    ctx.strokeStyle = 'rgba(0,255,65,0.05)';
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(ox + i * cell, oy);
      ctx.lineTo(ox + i * cell, oy + GRID * cell);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox, oy + i * cell);
      ctx.lineTo(ox + GRID * cell, oy + i * cell);
      ctx.stroke();
    }

    /* border */
    ctx.strokeStyle = `rgba(0,255,65,0.25)`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox - 1, oy - 1, GRID * cell + 2, GRID * cell + 2);

    /* food */
    const fx = ox + s.food.x * cell + cell / 2;
    const fy = oy + s.food.y * cell + cell / 2;
    const pulse = Math.sin(Date.now() / 300) * 3;
    ctx.save();
    ctx.shadowColor = s.food.color;
    ctx.shadowBlur  = 12 + pulse;
    ctx.fillStyle   = s.food.color;
    ctx.fillRect(ox + s.food.x * cell + 2, oy + s.food.y * cell + 2, cell - 4, cell - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.font = `bold ${Math.max(7, Math.min(cell * 0.35, 10))}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(s.food.name.slice(0, 5), fx, fy);
    ctx.restore();

    /* snake */
    s.snake.forEach((seg, i) => {
      const sx = ox + seg.x * cell + 1;
      const sy = oy + seg.y * cell + 1;
      const sw = cell - 2, sh = cell - 2;
      ctx.save();
      if (i === 0) {
        ctx.shadowColor = GREEN;
        ctx.shadowBlur  = 14;
        ctx.fillStyle   = GREEN;
      } else {
        const fade = Math.max(0.2, 1 - i / (s.snake.length * 1.3));
        ctx.fillStyle = `rgba(0,${Math.floor(180 * fade + 75)},${Math.floor(65 * fade)},${fade + 0.1})`;
      }
      ctx.fillRect(sx, sy, sw, sh);
      ctx.restore();
    });
  }, [spawnFood]);

  /* ── Start game ── */
  useEffect(() => {
    if (phase !== 'play') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cw = window.innerWidth, ch = window.innerHeight;
    canvas.width  = cw;
    canvas.height = ch;
    initState(cw, ch);

    const handleKey = (e) => {
      const dirs = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
      };
      if (dirs[e.key]) { e.preventDefault(); pendingDirRef.current = dirs[e.key]; }
    };
    window.addEventListener('keydown', handleKey);

    timerRef.current = setInterval(tick, TICK);

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener('keydown', handleKey);
    };
  }, [phase, tick, initState]);

  const startPlay = useCallback(() => {
    setEaten([]);
    setIsDead(false);
    setIsWin(false);
    setPhase('play');
  }, []);

  const retry = useCallback(() => {
    clearInterval(timerRef.current);
    stateRef.current = null;
    pendingDirRef.current = null;
    setEaten([]);
    setIsDead(false);
    setIsWin(false);
    setPhase('play');
  }, []);

  const overlay = {
    position: 'fixed', inset: 0, background: BG,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Share Tech Mono", monospace', zIndex: 9999,
  };

  /* ─── Entry ─── */
  if (phase === 'entry') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.6rem)', fontWeight: 700, color: GREEN, textShadow: `0 0 20px ${GREEN}`, letterSpacing: '0.2em', marginBottom: 32 }}>
        SNAKE.EXE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: DIM }}>
        {bootLines.map((line, i) => (
          <div key={i} style={{ letterSpacing: '0.06em' }}>
            {line}
            {i === bootLines.length - 1 && <span style={{ borderRight: `2px solid ${GREEN}`, marginLeft: 3, animation: 'blink 1s step-end infinite' }} />}
          </div>
        ))}
      </div>
      {bootLines.length === 4 && (
        <button onClick={startPlay} style={{ marginTop: 36, background: 'transparent', border: `1px solid ${GREEN}`, color: GREEN, padding: '10px 32px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.15em', textShadow: `0 0 8px ${GREEN}` }}>
          BOOT GAME
        </button>
      )}
      <button onClick={onExit} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em' }}>
        EXIT
      </button>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );

  /* ─── Dead ─── */
  if (phase === 'dead') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 700, color: '#ff3333', textShadow: '0 0 30px #ff3333', letterSpacing: '0.15em', marginBottom: 12 }}>
        YOU DIED
      </div>
      <div style={{ color: DIM, fontSize: 14, marginBottom: 32, letterSpacing: '0.1em' }}>
        SKILLS CONSUMED: <strong style={{ color: GREEN }}>{eaten.length}</strong> / {WIN_AT}
      </div>
      {eaten.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 340, justifyContent: 'center', marginBottom: 32 }}>
          {eaten.map((s, i) => (
            <span key={i} style={{ fontSize: 11, padding: '3px 10px', border: `1px solid ${s.color}`, color: s.color, borderRadius: 3 }}>{s.name}</span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: GREEN, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>
          RETRY
        </button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>
          BACK
        </button>
      </div>
    </div>
  );

  /* ─── Win ─── */
  if (phase === 'win') return (
    <div style={overlay}>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2.8rem)', fontWeight: 700, color: GREEN, textShadow: `0 0 40px ${GREEN}`, letterSpacing: '0.12em', marginBottom: 8, textAlign: 'center' }}>
        STACK COMPLETE!
      </div>
      <div style={{ color: DIM, fontSize: 13, marginBottom: 28, letterSpacing: '0.08em' }}>ALL {WIN_AT} SKILLS CONSUMED</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 360, justifyContent: 'center', marginBottom: 36 }}>
        {eaten.map((s, i) => (
          <span key={i} style={{ fontSize: 12, padding: '4px 12px', border: `1px solid ${s.color}`, color: s.color, borderRadius: 3, textShadow: `0 0 6px ${s.color}` }}>{s.name}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={retry} style={{ background: GREEN, border: 'none', color: BG, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>
          PLAY AGAIN
        </button>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${GREEN}`, color: GREEN, padding: '10px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.1em' }}>
          BACK
        </button>
      </div>
    </div>
  );

  /* ─── Play ─── */
  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999 }}>
      {/* Scanlines overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)', pointerEvents: 'none', zIndex: 1 }} />
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {/* HUD top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.6)', zIndex: 2 }}>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', color: GREEN, fontSize: 14, letterSpacing: '0.15em', textShadow: `0 0 8px ${GREEN}` }}>
          SNAKE.EXE
        </span>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', color: DIM, fontSize: 13, letterSpacing: '0.1em' }}>
          SKILLS: {eaten.length}/{WIN_AT}
        </span>
        <button onClick={onExit} style={{ background: 'transparent', border: `1px solid ${DIM}`, color: DIM, padding: '4px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.1em' }}>
          EXIT
        </button>
      </div>
      {/* eaten tracker side panel */}
      {eaten.length > 0 && (
        <div style={{ position: 'absolute', right: 12, top: 60, display: 'flex', flexDirection: 'column', gap: 5, zIndex: 2 }}>
          {eaten.map((sk, i) => (
            <span key={i} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: sk.color, border: `1px solid ${sk.color}`, padding: '2px 8px', borderRadius: 2, background: 'rgba(0,0,0,0.7)', letterSpacing: '0.05em', textShadow: `0 0 6px ${sk.color}` }}>
              ✓ {sk.name}
            </span>
          ))}
        </div>
      )}
      {/* bottom hint */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Share Tech Mono", monospace', color: 'rgba(0,255,65,0.3)', fontSize: 10, letterSpacing: '0.12em', zIndex: 2 }}>
        WASD / ↑↓←→ TO MOVE
      </div>
    </div>
  );
}

export default SnakeGame;
