import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const githubPagesBase = process.env.GITHUB_PAGES === 'true' && repositoryName
  ? `/${repositoryName}/`
  : '/';

export default defineConfig({
  base: githubPagesBase,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
