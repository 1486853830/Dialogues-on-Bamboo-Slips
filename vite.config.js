import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/dashscope': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dashscope/, ''),
      },
    },
  },
});
