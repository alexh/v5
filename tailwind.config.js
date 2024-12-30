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
        'nickel': ['Nickel', 'sans-serif'],
      },
      colors: {
        'theme-primary': 'var(--theme-primary)',
        'theme-secondary': 'var(--theme-secondary)',
        'theme-text': 'var(--theme-text)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        scanline: 'scanline 4s linear infinite',
        glow: 'glow 3s ease-in-out infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))',
          },
          '50%': {
            filter: 'drop-shadow(0 0 22px rgba(255, 255, 255, 0.7))',
          },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 4px rgba(255,255,255,0.5)' },
          '50%': { textShadow: '0 0 16px rgba(255,255,255,0.8)' }
        }
      },
    },
  },
  plugins: [],
} 