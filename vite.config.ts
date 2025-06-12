import { defineConfig } from 'vite';
import * as babel from '@babel/core';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [],
    }
  },
  plugins: [
    { 
      name: 'vite:babel',
      enforce: 'pre',
      async transform(code, id) {
        if (!/\.(ts|js)$/.test(id)) return;
        const isTypeScript = /\.ts$/.test(id);
        const result = await babel.transformAsync(code, {
          filename: id,
          presets: isTypeScript ? ['@babel/preset-typescript'] : [],
          sourceMaps: true,
        });
        return {
          code: result.code!,
          map: result.map,
        };
      },
    },
  ],
});
