/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      },
      colors: {
        // JADT Airline color scheme - Blue theme based on logo
        primary: {
          DEFAULT: "#0EA5E9",
          dark: "#0284C7",
          light: "#38BDF8",
        },
        secondary: {
          DEFAULT: "#1D4ED8",
          dark: "#1E40AF",
          light: "#3B82F6",
        },
        accent: {
          DEFAULT: "#0EA5E9",
          dark: "#0284C7",
          light: "#7DD3FC",
        },
        jadtAirline: {
          // From logo: main brand blue (accent T color)
          primary: "#0EA5E9",
          // From logo: medium blue gradient
          secondary: "#1D4ED8",
          // From logo: dark blue tones
          dark: "#1E3A8A",
          darker: "#1E40AF",
          deepest: "#172554",
          // From logo: light blue tones
          light: "#38BDF8",
          lighter: "#0284C7",
          // Soft background
          softbg: "#F0F9FF",
        },
        pageBg: "#F0F9FF",
        textMain: "#1E3A8A",
      },
      animation: {
        "pulse-slow": "pulse 15s infinite",
        slide: "slide 20s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        slide: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "gradient-jadtairline":
          "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #FFFFFF 100%)",
        "gradient-primary": "linear-gradient(135deg, #0EA5E9 0%, #1D4ED8 100%)",
        "gradient-secondary": "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
      },
    },
  },
  plugins: [],
};
