import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Projects from './components/Projects';
import Skills from './components/Skills';
import ScrollIntro from './components/ScrollIntro';
import Living from './components/Living';
import Experience from './components/Experience';

/* everything after the Projects gate is fetched and mounted only once the gate is opened */
const Freelance = lazy(() => import('./components/Freelance'));
const Games = lazy(() => import('./components/Games'));
const LeetCodeSection = lazy(() => import('./components/LeetCodeSection'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));

const App = () => {
  const [unlocked, setUnlocked] = useState(false);
  const onOpenChange = useCallback((open) => setUnlocked(open), []);

  /* fetch the lower sections' code while the browser is idle, so opening the gate never waits on the network */
  useEffect(() => {
    const warm = () => {
      import('./components/Freelance');
      import('./components/Games');
      import('./components/LeetCodeSection');
      import('./components/Contact');
      import('./components/Footer');
    };
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1800));
    const id = idle(warm, { timeout: 4000 });
    return () => { (window.cancelIdleCallback || clearTimeout)(id); };
  }, []);

  /* newly mounted sections change the page height – let scroll triggers re-measure */
  useEffect(() => {
    if (!unlocked) return undefined;
    const ids = [setTimeout(() => ScrollTrigger.refresh(), 250), setTimeout(() => ScrollTrigger.refresh(), 1800)];
    return () => ids.forEach(clearTimeout);
  }, [unlocked]);

  return (
    <ThemeProvider>
      <Navbar />
      <Living />
      <ScrollIntro />
      <div id="home"><Home /></div>
      <div id="skills"><Skills /></div>
      <Experience />
      <div id="projects"><Projects onOpenChange={onOpenChange} /></div>
      {unlocked && (
        <Suspense fallback={null}>
          <Freelance />
          <Games />
          <div id="leetcode"><LeetCodeSection /></div>
          <div id="contact"><Contact /></div>
          <div id="footer"><Footer /></div>
        </Suspense>
      )}
    </ThemeProvider>
  );
};

export default App;
