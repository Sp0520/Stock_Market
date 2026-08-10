/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05070D',
          900: '#0B1220',
          800: '#141E33',
          700: '#1F2E4D',
        },
        gain: {
          DEFAULT: '#00E38A',
          bg: 'rgba(0, 227, 138, 0.1)',
        },
        loss: {
          DEFAULT: '#FF3B5C',
          bg: 'rgba(255, 59, 92, 0.1)',
        },
        amberNeutral: '#FFB020',
        glow: {
          blue: '#22D3EE',
          purple: '#7C5CFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
