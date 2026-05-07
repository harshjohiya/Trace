import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      colors: {
        bg: {
          page: "var(--bg-page)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        border: {
          light: "var(--border-light)",
          medium: "var(--border-medium)",
          strong: "var(--border-strong)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
          border: "var(--primary-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        sm: "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px #e8e8f0",
        md: "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px #e8e8f0",
        lg: "0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px #e8e8f0",
        xl: "0 20px 60px rgba(0,0,0,0.12)",
        primary: "0 4px 20px rgba(99,102,241,0.25)",
        hero: "0 40px 80px rgba(99,102,241,0.15)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [animate],
}
