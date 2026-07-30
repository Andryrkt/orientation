/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3cdff',
          300: '#80acff',
          400: '#4d82ff',
          500: '#2b5fff',
          600: '#1a44db',
          700: '#1533a8',
          800: '#132b7d',
          900: '#0f2054',
        },
        dark: {
          900: '#0a0818',
          800: '#0f0c29',
          700: '#1a1545',
          600: '#241e5e',
          500: '#302b63',
          400: '#3d3680',
        },
        purple: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#00A3FF',
          600: '#0052FF',
          700: '#1A5EAA',
          800: '#132b7d',
          900: '#0f2054',
        },
        neon: {
          purple: '#00A3FF',
          indigo: '#0052FF',
          cyan: '#00F0FF',
          pink: '#00A3FF',
          green: '#34d399',
        },
      },
      boxShadow: {
        brand: '0 8px 24px -8px rgba(26, 68, 219, 0.35)',
        glow: '0 0 20px rgba(0, 163, 255, 0.3)',
        'glow-indigo': '0 0 20px rgba(0, 82, 255, 0.4)',
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0a0818 0%, #0f0c29 40%, #1a1545 70%, #0f0c29 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, rgba(0,163,255,0.2) 0%, transparent 70%)',
        'accent-gradient': 'linear-gradient(135deg, #0052FF, #00A3FF, #00F0FF)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 163, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 163, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
