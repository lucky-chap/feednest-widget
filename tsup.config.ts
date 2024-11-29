import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  env: {
    VITE_APP_URL: `${process.env.VITE_APP_URL}`,
    VITE_GRAPHQL_URI: `${process.env.VITE_GRAPHQL_URI}`,
  }
});
