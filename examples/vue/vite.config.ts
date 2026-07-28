import vue from '@vitejs/plugin-vue'
import qiankun from '@xunv/vite-plugin-qiankun-lite'
import { defineConfig } from 'vite'
import { name } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    qiankun({ name, sandbox: !!process.env.VITE_SANDBOX, fixCssLink: true }),
  ],
  server: {
    cors: true,
    // qiankun 环境下，子应用被挂载到主应用页面，通过 import 得到的资源 URL
    // （如 /src/assets/vue.svg）是相对路径，会被浏览器按主应用 origin 解析而 404。
    // 设置 server.origin 为子应用自身地址后，Vite dev 生成的资源 URL 会带上完整
    // origin，指回子应用，图片等静态资源即可正确加载。
    origin: 'http://localhost:8002',
  },
})
