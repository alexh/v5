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
        // The typekit kit ships forma-djr-banner (not -display); map the
        // long-dead font-forma class to the face that actually exists.
        'forma': ['"forma-djr-banner"', 'sans-serif'],
        'nickel': ['Nickel', 'sans-serif'],
        'monaspace-krypton': ['"Monaspace Krypton"', 'ui-monospace', 'monospace'],
      },
      colors: {
        'theme-primary': 'var(--theme-primary)',
        'theme-secondary': 'var(--theme-secondary)',
        'theme-text': 'var(--theme-text)',
        'theme-accent': 'var(--theme-accent)',
        'theme-background': 'var(--theme-background)',
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