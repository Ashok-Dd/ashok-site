import { useEffect, useRef, useState } from "react";
import { Menu, X, Crosshair, Zap, Sun, Flame, TreePine, Waves, Telescope } from "lucide-react";
import gsap from "gsap";
import { navItems } from "../../data";
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

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navRef         = useRef();
  const underlineRef   = useRef();
  const mobileMenuRef  = useRef();
  const dropdownRef    = useRef();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen,   setIsDropdownOpen]   = useState(false);
  const [active, setActive] = useState("home");

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  const scrollToSection = (item) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(item.toLowerCase());
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav-logo", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
      gsap.from(".nav-item", { y: -30, opacity: 0, stagger: 0.15, delay: 0.2, duration: 0.8, ease: "power3.out" });

      document.querySelectorAll(".nav-item").forEach((el) => {
        el.addEventListener("mousemove", (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(el, { x: x * 0.15, y: y * 0.2, duration: 0.3 });
        });
        el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.4 }));
      });

      const underline = underlineRef.current;
      document.querySelectorAll(".nav-item").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          const rect = el.getBoundingClientRect();
          gsap.to(underline, { width: rect.width, x: rect.left + window.scrollX, opacity: 1, duration: 0.4, ease: "power3.out" });
        });
      });
      document.querySelector(".nav-links")?.addEventListener("mouseleave", () => {
        gsap.to(underline, { opacity: 0, duration: 0.3 });
      });

      const sections = document.querySelectorAll("section, div[id]");
      const scrollHandler = () => {
        let current = "home";
        sections.forEach((sec) => {
          if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        setActive(current);
      };
      window.addEventListener("scroll", scrollHandler);

      let lastScroll = window.scrollY;
      const hideNavHandler = () => {
        const current = window.scrollY;
        if (current > lastScroll && current > 100) {
          gsap.to(navRef.current, { y: "-120%", duration: 0.5, ease: "power3.out" });
        } else {
          gsap.to(navRef.current, { y: "0%", duration: 0.5, ease: "power3.out" });
        }
        lastScroll = current;
      };
      window.addEventListener("scroll", hideNavHandler);

      if (isMobileMenuOpen && mobileMenuRef.current) {
        gsap.fromTo(
          mobileMenuRef.current,
          { y: "-100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.6, ease: "power3.out" }
        );
      }

      return () => {
        window.removeEventListener("scroll", scrollHandler);
        window.removeEventListener("scroll", hideNavHandler);
      };
    }, navRef);

    return () => ctx.revert();
  }, [isMobileMenuOpen]);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setIsDropdownOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header ref={navRef} className="nav-root">
        <div className="nav-container">
          <h1 className="nav-logo"><span className="logo-dim">ASH</span>OK</h1>

          {/* Desktop Nav */}
          <nav className="nav-links">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`nav-item ${active === item.toLowerCase() ? "active" : ""}`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Theme pencil trigger + dropdown */}
          <div className="theme-dot-wrap" ref={dropdownRef}>
            <button
              className="theme-dot-trigger"
              style={{ background: 'transparent', boxShadow: 'none', padding: 4 }}
              onClick={() => setIsDropdownOpen(prev => !prev)}
              title={`Theme: ${currentTheme.label}`}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ filter: `drop-shadow(0 0 6px ${currentTheme.color}bb)`, display: 'block' }}>
                <g transform="rotate(45 11 11)">
                  {/* eraser top */}
                  <rect x="8" y="2" width="6" height="2.5" rx="1"
                    stroke={currentTheme.color} strokeWidth="1.3" fill="none" />
                  {/* pencil body */}
                  <rect x="8" y="4.5" width="6" height="11" rx="0"
                    stroke={currentTheme.color} strokeWidth="1.3" fill="none" />
                  {/* tip triangle */}
                  <polyline points="8,15.5 11,20 14,15.5"
                    stroke={currentTheme.color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
                  {/* center line on tip */}
                  <line x1="11" y1="15.5" x2="11" y2="19"
                    stroke={currentTheme.color} strokeWidth="0.8" strokeOpacity="0.5" />
                </g>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="theme-dropdown">
                {THEMES.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      className={`theme-dropdown-item ${isActive ? 'active' : ''}`}
                      style={isActive ? { borderColor: t.color, background: `${t.color}12` } : {}}
                      onClick={() => { setTheme(t.id); setIsDropdownOpen(false); }}
                    >
                      <span className="tdi-dot" style={{ background: t.color, boxShadow: isActive ? `0 0 6px ${t.color}` : 'none' }} />
                      
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: "var(--color-accent)" }}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Curtain Menu */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="mobile-menu">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="mobile-item"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div ref={underlineRef} className="nav-underline" />
      </header>
    </>
  );
};

export default Navbar;
