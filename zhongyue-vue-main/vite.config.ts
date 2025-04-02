import { loadEnv } from "vite";
import { createCDNConfig, allModules, localModules } from "./build/cdn";
import { getPluginsList } from "./build/plugins";
import { include, exclude } from "./build/optimize";
import { root, alias, wrapperEnv, __APP_INFO__ } from "./build/utils";

export default ({ mode }) => {
  const { VITE_CDN, VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH } =
    wrapperEnv(loadEnv(mode, root));

  const useCDN = VITE_CDN ? String(VITE_CDN).toLowerCase() === "true" : false;

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias
    },
    server: {
      port: VITE_PORT,
      host: "0.0.0.0",
      proxy: {},
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      }
    },
    plugins: [
      ...getPluginsList(VITE_CDN, VITE_COMPRESSION),
      createCDNConfig(useCDN)
    ].filter(Boolean),
    optimizeDeps: {
      include,
      exclude
    },
    build: {
      target: "es2015",
      sourcemap: false,
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        external: (id: string) => {
          if (!useCDN) return false;

          // 排除本地模块
          if (localModules.some(m => id.startsWith(m))) {
            return false;
          }

          // 处理其他模块
          return allModules.some(
            m => id === m.name || id.startsWith(`${m.name}/`)
          );
        },
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          manualChunks: useCDN
            ? {
                // 当使用 CDN 时，不包含已经被标记为外部模块的包
                "ui-vendor": ["tippy.js", "vue-tippy"]
              }
            : {
                // 不使用 CDN 时的完整配置
                "vue-vendor": ["vue", "vue-router", "pinia", "vue-i18n"],
                "element-plus": ["element-plus", "@element-plus/icons-vue"],
                "ui-vendor": ["tippy.js", "vue-tippy"]
              },
          globals: Object.fromEntries(allModules.map(m => [m.name, m.var]))
        }
      }
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  };
};
