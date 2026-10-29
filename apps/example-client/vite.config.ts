import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@ac-state/v1": fileURLToPath(
        new URL("../../packages/actor-components/v1/index.ts", import.meta.url),
      ),
    },
  },
});
