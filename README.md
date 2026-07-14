# vite-plugin-qiankun-lite

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
npm install -D vite-plugin-qiankun-lite
```

## Getting Started

You can start working with just a few simple steps. Add the qiankun plugin to your sub application's Vite configuration like so:

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun-lite'

export default defineConfig({
  plugins: [react(), qiankun({ name: 'sub-app', sandbox: true })],
})
```

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
