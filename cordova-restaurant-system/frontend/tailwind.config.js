/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary interactive color (links, active nav, badges) — deep forest green
        brand: {
          50: '#eef2ec',
          100: '#d9e4d3',
          400: '#4a7050',
          500: '#2f5233',
          600: '#243f28',
          700: '#1a2e1d',
        },
        // Warm emerald — success / secondary accent, distinct from primary
        emerald: {
          50: '#eaf4ee',
          400: '#5da283',
          500: '#3d8361',
          600: '#2f6b4d',
        },
        // Muted gold — highlights, ratings
        gold: {
          400: '#c7a250',
          500: '#b3903f',
        },
        // Warm orange — reserved ONLY for primary call-to-action buttons
        cta: {
          400: '#e2884f',
          500: '#cf6d34',
          600: '#b25726',
        },
        // Warm neutral grays for text/borders (not cold blue-grays)
        stone: {
          50: '#faf8f5',
          100: '#f1ece4',
          200: '#e2dcd0',
          400: '#9a9186',
          500: '#726a5f',
          600: '#564f46',
        },
        // Warm white / soft beige backgrounds
        beige: {
          50: '#fbf8f3',
          100: '#f4ece0',
        },
        ink: {
          900: '#1b241f', // warm dark neutral for headings — deep forest undertone, not navy
          800: '#26302b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem' },
      boxShadow: {
        card: '0 1px 3px rgba(27,36,31,0.05)',
        'card-hover': '0 6px 16px -4px rgba(27,36,31,0.10)',
        premium: '0 1px 2px rgba(27,36,31,0.04), 0 4px 12px -4px rgba(27,36,31,0.08)',
      },
    },
  },
  plugins: [],
};
