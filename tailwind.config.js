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
        'serif': ['Cormorant Garamond', 'serif'],
      },
      colors: {
        'gold': '#D4AF37',
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}