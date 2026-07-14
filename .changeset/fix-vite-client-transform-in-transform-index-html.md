---
'@xunv/vite-plugin-qiankun-lite': patch
---

Move the dev-only `@vite/client` / `@react-refresh` module-script rewrite from the standalone `qiankun:vite-module-script-transform` plugin (which hijacked `res.end` via `configureServer`) into the `transformIndexHtml` hook.

The old `res.end` interception did not fire when Vite is used as an API (e.g. integrated into Egg/Koa hosts via `server.transformIndexHtml`) or when the response body was a Buffer, leaving `@vite/client` as a module script. Under the qiankun sandbox, import-html-entry then executed it as a normal script and threw on ESM syntax. Handling it in `transformIndexHtml` shares the same hook path as the entry module-script rewrite, is semantically equivalent, and is a no-op for production builds.
