import { Plugin as importToCDN } from "vite-plugin-cdn-import";

// CDN 模块配置接口
interface CDNModule {
  name: string;
  var: string;
  version: string;
  path: string;
  css?: string | string[];
}

// 核心模块（使用 bootcdn）
const coreModules: CDNModule[] = [
  {
    name: "vue",
    var: "Vue",
    version: "3.3.9",
    path: "vue.global.prod.min.js"
  },
  {
    name: "vue-router",
    var: "VueRouter",
    version: "4.2.5",
    path: "vue-router.global.min.js"
  },
  {
    name: "vue-i18n",
    var: "VueI18n",
    version: "9.8.0",
    path: "vue-i18n.global.prod.min.js"
  },
  {
    name: "pinia",
    var: "Pinia",
    version: "2.1.7",
    path: "pinia.iife.prod.min.js"
  }
];

// UI 框架模块
const uiModules: CDNModule[] = [
  {
    name: "element-plus",
    var: "ElementPlus",
    version: "2.4.3",
    path: "index.full.min.js",
    css: "index.min.css"
  }
];

// 工具模块
const utilModules: CDNModule[] = [
  {
    name: "axios",
    var: "axios",
    version: "1.6.2",
    path: "axios.min.js"
  },
  {
    name: "dayjs",
    var: "dayjs",
    version: "1.11.10",
    path: "dayjs.min.js"
  },
  {
    name: "lodash",
    var: "_",
    version: "4.17.21",
    path: "lodash.min.js"
  },
  {
    name: "echarts",
    var: "echarts",
    version: "5.4.3",
    path: "echarts.min.js"
  },
  {
    name: "crypto-js",
    var: "CryptoJS",
    version: "4.2.0",
    path: "crypto-js.min.js"
  },
  {
    name: "nprogress",
    var: "NProgress",
    version: "0.2.0",
    path: "nprogress.min.js",
    css: "nprogress.css"
  }
];

// 特殊处理模块（使用 unpkg）
const specialModules: CDNModule[] = [
  {
    name: "@vueuse/core",
    var: "VueUse",
    version: "10.7.0",
    path: "dist/index.iife.min.js"
  },
  {
    name: "@iconify/vue",
    var: "IconifyVue",
    version: "4.1.1",
    path: "dist/iconify.min.js"
  },
  {
    name: "mitt",
    var: "mitt",
    version: "3.0.1",
    path: "dist/mitt.umd.js"
  },
  {
    name: "sortablejs",
    var: "Sortable",
    version: "1.15.1",
    path: "Sortable.min.js"
  },
  {
    name: "xlsx",
    var: "XLSX",
    version: "0.18.5",
    path: "dist/xlsx.full.min.js"
  },
  {
    name: "qs",
    var: "Qs",
    version: "6.11.2",
    path: "dist/qs.js"
  }
];

// 本地打包模块（不使用 CDN）
export const localModules = [
  "@pureadmin/descriptions",
  "@pureadmin/table",
  "@pureadmin/utils",
  "pinia-plugin-persistedstate",
  "responsive-storage",
  "@element-plus/icons-vue",
  "tippy.js",
  "vue-tippy"
];

// 生成 CDN 配置
export const createCDNConfig = (useCDN = false) => {
  if (!useCDN) return null;

  const bootCDNModules = [...coreModules, ...uiModules, ...utilModules].map(
    m => ({
      ...m,
      path: `https://cdn.bootcdn.net/ajax/libs/${m.name}/${m.version}/${m.path}`,
      css: m.css
        ? Array.isArray(m.css)
          ? m.css.map(
              css =>
                `https://cdn.bootcdn.net/ajax/libs/${m.name}/${m.version}/${css}`
            )
          : `https://cdn.bootcdn.net/ajax/libs/${m.name}/${m.version}/${m.css}`
        : undefined
    })
  );

  const unpkgModules = specialModules.map(m => ({
    ...m,
    path: `https://unpkg.com/${m.name}@${m.version}/${m.path}`,
    css: m.css
      ? Array.isArray(m.css)
        ? m.css.map(css => `https://unpkg.com/${m.name}@${m.version}/${css}`)
        : `https://unpkg.com/${m.name}@${m.version}/${m.css}`
      : undefined
  }));

  return importToCDN({
    modules: [...bootCDNModules, ...unpkgModules]
  });
};

// 导出所有模块配置（用于 external 配置）
export const allModules = [
  ...coreModules,
  ...uiModules,
  ...utilModules,
  ...specialModules
];
