import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ArrowDown } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshWobbleMaterial } from '@react-three/drei';

const Home = () => {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const roles = [
    'Full Stack Developer',
    'Code Ninja',
    'Problem Solver',
    'Tech Enthusiast'
  ];

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
    <section id="home" className="portfolio-home mt-40 md:mt-0">
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

      <div className="home-container">
        <div className="home-inner">

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
              <a href="/AshokResume.pdf" download className="btn-cta-primary">
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
          <div className={`home-avatar-wrap ${isVisible ? 'visible' : ''}`}>
            {/* Outer orbit rings */}
            <div className="orbit-ring orbit-ring-1" />
            <div className="orbit-ring orbit-ring-2" />

            {/* Glowing halo */}
            <div className="avatar-halo" />

            {/* 3D Torus instead of image */}
            <div className="avatar-frame">
              <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <mesh rotation={[0.5, 1, 0]}>
                  <torusGeometry args={[1, 0.4, 32, 64]} />
                  <MeshWobbleMaterial color="#1ABC9C" speed={1} factor={0.6} />
                </mesh>
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
              </Canvas>
            </div>

            {/* Floating badges */}
            <div className="float-badge badge-top">
              <span className="badge-dot" />
              <span className="badge-text font-mono">const ninja = true</span>
            </div>
            <div className="float-badge badge-bot">
              <span className="badge-dot" />
              <span className="badge-text font-mono">{'<Coding />'}</span>
            </div>

            {/* Particle dots */}
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600&family=Share+Tech+Mono&display=swap');

        .portfolio-home {
          min-height: 100vh;
          background-color: #1E1E2F;
          color: #F5F5F7;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Background */
        .home-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .home-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .home-glow-1 {
          width: 500px; height: 500px;
          top: -100px; left: -100px;
          background: rgba(26,188,156,0.07);
          animation: pulse 6s ease-in-out infinite;
        }
        .home-glow-2 {
          width: 400px; height: 400px;
          bottom: -80px; right: -80px;
          background: rgba(26,188,156,0.05);
          animation: pulse 8s ease-in-out infinite 2s;
        }
        .home-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(26,188,156,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,188,156,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .code-glyph {
          position: absolute;
          font-family: 'Share Tech Mono', monospace;
          font-size: 4rem;
          color: rgba(26,188,156,0.06);
          animation: floatGlyph 5s ease-in-out infinite;
          user-select: none;
        }

        /* Layout */
        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .home-inner {
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          gap: 48px;
          padding: 80px 0 40px;
        }
        @media (min-width: 1024px) {
          .home-inner {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 64px;
          }
        }

        /* Text Side */
        .home-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          opacity: 0;
          transform: translateX(-32px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .home-text.visible { opacity: 1; transform: translateX(0); }

        .home-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #1ABC9C;
        }
        .eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1ABC9C;
          box-shadow: 0 0 8px rgba(26,188,156,0.6);
          animation: pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .home-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #F5F5F7;
        }
        .home-name {
          background: linear-gradient(135deg, #1ABC9C, #4DD9BC);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .home-role-wrap {
          font-family: 'Inter', sans-serif;
          font-size: clamp(1.25rem, 3vw, 2rem);
          font-weight: 500;
          color: #A0A0B0;
          min-height: 2.5rem;
          display: flex;
          align-items: center;
        }
        .home-role-prefix { margin-right: 6px; }
        .home-role-text {
          color: #F5F5F7;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
        .cursor {
          display: inline-block;
          width: 2px; height: 1.2em;
          background: #1ABC9C;
          border-radius: 1px;
          animation: cursorBlink 0.9s step-end infinite;
          box-shadow: 0 0 6px rgba(26,188,156,0.5);
        }

        .home-bio {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          line-height: 1.75;
          color: #A0A0B0;
          max-width: 520px;
        }

        /* Socials */
        .home-socials {
          display: flex;
          gap: 12px;
        }
        .social-btn {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(26,188,156,0.25);
          background: rgba(26,188,156,0.06);
          color: #1ABC9C;
          transition: all 0.25s ease;
          text-decoration: none;
        }
        .social-btn:hover {
          background: rgba(26,188,156,0.15);
          border-color: rgba(26,188,156,0.5);
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(26,188,156,0.2);
          color: #4DD9BC;
        }

        /* CTAs */
        .home-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .btn-cta-primary {
          padding: 12px 28px;
          background: linear-gradient(135deg, #1ABC9C, #148F77);
          color: #1E1E2F;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 10px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(26,188,156,0.35);
        }
        .btn-cta-outline {
          padding: 12px 28px;
          background: transparent;
          color: #1ABC9C;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          border-radius: 10px;
          border: 1.5px solid rgba(26,188,156,0.5);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-cta-outline:hover {
          background: rgba(26,188,156,0.08);
          border-color: #1ABC9C;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(26,188,156,0.15);
        }

        /* Stats */
        .home-stats {
          display: flex;
          gap: 28px;
          padding-top: 8px;
          border-top: 1px solid rgba(26,188,156,0.1);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stat-num {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          color: #1ABC9C;
          line-height: 1;
        }
        .stat-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6B6B80;
        }

        /* Avatar Side */
        .home-avatar-wrap {
          position: relative;
          width: 300px; height: 300px;
          flex-shrink: 0;
          opacity: 0;
          transform: translateX(32px);
          transition: opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s;
        }
        @media (min-width: 1024px) {
          .home-avatar-wrap { width: 380px; height: 380px; }
        }
        .home-avatar-wrap.visible { opacity: 1; transform: translateX(0); }

        .orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(26,188,156,0.12);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: spinSlow 20s linear infinite;
        }
        .orbit-ring-1 {
          width: 110%; height: 110%;
          border-style: dashed;
          border-color: rgba(26,188,156,0.08);
        }
        .orbit-ring-2 {
          width: 125%; height: 125%;
          animation-direction: reverse;
          animation-duration: 30s;
        }

        .avatar-halo {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,188,156,0.12) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }

        .avatar-frame {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(26,188,156,0.35);
          background: #252538;
          box-shadow:
            0 0 0 6px rgba(26,188,156,0.06),
            0 24px 64px rgba(0,0,0,0.5);
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .avatar-frame:hover {
          border-color: rgba(26,188,156,0.7);
          box-shadow:
            0 0 0 8px rgba(26,188,156,0.1),
            0 0 40px rgba(26,188,156,0.2),
            0 24px 64px rgba(0,0,0,0.5);
        }
        .avatar-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26,188,156,0.08) 0%, transparent 50%);
        }

        /* Floating badges */
        .float-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(22, 22, 42, 0.9);
          border: 1px solid rgba(26,188,156,0.25);
          border-radius: 8px;
          padding: 8px 14px;
          backdrop-filter: blur(8px);
        }
        .badge-top {
          top: 0; left: -60px;
          animation: floatBadge 3.5s ease-in-out infinite;
        }
        .badge-bot {
          bottom: 0; right: -60px;
          animation: floatBadge 4.5s ease-in-out infinite 1s;
        }
        @media (max-width: 1023px) {
          .badge-top, .badge-bot { display: none; }
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1ABC9C;
          box-shadow: 0 0 6px rgba(26,188,156,0.7);
          animation: pulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .badge-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          color: #1ABC9C;
          white-space: nowrap;
        }

        /* Particle dots */
        .particle {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #1ABC9C;
          animation: pingParticle 2s ease-in-out infinite;
        }
        .p1 { top: 0; right: 10%; animation-delay: 0s; }
        .p2 { bottom: 5%; left: 5%; animation-delay: 0.5s; width: 6px; height: 6px; }
        .p3 { top: 50%; left: -2%; animation-delay: 1s; width: 5px; height: 5px; }

        /* Scroll hint */
        .scroll-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding-bottom: 32px;
          color: #6B6B80;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          animation: floatGlyph 2.5s ease-in-out infinite;
        }

        /* Keyframes */
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes floatGlyph {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spinSlow {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pingParticle {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.8); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
};

export default Home;