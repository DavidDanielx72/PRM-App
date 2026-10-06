/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'cput-blue': '#0a3d62',
        'cput-blue-dark': '#062b45',
        'cput-blue-light': '#1a5fa3',
        'cput-gold': '#ffb81c',
        'cput-gold-dark': '#e09e00',
        'cput-navy': '#041e2f',

        cream: '#f4efe4',
        'cream-soft': '#fbf7ee',
        eggshell: '#fdfaf3',
        'blue-tint': '#eaf1f8',
        'blue-tint-2': '#dbe8f4',
        'blue-tint-3': '#c6dcf0',

        'cput-light': '#f4efe4',
        'cput-surface': '#fdfaf3',
        'cput-surface-blue': '#eaf1f8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(10, 61, 98, 0.08), 0 1px 2px rgba(10, 61, 98, 0.05)',
        card: '0 8px 24px rgba(10, 61, 98, 0.12)',
        glow: '0 0 0 4px rgba(26, 95, 163, 0.10)',
      },
    },
  },
  plugins: [],
};