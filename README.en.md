# @xunv/vite-plugin-qiankun-lite

[简体中文](./README.md) | English

A simple Vite plugin for efficiently running MicroFrontend applications using [qiankun](https://github.com/umijs/qiankun).

## Background

This project is an **independently maintained fork** of [vite-plugin-qiankun-lite](https://github.com/kotarella1110/vite-plugin-qiankun-lite) by [@kotarella1110](https://github.com/kotarella1110). As the original plugin is no longer maintained, I have applied bug fixes and feature enhancements on top of it to keep the Vite + qiankun integration working, and publish it independently as `@xunv/vite-plugin-qiankun-lite`.

Heartfelt thanks to the original author, Kotaro Sugawara, for the pioneering work—this project would not exist without the original plugin. The original author's copyright is fully preserved in the [LICENSE](./LICENSE).

## What's Different from the Original

Compared with the original (up to `1.3.0`), this fork adds the following fixes and enhancements starting from `1.4.0`:

- **Added the `fixCssLink` option**: Fixes 404s caused by relative CSS `<link>` paths when a sub application runs under qiankun, by dynamically injecting stylesheets with the correct `publicPath` prefix at runtime while preserving the original tag attributes and injection order.
- **Fixed `publicPath` concatenation**: Eliminates double slashes like `//assets/xxx.js`, and prevents full URLs (`http(s)://`, `//`) from being incorrectly prefixed.
- **Fixed sandbox identifier transform**: Prevents `ImportSpecifier` from being wrongly replaced, which could break import bindings.
- **Improved compatibility when Vite is used as an API**: Moved the `@vite/client` rewrite into `transformIndexHtml`, fixing ESM errors when integrated into hosts such as Egg/Koa.
- **Modernized publishing**: Switched to Trusted Publisher (OIDC) with build provenance.

See the [CHANGELOG](./packages/vite-plugin-qiankun-lite/CHANGELOG.md) for the per-version details.

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

| Option       | Type      | Default | Description                                                              |
| ------------ | --------- | ------- | ------------------------------------------------------------------------ |
| `name`       | `string`  | -       | The sub application name; must match the one registered in the main app. |
| `sandbox`    | `boolean` | `false` | Whether to enable the JS Sandbox (experimental).                         |
| `fixCssLink` | `boolean` | `false` | Whether to fix relative paths of CSS `<link>` tags; see below.           |

#### `fixCssLink`

In a qiankun micro-frontend environment, paths like `<link rel="stylesheet" href="/assets/xxx.css">` in the HTML produced by Vite are relative to the sub application itself. However, when the sub application is loaded by qiankun, the CSS path must be prefixed with the `publicPath` injected by qiankun to load correctly; otherwise it returns 404.

When enabled, the plugin removes relative-path `<link rel="stylesheet">` tags and injects a runtime script that reads the prefix via `__INJECTED_PUBLIC_PATH_BY_QIANKUN__`, then dynamically creates the `<link>` and inserts it into `<head>`—consistent with how the JS entry path is handled. The original `crossorigin` / `media` / `integrity` / `referrerpolicy` attributes are preserved, and the tags are re-injected in their original order to maintain cascade order and loading semantics as much as possible.

```javascript
qiankun({ name: 'sub-app', sandbox: true, fixCssLink: true })
```

> **Side effects (non-qiankun scenarios)**
>
> Once enabled, this option takes effect whether or not it runs in a qiankun environment. Because `<link>` tags are created dynamically via JS at runtime, style loading is deferred compared to the original static `<link>`, leading to the following side effects:
>
> - **Flash of Unstyled Content (FOUC)**: In standalone (non-qiankun) mode, a brief flash of unstyled content may appear during the first render.
> - **Not discoverable by the preload scanner**: The browser's preload scanner cannot discover these JS-injected style resources ahead of time, which may impact first-screen loading performance.
>
> These are inherent costs of converting static `<link>` tags into JS injection. Therefore `fixCssLink` is **disabled by default and should be enabled only when necessary** (e.g., when sub-application styles 404 under qiankun). If your sub application must also run standalone and is sensitive to first-screen styling, evaluate carefully.

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
