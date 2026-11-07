import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const woff2Only = () => ({
  name: "woff2-only",
  generateBundle(_, bundle) {
    for (const f of Object.keys(bundle)) {
      if (/\.(woff|ttf)$/.test(f)) delete bundle[f];
    }
  },
});

export default defineConfig(() => {
  return {
    base: "./",
    plugins: [react(), tailwindcss(), woff2Only()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
