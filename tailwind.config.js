/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        blueApp: 'var(--color-blueApp)',
        grayApp: 'var(--color-grayApp)',
        lightBlue: 'var(--color-lightBlue)',
        darkBlue: 'var(--color-darkBlue)',
        bgCard: 'var(--color-bgCard)',
      },
      fontFamily: {
        'sans': ['var(--font-poppins)', 'sans-serif'],
        'league-spartan': ['var(--font-league-spartan)', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'geist-sans': ['var(--font-geist-sans)', 'sans-serif'],
        'geist-mono': ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('@midudev/tailwind-animations') // 👈 Agregado aquí
  ],
};