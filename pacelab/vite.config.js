import tailwindcss from '@tailwindcss/vite';
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react(),  tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
