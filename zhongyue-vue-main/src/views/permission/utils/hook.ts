import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { getPermissionsList, updatePermission } from "@/api/system"; // 确保你有这些 API 函数

export function usePermission() {
  const loading = ref(false);
  const roleList = ref([]);

  const permissionColumns = [
    {
      label: "费用管理",
      prop: "expense",
      children: [
        {
          label: "数据权限",
          prop: "data",
          children: [
            { label: "查看全部", prop: "view_all" },
            { label: "查看分公司", prop: "view_by_location" },
            { label: "查看部门", prop: "view_department_submissions" },
            { label: "查看自己提交", prop: "view_own" }
          ]
        },
        {
          label: "操作权限",
          prop: "action",
          children: [
            { label: "创建", prop: "create" },
            { label: "编辑", prop: "edit" },
            { label: "删除", prop: "delete" },
            { label: "审核", prop: "audit" },
            { label: "查看收据", prop: "view_receipt" },
            { label: "取消审核", prop: "cancel_audit" }
          ]
        }
      ]
    },
    {
      label: "客户信息",
      prop: "customer",
      children: [
        {
          label: "数据权限",
          prop: "data",
          children: [
            { label: "查看全部", prop: "view_all" },
            { label: "查看分公司", prop: "view_by_location" },
            { label: "查看部门", prop: "view_department_submissions" },
            { label: "查看自己提交", prop: "view_own" }
          ]
        },
        {
          label: "操作权限",
          prop: "action",
          children: [
            { label: "创建", prop: "create" },
            { label: "编辑", prop: "edit" },
            { label: "删除", prop: "delete" }
          ]
        }
      ]
    },
    {
      label: "合同管理",
      prop: "contract",
      children: [
        {
          label: "数据权限",
          prop: "data",
          children: [
            { label: "查看全部", prop: "view_all" },
            { label: "查看分公司", prop: "view_by_location" },
            { label: "查看部门", prop: "view_department_submissions" },
            { label: "查看自己提交", prop: "view_own" }
          ]
        },
        {
          label: "操作权限",
          prop: "action",
          children: [
            { label: "创建", prop: "create" },
            { label: "编辑", prop: "edit" },
            { label: "删除", prop: "delete" }
          ]
        }
      ]
    }
  ];

  const loadPermissions = async () => {
    loading.value = true;
    try {
      const response = await getPermissionsList();
      if (response.success) {
        roleList.value = response.data.map(item => ({
          name: item.role_name,
          permissions: item.permissions
        }));
      } else {
        throw new Error("Failed to load permissions");
      }
    } catch (error) {
      console.error("Failed to load permissions:", error);
      ElMessage.error("加载权限失败");
    } finally {
      loading.value = false;
    }
  };

  const updatePermissionFunc = async (
    role: string,
    field: string,
    isAllowed: boolean
  ) => {
    try {
      const response = await updatePermission({
        role,
        field,
        isAllowed
      });

      if (response.success) {
        ElMessage.success(`已更新 ${role} 的权限`);
        await loadPermissions(); // 重新加载权限数据
        return true;
      } else {
        throw new Error("更新权限失败");
      }
    } catch (error) {
      console.error("Failed to update permission:", error);
      ElMessage.error("更新权限失败");
      return false;
    }
  };

  const onSearch = () => {
    loadPermissions();
  };

  // 分离费用管理、客户信息和合同管理权限
  const expensePermissions = computed(() =>
    permissionColumns.filter(column => column.prop === "expense")
  );

  const customerPermissions = computed(() =>
    permissionColumns.filter(column => column.prop === "customer")
  );

  const contractPermissions = computed(() =>
    permissionColumns.filter(column => column.prop === "contract")
  );

  return {
    loading,
    roleList,
    expensePermissions,
    customerPermissions,
    contractPermissions,
    loadPermissions,
    updatePermission: updatePermissionFunc,
    onSearch,
    permissionColumns
  };
}
