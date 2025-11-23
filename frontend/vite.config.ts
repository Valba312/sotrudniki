import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
codex/implement-employee-digital-card-module-vzo4s3
=======
codex/implement-employee-digital-card-module
 main
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
codex/implement-employee-digital-card-module-vzo4s3
=======
=======
    port: 5173
main
main
  }
});
