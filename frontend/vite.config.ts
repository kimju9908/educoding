import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({ targets: [{ src: 'dist/*', dest: '../../backend/src/main/resources/static/' }] }),
  ],
  base: '/',
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      overlay: true,
    },
    middlewareMode: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true, // debugger 제거
      },
    },
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // 외부 라이브러리를 별도 번들로 분리
          }
        },
      },
    },
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
  },
  optimizeDeps: {
    include: ['react', 'react-router-dom'],
  },
});
