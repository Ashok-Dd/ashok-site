import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Loader2, CornerDownLeft, ArrowUpRight, MapPin, Globe, Briefcase } from 'lucide-react';
import { SOCIALS, footerData } from '../../data';
import useTilt from '../hooks/useTilt';

gsap.registerPlugin(ScrollTrigger);

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const WHATSAPP_NUMBER     = import.meta.env.VITE_WHATSAPP_NUMBER || '919392954525';

const fmtTime = () => {
  try { return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

/** tiny spark burst from an element, used when a message goes out */
const burst = (el) => {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#1abc9c';
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('i');
    Object.assign(s.style, { position: 'fixed', left: `${cx}px`, top: `${cy}px`, width: '6px', height: '6px', borderRadius: i % 2 ? '50%' : '1px',
      background: accent, boxShadow: `0 0 8px ${accent}`, zIndex: 9990, pointerEvents: 'none' });
    document.body.appendChild(s);
    gsap.to(s, {
      x: gsap.utils.random(-180, 180), y: gsap.utils.random(-160, 120), rotation: gsap.utils.random(-300, 300),
      opacity: 0, scale: 0.2, duration: gsap.utils.random(0.7, 1.2), ease: 'power3.out', onComplete: () => s.remove(),
    });
  }
};

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [channel, setChannel] = useState('whatsapp');
  const [time, setTime] = useState(fmtTime);
  const sectionRef = useRef(null);
  const sendRef = useRef(null);
  useTilt(sectionRef, '.cx-box', 22);
  useTilt(sectionRef, '.cx-term', 4);

  useEffect(() => {
    const id = setInterval(() => setTime(fmtTime()), 20000);
    return () => clearInterval(id);
  }, []);

  /* EmailJS SDK */
  useEffect(() => {
    if (!document.getElementById('emailjs-sdk')) {
      const s = document.createElement('script');
      s.id = 'emailjs-sdk';
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.onload = () => window.emailjs?.init(EMAILJS_PUBLIC_KEY);
      document.head.appendChild(s);
    } else {
      window.emailjs?.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cx-line', {
        yPercent: 110, opacity: 0, duration: 1, stagger: 0.14, ease: 'power4.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
      gsap.from('.cx-status, .cx-lead', {
        opacity: 0, y: 20, duration: 0.7, stagger: 0.1, delay: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
      gsap.from('.cx-term', {
        opacity: 0, y: 70, rotateX: -12, transformPerspective: 1000, duration: 1, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: '.cx-grid', start: 'top 85%', once: true },
      });
      gsap.from('.cx-slot', {
        opacity: 0, y: 60, duration: 0.8, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: '.cx-grid', start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const complete = form.name.trim() && form.email.trim() && form.message.trim();

  const done = () => {
    setStatus('success');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => burst(document.querySelector('.cx-ok')), 60);
  };

  const sendWhatsApp = () => {
    const text = encodeURIComponent(`Hi Ashok! 👋\nName: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    done();
  };

  const sendEmail = async () => {
    if (!window.emailjs) throw new Error('EmailJS not loaded');
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: form.name, from_email: form.email, message: form.message, to_email: footerData.contact.email,
    });
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!complete || status === 'loading') return;
    setStatus('loading');
    try {
      if (channel === 'whatsapp') sendWhatsApp();
      else { await sendEmail(); done(); }
    } catch {
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
      window.location.href = `mailto:${footerData.contact.email}?subject=Message from ${form.name}&body=${body}`;
      done();
    }
  };

  const channels = SOCIALS.filter((s) => s.id !== 'whatsapp' || true);

  return (
    <section id="contact" ref={sectionRef} className="cx">
      <div className="cx-bg" aria-hidden="true" />

      <div className="cx-head">
        <div className="cx-status">
          <span className="cx-live" />Open for freelance &amp; collabs
        </div>
        <h2 className="cx-title" aria-label="Let's build something great together">
          <span className="cx-mask"><span className="cx-line">Let&apos;s build</span></span>
          <span className="cx-mask"><span className="cx-line cx-line-grad">something great.</span></span>
        </h2>
        <p className="cx-lead">Got a product, a prototype or a problem? Tell me about it — I&apos;ll come back with a plan.</p>
        <div className="cx-chips">
          <span><MapPin size={13} />India · {time} IST</span>
          <span><Globe size={13} />Remote-friendly</span>
          <span><Briefcase size={13} />Freelance &amp; full-time</span>
        </div>
      </div>

      <div className="cx-grid">
        {/* ── terminal form ── */}
        <form className="cx-term" onSubmit={submit}>
          <div className="cx-term-bar">
            <i /><i /><i />
            <span>~/ashok/contact — new_message</span>
          </div>

          {status === 'success' ? (
            <div className="cx-term-body cx-ok">
              <p><b>$</b> send --via {channel}</p>
              <p className="cx-ok-line">✓ {channel === 'whatsapp' ? 'WhatsApp opened — hit send to deliver it.' : 'message delivered.'}</p>
              <p className="cx-dim">I&apos;ll get back to you soon.</p>
              <button type="button" className="cx-send" onClick={() => setStatus('idle')}>$ new message</button>
            </div>
          ) : (
            <div className="cx-term-body">
              <p className="cx-dim"># route it where you like</p>
              <div className="cx-via">
                <span><b>$</b> send --via</span>
                <button type="button" className={channel === 'whatsapp' ? 'on' : ''} onClick={() => setChannel('whatsapp')}>whatsapp</button>
                <button type="button" className={channel === 'email' ? 'on' : ''} onClick={() => setChannel('email')}>email</button>
              </div>

              <label className="cx-row"><span>name<em>›</em></span>
                <input name="name" value={form.name} onChange={onChange} placeholder="your name" autoComplete="name" disabled={status === 'loading'} />
              </label>
              <label className="cx-row"><span>email<em>›</em></span>
                <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@company.com" autoComplete="email" disabled={status === 'loading'} />
              </label>
              <label className="cx-row cx-row-area"><span>message<em>›</em></span>
                <textarea name="message" rows={4} value={form.message} onChange={onChange} placeholder="what are we building?" disabled={status === 'loading'} />
              </label>

              <button ref={sendRef} type="submit" className="cx-send" disabled={!complete || status === 'loading'}>
                {status === 'loading' ? <><Loader2 size={15} className="cx-spin" />sending…</> : <><Send size={14} />send<CornerDownLeft size={14} /></>}
              </button>
            </div>
          )}
          <div className="cx-term-foot">
            <span>channel: {channel}</span>
            <span>{form.message.length} chars</span>
            <span className="cx-ready"><i />{status === 'loading' ? 'sending' : status === 'success' ? 'sent' : 'ready'}</span>
          </div>
        </form>

        {/* ── 3D channel slabs ── */}
        <div className="cx-side">
          <p className="cx-side-title"><span />Or reach me directly<span /></p>
          <div className="cx-channels">
            {channels.map(({ id, label, sub, href, Icon }) => (
              <div key={id} className="cx-slot">
                <a className="cx-box" href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" aria-label={`${label}: ${sub}`}>
                  <span className="cx-face cx-front">
                    <span className="cx-spot" aria-hidden="true" />
                    <span className="cx-ico"><Icon size={22} /></span>
                    <span className="cx-txt">
                      <span className="cx-lbl">{label}</span>
                      <span className="cx-sub">{sub}</span>
                    </span>
                    <ArrowUpRight size={18} className="cx-go" />
                  </span>
                  <span className="cx-face cx-side-f cx-r" />
                  <span className="cx-face cx-side-f cx-l" />
                  <span className="cx-face cx-cap cx-t" />
                  <span className="cx-face cx-cap cx-b" />
                  <span className="cx-face cx-back" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .cx { position:relative; isolation:isolate; overflow:hidden; background:var(--color-bg-sunken); color:var(--color-text-primary); padding:120px 24px 110px; }
        .cx-bg { position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 60% 45% at 50% 0%, var(--color-accent-muted), transparent 70%),
            radial-gradient(ellipse 40% 40% at 100% 100%, var(--color-accent-subtle), transparent 70%),
            linear-gradient(var(--color-border) 1px, transparent 1px) 0 0/56px 56px, linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0/56px 56px; opacity:.7; }

        .cx-head { position:relative; text-align:center; margin-bottom:64px; }
        .cx-status { display:inline-flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center; padding:8px 18px; border-radius:var(--radius-full);
          border:1px solid var(--color-accent-border); background:var(--color-accent-subtle); color:var(--color-accent);
          font-family:var(--font-mono); font-size:.64rem; letter-spacing:.2em; text-transform:uppercase; }
        .cx-live { width:8px; height:8px; border-radius:50%; background:var(--color-success); animation:cxLive 1.8s ease-out infinite; }
        @keyframes cxLive { 0% { box-shadow:0 0 0 0 color-mix(in srgb,var(--color-success) 60%,transparent); } 100% { box-shadow:0 0 0 12px transparent; } }
        .cx-sep { width:1px; height:12px; background:var(--color-accent-border); }
        .cx-title { margin:28px 0 22px; font-family:var(--font-display); font-weight:900; line-height:1.02; letter-spacing:.02em; font-size:clamp(2.6rem, 8.2vw, 6.4rem); }
        .cx-mask { display:block; overflow:hidden; padding:.06em 0; }
        .cx-title { perspective:900px; }
        .cx-line { display:inline-block; color:var(--color-text-primary); text-shadow:0 1px 0 var(--color-accent-dark), 0 2px 0 var(--color-accent-dark), 0 3px 0 var(--color-accent-dark), 0 4px 0 var(--color-accent-dark), 0 5px 0 var(--color-accent-dark), 0 14px 26px rgba(0,0,0,.55); }
        .cx-line-grad { text-shadow:none; filter:drop-shadow(0 4px 0 var(--color-accent-dark)) drop-shadow(0 12px 18px rgba(0,0,0,.5)); }
        .cx-line-grad { background:linear-gradient(110deg,var(--color-accent) 20%,var(--color-accent-light) 45%,var(--color-accent) 70%); background-size:220% 100%; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:cxShine 6s linear infinite; }
        @keyframes cxShine { to { background-position:-220% 0; } }
        .cx-lead { max-width:560px; margin:0 auto; font-family:var(--font-body); font-size:1rem; line-height:1.75; color:var(--color-text-secondary); }

        .cx-grid { position:relative; max-width:1160px; margin:0 auto; display:grid; grid-template-columns:1.15fr 1fr; gap:44px; align-items:start; perspective:1400px; }

        /* terminal */
        .cx-term { --rx:0deg; --ry:0deg; border-radius:var(--radius-xl); overflow:hidden; border:1px solid var(--color-accent-border);
          background:linear-gradient(160deg,var(--color-bg-elevated),var(--color-bg-primary)); box-shadow:var(--shadow-xl), 0 0 60px var(--color-accent-subtle);
          transform:rotateX(var(--rx)) rotateY(var(--ry)); transform-style:preserve-3d; transition:transform .25s ease-out; font-family:var(--font-mono); }
        .cx-term-bar { display:flex; align-items:center; gap:8px; padding:14px 18px; background:var(--color-bg-glass); border-bottom:1px solid var(--color-border); }
        .cx-term-bar i { width:11px; height:11px; border-radius:50%; background:var(--color-border-strong); }
        .cx-term-bar i:nth-child(1) { background:#ff5f57; } .cx-term-bar i:nth-child(2) { background:#febc2e; } .cx-term-bar i:nth-child(3) { background:#28c840; }
        .cx-term-bar span { margin-left:10px; font-size:.68rem; letter-spacing:.12em; color:var(--color-text-muted); }
        .cx-term-body { padding:26px 26px 28px; display:grid; gap:16px; font-size:.86rem; }
        .cx-term-body p { margin:0; color:var(--color-text-secondary); }
        .cx-term-body b { color:var(--color-accent); margin-right:8px; }
        .cx-dim { color:var(--color-text-muted) !important; }
        .cx-via { display:flex; align-items:center; gap:10px; flex-wrap:wrap; color:var(--color-text-secondary); }
        .cx-via button { cursor:pointer; padding:5px 13px; border-radius:var(--radius-full); border:1px solid var(--color-border-strong); background:transparent; color:var(--color-text-secondary);
          font-family:inherit; font-size:.76rem; transition:all .2s; }
        .cx-via button:hover { border-color:var(--color-accent); color:var(--color-text-primary); }
        .cx-via button.on { background:var(--color-accent); border-color:var(--color-accent); color:var(--color-bg-primary); font-weight:700; }
        .cx-row { display:grid; grid-template-columns:92px 1fr; align-items:center; gap:10px; padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--color-border);
          background:var(--color-bg-sunken); transition:border-color .25s, box-shadow .25s; cursor:text; }
        .cx-row:focus-within { border-color:var(--color-accent); box-shadow:0 0 0 3px var(--color-accent-muted); }
        .cx-row span { color:var(--color-accent); font-size:.74rem; letter-spacing:.08em; }
        .cx-row em { font-style:normal; margin-left:6px; color:var(--color-text-muted); }
        .cx-row input, .cx-row textarea { width:100%; background:transparent; border:0; outline:0; resize:none; color:var(--color-text-primary); font-family:inherit; font-size:.88rem; caret-color:var(--color-accent); }
        .cx-row input::placeholder, .cx-row textarea::placeholder { color:var(--color-text-muted); }
        .cx-row-area { align-items:flex-start; } .cx-row-area span { padding-top:3px; }
        .cx-send { justify-self:start; display:inline-flex; align-items:center; gap:9px; cursor:pointer; padding:13px 24px; border-radius:var(--radius-md); border:0;
          font-family:var(--font-mono); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-on-light);
          background:linear-gradient(135deg,var(--color-accent),var(--color-accent-light)); box-shadow:var(--shadow-accent); transition:transform .25s, box-shadow .25s, opacity .25s; }
        .cx-send:hover:not(:disabled) { transform:translateY(-3px); box-shadow:var(--shadow-glow); }
        .cx-send:disabled { opacity:.35; cursor:not-allowed; box-shadow:none; }
        .cx-spin { animation:cxSpin 1s linear infinite; } @keyframes cxSpin { to { transform:rotate(360deg); } }
        .cx-ok-line { color:var(--color-success) !important; font-weight:700; }

        .cx-term-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:11px 22px; border-top:1px solid var(--color-border); background:var(--color-bg-glass);
          font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--color-text-muted); }
        .cx-ready { display:inline-flex; align-items:center; gap:7px; color:var(--color-success); }
        .cx-ready i { width:7px; height:7px; border-radius:50%; background:var(--color-success); animation:cxLive 1.8s ease-out infinite; }
        .cx-chips { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:26px; }
        .cx-chips span { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:var(--radius-full); border:1px solid var(--color-border-strong); background:var(--color-bg-glass);
          font-family:var(--font-mono); font-size:.64rem; letter-spacing:.16em; text-transform:uppercase; color:var(--color-text-secondary); }
        .cx-chips svg { color:var(--color-accent); }

        /* 3D channel slabs */
        .cx-side-title { display:flex; align-items:center; justify-content:center; gap:14px; margin:0 0 26px; font-family:var(--font-mono); font-size:.64rem; letter-spacing:.34em; text-transform:uppercase; color:var(--color-accent); }
        .cx-side-title span { width:34px; height:1px; background:var(--color-accent-border); }
        .cx-channels { display:grid; gap:24px; padding:0 18px; perspective:1200px; }
        .cx-slot { height:86px; animation:cxBob 5.5s ease-in-out infinite; }
        .cx-slot:nth-child(2n) { animation-delay:-1.8s; } .cx-slot:nth-child(3n) { animation-delay:-3.4s; }
        @keyframes cxBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        .cx-box { --rx:0deg; --ry:0deg; --mx:50%; --my:50%; --d:14px; position:relative; display:block; width:100%; height:100%; text-decoration:none; color:inherit; outline:none;
          transform-style:preserve-3d; transform:rotateX(calc(var(--rx) + 6deg)) rotateY(calc(var(--ry) - 10deg)); transition:transform .3s ease-out; }
        .cx-box:focus-visible .cx-front { outline:2px solid var(--color-accent); outline-offset:3px; }
        .cx-face { position:absolute; backface-visibility:hidden; display:block; }
        .cx-front { inset:0; transform:translateZ(var(--d)); display:flex; align-items:center; gap:16px; border-radius:6px; border:1px solid var(--color-accent-border); overflow:hidden; padding:0 20px;
          background:linear-gradient(150deg,var(--color-bg-elevated),var(--color-bg-primary)); box-shadow:inset 0 0 26px var(--color-accent-subtle); transition:border-color .3s, box-shadow .3s; }
        .cx-box:hover .cx-front { border-color:var(--color-accent); box-shadow:inset 0 0 36px var(--color-accent-muted), 0 0 34px var(--color-accent-muted); }
        .cx-spot { position:absolute; inset:0; opacity:0; transition:opacity .3s; background:radial-gradient(260px circle at var(--mx) var(--my), var(--color-accent-muted), transparent 62%); }
        .cx-box:hover .cx-spot { opacity:1; }
        .cx-ico { position:relative; flex:0 0 46px; display:flex; height:46px; align-items:center; justify-content:center; border-radius:13px; color:var(--color-accent); background:var(--color-accent-subtle); border:1px solid var(--color-accent-border); }
        .cx-txt { position:relative; min-width:0; flex:1; display:grid; gap:3px; }
        .cx-lbl { display:block; font-family:var(--font-display); font-size:1rem; font-weight:800; color:var(--color-text-primary); }
        .cx-sub { display:block; font-family:var(--font-mono); font-size:.66rem; letter-spacing:.06em; color:var(--color-text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .cx-go { position:relative; flex-shrink:0; color:var(--color-accent); opacity:.55; transition:transform .25s, opacity .25s; }
        .cx-box:hover .cx-go { opacity:1; transform:translate(4px,-4px); }
        .cx-side-f { background:linear-gradient(90deg,var(--color-accent-dark),color-mix(in srgb,var(--color-accent-dark) 40%,var(--color-bg-primary))); }
        .cx-r { top:0; right:calc(var(--d) * -1); width:calc(var(--d) * 2); height:100%; transform:rotateY(90deg); }
        .cx-l { top:0; left:calc(var(--d) * -1); width:calc(var(--d) * 2); height:100%; transform:rotateY(-90deg); filter:brightness(.7); }
        .cx-cap { background:linear-gradient(180deg,var(--color-accent-light),var(--color-accent)); }
        .cx-t { left:0; top:calc(var(--d) * -1); width:100%; height:calc(var(--d) * 2); transform:rotateX(90deg); }
        .cx-b { left:0; bottom:calc(var(--d) * -1); width:100%; height:calc(var(--d) * 2); transform:rotateX(-90deg); filter:brightness(.55); }
        .cx-back { inset:0; transform:translateZ(calc(var(--d) * -1)) rotateY(180deg); background:var(--color-bg-sunken); }

        @media (max-width:980px) { .cx-grid { grid-template-columns:1fr; gap:48px; } }
        @media (max-width:560px) {
          .cx { padding:84px 16px 80px; }
          .cx-term-body { padding:20px 16px 22px; } .cx-row { grid-template-columns:1fr; gap:4px; }
          .cx-channels { padding:0 8px; } .cx-slot { height:80px; } .cx-term-foot { padding:10px 14px; } .cx-term-foot span:nth-child(2) { display:none; }
        }
        @media (prefers-reduced-motion:reduce) { .cx-line-grad, .cx-live, .cx-spin, .cx-slot { animation:none; } .cx-box, .cx-term { transition:none; } }
      `}</style>
    </section>
  );
};

export default Contact;
