import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { assetsDir: "preview-assets" },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    proxy: {
      "/original": {
        target: "http://localhost:4178",
        rewrite: (p) => p.replace(/^\/original/, ""),
      },
      "/assets": { target: "http://localhost:4178" },
      "/chapters": { target: "http://localhost:4178" },
    },
  },
});
