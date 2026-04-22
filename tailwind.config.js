/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#faf7f2',
        ink: {
          DEFAULT: '#1a1814',
          2: '#4a4640',
          3: '#8a857d',
        },
        rule: 'rgba(26,24,20,0.09)',
        card: '#ffffff',
        accent: {
          hi: '#d9532b', // Ember hi
          lo: '#f4e4d8', // Ember lo
        }
      },
      fontFamily: {
        serif: ['"Spectral"', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}