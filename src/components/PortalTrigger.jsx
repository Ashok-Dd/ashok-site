import { useEffect, useState, useRef } from "react";
import { Crosshair } from "lucide-react";

function PortalTrigger({ onClick, label = 'arena', GameIcon = Crosshair }) {
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
        color: "var(--color-text-accent)",
        opacity: 0.45,
      }}>
        <div style={{ width: 24, height: 1, background: "var(--color-accent-border)" }} />
        interactive experience
        <div style={{ width: 24, height: 1, background: "var(--color-accent-border)" }} />
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
          style={{ position: "absolute", inset: 0, color: "var(--color-accent)" }}
        >
          <defs>
            <clipPath id="disc-clip">
              <circle cx="100" cy="100" r="94" />
            </clipPath>
          </defs>
          <circle
            cx="100" cy="100" r="94"
            fill="var(--color-bg-sunken)"
            fillOpacity="0.85"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          {/* Horizontal scanlines */}
          {Array.from({ length: 18 }, (_, i) => (
            <line
              key={i}
              x1="6" y1={14 + i * 10} x2="194" y2={14 + i * 10}
              stroke="currentColor"
              strokeOpacity="0.07"
              strokeWidth="0.8"
              clipPath="url(#disc-clip)"
            />
          ))}
          {/* Vertical scanlines */}
          {Array.from({ length: 18 }, (_, i) => (
            <line
              key={i}
              x1={14 + i * 10} y1="6" x2={14 + i * 10} y2="194"
              stroke="currentColor"
              strokeOpacity="0.05"
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
              stroke="currentColor"
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
              stroke="currentColor"
              strokeOpacity="0.4"
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
          border: "1px dashed var(--color-accent-border)",
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
          border: `1px solid ${hovered ? "var(--color-accent-border)" : "var(--color-border)"}`,
          animation: "ptSpinR 10s linear infinite",
          transition: "border-color 0.35s ease",
        }} />

        {/* Inner ring */}
        <div style={{
          position: "absolute",
          width: 116,
          height: 116,
          borderRadius: "50%",
          border: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-border-accent)"}`,
          boxShadow: hovered
            ? `0 0 0 1px var(--color-accent-muted), inset 0 0 16px var(--color-accent-muted)`
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
            ? `linear-gradient(135deg, var(--color-bg-sunken) 0%, var(--color-accent) 60%, var(--color-accent-light) 100%)`
            : `linear-gradient(135deg, var(--color-bg-sunken) 0%, var(--color-accent-dark) 60%, var(--color-accent) 100%)`,
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
          <GameIcon
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
            {label}
          </span>
        </div>

        {/* Corner bracket overlays — TL */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          width: 12, height: 12,
          borderTop: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
          borderLeft: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
          transition: "border-color 0.3s ease",
        }} />
        {/* TR */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          width: 12, height: 12,
          borderTop: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
          borderRight: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
          transition: "border-color 0.3s ease",
        }} />
        {/* BL */}
        <div style={{
          position: "absolute", bottom: 14, left: 14,
          width: 12, height: 12,
          borderBottom: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
          borderLeft: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
          transition: "border-color 0.3s ease",
        }} />
        {/* BR */}
        <div style={{
          position: "absolute", bottom: 14, right: 14,
          width: 12, height: 12,
          borderBottom: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
          borderRight: `1.5px solid ${hovered ? "var(--color-accent)" : "var(--color-accent-border)"}`,
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
          color: "var(--color-accent)",
          textShadow: hovered
            ? "0 0 28px var(--color-accent-glow)"
            : "0 0 10px var(--color-accent-muted)",
          transition: "all 0.35s ease",
        }}>
          <span>ENTER {label.toUpperCase()} MODE</span>
          {/* Arrow chevron */}
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none"
            style={{
              transform: hovered ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.3s ease",
              color: "var(--color-accent)",
            }}
          >
            <path
              d="M1 7h14M11 2l5 5-5 5"
              stroke="currentColor"
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
          color: "var(--color-text-accent)",
          opacity: 0.35,
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: hovered ? "var(--color-accent)" : "var(--color-accent-border)",
            boxShadow: hovered ? "0 0 8px var(--color-accent-glow)" : "none",
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
