import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import './projectUI.css';

/** image if the project has one, otherwise a cover generated from its accent colour + icon */
export const ProjectCover = ({ project }) => {
  const { Icon, image, accent, title } = project;
  return (
    <div className="fp-cover" style={{ '--accent': accent }}>
      {image ? <img src={image} alt={title} loading="lazy" /> : (
        <>
          <span className="fp-cover-grid" />
          <span className="fp-cover-glow" />
          {Icon && <Icon className="fp-cover-icon" size={64} strokeWidth={1.4} />}
        </>
      )}
    </div>
  );
};

/**
 * Floating card: perspective + depth layers, tilts toward the cursor, lifts and zooms on hover.
 * Click anywhere opens details; the GitHub button opens the repo.
 */
const FloatingProjectCard = ({ project, index = 0, onOpen }) => {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [11, -11]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-13, 13]), spring);
  const gx = useTransform(px, [0, 1], [0, 100]);
  const gy = useTransform(py, [0, 1], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.18), transparent 55%)`;

  const { title, short, tag, num, accent, tech, github } = project;

  const onMove = (e) => {
    if (reduced || e.pointerType === 'touch') return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  return (
    <motion.div
      className="fp-slot"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="fp-float"
        animate={reduced ? undefined : { y: [0, -9, 0] }}
        transition={{ duration: 5 + (index % 3), repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
      >
        <motion.article
          ref={ref}
          className="fp-card"
          style={{ '--accent': accent, rotateX, rotateY, transformPerspective: 1000 }}
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={{ scale: 0.99 }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onClick={() => onOpen?.(project)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(project); } }}
          role="button"
          tabIndex={0}
          aria-label={`Open ${title} details`}
        >
          <span className="fp-shadow" aria-hidden="true" />
          <motion.span className="fp-glare" style={{ background: glare }} aria-hidden="true" />

          <ProjectCover project={project} />
          <span className="fp-num">{num}</span>

          <div className="fp-body">
            {tag && <span className="fp-tag">{tag}</span>}
            <h3 className="fp-title">{title}</h3>
            <p className="fp-short">{short}</p>
            {tech.length > 0 && (
              <div className="fp-tech">
                {tech.slice(0, 4).map((t) => <span key={t}>{t}</span>)}
                {tech.length > 4 && <span className="fp-more">+{tech.length - 4}</span>}
              </div>
            )}
            <div className="fp-foot">
              {github ? (
                <a className="fp-gh" href={github} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} aria-label={`${title} on GitHub`}>
                  <Github size={14} /> GitHub
                </a>
              ) : <span className="fp-gh fp-gh-off">Private</span>}
              <span className="fp-open">Details <ArrowRight size={13} /></span>
            </div>
          </div>
        </motion.article>
      </motion.div>
    </motion.div>
  );
};

export default FloatingProjectCard;
