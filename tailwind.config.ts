import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
        display: ["Inter", "Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "hsl(40 20% 98%)",
          warm: "hsl(35 25% 96%)",
          cool: "hsl(240 20% 97%)",
          pure: "hsl(0 0% 100%)",
        },
        ink: {
          DEFAULT: "hsl(220 30% 12%)",
          muted: "hsl(220 10% 46%)",
          subtle: "hsl(220 8% 62%)",
        },
        line: {
          DEFAULT: "hsl(40 10% 90%)",
          strong: "hsl(40 10% 84%)",
        },
        surface: {
          0: "hsl(40 20% 98%)",
          1: "hsl(0 0% 100%)",
          2: "hsl(40 15% 96%)",
          3: "hsl(40 12% 93%)",
        },
        primary: {
          DEFAULT: "#212830",
          foreground: "#ffffff",
        },
        brand: {
          DEFAULT: "#7305FF",
          soft: "#F3EBFF",
        },
        accent: {
          violet: "#6E56F5",
          green: "#2BAA7E",
          orange: "#F17738",
          rose: "#E6417B",
          amber: "#E9A33F",
          sky: "#3B8CE6",
        },
      },
      borderRadius: {
        pill: "9999px",
        card: "20px",
        lg: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 22, 36, 0.04), 0 4px 20px -8px rgba(15, 22, 36, 0.06)",
        pop: "0 4px 24px -6px rgba(15, 22, 36, 0.12)",
        ring: "0 0 0 1px hsl(40 10% 90%)",
      },
      fontSize: {
        xxs: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      },
    },
  },
  plugins: [],
};

export default config;
