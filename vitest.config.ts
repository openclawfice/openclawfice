import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10_000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
});
