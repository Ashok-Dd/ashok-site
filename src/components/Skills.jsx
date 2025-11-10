import { useState, useEffect } from 'react';
import { Flame, Code2, Server, Cpu, Brain, Wrench, Zap, X } from 'lucide-react';

const Skills = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayedSkills, setDisplayedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const skillsPerPage = 8;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('skills');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const categoriesData = [
    {
      id: 'frontend',
      name: 'Frontend',
      icon: Code2,
      skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'React Native'],
      angle: 0,
      color: 'rose-500'
    },
    {
      id: 'backend',
      name: 'Backend',
      icon: Server,
      skills: ['Node.js', 'Express', 'Socket.IO', 'MongoDB', 'PostgreSQL'],
      angle: 72,
      color: 'rose-500'
    },
    {
      id: 'languages',
      name: 'Languages',
      icon: Cpu,
      skills: ['C', 'Python', 'Java'],
      angle: 144,
      color: 'rose-500'
    },
    {
      id: 'ai',
      name: 'AI & Data',
      icon: Brain,
      skills: ['Machine Learning', 'Data Visualization', 'Data Analysis'],
      angle: 216,
      color: 'rose-500'
    },
    {
      id: 'tools',
      name: 'Tools',
      icon: Wrench,
      skills: ['Git', 'GitBash', 'VS Code', 'Postman', 'Firebase', 'Vercel'],
      angle: 288,
      color: 'rose-500'
    }
  ];

  const allSkills = categoriesData.flatMap(cat => 
    cat.skills.map(skill => ({ skill, category: cat.id, color: cat.color }))
  );

  useEffect(() => {
    setCurrentPage(1);
    if (selectedCategory === 'all') {
      setDisplayedSkills(allSkills);
    } else {
      const category = categoriesData.find(cat => cat.id === selectedCategory);
      if (category) {
        setDisplayedSkills(
          category.skills.map(skill => ({ skill, category: category.id, color: category.color }))
        );
      }
    }
  }, [selectedCategory]);

  const totalPages = Math.ceil(displayedSkills.length / skillsPerPage);
  const startIndex = (currentPage - 1) * skillsPerPage;
  const endIndex = startIndex + skillsPerPage;
  const currentSkills = displayedSkills.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <section 
      id="skills" 
      className="min-h-screen bg-black mt-[-30px] text-white relative overflow-hidden py-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Energy Grid Lines */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-8 lg:mb-12 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-10 h-10 text-red-500 animate-pulse" />
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
              SKILLS
            </h2>
            <Flame className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <p className="text-red-300/80 text-lg">
            Click the center or any node to explore
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Left Side - Chakra */}
          <div className={`flex justify-center transition-all duration-1000 delay-200 transform ${
            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}>
            <div className="relative w-[500px] h-[500px]">
              {/* Outer Ring */}
              <div className="absolute inset-0 border-2 border-red-600/30 rounded-full"></div>
              <div className="absolute inset-8 border-2 border-red-600/20 rounded-full"></div>
              <div className="absolute inset-16 border-2 border-red-600/10 rounded-full"></div>

              {/* Center Node - SKILLS */}
              <div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 ${selectedCategory === 'all' ? 'scale-110' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                {/* Hexagon */}
                <div 
                  className={`relative w-32 h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center border-4 transition-all duration-300 group-hover:scale-110 ${
                    selectedCategory === 'all' ? 'border-red-300 shadow-2xl shadow-red-500/50' : 'border-red-400/50'
                  }`}
                  style={{
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                  }}
                >
                  <div className="text-center">
                    <Zap className="w-10 h-10 text-white mx-auto mb-1 animate-pulse" />
                    <p className="text-white font-bold text-sm">SKILLS</p>
                  </div>
                </div>
              </div>

              {/* Category Nodes */}
              {categoriesData.map((category, idx) => {
                const Icon = category.icon;
                
                return (
                  <div
                    key={category.id}
                    className={`absolute top-1/2 left-1/2 cursor-pointer group transition-all duration-700 delay-${(idx + 3) * 100} transform ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                    } ${selectedCategory === category.id ? 'scale-110 z-10' : ''}`}
                    style={{
                      animation: `revolve 20s linear infinite`,
                      animationDelay: `${-idx * 4}s`,
                      transform: selectedCategory === category.id ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {/* Hexagon */}
                    <div 
                      className={`relative w-24 h-24 bg-gradient-to-br from-${category.color} to-red-900 flex flex-col items-center justify-center border-4 transition-all duration-300 group-hover:scale-110 ${
                        selectedCategory === category.id ? 'border-red-300 shadow-2xl shadow-red-500/50' : 'border-red-400/30'
                      }`}
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                        animation: 'counterRevolve 20s linear infinite',
                        animationDelay: `${-idx * 4}s`
                      }}
                    >
                      <Icon className="w-7 h-7 text-white mb-1" />
                      <p className="text-white font-semibold text-[10px] text-center leading-tight">{category.name}</p>
                    </div>

                    {/* Selection pulse */}
                    {selectedCategory === category.id && (
                      <div className="absolute inset-0 border-4 border-red-400 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Spilling Skills */}
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative bg-gradient-to-br from-red-950/20 to-black/40 backdrop-blur-sm border-2 border-red-600/30 rounded-3xl p-8 min-h-[500px]">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    {selectedCategory === 'all' ? 'All Skills' : categoriesData.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-red-400/60 text-sm mt-1">{displayedSkills.length} skills mastered</p>
                </div>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-2 gap-3">
                {currentSkills.map((item, idx) => (
                  <div
                    key={`${item.category}-${idx}`}
                    className="relative group animate-spillIn"
                    style={{ 
                      animationDelay: `${idx * 0.05}s`,
                      opacity: 0,
                      animation: `spillIn 0.4s ease-out ${idx * 0.05}s forwards`
                    }}
                  >
                    <div className={`absolute inset-0 bg-${item.color} blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300`}></div>
                    <div className={`relative bg-black/60 border-2 border-red-900/50 rounded-xl px-4 py-3 text-center group-hover:border-${item.color} transition-all duration-300 transform group-hover:scale-105 group-hover:-translate-y-1`}>
                      <p className="text-red-200 font-semibold text-sm group-hover:text-white transition-colors">
                        {item.skill}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Desktop */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-900/50 hover:border-red-600 transition-all"
                  >
                    ←
                  </button>
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx + 1)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentPage === idx + 1
                          ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/50 scale-110'
                          : 'bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-900/50 hover:border-red-600'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-900/50 hover:border-red-600 transition-all"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {/* Chakra at Top */}
          <div className={`flex justify-center transition-all duration-1000 delay-200 transform ${
            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}>
            <div className="relative w-[320px] h-[320px]">
              {/* Rings */}
              <div className="absolute inset-0 border-2 border-red-600/30 rounded-full"></div>
              <div className="absolute inset-6 border-2 border-red-600/20 rounded-full"></div>

              {/* Center Node */}
              <div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${selectedCategory === 'all' ? 'scale-110' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <div 
                  className={`relative w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center border-4 ${
                    selectedCategory === 'all' ? 'border-red-300' : 'border-red-400/50'
                  }`}
                  style={{
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                  }}
                >
                  <div className="text-center">
                    <Zap className="w-6 h-6 text-white mx-auto animate-pulse" />
                    <p className="text-white font-bold text-[8px]">SKILLS</p>
                  </div>
                </div>
              </div>

              {/* Category Nodes */}
              {categoriesData.map((category, idx) => {
                const Icon = category.icon;
                
                return (
                  <div
                    key={category.id}
                    className={`absolute top-1/2 left-1/2 cursor-pointer group transition-all duration-700 delay-${(idx + 3) * 100} ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    } ${selectedCategory === category.id ? 'scale-110 z-10' : ''}`}
                    style={{
                      animation: `revolve 20s linear infinite`,
                      animationDelay: `${-idx * 4}s`,
                      transform: selectedCategory === category.id ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className={`absolute inset-0 bg-${category.color} blur-lg opacity-50 scale-110`}></div>
                    <div 
                      className={`relative w-16 h-16 bg-gradient-to-br from-${category.color} to-red-900 flex flex-col items-center justify-center border-3 ${
                        selectedCategory === category.id ? 'border-red-300' : 'border-red-400/30'
                      }`}
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                        animation: 'counterRevolve 20s linear infinite',
                        animationDelay: `${-idx * 4}s`
                      }}
                    >
                      <Icon className="w-5 h-5 text-white mb-0.5" />
                      <p className="text-white font-bold text-[8px] text-center">{category.name}</p>
                    </div>
                    {selectedCategory === category.id && (
                      <div className="absolute inset-0 border-3 border-red-400 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills Below - Mobile */}
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative bg-gradient-to-br from-red-950/20 to-black/40 backdrop-blur-sm border-2 border-red-600/30 rounded-2xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    {selectedCategory === 'all' ? 'All Skills' : categoriesData.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-red-400/60 text-xs mt-1">{displayedSkills.length} skills</p>
                </div>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {currentSkills.map((item, idx) => (
                  <div
                    key={`${item.category}-${idx}`}
                    className="relative group"
                    style={{ 
                      animationDelay: `${idx * 0.05}s`,
                      opacity: 0,
                      animation: `spillIn 0.4s ease-out ${idx * 0.05}s forwards`
                    }}
                  >
                    <div className={`absolute inset-0 bg-${item.color} blur-sm opacity-0 group-hover:opacity-40 transition-opacity`}></div>
                    <div className={`relative bg-black/60 border-2 border-red-900/50 rounded-lg px-3 py-2 text-center`}>
                      <p className="text-red-200 font-semibold text-xs">
                        {item.skill}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Mobile */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    ←
                  </button>
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === idx + 1
                          ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/50'
                          : 'bg-red-900/30 border border-red-700/50 text-red-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`mt-16 flex justify-center gap-12 transition-all duration-1000 delay-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">
              {allSkills.length}
            </div>
            <div className="text-red-300/60 text-sm font-medium">Total Skills</div>
          </div>
          <div className="w-px bg-gradient-to-b from-transparent via-red-600/50 to-transparent"></div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">
              {categoriesData.length}
            </div>
            <div className="text-red-300/60 text-sm font-medium">Categories</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spillIn {
          from {
            opacity: 0;
            transform: translateX(-30px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes revolve {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(180px) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(180px) rotate(-360deg);
          }
        }
        
        @keyframes counterRevolve {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 1024px) {
          @keyframes revolve {
            0% {
              transform: translate(-50%, -50%) rotate(0deg) translateX(110px) rotate(0deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(360deg) translateX(110px) rotate(-360deg);
            }
          }
        }
      `}</style>
    </section>
  );
};

export default Skills;