import { useEffect, useState, useRef } from "react";
import { Crosshair } from "lucide-react";

function PortalTrigger({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(0);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      tRef.current += 0.035;
      setPulse(tRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const breathe = 1 + Math.sin(pulse) * 0.018;
  const accentColor = "#1abc9c";
  const accentFaint = "rgba(26,188,156,0.12)";
  const accentMid = "rgba(26,188,156,0.35)";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        cursor: "pointer",
        userSelect: "none",
        marginTop: 48,
        padding: "0 16px",
      }}
    >
      {/* Eyebrow */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.5em",
        textTransform: "uppercase",
        color: "rgba(26,188,156,0.45)",
      }}>
        <div style={{ width: 24, height: 1, background: accentMid }} />
        interactive experience
        <div style={{ width: 24, height: 1, background: accentMid }} />
      </div>

      {/* Portal orb */}
      <div style={{
        position: "relative",
        width: 200,
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>

        {/* Scanline grid background disc */}
        <svg
          width="200" height="200"
          viewBox="0 0 200 200"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <clipPath id="disc-clip">
              <circle cx="100" cy="100" r="94" />
            </clipPath>
          </defs>
          <circle
            cx="100" cy="100" r="94"
            fill="rgba(10,20,18,0.72)"
            stroke={accentMid}
            strokeWidth="1"
          />
          {/* Horizontal scanlines */}
          {Array.from({ length: 18 }, (_, i) => (
            <line
              key={i}
              x1="6" y1={14 + i * 10} x2="194" y2={14 + i * 10}
              stroke="rgba(26,188,156,0.07)"
              strokeWidth="0.8"
              clipPath="url(#disc-clip)"
            />
          ))}
          {/* Vertical scanlines */}
          {Array.from({ length: 18 }, (_, i) => (
            <line
              key={i}
              x1={14 + i * 10} y1="6" x2={14 + i * 10} y2="194"
              stroke="rgba(26,188,156,0.05)"
              strokeWidth="0.8"
              clipPath="url(#disc-clip)"
            />
          ))}
          {/* Cardinal tick marks */}
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={deg}
              x1="100" y1="4"
              x2="100" y2="14"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
          {/* 45° tick marks */}
          {[45, 135, 225, 315].map((deg) => (
            <line
              key={deg}
              x1="100" y1="8"
              x2="100" y2="14"
              stroke="rgba(26,188,156,0.4)"
              strokeWidth="1"
              strokeLinecap="round"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </svg>

        {/* Outer dashed orbit ring */}
        <div style={{
          position: "absolute",
          width: 188,
          height: 188,
          borderRadius: "50%",
          border: "1px dashed rgba(26,188,156,0.3)",
          animation: "ptSpin 18s linear infinite",
          transform: `scale(${breathe * (hovered ? 1.04 : 1)})`,
          transition: "transform 0.4s ease",
        }} />

        {/* Mid ring — solid, counter-rotating */}
        <div style={{
          position: "absolute",
          width: 152,
          height: 152,
          borderRadius: "50%",
          border: `1px solid rgba(26,188,156,${hovered ? 0.55 : 0.2})`,
          animation: "ptSpinR 10s linear infinite",
          transition: "border-color 0.35s ease",
        }} />

        {/* Inner ring */}
        <div style={{
          position: "absolute",
          width: 116,
          height: 116,
          borderRadius: "50%",
          border: `1.5px solid rgba(26,188,156,${hovered ? 0.7 : 0.28})`,
          boxShadow: hovered
            ? `0 0 0 1px rgba(26,188,156,0.15), inset 0 0 16px rgba(26,188,156,0.08)`
            : "none",
          transition: "all 0.35s ease",
        }} />

        {/* Center hex button */}
        <div style={{
          position: "relative",
          zIndex: 3,
          width: 76,
          height: 76,
          clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",
          background: hovered
            ? `linear-gradient(135deg, #0d2b26 0%, #1abc9c 60%, #4dd9bc 100%)`
            : `linear-gradient(135deg, #091e1a 0%, #0e6b56 60%, #1abc9c 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          transform: hovered
            ? `scale(${breathe * 1.1}) rotate(30deg)`
            : `scale(${breathe}) rotate(0deg)`,
          transition: "background 0.35s ease, transform 0.4s ease",
        }}>
          <Crosshair
            size={20}
            color="rgba(255,255,255,0.92)"
            strokeWidth={1.5}
            style={{ flexShrink: 0 }}
          />
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 6,
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.75)",
            textTransform: "uppercase",
          }}>
            arena
          </span>
        </div>

        {/* Corner bracket overlays — TL */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          width: 12, height: 12,
          borderTop: `1.5px solid ${hovered ? accentColor : accentMid}`,
          borderLeft: `1.5px solid ${hovered ? accentColor : accentMid}`,
          transition: "border-color 0.3s ease",
        }} />
        {/* TR */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          width: 12, height: 12,
          borderTop: `1.5px solid ${hovered ? accentColor : accentMid}`,
          borderRight: `1.5px solid ${hovered ? accentColor : accentMid}`,
          transition: "border-color 0.3s ease",
        }} />
        {/* BL */}
        <div style={{
          position: "absolute", bottom: 14, left: 14,
          width: 12, height: 12,
          borderBottom: `1.5px solid ${hovered ? accentColor : accentMid}`,
          borderLeft: `1.5px solid ${hovered ? accentColor : accentMid}`,
          transition: "border-color 0.3s ease",
        }} />
        {/* BR */}
        <div style={{
          position: "absolute", bottom: 14, right: 14,
          width: 12, height: 12,
          borderBottom: `1.5px solid ${hovered ? accentColor : accentMid}`,
          borderRight: `1.5px solid ${hovered ? accentColor : accentMid}`,
          transition: "border-color 0.3s ease",
        }} />
      </div>

      {/* CTA row */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "'Orbitron', monospace",
          fontWeight: 900,
          fontSize: "clamp(13px, 2vw, 20px)",
          letterSpacing: hovered ? "0.3em" : "0.16em",
          color: accentColor,
          textShadow: hovered
            ? "0 0 28px rgba(26,188,156,0.7)"
            : "0 0 10px rgba(26,188,156,0.25)",
          transition: "all 0.35s ease",
        }}>
          <span>ENTER SKILL ARENA</span>
          {/* Arrow chevron */}
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none"
            style={{
              transform: hovered ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          >
            <path
              d="M1 7h14M11 2l5 5-5 5"
              stroke={accentColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Status bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(26,188,156,0.35)",
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: hovered ? accentColor : "rgba(26,188,156,0.4)",
            boxShadow: hovered ? "0 0 8px rgba(26,188,156,0.8)" : "none",
            transition: "all 0.3s ease",
            animation: "statusPulse 2s ease-in-out infinite",
          }} />
          click to begin · precision mode
        </div>
      </div>

      <style>{`
        @keyframes ptSpin     { to { transform: rotate(360deg); } }
        @keyframes ptSpinR    { to { transform: rotate(-360deg); } }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default PortalTrigger;