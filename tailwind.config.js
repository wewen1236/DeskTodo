/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI Variable"', '"Microsoft YaHei UI"', '"Segoe UI"', '"Microsoft YaHei"', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.875rem', { lineHeight: '1.25rem' }],
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      },
      colors: {
        'win': {
          'bg': 'var(--win-bg)',
          'bg-secondary': 'var(--win-bg-secondary)',
          'card': 'var(--win-card)',
          'card-hover': 'var(--win-card-hover)',
          'border': 'var(--win-border)',
          'text': 'var(--win-text)',
          'text-secondary': 'var(--win-text-secondary)',
          'accent': 'var(--win-accent)',
          'accent-hover': 'var(--win-accent-hover)',
          'accent-text': 'var(--win-accent-text)',
          'priority-high': '#c42b1c',
          'priority-medium': '#f7630c',
          'priority-low': '#0078d4',
          'danger': '#c42b1c',
          'success': '#0f7b0f',
        }
      },
      borderRadius: {
        'win': '12px',
        'win-sm': '8px',
        'win-lg': '20px',
      },
      boxShadow: {
        'win': '0 2px 8px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)',
        'win-lg': '0 8px 32px rgba(0,0,0,0.16), 0 0 1px rgba(0,0,0,0.08)',
        'win-dark': '0 2px 8px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.05)',
        'win-lg-dark': '0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'fade-out': 'fadeOut 0.1s ease-in',
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'slide-out-right': 'slideOutRight 0.15s ease-in',
        'slide-in-up': 'slideInUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      }
    }
  },
  plugins: [],
}
