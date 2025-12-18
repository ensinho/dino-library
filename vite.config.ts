import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Dev-only proxy to avoid CORS. Use /ext/dinopics/... in fetch.
      '/ext/dinopics': {
        target: 'https://dinosaurpictures.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ext\/dinopics/, '/api'),
      },
    },
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
