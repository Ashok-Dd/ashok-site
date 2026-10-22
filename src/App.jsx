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

  /* newly mounted sections change the page height – let scroll triggers re-measure */
  useEffect(() => {
    if (!unlocked) return undefined;
    const id = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(id);
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
