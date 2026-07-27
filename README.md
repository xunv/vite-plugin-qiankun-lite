# @xunv/vite-plugin-qiankun-lite

简体中文 | [English](./README.en.md)

一个简单的 Vite 插件，用于借助 [qiankun](https://github.com/umijs/qiankun) 高效运行微前端应用。

## 背景

本项目是 [vite-plugin-qiankun-lite](https://github.com/kotarella1110/vite-plugin-qiankun-lite)(作者 [@kotarella1110](https://github.com/kotarella1110))的一个**独立维护 fork**。原版插件已不再维护，为持续解决 Vite + qiankun 集成中的问题，我在其基础上进行了修复和功能增强，并以 `@xunv/vite-plugin-qiankun-lite` 独立发布。

在此衷心感谢原作者 Kotaro Sugawara 的开创性工作——没有原版插件，就没有本项目。原作者的版权已在 [LICENSE](./LICENSE) 中完整保留。

## 相较原版的改进

相较原版（截至 `1.3.0`），本 fork 从 `1.4.0` 起做了以下修复与增强：

- **新增 `fixCssLink` 选项**：修复子应用在 qiankun 下 CSS `<link>` 相对路径导致的 404，通过运行时按 `publicPath` 动态注入样式，并保留原标签属性、维持注入顺序。
- **修复 `publicPath` 拼接问题**：消除 `//assets/xxx.js` 双斜杠，以及 `http(s)://`、`//` 等完整 URL 被错误加前缀的问题。
- **修复沙箱标识符转换**：避免 `ImportSpecifier` 被误替换而破坏 import 绑定。
- **改进 Vite 作为 API 集成的兼容性**：将 `@vite/client` 改写迁移到 `transformIndexHtml`，修复在 Egg/Koa 等宿主中集成时 ESM 报错。
- **发布现代化**：改用 Trusted Publisher（OIDC）发布，附带 build provenance（来源证明）。

逐版本明细请查看 [CHANGELOG](./packages/vite-plugin-qiankun-lite/CHANGELOG.md)。

## 特性

- 提供将 qiankun 集成到 Vite 的最简方式。
- 保留 Vite 构建 ES 模块的优势。
- 一键配置，不破坏已有的 Vite 设置。
- 尽可能提供完善的 JS 沙箱（实验特性）。
- 支持 React 的 HMR（热模块替换）。

## 安装

```bash
npm install -D @xunv/vite-plugin-qiankun-lite
```

## 快速开始

只需几个简单步骤即可上手。在子应用的 Vite 配置中加入 qiankun 插件即可：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from '@xunv/vite-plugin-qiankun-lite'

export default defineConfig({
  plugins: [react(), qiankun({ name: 'sub-app', sandbox: true })],
})
```

## 配置项

| 配置项       | 类型      | 默认值  | 说明                                                 |
| ------------ | --------- | ------- | ---------------------------------------------------- |
| `name`       | `string`  | -       | 子应用名称，需与主应用注册时保持一致。               |
| `sandbox`    | `boolean` | `false` | 是否启用 JS 沙箱（实验特性）。                       |
| `fixCssLink` | `boolean` | `false` | 是否修复 CSS `<link>` 标签的相对路径，详见下文说明。 |

### `fixCssLink`

在 qiankun 微前端环境下，Vite 产出的 HTML 中形如 `<link rel="stylesheet" href="/assets/xxx.css">` 的路径是相对于子应用自身的。但子应用被 qiankun 加载时，CSS路径需要加上 qiankun 注入的 `publicPath` 前缀才能正确加载，否则会 404。

开启后，插件会将相对路径的 `<link rel="stylesheet">` 移除，并注入一段运行时脚本，通过 `__INJECTED_PUBLIC_PATH_BY_QIANKUN__` 获取前缀后动态创建 `<link>` 插入 `<head>`，与 JS 入口路径的处理方式保持一致。处理时会保留原标签上的 `crossorigin` / `media` / `integrity` / `referrerpolicy` 属性，并按原始出现顺序重新注入，以尽量维持样式层叠顺序与加载语义。

```javascript
qiankun({ name: 'sub-app', sandbox: true, fixCssLink: true })
```

> **副作用说明（非 qiankun 场景）**
>
> 该选项一旦开启，无论是否运行在 qiankun 环境下都会生效。由于是在运行时通过 JS 脚本动态创建 `<link>`，相较于原始静态 `<link>`，样式加载会被推后，因此存在以下副作用：
>
> - **样式闪烁（FOUC）**：在独立运行（非 qiankun）场景下，页面首次渲染时可能出现短暂的无样式内容闪烁。
> - **无法被 preload scanner 提前发现**：浏览器的 preload scanner 无法提前发现这些改为 JS 注入的样式资源，可能影响首屏加载性能。
>
> 这是将静态 `<link>` 改为 JS 注入这一手法的固有代价，因此 `fixCssLink` **默认关闭，仅在确有需要（如子应用样式在 qiankun 下 404）时按需开启**。若子应用需要同时独立运行且对首屏样式体验敏感，请谨慎评估。

## 与 vite-plugin-qiankun 的对比

本插件主要受 [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun) 启发，但存在以下差异：

- 只需添加插件即可开始使用。
- 也就是说，你无需使用 `exportLifeCycleHooks` 这类函数导出 qiankun 生命周期，也无需使用 `qiankunWindow` 这类常量访问 qiankun 提供的代理 window。
- 尽可能提供完善的 JS 沙箱。

## 致谢

在开发本插件的过程中，我从以下项目和社区中获得了大量启发，在此表示由衷的感谢。

- [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun)
- [@sh-winter/vite-plugin-qiankun](https://github.com/sh-winter/vite-plugin-qiankun)
- [vite-plugin-legacy-qiankun](https://github.com/lishaobos/vite-plugin-legacy-qiankun)
