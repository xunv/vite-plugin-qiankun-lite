---
'@xunv/vite-plugin-qiankun-lite': patch
---

fixCssLink 现在会保留原 `<link>` 标签上的相关属性（crossorigin / media / integrity / referrerpolicy），并按原始出现顺序重新注入，不再硬编码 `crossOrigin=''`，避免在未配置 CORS 或域名收敛场景下误伤样式加载。
