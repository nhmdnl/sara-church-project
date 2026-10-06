/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        church: {
          burgundy: '#661622',
          'burgundy-dark': '#480f17',
          'burgundy-light': '#8a2434',
          gold: '#a67215',
          'gold-dark': '#85580a',
          'gold-light': '#c98e26',
          cream: '#faf7f2',
          'cream-alt': '#f2ede4',
          charcoal: '#1a1918',
          muted: '#4a4641',
          border: '#ddd6ca',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans Ethiopic"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        serif: [
          '"Noto Serif Ethiopic"',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'serif',
        ],
      },
      fontSize: {
        // Enforce NFR-2: base body text minimum 18px (1.125rem)
        base: ['1.125rem', { lineHeight: '1.75' }], // 18px
        lg: ['1.25rem', { lineHeight: '1.75' }],   // 20px
        xl: ['1.375rem', { lineHeight: '1.6' }],   // 22px
        '2xl': ['1.625rem', { lineHeight: '1.5' }], // 26px
        '3xl': ['2rem', { lineHeight: '1.4' }],     // 32px
        '4xl': ['2.5rem', { lineHeight: '1.3' }],   // 40px
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
};
