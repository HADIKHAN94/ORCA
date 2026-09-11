/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marine: {
          900: '#0A192F', // Deep Navy
          800: '#112240',
          700: '#233554',
          600: '#3A506B',
          500: '#0077B6', // Ocean Blue
          400: '#0096C7',
          300: '#48CAE4',
          200: '#90E0EF', // Cyan/Teal
          100: '#ADE8F4',
          50: '#F0F8FF',  // Light blue-gray
        },
        risk: {
          low: '#10B981', // Green
          moderate: '#F59E0B', // Amber
          high: '#EF4444', // Red
          critical: '#991B1B', // Dark red
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
