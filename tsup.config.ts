import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  splitting: true,
  treeshake: true,
  external: ['react', 'react-dom', '@apollo/client'],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  esbuildOptions: (options) => {
    options.logLevel = 'debug'; // Enable verbose logging
  },
});
