import { defineConfig } from "vite";

const stripCrossorigin = () => ({
  name: "strip-crossorigin",
  transformIndexHtml: (html) => html.replace(/ crossorigin/g, ""),
});

const woff2Only = () => ({
  name: "woff2-only",
  generateBundle(_, bundle) {
    for (const f of Object.keys(bundle)) {
      if (/\.(woff|ttf)$/.test(f)) delete bundle[f];
    }
  },
});

export default defineConfig({
  base: "./",
  plugins: [stripCrossorigin(), woff2Only()],
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1500,
  },
});
