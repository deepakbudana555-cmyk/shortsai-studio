/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        brand: {
          red: '#E5192A',
          'red-dark': '#B5101E',
          'red-light': '#FF3347',
          'red-glow': 'rgba(229,25,42,0.25)',
        },
        dark: {
          900: '#050507',
          800: '#0A0A0F',
          700: '#111118',
          600: '#16161F',
          500: '#1C1C28',
          400: '#242435',
          300: '#2E2E45',
          200: '#3A3A55',
          100: '#4A4A68',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.07)',
        },
        accent: {
          purple: '#7C3AED',
          blue: '#2563EB',
          green: '#059669',
          amber: '#D97706',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(229,25,42,0.3), transparent)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'red-gradient': 'linear-gradient(135deg, #E5192A 0%, #B5101E 100%)',
        'red-glow-gradient': 'linear-gradient(135deg, rgba(229,25,42,0.2) 0%, rgba(229,25,42,0.05) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      },
      boxShadow: {
        'red-glow': '0 0 30px rgba(229,25,42,0.3), 0 0 60px rgba(229,25,42,0.1)',
        'red-glow-sm': '0 0 15px rgba(229,25,42,0.25)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg': '0 16px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'premium': '0 20px 60px rgba(229,25,42,0.15), 0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'typing': 'typing 3.5s steps(40, end), blink 0.75s step-end infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(229,25,42,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(229,25,42,0.6), 0 0 80px rgba(229,25,42,0.2)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
