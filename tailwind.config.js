/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Rentify blue palette (mirrors globals.css tokens) */
        brand: {
          primary: '#0992C2',        // mid blue
          primaryStrong: '#0B2D72',  // deep blue / hover
          primarySoft: '#0AC4E0',    // cyan / secondary
          accent: '#F6E7BC',         // warm cream accent
        },
        action: {
          bg: '#E6EAF2',             // noticeable grey background
          text: '#0B2D72',           // unified deep blue text
          border: 'rgba(11, 45, 114, 0.15)', // unified grey border
          hover: '#DBE2ED',          // unified grey hover state
        },
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 18px 40px rgba(15, 23, 42, 0.25)',
        'elevated': '0 24px 70px rgba(15, 23, 42, 0.42)',
      },
      transitionTimingFunction: {
        'rf-standard': 'cubic-bezier(0.21, 0.6, 0.35, 1)',
        'rf-bouncy': 'cubic-bezier(0.22, 1.25, 0.36, 1)',
      },
      transitionDuration: {
        'fast': '140ms',
        'normal': '220ms',
        'slow': '320ms',
      },
    },
  },
  plugins: [],
}