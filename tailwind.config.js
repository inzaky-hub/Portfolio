/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'dc-bg': '#0A0E1A',
        'dc-surface': '#111827',
        'dc-cyan': '#00E5FF',
        'dc-green': '#10B981',
        'dc-amber': '#FF9900',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
