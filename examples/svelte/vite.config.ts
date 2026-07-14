import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import qiankun from "@xunv/vite-plugin-qiankun-lite";
import { name } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), qiankun({ name, sandbox: !!process.env.VITE_SANDBOX })],
  server: {
    cors: true,
    origin: "*",
  },
});
