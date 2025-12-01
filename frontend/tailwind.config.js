/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nimb-blue': '#003366', // Example NIMB color
        'nimb-gold': '#D4AF37',
      }
    },
  },
  plugins: [],
}
