import { defineConfig } from 'vite'; 
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { mergeConfig } from 'vite';
import { defineConfig as defineTestConfig } from 'vitest/config';
import * as path from 'path';

const viteConfig = defineConfig({
  plugins: [react(), svgr()],
  build: {
    outDir: path.resolve(__dirname, '../Backend/static'), 
    emptyOutDir: true, 
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', 
      },
    },
  },
  resolve: {
    alias: {
      '@fonts': path.resolve(__dirname, 'src/fonts/'),
    },
  },
  assetsInclude: ['**/*.woff', '**/*.woff2'],
});

const vitestConfig = defineTestConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
});

export default mergeConfig(viteConfig, vitestConfig);
