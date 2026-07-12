import type { Config } from 'tailwindcss';

export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          900: 'var(--color-teal-900)',
          700: 'var(--color-teal-700)',
          500: 'var(--color-teal-500)',
          100: 'var(--color-teal-100)',
        },
        ivory: {
          50: 'var(--color-ivory-50)',
          100: 'var(--color-ivory-100)',
        },
        paper: {
          0: 'var(--color-paper-0)',
        },
        coral: {
          600: 'var(--color-coral-600)',
          500: 'var(--color-coral-500)',
          100: 'var(--color-coral-100)',
        },
        amber: {
          600: 'var(--color-amber-600)',
          100: 'var(--color-amber-100)',
        },
        success: {
          600: 'var(--color-green-600)',
          100: 'var(--color-green-100)',
        },
        danger: {
          600: 'var(--color-red-600)',
          100: 'var(--color-red-100)',
        },
        slate: {
          900: 'var(--color-slate-900)',
          700: 'var(--color-slate-700)',
          500: 'var(--color-slate-500)',
          300: 'var(--color-slate-300)',
          100: 'var(--color-slate-100)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glass: 'var(--shadow-glass)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        emphasized: 'var(--ease-emphasized)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      keyframes: {
        'vitals-trace': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'vitals-trace': 'vitals-trace 2.4s linear infinite',
        'fade-up': 'fade-up 0.4s var(--ease-emphasized) both',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
