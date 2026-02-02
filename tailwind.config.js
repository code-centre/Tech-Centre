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
        // New color system
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        highlight: 'var(--highlight)',
        background: 'var(--background)',
        'background-light': 'var(--background-light)',
        
        // Semantic colors
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        
        // Button colors
        'button-bg': 'var(--button-bg)',
        'button-text': 'var(--button-text)',
        
        // Legacy colors (for backward compatibility)
        foreground: 'var(--foreground)',
        blueApp: 'var(--color-blueApp)',
        grayApp: 'var(--color-grayApp)',
        lightBlue: 'var(--color-lightBlue)',
        darkBlue: 'var(--color-darkBlue)',
        bgCard: 'var(--color-bgCard)',
      },
      fontFamily: {
        // New font system
        'sans': ['var(--font-space-grotesk)', 'sans-serif'],
        'heading': ['var(--font-space-grotesk)', 'sans-serif'],
        'highlight': ['var(--font-parabole)', 'sans-serif'],
        
        // Legacy fonts (for backward compatibility)
        'league-spartan': ['var(--font-space-grotesk)', 'sans-serif'],
        'poppins': ['var(--font-space-grotesk)', 'sans-serif'],
        'geist-sans': ['var(--font-geist-sans)', 'sans-serif'],
        'geist-mono': ['var(--font-geist-mono)', 'monospace'],
      },
      fontWeight: {
        'heading': '700',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('@midudev/tailwind-animations') // 👈 Agregado aquí
  ],
};
