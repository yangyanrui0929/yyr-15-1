/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'lab-primary': '#1a1f3a',
        'lab-secondary': '#252b4d',
        'lab-accent': '#d4a853',
        'lab-accent-light': '#e8c77a',
        'lab-success': '#5ec4a4',
        'lab-failure': '#e87461',
        'lab-neutral': '#6b7280',
        'lab-text': '#f0f4f8',
        'lab-muted': '#94a3b8',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fall': 'fall 0.5s ease-in forwards',
        'spring-bounce': 'spring-bounce 0.4s ease-out',
        'magnet-pulse': 'magnet-pulse 1s ease-out infinite',
        'countdown': 'countdown linear forwards',
        'particle': 'particle 0.8s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 168, 83, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 168, 83, 0.6)' },
        },
        'fall': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(90deg)' },
        },
        'spring-bounce': {
          '0%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.5)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'magnet-pulse': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'countdown': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '283' },
        },
        'particle': {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(var(--tx), var(--ty)) scale(0)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
