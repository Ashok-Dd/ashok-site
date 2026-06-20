import { useState, useEffect, useRef } from 'react';
import { ArrowDown, Download, FolderOpen } from 'lucide-react';
import gsap from 'gsap';
import { roles, heroData, SOCIALS } from '../../data';
import { useTheme } from '../context/ThemeContext';

const HERO_SOCIAL_IDS = ['github', 'linkedin', 'email'];

const THEME_PROFILE = {
  cyberpunk: '/profile-cyber.png',
  synthwave: '/profile-pink.png',
  retro:     '/profile-green.png',
};

const Home = () => {
  const { theme } = useTheme();
  const profileImage = THEME_PROFILE[theme] || heroData.profileImage;
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef(null);

  /* ── Typing animation ── */
  useEffect(() => {
    const currentRole = roles[currentIndex];
    const speed = isDeleting ? 50 : 100;

    if (!isDeleting && typedText === currentRole) {
      const t = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (isDeleting && typedText === '') {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % roles.length);
      return;
    }

    const t = setTimeout(() => {
      setTypedText(
        isDeleting
          ? currentRole.substring(0, typedText.length - 1)
          : currentRole.substring(0, typedText.length + 1)
      );
    }, speed);

    return () => clearTimeout(t);
  }, [typedText, isDeleting, currentIndex]);

  /* ── GSAP intro animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Make text container visible; GSAP animates children */
      gsap.set('.home-text', { opacity: 1, x: 0 });

      const tl = gsap.timeline({ delay: 0.25, defaults: { ease: 'power3.out' } });

      tl
        .fromTo('.hero-eyebrow-wrap',
          { y: -28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 })
        .fromTo('.hero-h1',
          { y: 60, opacity: 0, skewY: 1.5 },
          { y: 0, opacity: 1, skewY: 0, duration: 0.9 },
          '-=0.4')
        .fromTo('.hero-role-wrap',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          '-=0.6')
        .fromTo('.hero-bio-p',
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55 },
          '-=0.45')
        .fromTo('.hero-soc-wrap',
          { x: -18, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5 },
          '-=0.38')
        .fromTo('.hero-cta-wrap',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.35')
        .fromTo('.hero-stats-wrap',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.32')
        .fromTo('.home-avatar-wrap',
          { scale: 0.72, opacity: 0, y: 32 },
          { scale: 1, opacity: 1, y: 0, duration: 1.15, ease: 'back.out(1.2)' },
          '-=1.4')
        .fromTo('.hero-scroll-hint',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.35');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroSocials = SOCIALS.filter((s) => HERO_SOCIAL_IDS.includes(s.id));

  return (
    <section id="home" ref={containerRef} className="portfolio-home">

      {/* ── Background ── */}
      <div className="home-bg">
        <div className="home-glow home-glow-1" />
        <div className="home-glow home-glow-2" />
        <div className="home-grid" />
        <span className="code-glyph" style={{ top: '22%', left: '8%', animationDelay: '0s' }}>{'</>'}</span>
        <span className="code-glyph" style={{ top: '35%', right: '10%', animationDelay: '1.2s' }}>{'{ }'}</span>
        <span className="code-glyph" style={{ bottom: '25%', left: '15%', animationDelay: '2.4s' }}>{'[ ]'}</span>
        <span className="code-glyph" style={{ top: '15%', right: '25%', animationDelay: '0.6s', fontSize: '3rem' }}>{'()'}</span>
      </div>

      <div className="home-container">
        <div className="home-inner">

          {/* ── LEFT: Text ── */}
          <div className="home-text">

            {/* Eyebrow */}
            <div className="hero-eyebrow-wrap home-eyebrow">
              <span className="eyebrow-dot" />
              <span>{heroData.eyebrow}</span>
              {heroData.availableText && (
                <span className="hero-available-badge">
                  <span className="hero-avail-dot" />
                  {heroData.availableText}
                </span>
              )}
            </div>

            {/* Heading */}
            <h1 className="hero-h1 home-heading">
              Hi, I&apos;m{' '}
              <span className="home-name">{heroData.name}</span>
            </h1>

            {/* Typing role */}
            <div className="hero-role-wrap home-role-wrap">
              <span className="home-role-prefix">a </span>
              <span className="home-role-text">
                {typedText}
                <span className="cursor" />
              </span>
            </div>

            {/* Bio */}
            <p className="hero-bio-p home-bio">{heroData.bio}</p>

            {/* Social buttons */}
            <div className="hero-soc-wrap home-socials">
              {heroSocials.map(({ id, Icon, href, label }) => (
                <a
                  key={id}
                  href={href}
                  target={id !== 'email' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="social-btn"
                  title={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            {/* CTAs */}
            <div className="hero-cta-wrap home-ctas">
              <a href={heroData.cvUrl} download className="btn-cta-primary">
                <Download size={15} />
                Download CV
              </a>
              <button
                className="btn-cta-outline"
                onClick={() =>
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <FolderOpen size={15} />
                View Projects
              </button>
            </div>

            {/* Stats */}
            <div className="hero-stats-wrap home-stats">
              {heroData.stats.map((s) => (
                <div key={s.label} className="stat-item">
                  <span className="stat-num">{s.num}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Avatar ── */}
          <div className="home-avatar-wrap">
            <div className="orbit-ring orbit-ring-1" />
            <div className="orbit-ring orbit-ring-2" />
            <div className="avatar-halo" />
            <div className="avatar-frame">
              <img src={profileImage} alt={heroData.name} className="avatar-img" />
            </div>
            {heroData.badges.map((b) => (
              <div key={b.text} className={`float-badge badge-${b.pos}`}>
                <span className="badge-dot" />
                <span className="badge-text font-mono">{b.text}</span>
              </div>
            ))}
            <div className="particle p1" />
            <div className="particle p2" />
            <div className="particle p3" />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint scroll-hint">
          <ArrowDown size={14} />
          <span>scroll</span>
        </div>
      </div>
    </section>
  );
};

export default Home;
