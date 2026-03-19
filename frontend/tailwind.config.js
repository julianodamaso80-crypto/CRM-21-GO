/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 21Go Gold — cor principal da marca
        gold: {
          50: '#FDF8EC',
          100: '#FBF0D4',
          200: '#F6E0A8',
          300: '#F0CE76',
          400: '#D4B455',
          500: '#C9A84C',
          600: '#B08F3A',
          700: '#8E722E',
          800: '#6B5522',
          900: '#4A3B18',
          950: '#2D2310',
        },
        // Dark palette — backgrounds sofisticados
        dark: {
          50: '#E8E8EE',
          100: '#C5C5D2',
          200: '#9D9DB5',
          300: '#757598',
          400: '#55557A',
          500: '#3D3D5C',
          600: '#2A2A42',
          700: '#1E1E32',
          800: '#141422',
          900: '#0C0C18',
          950: '#08080F',
        },
        // Accent — para destaques secundários
        accent: {
          blue: '#5B8DEF',
          purple: '#A78BFA',
          emerald: '#34D399',
          rose: '#FB7185',
          amber: '#FBBF24',
          cyan: '#22D3EE',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(201, 168, 76, 0.15)',
        'glow-gold-lg': '0 0 40px rgba(201, 168, 76, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'sidebar': '4px 0 24px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C, #D4B455, #F0CE76)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(201, 168, 76, 0.1), rgba(201, 168, 76, 0.05))',
        'gradient-dark': 'linear-gradient(180deg, #141422, #0C0C18)',
        'gradient-card': 'linear-gradient(135deg, rgba(30, 30, 50, 0.8), rgba(20, 20, 34, 0.9))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'stagger-1': 'fadeInUp 0.5s ease-out 0.05s forwards',
        'stagger-2': 'fadeInUp 0.5s ease-out 0.1s forwards',
        'stagger-3': 'fadeInUp 0.5s ease-out 0.15s forwards',
        'stagger-4': 'fadeInUp 0.5s ease-out 0.2s forwards',
        'stagger-5': 'fadeInUp 0.5s ease-out 0.25s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(201, 168, 76, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(201, 168, 76, 0.25)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
