/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#fdfdfb',
          100: '#f5f5dc',
          200: '#e1d5a8',
          300: '#cdba74',
          400: '#b8a040',
          500: '#a4850c',
          600: '#836a09',
          700: '#625007',
          800: '#413504',
          900: '#211a02',
        },
        leaf: {
          50: '#f4fbf5',
          100: '#e6f7e8',
          200: '#b0e5b7',
          300: '#7ad386',
          400: '#44c155',
          500: '#28a745',
          600: '#208537',
          700: '#186429',
          800: '#10421b',
          900: '#08210e',
        }
      }
    },
  },
  plugins: [],
}
