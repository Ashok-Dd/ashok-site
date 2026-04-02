import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ArrowDown } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshWobbleMaterial } from '@react-three/drei';
import { roles } from '../../data';

const Home = () => {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);



  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    const currentRole = roles[currentIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = 2000;

    if (!isDeleting && typedText === currentRole) {
      setTimeout(() => setIsDeleting(true), pauseTime);
      return;
    }
    if (isDeleting && typedText === '') {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % roles.length);
      return;
    }

    const timeout = setTimeout(() => {
      setTypedText(
        isDeleting
          ? currentRole.substring(0, typedText.length - 1)
          : currentRole.substring(0, typedText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, currentIndex]);

  return (
    <section id="home" className="portfolio-home ">
      {/* Background layers */}
      <div className="home-bg">
        <div className="home-glow home-glow-1" />
        <div className="home-glow home-glow-2" />
        <div className="home-grid" />
        {/* Floating code glyphs */}
        <span className="code-glyph" style={{ top: '22%', left: '8%', animationDelay: '0s' }}>{'</>'}</span>
        <span className="code-glyph" style={{ top: '35%', right: '10%', animationDelay: '1.2s' }}>{'{ }'}</span>
        <span className="code-glyph" style={{ bottom: '25%', left: '15%', animationDelay: '2.4s' }}>{'[ ]'}</span>
        <span className="code-glyph" style={{ top: '15%', right: '25%', animationDelay: '0.6s', fontSize: '3rem' }}>{'()'}</span>
      </div>

      <div className="home-container ">
        <div className="home-inner ">

          {/* ── Left: Text ── */}
          <div className={`home-text ${isVisible ? 'visible' : ''}`}>

            <div className="home-eyebrow">
              <span className="eyebrow-dot" />
              <span>Welcome to my world</span>
            </div>

            <h1 className="home-heading">
              Hi, I'm{' '}
              <span className="home-name">Ashok</span>
            </h1>

            <div className="home-role-wrap">
              <span className="home-role-prefix">a </span>
              <span className="home-role-text">
                {typedText}
                <span className="cursor" />
              </span>
            </div>

            <p className="home-bio">
              Crafting elegant solutions to complex problems. Turning caffeine into code 
              and ideas into reality. Master of the digital realm, wielding keyboards like katanas.
            </p>

            {/* Socials */}
            <div className="home-socials">
              <a href="https://github.com/Ashok-Dd" target="_blank" rel="noopener noreferrer" className="social-btn" title="GitHub">
                <Github size={18} />
              </a>
              <a href="https://linkedin.com/in/ashok-bongu" target="_blank" rel="noopener noreferrer" className="social-btn" title="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="mailto:bonguashok86@email.com" className="social-btn" title="Email">
                <Mail size={18} />
              </a>
            </div>

            {/* CTA */}
            <div className="home-ctas">
              <a href="/AshokResume .pdf" download className="btn-cta-primary">
                Download CV
              </a>
              <button
                className="btn-cta-outline"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Projects
              </button>
            </div>

            {/* Stats row */}
            <div className="home-stats">
              {[
                { num: '3+', label: 'Projects Built' },
                { num: '2+', label: 'Years Coding' },
                { num: '10+', label: 'Tech Mastered' },
              ].map((s) => (
                <div key={s.label} className="stat-item">
                  <span className="stat-num">{s.num}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Avatar ── */}
          {/* Paste this inside your Hero component where the avatar goes */}

          <div className={`home-avatar-wrap ${isVisible ? 'visible' : ''}`}>

            {/* Spinning orbit rings */}
            <div className="orbit-ring orbit-ring-1" />
            <div className="orbit-ring orbit-ring-2" />

            {/* Soft glow behind image */}
            <div className="avatar-halo" />

            {/* Circular frame — overflow:hidden clips image cleanly */}
            <div className="avatar-frame">
              <img
                src="/profile.png"
                alt="Ashok Bongu"
                className="avatar-img"
              />
            </div>

            {/* Floating code badges */}
            <div className="float-badge badge-top">
              <span className="badge-dot" />
              <span className="badge-text font-mono">const ninja = true</span>
            </div>
            <div className="float-badge badge-bot">
              <span className="badge-dot" />
              <span className="badge-text font-mono">{'<Coding />'}</span>
            </div>

            {/* Accent particles */}
            <div className="particle p1" />
            <div className="particle p2" />
            <div className="particle p3" />

          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <ArrowDown size={14} />
          <span>scroll</span>
        </div>
      </div>


    </section>
  );
};

export default Home;