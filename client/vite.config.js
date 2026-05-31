import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  define: {
    'process.env': {},
    'process.cwd': '() => "/"'
  },
  resolve: {
    alias: {
      'codemirror/mode/clike/clike.js': 'codemirror/mode/clike/clike',
      'codemirror/mode/python/python.js': 'codemirror/mode/python/python'
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/question': 'http://localhost:5000',
      '/auth': 'http://localhost:5000',
      '/user': 'http://localhost:5000',
      '/profile': 'http://localhost:5000',
    }
  },
  build: {
    outDir: 'build'
  }
});
