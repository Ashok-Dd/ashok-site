# Ashok Bongu — Portfolio

React 19 + Vite + Tailwind CSS 4, animated with GSAP. Seven switchable themes (click the photo "O" in the hero or use the navbar dots), each with its own skills mini-game.

## Sections

Home · Skills · Experience · Projects · Freelance · LeetCode · Contact

All content lives in [data.jsx](data.jsx) (projects, experience, freelance work, socials, LeetCode stats).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Config

Contact form needs `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, `VITE_WHATSAPP_NUMBER` in `.env`.

Drop the CoComply logo at `public/cocomply-logo.png` (shown on the Experience card; falls back to initials).
