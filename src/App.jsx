
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Projects from './components/Projects';
import Skills from './components/Skills';
import ScrollIntro from './components/ScrollIntro';
import Living from './components/Living';
import Experience from './components/Experience';
import Freelance from './components/Freelance';
import Games from './components/Games';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LeetCodeSection from './components/LeetCodeSection';

const App = () => {

  return (
    <ThemeProvider>
      <Navbar />
      <Living />
      <ScrollIntro />
      <div id="home"><Home /></div>
      <div id="skills"><Skills /></div>
      <Experience />
      <div id="projects"><Projects /></div>
      <Freelance />
      <Games />
      <div id="leetcode"><LeetCodeSection /></div>
      <div id="contact"><Contact /></div>
      <div id="footer"><Footer /></div>
    </ThemeProvider>
  );
};

export default App;