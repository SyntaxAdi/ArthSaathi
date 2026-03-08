/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        code: 'var(--bg-code)',
        borderDefault: 'var(--border-default)',
        borderSubtle: 'var(--border-subtle)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: 'var(--accent)',
        accentHover: 'var(--accent-hover)',
        accentGlow: 'var(--accent-glow)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        heading: ['Syne', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        wide: '0.04em',
        wider: '0.05em',
        widest: '0.06em',
        mega: '0.08em',
      }
    },
  },
  plugins: [],
}
