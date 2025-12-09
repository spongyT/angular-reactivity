import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2024",
  splitting: false,
  bundle: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
