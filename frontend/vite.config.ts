import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  esbuild: {
    drop: ['console', 'debugger'],
  },
  plugins: [solidPlugin()],
  server: {
    port: 8000,
  },
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
});
