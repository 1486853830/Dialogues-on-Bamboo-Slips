import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/proxy/dashscope': {
        target: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/dashscope/, ''),
      },
    },
  },
});