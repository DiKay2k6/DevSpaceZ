/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  optimizeDeps: {
    include: ['recharts', 'decimal.js-light', 'es-toolkit', 'es-toolkit/compat']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/yjs': {
        target: 'http://localhost:5001',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
  }
});