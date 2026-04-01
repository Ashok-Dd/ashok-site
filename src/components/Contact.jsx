import { useState, useEffect } from 'react';
import { Github, Instagram, Mail, Linkedin, MessageCircle, Send } from 'lucide-react';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setIsVisible(true)),
      { threshold: 0.1 }
    );
    const element = document.getElementById('contact');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const contactData = [
    {
      id: 'github',
      name: 'GitHub',
      username: '@Ashok-Dd',
      link: 'https://github.com/Ashok-Dd',
      icon: Github,
      desc: 'View my source code',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      username: 'Bongu Ashok',
      link: 'https://linkedin.com/in/ashok-bongu',
      icon: Linkedin,
      desc: 'Let\'s connect professionally',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      username: '@ashok_devil_123',
      link: 'https://instagram.com/ashok_devil_123',
      icon: Instagram,
      desc: 'Follow my journey',
    },
    {
      id: 'email',
      name: 'Email',
      username: 'bonguashok86@email.com',
      link: 'mailto:bonguashok86@email.com',
      icon: Mail,
      desc: 'Drop me a message',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      username: '+91 9392954525',
      link: 'https://wa.me/9392954525',
      icon: MessageCircle,
      desc: 'Let\'s chat directly',
    },
  ];

  return (
    <section id="contact" className="contact-section">
      {/* Background */}
      <div className="contact-bg">
        <div className="contact-glow contact-glow-1" />
        <div className="contact-glow contact-glow-2" />
        <div className="contact-grid" />
        <span className="contact-glyph" style={{ top: '10%', right: '5%' }}>{'<>'}</span>
        <span className="contact-glyph" style={{ bottom: '10%', left: '4%', animationDelay: '3s' }}>{'{ }'}</span>
      </div>

      <div className="contact-container">
        {/* Header */}
        <div className={`contact-header ${isVisible ? 'visible' : ''}`}>
          <p className="contact-eyebrow">
            <span className="eyebrow-dot" /> Let's work together
          </p>
          <h2 className="contact-title">Get In Touch</h2>
          <p className="contact-subtitle">
            Have a project in mind or just want to say hello? Pick your channel below.
          </p>
          <div className="contact-divider">
            <div className="div-line" />
            <div className="div-gem" />
            <div className="div-line div-line-r" />
          </div>
        </div>

        {/* Panel */}
        <div className={`contact-panel ${isVisible ? 'visible' : ''}`}>
          {/* Panel header */}
          <div className="panel-label">
            <Send size={13} style={{ color: '#1ABC9C' }} />
            <span>Connect with me</span>
            <Send size={13} style={{ color: '#1ABC9C', transform: 'scaleX(-1)' }} />
          </div>

          {/* Cards */}
          <div className="contact-grid-cards">
            {contactData.map((contact, idx) => {
              const Icon = contact.icon;
              const isHovered = hoveredCard === contact.id;
              return (
                <a
                  key={contact.id}
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`contact-card ${isVisible ? 'visible' : ''} ${isHovered ? 'hovered' : ''}`}
                  style={{ transitionDelay: `${idx * 80 + 200}ms` }}
                  onMouseEnter={() => setHoveredCard(contact.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Hover glow */}
                  <div className="ccard-glow" />

                  {/* Icon */}
                  <div className="ccard-icon-wrap">
                    <Icon size={22} className="ccard-icon" />
                  </div>

                  {/* Info */}
                  <div className="ccard-info">
                    <span className="ccard-name">{contact.name}</span>
                    <span className="ccard-username">{contact.username}</span>
                    <span className="ccard-desc">{contact.desc}</span>
                  </div>

                  {/* Hover arrow */}
                  <div className={`ccard-arrow ${isHovered ? 'show' : ''}`}>→</div>

                  {/* Bottom line */}
                  <div className="ccard-bottom" />
                </a>
              );
            })}
          </div>

          {/* Availability badge */}
          <div className="avail-badge">
            <span className="avail-dot" />
            <span>Available for opportunities</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600&family=Share+Tech+Mono&display=swap');

        .contact-section {
          min-height: 80vh;
          background-color: #1E1E2F;
          color: #F5F5F7;
          position: relative;
          overflow: hidden;
          padding: 96px 0;
          display: flex;
          align-items: center;
        }

        /* Background */
        .contact-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .contact-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
        }
        .contact-glow-1 {
          width: 500px; height: 500px;
          top: -150px; right: -100px;
          background: rgba(26,188,156,0.07);
          animation: ctPulse 8s ease-in-out infinite;
        }
        .contact-glow-2 {
          width: 400px; height: 400px;
          bottom: -100px; left: -100px;
          background: rgba(26,188,156,0.05);
          animation: ctPulse 10s ease-in-out infinite 4s;
        }
        .contact-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(26,188,156,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,188,156,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .contact-glyph {
          position: absolute;
          font-family: 'Share Tech Mono', monospace;
          font-size: 5rem;
          color: rgba(26,188,156,0.04);
          user-select: none;
          animation: ctFloat 7s ease-in-out infinite;
        }

        /* Container */
        .contact-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
          width: 100%;
        }

        /* Header */
        .contact-header {
          text-align: center;
          margin-bottom: 52px;
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .contact-header.visible { opacity: 1; transform: translateY(0); }

        .contact-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #1ABC9C;
          margin-bottom: 14px;
        }
        .eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1ABC9C;
          box-shadow: 0 0 8px rgba(26,188,156,0.7);
          display: inline-block;
          animation: ctPulse 2s ease-in-out infinite;
        }
        .contact-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #F5F5F7 30%, #1ABC9C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }
        .contact-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #6B6B80;
        }
        .contact-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }
        .div-line {
          height: 1px; width: 80px;
          background: linear-gradient(to right, transparent, rgba(26,188,156,0.5));
        }
        .div-line-r {
          background: linear-gradient(to left, transparent, rgba(26,188,156,0.5));
        }
        .div-gem {
          width: 8px; height: 8px;
          background: #1ABC9C;
          transform: rotate(45deg);
          box-shadow: 0 0 10px rgba(26,188,156,0.6);
        }

        /* Panel */
        .contact-panel {
          background: rgba(37, 37, 56, 0.7);
          border: 1px solid rgba(26,188,156,0.15);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.3);
          opacity: 0;
          transform: scale(0.97);
          transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
        }
        .contact-panel.visible { opacity: 1; transform: scale(1); }
        @media (max-width: 600px) {
          .contact-panel { padding: 24px 16px; }
        }

        /* Panel label */
        .panel-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 32px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #1ABC9C;
        }

        /* Cards grid */
        .contact-grid-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .contact-grid-cards { grid-template-columns: repeat(3, 1fr); }
        }

        /* Individual card */
        .contact-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding: 20px 14px 18px;
          background: rgba(22, 22, 42, 0.6);
          border: 1px solid rgba(26,188,156,0.1);
          border-radius: 16px;
          text-decoration: none;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.5s ease,
            transform 0.5s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }
        .contact-card.visible { opacity: 1; transform: translateY(0); }
        .contact-card.hovered {
          border-color: rgba(26,188,156,0.4);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(26,188,156,0.08);
          transform: translateY(-5px);
        }

        /* Card glow */
        .ccard-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(26,188,156,0.06) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .contact-card.hovered .ccard-glow { opacity: 1; }

        /* Icon */
        .ccard-icon-wrap {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(26,188,156,0.1);
          border: 1px solid rgba(26,188,156,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1ABC9C;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .contact-card.hovered .ccard-icon-wrap {
          background: rgba(26,188,156,0.2);
          transform: scale(1.1) rotate(8deg);
          box-shadow: 0 4px 16px rgba(26,188,156,0.2);
        }

        /* Info */
        .ccard-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ccard-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1ABC9C;
          letter-spacing: 0.04em;
        }
        .ccard-username {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          color: #A0A0B0;
          word-break: break-all;
        }
        .ccard-desc {
          font-family: 'Inter', sans-serif;
          font-size: 0.68rem;
          color: #6B6B80;
          margin-top: 2px;
        }

        /* Arrow */
        .ccard-arrow {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #1ABC9C;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .ccard-arrow.show { opacity: 1; transform: translateX(0); }

        /* Bottom accent */
        .ccard-bottom {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px; width: 0;
          background: linear-gradient(90deg, #1ABC9C, #4DD9BC);
          border-radius: 0 0 16px 16px;
          transition: width 0.35s ease;
        }
        .contact-card.hovered .ccard-bottom { width: 100%; }

        /* Availability */
        .avail-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 28px;
          padding: 10px 24px;
          background: rgba(26,188,156,0.05);
          border: 1px solid rgba(26,188,156,0.18);
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          color: #1ABC9C;
          letter-spacing: 0.04em;
          width: fit-content;
          margin-inline: auto;
        }
        .avail-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #1ABC9C;
          box-shadow: 0 0 8px rgba(26,188,156,0.7);
          animation: ctPulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }

        /* Keyframes */
        @keyframes ctPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes ctFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `}</style>
    </section>
  );
};

export default Contact;