/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf8',
          100: '#d7f5ef',
          200: '#b4eadf',
          300: '#80d5c8',
          400: '#4cb8aa',
          500: '#24968a',
          600: '#177a73',
          700: '#145f5c',
          800: '#124d4c',
          900: '#113f40'
        },
        panel: '#f7fbfc',
      },
      boxShadow: {
        soft: '0 18px 40px rgba(15, 23, 42, 0.08)'
      },
      backgroundImage: {
        'medical-grid': 'linear-gradient(rgba(36,150,138,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(36,150,138,0.08) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: '32px 32px'
      }
    }
  },
  plugins: [],
}