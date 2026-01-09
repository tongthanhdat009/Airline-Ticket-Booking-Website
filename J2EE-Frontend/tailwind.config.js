/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // SGU Airline color scheme
        primary: {
          DEFAULT: "#E30613",
          dark: "#C40511",
          light: "#FF1F2E",
        },
        secondary: {
          DEFAULT: "#FFD500",
          dark: "#E6C000",
          light: "#FFED4E",
        },
        sguAirline: {
          red: "#E30613",
          yellow: "#FFD500",
          pink: "#FFE5E7",
          orange: "#FF6B00",
        },
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
        "gradient-sguairline":
          "linear-gradient(135deg, #FFE5E7 0%, #FFF5E6 50%, #FFFFFF 100%)",
        "gradient-red": "linear-gradient(135deg, #E30613 0%, #C40511 100%)",
      },
    },
  },
  plugins: [],
};
