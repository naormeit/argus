/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        argus: {
          bg:     '#0d1117',
          panel:  '#161b22',
          border: '#30363d',
          accent: '#238636',
          red:    '#da3633',
          yellow: '#e3b341',
          blue:   '#58a6ff',
          muted:  '#8b949e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
