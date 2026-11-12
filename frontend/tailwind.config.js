/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Legacy audit-tool tokens (kept for component compatibility) */
        argus: {
          bg:     '#121111',
          panel:  '#1a1816',
          border: '#2a2520',
          accent: '#D4A052',
          red:    '#da3633',
          yellow: '#D4A052',
          blue:   '#234F60',
          muted:  '#9a9186',
        },
        /* Luxury palette */
        lux: {
          black:   '#121111',
          sapphire:'#234F60',
          gold:    '#D4A052',
          ice:     '#DFE6E6',
          silver:  '#EFEFEF',
          white:   '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
