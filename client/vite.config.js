import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // Add server configuration
    proxy: {
      // Proxy /api requests to backend server
      '/api': {
        target: 'http://localhost:5001', // Your backend server address
        changeOrigin: true,
        secure: false, // If backend is not https
      },
    },
  },
});
