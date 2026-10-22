import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X, Crosshair, Zap, Sun, Flame, TreePine, Waves, Telescope, ChevronDown, ArrowUpRight, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const THEMES = [
  { id: 'cyberpunk', color: '#1abc9c', label: 'Cyberpunk',   gameLabel: 'Arena Shooter',  GameIcon: Crosshair },
  { id: 'synthwave', color: '#f72585', label: 'Synthwave',   gameLabel: 'Endless Runner', GameIcon: Zap       },
  { id: 'lava',      color: '#ef4444', label: 'Lava',        gameLabel: 'Meteor Strike',  GameIcon: Flame     },
  { id: 'forest',    color: '#22c55e', label: 'Forest',      gameLabel: 'Snake',          GameIcon: TreePine  },
  { id: 'ocean',     color: '#0ea5e9', label: 'Ocean',       gameLabel: 'Circle Draw',    GameIcon: Waves     },
  { id: 'sunset',    color: '#f97316', label: 'Sunset',      gameLabel: 'Paper Glider',   GameIcon: Sun       },
  { id: 'galaxy',    color: '#7c3aed', label: 'Galaxy',      gameLabel: 'Asteroid Blast', GameIcon: Telescope },
];

/* 8 sections, grouped so the bar stays calm: 4 entries + a Contact button */
const NAV = [
  { label: 'Home',   id: 'home' },
  { label: 'Skills', id: 'skills' },
  { label: 'Work',   items: [
    { label: 'Experience', id: 'experience', hint: 'Where I work' },
    { label: 'Projects',   id: 'projects',   hint: 'Things I built' },
    { label: 'Freelance',  id: 'freelance',  hint: 'Hire me' },
  ] },
  { label: 'More',   items: [
    { label: 'Arcade',   id: 'arcade',   hint: '7 games' },
    { label: 'LeetCode', id: 'leetcode', hint: 'DSA stats' },
  ] },
];
const SECTION_IDS = ['home', 'skills', 'experience', 'projects', 'freelance', 'arcade', 'leetcode', 'contact'];
const MOBILE_GROUPS = [
  { title: 'Start',  items: [{ label: 'Home', id: 'home' }, { label: 'Skills', id: 'skills' }] },
  { title: 'Work',   items: NAV[2].items },
  { title: 'More',   items: NAV[3].items },
];

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);       // mobile menu
  const [openGroup, setOpenGroup] = useState(null);      // desktop dropdown
  const [themeOpen, setThemeOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [ind, setInd] = useState(null);                  // sliding highlight { x, w }
  const rootRef = useRef(null);
  const linksRef = useRef(null);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  const go = (id) => {
    setMenuOpen(false);
    setOpenGroup(null);
    // sections after Projects only exist once the gate is open – until then, take them to the gate
    const el = document.getElementById(id) || document.getElementById('projects');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (id === 'home' ? 0 : 64);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  /* the highlight capsule glides to a link (hovered, otherwise the current section) */
  const slideTo = useCallback((el) => {
    const box = linksRef.current;
    if (!box || !el) { setInd(null); return; }
    const p = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setInd({ x: r.left - p.left, w: r.width });
  }, []);
  const slideToActive = useCallback(() => slideTo(linksRef.current?.querySelector('.nb-link.on')), [slideTo]);
  const hoverLink = (e) => slideTo(e.currentTarget.matches('.nb-link') ? e.currentTarget : e.currentTarget.querySelector('.nb-link'));

  /* active section + hide-on-scroll-down */
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > last && y > 120 && !menuOpen);
      last = y;
      let cur = 'home';
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + y - 140 <= y) cur = id;
      });
      setActive(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [menuOpen]);

  useEffect(() => {
    const id = requestAnimationFrame(slideToActive);
    window.addEventListener('resize', slideToActive);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', slideToActive); };
  }, [active, slideToActive]);

  /* close popovers on outside click / Escape; lock page scroll behind the mobile menu */
  useEffect(() => {
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) { setOpenGroup(null); setThemeOpen(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { setOpenGroup(null); setThemeOpen(false); setMenuOpen(false); } };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const groupActive = (g) => g.items?.some((i) => i.id === active);

  return (
    <header ref={rootRef} className={`nb-root${scrolled ? ' nb-scrolled' : ''}${hidden ? ' nb-hidden' : ''}${menuOpen ? ' nb-open' : ''}`}>
      <div className="nb-bar">
        <button className="nb-logo" onClick={() => go('home')} aria-label="Go to top">
          <span className="nb-mark"><b>A</b></span>
          <span className="nb-word"><span>ASH</span>OK</span>
        </button>

        {/* ── desktop links ── */}
        <nav className="nb-links" aria-label="Primary" ref={linksRef} onMouseLeave={slideToActive}>
          <span className="nb-ind" style={ind ? { transform: `translateX(${ind.x}px)`, width: ind.w, opacity: 1 } : undefined} aria-hidden="true" />
          {NAV.map((n) =>
            n.items ? (
              <div
                key={n.label}
                className="nb-group"
                onMouseEnter={(e) => { setOpenGroup(n.label); hoverLink(e); }}
                onMouseLeave={() => setOpenGroup((g) => (g === n.label ? null : g))}
              >
                <button
                  className={`nb-link${groupActive(n) ? ' on' : ''}`}
                  aria-expanded={openGroup === n.label}
                  onClick={() => setOpenGroup((g) => (g === n.label ? null : n.label))}
                >
                  {n.label}<ChevronDown size={13} className={openGroup === n.label ? 'flip' : ''} />
                </button>
                {openGroup === n.label && (
                  <div className="nb-pop">
                    {n.items.map((it) => (
                      <button key={it.id} className={`nb-pop-item${active === it.id ? ' on' : ''}`} onClick={() => go(it.id)}>
                        <span><b>{it.label}</b><small>{it.hint}</small></span>
                        <i />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button key={n.id} className={`nb-link${active === n.id ? ' on' : ''}`} onMouseEnter={hoverLink} onClick={() => go(n.id)}>{n.label}</button>
            )
          )}
        </nav>

        <div className="nb-right">
          <button className="nb-cta" onClick={() => go('contact')}>
            <span>Contact</span><ArrowUpRight size={15} />
          </button>

          {/* theme picker */}
          <div className="nb-theme">
            <button className="nb-theme-btn" onClick={() => setThemeOpen((o) => !o)} aria-label={`Theme: ${currentTheme.label}`} title={`Theme: ${currentTheme.label}`}>
              <span style={{ background: currentTheme.color, boxShadow: `0 0 12px ${currentTheme.color}` }} />
            </button>
            {themeOpen && (
              <div className="nb-theme-pop">
                <p>Theme</p>
                <div>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      className={`nb-swatch${theme === t.id ? ' on' : ''}`}
                      style={{ '--c': t.color }}
                      onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                      aria-label={t.label}
                      title={t.label}
                    >{theme === t.id && <Check size={12} />}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="nb-burger" onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── mobile: full-screen grouped menu ── */}
      <div className="nb-sheet" aria-hidden={!menuOpen}>
        <div className="nb-sheet-inner">
          {MOBILE_GROUPS.map((g) => (
            <div key={g.title} className="nb-sheet-group">
              <p className="nb-sheet-title">{g.title}</p>
              {g.items.map((it, i) => (
                <button key={it.id} className={`nb-sheet-link${active === it.id ? ' on' : ''}`} style={{ '--i': i }} onClick={() => go(it.id)} tabIndex={menuOpen ? 0 : -1}>
                  <span>{it.label}</span>{it.hint && <small>{it.hint}</small>}
                </button>
              ))}
            </div>
          ))}

          <button className="nb-sheet-cta" onClick={() => go('contact')} tabIndex={menuOpen ? 0 : -1}>
            Get in touch<ArrowUpRight size={16} />
          </button>

          <div className="nb-sheet-themes">
            <p className="nb-sheet-title">Theme</p>
            <div>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`nb-swatch${theme === t.id ? ' on' : ''}`}
                  style={{ '--c': t.color }}
                  onClick={() => setTheme(t.id)}
                  aria-label={t.label}
                  tabIndex={menuOpen ? 0 : -1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .nb-root { position:fixed; top:0; left:0; right:0; z-index:1000; padding:12px 14px 0; pointer-events:none; transition:transform .5s cubic-bezier(.22,1,.36,1); }
        .nb-root > * { pointer-events:auto; }
        .nb-hidden { transform:translateY(-130%); }
        .nb-open { padding:0; background:var(--color-bg-primary); transform:none !important; }

        /* the floating bar */
        .nb-bar { position:relative; z-index:2; max-width:1120px; margin:0 auto; height:62px; padding:0 10px 0 12px; display:flex; align-items:center; justify-content:space-between; gap:14px;
          border-radius:22px; border:1px solid var(--color-border); background:color-mix(in srgb, var(--color-bg-primary) 55%, transparent);
          backdrop-filter:blur(14px) saturate(1.3); -webkit-backdrop-filter:blur(14px) saturate(1.3);
          transition:background .35s, border-color .35s, box-shadow .35s, height .35s; }
        .nb-scrolled .nb-bar { height:56px; background:color-mix(in srgb, var(--color-bg-primary) 82%, transparent); border-color:var(--color-border-strong);
          box-shadow:0 14px 40px rgba(0,0,0,.4), 0 0 0 1px color-mix(in srgb, var(--color-accent) 12%, transparent), 0 0 34px var(--color-accent-subtle); }
        .nb-open .nb-bar { margin:8px auto 0; height:54px; background:var(--color-bg-glass); }
        .nb-bar::before { content:''; position:absolute; left:18%; right:18%; top:-1px; height:1px; background:linear-gradient(90deg, transparent, var(--color-accent), transparent); opacity:.7; }

        /* logo: monogram badge + wordmark */
        .nb-logo { display:flex; align-items:center; gap:11px; background:none; border:0; cursor:pointer; padding:0 6px 0 0; }
        .nb-mark { position:relative; width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg, var(--color-accent), var(--color-accent-dark)); box-shadow:0 6px 18px var(--color-accent-glow), inset 0 1px 0 rgba(255,255,255,.35);
          transition:transform .5s cubic-bezier(.22,1,.36,1), border-radius .5s; }
        .nb-mark b { font-family:var(--font-display); font-weight:900; font-size:1.1rem; color:var(--color-text-on-light); }
        .nb-logo:hover .nb-mark { transform:rotate(-12deg) scale(1.08); border-radius:50%; }
        .nb-word { font-family:var(--font-display); font-weight:900; font-size:1.38rem; letter-spacing:.18em; line-height:1; color:var(--color-accent); text-shadow:0 0 18px var(--color-accent-glow); }
        .nb-word span { color:var(--color-text-primary); text-shadow:none; }

        /* link capsule with a sliding highlight */
        .nb-links { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); display:flex; align-items:center; gap:2px; padding:5px;
          border-radius:var(--radius-full); background:var(--color-bg-glass); border:1px solid var(--color-border); }
        .nb-ind { position:absolute; left:0; top:5px; bottom:5px; width:0; border-radius:var(--radius-full); opacity:0; pointer-events:none;
          background:linear-gradient(135deg, var(--color-accent-faint), var(--color-accent-subtle)); border:1px solid var(--color-accent-border); box-shadow:0 0 18px var(--color-accent-subtle);
          transition:transform .38s cubic-bezier(.22,1,.36,1), width .38s cubic-bezier(.22,1,.36,1), opacity .25s; }
        .nb-link { position:relative; z-index:1; display:inline-flex; align-items:center; gap:5px; background:none; border:0; cursor:pointer; padding:9px 17px; border-radius:var(--radius-full);
          font-family:var(--font-body); font-size:.78rem; font-weight:600; letter-spacing:.13em; text-transform:uppercase; color:var(--color-text-secondary); transition:color .25s; }
        .nb-link:hover { color:var(--color-text-primary); }
        .nb-link.on { color:var(--color-accent); }
        .nb-link svg { transition:transform .25s; }
        .nb-link svg.flip { transform:rotate(180deg); }
        .nb-group { position:relative; }

        /* dropdown */
        .nb-pop { position:absolute; top:calc(100% + 14px); left:50%; transform:translateX(-50%); min-width:230px; padding:8px; display:grid; gap:2px; border-radius:18px;
          background:color-mix(in srgb, var(--color-bg-elevated) 94%, transparent); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          border:1px solid var(--color-border-strong); box-shadow:0 24px 60px rgba(0,0,0,.55), 0 0 30px var(--color-accent-subtle); animation:nbPop .22s cubic-bezier(.22,1,.36,1); transform-origin:50% 0; }
        .nb-pop::before { content:''; position:absolute; left:0; right:0; top:-16px; height:16px; }
        .nb-pop::after { content:''; position:absolute; left:50%; top:-6px; width:11px; height:11px; margin-left:-6px; transform:rotate(45deg); background:inherit; border-left:1px solid var(--color-border-strong); border-top:1px solid var(--color-border-strong); }
        @keyframes nbPop { from { opacity:0; transform:translateX(-50%) translateY(-8px) scale(.96); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }
        .nb-pop-item { position:relative; display:flex; align-items:center; justify-content:space-between; gap:12px; text-align:left; cursor:pointer; background:none; border:0; padding:11px 13px; border-radius:12px; transition:background .2s, transform .2s; }
        .nb-pop-item span { display:grid; gap:2px; }
        .nb-pop-item b { font-family:var(--font-body); font-size:.88rem; font-weight:700; color:var(--color-text-primary); }
        .nb-pop-item small { font-family:var(--font-mono); font-size:.58rem; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-muted); }
        .nb-pop-item i { width:7px; height:7px; border-radius:50%; background:var(--color-border-strong); transition:all .25s; }
        .nb-pop-item:hover { background:var(--color-accent-subtle); transform:translateX(3px); }
        .nb-pop-item:hover i { background:var(--color-accent); }
        .nb-pop-item.on b { color:var(--color-accent); }
        .nb-pop-item.on i { background:var(--color-accent); box-shadow:0 0 10px var(--color-accent); }

        .nb-right { display:flex; align-items:center; gap:10px; }
        .nb-cta { position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:7px; cursor:pointer; padding:11px 20px; border-radius:var(--radius-full); border:0;
          font-family:var(--font-mono); font-size:.7rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-on-light);
          background:linear-gradient(135deg, var(--color-accent), var(--color-accent-light)); box-shadow:0 6px 20px var(--color-accent-glow); transition:transform .25s, box-shadow .25s; }
        .nb-cta::after { content:''; position:absolute; top:0; bottom:0; width:40px; left:-60px; background:linear-gradient(100deg, transparent, rgba(255,255,255,.5), transparent); transform:skewX(-20deg); animation:nbGleam 4s ease-in-out infinite; }
        @keyframes nbGleam { 0%,60% { left:-60px; } 100% { left:130%; } }
        .nb-cta svg { transition:transform .25s; }
        .nb-cta:hover { transform:translateY(-2px); box-shadow:0 10px 28px var(--color-accent-glow); }
        .nb-cta:hover svg { transform:translate(3px,-3px); }

        .nb-theme { position:relative; }
        .nb-theme-btn { width:42px; height:42px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; background:var(--color-bg-glass); border:1px solid var(--color-border-strong); transition:border-color .25s, transform .25s; }
        .nb-theme-btn:hover { border-color:var(--color-accent); transform:rotate(30deg); }
        .nb-theme-btn span { width:16px; height:16px; border-radius:50%; }
        .nb-theme-pop { position:absolute; right:0; top:calc(100% + 14px); padding:14px 16px 16px; border-radius:18px; background:color-mix(in srgb, var(--color-bg-elevated) 94%, transparent); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          border:1px solid var(--color-border-strong); box-shadow:0 24px 60px rgba(0,0,0,.55); animation:nbPopR .22s cubic-bezier(.22,1,.36,1); transform-origin:100% 0; }
        .nb-theme-pop p { margin:0 0 10px; font-family:var(--font-mono); font-size:.58rem; letter-spacing:.3em; text-transform:uppercase; color:var(--color-accent); }
        .nb-theme-pop > div { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; }
        @keyframes nbPopR { from { opacity:0; transform:translateY(-8px) scale(.96); } to { opacity:1; transform:none; } }
        .nb-swatch { width:28px; height:28px; border-radius:50%; cursor:pointer; background:var(--c); border:2px solid transparent; display:flex; align-items:center; justify-content:center; color:#fff; transition:transform .2s, box-shadow .2s; }
        .nb-swatch:hover { transform:scale(1.18); }
        .nb-swatch.on { border-color:var(--color-text-primary); box-shadow:0 0 14px var(--c); }

        .nb-burger { display:none; width:42px; height:42px; align-items:center; justify-content:center; cursor:pointer; border-radius:13px; color:var(--color-accent); background:var(--color-bg-glass); border:1px solid var(--color-border-strong); }

        /* mobile sheet */
        .nb-sheet { display:none; }

        @media (max-width: 980px) {
          .nb-links, .nb-cta { display:none; }
          .nb-burger { display:flex; }
          .nb-root { padding:8px 10px 0; }
          .nb-bar { height:56px; border-radius:18px; }
          .nb-word { font-size:1.2rem; }
          .nb-sheet { display:block; position:fixed; inset:0; z-index:1; padding-top:72px; background:var(--color-bg-primary); overflow-y:auto;
            opacity:0; visibility:hidden; transform:translateY(-12px); transition:opacity .3s, transform .3s, visibility 0s linear .3s; }
          .nb-open .nb-sheet { opacity:1; visibility:visible; transform:none; transition-delay:0s; }
          .nb-sheet-inner { max-width:520px; margin:0 auto; padding:18px 24px 40px; display:grid; gap:26px; }
          .nb-sheet-title { font-family:var(--font-mono); font-size:.62rem; letter-spacing:.34em; text-transform:uppercase; color:var(--color-accent); margin:0 0 6px; }
          .nb-sheet-group { display:grid; }
          .nb-sheet-link { display:flex; align-items:baseline; justify-content:space-between; gap:12px; cursor:pointer; background:none; border:0; border-bottom:1px solid var(--color-border); padding:14px 2px;
            font-family:var(--font-display); font-size:1.5rem; font-weight:800; color:var(--color-text-primary); text-align:left;
            opacity:0; transform:translateY(10px); transition:opacity .35s calc(var(--i) * 60ms + .08s), transform .35s calc(var(--i) * 60ms + .08s), color .2s; }
          .nb-open .nb-sheet-link { opacity:1; transform:none; }
          .nb-sheet-link small { font-family:var(--font-mono); font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-muted); font-weight:400; }
          .nb-sheet-link.on, .nb-sheet-link:active { color:var(--color-accent); }
          .nb-sheet-cta { display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; padding:15px; border:0; border-radius:14px;
            font-family:var(--font-mono); font-size:.78rem; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--color-text-on-light);
            background:linear-gradient(135deg,var(--color-accent),var(--color-accent-light)); box-shadow:var(--shadow-accent); }
          .nb-sheet-themes > div { display:flex; gap:12px; flex-wrap:wrap; }
          .nb-sheet-themes .nb-swatch { width:32px; height:32px; }
        }
        @media (max-width: 400px) { .nb-sheet-link { font-size:1.3rem; } .nb-word { display:none; } }
        @media (min-width: 981px) { .nb-sheet { display:none !important; } }
        @media (prefers-reduced-motion:reduce) { .nb-root, .nb-bar, .nb-ind, .nb-pop, .nb-theme-pop, .nb-sheet, .nb-sheet-link, .nb-mark { transition:none; animation:none; } .nb-cta::after { animation:none; } }
      `}</style>
    </header>
  );
};

export default Navbar;
