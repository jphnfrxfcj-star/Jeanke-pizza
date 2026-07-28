/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Papierschaal, van donker naar licht. Alle drie liggen op tint 38°
        // met ~40% verzadiging, zodat een vlak nooit koud uit het palet valt:
        //   parchment 88,8%  — borders en getinte secties
        //   cream     94,7%  — paginaachtergrond
        //   ivory     97,5%  — kaarten en formulieren die boven de pagina liggen
        // Gebruik geen puur wit op de publieke site: dat heeft nul verzadiging
        // en leest als een gat in een warm vlak.
        cream:    '#F7F3EC',
        parchment:'#EDE5D8',
        ivory:    '#FBF9F6',
        olive:    '#3D4A2D',
        'olive-light': '#5A6B47',
        wine:     '#A0522D',
        'wine-light':  '#B8622F',
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
