/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pizza: {
          red: '#C0392B',
          'red-dark': '#96281B',
          orange: '#E67E22',
          cream: '#FDF6E3',
          brown: '#6D4C41',
        }
      }
    },
  },
  plugins: [],
}
