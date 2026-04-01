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

      
    </section>
  );
};

export default Projects;