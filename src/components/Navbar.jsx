import { useEffect, useRef, useState } from "react";
import { Menu, X, Crosshair, Zap, Sun, Flame, TreePine, Waves, Telescope, ChevronDown, ArrowUpRight } from "lucide-react";
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
  const rootRef = useRef(null);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  const go = (id) => {
    setMenuOpen(false);
    setOpenGroup(null);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (id === 'home' ? 0 : 64);
    window.scrollTo({ top, behavior: 'smooth' });
  };

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
          <span className="nb-logo-dim">ASH</span>OK
        </button>

        {/* ── desktop links ── */}
        <nav className="nb-links" aria-label="Primary">
          {NAV.map((n) =>
            n.items ? (
              <div
                key={n.label}
                className="nb-group"
                onMouseEnter={() => setOpenGroup(n.label)}
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
                        <span>{it.label}</span><small>{it.hint}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button key={n.id} className={`nb-link${active === n.id ? ' on' : ''}`} onClick={() => go(n.id)}>{n.label}</button>
            )
          )}
        </nav>

        <div className="nb-right">
          <button className="nb-cta" onClick={() => go('contact')}>
            Contact<ArrowUpRight size={14} />
          </button>

          {/* theme picker */}
          <div className="nb-theme">
            <button className="nb-theme-btn" onClick={() => setThemeOpen((o) => !o)} aria-label={`Theme: ${currentTheme.label}`} title={`Theme: ${currentTheme.label}`}>
              <span style={{ background: currentTheme.color, boxShadow: `0 0 10px ${currentTheme.color}` }} />
            </button>
            {themeOpen && (
              <div className="nb-theme-pop">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`nb-swatch${theme === t.id ? ' on' : ''}`}
                    style={{ '--c': t.color }}
                    onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                    aria-label={t.label}
                    title={t.label}
                  />
                ))}
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
        .nb-root { position:fixed; top:0; left:0; right:0; z-index:1000; transition:transform .45s cubic-bezier(.22,1,.36,1), background .3s, border-color .3s, backdrop-filter .3s;
          border-bottom:1px solid transparent; }
        .nb-scrolled { background:var(--color-bg-overlay); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom-color:var(--color-border); }
        .nb-hidden { transform:translateY(-110%); }
        .nb-open { background:var(--color-bg-primary); transform:none !important; }
        .nb-bar { position:relative; z-index:2; max-width:1240px; margin:0 auto; height:68px; padding:0 clamp(16px,3vw,32px); display:flex; align-items:center; justify-content:space-between; gap:16px; }

        .nb-logo { background:none; border:0; cursor:pointer; font-family:var(--font-display); font-weight:900; font-size:1.35rem; letter-spacing:.14em; color:var(--color-accent); padding:4px 0; }
        .nb-logo-dim { color:var(--color-text-muted); }

        .nb-links { display:flex; align-items:center; gap:4px; position:absolute; left:50%; transform:translateX(-50%); }
        .nb-link { position:relative; display:inline-flex; align-items:center; gap:5px; background:none; border:0; cursor:pointer; padding:10px 16px; border-radius:var(--radius-full);
          font-family:var(--font-body); font-size:.8rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--color-text-secondary); transition:color .25s, background .25s; }
        .nb-link:hover { color:var(--color-text-primary); background:var(--color-accent-subtle); }
        .nb-link.on { color:var(--color-accent); background:var(--color-accent-subtle); }
        .nb-link svg { transition:transform .25s; }
        .nb-link svg.flip { transform:rotate(180deg); }
        .nb-group { position:relative; }
        .nb-pop { position:absolute; top:calc(100% + 6px); left:50%; transform:translateX(-50%); min-width:210px; padding:8px; display:grid; gap:2px; border-radius:var(--radius-lg);
          background:var(--color-bg-elevated); border:1px solid var(--color-border-accent); box-shadow:var(--shadow-xl); animation:nbPop .18s ease-out; }
        .nb-pop::before { content:''; position:absolute; left:0; right:0; top:-10px; height:10px; }
        @keyframes nbPop { from { opacity:0; transform:translate(-50%,-6px); } to { opacity:1; transform:translate(-50%,0); } }
        .nb-pop-item { display:flex; flex-direction:column; align-items:flex-start; gap:1px; text-align:left; cursor:pointer; background:none; border:0; padding:10px 12px; border-radius:var(--radius-md); color:var(--color-text-primary); font-family:var(--font-body); font-size:.86rem; font-weight:600; transition:background .2s; }
        .nb-pop-item small { font-family:var(--font-mono); font-size:.6rem; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-muted); font-weight:400; }
        .nb-pop-item:hover { background:var(--color-accent-subtle); }
        .nb-pop-item.on { color:var(--color-accent); background:var(--color-accent-subtle); }

        .nb-right { display:flex; align-items:center; gap:10px; }
        .nb-cta { display:inline-flex; align-items:center; gap:6px; cursor:pointer; padding:9px 18px; border-radius:var(--radius-full); border:1px solid var(--color-accent-border);
          font-family:var(--font-mono); font-size:.7rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent); background:var(--color-accent-subtle); transition:all .25s; }
        .nb-cta:hover { background:var(--color-accent); color:var(--color-bg-primary); box-shadow:var(--shadow-accent); }

        .nb-theme { position:relative; }
        .nb-theme-btn { width:38px; height:38px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; background:var(--color-bg-glass); border:1px solid var(--color-border-strong); transition:border-color .25s; }
        .nb-theme-btn:hover { border-color:var(--color-accent); }
        .nb-theme-btn span { width:14px; height:14px; border-radius:50%; }
        .nb-theme-pop { position:absolute; right:0; top:calc(100% + 10px); display:flex; gap:8px; padding:10px 12px; border-radius:var(--radius-full); background:var(--color-bg-elevated); border:1px solid var(--color-border-accent); box-shadow:var(--shadow-xl); animation:nbPopR .18s ease-out; }
        @keyframes nbPopR { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
        .nb-swatch { width:22px; height:22px; border-radius:50%; cursor:pointer; background:var(--c); border:2px solid transparent; transition:transform .2s, box-shadow .2s; }
        .nb-swatch:hover { transform:scale(1.18); }
        .nb-swatch.on { border-color:var(--color-text-primary); box-shadow:0 0 12px var(--c); }

        .nb-burger { display:none; width:40px; height:40px; align-items:center; justify-content:center; cursor:pointer; border-radius:12px; color:var(--color-accent); background:var(--color-bg-glass); border:1px solid var(--color-border-strong); }

        /* mobile sheet */
        .nb-sheet { display:none; }

        @media (max-width: 980px) {
          .nb-links, .nb-cta { display:none; }
          .nb-burger { display:flex; }
          .nb-bar { height:60px; }
          .nb-sheet { display:block; position:fixed; inset:0; z-index:1; padding-top:60px; background:var(--color-bg-primary); overflow-y:auto;
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
        @media (max-width: 400px) { .nb-sheet-link { font-size:1.3rem; } }
        @media (min-width: 981px) { .nb-sheet { display:none !important; } }
        @media (prefers-reduced-motion:reduce) { .nb-root, .nb-pop, .nb-theme-pop, .nb-sheet, .nb-sheet-link { transition:none; animation:none; } }
      `}</style>
    </header>
  );
};

export default Navbar;
