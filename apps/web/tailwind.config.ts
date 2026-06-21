import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        'green-deep': '#0A2416',
        'green-main': '#0D3B27',
        'green-mid': '#1a5c3a',
        'gold': '#C9A84C',
        'gold-light': '#E8C96A',
        'cream': '#F5F0E6',
        'cream-dark': '#EDE8DC',
        'text-dark': '#111810',
        'text-mid': '#4a5240',
        'text-muted': '#8a9080',
      },
      maxWidth: {
        'content': '1366px',
      },
    },
  },
  plugins: [],
} satisfies Config
