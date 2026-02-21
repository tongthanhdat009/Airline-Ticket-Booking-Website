/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      },
      colors: {
        // SGU Airline color scheme - Blue theme
        primary: {
          DEFAULT: "#1E88E5",
          dark: "#1565C0",
          light: "#42A5F5",
        },
        secondary: {
          DEFAULT: "#64B5F6",
          dark: "#42A5F5",
          light: "#90CAF9",
        },
        accent: {
          DEFAULT: "#FF7043",
          dark: "#F4511E",
          light: "#FF8A65",
        },
        sguAirline: {
          blue: "#1E88E5",
          lightblue: "#64B5F6",
          softbg: "#E3F2FD",
          accent: "#FF7043",
        },
        pageBg: "#F5F7FA",
        textMain: "#222222",
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
          "linear-gradient(135deg, #E3F2FD 0%, #F5F7FA 50%, #FFFFFF 100%)",
        "gradient-primary": "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
      },
    },
  },
  plugins: [],
};
