/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8dccb',
          300: '#d4c5a9',
          400: '#c0ae8e',
          500: '#8B6B47',
          600: '#6d5438',
          700: '#4f3d29',
        },
        brown: {
          50: '#f9f7f4',
          100: '#f0ebe3',
          200: '#d9cdb9',
          300: '#c2af8f',
          400: '#ab9165',
          500: '#8B6B47',
          600: '#6f5639',
          700: '#53402b',
          800: '#3a2a0e',
          900: '#2b1a0f',
        }
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      }
    },
  },
  plugins: [],
}
