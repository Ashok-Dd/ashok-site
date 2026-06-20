import { Github, Mail, MessageCircle, ArrowUp } from "lucide-react";
import { links, footerData } from "../../data";

const Footer = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
              {footerData.tagline}
              <br />
              {footerData.taglineSub}
            </p>
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
              {footerData.navLinks.map((item) => (
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
              <a href={footerData.contact.emailHref} className="ft-contact-item">
                <Mail size={13} />
                {footerData.contact.email}
              </a>
              <a
                href={footerData.contact.phoneHref}
                target="_blank"
                rel="noopener noreferrer"
                className="ft-contact-item"
              >
                <MessageCircle size={13} />
                {footerData.contact.phone}
              </a>
              <a
                href={footerData.contact.githubHref}
                target="_blank"
                rel="noopener noreferrer"
                className="ft-contact-item"
              >
                <Github size={13} />
                {footerData.contact.github}
              </a>
            </div>
          </div>

          {/* Status column */}
          <div className="ft-col">
            <h4 className="ft-col-title">Status</h4>
            <div className="ft-status">
              <div className="ft-status-badge">
                <span className="ft-status-dot" />
                {footerData.statusBadge}
              </div>
              <p className="ft-status-desc">{footerData.statusDesc}</p>
              <a href={footerData.resumeUrl} download className="ft-resume-btn">
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
            <span className="ft-copy-accent">{footerData.copyright}</span>. Crafted with
            precision &amp; caffeine.
          </span>
          <span className="ft-built">{footerData.builtWith}</span>
          <button className="ft-top-btn" onClick={scrollTop} title="Back to top">
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

      {/* ASHOK watermark — below all content, in normal flow */}
      <div className="ft-watermark-wrap">
        <div className="ft-watermark" aria-hidden="true">ASHOK</div>
      </div>
    </footer>
  );
};

export default Footer;
