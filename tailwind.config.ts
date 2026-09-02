import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // permite cualquier opacidad (bg-white/12, text-white/45, ...)
      opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, String(i / 100)])),
      colors: {
        ink: {
          950: '#07060d',
          900: '#0b0a14',
          850: '#100e1c',
          800: '#151327',
          700: '#1d1a33',
          600: '#272242',
          500: '#332c55',
        },
        brand: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        neon: {
          magenta: '#ff2fd0',
          violet:  '#8b5cf6',
          blue:    '#3b82f6',
          cyan:    '#22d3ee',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, #a855f7 0%, #7c3aed 45%, #ff2fd0 100%)',
        'grad-brand-soft': 'linear-gradient(135deg, rgba(168,85,247,.22), rgba(255,47,208,.14))',
        'grad-night': 'linear-gradient(180deg, #07060d 0%, #0b0a14 60%, #07060d 100%)',
        'grid-faint':
          'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
      },
      boxShadow: {
        glow:    '0 0 0 1px rgba(168,85,247,.25), 0 8px 40px -8px rgba(168,85,247,.45)',
        'glow-lg': '0 0 0 1px rgba(168,85,247,.3), 0 20px 70px -15px rgba(168,85,247,.6)',
        card:    '0 1px 0 0 rgba(255,255,255,.05) inset, 0 20px 50px -20px rgba(0,0,0,.9)',
      },
      keyframes: {
        'fade-up':   { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'none' } },
        'float':     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-glow':{ '0%,100%': { opacity: '.45' }, '50%': { opacity: '.9' } },
        'shimmer':   { '100%': { transform: 'translateX(100%)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'marquee':   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.16,1,.3,1) both',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
