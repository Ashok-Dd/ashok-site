import { useState, useEffect } from 'react';
import { Github, Instagram, Mail, Linkedin, MessageCircle, Flame, Zap } from 'lucide-react';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setIsVisible(true)),
      { threshold: 0.1 }
    );

    const element = document.getElementById('contact');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const contactData = [
    { id: 'github', name: 'GitHub', username: '@Ashok-Dd', link: 'https://github.com/Ashok-Dd', icon: Github, color: 'rose-500' },
    { id: 'linkedin', name: 'LinkedIn', username: 'Bongu Ashok', link: 'https://linkedin.com/in/ashok-bongu', icon: Linkedin, color: 'rose-500' },
    { id: 'instagram', name: 'Instagram', username: '@ashok_devil_123', link: 'https://instagram.com/ashok_devil_123', icon: Instagram, color: 'rose-500' },
    { id: 'email', name: 'Email', username: 'bonguashok86@email.com', link: 'mailto:bonguashok86@email.com', icon: Mail, color: 'rose-500' },
    { id: 'whatsapp', name: 'WhatsApp', username: '+9392954525', link: 'https://wa.me/9392954525', icon: MessageCircle, color: 'rose-500' }
  ];

  return (
    <section
      id="contact"
      className="min-h-[70vh] bg-black text-white relative overflow-hidden py-16 lg:py-20 flex items-center"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/30 to-black"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Faint grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="contactGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contactGrid)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 relative z-10 w-full">
        {/* Header */}
        <div
          className={`text-center mb-10 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Flame className="w-8 h-8 text-red-500 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
              GET IN TOUCH
            </h2>
            <Flame className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <p className="text-red-300/80 text-base lg:text-lg">Let's create something amazing together</p>
        </div>

        {/* Contact Cards */}
        <div
          className={`transition-all duration-1000 delay-200 transform ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-red-950/30 via-black/60 to-red-950/30 backdrop-blur-xl border-2 border-red-600/30 rounded-3xl p-8 lg:p-12 shadow-2xl shadow-red-900/30">

            {/* CONNECT Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/40 border border-red-600/30 rounded-full mb-4">
                <Zap className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="text-red-400 font-semibold text-sm">CONNECT WITH ME</span>
                <Zap className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {contactData.map((contact, idx) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.id}
                    href={contact.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredCard(contact.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`group relative transition-all duration-500 delay-${(idx + 1) * 100} transform ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                  >
                    <div className="relative overflow-hidden">
                      {/* Card container */}
                      <div className="relative bg-black/60 backdrop-blur-sm border-1 border-red-900/40 rounded-2xl p-5 lg:p-6 group-hover:border-red-500/60 transition-all duration-500">

                        {/* Starfield on hover */}
                        {hoveredCard === contact.id && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-[2px] h-[2px] bg-white rounded-full animate-star"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${i * 0.001}s`,
                                  animationDuration: `${0.5 + Math.random()}s`
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Icon Box — rotates slightly on hover */}
                        <div className="relative mb-4 flex justify-center">
                          <div
                            className={`relative bg-gradient-to-br from-${contact.color} to-red-900 w-14 h-14 rounded-xl flex items-center justify-center border-1 border-${contact.color}/30 transition-all duration-500 group-hover:rotate-[12deg] group-hover:scale-110 group-hover:border-${contact.color}`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                        </div>

                        {/* Text */}
                        <div className="text-center">
                          <h3 className={`text-lg font-semibold text-${contact.color} mb-1`}>{contact.name}</h3>
                          <p className="text-red-300/60 text-xs font-mono truncate">{contact.username}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-600/50"></div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-red-600/30 rounded-full">
                {/* <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> */}
                <span className="text-red-400 text-xs font-medium animate-pulse">Available for opportunities</span>
              </div>
              <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-600/50"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes star {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-6px) scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: translateY(6px) scale(0.9);
            opacity: 1;
          }
        }
        .animate-star {
          animation: star 2s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
};

export default Contact;
