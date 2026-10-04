/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'cput-blue': '#0a3d62',
        'cput-blue-dark': '#062b45',
        'cput-blue-light': '#1a5fa3',
        'cput-gold': '#ffb81c',
        'cput-gold-dark': '#e09e00',
        'cput-light': '#f4f6fb',
        'cput-navy': '#041e2f',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 2px 8px rgba(10, 61, 98, 0.06), 0 1px 2px rgba(10, 61, 98, 0.04)',
        card: '0 4px 20px rgba(10, 61, 98, 0.08)',
      },
    },
  },
  plugins: [],
};