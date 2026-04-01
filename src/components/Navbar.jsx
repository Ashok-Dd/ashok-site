import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import gsap from "gsap";

const Navbar = () => {
  const navRef = useRef();
  const underlineRef = useRef();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  const navItems = ["Home", "Projects", "Skills", "Contact"];

  const scrollToSection = (item) => {
    setIsMobileMenuOpen(false);

    const element = document.getElementById(item.toLowerCase());
    if (element) {
      const offset = element.offsetTop - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {

      // 🔥 ENTRY ANIMATION
      gsap.from(".nav-logo", {
        y: -60,
        opacity: 0,
        filter: "blur(10px)",
        duration: 1,
        ease: "power4.out",
      });

      gsap.from(".nav-item", {
        y: -40,
        opacity: 0,
        stagger: 0.1,
        delay: 0.2,
        duration: 0.8,
        ease: "power3.out",
      });

      // 🔥 MAGNETIC EFFECT
      document.querySelectorAll(".nav-item").forEach((el) => {
        el.addEventListener("mousemove", (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          gsap.to(el, {
            x: x * 0.2,
            y: y * 0.3,
            duration: 0.3,
          });
        });

        el.addEventListener("mouseleave", () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.4 });
        });
      });

      // 🔥 UNDERLINE FOLLOW
      const underline = underlineRef.current;

      document.querySelectorAll(".nav-item").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          const rect = el.getBoundingClientRect();

          gsap.to(underline, {
            width: rect.width,
            x: rect.left,
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
          });
        });
      });

      document.querySelector(".nav-links").addEventListener("mouseleave", () => {
        gsap.to(underline, {
          opacity: 0,
          duration: 0.3,
        });
      });

      // 🔥 SCROLL SPY (ACTIVE LINK)
      const sections = document.querySelectorAll("section, div[id]");

      window.addEventListener("scroll", () => {
        let current = "home";

        sections.forEach((sec) => {
          const top = sec.offsetTop - 100;
          if (window.scrollY >= top) {
            current = sec.id;
          }
        });

        setActive(current);
      });

      // 🔥 HIDE/SHOW NAV
      let lastScroll = window.scrollY;

      window.addEventListener("scroll", () => {
        let current = window.scrollY;

        if (current > lastScroll && current > 100) {
          gsap.to(navRef.current, { y: "-100%", duration: 0.4 });
        } else {
          gsap.to(navRef.current, { y: "0%", duration: 0.4 });
        }

        lastScroll = current;
      });

      // 🔥 MOBILE MENU ANIMATION
      if (isMobileMenuOpen) {
        gsap.from(".mobile-item", {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power3.out",
        });
      }

    }, navRef);

    return () => ctx.revert();
  }, [isMobileMenuOpen]);

  return (
    <>
      <style>{`
        .nav-root {
            background: #080808;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            position: relative;
        }

            .nav-root::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 59, 59, 0.6),
                transparent
            );
            opacity: 0.6;
            }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #ff3b3b;
        }

        .nav-item {
          position: relative;
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
        }

        .nav-item.active {
          color: #fff;
        }

        .nav-underline {
          position: fixed;
          height: 2px;
          background: #ff3b3b;
          bottom: 0;
          left: 0;
          width: 0;
          opacity: 0;
          pointer-events: none;
        }
      `}</style>

      <header ref={navRef} className="nav-root sticky top-0 z-50">
        <div className="max-w-full px-6 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">

            <h1 className="nav-logo">
                <span className="text-[#ffffff]">ASH</span>OK
            </h1>

            <nav className="nav-links hidden md:flex space-x-10">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`nav-item ${
                    active === item.toLowerCase() ? "active" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-red-500"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-6 space-y-5">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="mobile-item nav-item block text-left"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🔥 Floating underline */}
        <div ref={underlineRef} className="nav-underline" />
      </header>
    </>
  );
};

export default Navbar;