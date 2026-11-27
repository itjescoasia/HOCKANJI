import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      '__INWORLD_API_KEY__': JSON.stringify(process.env.INWORLD_API_KEY || 'WUNNS0pEVWlSTHZkUG9UalFEeG1YRS1xdUU1U0ZGaW06VVEyUlVYejNrQVNpeGJkTHdZblllNw=='),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('xlsx') || id.includes('docx') || id.includes('file-saver')) return 'vendor-docs';
            if (id.includes('lucide-react') || id.includes('motion')) return 'vendor-ui';
          },
        },
      },
    },
  };
});
