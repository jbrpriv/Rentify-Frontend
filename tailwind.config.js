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
        /* Rentify green palette */
        brand: {
          primary: '#A2CB8B',      // muted green
          primaryStrong: '#84B179', // deep green / hover
          primarySoft: '#C7EABB',   // soft mint / secondary
          accent: '#E8F5BD',        // pale yellow‑green
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