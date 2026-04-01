import { Github, Linkedin, Mail, MessageCircle, Instagram, ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const links = [
    { icon: Github,      href: "https://github.com/Ashok-Dd",           label: "GitHub" },
    { icon: Linkedin,    href: "https://linkedin.com/in/ashok-bongu",    label: "LinkedIn" },
    { icon: Instagram,   href: "https://instagram.com/ashok_devil_123",  label: "Instagram" },
    { icon: Mail,        href: "mailto:bonguashok86@email.com",          label: "Email" },
    { icon: MessageCircle, href: "https://wa.me/9392954525",            label: "WhatsApp" },
  ];

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
            <div className="ft-logo">ASH<span>OK</span></div>
            <p className="ft-tagline">
              Full Stack Developer · Code Ninja<br />
              Building the web, one commit at a time.
            </p>
            {/* Social icons */}
            <div className="ft-socials">
              {links.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="ft-social" title={label}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div className="ft-col">
            <h4 className="ft-col-title">Navigation</h4>
            <nav className="ft-nav">
              {navLinks.map(item => (
                <button key={item} className="ft-nav-link" onClick={() => scrollToSection(item)}>
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
              <a href="mailto:bonguashok86@email.com" className="ft-contact-item">
                <Mail size={13} />
                bonguashok86@email.com
              </a>
              <a href="https://wa.me/9392954525" target="_blank" rel="noopener noreferrer" className="ft-contact-item">
                <MessageCircle size={13} />
                +91 9392954525
              </a>
              <a href="https://github.com/Ashok-Dd" target="_blank" rel="noopener noreferrer" className="ft-contact-item">
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
                Open to full-time roles,<br />freelance projects &amp; collabs.
              </p>
              <a href="/AshokResume.pdf" download className="ft-resume-btn">
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
            © {new Date().getFullYear()} <span className="ft-copy-accent">Ashok Bongu</span>. Crafted with precision &amp; caffeine.
          </span>
          <span className="ft-built">
            Built with React · TailwindCSS · Node.js
          </span>
          {/* Back to top */}
          <button className="ft-top-btn" onClick={scrollTop} title="Back to top">
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:wght@300;400&family=Share+Tech+Mono&display=swap');

        .ft-root {
          background: #0d0d1a;
          position: relative;
          overflow: hidden;
        }

        /* Top fade from last section */
        .ft-fade-top {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26,188,156,0.2), transparent);
        }

        /* Subtle bg texture */
        .ft-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(26,188,156,0.025) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
        }

        .ft-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 32px 32px;
          position: relative;
          z-index: 1;
        }

        /* Main grid */
        .ft-main {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        @media (max-width: 900px) {
          .ft-main { grid-template-columns: 1fr 1fr; gap: 36px; }
        }
        @media (max-width: 540px) {
          .ft-main { grid-template-columns: 1fr; gap: 28px; }
        }

        /* Brand */
        .ft-brand { display: flex; flex-direction: column; gap: 14px; }
        .ft-logo {
          font-family: 'Orbitron', monospace;
          font-size: 22px; font-weight: 900;
          letter-spacing: 0.16em;
          color: #F5F5F7;
        }
        .ft-logo span { color: #1ABC9C; }
        .ft-tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; line-height: 1.7;
          color: #6B6B80;
        }

        /* Social row */
        .ft-socials { display: flex; gap: 8px; flex-wrap: wrap; }
        .ft-social {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(26,188,156,0.15);
          background: rgba(26,188,156,0.04);
          color: #6B6B80;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .ft-social:hover {
          color: #1ABC9C;
          background: rgba(26,188,156,0.1);
          border-color: rgba(26,188,156,0.35);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(26,188,156,0.15);
        }

        /* Columns */
        .ft-col { display: flex; flex-direction: column; gap: 16px; }
        .ft-col-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #1ABC9C;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(26,188,156,0.1);
        }

        /* Nav links */
        .ft-nav { display: flex; flex-direction: column; gap: 4px; }
        .ft-nav-link {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #6B6B80;
          padding: 5px 0; text-align: left;
          transition: color 0.2s, padding-left 0.2s;
        }
        .ft-nav-link:hover { color: #F5F5F7; padding-left: 4px; }
        .ft-nav-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(26,188,156,0.3); flex-shrink: 0;
          transition: background 0.2s;
        }
        .ft-nav-link:hover .ft-nav-dot { background: #1ABC9C; }

        /* Contact items */
        .ft-contact-list { display: flex; flex-direction: column; gap: 8px; }
        .ft-contact-item {
          display: flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #6B6B80;
          text-decoration: none;
          transition: color 0.2s;
          word-break: break-all;
        }
        .ft-contact-item:hover { color: #1ABC9C; }
        .ft-contact-item svg { flex-shrink: 0; color: rgba(26,188,156,0.4); }

        /* Status */
        .ft-status { display: flex; flex-direction: column; gap: 10px; }
        .ft-status-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(26,188,156,0.06);
          border: 1px solid rgba(26,188,156,0.2);
          border-radius: 9999px;
          padding: 5px 12px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 0.1em;
          color: #1ABC9C;
          width: fit-content;
        }
        .ft-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #1ABC9C;
          box-shadow: 0 0 6px rgba(26,188,156,0.7);
          animation: ftDotPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes ftDotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .ft-status-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; line-height: 1.65; color: #6B6B80;
        }
        .ft-resume-btn {
          display: inline-flex; align-items: center;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1ABC9C;
          border: 1px solid rgba(26,188,156,0.3);
          background: rgba(26,188,156,0.04);
          padding: 7px 14px; border-radius: 7px;
          text-decoration: none;
          transition: all 0.25s;
          width: fit-content;
        }
        .ft-resume-btn:hover {
          background: rgba(26,188,156,0.1);
          border-color: rgba(26,188,156,0.55);
          box-shadow: 0 0 12px rgba(26,188,156,0.12);
        }

        /* Divider */
        .ft-divider {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 24px;
        }
        .ft-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26,188,156,0.15), rgba(26,188,156,0.15));
        }
        .ft-divider-gem {
          width: 6px; height: 6px;
          background: rgba(26,188,156,0.4);
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        /* Bottom bar */
        .ft-bottom {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .ft-copy {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #6B6B80;
        }
        .ft-copy-accent { color: #1ABC9C; }
        .ft-built {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 0.12em;
          color: rgba(26,188,156,0.3);
        }
        .ft-top-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(26,188,156,0.2);
          background: rgba(26,188,156,0.05);
          color: #1ABC9C; cursor: pointer;
          transition: all 0.25s;
        }
        .ft-top-btn:hover {
          background: rgba(26,188,156,0.12);
          border-color: rgba(26,188,156,0.45);
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(26,188,156,0.15);
        }
      `}</style>
    </footer>
  );
};

export default Footer;