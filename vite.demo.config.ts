import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type Plugin } from "vite";

const createHtmlPlugin = ({
  inject,
}: {
  inject?: { data?: Record<string, string> };
  minify?: boolean;
} = {}): Plugin => ({
  name: "vite-plugin-simple-html",
  transformIndexHtml(html: string) {
    let result = html;
    if (inject?.data) {
      for (const [key, value] of Object.entries(inject.data)) {
        result = result.replaceAll(
          new RegExp(`<%=\\s*${key}\\s*%>`, "g"),
          value,
        );
      }
    }
    return result;
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174,
    host: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: process.env.NODE_ENV !== "CI",
      filename: "./dist/stats.html",
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          mainScript: `demo/main.tsx`,
        },
      },
    }),
  ],
  define: {
    "import.meta.env.VITE_IS_DEMO": JSON.stringify("true"),
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL ?? "https://demo.example.org",
    ),
    "import.meta.env.VITE_SB_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SB_PUBLISHABLE_KEY ?? "https://demo.example.org",
    ),
  },
  base: "./",
  build: {
    rolldownOptions: {
      output: {
        keepNames: true,
      },
    },
    sourcemap: true,
  },
  resolve: {
    preserveSymlinks: true,
    dedupe: ["react-router", "react-router-dom"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
