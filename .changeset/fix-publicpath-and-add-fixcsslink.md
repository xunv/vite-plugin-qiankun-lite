---
"vite-plugin-qiankun-lite": minor
---

- Added `fixCssLink` option to fix CSS `<link>` relative paths in qiankun environments by dynamically injecting stylesheets with the correct publicPath prefix.
- Fixed trailing slash in `publicPath` to prevent double-slash paths (e.g. `//assets/xxx.js`) when the qiankun-injected publicPath retains a residual `/` after base removal.
- Fixed full URL script `src` (e.g. `http://`, `https://`, `//`) being incorrectly prefixed with `publicPath`, which could produce invalid paths like `https://entry.xxx/https://cdn.xxx/xxx.js`.
- Fixed `ImportSpecifier` being incorrectly replaced in the sandbox identifier transform, which could break import bindings.
