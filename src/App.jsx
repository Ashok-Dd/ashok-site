import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Home from './components/Home';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = ['Home', 'Projects', 'Skills', 'Contact'];

  const scrollToSection = (item) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(item.toLowerCase());
    if (element) {
      const headerOffset = 80; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
    <header className="bg-black text-white shadow-2xl sticky top-0 z-50 border-b-2 border-red-600/40">
      <div className="max-w-full px-10">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <h1
              className="relative text-3xl font-extrabold tracking-wider 
              bg-gradient-to-r from-red-600 via-red-300 to-red-600 
              bg-[length:200%_auto] text-transparent bg-clip-text 
              animate-gradient-move animate-float-soft
              hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(255,80,80,0.8)]
              transition-all duration-500 cursor-pointer select-none"
            >
              ASHOK
            </h1>
        </div>



          {/* Right side - Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="relative px-2 py-2 text-sm font-medium text-gray-300 transition-colors duration-300 hover:text-red-500 group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-red-900/30 transition-colors text-red-500"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-1 border-t border-red-900/20">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-300 transition-all duration-300 hover:text-red-500 hover:bg-red-900/10 hover:pl-6"
              >
                {item}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
    <div id="home">
      <Home />
    </div>
    <div id="projects">
      <Projects />
    </div>
    <div id="skills">
      <Skills />
    </div>
    <div id="contact">
      <Contact />
    </div>

    </>
  );
};

export default App;