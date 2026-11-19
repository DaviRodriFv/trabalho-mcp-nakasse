/** Tokens do design.md mapeados para o Tailwind. Cores vêm de CSS variables (src/styles/tokens.css). */
const v = (name) => `var(--color-${name})`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: v('primary-50'), 600: v('primary-600'), 700: v('primary-700') },
        'on-primary': v('on-primary'),
        secondary: { 800: v('secondary-800'), 900: v('secondary-900') },
        tertiary: { 50: v('tertiary-50'), 500: v('tertiary-500'), 700: v('tertiary-700') },
        neutral: { 0: v('neutral-0'), 50: v('neutral-50'), 200: v('neutral-200'), 500: v('neutral-500'), 900: v('neutral-900') },
        success: { DEFAULT: v('success'), 50: v('success-50') },
        danger: { DEFAULT: v('danger'), 50: v('danger-50') },
        info: { DEFAULT: v('info'), 50: v('info-50') },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        body: ['14px', { lineHeight: '20px' }],
        label: ['13px', { lineHeight: '16px', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '16px' }],
      },
      // Escala base 4px (space/1..16) coincide com a do Tailwind; aqui ficam os tamanhos de layout.
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '72px',
        topbar: '64px',
        'control-sm': '32px',
        'control-md': '40px',
        'control-lg': '48px',
        row: '52px',
      },
      maxWidth: { content: '1200px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
    },
  },
  plugins: [],
};
