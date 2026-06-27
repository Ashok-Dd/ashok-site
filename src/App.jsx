import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LeetCodeSection from './components/LeetCodeSection';

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <Navbar />
      <div id="home"><Home /></div>
      <div id="skills"><Skills /></div>
      <div id="projects"><Projects /></div>
      {/* <div id="leetcode"><LeetCodeSection /></div> */}
      <div id="contact"><Contact /></div>
      <div id="footer"><Footer /></div>
    </ThemeProvider>
  );
};

export default App;