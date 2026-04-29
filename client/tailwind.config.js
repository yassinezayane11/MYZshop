/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5f0',
          100: '#f2e6d9',
          200: '#e5ccb3',
          300: '#d4a87a',
          400: '#c68a52',
          500: '#b8743a',
          600: '#9e5f2e',
          700: '#7e4a26',
          800: '#623a1f',
          900: '#1a0e08',
          950: '#0d0704',
        },
        dark: {
          DEFAULT: '#0f0f0f',
          100: '#1a1a1a',
          200: '#242424',
          300: '#2e2e2e',
          400: '#3a3a3a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(100%)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
