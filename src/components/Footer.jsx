import {
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Instagram,
  ArrowUp,
} from "lucide-react";
import { links } from "../../data";

const Footer = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const navLinks = ["Home", "Projects", "Skills", "Contact"];

  const scrollToSection = (item) => {
    const el = document.getElementById(item.toLowerCase());
    if (el) window.scrollTo({ top: el.offsetTop - 72, behavior: "smooth" });
  };

  return (
    <footer className="ft-root">
      {/* Top fade divider */}
      <div className="ft-fade-top" />

      <div className="ft-container">
        {/* Main row */}
        <div className="ft-main">
          {/* Brand column */}
          <div className="ft-brand">
            <div className="ft-logo">
              ASH<span>OK</span>
            </div>
            <p className="ft-tagline">
              Full Stack Developer · Code Ninja
              <br />
              Building the web, one commit at a time.
            </p>
            {/* Social icons */}
            <div className="ft-socials">
              {links.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-social"
                  title={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div className="ft-col">
            <h4 className="ft-col-title">Navigation</h4>
            <nav className="ft-nav">
              {navLinks.map((item) => (
                <button
                  key={item}
                  className="ft-nav-link"
                  onClick={() => scrollToSection(item)}
                >
                  <span className="ft-nav-dot" />
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact column */}
          <div className="ft-col">
            <h4 className="ft-col-title">Contact</h4>
            <div className="ft-contact-list">
              <a
                href="mailto:bonguashok86@email.com"
                className="ft-contact-item"
              >
                <Mail size={13} />
                bonguashok86@email.com
              </a>
              <a
                href="https://wa.me/9014256401"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-contact-item"
              >
                <MessageCircle size={13} />
                +91 9014256401
              </a>
              <a
                href="https://github.com/Ashok-Dd"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-contact-item"
              >
                <Github size={13} />
                github.com/Ashok-Dd
              </a>
            </div>
          </div>

          {/* Status column */}
          <div className="ft-col">
            <h4 className="ft-col-title">Status</h4>
            <div className="ft-status">
              <div className="ft-status-badge">
                <span className="ft-status-dot" />
                Available for hire
              </div>
              <p className="ft-status-desc">
                Open to full-time roles,
                <br />
                freelance projects &amp; collabs.
              </p>
              <a href="/AshokResume .pdf" download className="ft-resume-btn">
                Download Resume ↓
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="ft-divider">
          <div className="ft-divider-line" />
          <div className="ft-divider-gem" />
          <div className="ft-divider-line" />
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <span className="ft-copy">
            © {new Date().getFullYear()}{" "}
            <span className="ft-copy-accent">Ashok Bongu</span>. Crafted with
            precision &amp; caffeine.
          </span>
          <span className="ft-built">
            Built with React · TailwindCSS · Node.js
          </span>
          {/* Back to top */}
          <button
            className="ft-top-btn"
            onClick={scrollTop}
            title="Back to top"
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
