import { useEffect } from 'react';
import { AnimatePresence, motion, useDragControls, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Github, Globe, Sparkles, X } from 'lucide-react';
import { ProjectCover } from './FloatingProjectCard';
import './projectUI.css';

const rise = (i) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.18 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] } });

/** the cover floats in 3D and leans toward the cursor */
const HeroCover = ({ project }) => {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sp = { stiffness: 160, damping: 18 };
  const rotateX = useSpring(useTransform(py, [0, 1], [14, -14]), sp);
  const rotateY = useSpring(useTransform(px, [0, 1], [-18, 18]), sp);
  return (
    <div
      className="pd-stage"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); px.set((e.clientX - r.left) / r.width); py.set((e.clientY - r.top) / r.height); }}
      onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
    >
      <span className="pd-halo" />
      <motion.div className="pd-tilt" style={{ rotateX, rotateY, transformPerspective: 900 }}
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
        <ProjectCover project={project} />
        <span className="pd-slab-num">{project.num}</span>
      </motion.div>
    </div>
  );
};

/** Bottom sheet with the full write-up. Pass `project` (normalised) or null to close. Drag the handle down to dismiss. */
const ProjectDetails = ({ project, onClose }) => {
  const drag = useDragControls();

  useEffect(() => {
    if (!project) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [project, onClose]);

  const parts = project?.links ?? [];
  const single = parts.length <= 1;

  return (
    <AnimatePresence>
      {project && (
        <motion.div className="fp-sheet-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <div className="fp-sheet-back" onClick={onClose} />
          <motion.aside
            key={project.id}
            className="pd-sheet"
            style={{ '--accent': project.accent }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 210, damping: 30 }}
            drag="y" dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, i) => { if (i.offset.y > 120 || i.velocity.y > 600) onClose(); }}
            role="dialog" aria-modal="true" aria-label={project.title}
          >
            <span className="pd-bar" />
            <span className="pd-aura" />
            <div className="pd-handle" onPointerDown={(e) => drag.start(e)}><i /></div>
            <button className="pd-x" onClick={onClose} aria-label="Close"><X size={16} /></button>

            <div className="pd-scroll">
              <div className="pd-grid">
                <div className="pd-left">
                  <HeroCover project={project} />
                  {project.stats.length > 0 && (
                    <motion.div className="pd-stats" {...rise(1)}>
                      {project.stats.map((s) => <div key={s.label}><b>{s.val}</b><small>{s.label}</small></div>)}
                    </motion.div>
                  )}
                </div>

                <div className="pd-right">
                  <motion.div className="pd-kicker" {...rise(0)}>
                    <i />{project.tag ?? 'Project'}<span>{project.num}</span>
                  </motion.div>
                  <motion.h3 className="pd-title" {...rise(1)}>{project.title}</motion.h3>
                  <motion.p className="pd-short" {...rise(2)}>{project.short}</motion.p>
                  <motion.p className="pd-text" {...rise(3)}>{project.longDesc}</motion.p>

                  {project.features.length > 0 && (
                    <motion.div {...rise(4)}>
                      <h4 className="pd-h"><Sparkles size={12} />Key features</h4>
                      <div className="pd-feats">
                        {project.features.map((f, i) => <div key={f}><em>{String(i + 1).padStart(2, '0')}</em>{f}</div>)}
                      </div>
                    </motion.div>
                  )}

                  {project.tech.length > 0 && (
                    <motion.div {...rise(5)}>
                      <h4 className="pd-h">Stack</h4>
                      <div className="pd-chips">{project.tech.map((t) => <span key={t}>{t}</span>)}</div>
                    </motion.div>
                  )}

                  <motion.div className="pd-actions" {...rise(6)}>
                    {parts.length === 0 && <p className="pd-soon">Case file coming soon.</p>}
                    {single && parts.length === 1 && (
                      <>
                        {parts[0].href && <a className="pd-btn ghost" href={parts[0].href} target="_blank" rel="noopener noreferrer"><Github size={16} />View code</a>}
                        {parts[0].live && <a className="pd-btn solid" href={parts[0].live} target="_blank" rel="noopener noreferrer"><Globe size={16} />Live demo<ArrowUpRight size={15} /></a>}
                      </>
                    )}
                    {!single && (
                      <div className="pd-parts">
                        {parts.map((l) => (
                          <div key={l.label} className="pd-part">
                            <span>{l.label}</span>
                            {l.href && <a href={l.href} target="_blank" rel="noopener noreferrer"><Github size={14} />Code</a>}
                            {l.live && <a className="live" href={l.live} target="_blank" rel="noopener noreferrer"><Globe size={14} />Live<ArrowUpRight size={13} /></a>}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetails;
