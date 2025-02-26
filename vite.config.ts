import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic'
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    force: true,
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    sourcemap: true
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
      timeout: 120000,
      clientPort: 5173,
      host: 'localhost'
    },
    watch: {
      usePolling: true,
      interval: 1000,
      followSymlinks: false,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    cors: true,
    middlewareMode: false,
    fs: {
      strict: true,
      allow: ['..']
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  },
  clearScreen: false,
  logLevel: 'info'
});