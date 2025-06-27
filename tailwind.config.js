/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "message-fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "typing-dots": {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-10px)" },
        },
        "loading-bar": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { 
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.3"
          },
          "50%": { 
            transform: "translateY(-10px) rotate(180deg)",
            opacity: "0.7"
          },
        },
        "message-appear": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px) rotateX(-90deg)"
          },
          "50%": {
            opacity: "0.8",
            transform: "translateY(10px) rotateX(-30deg)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) rotateX(0deg)"
          },
        },
        "toast-slide-in": {
          "from": { transform: "translateX(100%)", opacity: "0" },
          "to": { transform: "translateX(0)", opacity: "1" },
        },
        "toast-slide-out": {
          "from": { transform: "translateX(0)", opacity: "1" },
          "to": { transform: "translateX(100%)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "message-fade-in": "message-fade-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "typing-dots": "typing-dots 1.4s ease-in-out infinite",
        "loading-bar": "loading-bar 2s ease-in-out",
        "glow": "glow 2s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "float": "float 2s ease-in-out infinite",
        "message-appear": "message-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "toast-slide-in": "toast-slide-in 0.3s ease-out",
        "toast-slide-out": "toast-slide-out 0.3s ease-in",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      },
      maxWidth: {
        'chat': '1024px',
      },
      minHeight: {
        'chat-input': '40px',
        'chat-input-md': '48px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    // Plugin pour les scrollbars et animations personnalisées
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'rgba(156, 163, 175, 0.4)',
            'border-radius': '6px',
            'transition': 'background-color 0.2s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            'background-color': 'rgba(156, 163, 175, 0.7)',
          },
        },
        '.gpu-accelerated': {
          'transform': 'translateZ(0)',
          'will-change': 'transform',
        },
        '.animate-on-hover': {
          'transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            'transform': 'translateY(-1px) scale(1.02)',
          },
        },
      })

      addComponents({
        '.message-bubble': {
          'border-radius': theme('borderRadius.2xl'),
          'padding': theme('spacing.4'),
          'transition': 'all 0.2s ease',
          'box-shadow': theme('boxShadow.sm'),
          '&:hover': {
            'box-shadow': theme('boxShadow.md'),
            'transform': 'translateY(-1px)',
          },
        },
        '.chat-input': {
          'transition': 'all 0.2s ease',
          'border-radius': theme('borderRadius.2xl'),
          '&:focus': {
            'transform': 'scale(1.02)',
            'box-shadow': '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
        },
        '.typing-indicator': {
          'display': 'inline-flex',
          'align-items': 'center',
          'gap': theme('spacing.1'),
        },
        '.loading-skeleton': {
          'background': 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          'background-size': '200% 100%',
          'animation': 'loading-skeleton 1.5s infinite',
        },
      })
    }
  ],
}