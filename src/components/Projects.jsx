import { useState, useEffect } from 'react';
import { ExternalLink, Github, Code2, Laptop, Wrench, Star } from 'lucide-react';

const Projects = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setIsVisible(true)),
      { threshold: 0.1 }
    );
    const element = document.getElementById('projects');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const projects = [
    {
      title: 'Student Dashboard',
      description: 'A comprehensive student management system with real-time analytics, course tracking, and admin panel — built for educational institutions to streamline operations.',
      tech: ['React', 'Node.js', 'MongoDB', 'TailwindCSS', 'Express.js'],
      icon: Laptop,
      github: 'https://github.com/Ashok-Dd/student-dashboard',
      live: 'https://student-dashboard-two-sandy.vercel.app/',
      rating: '4.8',
      tag: 'Education',
    },
    {
      title: 'Code Space',
      description: 'Save code snippets via a unique ID and retrieve them via URL. A minimal, efficient MERN tool for storing and sharing code instantly.',
      tech: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TailwindCSS'],
      icon: Code2,
      github: 'https://github.com/Ashok-Dd/code-space',
      live: 'https://code-space-beta-ten.vercel.app/',
      rating: '4.7',
      tag: 'Utility',
    },
    {
      title: 'DevTools Playground',
      description: 'A powerful MERN developer toolkit with API Tester, JSON ↔ CSV Converter, JWT Decoder, URL Encoder/Decoder, and Regex Tester — all in a clean, theme-adaptive UI with Google OAuth.',
      tech: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TailwindCSS'],
      icon: Wrench,
      github: 'https://github.com/Ashok-Dd/DevTools-Playground',
      live: 'https://dev-tools-playground.vercel.app/',
      rating: '4.8',
      tag: 'Tooling',
    },
  ];

  return (
    <section id="projects" className="projects-section">
      {/* Background */}
      <div className="projects-bg">
        <div className="proj-glow proj-glow-tr" />
        <div className="proj-glow proj-glow-bl" />
        <div className="proj-dots" />
        <span className="proj-glyph" style={{ top: '15%', left: '3%' }}>{'</>'}</span>
        <span className="proj-glyph" style={{ bottom: '15%', right: '3%', animationDelay: '2s' }}>{'{ }'}</span>
      </div>

      <div className="projects-container">
        {/* Header */}
        <div className={`proj-header ${isVisible ? 'visible' : ''}`}>
          <p className="proj-eyebrow">
            <span className="eyebrow-dot" /> What I've built
          </p>
          <h2 className="proj-title">My Projects</h2>
          <p className="proj-subtitle">
            Crafted with precision, deployed with purpose. Each project solves a real problem.
          </p>
          <div className="proj-divider">
            <div className="divider-line" />
            <div className="divider-gem" />
            <div className="divider-line divider-line-r" />
          </div>
        </div>

        {/* Grid */}
        <div className="proj-grid">
          {projects.map((project, index) => {
            const Icon = project.icon;
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={index}
                className={`proj-card ${isVisible ? 'visible' : ''} ${isHovered ? 'hovered' : ''}`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Glow overlay */}
                <div className="card-glow" />

                {/* Header row */}
                <div className="card-head">
                  <div className="card-icon-wrap">
                    <Icon className="card-icon" size={22} />
                  </div>
                  <div className="card-meta">
                    <span className="card-tag">{project.tag}</span>
                    <span className="card-rating">
                      <Star size={11} fill="currentColor" />
                      {project.rating}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="card-title">{project.title}</h3>

                {/* Description */}
                <p className="card-desc">{project.description}</p>

                {/* Tech */}
                <div className="card-tech">
                  {project.tech.map((t, i) => (
                    <span key={i} className="tech-chip">{t}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-card-primary">
                    <Github size={14} />
                    Code
                  </a>
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn-card-outline">
                    <ExternalLink size={14} />
                    Live Demo
                  </a>
                </div>

                {/* Bottom accent line */}
                <div className="card-bottom-line" />

                {/* Hover particles */}
                {isHovered && (
                  <>
                    <div className="hover-particle hp1" />
                    <div className="hover-particle hp2" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600&family=Share+Tech+Mono&display=swap');

        .projects-section {
          min-height: 100vh;
          background-color: #16162A;
          color: #F5F5F7;
          position: relative;
          overflow: hidden;
          padding: 96px 0;
        }

        /* Background */
        .projects-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .proj-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          filter: blur(100px);
        }
        .proj-glow-tr {
          top: -100px; right: -100px;
          background: rgba(26,188,156,0.06);
          animation: projPulse 7s ease-in-out infinite;
        }
        .proj-glow-bl {
          bottom: -100px; left: -100px;
          background: rgba(26,188,156,0.04);
          animation: projPulse 9s ease-in-out infinite 3s;
        }
        .proj-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(26,188,156,0.07) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .proj-glyph {
          position: absolute;
          font-family: 'Share Tech Mono', monospace;
          font-size: 5rem;
          color: rgba(26,188,156,0.04);
          user-select: none;
          animation: glyphFloat 6s ease-in-out infinite;
        }

        /* Container */
        .projects-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        /* Header */
        .proj-header {
          text-align: center;
          margin-bottom: 64px;
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .proj-header.visible { opacity: 1; transform: translateY(0); }

        .proj-eyebrow {
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
          animation: projPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        .proj-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #F5F5F7 30%, #1ABC9C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 14px;
        }
        .proj-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #6B6B80;
          max-width: 480px;
          margin: 0 auto;
        }
        .proj-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 28px;
        }
        .divider-line {
          height: 1px; width: 80px;
          background: linear-gradient(to right, transparent, rgba(26,188,156,0.5));
        }
        .divider-line-r {
          background: linear-gradient(to left, transparent, rgba(26,188,156,0.5));
        }
        .divider-gem {
          width: 8px; height: 8px;
          background: #1ABC9C;
          transform: rotate(45deg);
          box-shadow: 0 0 10px rgba(26,188,156,0.6);
        }

        /* Grid */
        .proj-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media (min-width: 768px) {
          .proj-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .proj-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* Card */
        .proj-card {
          position: relative;
          background: linear-gradient(145deg, #252538, #1a1a2e);
          border: 1px solid rgba(26,188,156,0.12);
          border-radius: 18px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
          cursor: default;
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 0.6s ease,
            transform 0.6s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }
        .proj-card.visible { opacity: 1; transform: translateY(0); }
        .proj-card.hovered {
          border-color: rgba(26,188,156,0.4);
          box-shadow:
            0 0 0 1px rgba(26,188,156,0.1),
            0 8px 40px rgba(0,0,0,0.5),
            0 0 30px rgba(26,188,156,0.08);
          transform: translateY(-6px);
        }

        /* Glow overlay inside card */
        .card-glow {
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,188,156,0.08) 0%, transparent 70%);
          pointer-events: none;
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        .proj-card.hovered .card-glow { opacity: 1; }

        /* Card head */
        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(26,188,156,0.1);
          border: 1px solid rgba(26,188,156,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1ABC9C;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .proj-card.hovered .card-icon-wrap {
          background: rgba(26,188,156,0.18);
          transform: rotate(6deg) scale(1.05);
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #1ABC9C;
          background: rgba(26,188,156,0.1);
          border: 1px solid rgba(26,188,156,0.2);
          border-radius: 9999px;
          padding: 2px 10px;
        }
        .card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #1ABC9C;
        }

        /* Card content */
        .card-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #F5F5F7;
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }
        .proj-card.hovered .card-title { color: #4DD9BC; }

        .card-desc {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          line-height: 1.65;
          color: #A0A0B0;
          flex: 1;
          transition: color 0.3s ease;
        }
        .proj-card.hovered .card-desc { color: #C0C0C8; }

        /* Tech */
        .card-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tech-chip {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          color: #A0A0B0;
          background: rgba(213,213,213,0.06);
          border: 1px solid rgba(213,213,213,0.1);
          border-radius: 6px;
          padding: 3px 10px;
          transition: all 0.25s ease;
        }
        .proj-card.hovered .tech-chip {
          color: #1ABC9C;
          border-color: rgba(26,188,156,0.25);
          background: rgba(26,188,156,0.06);
        }

        /* Actions */
        .card-actions {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .btn-card-primary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 0;
          background: linear-gradient(135deg, #1ABC9C, #148F77);
          color: #1E1E2F;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: 9px;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .btn-card-primary:hover {
          background: linear-gradient(135deg, #4DD9BC, #1ABC9C);
          box-shadow: 0 4px 16px rgba(26,188,156,0.3);
          transform: translateY(-2px);
          color: #1E1E2F;
        }
        .btn-card-outline {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 0;
          background: transparent;
          color: #1ABC9C;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 9px;
          border: 1.5px solid rgba(26,188,156,0.35);
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .btn-card-outline:hover {
          background: rgba(26,188,156,0.08);
          border-color: #1ABC9C;
          box-shadow: 0 4px 16px rgba(26,188,156,0.15);
          transform: translateY(-2px);
          color: #4DD9BC;
        }

        /* Bottom accent */
        .card-bottom-line {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px; width: 0;
          background: linear-gradient(90deg, #1ABC9C, #4DD9BC);
          border-radius: 0 0 18px 18px;
          transition: width 0.4s ease;
        }
        .proj-card.hovered .card-bottom-line { width: 100%; }

        /* Hover particles */
        .hover-particle {
          position: absolute;
          border-radius: 50%;
          background: #1ABC9C;
          animation: particlePing 1.2s ease-in-out infinite;
        }
        .hp1 { width: 8px; height: 8px; top: -4px; right: 10%; }
        .hp2 { width: 6px; height: 6px; bottom: -3px; left: 10%; animation-delay: 0.4s; }

        /* Keyframes */
        @keyframes projPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes glyphFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @keyframes particlePing {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(2.5); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
};

export default Projects;