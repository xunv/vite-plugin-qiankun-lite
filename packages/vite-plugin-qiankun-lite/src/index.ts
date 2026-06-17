import { transformAsync } from "@babel/core";
import { type Cheerio, type Element, load } from "cheerio";
import type { PluginOption, ResolvedConfig } from "vite";
import plugin from "./babel-plugin-transform-global-variables";

type Options = {
  name: string;
  sandbox?: boolean;
  /**
   * 是否修复 CSS <link> 标签路径。
   *
   * 在 qiankun 微前端环境下，Vite 产出的 HTML 中 <link rel="stylesheet" href="/assets/xxx.css">
   * 的路径是相对于子应用自身的，但子应用被 qiankun 加载时 CSS 路径需要加上 qiankun 注入的
   * publicPath 前缀才能正确加载，否则会 404。
   *
   * 开启后，插件会将相对路径的 <link rel="stylesheet"> 替换为运行时动态注入脚本，
   * 通过 __INJECTED_PUBLIC_PATH_BY_QIANKUN__ 获取前缀，动态创建 <link> 插入 <head>，
   * 与 JS 入口路径的获取方式保持一致。
   *
   * 默认关闭，需要显式设置为 true 开启。
   */
  fixCssLink?: boolean;
};

export default function viteQiankun(opts: Options): PluginOption {
  let config: ResolvedConfig;
  const qiankunWindow = `__QIANKUN_WINDOW__["${opts.name}"]`;
  let publicPath = `(${qiankunWindow}.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || "")`;
  return [
    {
      name: "qiankun:remain-exports",
      enforce: "post",
      apply: "build",
      options(options) {
        return {
          ...options,
          preserveEntrySignatures: "strict",
        };
      },
      transform(code, id) {
        if (id.endsWith("html") && this.getModuleInfo(id)?.isEntry) {
          return code.replace(
            /import\s+(['"])([^'"]+\.(m?js|[jt]sx?))\1/g,
            "export * from $1$2$1",
          );
        }
        return null;
      },
    },
    {
      name: "qiankun:vite-module-script-transform",
      enforce: "post",
      apply: "serve",
      configureServer(server) {
        return () => {
          server.middlewares.use((_, res, next) => {
            if (config.isProduction) return next();

            const end = res.end.bind(res);
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            res.end = (...args: any[]) => {
              let [htmlStr, ...rest] = args;
              if (typeof htmlStr === "string") {
                const $ = load(htmlStr);
                moduleScriptToGeneralScript(
                  $($(`script[src=${config.base}@vite/client]`).get(0)),
                  publicPath,
                );
                const moduleScripts$ = $("script:not([src])[type=module]");
                moduleScripts$.each((_, moduleScript) => {
                  const moduleScript$ = $(moduleScript);
                  if (
                    moduleScript$
                      .text()
                      .includes(`${config.base}@react-refresh`)
                  ) {
                    reactRefreshModuleScriptToGeneralScript(
                      moduleScript$,
                      `${publicPath} + "${config.base}@react-refresh"`,
                    );
                  }
                });
                htmlStr = $.html();
              }
              return end(htmlStr, ...rest);
            };
            next();
          });
        };
      },
    },
    {
      name: "qiankun:support-sandbox",
      enforce: "post",
      async transform(code, id) {
        const [filepath] = id.split("?");
        const jsExts = [/\.[jt]sx?$/, /\.(c|m)?js?$/, /\.vue$/, /\.svelte$/];
        if (!jsExts.some((reg) => reg.test(filepath))) return;

        const baseTransformOptions = {
          root: process.cwd(),
          filename: id,
          sourceFileName: filepath,
          sourceMaps: true,
        };

        if (!opts.sandbox) {
          const qiankunGlobalVariables = [
            "window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__",
            "window.__POWERED_BY_QIANKUN__",
          ];
          if (
            !qiankunGlobalVariables.some((qiankunGlobalVariable) =>
              code.includes(qiankunGlobalVariable),
            )
          )
            return;

          const result = await transformAsync(code, {
            ...baseTransformOptions,
            plugins: [
              [
                plugin,
                {
                  replace: {
                    ...qiankunGlobalVariables.reduce(
                      (acc, qiankunGlobalVariable) => {
                        acc[qiankunGlobalVariable] =
                          qiankunGlobalVariable.replace(
                            "window",
                            qiankunWindow,
                          );
                        return acc;
                      },
                      {} as Record<string, string>,
                    ),
                  },
                },
              ],
            ],
          });

          if (result?.code) {
            return {
              code: result.code,
              map: result.map,
            };
          }

          return;
        }

        if (!/(document|window|globalThis|self)/g.test(code)) return;

        const result = await transformAsync(code, {
          ...baseTransformOptions,
          plugins: [
            [
              plugin,
              {
                replace: {
                  ...Object.keys(config.define ?? []).reduce(
                    (acc, key) => {
                      acc[key] = `${qiankunWindow}.${key}`;
                      return acc;
                    },
                    {} as Record<string, string>,
                  ),
                  window: qiankunWindow,
                },
                addWindowPrefix: true,
              },
            ],
          ],
        });

        if (result?.code) {
          return {
            code: result.code,
            map: result.map,
          };
        }
      },
    },
    {
      name: "qiankun:html-transform",
      enforce: "post",
      configResolved(resolvedConfig) {
        config = resolvedConfig;
        if (config.base) {
          publicPath = `${publicPath}.replace(${new RegExp(
            `${config.base}$`,
          )}, "").replace(/\\/$/, "")`;
        } else {
          publicPath = `${publicPath}.replace(/\\/$/, "")`;
        }
      },
      transformIndexHtml(html: string) {
        const $ = load(html);

        $("head").prepend(`
    <script>
      const nativeGlobal = Function("return this")();
      nativeGlobal.__QIANKUN_WINDOW__ = nativeGlobal.__QIANKUN_WINDOW__ || {};
      nativeGlobal.__QIANKUN_WINDOW__["${opts.name}"] = nativeGlobal.proxy || nativeGlobal;
    </script>
        `);

        const moduleTags = $(
          'body script[src][type=module], head script[src][crossorigin=""]',
        );
        if (!moduleTags || !moduleTags.length) {
          return;
        }
        moduleTags.each(
          (_, moduleTag) =>
            void moduleScriptToGeneralScript($(moduleTag), publicPath),
        );

        const script$ = moduleTags.last();
        script$?.html(`
      window["${opts.name}"] = {};
      const lifecycleNames = ["bootstrap", "mount", "unmount", "update"];
      ${script$.html()}.then((lifecycleHooks) => {
        lifecycleNames.forEach((lifecycleName) =>
          window["${opts.name}"][lifecycleName].resolve(
            lifecycleHooks[lifecycleName],
          ),
        );
      });
      lifecycleNames.forEach((lifecycleName) => {
        let resolve;
        const promise = new Promise((_resolve) => (resolve = _resolve));
        window["${opts.name}"][lifecycleName] = Object.assign(
          (...args) => promise.then((lifecycleHook) => lifecycleHook(...args)),
          { resolve },
        );
      });
    `);

        // 修复 CSS <link> 路径：将相对路径的 <link rel="stylesheet"> 替换为运行时动态注入脚本
        if (opts.fixCssLink) {
          fixCssLinkPath($, publicPath, opts.name);
        }

        return $.html();
      },
    },
  ];
}

function moduleScriptToGeneralScript(
  script$: Cheerio<Element>,
  publicPath: string,
) {
  const scriptSrc = script$.attr("src");
  if (!scriptSrc) return;
  const isFullUrl = /^(https?:)?\/\//.test(scriptSrc);
  script$
    .removeAttr("src")
    .removeAttr("type")
    .html(isFullUrl ? `import("${scriptSrc}")` : `import(${publicPath} + "${scriptSrc}")`);
  return script$;
}

function reactRefreshModuleScriptToGeneralScript(
  script$: Cheerio<Element>,
  reactRefreshImportPath: string,
) {
  script$.removeAttr("type").html(`
      ((window) => {
        import(${reactRefreshImportPath}).then(({ default: RefreshRuntime }) => {
          RefreshRuntime.injectIntoGlobalHook(window);
          window.$RefreshReg$ = () => {};
          window.$RefreshSig$ = () => (type) => type;
          window.__vite_plugin_react_preamble_installed__ = true;
        });
      })(new Function("return this")());
  `);
  return script$;
}

/**
 * 修复 CSS <link> 标签路径问题。
 *
 * 在 qiankun 微前端环境下，HTML 中的 <link rel="stylesheet" href="/assets/xxx.css">
 * 使用的是相对路径，但子应用被 qiankun 加载时需要加上 publicPath 前缀才能正确加载。
 * 此函数将相对路径的 <link> 标签移除，并注入一段运行时脚本，
 * 动态获取 publicPath 前缀后创建 <link> 插入 <head>，与 JS 入口路径处理方式一致。
 * 已是完整 URL（http/https/协议相对路径）的 <link> 不做处理。
 */
function fixCssLinkPath(
  $: ReturnType<typeof load>,
  publicPath: string,
  appName: string,
) {
  // 收集需要处理的相对路径 CSS href
  const cssHrefs: string[] = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    // 只处理相对路径（以 / 开头且非 // 开头，且以 .css 结尾）
    if (/^\/[^/].*\.css$/.test(href)) cssHrefs.push(href);
  });

  if (cssHrefs.length === 0) return;

  // 移除需要处理的 <link> 标签
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href || !/^\/[^/].*\.css$/.test(href)) return;
    $(el).remove();
  });

  // 注入运行时动态创建 <link> 的脚本
  const hrefs = cssHrefs.map((href) => JSON.stringify(href)).join(", ");
  const scriptContent = [
    `;(function() {`,
    `  var base = ${publicPath};`,
    `  var hrefs = [${hrefs}];`,
    `  hrefs.forEach(function(href) {`,
    `    var link = document.createElement('link');`,
    `    link.rel = 'stylesheet';`,
    `    link.crossOrigin = '';`,
    `    link.href = base + href;`,
    `    document.head.appendChild(link);`,
    `  });`,
    `})();`,
  ].join("\n");

  $("head").append(`
    <script>
      ${scriptContent.split("\n").join("\n      ")}
    </script>
  `);
}
