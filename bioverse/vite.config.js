import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// Plugin to strip legacy non-woff2 font assets to keep dist size minimal
function woff2OnlyPlugin() {
  return {
    name: "vite-plugin-woff2-only",
    generateBundle(_, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (
          fileName.endsWith(".woff") ||
          fileName.endsWith(".ttf") ||
          fileName.endsWith(".eot")
        ) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: "./",
    plugins: [react(), tailwindcss(), woff2OnlyPlugin()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      target: "es2022",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("node_modules/three") ||
              id.includes("node_modules/@react-three")
            ) {
              return "vendor-three";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-icons";
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
