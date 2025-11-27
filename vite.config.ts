import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "driver.js/dist/driver.min.css",
        replacement: path.resolve(
          __dirname,
          "node_modules/driver.js/dist/driver.min.css"
        ),
      },
      {
        find: "driver.js/dist/driver.css",
        replacement: path.resolve(
          __dirname,
          "node_modules/driver.js/dist/driver.css"
        ),
      },
    ],
  },
});
