import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Local dev port (tránh đụng OnlineMarket admin :5188 / Airline mặc định :5173).
  server: {
    port: 5181,
  },
  preview: {
    port: 5181,
  },
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          antd: ["antd", "@ant-design/icons"],
          recharts: ["recharts"],
        },
      },
    },
  },
});
