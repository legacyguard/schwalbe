import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: ['border-border'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'content-background': 'hsl(var(--content-background))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          primary: 'hsl(var(--accent-primary))',
          'primary-foreground': 'hsl(var(--accent-primary-foreground))',
          hover: 'hsl(var(--accent-hover))',
          secondary: 'hsl(var(--accent-secondary))',
          'secondary-foreground': 'hsl(var(--accent-secondary-foreground))',
          DEFAULT: 'hsl(var(--accent-primary))',
          foreground: 'hsl(var(--accent-primary-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          border: 'hsl(var(--card-border))',
          shadow: 'hsl(var(--card-shadow))',
        },
        sidebar: {
          primary: 'hsl(var(--sidebar-primary))',
          accent: 'hsl(var(--sidebar-accent))',
          text: 'hsl(var(--sidebar-text))',
          muted: 'hsl(var(--sidebar-muted))',
          DEFAULT: 'hsl(var(--sidebar-primary))',
          foreground: 'hsl(var(--sidebar-text))',
          'primary-foreground': 'hsl(var(--sidebar-text))',
          'accent-foreground': 'hsl(var(--sidebar-text))',
          border: 'hsl(var(--border))',
          ring: 'hsl(var(--ring))',
        },
        status: {
          success: 'hsl(var(--success))',
          'success-foreground': 'hsl(var(--success-foreground))',
          warning: 'hsl(var(--warning))',
          'warning-foreground': 'hsl(var(--warning-foreground))',
          locked: 'hsl(var(--locked))',
          'locked-foreground': 'hsl(var(--locked-foreground))',
        },
        progress: {
          bg: 'hsl(var(--progress-bg))',
          fill: 'hsl(var(--progress-fill))',
        },
        logo: {
          primary: 'hsl(var(--logo-primary))',
          secondary: 'hsl(var(--logo-secondary))',
        },
        chart: {
          grid: 'hsl(var(--chart-grid))',
          white: 'hsl(var(--chart-white))',
        },
        text: {
          muted: 'hsl(var(--text-muted))',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
