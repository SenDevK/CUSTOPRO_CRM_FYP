import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8082,
    strictPort: true,
    proxy: {
      '/api/segments': {
        target: 'http://localhost:5003',   // segment customization
        changeOrigin: true,
      },
      '/api/segment': {
        target: 'http://localhost:8000', // segmentation
        changeOrigin: true,
      },
      '/api/revenue': {
        target: 'http://localhost:5001', // revenue model
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/api/marketing': {
        target: 'http://localhost:5002', // marketing backend
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000', // data ingesting and retreiving
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
