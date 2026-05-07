import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@anicode/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@anicode/core/react': path.resolve(__dirname, '../../packages/core/src/React/index.ts'),
    }
  },
  server: { port: 3000 }
});