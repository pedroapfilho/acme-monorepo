export default {
  external: ["react", "react-dom"],
  entries: {
    "./index": "./src/index.ts",
  },
  dts: true,
  target: "es2020",
  format: "esm",
  sourcemap: false,
};
