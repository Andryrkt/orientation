/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
      },
      boxShadow: {
        brand: '0 8px 24px -8px rgba(26, 68, 219, 0.35)',
      },
    },
  },
  plugins: [],
};
