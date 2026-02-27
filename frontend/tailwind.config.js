/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tea: {
          50: '#f0f7f0',
          100: '#dceedd',
          200: '#bcdcbe',
          300: '#8fc293',
          400: '#5fa466',
          500: '#3d8745',
          600: '#2d6b35',
          700: '#25552b',
          800: '#1e4424',
          900: '#183820',
          950: '#0c1f12',
        },
        gold: {
          400: '#f0c040',
          500: '#d4a017',
          600: '#b8860b',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
