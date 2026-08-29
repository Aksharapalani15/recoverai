/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "#F5F6F8",
        surface: "#FFFFFF",
        border: "#E4E7EC",
        ink: {
          900: "#0B1220",
          800: "#0F172A",
          700: "#1E293B",
          500: "#64748B",
          400: "#94A3B8",
          200: "#E2E8F0",
        },
        sidebar: {
          DEFAULT: "#0B1220",
          active: "#16213A",
          border: "#1C2740",
        },
        brand: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          500: "#0D9488",
          600: "#0F766E",
          700: "#115E59",
        },
        priority: {
          veryhigh: "#DC2626",
          high: "#D97706",
          medium: "#2563EB",
          low: "#64748B",
        },
        status: {
          success: "#059669",
          successSoft: "#D1FAE5",
          danger: "#DC2626",
          dangerSoft: "#FEE2E2",
        },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        raised: "0 4px 12px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
