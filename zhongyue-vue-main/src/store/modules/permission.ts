import { defineStore } from "pinia";
import {
  type cacheType,
  store,
  debounce,
  ascending,
  getKeyList,
  filterTree,
  constantMenus,
  filterNoPermissionTree,
  formatFlatteningRoutes
} from "../utils";
import { useMultiTagsStoreHook } from "./multiTags";

export const usePermissionStore = defineStore({
  id: "pure-permission",
  state: () => ({
    // 静态路由生成的菜单
    constantMenus,
    // 整体路由生成的菜单（静态、动态）
    wholeMenus: [],
    // 整体路由（一维数组格式）
    flatteningRoutes: [],
    // 缓存页面keepAlive
    cachePageList: [] as string[],
    // 缓存黑名单
    noCachePageList: [] as string[]
  }),
  actions: {
    /** 组装整体路由生成的菜单 */
    handleWholeMenus(routes: any[]) {
      this.wholeMenus = filterNoPermissionTree(
        filterTree(ascending(this.constantMenus.concat(routes)))
      );
      this.flatteningRoutes = formatFlatteningRoutes(
        this.constantMenus.concat(routes)
      );
    },
    cacheOperate({ mode, name }: cacheType) {
      // 防止重复添加
      if (mode === "add" && !this.cachePageList.includes(name)) {
        this.cachePageList.push(name);
        return;
      }

      // 其他操作保持不变
      const delIndex = this.cachePageList.findIndex(v => v === name);
      switch (mode) {
        case "refresh":
          this.cachePageList = this.cachePageList.filter(v => v !== name);
          break;
        case "delete":
          delIndex !== -1 && this.cachePageList.splice(delIndex, 1);
          break;
      }
      /** 监听缓存页面是否存在于标签页，不存在则删除 */
      debounce(() => {
        let cacheLength = this.cachePageList.length;
        const nameList = getKeyList(useMultiTagsStoreHook().multiTags, "name");
        while (cacheLength > 0) {
          nameList.findIndex(v => v === this.cachePageList[cacheLength - 1]) ===
            -1 &&
            this.cachePageList.splice(
              this.cachePageList.indexOf(this.cachePageList[cacheLength - 1]),
              1
            );
          cacheLength--;
        }
      })();
    },
    /** 清空缓存页面 */
    clearAllCachePage() {
      this.wholeMenus = [];
      this.cachePageList = [];
    },
    // 添加缓存页面
    async addCachePage(name: string) {
      if (!this.cachePageList.includes(name)) {
        this.cachePageList.push(name);
      }
    },
    // 移除缓存页面
    async removeCachePage(name: string) {
      const index = this.cachePageList.indexOf(name);
      if (index > -1) {
        this.cachePageList.splice(index, 1);
      }
    }
  }
});

export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
