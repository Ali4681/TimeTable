/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: "#101724",
        },
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        // LanguageToggle specific colors
        language: {
          toggle: {
            DEFAULT: "oklch(var(--language-toggle))",
            foreground: "oklch(var(--language-toggle-foreground))",
            hover: "oklch(var(--language-toggle-hover))",
            active: "oklch(var(--language-toggle-active))",
          },
          dropdown: {
            bg: "oklch(var(--language-dropdown-bg))",
            item: {
              bg: "oklch(var(--language-dropdown-item-bg))",
              hover: "oklch(var(--language-dropdown-item-hover))",
              active: "oklch(var(--language-dropdown-item-active))",
            },
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // For LanguageToggle
        language: "var(--radius-language, var(--radius))",
      },
      boxShadow: {
        language: "var(--shadow-language)",
      },
      backdropBlur: {
        language: "var(--blur-language, 8px)",
      },
      // Animation extensions for smooth transitions
      animation: {
        "language-fade": "fadeIn 0.2s ease-out",
        "language-slide": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // only generate classes
    }),
    require("tailwindcss-animate"),
  ],
};
