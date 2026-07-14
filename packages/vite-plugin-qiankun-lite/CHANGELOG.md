# vite-plugin-qiankun-lite

## 1.4.2

### Patch Changes

- [`82c4b03`](https://github.com/xunv/vite-plugin-qiankun-lite/commit/82c4b033580d59548e949405c78f83d770763195) Thanks [@xunv](https://github.com/xunv)! - docs: update README package name to scoped `@xunv/vite-plugin-qiankun-lite`

  Fix the installation command and import example so they reference the
  published scoped package name instead of the original unscoped name.

## 1.4.1

### Patch Changes

- [`e300376`](https://github.com/xunv/vite-plugin-qiankun-lite/commit/e300376ef5867ab3eb7eb6e1e50c08b6e4d1dd44) Thanks [@xunv](https://github.com/xunv)! - Move the dev-only `@vite/client` / `@react-refresh` module-script rewrite from the standalone `qiankun:vite-module-script-transform` plugin (which hijacked `res.end` via `configureServer`) into the `transformIndexHtml` hook.

  The old `res.end` interception did not fire when Vite is used as an API (e.g. integrated into Egg/Koa hosts via `server.transformIndexHtml`) or when the response body was a Buffer, leaving `@vite/client` as a module script. Under the qiankun sandbox, import-html-entry then executed it as a normal script and threw on ESM syntax. Handling it in `transformIndexHtml` shares the same hook path as the entry module-script rewrite, is semantically equivalent, and is a no-op for production builds.

## 1.4.0

### Minor Changes

- [`d8d41dd`](https://github.com/xunv/vite-plugin-qiankun-lite/commit/d8d41dd070a27dacab52a6737405cbe0c977d7c9) Thanks [@xunv](https://github.com/xunv)! - - Added `fixCssLink` option to fix CSS `<link>` relative paths in qiankun environments by dynamically injecting stylesheets with the correct publicPath prefix.
  - Fixed trailing slash in `publicPath` to prevent double-slash paths (e.g. `//assets/xxx.js`) when the qiankun-injected publicPath retains a residual `/` after base removal.
  - Fixed full URL script `src` (e.g. `http://`, `https://`, `//`) being incorrectly prefixed with `publicPath`, which could produce invalid paths like `https://entry.xxx/https://cdn.xxx/xxx.js`.
  - Fixed `ImportSpecifier` being incorrectly replaced in the sandbox identifier transform, which could break import bindings.

## 1.3.0

### Minor Changes

- [#32](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/32) [`cae725e`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/cae725ec363d973d2b3069bbdaa4e3faee43701d) Thanks [@liujiayii](https://github.com/liujiayii)! - feat: Vite7 support

## 1.2.0

### Minor Changes

- [#28](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/28) [`5b97721`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/5b97721e5699075a6dcf7356b43be9cfd0af10b3) Thanks [@kotarella1110](https://github.com/kotarella1110)! - feat: Vite v6 support

## 1.1.2

### Patch Changes

- [#23](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/23) [`49f11e5`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/49f11e55b780a356048bb08f074aab5479aa3269) Thanks [@kotarella1110](https://github.com/kotarella1110)! - fix: fix remain-exports plugin to support vite v4

## 1.1.1

### Patch Changes

- [#18](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/18) [`3481043`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/34810439baff9cc76684effb20a6b6ee860e6bba) Thanks [@kotarella1110](https://github.com/kotarella1110)! - feat: improve sandbox performance

## 1.1.0

### Minor Changes

- [#16](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/16) [`4f119ec`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/4f119ec32653eddcb6e6c2ed1e240206b288d656) Thanks [@kotarella1110](https://github.com/kotarella1110)! - feat: add sandbox option

### Patch Changes

- [#12](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/12) [`23f1742`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/23f1742d15ee46aef0f62d0946a2632e35716e42) Thanks [@kotarella1110](https://github.com/kotarella1110)! - feat: support babel plugin's sourcemap

## 1.0.3

### Patch Changes

- [#9](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/9) [`7f1899d`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/7f1899db730bfc74d55473df8d97d0277502e4b9) Thanks [@kotarella1110](https://github.com/kotarella1110)! - feat: automatically prefix global browser variables

## 1.0.2

### Patch Changes

- [#7](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/7) [`9bcb505`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/9bcb505b8083879b6e7544ba0f1a1b37c92a5233) Thanks [@kotarella1110](https://github.com/kotarella1110)! - feat: enhance sandbox mode

## 1.0.1

### Patch Changes

- [#5](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/5) [`e3feb18`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/e3feb1897ef596bd9c784386477479eb09dbd06d) Thanks [@kotarella1110](https://github.com/kotarella1110)! - fix: fix sandbox mode

## 1.0.0

### Major Changes

- [#1](https://github.com/kotarella1110/vite-plugin-qiankun-lite/pull/1) [`e151295`](https://github.com/kotarella1110/vite-plugin-qiankun-lite/commit/e151295cc9c80e44cf79ac1387f5d17caf3bee1c) Thanks [@kotarella1110](https://github.com/kotarella1110)! - feat: init
