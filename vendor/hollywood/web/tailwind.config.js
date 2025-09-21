/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#ffffff',
          dark: '#0a0a0a',
        },
        foreground: {
          DEFAULT: '#0a0a0a',
          dark: '#ffffff',
        },
        primary: {
          DEFAULT: '#0ea5e9',
          foreground: '#ffffff',
          dark: '#0284c7',
        },
        secondary: {
          DEFAULT: '#64748b',
          foreground: '#ffffff',
          dark: '#475569',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
          dark: '#1e293b',
        },
        accent: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
          dark: '#d97706',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
          dark: '#dc2626',
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#334155',
        },
        input: {
          DEFAULT: '#e2e8f0',
          dark: '#334155',
        },
        ring: {
          DEFAULT: '#0ea5e9',
          dark: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}