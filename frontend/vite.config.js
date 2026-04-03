import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiTarget = env.VITE_API_URL?.replace("/api/", "") || "http://127.0.0.1:8000";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("react-toastify")) return "toast";
            if (id.includes("recharts")) return "charts";
            if (id.includes("@react-three") || id.includes("three") || id.includes("maath")) return "three";
            if (id.includes("framer-motion") || id.includes("gsap")) return "motion";
            return "vendor";
          },
        },
      },
    },
  };
});