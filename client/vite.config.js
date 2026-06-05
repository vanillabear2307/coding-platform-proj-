import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  define: {
    'process.env': {}
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Express routes (auth, users, questions)
      '/question': 'http://localhost:5000',
      '/auth': 'http://localhost:5000',
      '/user': 'http://localhost:5000',
      '/profile': 'http://localhost:5000',
      // FastAPI routes (execution + AI)
      '/execute': 'http://localhost:8001',
      '/ai': 'http://localhost:8001',
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true,
      },
    }
  },
  build: {
    outDir: 'build'
  }
});
