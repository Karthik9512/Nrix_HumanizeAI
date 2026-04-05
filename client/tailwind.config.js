/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        neon: {
          cyan: "#22d3ee",
          purple: "#a78bfa",
          pink: "#f472b6",
          green: "#34d399",
          amber: "#fbbf24",
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glow: "0 0 50px rgba(99, 102, 241, 0.2)",
        "glow-lg": "0 0 80px rgba(99, 102, 241, 0.3)",
        "glow-cyan": "0 0 40px rgba(34, 211, 238, 0.15)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-gradient":
          "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%), " +
          "linear-gradient(225deg, rgba(34,211,238,0.06) 0%, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
