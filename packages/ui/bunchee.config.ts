export default {
  dts: true,
  entries: {
    "./index": "./src/index.ts",
  },
  external: ["react", "react-dom"],
  format: "esm",
  sourcemap: false,
  target: "es2020",
};
