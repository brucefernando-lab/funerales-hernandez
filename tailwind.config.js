/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          slate: '#0F172A', // Navy oscuro / pizarra principal
          dark: '#0A0F1D',
          navy: '#1E293B',
          card: '#1E293B',
          gold: '#D97706', // Ámbar dorado elegante
          'gold-light': '#F59E0B',
          'gold-dark': '#B45309',
          'gold-bg': '#FEF3C7',
          surface: '#F8FAFC',
          border: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
