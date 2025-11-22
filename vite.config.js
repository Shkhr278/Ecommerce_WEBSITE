import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async () => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
  ];

  // Optional: cartographer plugin only if on Replit & not production
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    const cartographer = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer.cartographer());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "client", "src"),
        "@shared": path.resolve(process.cwd(), "shared"),
        "@assets": path.resolve(process.cwd(), "attached_assets"),
      },
    },
    root: path.resolve(process.cwd(), "client"),
    build: {
      outDir: path.resolve(process.cwd(), "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
    },
    "/ws": {
      target: "ws://localhost:8000",
      ws: true,
    },
  },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
