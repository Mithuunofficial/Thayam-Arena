/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberBg: '#0B0F1A',
        cyberPanel: '#111827',
        cyberGold: '#F5B041',
        cyberOrange: '#FF6B00',
        cyberBlue: '#00C2FF',
        cyberGreen: '#10B981',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(245, 176, 65, 0.3)',
        'blue-glow': '0 0 15px rgba(0, 194, 255, 0.3)',
        'orange-glow': '0 0 15px rgba(255, 107, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
