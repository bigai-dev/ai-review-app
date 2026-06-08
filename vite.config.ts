import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: 3002,
      host: '0.0.0.0',
      // Allow the website to be opened through a dev tunnel link
      allowedHosts: ['.devtunnels.ms', '.trycloudflare.com'],
      proxy: {
        '/api': {
          target: 'http://localhost:3005',
          changeOrigin: true,
        }
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
