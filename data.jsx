import {
  Brain,
  Code2,
  Cpu,
  Github,
  ShoppingCart,
  Dumbbell,
  Instagram,
  Wrench,
  HeartPulse,
  Sprout,
  Laptop,
  Linkedin,
  ShieldAlert,
  Mail,
  MessageCircle,
  Server,
  Terminal,
  Stethoscope,
  Gamepad2,
  ShieldCheck,
} from "lucide-react";
import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaNodeJs,
  FaJava,
  FaGitAlt,
} from "react-icons/fa";

import {
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiReact,
  SiExpress,
  SiSocketdotio,
  SiMongodb,
  SiPostgresql,
  SiPython,
  SiFirebase,
  SiVercel,
  SiPostman,
  SiGreensock,
} from "react-icons/si";

import { DiGit } from "react-icons/di";

export const roles = [
  "Full Stack Developer",
  "GTM Engineer",
  "Code Ninja",
  "Problem Solver",
  "Tech Enthusiast",
];

export const categoriesData = [
  {
    id: "frontend",
    name: "Frontend",
    icon: Code2,
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "React Native",
    ],
  },
  {
    id: "backend",
    name: "Backend",
    icon: Server,
    skills: ["Node.js", "Express", "Socket.IO", "MongoDB", "PostgreSQL"],
  },
  {
    id: "languages",
    name: "Languages",
    icon: Cpu,
    skills: ["C", "Python", "Java"],
  },
  {
    id: "ai",
    name: "AI & Data",
    icon: Brain,
    skills: ["Machine Learning", "Data Visualization", "Data Analysis"],
  },
  {
    id: "tools",
    name: "Tools",
    icon: Wrench,
    skills: ["Git", "GitBash", "VS Code", "Postman", "Vercel", "Firebase", "GSAP"],
  },
];

export const GAME_SKILLS = [
  { name: "HTML", color: "#E34F26", icon: "html" },
  { name: "CSS", color: "#1572B6", icon: "css" },
  { name: "JavaScript", color: "#F7DF1E", icon: "js" },
  { name: "TypeScript", color: "#3178C6", icon: "ts" },
  { name: "React", color: "#61DAFB", icon: "react" },
  { name: "Next.js", color: "#ffffff", icon: "next" },
  { name: "Tailwind CSS", color: "#38BDF8", icon: "tailwind" },
  { name: "React Native", color: "#61DAFB", icon: "react" },
  { name: "Node.js", color: "#68A063", icon: "node" },
  { name: "Express", color: "#aaaaaa", icon: "express" },
  { name: "Socket.IO", color: "#ffffff", icon: "socket" },
  { name: "MongoDB", color: "#47A248", icon: "mongo" },
  { name: "PostgreSQL", color: "#336791", icon: "postgres" },

  { name: "C", color: "#A8B9CC", icon: "c" },
  { name: "Machine Learning", color: "#FF6F00", icon: "ml" },
  { name: "Data Visualization", color: "#FF4081", icon: "dataviz" },
  { name: "Data Analysis", color: "#00C853", icon: "data" },
  { name: "DSA", color: "#FF6B6B", icon: "dsa" },

  { name: "Python", color: "#FFD43B", icon: "python" },
  { name: "Java", color: "#f89820", icon: "java" },
  { name: "Git", color: "#F05032", icon: "git" },
  { name: "GitBash", color: "#4EAA25", icon: "gitbash" },
  { name: "VS Code", color: "#007ACC", icon: "vscode" },
  { name: "Postman", color: "#FF6C37", icon: "postman" },
  { name: "Firebase", color: "#FFCA28", icon: "firebase" },
  { name: "Vercel", color: "#ffffff", icon: "vercel" },
  { name: "GSAP", color: "#88CE02", icon: "gsap" },
];

export const PROJECTS = [
  {
    id: 8,
    title: "DevOS",
    short: "All-in-one Developer Workspace",
    tag: "Platform",
    icon: Terminal,
    accentColor: "#6366f1",
    year: "2026",
    description:
      "One developer identity for GitHub, LeetCode, Codeforces and GeeksforGeeks — teams and Kanban boards, DSA practice, everyday dev utilities and a public leaderboard.",
    longDesc:
      "DevOS brings the places a developer works into a single workspace: team boards with sprint planning, a performance view that pulls activity from GitHub, LeetCode, Codeforces and GeeksforGeeks, a structured DSA sheet grouped by topic, a toolkit of JSON/JWT/regex utilities, and a launch showcase for projects. Currently in early access.",
    tech: ["Next.js", "TypeScript", "MongoDB", "TailwindCSS"],
    features: [
      "Teams & Kanban Boards",
      "Cross-platform Performance View",
      "DSA Sheet",
      "Developer Toolkit",
      "Leaderboard",
    ],
    github: "https://github.com/Ashok-Dd/DevOS",
    live: "https://developer-os-delta.vercel.app",
    num: "01",
    stats: [
      { label: "Platforms", val: "4" },
      { label: "Status", val: "Early Access" },
    ],
  },
  {
    id: 0,
    title: "AEVUM GYM Landing Page",
    short: "Premium Fitness Platform",
    tag: "Landing Page",
    rating: "4.9",
    icon: Dumbbell,
    accentColor: "#f97316",
    year: "2026",

    description:
      "A modern gym landing page designed to attract new members, showcase trainers, highlight fitness programs, and drive membership registrations.",

    longDesc:
      "Developed a high-converting fitness website for AEVUM Gym featuring membership plans, trainer profiles, workout programs, BMI calculator, testimonials, and contact forms. The platform focuses on user engagement through smooth animations, responsive design, and a premium user experience optimized for both desktop and mobile users.",

    tech: ["Next.js", "TailwindCSS", "GSAP"],

    features: [
      "Membership Plans",
      "Trainer Profiles",
      "Workout Programs",
      "BMI Calculator",
      "Men's & Women's Fitness",
      "GSAP Animations",
      "Online Registration",
      "Responsive Design",
    ],

    github: "https://github.com/Ashok-Dd/gym-landing-page",

    live: "https://aevum-gym.vercel.app/",

    num: "02",

    stats: [
      { label: "Performance", val: "98%" },
      { label: "Mobile Score", val: "100%" },
      { label: "Page Speed", val: "<1s" },
    ],
  },
  {
    id: 1,
    title: "Karta Shopping Platform",
    short: "E-Commerce Platform",
    tag: "E-Commerce",
    rating: "4.9",
    icon: ShoppingCart,
    accentColor: "#ff4d6d",
    year: "2025",
    description:
      "A full-featured e-commerce platform with product listings, cart system, authentication, and secure checkout flow.",
    longDesc:
      "Built a scalable and modern e-commerce platform with product filtering, user authentication, cart management, and order tracking. Designed for performance and smooth UX with a responsive UI and optimized API calls.",
    tech: ["Next.js", "Postgres", "NeonDB", "TailwindCSS", "Razor pay"],
    features: [
      "Product Catalog",
      "Cart & Checkout",
      "Auth System",
      "Order Tracking",
    ],
    github: "https://github.com/Ashok-Dd/karta-shopping-kart",
    live: "https://karta-ecommerce.vercel.app/",
    num: "03",
    stats: [
      { label: "Users", val: "1.8K" },
      { label: "Orders", val: "5K+" },
      { label: "Conversion", val: "12%" },
    ],
  },
  {
    id: 2,
    title: "Student Dashboard",
    short: "Education Platform",
    tag: "Education",
    rating: "4.8",
    icon: Laptop,
    accentColor: "#00d4ff",
    year: "2025",
    description:
      "A comprehensive student management system with real-time analytics, course tracking, and admin panel — built for educational institutions.",
    longDesc:
      "Engineered a full-stack education platform featuring real-time student analytics, granular course tracking, and a multi-role admin panel. The system handles attendance, grading, scheduling, and parent notifications — all within a responsive, themeable interface.",
    tech: ["React", "Node.js", "MongoDB", "TailwindCSS", "Express.js"],
    features: [
      "Real-time Analytics",
      "Multi-role Auth",
      "Course Tracking",
      "Admin Panel",
    ],
    github: "https://github.com/Ashok-Dd/student-dashboard",
    live: "https://student-dashboard-two-sandy.vercel.app/",
    num: "04",
    stats: [
      { label: "Users", val: "2.4K" },
      { label: "Uptime", val: "99.9%" },
      { label: "Speed", val: "<2s" },
    ],
  },
  {
    id: 3,
    title: "Code Space",
    short: "Snippet Storage",
    tag: "Utility",
    rating: "4.7",
    icon: Code2,
    accentColor: "#1abc9c",
    year: "2024",
    description:
      "Save code snippets via unique ID and retrieve via URL. A minimal, efficient MERN tool for storing and sharing code instantly.",
    longDesc:
      "A zero-friction code sharing utility that generates a unique URL per snippet, enabling instant retrieval and sharing without accounts. Supports syntax highlighting for 40+ languages, expiry controls, and a privacy toggle.",
    tech: ["MongoDB", "Express.js", "React", "Node.js", "TailwindCSS"],
    features: [
      "Unique URL Share",
      "Syntax Highlighting",
      "Privacy Toggle",
      "Expiry Control",
    ],
    github: "https://github.com/Ashok-Dd/code-space",
    live: "https://code-space-beta-ten.vercel.app/",
    num: "05",
    stats: [
      { label: "Snippets", val: "10K+" },
      { label: "Langs", val: "40+" },
      { label: "Avg Load", val: "0.3s" },
    ],
  },
  {
    id: 4,
    title: "DevTools Playground",
    short: "Developer Toolkit",
    tag: "Tooling",
    rating: "4.8",
    icon: Wrench,
    accentColor: "#f59e0b",
    year: "2025",
    description:
      "A powerful MERN developer toolkit: API Tester, JSON↔CSV Converter, JWT Decoder, URL Encoder, Regex Tester — all in one clean UI.",
    longDesc:
      "An all-in-one developer utility belt combining the most-used daily tools. Features a full API tester with history, bidirectional JSON↔CSV, JWT inspection, smart URL encoding, and a live Regex tester with Google OAuth.",
    tech: ["MongoDB", "Express.js", "React", "Node.js", "TailwindCSS"],
    features: ["API Tester", "JSON ↔ CSV", "JWT Decoder", "Regex Tester"],
    github: "https://github.com/Ashok-Dd/DevTools-Playground",
    live: "https://dev-tools-playground.vercel.app/",
    num: "06",
    stats: [
      { label: "Tools", val: "8" },
      { label: "OAuth", val: "Google" },
      { label: "Requests", val: "50K+" },
    ],
  },
  {
    id: 5,
    title: "HealVerse",
    short: "AI Health Companion",
    tag: "Health",
    rating: "4.9",
    icon: HeartPulse,
    accentColor: "#a855f7",
    year: "2025",
    description:
      "An AI-driven mobile health app covering medication tracking, guided meditation, and personalized diet planning — all in one place.",
    longDesc:
      "HealVerse is a fully AI-powered mobile healthcare companion built with React Native. It delivers intelligent medication reminders, adaptive meditation sessions, and personalized diet plans through a Spring Boot backend and PostgreSQL, styled with NativeWind for a clean, native feel.",
    tech: ["React Native", "Spring Boot", "PostgreSQL", "NativeWind"],
    features: [
      "AI Medication Tracking",
      "Guided Meditation",
      "Diet Planning",
      "Health Analytics",
    ],
    github: "https://github.com/Srikar132/healverse-server",
    live: "https://github.com/Srikar132/healverse-server",
    num: "07",
    stats: [
      { label: "AI Modules", val: "3" },
      { label: "Platform", val: "Mobile" },
      { label: "Stack", val: "Full" },
    ],
  },
  {
    id: 6,
    title: "AgriAssist",
    short: "Smart Farming Platform",
    tag: "AgriTech",
    rating: "4.9",
    icon: Sprout,
    accentColor: "#22c55e",
    year: "2025",
    description:
      "A complete AI-powered farming companion — crop recommendation, disease detection, voice navigation, expense diary, and debt management for farmers.",
    longDesc:
      "AgriAssist is a React Native mobile platform built entirely for farmers. It features a chat and voice bot interface, deep learning-based crop disease detection, a smart crop recommendation engine, automated task scheduling, voice navigation, and a full expense and debt management system — all accessible offline-first.",
    tech: ["React Native", "Node.js", "MongoDB", "NativeWind", "TensorFlow"],
    features: [
      "Disease Detection (DL)",
      "Voice & Chat Bot",
      "Crop Recommendation",
      "Expense & Debt Diary",
    ],
    github: "https://github.com/Ashok-Dd/agriassist-backend",
    live: "https://github.com/Ashok-Dd/agriassist-backend",
    num: "08",
    stats: [
      { label: "DL Model", val: "Custom" },
      { label: "Platform", val: "Mobile" },
      { label: "Users", val: "Farmers" },
    ],
  },
  {
    id: 7,
    title: "RAT3",
    short: "Cyber Security Shield",
    tag: "Security",
    rating: "4.8",
    icon: ShieldAlert,
    accentColor: "#ef4444",
    year: "2025",
    description:
      "A Flutter + Kotlin mobile security app designed to detect, prevent, and alert users against RAT (Remote Access Trojan) attacks in real time.",
    longDesc:
      "RAT3 is a cybersecurity-focused mobile application built with Flutter and Kotlin that actively monitors device behavior to detect Remote Access Trojan intrusions. It provides real-time threat alerts, permission auditing, suspicious process detection, and a security dashboard — giving users full visibility and control over their device integrity.",
    tech: ["Flutter", "Kotlin"],
    features: [
      "RAT Detection",
      "Permission Auditing",
      "Real-time Alerts",
      "Security Dashboard",
    ],
    github: "https://github.com/Ashok-Dd/postinstallation_rat3",
    live: "https://github.com/Ashok-Dd/postinstallation_rat3",
    num: "09",
    stats: [
      { label: "Platform", val: "Mobile" },
      { label: "Threat DB", val: "Live" },
      { label: "Detection", val: "Real-time" },
    ],
  },
];

export const LEETCODE_DATA = {
  total: 724,
  easy: 358,
  medium: 327,
  hard: 39,
};

export const experienceData = [
  {
    id: "cocomply",
    role: "GTM Engineer",
    company: "CoComply AS",
    logo: "/cocomply-logo.webp",
    period: "Present",
    type: "Internship",
    summary:
      "Working at the intersection of engineering and go-to-market at CoComply — building the systems, automations and data flows that help the team find, reach and convert customers.",
    points: [
      "Engineering the go-to-market stack: pipelines, automations and integrations",
      "Bridging product, sales and data to speed up outreach and onboarding",
    ],
    tags: ["GTM", "Automation", "Data", "Full Stack"],
  },
];

export const freelanceData = {
  eyebrow: "Open for Commissions",
  title: "Freelance Work",
  subtitle: "Independent · End-to-end · Shipped",
  blurb:
    "Alongside my day job I work as a freelance developer — taking products from idea to production for founders and small teams: mobile apps, backends, admin dashboards and landing sites.",
  services: [
    "Mobile Apps (Flutter / React Native)",
    "Web Apps (Next.js)",
    "Backends & APIs",
    "Admin Dashboards",
  ],
  cta: { label: "Hire me for a project", target: "contact" },
  process: [
    { n: "01", title: "Discover", text: "We align on the problem, the users and a realistic scope." },
    { n: "02", title: "Design", text: "Flows, UI and a clear plan before a single line of code." },
    { n: "03", title: "Build", text: "Clean full-stack code, built in iterations with regular demos." },
    { n: "04", title: "Ship", text: "Deploy, hand over, and stay on hand for support." },
  ],
};

export const FREELANCE_PROJECTS = [
  {
    id: "opflow",
    title: "OPflow",
    short: "OPD Appointment & Patient-Flow Platform",
    icon: Stethoscope,
    accentColor: "#14b8a6",
    description:
      "Right patient, right doctor, at the right time — a patient + doctor app with live queue, booking, rescheduling and payments, backed by an API, an admin console and a landing site.",
    tech: ["Flutter", "NestJS", "TypeScript", "Next.js"],
    parts: [
      { label: "Mobile App", href: "https://github.com/Ashok-Dd/opflow-app", live: "https://opflow-alpha.vercel.app" },
      { label: "Admin", href: "https://github.com/Ashok-Dd/opflow-admin", live: "https://opflow-admin.vercel.app" },
      { label: "Backend", href: "https://github.com/Ashok-Dd/opflow-backend" },
      { label: "Website", href: "https://github.com/Ashok-Dd/opflow", live: "https://opflow-landing-indol.vercel.app" },
    ],
  },
  {
    id: "card-cricket",
    title: "Card Cricket",
    short: "Real-time Multiplayer Card Game",
    icon: Gamepad2,
    accentColor: "#f59e0b",
    description:
      "A mobile-only, real-time multiplayer cricket card game — Top-Trumps-style stat battles with collectible player cards.",
    tech: ["Flutter", "NestJS", "Postgres", "Redis"],
    parts: [{ label: "Source", href: "https://github.com/Ashok-Dd/card-cricket" }],
  },
  {
    id: "bsafe",
    title: "BSafe",
    short: "Freelance Project",
    icon: ShieldCheck,
    accentColor: "#ef4444",
    description:
      "Built for a client as part of my freelance work. Full write-up coming soon.",
    tech: [],
    parts: [],
  },
];


export const SOCIALS = [
  {
    id: "github",
    label: "GitHub",
    sub: "@Ashok-Dd",
    href: "https://github.com/Ashok-Dd",
    Icon: Github,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    sub: "Bongu Ashok",
    href: "https://linkedin.com/in/ashok-bongu",
    Icon: Linkedin,
  },
  {
    id: "instagram",
    label: "Instagram",
    sub: "@ashok_devil_123",
    href: "https://instagram.com/ashok_devil_123",
    Icon: Instagram,
  },
  {
    id: "email",
    label: "Email",
    sub: "bonguashok86@gmail.com",
    href: "mailto:bonguashok86@gmail.com",
    Icon: Mail,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    sub: "+91 9392954525",
    href: "https://wa.me/9392954525",
    Icon: MessageCircle,
  },
];

export const links = [
  { icon: Github, href: "https://github.com/Ashok-Dd", label: "GitHub" },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/ashok-bongu",
    label: "LinkedIn",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/ashok_devil_123",
    label: "Instagram",
  },
  { icon: Mail, href: "mailto:bonguashok86@gmail.com", label: "Email" },
  { icon: MessageCircle, href: "https://wa.me/9392954525", label: "WhatsApp" },
];

export const heroData = {
  eyebrow: "Welcome to my world",
  availableText: "Open to Work",
  name: "Ashok",
  bio: "Crafting elegant solutions to complex problems. Turning caffeine into code and ideas into reality. Master of the digital realm, wielding keyboards like katanas.",
  stats: [
    { num: "10+", label: "Projects Built" },
    { num: "2+", label: "Years Coding" },
    { num: "20+", label: "Tech Mastered" },
  ],
  profileImage: "/profile-cyber.webp",
  cvUrl: "/Ashok-Resume.pdf",
  badges: [
    { text: "const ninja = true", pos: "top" },
    { text: "<Coding />", pos: "bot" },
  ],
};

export const navItems = [
  "Home",
  "Skills",
  "Experience",
  "Projects",
  "Freelance",
  "Arcade",
  "Leetcode",
  "Contact",
];

export const footerData = {
  tagline: "GTM Engineer · Freelance Full-Stack Developer",
  taglineSub: "Building products that ship — web, mobile and 3D.",
  statusBadge: "Open to freelance work",
  statusDesc: "GTM Engineer at CoComply · open to freelance projects & collabs.",
  resumeUrl: "/Ashok-Resume.pdf",
  navLinks: ["Home", "Skills", "Experience", "Projects", "Freelance", "Arcade", "Leetcode", "Contact"],
  contact: {
    email: "bonguashok86@gmail.com",
    emailHref: "mailto:bonguashok86@gmail.com",
    phone: "+91 9392954525",
    phoneHref: "https://wa.me/9392954525",
    github: "github.com/Ashok-Dd",
    githubHref: "https://github.com/Ashok-Dd",
  },
  builtWith: "Built with React · Vite · TailwindCSS · GSAP",
  copyright: "Ashok Bongu",
};

export const leetcodeProfile = {
  username: "@b_ashok",
  profileUrl: "https://leetcode.com/u/b_ashok",
  avatarImage: "/me1.webp",
  rankBadge: "365 Days Badge",
};
