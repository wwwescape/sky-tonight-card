import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/sky-tonight-card.ts', // Path to your entry point file
  output: {
    file: 'dist/sky-tonight-card.js', // Output bundled file
    format: 'es', // Use ES Module format
  },
  plugins: [
    resolve(),
    typescript(),
    terser() // Minify the output for better performance in production
  ]
};
