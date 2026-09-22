import type { Config } from "tailwindcss";

/**
 * Editorial design system.
 * Public site: restrained black / off-white / charcoal palette with a single
 * warm accent. Admin: neutral, functional greys layered on top of the same tokens.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "3rem", xl: "4rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0b0b0c", // near-black
          soft: "#1a1a1d",
          muted: "#3a3a3f",
        },
        paper: {
          DEFAULT: "#f7f5f1", // warm off-white
          pure: "#ffffff",
          dim: "#efece6",
        },
        stone: {
          50: "#f6f5f3",
          100: "#e9e7e2",
          200: "#d6d2ca",
          300: "#b7b1a6",
          400: "#928b7e",
          500: "#726c61",
          600: "#5a554c",
          700: "#48443d",
          800: "#302d29",
          900: "#1c1a17",
        },
        accent: {
          DEFAULT: "#a8846b", // muted warm bronze
          soft: "#c4a488",
          deep: "#7c604b",
        },
        // Admin surfaces
        surface: {
          DEFAULT: "#ffffff",
          sunken: "#f4f4f5",
          raised: "#ffffff",
        },
        line: "rgba(11,11,12,0.10)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["clamp(3rem, 8vw, 7.5rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display": ["clamp(2.25rem, 5.5vw, 5rem)", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
        "display-sm": ["clamp(1.75rem, 3.5vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        label: "0.22em",
      },
      maxWidth: {
        prose: "68ch",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "line-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "ken-burns": "ken-burns 7s ease-out both",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease both",
        "line-grow": "line-grow 0.8s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
