import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import { pluginExposeRenderer } from "./vite.base.config";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"renderer">;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? "";

  return {
    root,
    mode,
    base: "/",
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer(name)],
    resolve: {
      preserveSymlinks: true,
      alias: [
        { find: "@Assets", replacement: resolve(__dirname, "./src/assets") },
        {
          find: "@Components",
          replacement: resolve(__dirname, "./src/renderer/components"),
        },
        { find: "@Lib", replacement: resolve(__dirname, "./src/lib") },
        { find: "@Main", replacement: resolve(__dirname, "./src/main") },
        {
          find: "@Renderer",
          replacement: resolve(__dirname, "./src/renderer"),
        },
        { find: "@Types", replacement: resolve(__dirname, "./src/types") },
      ],
    },
    clearScreen: false,
  } as UserConfig;
});
