/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'receipt': ['Receipt', 'monospace'],
        'receipt-narrow': ['receipt-narrow', 'sans-serif'],
        'forma': ['forma-djr-banner', 'sans-serif'],
      },
      colors: {
        'theme-primary': 'var(--theme-primary)',
        'theme-secondary': 'var(--theme-secondary)',
        'theme-text': 'var(--theme-text)',
      },
    },
  },
  plugins: [],
} 