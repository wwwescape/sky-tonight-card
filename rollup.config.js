import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/sky-tonight-card.ts",
  output: {
    file: "dist/sky-tonight-card.js",
    format: "es",
  },
  plugins: [resolve(), typescript(), terser()],
};
