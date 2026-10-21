import { useEffect } from 'react';

/**
 * 3D tilt + cursor spotlight for every element matching `selector` inside `rootRef`.
 * Writes --rx / --ry / --mx / --my on the element; CSS decides how to use them.
 */
export default function useTilt(rootRef, selector, max = 9) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;

    const move = (e) => {
      const el = e.target.closest?.(selector);
      if (!el || !root.contains(el)) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', `${((0.5 - py) * max).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((px - 0.5) * max).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    };
    const leave = (e) => {
      const el = e.target;
      if (!el.matches?.(selector)) return;
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerout', leave);
    return () => {
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerout', leave);
    };
  }, [rootRef, selector, max]);
}
