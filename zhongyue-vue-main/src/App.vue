<template>
  <el-config-provider :locale="zhCn">
    <el-scrollbar class="app-main">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cachePageList" :max="10">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </router-view>
    </el-scrollbar>
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { ElConfigProvider, ElScrollbar } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    [ElScrollbar.name]: ElScrollbar,
    ReDialog
  },
  setup() {
    const route = useRoute();
    return {
      route,
      zhCn,
      cachePageList: computed(() => usePermissionStoreHook().cachePageList)
    };
  }
});
</script>

<style scoped>
.app-main {
  height: 100vh;
}
</style>
