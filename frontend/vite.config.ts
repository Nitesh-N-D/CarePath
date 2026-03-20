import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react-dom") || id.includes("node_modules/react/")) {
            return "react-core";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (id.includes("axios")) {
            return "network";
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("jspdf")) {
            return "pdf-core";
          }

          if (id.includes("html2canvas")) {
            return "html-capture";
          }

          if (id.includes("dompurify")) {
            return "sanitizer";
          }
        },
      },
    },
  },
});
