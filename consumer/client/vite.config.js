import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      "/health": "http://localhost:3002",
      "/alerts": "http://localhost:3002",
      "/ws": {
        target: "ws://localhost:3002",
        ws: true,
      },
    },
  },
});
