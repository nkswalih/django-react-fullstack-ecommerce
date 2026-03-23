import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react-toastify")) return "toast";
          if (id.includes("recharts")) return "charts";
          if (id.includes("@react-three") || id.includes("three") || id.includes("maath")) return "three";
          if (id.includes("framer-motion") || id.includes("gsap")) return "motion";
          return "vendor";
        },
      },
    },
  },
});
