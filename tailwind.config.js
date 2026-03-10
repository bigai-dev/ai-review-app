/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f4f3ec',   // Luminous Pearl
          100: '#e6d5c3',  // Soft Nude
          200: '#d6dff1',  // Mist Blue
          300: '#9ac0bd',  // Light Teal
          400: '#7db0ad',  // Mid Teal
          500: '#6d9f9c',  // Coastal Teal (primary)
          600: '#5a8a87',  // Darker Teal
          700: '#4a7573',  // Dark Teal
          800: '#3a605e',  // Deeper Teal
          900: '#2a4b49',  // Darkest Teal
          950: '#1a3635',  // Near-black Teal
        },
        accent: {
          50: '#fdf8f3',
          100: '#f5e6d3',
          200: '#ebd0b3',
          300: '#e0ba93',
          400: '#d9ad83',
          500: '#d1a679',  // Golden Mirage
          600: '#b8905f',
          700: '#9a7548',
        },
        surface: {
          50: '#f4f3ec',   // Luminous Pearl
          100: '#f0efe8',
          200: '#e6d5c3',  // Soft Nude
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
        'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #f4f3ec 100%)',
      },
      animation: {
        'bubble': 'bubble 2s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        bubble: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: 1 },
          '50%': { transform: 'translateY(-10px) scale(1.1)', opacity: 0.8 },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(109, 159, 156, 0.08)',
        'glow': '0 0 20px rgba(109, 159, 156, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
