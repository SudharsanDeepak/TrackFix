/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ir-blue': '#1d4ed8',
        'ir-blue-dark': '#1e3a8a',
      },
    },
  },
  plugins: [],
}
