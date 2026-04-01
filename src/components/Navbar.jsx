import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import gsap from "gsap";

const Navbar = () => {
  const navRef = useRef();
  const underlineRef = useRef();
  const mobileMenuRef = useRef();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  const navItems = ["Home", "Skills", "Projects", "Contact"];

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

      // Desktop hover tilt
      document.querySelectorAll(".nav-item").forEach((el) => {
        el.addEventListener("mousemove", (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(el, { x: x * 0.15, y: y * 0.2, duration: 0.3 });
        });
        el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.4 }));
      });

      // Underline animation
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

      // Section tracking
      const sections = document.querySelectorAll("section, div[id]");
      const scrollHandler = () => {
        let current = "home";
        sections.forEach((sec) => {
          if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        setActive(current);
      };
      window.addEventListener("scroll", scrollHandler);

      // Hide navbar on scroll down
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

      // Mobile menu animation
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

  return (
    <>


      <header ref={navRef} className="nav-root">
        <div className="nav-container">
          <h1 className="nav-logo"><span className="logo-dim">ASH</span>OK</h1>

          {/* Desktop Nav only visible >= md */}
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

          {/* Mobile Hamburger */}
          <button
            className="hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: "#1ABC9C" }}
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