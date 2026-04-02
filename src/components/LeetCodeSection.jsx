import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiLeetcode } from "react-icons/si";
import { LEETCODE_DATA } from '../../data'


gsap.registerPlugin(ScrollTrigger);



/* ── tiny inline styles that extend index.css without touching it ── */
const s = {
  section: {
    position: "relative",
    overflow: "hidden",
    background: "var(--color-bg-sunken)",
    padding: "110px 24px 90px",
  },

  /* ── decorative BG layer ── */
  bgLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(26,188,156,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,188,156,0.04) 1px,transparent 1px)",
    backgroundSize: "48px 48px",
  },
  bgBlob1: {
    position: "absolute",
    width: 520,
    height: 520,
    top: -140,
    left: -80,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(26,188,156,0.09) 0%,transparent 70%)",
    filter: "blur(100px)",
  },
  bgBlob2: {
    position: "absolute",
    width: 400,
    height: 400,
    bottom: -100,
    right: -60,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(26,188,156,0.06) 0%,transparent 70%)",
    filter: "blur(100px)",
  },
  bgScanLine: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom,transparent 0%,rgba(26,188,156,0.025) 50%,transparent 100%)",
    backgroundSize: "100% 160px",
    animation: "lc-scan 10s linear infinite",
  },

  /* ── corner decoration ── */
  corner: (pos) => ({
    position: "absolute",
    width: 18,
    height: 18,
    opacity: 0.35,
    ...pos,
  }),

  /* ── section header ── */
  header: {
    textAlign: "center",
    marginBottom: 56,
    position: "relative",
    zIndex: 1,
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.42em",
    textTransform: "uppercase",
    color: "var(--color-accent)",
    marginBottom: 14,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--color-accent)",
    boxShadow: "0 0 8px rgba(26,188,156,0.6)",
    flexShrink: 0,
    animation: "pulse-dot 2s ease-in-out infinite",
  },
  titleGrad: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2rem,5vw,3.4rem)",
    fontWeight: 900,
    letterSpacing: "-0.01em",
    lineHeight: 1.1,
    background: "linear-gradient(135deg,#f5f5f7 25%,#1abc9c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
  },
  subtitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    marginTop: 10,
  },
  ruler: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
  },
  rulerLine: (flip) => ({
    height: 1,
    width: 72,
    background: flip
      ? "linear-gradient(to left,transparent,rgba(26,188,156,0.5))"
      : "linear-gradient(to right,transparent,rgba(26,188,156,0.5))",
  }),
  rulerGem: {
    width: 8,
    height: 8,
    background: "var(--color-accent)",
    transform: "rotate(45deg)",
    boxShadow: "0 0 10px rgba(26,188,156,0.7)",
  },

  /* ── wrapper row ── */
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 48,
    position: "relative",
    zIndex: 1,
    maxWidth: 1100,
    margin: "0 auto",
  },

  /* ── RIGHT CARD ── */
  card: {
    position: "relative",
    width: 400,
    background: "rgba(37,37,56,0.55)",
    border: "1px solid rgba(26,188,156,0.18)",
    borderRadius: 22,
    padding: "32px 28px",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow:
      "0 0 0 1px rgba(26,188,156,0.05), 0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(26,188,156,0.06)",
    overflow: "hidden",
  },
  cardTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background:
      "linear-gradient(90deg,transparent,#1abc9c,#4dd9bc,transparent)",
  },
  cardBotLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    background:
      "linear-gradient(90deg,transparent,rgba(26,188,156,0.25),transparent)",
  },

  /* card header row */
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  cardBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  lcLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "rgba(255,161,22,0.12)",
    border: "1px solid rgba(255,161,22,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
  },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--color-text-primary)",
    letterSpacing: "0.05em",
    margin: 0,
  },
  cardHandle: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.62rem",
    color: "var(--color-text-muted)",
    letterSpacing: "0.06em",
    marginTop: 2,
  },
  rankBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: 9999,
    background: "rgba(255,161,22,0.1)",
    border: "1px solid rgba(255,161,22,0.3)",
    color: "#ffa116",
    whiteSpace: "nowrap",
  },

  /* total solved ring */
  ringWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  ringOuter: {
    position: "relative",
    width: 110,
    height: 110,
  },
  ringCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  ringVal: {
    fontFamily: "var(--font-display)",
    fontSize: "1.6rem",
    fontWeight: 900,
    color: "var(--color-accent)",
    lineHeight: 1,
  },
  ringLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.52rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    marginTop: 2,
  },

  /* stats grid */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    padding: "11px 8px",
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(26,188,156,0.1)",
    borderRadius: 10,
    textAlign: "center",
  },
  statNum: {
    fontFamily: "var(--font-display)",
    fontSize: "1.15rem",
    fontWeight: 900,
    lineHeight: 1,
  },
  statLbl: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.55rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    marginTop: 3,
  },

  /* diff section label */
  diffHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  diffLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.6rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
  },

  /* bar row */
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },
  barName: (color) => ({
    fontFamily: "var(--font-mono)",
    fontSize: "0.62rem",
    letterSpacing: "0.1em",
    color,
    width: 48,
    flexShrink: 0,
  }),
  barTrack: {
    flex: 1,
    height: 5,
    borderRadius: 9999,
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  barFill: (grad) => ({
    height: "100%",
    width: "0%",
    borderRadius: 9999,
    background: grad,
  }),
  barCount: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.6rem",
    color: "var(--color-text-muted)",
    width: 28,
    textAlign: "right",
    flexShrink: 0,
  },

  /* insight */
  insight: {
    marginTop: 16,
    padding: "10px 14px",
    background: "rgba(26,188,156,0.06)",
    border: "1px solid rgba(26,188,156,0.18)",
    borderRadius: 10,
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.05em",
    color: "var(--color-accent)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--color-accent)",
    boxShadow: "0 0 6px rgba(26,188,156,0.7)",
    flexShrink: 0,
    animation: "pulse-dot 1.8s ease-in-out infinite",
  },

  /* visit btn */
  visitBtn: {
    marginTop: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "11px 0",
    background: "transparent",
    border: "1.5px solid rgba(26,188,156,0.35)",
    borderRadius: 10,
    fontFamily: "var(--font-display)",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--color-accent)",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.25s ease",
    position: "relative",
    overflow: "hidden",
  },

  /* floating sparkles */
  spark: (top, right, size, delay) => ({
    position: "absolute",
    top,
    right,
    width: size,
    height: size,
    borderRadius: "50%",
    background: "var(--color-accent)",
    animation: `spark-ping 2s ease-in-out ${delay}s infinite`,
    pointerEvents: "none",
  }),
};

/* ── Corner SVG helper ── */
const Corner = ({ pos, flip }) => (
  <div style={s.corner(pos)}>
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      style={{ transform: flip ? "scale(-1,1)" : "none" }}
    >
      <path d="M0 18 L0 0 L18 0" stroke="rgba(26,188,156,0.5)" strokeWidth="2" fill="none" />
    </svg>
  </div>
);

/* ── SVG donut ring ── */
const DonutRing = ({ value, total }) => {
  const R = 44;
  const C = 2 * Math.PI * R;
  const pct = value / total;
  const dash = C * pct;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: "rotate(-90deg)" }}>
      {/* track */}
      <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(26,188,156,0.08)" strokeWidth="7" />
      {/* easy */}
      <circle
        id="ring-easy"
        cx="55" cy="55" r={R} fill="none"
        stroke="#2ecc71" strokeWidth="7"
        strokeDasharray={`${C * (LEETCODE_DATA.easy / total)} ${C}`}
        strokeDashoffset="0"
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* medium — offset past easy */}
      <circle
        id="ring-med"
        cx="55" cy="55" r={R} fill="none"
        stroke="#f39c12" strokeWidth="7"
        strokeDasharray={`${C * (LEETCODE_DATA.medium / total)} ${C}`}
        strokeDashoffset={-(C * (LEETCODE_DATA.easy / total))}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1) 0.2s" }}
      />
      {/* hard */}
      <circle
        id="ring-hard"
        cx="55" cy="55" r={R} fill="none"
        stroke="#e74c3c" strokeWidth="7"
        strokeDasharray={`${C * (LEETCODE_DATA.hard / total)} ${C}`}
        strokeDashoffset={-(C * ((LEETCODE_DATA.easy + LEETCODE_DATA.medium) / total))}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1) 0.4s" }}
      />
    </svg>
  );
};

/* ── Bar row ── */
const DiffBar = ({ label, value, color, grad, barRef }) => {
  const pct = ((value / LEETCODE_DATA.total) * 100).toFixed(1);
  return (
    <div style={s.barRow}>
      <span style={s.barName(color)}>{label}</span>
      <div style={s.barTrack}>
        <div
          ref={barRef}
          className="lc-bar-fill"
          data-width={`${pct}%`}
          style={s.barFill(grad)}
        />
      </div>
      <span style={s.barCount}>{value}</span>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const LeetCodeSection = () => {
  const sectionRef  = useRef(null);
  const imageRef    = useRef(null);   /* kept for your usage — not touched */
  const cardRef     = useRef(null);
  const headerRef   = useRef(null);
  const totalNumRef = useRef(null);
  const easyNumRef  = useRef(null);
  const medNumRef   = useRef(null);
  const hardNumRef  = useRef(null);
  const barsRef     = useRef([]);
  const blob1Ref    = useRef(null);
  const blob2Ref    = useRef(null);
  const insightRef  = useRef(null);
  const btnRef      = useRef(null);

  /* ── hover tilt on card ── */
  const handleCardMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY: cx * 8,
      rotateX: -cy * 5,
      duration: 0.4,
      ease: "power1.out",
      transformPerspective: 900,
    });
  };
  const handleCardLeave = () => {
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.55, ease: "power2.out" });
  };

  /* ── visit button hover ── */
  const handleBtnEnter = () => gsap.to(btnRef.current, {
    background: "rgba(26,188,156,0.1)", scale: 1.02, duration: 0.2
  });
  const handleBtnLeave = () => gsap.to(btnRef.current, {
    background: "transparent", scale: 1, duration: 0.25
  });

  useEffect(() => {
    /* ── blob ambient drift ── */
    gsap.to(blob1Ref.current, {
      y: -28, x: 10, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true,
    });
    gsap.to(blob2Ref.current, {
      y: 22, x: -12, duration: 12, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 4,
    });

    /* ── master scroll-triggered timeline ── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
      },
      defaults: { ease: "power3.out" },
    });

    /* header */
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -36 },
      { opacity: 1, y: 0, duration: 0.9 }
    );

    /* card slides in from right */
    tl.fromTo(
      cardRef.current,
      { opacity: 0, x: 60, rotateY: 14 },
      { opacity: 1, x: 0, rotateY: 0, duration: 0.85, transformPerspective: 900 },
      "-=0.5"
    );

    /* counters */
    const counterTargets = [
      { ref: totalNumRef, val: LEETCODE_DATA.total },
      { ref: easyNumRef,  val: LEETCODE_DATA.easy  },
      { ref: medNumRef,   val: LEETCODE_DATA.medium },
      { ref: hardNumRef,  val: LEETCODE_DATA.hard   },
    ];
    counterTargets.forEach(({ ref, val }, i) => {
      tl.fromTo(
        { v: 0 },
        { v: val },
        {
          duration: 1.8,
          ease: "power2.out",
          delay: i * 0.06,
          onUpdate: function () {
            if (ref.current) ref.current.textContent = Math.round(this.targets()[0].v);
          },
          onComplete: () => { if (ref.current) ref.current.textContent = val; },
        },
        "-=1.6"
      );
    });

    /* bars */
    barsRef.current.forEach((bar, i) => {
      if (!bar) return;
      tl.fromTo(
        bar,
        { width: "0%" },
        { width: bar.dataset.width, duration: 1.3, ease: "power2.out" },
        i === 0 ? "-=1.4" : "-=1.1"
      );
    });

    /* insight + button pop */
    tl.fromTo(
      [insightRef.current, btnRef.current],
      { opacity: 0, y: 14, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
      "-=0.3"
    );

    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  const getInsight = () => {
    const { easy, medium, hard } = LEETCODE_DATA;
    if (hard >= 20) return "Hard problem solver — battle-hardened 🔥";
    if (medium > easy) return "Medium specialist — the sweet spot 💪";
    return "Consistent grinder — no problem too small 🚀";
  };

  return (
    <>
      {/* ── keyframe injection ── */}
      <style>{`
        @keyframes lc-scan {
          0%   { background-position: 0 -160px; }
          100% { background-position: 0 100vh; }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; box-shadow:0 0 6px rgba(26,188,156,.6); }
          50%      { opacity:.3; box-shadow:none; }
        }
        @keyframes spark-ping {
          0%   { transform:scale(1); opacity:.7; }
          60%  { transform:scale(2.8); opacity:.2; }
          100% { transform:scale(1); opacity:.7; }
        }
        .lc-stat-box:hover {
          border-color: rgba(26,188,156,0.3) !important;
          background: rgba(26,188,156,0.06) !important;
        }
      `}</style>

      <section className="leetcode-section" ref={sectionRef} style={s.section}>

        {/* ── BACKGROUND ── */}
        <div style={s.bgLayer}>
          <div style={s.bgGrid} />
          <div ref={blob1Ref} style={s.bgBlob1} />
          <div ref={blob2Ref} style={s.bgBlob2} />
          <div style={s.bgScanLine} />
        </div>

        {/* corner brackets */}
        <Corner pos={{ top: 20, left: 20 }} />
        <Corner pos={{ top: 20, right: 20 }} flip />
        <Corner pos={{ bottom: 20, left: 20, transform: "scaleY(-1)" }} />
        <Corner pos={{ bottom: 20, right: 20, transform: "scale(-1,1) scaleY(-1)" }} flip />

        {/* ── HEADER ── */}
        <div ref={headerRef} style={{ ...s.header, opacity: 0 }}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            BATTLEGROUND · COMPETITIVE CODING
            <span style={{ ...s.eyebrowDot, animationDelay: "0.4s" }} />
          </div>
          <h2 style={s.titleGrad}>LeetCode Arena</h2>
          <p style={s.subtitle}>Solved · Ranked · Victorious</p>
          <div style={s.ruler}>
            <div style={s.rulerLine(false)} />
            <div style={s.rulerGem} />
            <div style={s.rulerLine(true)} />
          </div>
        </div>

        {/* ── MAIN ROW ── */}
        <div style={s.wrapper}>

          {/* ════ LEFT — YOUR UNTOUCHED AVATAR ════ */}
          <div className="home-avatar-wrap visible" ref={imageRef}>
            <div className="orbit-ring orbit-ring-1" />
            <div className="orbit-ring orbit-ring-2" />
            <div className="avatar-halo" />
            <div className="avatar-frame">
              <img src="/me1.png" alt="Ashok Bongu" className="avatar-img" />
            </div>
          </div>

          {/* ════ RIGHT — ENHANCED CARD ════ */}
          <div
            ref={cardRef}
            style={{ ...s.card, opacity: 0 }}
            onMouseMove={handleCardMove}
            onMouseLeave={handleCardLeave}
          >
            {/* decorative top accent bar */}
            <div style={s.cardTopBar} />
            <div style={s.cardBotLine} />

            {/* floating sparkles */}
            <div style={s.spark(-4, "12%", 7, 0)} />
            <div style={s.spark("auto", "auto", 5, 0.7)} />

            {/* ── card header ── */}
            <div style={s.cardHeader}>
              <div style={s.cardBrand}>
                <div style={s.lcLogo}>
                  <SiLeetcode size={20} color="#FFA116" />
                </div>
                <div>
                  <p style={s.cardTitle}>LEETCODE</p>
                  <p style={s.cardHandle}>@b_ashok</p>
                </div>
              </div>
              <span style={s.rankBadge}>Guardian</span>
            </div>

            {/* ── donut ring + total ── */}
            <div style={s.ringWrap}>
              <div style={s.ringOuter}>
                <DonutRing value={LEETCODE_DATA.total} total={LEETCODE_DATA.total} />
                <div style={s.ringCenter}>
                  <span ref={totalNumRef} style={s.ringVal}>0</span>
                  <span style={s.ringLabel}>Solved</span>
                </div>
              </div>
            </div>

            {/* ── E / M / H stat boxes ── */}
            <div style={s.statsGrid}>
              {[
                { label: "Easy",   ref: easyNumRef, color: "#2ecc71" },
                { label: "Medium", ref: medNumRef,  color: "#f39c12" },
                { label: "Hard",   ref: hardNumRef, color: "#e74c3c" },
              ].map(({ label, ref, color }) => (
                <div key={label} className="lc-stat-box" style={s.statBox}>
                  <span ref={ref} style={{ ...s.statNum, color }}>0</span>
                  <p style={s.statLbl}>{label}</p>
                </div>
              ))}
            </div>

            {/* ── difficulty bars ── */}
            <div style={s.diffHeader}>
              <span style={s.diffLabel}>Difficulty Breakdown</span>
              <span style={{ ...s.diffLabel, color: "var(--color-text-secondary)" }}>
                {LEETCODE_DATA.total} / 3000+
              </span>
            </div>

            <DiffBar
              label="Easy"
              value={LEETCODE_DATA.easy}
              color="#2ecc71"
              grad="linear-gradient(90deg,#2ecc71,#58d68d)"
              barRef={(el) => (barsRef.current[0] = el)}
            />
            <DiffBar
              label="Medium"
              value={LEETCODE_DATA.medium}
              color="#f39c12"
              grad="linear-gradient(90deg,#f39c12,#f7c04a)"
              barRef={(el) => (barsRef.current[1] = el)}
            />
            <DiffBar
              label="Hard"
              value={LEETCODE_DATA.hard}
              color="#e74c3c"
              grad="linear-gradient(90deg,#e74c3c,#f1948a)"
              barRef={(el) => (barsRef.current[2] = el)}
            />

            {/* ── insight badge ── */}
            <div ref={insightRef} style={{ ...s.insight, opacity: 0 }}>
              <span style={s.insightDot} />
              {getInsight()}
            </div>

            {/* ── visit button ── */}
            <a
              ref={btnRef}
              href="https://leetcode.com/u/b_ashok"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...s.visitBtn, opacity: 0 }}
              onMouseEnter={handleBtnEnter}
              onMouseLeave={handleBtnLeave}
            >
               <SiLeetcode size={13} color="var(--color-accent)" />
              VIEW PROFILE ↗
            </a>
          </div>
          {/* ════ end right card ════ */}

        </div>
      </section>
    </>
  );
};

export default LeetCodeSection;