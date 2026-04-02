/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:    '#F7F3EC',
        parchment:'#EDE5D8',
        olive:    '#3D4A2D',
        'olive-light': '#5A6B47',
        wine:     '#722F37',
        'wine-light':  '#8B4049',
        gold:     '#BFA06A',
        'gold-light':  '#D4BA8A',
        ink:      '#1C1410',
        'warm-gray':   '#8A7E72',
        'warm-gray-light': '#C5BAB0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
