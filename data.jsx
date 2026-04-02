import { Brain, Code2, Cpu, Github, Instagram, Laptop, Linkedin, Mail, MessageCircle, Server, Wrench } from "lucide-react";
import {
  FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaJava, FaGitAlt
} from "react-icons/fa";

import {
  SiTypescript, SiNextdotjs, SiTailwindcss, SiReact, SiExpress,
  SiSocketdotio, SiMongodb, SiPostgresql, SiPython, SiFirebase,
  SiVercel, SiPostman,  SiGreensock
} from "react-icons/si";

import { DiGit } from "react-icons/di";
export const roles = [
    'Full Stack Developer',
    'Code Ninja',
    'Problem Solver',
    'Tech Enthusiast'
];

export const categoriesData = [
  { id: 'frontend',  name: 'Frontend',  icon: Code2,  skills: ['HTML','CSS','JavaScript','TypeScript','React','Next.js','Tailwind CSS','React Native'] },
  { id: 'backend',   name: 'Backend',   icon: Server, skills: ['Node.js','Express','Socket.IO','MongoDB','PostgreSQL'] },
  { id: 'languages', name: 'Languages', icon: Cpu,    skills: ['C','Python','Java'] },
  { id: 'ai',        name: 'AI & Data', icon: Brain,  skills: ['Machine Learning','Data Visualization','Data Analysis'] },
  { id: 'tools',     name: 'Tools',     icon: Wrench, skills: ['Git','GitBash','VS Code','Postman','Firebase','Vercel'] },
];

export const GAME_SKILLS = [
  { name: 'HTML', color: '#E34F26', icon: 'html' },
  { name: 'CSS', color: '#1572B6', icon: 'css' },
  { name: 'JavaScript', color: '#F7DF1E', icon: 'js' },
  { name: 'TypeScript', color: '#3178C6', icon: 'ts' },
  { name: 'React', color: '#61DAFB', icon: 'react' },
  { name: 'Next.js', color: '#ffffff', icon: 'next' },
  { name: 'Tailwind CSS', color: '#38BDF8', icon: 'tailwind' },
  { name: 'React Native', color: '#61DAFB', icon: 'react' },
  { name: 'Node.js', color: '#68A063', icon: 'node' },
  { name: 'Express', color: '#aaaaaa', icon: 'express' },
  { name: 'Socket.IO', color: '#ffffff', icon: 'socket' },
  { name: 'MongoDB', color: '#47A248', icon: 'mongo' },
  { name: 'PostgreSQL', color: '#336791', icon: 'postgres' },

  { name: 'C', color: '#A8B9CC', icon: 'c' },
  { name: 'Machine Learning', color: '#FF6F00', icon: 'ml' },
  { name: 'Data Visualization', color: '#FF4081', icon: 'dataviz' },
  { name: 'Data Analysis', color: '#00C853', icon: 'data' },
  { name: 'DSA', color: '#FF6B6B', icon: 'dsa' },

  { name: 'Python', color: '#FFD43B', icon: 'python' },
  { name: 'Java', color: '#f89820', icon: 'java' },
  { name: 'Git', color: '#F05032', icon: 'git' },
  { name: 'GitBash', color: '#4EAA25', icon: 'gitbash' },
  { name: 'VS Code', color: '#007ACC', icon: 'vscode' },
  { name: 'Postman', color: '#FF6C37', icon: 'postman' },
  { name: 'Firebase', color: '#FFCA28', icon: 'firebase' },
  { name: 'Vercel', color: '#ffffff', icon: 'vercel' },
  { name: 'GSAP', color: '#88CE02', icon: 'gsap' },
];

export const PROJECTS = [
  {
    id: 0,
    title: 'Student Dashboard',
    short: 'Education Platform',
    tag: 'Education',
    rating: '4.8',
    icon: Laptop,
    accentColor: '#00d4ff',
    year: '2024',
    description: 'A comprehensive student management system with real-time analytics, course tracking, and admin panel — built for educational institutions.',
    longDesc: 'Engineered a full-stack education platform featuring real-time student analytics, granular course tracking, and a multi-role admin panel. The system handles attendance, grading, scheduling, and parent notifications — all within a responsive, themeable interface.',
    tech: ['React', 'Node.js', 'MongoDB', 'TailwindCSS', 'Express.js'],
    features: ['Real-time Analytics', 'Multi-role Auth', 'Course Tracking', 'Admin Panel'],
    github: 'https://github.com/Ashok-Dd/student-dashboard',
    live: 'https://student-dashboard-two-sandy.vercel.app/',
    num: '01',
    stats: [{ label: 'Users', val: '2.4K' }, { label: 'Uptime', val: '99.9%' }, { label: 'Speed', val: '<2s' }],
  },
  {
    id: 1,
    title: 'Code Space',
    short: 'Snippet Storage',
    tag: 'Utility',
    rating: '4.7',
    icon: Code2,
    accentColor: '#1abc9c',
    year: '2024',
    description: 'Save code snippets via unique ID and retrieve via URL. A minimal, efficient MERN tool for storing and sharing code instantly.',
    longDesc: 'A zero-friction code sharing utility that generates a unique URL per snippet, enabling instant retrieval and sharing without accounts. Supports syntax highlighting for 40+ languages, expiry controls, and a privacy toggle.',
    tech: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TailwindCSS'],
    features: ['Unique URL Share', 'Syntax Highlighting', 'Privacy Toggle', 'Expiry Control'],
    github: 'https://github.com/Ashok-Dd/code-space',
    live: 'https://code-space-beta-ten.vercel.app/',
    num: '02',
    stats: [{ label: 'Snippets', val: '10K+' }, { label: 'Langs', val: '40+' }, { label: 'Avg Load', val: '0.3s' }],
  },
  {
    id: 2,
    title: 'DevTools Playground',
    short: 'Developer Toolkit',
    tag: 'Tooling',
    rating: '4.8',
    icon: Wrench,
    accentColor: '#f59e0b',
    year: '2024',
    description: 'A powerful MERN developer toolkit: API Tester, JSON↔CSV Converter, JWT Decoder, URL Encoder, Regex Tester — all in one clean UI.',
    longDesc: 'An all-in-one developer utility belt combining the most-used daily tools. Features a full API tester with history, bidirectional JSON↔CSV, JWT inspection, smart URL encoding, and a live Regex tester with Google OAuth.',
    tech: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TailwindCSS'],
    features: ['API Tester', 'JSON ↔ CSV', 'JWT Decoder', 'Regex Tester'],
    github: 'https://github.com/Ashok-Dd/DevTools-Playground',
    live: 'https://dev-tools-playground.vercel.app/',
    num: '03',
    stats: [{ label: 'Tools', val: '8' }, { label: 'OAuth', val: 'Google' }, { label: 'Requests', val: '50K+' }],
  },
];

export const LEETCODE_DATA = {
  total: 554,
  easy: 301,
  medium: 231,
  hard: 22,
};

export const SOCIALS = [
  { id: 'github',    label: 'GitHub',    sub: '@Ashok-Dd',              href: 'https://github.com/Ashok-Dd',           Icon: Github        },
  { id: 'linkedin',  label: 'LinkedIn',  sub: 'Bongu Ashok',            href: 'https://linkedin.com/in/ashok-bongu',   Icon: Linkedin      },
  { id: 'instagram', label: 'Instagram', sub: '@ashok_devil_123',       href: 'https://instagram.com/ashok_devil_123', Icon: Instagram     },
  { id: 'email',     label: 'Email',     sub: 'bonguashok86@gmail.com', href: 'mailto:bonguashok86@gmail.com',         Icon: Mail          },
  { id: 'whatsapp',  label: 'WhatsApp',  sub: '+91 9392954525',         href: 'https://wa.me/9392954525',              Icon: MessageCircle },
];

export const links = [
    { icon: Github,      href: "https://github.com/Ashok-Dd",           label: "GitHub" },
    { icon: Linkedin,    href: "https://linkedin.com/in/ashok-bongu",    label: "LinkedIn" },
    { icon: Instagram,   href: "https://instagram.com/ashok_devil_123",  label: "Instagram" },
    { icon: Mail,        href: "mailto:bonguashok86@email.com",          label: "Email" },
    { icon: MessageCircle, href: "https://wa.me/9392954525",            label: "WhatsApp" },
];