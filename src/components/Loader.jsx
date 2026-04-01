import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Loader = ({ onComplete }) => {
  const topRef = useRef();
  const botRef = useRef();
  const counterRef = useRef();
  const nameRef = useRef();
  const lineRef = useRef();
  const tagRef = useRef();

  useEffect(() => {
    // Google font
    if (!document.getElementById("loader-font")) {
      const l = document.createElement("link");
      l.id = "loader-font";
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500&display=swap";
      document.head.appendChild(l);
    }

    const letters = nameRef.current.querySelectorAll(".l-char");
    const counter = counterRef.current;

    // Set initial states
    gsap.set([topRef.current, botRef.current], { yPercent: 0 });
    gsap.set(letters, { yPercent: 120, opacity: 0 });
    gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left" });
    gsap.set(tagRef.current, { opacity: 0, y: 12 });
    gsap.set(counter, { opacity: 1 });

    const tl = gsap.timeline();

    // 1. Count up 0 → 100
    tl.to(
      {},
      {
        duration: 2,
        ease: "power1.inOut",
        onUpdate() {
          const val = Math.round(this.progress() * 100);
          counter.textContent = String(val).padStart(3, "0");
        },
      }
    )

    // 2. Counter fades out
    .to(counter, { opacity: 0, y: -20, duration: 0.35, ease: "power2.in" }, "-=0.1")

    // 3. Line draws in
    .to(lineRef.current, { scaleX: 1, duration: 0.55, ease: "expo.out" }, "-=0.1")

    // 4. Letters slam up
    .to(letters, {
      yPercent: 0,
      opacity: 1,
      stagger: 0.055,
      duration: 0.65,
      ease: "expo.out",
    }, "-=0.3")

    // 5. Tag line
    .to(tagRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.2")

    // 6. Hold
    .to({}, { duration: 0.6 })

    // 7. Letters exit upward stagger
    .to(letters, {
      yPercent: -120,
      opacity: 0,
      stagger: 0.04,
      duration: 0.45,
      ease: "power3.in",
    })

    // 8. Line shrinks
    .to(lineRef.current, {
      scaleX: 0,
      transformOrigin: "right",
      duration: 0.35,
      ease: "expo.in",
    }, "-=0.3")

    // 9. Panels rip apart
    .to(
      topRef.current,
      { yPercent: -100, duration: 0.9, ease: "expo.inOut" },
      "-=0.1"
    )
    .to(
      botRef.current,
      { yPercent: 100, duration: 0.9, ease: "expo.inOut", onComplete },
      "<"
    );
  }, []);

  const NAME = "ASHOK";

  return (
    <>
      <style>{`
        .loader-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          font-family: 'Manrope', sans-serif;
        }

        /* Two panels */
        .l-panel {
          position: absolute;
          left: 0; right: 0;
          height: 50%;
          background: #080808;
          z-index: 2;
        }
        .l-panel-top {
          top: 0;
          /* subtle grain */
          background-image:
            radial-gradient(ellipse 80% 60% at 50% 0%, #1a0303 0%, #080808 70%);
        }
        .l-panel-bot {
          bottom: 0;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% 100%, #0d0202 0%, #080808 70%);
        }

        /* Center stage — sits between panels */
        .l-center {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
          pointer-events: none;
        }

        /* Counter */
        .l-counter {
          font-family: 'Syne', sans-serif;
          font-size: clamp(5rem, 14vw, 12rem);
          font-weight: 800;
          letter-spacing: -0.06em;
          line-height: 1;
          color: rgba(255,255,255,0.06);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          user-select: none;
        }

        /* Thin rule */
        .l-line {
          width: clamp(200px, 30vw, 400px);
          height: 1px;
          background: rgba(255,255,255,0.12);
          margin-bottom: 28px;
        }

        /* Name */
        .l-name {
          display: flex;
          align-items: center;
          overflow: hidden;
          line-height: 1;
          margin-bottom: 20px;
        }
        .l-char {
          display: inline-block;
          font-family: 'Syne', sans-serif;
          font-size: clamp(4rem, 11vw, 10rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #fff;
          will-change: transform;
        }
        /* Red accent on middle letter */
        .l-char.accent {
          color: #e03030;
        }

        /* Tagline */
        .l-tag {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          font-family: 'Manrope', sans-serif;
        }

        /* Corner labels */
        .l-corner {
          position: absolute;
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
          font-family: 'Manrope', sans-serif;
          z-index: 4;
        }
        .l-corner-tl { top: 32px; left: 40px; }
        .l-corner-tr { top: 32px; right: 40px; text-align: right; }
        .l-corner-bl { bottom: 32px; left: 40px; }
        .l-corner-br { bottom: 32px; right: 40px; text-align: right; }

        /* Thin vertical center line on panels */
        .l-vline {
          position: absolute;
          top: 0; bottom: 0;
          left: 50%;
          width: 1px;
          background: rgba(255,255,255,0.04);
          z-index: 1;
        }
      `}</style>

      <div className="loader-root">
        {/* Top panel */}
        <div ref={topRef} className="l-panel l-panel-top">
          <div className="l-vline" />
          <span className="l-corner l-corner-tl">Portfolio</span>
          <span className="l-corner l-corner-tr">2025</span>
        </div>

        {/* Bottom panel */}
        <div ref={botRef} className="l-panel l-panel-bot">
          <div className="l-vline" />
          <span className="l-corner l-corner-bl">Full Stack Dev</span>
          <span className="l-corner l-corner-br">India</span>
        </div>

        {/* Center content */}
        <div className="l-center">
          {/* Big ghost counter */}
          <div ref={counterRef} className="l-counter">000</div>

          {/* Line */}
          <div ref={lineRef} className="l-line" />

          {/* Name */}
          <div ref={nameRef} className="l-name">
            {NAME.split("").map((ch, i) => (
              <span
                key={i}
                className={`l-char${i === 2 ? " accent" : ""}`}
              >
                {ch}
              </span>
            ))}
          </div>

          {/* Tag */}
          <p ref={tagRef} className="l-tag">Developer &nbsp;·&nbsp; Designer &nbsp;·&nbsp; Builder</p>
        </div>
      </div>
    </>
  );
};

export default Loader;