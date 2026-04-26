import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Anchor all React packages to this project's node_modules so
      // test files located outside the project directory can resolve them.
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
      '@testing-library/react': path.resolve(__dirname, 'node_modules/@testing-library/react'),
      '@testing-library/jest-dom': path.resolve(__dirname, 'node_modules/@testing-library/jest-dom'),
      '@testing-library/user-event': path.resolve(__dirname, 'node_modules/@testing-library/user-event'),
    },
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname),             // vite-project root (default)
        path.resolve(__dirname, '../../..'), // workspace root (for external tests)
      ],
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: '../../../tests/react/setup.js',
    css: false,
    include: ['../../../tests/react/**/*.test.{js,jsx,tsx}'],
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}'],
      reportsDirectory: './coverage',
    },
  },
});
