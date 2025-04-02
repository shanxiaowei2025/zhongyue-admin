import "./reset.css";
import dayjs from "dayjs";
import roleForm from "../form/role.vue";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps, RoleFormItemProps } from "../utils/types";
import {
  getKeyList,
  isAllEmpty,
  hideTextAtIndex,
  deviceDetection
} from "@pureadmin/utils";
import {
  getRoleIds,
  // getDeptList,
  getUserList,
  getAllRoleList,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  updateUserRoles,
  getDeptList
} from "@/api/system";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox,
  ElLoading
} from "element-plus";
import {
  type Ref,
  h,
  ref,
  toRaw,
  watch,
  computed,
  reactive,
  onMounted
} from "vue";
import { getUploadUrl } from "@/api/upload";

// 添加一个工具函数来获取完整的图片URL
const getFullImageUrl = (path: string) => {
  if (!path) return "avatars/logo.png";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_MINIO_DOMAIN}/${import.meta.env.VITE_MINIO_BUCKET}/${path}`;
};

export function useUser(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    // 左侧部门树的id
    deptId: "",
    username: "",
    phone: "",
    status: null
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const higherDeptOptions = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户编号",
      prop: "id",
      width: 90
    },
    {
      label: "用户头像",
      prop: "avatar",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={getFullImageUrl(row.avatar)}
          preview-src-list={Array.of(getFullImageUrl(row.avatar))}
          class="w-[24px] h-[24px] rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickname",
      minWidth: 130
    },
    {
      label: "性别",
      prop: "sex",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.sex === 1 ? "danger" : null}
          effect="plain"
        >
          {row.sex === 1 ? "女" : "男"}
        </el-tag>
      )
    },
    {
      label: "部门",
      prop: "dept.name",
      minWidth: 90
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          modelValue={scope.row.status}
          onUpdate:modelValue={value => onChange(scope.row, value)}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
        />
      )
    },
    {
      label: "所属角色",
      prop: "roles",
      minWidth: 200,
      cellRenderer: ({ row }) => (
        <div class="flex flex-wrap gap-1">
          {row.roles.map(role => (
            <el-tag
              key={role}
              type="success"
              effect="light"
              size="small"
              class="mr-1 mb-1 rounded-full px-3"
              style="font-weight: 500; border-radius: 12px;"
            >
              {role}
            </el-tag>
          ))}
        </div>
      )
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });
  // 重置的新���码
  const pwdForm = reactive({
    newPwd: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);

  async function onChange(row, newValue) {
    const newStatus = newValue;

    try {
      await ElMessageBox.confirm(
        `确认要<strong>${
          newStatus === 0 ? "停用" : "启用"
        }</strong><strong style='color:var(--el-color-primary)'>${
          row.username
        }</strong>用户吗?`,
        "系统提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      );

      const res = await updateUser({ id: row.id, status: newStatus });
      if (res.success) {
        row.status = newStatus;
        message(`已成功${newStatus === 0 ? "停用" : "启用"}用户`, {
          type: "success"
        });
      } else {
        throw new Error("更新用户状态失败");
      }
    } catch (error) {
      console.error("更新用户状态时出错:", error);
      message("更新用��状态失败", { type: "error" });
      row.status = row.status === 1 ? 0 : 1; // 恢复原状态
    }
  }

  function handleUpdate(row) {
    console.log(row);
  }

  async function handleDelete(row) {
    await deleteUser({ id: row.id });
    message(`您删除了用户编号为${row.user_id}的这条数据`, { type: "success" });
    onSearch();
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getUserList(toRaw(form));
    dataList.value = data.list;
    pagination.total = data.total;
    pagination.pageSize = data.pageSize;
    pagination.currentPage = data.currentPage;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.deptId = "";
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ id, selected }) {
    form.deptId = selected ? id : "";
    onSearch();
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          id: row?.id ?? "",
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          parentId: row?.dept?.id ?? 0,
          nickname: row?.nickname ?? "",
          username: row?.username ?? "",
          password: row?.password ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          sex: row?.sex ?? 0,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        async function chores() {
          message(`您${title}了用户名称为${curData.username}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              // 调用新增接口
              await createUser(curData);
              chores();
            } else {
              // 调用修改接口
              await updateUser(curData);
              chores();
            }
          }
        });
      }
    });
  }

  const cropRef = ref();
  /** 上传头像 */
  async function handleUpload(row) {
    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: getFullImageUrl(row.avatar),
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: async done => {
        try {
          // 显示loading
          const loading = ElLoading.service({
            lock: true,
            text: "头像上传中...",
            background: "rgba(0, 0, 0, 0.7)"
          });

          // 1. 获取裁剪后的图片 blob
          const blob = await fetch(avatarInfo.value.base64).then(r => r.blob());
          const timestamp = dayjs().format("YYYYMMDDHHmmss");
          const displayName = row.nickname || row.username;
          const file = new File([blob], `${displayName}-${timestamp}.png`, {
            type: "image/png"
          });

          // 2. 获取预签名URL
          const uploadRes = await getUploadUrl({
            filename: file.name,
            content_type: file.type,
            subdirectory: "avatars"
          });

          if (!uploadRes.success) {
            throw new Error("获取上传URL失败");
          }

          // 3. 使用预签名URL上传文件
          await fetch(uploadRes.data.url, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type
            }
          });

          // 4. 更新用户头像信息
          await updateUser({
            id: row.id,
            avatar: uploadRes.data.path
          });

          // 关闭loading
          loading.close();
          message("头像上传成功", { type: "success" });
          row.avatar = uploadRes.data.path;
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        } catch (error) {
          // 确保loading被关闭
          ElLoading.service().close();
          console.error("上传头像时发生错误:", error);
          message("上传头像时发生错误", { type: "error" });
        }
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.username} 用户的密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "请输入新密�����",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
          </ElForm>
          <div class="mt-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(async valid => {
          if (valid) {
            try {
              const res = await resetUserPassword({
                id: row.id,
                newPwd: pwdForm.newPwd
              });
              if (res.success) {
                message(`已成功重置 ${row.username} 用户的密码`, {
                  type: "success"
                });
                done(); // 关闭弹框
                onSearch(); // 刷新表格数据
              } else {
                message(`重置密码失败: `, {
                  type: "error"
                });
              }
            } catch (error) {
              console.error("重置密码时发生错误:", error);
              message("重置密码时发生错误", { type: "error" });
            }
          }
        });
      }
    });
  }

  /** 分配角色 */
  async function handleRole(row) {
    // 选中的角色列表
    const ids = (await getRoleIds({ userId: row.id })).data ?? [];
    addDialog({
      title: `分配 ${row.username} 用户的角色`,
      props: {
        formInline: {
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: roleOptions.value ?? [],
          ids
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: async (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        try {
          const response = await updateUserRoles({
            userId: row.id,
            ids: curData.ids
          });
          if (response.success) {
            message("角色分配成功", { type: "success" });
            done(); // 关闭弹框
            onSearch(); // 刷新用户列表
          } else {
            message("角色分配失败", { type: "error" });
          }
        } catch (error) {
          console.error("Error updating user roles:", error);
          message("角色分配时发生错误", { type: "error" });
        }
      }
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    onSearch();

    // 归属部门
    const { data } = await getDeptList();
    higherDeptOptions.value = handleTree(data);
    treeData.value = handleTree(data);
    treeLoading.value = false;

    // 角色列表
    const response = await getAllRoleList();
    if (response.success) {
      roleOptions.value = response.data;
    } else {
      console.error("Failed to fetch role list");
    }
  });

  return {
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleRole,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
