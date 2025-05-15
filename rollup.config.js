import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/sky-tonight-card.ts',
  output: {
    file: 'dist/sky-tonight-card.js',
    format: 'es',
  },
  plugins: [
    resolve(),
    typescript(),
    terser(),
    copy({
      targets: [
        { src: 'images', dest: 'dist' }
      ],
      copyOnce: false
    })
  ]
};
