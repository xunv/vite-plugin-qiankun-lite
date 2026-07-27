# @xunv/vite-plugin-qiankun-lite

A simple Vite plugin for efficiently running MicroFrontend applications using [qiankun](https://github.com/umijs/qiankun).

## Background

由于原版 [vite-plugin-qiankun-lite](https://github.com/kotarella1110/vite-plugin-qiankun-lite) 已不再维护，本项目基于原版插件进行了修复和二次开发。具体改动请查看 [CHANGELOG](./packages/vite-plugin-qiankun-lite/CHANGELOG.md)。

## Features

- Offers the simplest method for integrating qiankun with Vite.
- Preserves Vite's benefits in constructing ES modules.
- Allows for one-click configuration without disrupting existing Vite setups.
- Includes a comprehensive JS Sandbox whenever feasible (experimental).
- Supports React's HMR (Hot Module Replacement).

## Installation

```bash
npm install -D @xunv/vite-plugin-qiankun-lite
```

## Getting Started

You can start working with just a few simple steps. Add the qiankun plugin to your sub application's Vite configuration like so:

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from '@xunv/vite-plugin-qiankun-lite'

export default defineConfig({
  plugins: [react(), qiankun({ name: 'sub-app', sandbox: true })],
})
```

### Options

| Option       | Type      | Default | Description                                          |
| ------------ | --------- | ------- | ---------------------------------------------------- |
| `name`       | `string`  | -       | 子应用名称，需与主应用注册时保持一致。               |
| `sandbox`    | `boolean` | `false` | 是否启用 JS 沙箱（实验特性）。                       |
| `fixCssLink` | `boolean` | `false` | 是否修复 CSS `<link>` 标签的相对路径，详见下文说明。 |

#### `fixCssLink`

在 qiankun 微前端环境下，Vite 产出的 HTML 中形如 `<link rel="stylesheet" href="/assets/xxx.css">` 的路径是相对于子应用自身的。但子应用被 qiankun 加载时，CSS 路径需要加上 qiankun 注入的 `publicPath` 前缀才能正确加载，否则会 404。

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

## Comparison with vite-plugin-qiankun

This plugin is primarily inspired by [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun) but differs in the following ways:

- You can get started with just adding the plugin.
- This means you don't need to use functions like `exportLifeCycleHooks` to export qiankun's lifecycle or constants like `qiankunWindow` to access the proxy window provided by qiankun.
- Offers a comprehensive JS Sandbox wherever possible.

## Inspiration

In the development of this plugin, I drew significant inspiration from the following projects and communities. I express my heartfelt gratitude.

- [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun)
- [@sh-winter/vite-plugin-qiankun](https://github.com/sh-winter/vite-plugin-qiankun)
- [vite-plugin-legacy-qiankun](https://github.com/lishaobos/vite-plugin-legacy-qiankun)
