import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, Code2, Terminal } from 'lucide-react';

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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const currentRole = roles[currentIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

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
    <section className="min-h-screen mt-[-30px] bg-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Code Symbols */}
        <div className="absolute top-1/4 left-1/4 text-red-600/20 text-6xl font-mono animate-float">{'<>'}</div>
        <div className="absolute top-1/3 right-1/4 text-red-600/20 text-6xl font-mono animate-float-delayed">{'{}'}</div>
        <div className="absolute bottom-1/4 left-1/3 text-red-600/20 text-6xl font-mono animate-float">{'[]'}</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="min-h-screen flex flex-col-reverse lg:flex-row items-center justify-between gap-12 py-20">
          
          {/* Left Side - Text Content */}
          <div className={`flex-1 space-y-6 transition-all duration-1000 transform ${
            isVisible ? 'translate-x-0 opacity-100' : 'lg:-translate-x-20 opacity-0'
          }`}>
            
            <div className="space-y-2">
              <p className="text-red-500 text-lg font-medium tracking-wider animate-fade-in">
                WELCOME TO MY WORLD
              </p>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Hi, I'm <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">Ashok</span>
              </h1>
              
              <div className="text-3xl lg:text-4xl font-semibold text-gray-300 h-16 flex items-center">
                <span className="mr-2">a</span>
                <span className="text-red-500 border-r-2 border-red-500 pr-1 animate-blink">
                  {typedText}
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-lg leading-relaxed max-w-xl animate-fade-in-delayed">
              Crafting elegant solutions to complex problems. Turning caffeine into code and ideas into reality. 
              Master of the digital realm, wielding keyboards like katanas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/Ashok_Resume.pdf"
                download="Ashok_Resume.pdf"
                className="px-8 py-3 border-2 border-red-600 rounded-lg font-semibold transition-all duration-300 hover:bg-red-600/10 hover:scale-105 hover:shadow-lg hover:shadow-red-600/30"
                >
                Download CV
                </a>
            </div>

            
          </div>

          {/* Right Side - Image with Ninja Theme */}
          <div className={`flex-1 flex justify-center lg:justify-end transition-all duration-1000 delay-300 transform ${
            isVisible ? 'lg:translate-x-0 opacity-100' : 'lg:translate-x-20 opacity-0'
          }`}>
            <div className="relative group">
              {/* Glowing Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-red-800/20 to-black rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 animate-pulse"></div>
              
              {/* Hexagonal Border Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 rounded-full animate-spin-slow opacity-20"></div>
                
                {/* Main Image Container */}
                <div className="relative w-72 h-72 lg:w-96 lg:h-96 rounded-full border-4 border-red-600/50 overflow-hidden bg-gradient-to-br from-red-950/50 to-black backdrop-blur-sm group-hover:border-red-500 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-600/50">
                  
                  

                  {/* Uncomment and use this when you have your actual image */}
                  <img 
                    src="/profile.jpg" 
                    alt="Ashok - Code Ninja"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                {/* Floating Particles */}
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-red-400 rounded-full animate-ping delay-500"></div>
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-red-600 rounded-full animate-ping delay-1000"></div>
              </div>

              {/* Code Snippets Floating Around */}
              <div className="absolute -top-10 -left-10 bg-black/80 backdrop-blur-sm border border-red-600/30 rounded-lg px-4 py-2 font-mono text-sm text-red-500 animate-float hidden lg:block">
                const ninja = true;
              </div>
              <div className="absolute -bottom-10 -right-10 bg-black/80 backdrop-blur-sm border border-red-600/30 rounded-lg px-4 py-2 font-mono text-sm text-red-500 animate-float-delayed hidden lg:block">
                {'<Coding />'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fadeIn 1.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { border-color: transparent; }
          50% { border-color: rgb(239, 68, 68); }
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </section>
  );
};

export default Home;