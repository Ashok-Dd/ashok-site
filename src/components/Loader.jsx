import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const Loader = ({ onComplete }) => {
  const topRef = useRef();
  const botRef = useRef();
  const counterRef = useRef();
  const nameRef = useRef();
  const lineRef = useRef();
  const tagRef = useRef();


  const [animationDone, setAnimationDone] = useState(false);



  useEffect(() => {
    if (!document.getElementById("loader-font")) {
      const l = document.createElement("link");
      l.id = "loader-font";
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500&display=swap";
      document.head.appendChild(l);
    }

    const letters = nameRef.current.querySelectorAll(".l-char");
    const counter = counterRef.current;

    gsap.set([topRef.current, botRef.current], { yPercent: 0 });
    gsap.set(letters, { yPercent: 120, opacity: 0 });
    gsap.set(lineRef.current, { scaleX: 0 });
    gsap.set(tagRef.current, { opacity: 0, y: 12 });

    const tl = gsap.timeline();

    tl.to({}, {
      duration: 2,
      onUpdate() {
        const val = Math.round(this.progress() * 100);
        counter.textContent = String(val).padStart(3, "0");
      },
    })
    .to(counter, { opacity: 0, y: -20, duration: 0.3 })
    .to(lineRef.current, { scaleX: 1, duration: 0.5 })
    .to(letters, {
      yPercent: 0,
      opacity: 1,
      stagger: 0.05,
      duration: 0.6,
    })
    .to(tagRef.current, { opacity: 1, y: 0, duration: 0.4 })
    .to({}, { duration: 0.6 })
    .to(letters, {
      yPercent: -120,
      opacity: 0,
      stagger: 0.04,
      duration: 0.4,
    })
    .to(lineRef.current, { scaleX: 0, duration: 0.3 })
    .to(topRef.current, { yPercent: -100, duration: 0.3 })
    .to(botRef.current, {
      yPercent: 100,
      duration: 0.8,
      onComplete: () => setAnimationDone(true),
    });

  }, []);

  useEffect(() => {
    if (animationDone) {
      onComplete();
    }
  }, [animationDone]);

  const NAME = "ASHOK";

  return (
    <>
      <style>{`
        .loader-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          font-family: 'Inter', sans-serif;
        }
        .l-panel {
          position: absolute;
          left: 0; right: 0;
          height: 50%;
          background: #1E1E2F;
          z-index: 2;
        }
        .l-panel-top {
          top: 0;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,188,156,0.08) 0%, #1E1E2F 70%);
        }
        .l-panel-bot {
          bottom: 0;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(26,188,156,0.06) 0%, #1E1E2F 70%);
        }
        .l-center {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .l-counter {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(5rem, 14vw, 12rem);
          font-weight: 900;
          letter-spacing: -0.06em;
          line-height: 1;
          color: rgba(26,188,156,0.06);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          user-select: none;
        }
        .l-line {
          width: clamp(200px, 30vw, 400px);
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26,188,156,0.5), transparent);
          margin-bottom: 28px;
        }
        .l-name {
          display: flex;
          align-items: center;
          overflow: hidden;
          line-height: 1;
          margin-bottom: 20px;
        }
        .l-char {
          display: inline-block;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(4rem, 11vw, 10rem);
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #F5F5F7;
          will-change: transform;
        }
        .l-char.accent {
          color: #1ABC9C;
        }
        .l-tag {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(245,245,247,0.25);
          font-family: 'Inter', sans-serif;
        }
        .l-corner {
          position: absolute;
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(245,245,247,0.12);
          font-family: 'Inter', sans-serif;
          z-index: 4;
        }
        .l-corner-tl { top: 32px; left: 40px; }
        .l-corner-tr { top: 32px; right: 40px; text-align: right; }
        .l-corner-bl { bottom: 32px; left: 40px; }
        .l-corner-br { bottom: 32px; right: 40px; text-align: right; }
        .l-vline {
          position: absolute;
          top: 0; bottom: 0;
          left: 50%;
          width: 1px;
          background: rgba(26,188,156,0.04);
          z-index: 1;
        }
        .l-divider {
          position: absolute;
          left: 0; right: 0;
          top: 50%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26,188,156,0.12), transparent);
          z-index: 5;
        }
      `}</style>

      <div className="loader-root">
        <div ref={topRef} className="l-panel l-panel-top">
          <div className="l-vline" />
          <span className="l-corner l-corner-tl">Portfolio</span>
          <span className="l-corner l-corner-tr">2025</span>
        </div>
        <div className="l-divider" />
        <div ref={botRef} className="l-panel l-panel-bot">
          <div className="l-vline" />
          <span className="l-corner l-corner-bl">Full Stack Dev</span>
          <span className="l-corner l-corner-br">India</span>
        </div>
        <div className="l-center">
          <div ref={counterRef} className="l-counter">000</div>
          <div ref={lineRef} className="l-line" />
          <div ref={nameRef} className="l-name">
            {NAME.split("").map((ch, i) => (
              <span key={i} className={`l-char${i === 2 ? " accent" : ""}`}>
                {ch}
              </span>
            ))}
          </div>
          <p ref={tagRef} className="l-tag">Developer &nbsp;·&nbsp; Designer &nbsp;·&nbsp; Builder</p>
        </div>
      </div>
    </>
  );
};

export default Loader;