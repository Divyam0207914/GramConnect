/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E40AF', // Deep Blue
        'secondary': '#FBBF24', // Amber
        'accent': '#34D399', // Emerald Green
        'background': '#F9FAFB', // Light Gray
        'text-primary': '#1F2937', // Dark Gray
        'text-secondary': '#6B7280', // Medium Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
