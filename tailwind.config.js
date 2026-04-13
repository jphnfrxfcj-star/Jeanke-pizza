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
        wine:     '#1E3A5F',
        'wine-light':  '#2A4F7A',
        gold:     '#BFA06A',
        'gold-light':  '#D4BA8A',
        ink:      '#1C1410',
        'warm-gray':   '#8A7E72',
        'warm-gray-light': '#C5BAB0',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
