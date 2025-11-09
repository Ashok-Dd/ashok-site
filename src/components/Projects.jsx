import { useState, useEffect } from 'react';
import { ExternalLink, Github, Code2, Sparkles, Zap, Laptop } from 'lucide-react';

const Projects = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

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

    const element = document.getElementById('projects');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const projects = [
    {
      title: 'Student Dashboard',
      description: 'A comprehensive student management system with real-time analytics, Courses tracking, and with Admin panel. Built for educational institutions to streamline their operations.',
      tech: ['React', 'Node.js', 'MongoDB', 'TailwindCSS' , "Express.js"],
      icon: Laptop,
      color: 'from-red-600 to-orange-600',
      github: 'https://github.com/Ashok-Dd/student-dashboard',
      live: 'https://student-dashboard-two-sandy.vercel.app/',
      stats: {  rating: '4.8' }
    },
    {
        title: 'Code Space',
        description: 'Code Space is a web-based MERN project that allows users to save their code using a unique ID and retrieve it later by passing the ID as a parameter in the URL. It provides a simple and efficient way to store and share code snippets instantly.',
        tech: ['MongoDB', 'Express.js', 'React', 'Node.js' , 'TailwindCSS'],
        icon: Code2,
        color: 'from-red-500 to-orange-600',
        github: 'https://github.com/Ashok-Dd/code-space',
        live: 'https://code-space-beta-ten.vercel.app/',
        stats: {  rating: '4.7' }
    }

    
  ];

  return (
    <section id="projects" className="min-h-screen mt-[-30px] bg-black text-white relative overflow-hidden py-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Code Elements */}
        <div className="absolute top-20 left-10 text-red-600/10 text-8xl font-mono animate-float">&lt;/&gt;</div>
        <div className="absolute bottom-20 right-20 text-red-600/10 text-8xl font-mono animate-float-delayed">{ }</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-red-500 animate-pulse" />
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent">
              MY PROJECTS
            </h2>
            <Zap className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Crafted with precision, deployed with power. Each project is a masterpiece of code warfare.
          </p>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-red-600"></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-red-600"></div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative transition-all duration-700 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Glowing Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 animate-pulse`}></div>
                
                {/* Card */}
                <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-red-900/30 rounded-2xl p-6 h-full flex flex-col overflow-hidden group-hover:border-red-600/50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-600/20">
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-transparent animate-pulse"></div>
                  </div>

                  {/* Icon Header */}
                  <div className="relative mb-4 flex items-center justify-between">
                    <div className={`p-3 bg-gradient-to-br ${project.color} rounded-xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-2">
                      
                      <div className="px-3 py-1 bg-red-900/30 rounded-full border border-red-600/30 text-xs font-semibold text-red-400 flex items-center gap-1">
                        ⭐ {project.stats.rating}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="relative text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-red-400 group-hover:to-red-600 transition-all duration-300">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="relative text-gray-400 text-sm leading-relaxed mb-4 flex-grow group-hover:text-gray-300 transition-colors duration-300">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="relative flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-black/50 border border-red-900/40 rounded-lg text-xs font-mono text-red-400 group-hover:border-red-600/60 group-hover:bg-red-900/20 transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="relative flex gap-3">
                    <a
                      href={project.github}
                      target='_blank'
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 group/btn"
                    >
                      <Github className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      Code
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-600 rounded-lg font-semibold text-sm transition-all duration-300 hover:bg-red-600/10 hover:scale-105 group/btn"
                    >
                      <ExternalLink className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      Live
                    </a>
                  </div>

                  {/* Hover Indicator */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-full`}></div>
                </div>

                {/* Floating Particles */}
                {hoveredIndex === index && (
                  <>
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-red-400 rounded-full animate-ping delay-300"></div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </section>
  );
};

export default Projects;