import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // MtaaHub brand green
        primary: {
          50: '#F1FAF5',
          100: '#DDF3E7',
          200: '#BCE7D1',
          300: '#8DD7B1',
          400: '#54C08B',
          500: '#22A66B',
          600: '#0F8A56',
          700: '#0B6B45',
          800: '#0A5436',
          900: '#0B3D2B',
          950: '#062418',
        },
        // Warm accent used for highlights/badges
        accent: {
          50: '#FFF8EB',
          100: '#FDECC8',
          200: '#FAD98D',
          300: '#F7BF52',
          400: '#F4A62A',
          500: '#E8850F',
          600: '#CC640A',
          700: '#A9470C',
          800: '#8A3810',
          900: '#722F10',
        },
        ink: {
          DEFAULT: '#0B1220',
          50: '#F6F8FB',
          100: '#EDF1F7',
          200: '#DDE4EE',
          300: '#C3CEDF',
          400: '#93A3BC',
          500: '#6B7B96',
          600: '#4C5C76',
          700: '#374559',
          800: '#222D3D',
          900: '#131C29',
          950: '#0B1220',
        },
        // Backwards-compatible aliases used by the original pages
        muted: {
          50: '#F6F8FB',
          100: '#EDF1F7',
          200: '#DDE4EE',
          300: '#C3CEDF',
          400: '#93A3BC',
          500: '#6B7B96',
          600: '#4C5C76',
          700: '#374559',
          800: '#222D3D',
          900: '#131C29',
          950: '#0B1220',
        },
        secondary: {
          50: '#FFF8EB',
          100: '#FDECC8',
          200: '#FAD98D',
          300: '#F7BF52',
          400: '#F4A62A',
          500: '#E8850F',
          600: '#CC640A',
          700: '#A9470C',
          800: '#8A3810',
          900: '#722F10',
        },
        // Dark admin surface palette
        surface: {
          950: '#080D16',
          900: '#0B1220',
          850: '#0E1726',
          800: '#121C2E',
          700: '#1A2438',
          600: '#243149',
          500: '#33415C',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 12px -2px rgba(16, 24, 40, 0.06)',
        float: '0 12px 40px -12px rgba(11, 61, 43, 0.25)',
        hero: '0 24px 60px -20px rgba(11, 61, 43, 0.35)',
        glow: '0 0 0 1px rgba(34, 166, 107, 0.25), 0 8px 24px -8px rgba(34, 166, 107, 0.35)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1.1)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee 28s linear infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
