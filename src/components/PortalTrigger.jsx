import { useEffect, useState } from "react";
import { Target } from "lucide-react";

function PortalTrigger({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let raf;
    let t = 0;

    const animate = () => {
      t += 0.05;
      const pulse = 1 + Math.sin(t) * 0.03;
      setScale(pulse);
      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        cursor: "pointer",
        userSelect: "none",
        marginTop: 60,
      }}
    >
      {/* TOP LABEL */}
      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          color: "rgba(255,80,0,.5)",
          fontSize: 11,
          letterSpacing: ".5em",
        }}
      >
        ◈ INTERACTIVE EXPERIENCE ◈
      </div>

      {/* PORTAL */}
      <div
        style={{
          position: "relative",
          width: 240,
          height: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 🔥 OUTER ENERGY GLOW */}
        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,80,0,0.6) 0%, rgba(255,40,0,0.15) 50%, transparent 75%)",
            filter: "blur(25px)",
            transform: `scale(${scale * (hovered ? 1.2 : 1)})`,
            transition: "all .4s ease",
          }}
        />

        {/* 🔥 CORE ENERGY */}
        <div
          style={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,120,0,0.9), rgba(255,40,0,0.3))",
            filter: "blur(10px)",
            opacity: hovered ? 1 : 0.7,
            transform: `scale(${scale})`,
            transition: "all .3s ease",
          }}
        />

        {/* RINGS */}
        <div
          style={{
            position: "absolute",
            width: 210,
            height: 210,
            borderRadius: "50%",
            border: "2px dashed rgba(255,70,0,.5)",
            animation: "spin 10s linear infinite",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,100,30,.3)",
            animation: "spinReverse 6s linear infinite",
          }}
        />

        {/* ⚡ ELECTRIC ARC EFFECT */}
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: hovered
              ? "2px solid rgba(255,150,80,0.8)"
              : "2px solid transparent",
            boxShadow: hovered
              ? "0 0 25px rgba(255,120,0,0.7)"
              : "none",
            transition: "all .3s",
          }}
        />

        {/* CENTER CORE */}
        <div
          style={{
            width: 90,
            height: 90,
            background:
              "linear-gradient(135deg,#7f0000,#ff1a00 60%,#ff6a00)",
            clipPath:
              "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hovered
              ? "0 0 50px rgba(255,50,0,.9)"
              : "0 0 25px rgba(255,50,0,.5)",
            transform: hovered ? "scale(1.1)" : "scale(1)",
            transition: "all .3s ease",
            zIndex: 2,
          }}
        >
          <Target size={28} color="white" />
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 8,
              letterSpacing: ".15em",
              marginTop: 4,
              color: "white",
            }}
          >
            ARENA
          </span>
        </div>
      </div>

      {/* MAIN TEXT */}
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontWeight: 900,
          fontSize: "clamp(16px,2.5vw,26px)",
          letterSpacing: hovered ? ".3em" : ".15em",
          color: "#FF4500",
          textShadow: hovered
            ? "0 0 35px rgba(255,80,0,1), 0 0 80px rgba(255,50,0,.6)"
            : "0 0 15px rgba(255,80,0,.5)",
          transition: "all .35s ease",
        }}
      >
        ENTER SKILL ARENA →
      </div>

      {/* SUBTEXT */}
      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          color: "rgba(255,100,50,.4)",
          letterSpacing: ".3em",
        }}
      >
        CLICK TO BEGIN · PRECISION MODE
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes spinReverse { to { transform: rotate(-360deg); } }
      `}</style>
    </div>
  );
}

export default PortalTrigger;