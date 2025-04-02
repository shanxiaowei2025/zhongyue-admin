<script setup lang="ts">
import { usePermission } from "./utils/hook";
import { ref, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { ElTable, ElTableColumn, ElSwitch, ElMessageBox } from "element-plus";

defineOptions({
  name: "PermissionPage"
});

const {
  loading,
  roleList,
  expensePermissions,
  customerPermissions,
  contractPermissions,
  loadPermissions,
  updatePermission,
  onSearch,
  permissionColumns
} = usePermission();

onMounted(() => {
  loadPermissions();
});

const getPermissionLabel = (module, type, permission) => {
  const moduleObj = permissionColumns.find(m => m.prop === module);
  if (moduleObj) {
    const typeObj = moduleObj.children.find(t => t.prop === type);
    if (typeObj) {
      const permissionObj = typeObj.children.find(p => p.prop === permission);
      if (permissionObj) {
        return `${moduleObj.label}/${typeObj.label}/${permissionObj.label}`;
      }
    }
  }
  return `${module}/${type}/${permission}`;
};

const handlePermissionChange = async (
  role,
  module,
  type,
  permission,
  newValue
) => {
  const field = `${module}_${type}_${permission}`;
  const permissionLabel = getPermissionLabel(module, type, permission);
  const [moduleLabel, typeLabel, permissionName] = permissionLabel.split("/");
  const roleData = roleList.value.find(r => r.name === role);
  if (roleData) {
    try {
      await ElMessageBox.confirm(
        `确定要<span style="color: red; font-weight: bold;">${newValue ? "启用" : "禁用"}</span>
        ${role}的以下权限吗？<br>
        <span style="color: red; font-weight: bold;">
          ${moduleLabel} &gt; ${typeLabel} &gt; ${permissionName}
        </span>`,
        "确认操作",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true
        }
      );
      const success = await updatePermission(role, field, newValue);
      if (!success) {
        // 如果更新失败，我们需要手动将开关状态切换回去
        roleData.permissions[module][type][permission] = !newValue;
      }
    } catch (error) {
      // 用户取消操作，将开关状态切换回去
      roleData.permissions[module][type][permission] = !newValue;
    }
  }
};
</script>

<template>
  <div class="main-content">
    <PureTableBar title="权限管理" @refresh="onSearch">
      <div class="permission-container">
        <!-- 费用管理权限表格 -->
        <div class="permission-section">
          <h2 class="section-title">费用管理权限</h2>
          <div class="permission-table">
            <el-table
              v-loading="loading"
              :data="roleList"
              border
              style="width: 100%"
              :header-cell-style="{
                background: '#f5f7fa',
                color: '#606266',
                whiteSpace: 'nowrap'
              }"
            >
              <el-table-column
                prop="name"
                label="角色名称"
                width="120"
                fixed="left"
              />
              <template
                v-for="module in expensePermissions"
                :key="module.label"
              >
                <el-table-column :label="module.label" align="center">
                  <template v-for="type in module.children" :key="type.label">
                    <el-table-column :label="type.label" align="center">
                      <template
                        v-for="permission in type.children"
                        :key="permission.prop"
                      >
                        <el-table-column
                          :label="permission.label"
                          align="center"
                          width="120"
                        >
                          <template #default="{ row }">
                            <el-switch
                              v-model="
                                row.permissions[module.prop][type.prop][
                                  permission.prop
                                ]
                              "
                              @change="
                                newValue =>
                                  handlePermissionChange(
                                    row.name,
                                    module.prop,
                                    type.prop,
                                    permission.prop,
                                    newValue
                                  )
                              "
                            />
                          </template>
                        </el-table-column>
                      </template>
                    </el-table-column>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </div>
        </div>

        <!-- 客户信息权限表格 -->
        <div class="permission-section">
          <h2 class="section-title">客户信息权限</h2>
          <div class="permission-table">
            <el-table
              v-loading="loading"
              :data="roleList"
              border
              style="width: 100%"
              :header-cell-style="{
                background: '#f5f7fa',
                color: '#606266',
                whiteSpace: 'nowrap'
              }"
            >
              <el-table-column
                prop="name"
                label="角色名称"
                width="120"
                fixed="left"
              />
              <template
                v-for="module in customerPermissions"
                :key="module.label"
              >
                <el-table-column :label="module.label" align="center">
                  <template v-for="type in module.children" :key="type.label">
                    <el-table-column :label="type.label" align="center">
                      <template
                        v-for="permission in type.children"
                        :key="permission.prop"
                      >
                        <el-table-column
                          :label="permission.label"
                          align="center"
                          width="120"
                        >
                          <template #default="{ row }">
                            <el-switch
                              v-model="
                                row.permissions[module.prop][type.prop][
                                  permission.prop
                                ]
                              "
                              @change="
                                newValue =>
                                  handlePermissionChange(
                                    row.name,
                                    module.prop,
                                    type.prop,
                                    permission.prop,
                                    newValue
                                  )
                              "
                            />
                          </template>
                        </el-table-column>
                      </template>
                    </el-table-column>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </div>
        </div>

        <!-- 合同管理权限表格 -->
        <div class="permission-section">
          <h2 class="section-title">合同管理权限</h2>
          <div class="permission-table">
            <el-table
              v-loading="loading"
              :data="roleList"
              border
              style="width: 100%"
              :header-cell-style="{
                background: '#f5f7fa',
                color: '#606266',
                whiteSpace: 'nowrap'
              }"
            >
              <el-table-column
                prop="name"
                label="角色名称"
                width="120"
                fixed="left"
              />
              <template
                v-for="module in contractPermissions"
                :key="module.label"
              >
                <el-table-column :label="module.label" align="center">
                  <template v-for="type in module.children" :key="type.label">
                    <el-table-column :label="type.label" align="center">
                      <template
                        v-for="permission in type.children"
                        :key="permission.prop"
                      >
                        <el-table-column
                          :label="permission.label"
                          align="center"
                          width="120"
                        >
                          <template #default="{ row }">
                            <el-switch
                              v-model="
                                row.permissions[module.prop][type.prop][
                                  permission.prop
                                ]
                              "
                              @change="
                                newValue =>
                                  handlePermissionChange(
                                    row.name,
                                    module.prop,
                                    type.prop,
                                    permission.prop,
                                    newValue
                                  )
                              "
                            />
                          </template>
                        </el-table-column>
                      </template>
                    </el-table-column>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </div>
        </div>
      </div>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
.main-content {
  height: 100%;
  padding: 16px;
  overflow: hidden;
  background: var(--el-bg-color);

  :deep(.pure-table-bar) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.permission-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.permission-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 16px 0;
    color: var(--el-text-color-primary);
  }

  .permission-table {
    background: var(--el-bg-color);
    border-radius: 4px;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
}
</style>
