import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // VYRAL brand colors
        void: "var(--void)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        white: "var(--white)",
        muted: "var(--muted)",
        "muted-2": "var(--muted-2)",
        magenta: "var(--magenta)",
        cyan: "var(--cyan)",
      },
      borderRadius: {
        DEFAULT: "2px",
      },
      fontFamily: {
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
      container: {
        center: true,
        padding: "24px",
        screens: {
          sm: "100%",
          md: "100%",
          lg: "100%",
          xl: "100%",
          "2xl": "1240px",
        },
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(.16,1,.3,1)",
      },
      boxShadow: {
        "glow-m": "0 0 26px rgba(255,30,86,.55)",
        "glow-c": "0 0 26px rgba(34,224,255,.5)",
      },
    },
  },
  plugins: [],
};

export default config;
