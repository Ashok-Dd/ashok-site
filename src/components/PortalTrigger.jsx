import { useEffect, useState } from "react";
import { Crosshair } from "lucide-react";

function PortalTrigger({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let raf;
    let t = 0;
    const animate = () => {
      t += 0.04;
      setScale(1 + Math.sin(t) * 0.025);
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
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 20, cursor: "pointer", userSelect: "none", marginTop: 56,
      }}
    >
      {/* Label */}
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        color: "rgba(26,188,156,0.5)",
        fontSize: 10, letterSpacing: ".55em", textTransform: "uppercase",
      }}>
        ◈ interactive experience ◈
      </div>

      {/* Portal */}
      <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Outer energy glow */}
        <div style={{
          position: "absolute", width: 180, height: 180, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,188,156,0.45) 0%, rgba(26,188,156,0.08) 55%, transparent 75%)",
          filter: "blur(22px)",
          transform: `scale(${scale * (hovered ? 1.18 : 1)})`,
          transition: "transform .4s ease",
        }} />

        {/* Core energy */}
        <div style={{
          position: "absolute", width: 100, height: 100, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(77,217,188,0.7), rgba(26,188,156,0.2))",
          filter: "blur(10px)",
          opacity: hovered ? 1 : 0.65,
          transform: `scale(${scale})`,
          transition: "opacity .3s ease",
        }} />

        {/* Outer dashed ring */}
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          border: "1.5px dashed rgba(26,188,156,0.4)",
          animation: "ptSpin 12s linear infinite",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "transform .4s ease",
        }} />

        {/* Inner solid ring */}
        <div style={{
          position: "absolute", width: 158, height: 158, borderRadius: "50%",
          border: "1px solid rgba(77,217,188,0.22)",
          animation: "ptSpinR 8s linear infinite",
        }} />

        {/* Electric arc on hover */}
        <div style={{
          position: "absolute", width: 190, height: 190, borderRadius: "50%",
          border: hovered ? "1.5px solid rgba(26,188,156,0.65)" : "1.5px solid transparent",
          boxShadow: hovered ? "0 0 22px rgba(26,188,156,0.5), inset 0 0 22px rgba(26,188,156,0.1)" : "none",
          transition: "all .35s ease",
        }} />

        {/* Center octagon */}
        <div style={{
          width: 84, height: 84,
          background: "linear-gradient(135deg, #0e2e2a, #1ABC9C 55%, #4DD9BC)",
          clipPath: "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: hovered
            ? "0 0 40px rgba(26,188,156,0.8), 0 0 80px rgba(26,188,156,0.3)"
            : "0 0 20px rgba(26,188,156,0.4)",
          transform: hovered ? "scale(1.08) rotate(22.5deg)" : "scale(1) rotate(0deg)",
          transition: "all .35s ease",
          zIndex: 2,
        }}>
          <Crosshair size={24} color="white" strokeWidth={1.5} />
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 7, letterSpacing: ".18em", marginTop: 4, color: "rgba(255,255,255,0.85)" }}>
            ARENA
          </span>
        </div>
      </div>

      {/* Main CTA text */}
      <div style={{
        fontFamily: "'Orbitron', monospace", fontWeight: 900,
        fontSize: "clamp(14px,2.2vw,22px)",
        letterSpacing: hovered ? ".28em" : ".14em",
        color: "#1ABC9C",
        textShadow: hovered
          ? "0 0 30px rgba(26,188,156,0.9), 0 0 60px rgba(26,188,156,0.4)"
          : "0 0 12px rgba(26,188,156,0.4)",
        transition: "all .35s ease",
      }}>
        ENTER SKILL ARENA →
      </div>

      {/* Sub label */}
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10, color: "rgba(26,188,156,0.35)",
        letterSpacing: ".3em", textTransform: "uppercase",
      }}>
        click to begin · precision mode
      </div>

      <style>{`
        @keyframes ptSpin  { to { transform: rotate(360deg); } }
        @keyframes ptSpinR { to { transform: rotate(-360deg); } }
      `}</style>
    </div>
  );
}

export default PortalTrigger;