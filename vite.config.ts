import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
import connectDb from "./server/db";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "./"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // Ensure mongoose connects when Vite mounts the Express middleware so
      // the same mongoose instance is used by the routes (avoids 'Mongoose not connected').
      try {
        await connectDb();
        console.log("🌿 MongoDB connected (via Vite dev plugin)");
      } catch (err) {
        console.warn("Could not connect MongoDB in Vite plugin:", err?.message ?? err);
        // continue — routes that require DB will handle absence gracefully
      }

      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
