import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import stylelint from 'vite-plugin-stylelint'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    stylelint({
      fix: true,
      include: ['src/**/*.{css,scss,sass,less,styl,vue}'],
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
