/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#c5a059',
          'gold-light': '#d4b87a',
          'gold-dark': '#a8833a',
          brown: '#4a3728',
          'brown-deep': '#f3ede4',
          surface: '#faf7f2',
          bg: '#ffffff',
          text: '#2d1f18',
          muted: '#6b5d50',
          /* aliases used across admin components */
          primary: '#c5a059',
          'primary-dark': '#a8833a',
          dark: '#2d1f18',
          cream: '#faf7f2',
        },
        gold: {
          DEFAULT: '#c5a059',
          light: '#d4b87a',
          dark: '#a8833a',
        },
        brown: {
          DEFAULT: '#4a3728',
          deep: '#f3ede4',
        },
        surface: '#faf7f2',
        text: {
          DEFAULT: '#2d1f18',
          muted: '#6b5d50',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '480px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(45, 31, 24, 0.06)',
        gold: '0 4px 24px rgba(197, 160, 89, 0.25)',
      },
    },
  },
  plugins: [],
};
