import path from 'node:path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'happy-dom',
    watch: false,
    coverage: {
      enabled: true,
      reporter: process.env.CI ? 'lcovonly' : ['text-summary', 'lcov'],
    },
    reporters: ['default', 'github-actions'],
    alias: {
      'server-only': path.resolve(import.meta.dirname, './tests/mocks/serverOnly.ts'),
    },
  },
});
