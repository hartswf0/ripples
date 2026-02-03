/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom RIPPLES colors
        'entity-green': 'hsl(var(--entity-green))',
        'obstacle-red': 'hsl(var(--obstacle-red))',
        'goal-gold': 'hsl(var(--goal-gold))',
        'shift-cyan': 'hsl(var(--shift-cyan))',
        'text-dim': 'hsl(var(--text-dim))',
        'text-muted-override': 'hsl(var(--text-muted))',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'terminal': 'inset 0 0 30px hsl(0 0% 0% / 0.6), 0 0 30px hsl(0 0% 0% / 0.4)',
        'glow-green': '0 0 15px hsl(140 70% 55% / 0.4)',
        'glow-red': '0 0 15px hsl(0 70% 55% / 0.4)',
        'glow-gold': '0 0 15px hsl(45 90% 55% / 0.4)',
        'glow-cyan': '0 0 15px hsl(180 70% 55% / 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "jitter": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-0.5px, 0.5px)" },
          "50%": { transform: "translate(0.5px, -0.5px)" },
          "75%": { transform: "translate(-0.5px, -0.5px)" },
        },
        "shimmer": {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.4" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            textShadow: "0 0 5px currentColor",
            opacity: "0.8"
          },
          "50%": { 
            textShadow: "0 0 15px currentColor, 0 0 25px currentColor",
            opacity: "1"
          },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { 
            opacity: "0",
            transform: "translateY(10px)"
          },
          to: { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "ripple-flash": {
          "0%": { backgroundColor: "transparent" },
          "10%": { backgroundColor: "hsl(140 60% 45% / 0.15)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "jitter": "jitter 0.15s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "ripple-flash": "ripple-flash 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
