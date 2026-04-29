// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      /* ─── Brand Colors ─── */
      colors: {
        brand: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        emerald: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        accent: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted:   '#475569',
          faint:   '#94A3B8',
          light:   '#CBD5E1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt:     '#F0FDF4',
          muted:   '#F8FAFC',
          warm:    '#FEFCE8',
        },
      },

      /* ─── Font Families ─── */
      fontFamily: {
        sans:    ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        serif:   ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      /* ─── Font Sizes (Fluid) ─── */
      fontSize: {
        'hero':       ['clamp(2rem, 5vw + 0.5rem, 4rem)',      { lineHeight: '1.1',  letterSpacing: '-0.03em', fontWeight: '800' }],
        'hero-sm':    ['clamp(1.75rem, 4vw + 0.5rem, 3rem)',    { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }],
        'heading':    ['clamp(1.5rem, 3.5vw, 2.5rem)',          { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-sm': ['clamp(1.25rem, 2.5vw, 1.75rem)',        { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        'subheading': ['clamp(1rem, 2vw, 1.3rem)',              { lineHeight: '1.6',  fontWeight: '500' }],
        'body-lg':    ['clamp(1rem, 1.5vw, 1.125rem)',          { lineHeight: '1.7' }],
      },

      /* ─── Spacing ─── */
      spacing: {
        'section':    'clamp(56px, 10vw, 120px)',
        'section-sm': 'clamp(32px, 6vw, 72px)',
        'section-xs': 'clamp(24px, 4vw, 48px)',
        'container':  'clamp(16px, 4vw, 64px)',
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },

      /* ─── Max Width ─── */
      maxWidth: {
        'container': '1280px',
        'narrow':    '768px',
        'wide':      '1440px',
        'hero':      '920px',
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        'card':   '20px',
        'card-sm': '14px',
        'pill':   '9999px',
        '4xl':    '2rem',
        '5xl':    '2.5rem',
      },

      /* ─── Box Shadows ─── */
      boxShadow: {
        'brand-xs':  '0 1px 3px rgba(2, 44, 34, 0.06)',
        'brand-sm':  '0 4px 12px rgba(2, 44, 34, 0.08)',
        'brand-md':  '0 10px 30px rgba(2, 44, 34, 0.12)',
        'brand-lg':  '0 24px 56px rgba(2, 44, 34, 0.15)',
        'brand-xl':  '0 40px 80px rgba(2, 44, 34, 0.18)',
        'glow-green': '0 0 40px rgba(34, 197, 94, 0.15)',
        'glow-green-lg': '0 0 80px rgba(34, 197, 94, 0.2)',
        'inner-green': 'inset 0 2px 12px rgba(34, 197, 94, 0.08)',
        'card':      '0 4px 24px -4px rgba(2, 44, 34, 0.08)',
        'card-hover': '0 20px 40px -12px rgba(2, 44, 34, 0.15)',
        'button':    '0 4px 14px rgba(5, 150, 105, 0.25)',
        'button-hover': '0 8px 24px rgba(5, 150, 105, 0.35)',
      },

      /* ─── Backdrop Blur ─── */
      backdropBlur: {
        xs: '2px',
      },

      /* ─── Z-Index ─── */
      zIndex: {
        'dropdown': '50',
        'sticky':   '60',
        'header':   '70',
        'overlay':  '80',
        'modal':    '90',
        'toast':    '100',
      },

      /* ─── Transitions ─── */
      transitionTimingFunction: {
        'smooth':  'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce':  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring':  'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },

      /* ─── Animations ─── */
      animation: {
        'fade-in':        'fadeIn 0.6s ease-out both',
        'fade-in-up':     'fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-down':   'fadeInDown 0.65s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-left':   'fadeInLeft 0.65s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-right':  'fadeInRight 0.65s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':       'scaleIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'zoom-in':        'zoomIn 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'slide-reveal':   'slideReveal 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'blur-in':        'blurIn 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'flip-in':        'flipIn 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'float':          'float 6s ease-in-out infinite',
        'float-slow':     'float 8s ease-in-out infinite',
        'float-delayed':  'float 6s ease-in-out 2s infinite',
        'pulse-slow':     'pulse 3s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'spin-slow':      'rotate 8s linear infinite',
        'gradient-slide': 'gradientSlide 6s ease infinite',
        'wave':           'wave 4s ease-in-out infinite',
        'bounce-slow':    'bounceSlow 3s ease-in-out infinite',
        'glow-pulse':     'glowPulse 2s ease-in-out infinite',
        'flag-enter':     'avFlagEnter 520ms cubic-bezier(0.22,1,0.36,1) both',
      },

      /* ─── Keyframes ─── */
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%':   { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.88)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        zoomIn: {
          '0%':   { opacity: '0', transform: 'scale(0.78)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
        slideReveal: {
          '0%':   { opacity: '0', transform: 'skewY(3deg) translateY(36px)' },
          '100%': { opacity: '1', transform: 'skewY(0) translateY(0)' },
        },
        blurIn: {
          '0%':   { opacity: '0', transform: 'scale(1.1)', filter: 'blur(18px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
        flipIn: {
          '0%':   { opacity: '0', transform: 'perspective(900px) rotateY(-18deg) scale(1.04)' },
          '100%': { opacity: '1', transform: 'perspective(900px) rotateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-18px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        rotate: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%':      { transform: 'translateX(10px) translateY(-10px)' },
          '50%':      { transform: 'translateX(0) translateY(-20px)' },
          '75%':      { transform: 'translateX(-10px) translateY(-10px)' },
        },
        gradientSlide: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)' },
          '50%':      { boxShadow: '0 0 40px rgba(34, 197, 94, 0.25)' },
        },
        avFlagEnter: {
          '0%':   { opacity: '0', transform: 'translateY(8px) rotate(-2deg) skewX(0deg) scale(0.96)', filter: 'blur(2px) saturate(1.05)' },
          '100%': { opacity: '1', transform: 'none', filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.12))' },
        },
        avFlagGust: {
          '0%':   { transform: 'translateX(0) rotate(0deg) skewX(0deg) scale(1)' },
          '55%':  { transform: 'translateX(1px) rotate(6deg) skewX(-8deg) scale(1.02)' },
          '100%': { transform: 'translateX(0) rotate(1.5deg) skewX(-3deg) scale(1.01)' },
        },
        avFlagIdle1: {
          '0%, 100%': { transform: 'rotate(0.5deg) skewX(-1deg) translateY(0)' },
          '45%':      { transform: 'rotate(-1.8deg) skewX(4deg) translateY(-1px)' },
        },
        avFlagIdle2: {
          '0%, 100%': { transform: 'rotate(0deg) skewX(0deg) translateY(0)' },
          '25%':      { transform: 'rotate(1.6deg) skewX(-3.5deg) translateY(-1px)' },
          '50%':      { transform: 'rotate(-1.2deg) skewX(3deg) translateY(0)' },
          '75%':      { transform: 'rotate(1deg) skewX(-2.2deg) translateY(1px)' },
        },
        avFlagWave: {
          '0%, 100%': { transform: 'rotate(1.5deg) skewX(-3deg)' },
          '25%':      { transform: 'rotate(-3deg) skewX(6deg)' },
          '50%':      { transform: 'rotate(2.5deg) skewX(-5deg)' },
          '75%':      { transform: 'rotate(-2deg) skewX(4deg)' },
        },
      },

      /* ─── Screens (extended) ─── */
      screens: {
        'xs':   '480px',
        '3xl':  '1680px',
        '4xl':  '1920px',
      },

      /* ─── Background Image ─── */
      backgroundImage: {
        'gradient-brand':     'linear-gradient(135deg, #059669, #10b981)',
        'gradient-brand-dark':'linear-gradient(135deg, #047857, #059669)',
        'gradient-hero':      'linear-gradient(135deg, #052E16 0%, #065F46 40%, #059669 100%)',
        'gradient-card':      'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
        'gradient-surface':   'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
        'gradient-radial':    'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'shimmer':            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },

      /* ─── Aspect Ratio ─── */
      aspectRatio: {
        'card':    '4 / 3',
        'hero':    '16 / 9',
        'portrait':'3 / 4',
        'cinema':  '21 / 9',
      },
    },
  },
  plugins: [
    // Line-clamp plugin (built-in from Tailwind v3.3+)
    // require('@tailwindcss/line-clamp'),

    // Custom plugin for component utilities
    function({ addComponents, addUtilities, theme }) {

      /* ─── Component Classes ─── */
      addComponents({
        // Container
        '.av-container': {
          width: '100%',
          maxWidth: theme('maxWidth.container'),
          marginInline: 'auto',
          paddingInline: theme('spacing.container'),
        },
        '.av-container-narrow': {
          width: '100%',
          maxWidth: theme('maxWidth.narrow'),
          marginInline: 'auto',
          paddingInline: theme('spacing.container'),
        },
        '.av-container-wide': {
          width: '100%',
          maxWidth: theme('maxWidth.wide'),
          marginInline: 'auto',
          paddingInline: theme('spacing.container'),
        },

        // Section spacing
        '.av-section': {
          paddingBlock: theme('spacing.section'),
        },
        '.av-section-sm': {
          paddingBlock: theme('spacing.section-sm'),
        },
        '.av-section-xs': {
          paddingBlock: theme('spacing.section-xs'),
        },

        // Typography
        '.av-text-hero': {
          fontSize: 'clamp(2rem, 5vw + 0.5rem, 4rem)',
          fontFamily: theme('fontFamily.serif').join(', '),
          fontWeight: '800',
          lineHeight: '1.1',
          letterSpacing: '-0.03em',
        },
        '.av-text-heading': {
          fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
          fontFamily: theme('fontFamily.serif').join(', '),
          fontWeight: '700',
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
        },
        '.av-text-subheading': {
          fontSize: 'clamp(1rem, 2vw, 1.3rem)',
          fontWeight: '500',
          color: theme('colors.ink.muted'),
          lineHeight: '1.6',
        },

        // Card base
        '.av-card': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderRadius: theme('borderRadius.card'),
          boxShadow: theme('boxShadow.card'),
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            boxShadow: theme('boxShadow.card-hover'),
            transform: 'translateY(-4px)',
          },
        },

        // Button base
        '.av-btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          borderRadius: theme('borderRadius.card-sm'),
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          cursor: 'pointer',
          textDecoration: 'none',
          border: 'none',
          outline: 'none',
          position: 'relative',
          overflow: 'hidden',
        },
        '.av-btn-primary': {
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: '#FFFFFF',
          padding: '14px 28px',
          fontSize: '15px',
          boxShadow: theme('boxShadow.button'),
          '&:hover': {
            background: 'linear-gradient(135deg, #047857, #059669)',
            boxShadow: theme('boxShadow.button-hover'),
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.av-btn-secondary': {
          background: theme('colors.surface.DEFAULT'),
          color: theme('colors.emerald.600'),
          padding: '14px 28px',
          fontSize: '15px',
          border: `2px solid ${theme('colors.emerald.200')}`,
          '&:hover': {
            background: theme('colors.brand.50'),
            borderColor: theme('colors.emerald.400'),
            transform: 'translateY(-2px)',
          },
        },
        '.av-btn-ghost': {
          background: 'transparent',
          color: theme('colors.emerald.600'),
          padding: '14px 28px',
          fontSize: '15px',
          '&:hover': {
            background: theme('colors.brand.50'),
          },
        },

        // Badge
        '.av-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '5px 14px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        '.av-badge-green': {
          background: 'linear-gradient(135deg, #16A34A, #22C55E)',
          color: '#FFFFFF',
        },
        '.av-badge-amber': {
          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          color: '#FFFFFF',
        },
        '.av-badge-rose': {
          background: 'linear-gradient(135deg, #F43F5E, #FB7185)',
          color: '#FFFFFF',
        },
        '.av-badge-white': {
          background: 'rgba(255, 255, 255, 0.95)',
          color: theme('colors.ink.muted'),
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },

        // Glass effect
        '.av-glass': {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.av-glass-dark': {
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });

      /* ─── Utility Classes ─── */
      addUtilities({
        // Text gradient
        '.text-gradient-brand': {
          backgroundImage: 'linear-gradient(135deg, #059669, #10b981, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },

        // Scrollbar hide
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },

        // Smooth scroll snap
        '.snap-x-mandatory': {
          scrollSnapType: 'x mandatory',
          '-webkit-overflow-scrolling': 'touch',
        },

        // Shine effect on hover
        '.shine-on-hover': {
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::after': {
            left: '100%',
          },
        },

        // Glow border
        '.glow-border': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-2px',
            borderRadius: 'inherit',
            background: 'linear-gradient(135deg, #22C55E, #10B981, #059669)',
            opacity: '0',
            transition: 'opacity 0.4s ease',
            zIndex: '-1',
          },
          '&:hover::before': {
            opacity: '0.15',
          },
        },
      });
    },
  ],
};