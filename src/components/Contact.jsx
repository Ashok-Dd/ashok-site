import { useState, useEffect, useRef } from 'react';
import { gsap }        from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Github, Instagram, Mail, Linkedin,
  MessageCircle, Send, User, AtSign,
  FileText, CheckCircle2, Loader2, ChevronRight,
} from 'lucide-react';
import { SOCIALS, footerData } from '../../data'


gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   CONFIG — swap in your real IDs
   ───────────────────────────────────────── */
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const WHATSAPP_NUMBER     = import.meta.env.VITE_WHATSAPP_NUMBER;

/* ─────────────────────────────────────────
   SOCIAL DATA
   ───────────────────────────────────────── */


/* =========================================================
   CONTACT
   ========================================================= */
const Contact = () => {
  /* ── state ── */
  const [form,    setForm]    = useState({ name: '', email: '', message: '' });
  const [focused, setFocused] = useState(null);
  const [status,  setStatus]  = useState('idle');   // idle | loading | success | error
  const [channel, setChannel] = useState('whatsapp');

  /* ── refs for GSAP ── */
  const sectionRef  = useRef(null);
  const headerRef   = useRef(null);
  const eyebrowRef  = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const rulerRef    = useRef(null);
  const formRef     = useRef(null);
  const infoRef     = useRef(null);
  const socRowsRef  = useRef([]);
  const cornersRef  = useRef([]);
  const blobsRef    = useRef([]);

  /* ── load EmailJS ── */
  useEffect(() => {
    if (!document.getElementById('emailjs-sdk')) {
      const s  = document.createElement('script');
      s.id     = 'emailjs-sdk';
      s.src    = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.onload = () => window.emailjs?.init(EMAILJS_PUBLIC_KEY);
      document.head.appendChild(s);
    } else {
      window.emailjs?.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  /* ── GSAP animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      // --- blobs floating (looping tween, no ScrollTrigger)
      blobsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: i % 2 === 0 ? -22 : 18,
          x: i === 2 ? 14 : 0,
          duration: 7 + i * 2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 1.5,
        });
      });

      // --- corner brackets draw in
      cornersRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.from(el, {
          opacity: 0,
          scale: 0.3,
          duration: 0.6,
          ease: 'back.out(2)',
          delay: 0.2 + i * 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        });
      });

      // --- header stagger
      const headerTl = gsap.timeline({
        scrollTrigger: { trigger: headerRef.current, start: 'top 82%', once: true },
      });
      headerTl
        .from(eyebrowRef.current,  { opacity: 0, y: 16, duration: 0.55, ease: 'power2.out' })
        .from(titleRef.current,    { opacity: 0, y: 22, duration: 0.65, ease: 'power3.out' }, '-=0.25')
        .from(subtitleRef.current, { opacity: 0, y: 14, duration: 0.5,  ease: 'power2.out' }, '-=0.35')
        .from(rulerRef.current,    { opacity: 0, scaleX: 0, transformOrigin: 'center', duration: 0.5, ease: 'power2.out' }, '-=0.3');

      // --- form panel slides in from left
      gsap.from(formRef.current, {
        opacity: 0,
        x: -52,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: formRef.current, start: 'top 80%', once: true },
      });

      // --- info panel slides in from right
      gsap.from(infoRef.current, {
        opacity: 0,
        x: 52,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: infoRef.current, start: 'top 80%', once: true },
      });

      // --- social rows stagger up
      if (socRowsRef.current.length) {
        gsap.from(socRowsRef.current.filter(Boolean), {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: infoRef.current, start: 'top 75%', once: true },
          delay: 0.3,
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── GSAP: success pop ── */
  const animateSuccess = () => {
    const ring = document.querySelector('.ct-success-ring');
    if (ring) {
      gsap.fromTo(ring,
        { scale: 0, rotation: -12, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: 'back.out(2)' }
      );
    }
  };

  /* ── handlers ── */
  const handleChange = (e) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const sendViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi Ashok! 👋\nName: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    setStatus('success');
    setForm({ name: '', email: '', message: '' });
    setTimeout(animateSuccess, 50);
  };

  const sendViaEmail = async () => {
    if (!window.emailjs) throw new Error('EmailJS not loaded');
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name:  form.name,
      from_email: form.email,
      message:    form.message,
      to_email:   footerData.contact.email,
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus('loading');
    try {
      if (channel === 'whatsapp') {
        sendViaWhatsApp();
      } else {
        await sendViaEmail();
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
        setTimeout(animateSuccess, 50);
      }
    } catch {
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
      );
      window.location.href = `mailto:${footerData.contact.email}?subject=Message from ${form.name}&body=${body}`;
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(animateSuccess, 50);
    }
  };

  const reset = () => setStatus('idle');

  /* ── field className helper ── */
  const fieldCls = (name) =>
    `ct-field${focused === name ? ' ct-field-focused' : ''}`;

  /* ── render ── */
  return (
    <section id="contact" className="ct-section" ref={sectionRef}>

      {/* ── BACKGROUND ── */}
      <div className="ct-bg">
        <div className="ct-blob ct-blob-1" ref={el => (blobsRef.current[0] = el)} />
        <div className="ct-blob ct-blob-2" ref={el => (blobsRef.current[1] = el)} />
        <div className="ct-blob ct-blob-3" ref={el => (blobsRef.current[2] = el)} />
        <div className="ct-grid" />
        <div className="ct-scan" />
        <span className="ct-glyph ct-glyph-1">{'</>'}</span>
        <span className="ct-glyph ct-glyph-2">{'{ }'}</span>
        <span className="ct-glyph ct-glyph-3">{'()'}</span>
      </div>

      {/* Corner brackets */}
      <div className="ct-corner ct-corner-tl" ref={el => (cornersRef.current[0] = el)} />
      <div className="ct-corner ct-corner-tr" ref={el => (cornersRef.current[1] = el)} />
      <div className="ct-corner ct-corner-bl" ref={el => (cornersRef.current[2] = el)} />
      <div className="ct-corner ct-corner-br" ref={el => (cornersRef.current[3] = el)} />

      {/* ── WRAPPER ── */}
      <div className="ct-wrapper">

        {/* ── HEADER ── */}
        <div className="ct-header" ref={headerRef}>
          <p className="ct-eyebrow" ref={eyebrowRef}>
            <span className="ct-eyebrow-dot" />
            Let's work together
          </p>
          <h2 className="ct-title" ref={titleRef}>Get In Touch</h2>
          <p className="ct-subtitle" ref={subtitleRef}>
            Have a project, idea, or just want to say hi? Send it my way — I respond fast.
          </p>
          <div className="ct-ruler" ref={rulerRef}>
            <div className="ct-ruler-line" />
            <div className="ct-ruler-gem" />
            <div className="ct-ruler-line ct-ruler-line-r" />
          </div>
        </div>

        {/* ── TWO COLUMNS ── */}
        <div className="ct-cols">

          {/* ── LEFT: FORM PANEL ── */}
          <div className="ct-form-panel" ref={formRef}>
            <p className="ct-form-tag">
              <Send size={11} /> Message Me
            </p>

            {/* Channel toggle */}
            <div className="ct-toggle">
              <button
                className={`ct-tog${channel === 'whatsapp' ? ' ct-tog-active' : ''}`}
                onClick={() => setChannel('whatsapp')}
              >
                <MessageCircle size={13} /> WhatsApp
              </button>
              <button
                className={`ct-tog${channel === 'email' ? ' ct-tog-active' : ''}`}
                onClick={() => setChannel('email')}
              >
                <Mail size={13} /> Email
              </button>
            </div>

            {status === 'success' ? (
              <div className="ct-success">
                <div className="ct-success-ring">
                  <CheckCircle2 size={38} />
                </div>
                <h3>{channel === 'whatsapp' ? 'Opened in WhatsApp' : 'Message Sent!'}</h3>
                <p>
                  {channel === 'whatsapp'
                    ? 'Your WhatsApp is ready — just hit Send.'
                    : "I'll get back to you very soon."}
                </p>
                <button className="ct-btn-send" onClick={reset}>
                  Send Another
                </button>
              </div>
            ) : (
              <>
                {/* Name */}
                <div className={fieldCls('name')}>
                  <User size={15} className="ct-field-icon" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    disabled={status === 'loading'}
                  />
                  <div className="ct-field-line" />
                </div>

                {/* Email */}
                <div className={fieldCls('email')}>
                  <AtSign size={15} className="ct-field-icon" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    disabled={status === 'loading'}
                  />
                  <div className="ct-field-line" />
                </div>

                {/* Message */}
                <div className={`${fieldCls('message')}`} style={{ alignItems: 'flex-start' }}>
                  <FileText size={15} className="ct-field-icon" style={{ marginTop: 2 }} />
                  <textarea
                    name="message"
                    placeholder="Your message…"
                    value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocused('message')}
                    onBlur={() => setFocused(null)}
                    rows={4}
                    disabled={status === 'loading'}
                  />
                  <div className="ct-field-line" />
                  {form.message.length > 0 && (
                    <span className="ct-char-count">{form.message.length}</span>
                  )}
                </div>

                {/* Submit */}
                <button
                  className="ct-btn-send"
                  onClick={handleSubmit}
                  disabled={
                    status === 'loading' ||
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.message.trim()
                  }
                >
                  {status === 'loading' ? (
                    <><Loader2 size={15} className="ct-spin" /> Sending…</>
                  ) : channel === 'whatsapp' ? (
                    <><MessageCircle size={15} /> Send via WhatsApp</>
                  ) : (
                    <><Send size={15} /> Send Email</>
                  )}
                </button>
              </>
            )}
          </div>

          {/* ── RIGHT: INFO + SOCIALS ── */}
          <div className="ct-info-panel" ref={infoRef}>

            {/* Top card */}
            {/* <div className="ct-info-top">
              <div className="ct-avail">
                <span className="ct-avail-dot" />
                Available for new opportunities
              </div>
              <p className="ct-info-text">
                I build fast, clean, and impactful software. Whether it's a freelance gig,
                a collaboration, or just a conversation — reach out, I respond quickly.
              </p>
              <div className="ct-stat-row">
                <div className="ct-stat">
                  <span className="ct-stat-val">24h</span>
                  <span className="ct-stat-label">Response time</span>
                </div>
                <div className="ct-stat-divider" />
                <div className="ct-stat">
                  <span className="ct-stat-val">Open</span>
                  <span className="ct-stat-label">to remote work</span>
                </div>
                <div className="ct-stat-divider" />
                <div className="ct-stat">
                  <span className="ct-stat-val">3+</span>
                  <span className="ct-stat-label">years building</span>
                </div>
              </div>
            </div> */}

            {/* Social rows */}
            <div className="ct-soc-list">
              {SOCIALS.map(({ id, label, sub, href, Icon }, i) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ct-soc-row"
                  ref={el => (socRowsRef.current[i] = el)}
                >
                  <div className="ct-soc-icon">
                    <Icon size={16} />
                  </div>
                  <div className="ct-soc-txt">
                    <span className="ct-soc-name">{label}</span>
                    <span className="ct-soc-sub">{sub}</span>
                  </div>
                  <ChevronRight size={14} className="ct-soc-chev" />
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;