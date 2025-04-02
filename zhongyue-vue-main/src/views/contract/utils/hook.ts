import { ref, reactive, onMounted, h } from "vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import editForm from "../form.vue";
import type { FormItemProps, TableColumnList, TagType } from "./types";
import { deviceDetection } from "@pureadmin/utils";
import {
  getContractList,
  createContract,
  updateContract,
  deleteContract
} from "@/api/contract";

export function useContract() {
  // 搜索表单数据
  const searchForm = reactive({
    contract_no: "",
    customer_name: "",
    business_type: "",
    status: "",
    submitter: "",
    start_date: "",
    end_date: ""
  });

  // 表格相关数据
  const dataList = ref([]);
  const loading = ref(true);
  const selectedList = ref([]);

  // 分页配置
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  // 表格列配置
  const columns: TableColumnList = [
    {
      label: "合同编号",
      prop: "contract_no",
      minWidth: 140,
      align: "center",
      headerAlign: "center"
    },
    {
      label: "客户名称",
      prop: "customer_name",
      minWidth: 180,
      align: "center",
      headerAlign: "center"
    },
    {
      label: "业务类型",
      prop: "business_type",
      minWidth: 120,
      align: "center",
      headerAlign: "center"
    },
    {
      label: "合同金额",
      prop: "amount",
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      formatter: row => {
        return `¥ ${Number(row.amount).toFixed(2)}`;
      }
    },
    {
      label: "合同文件",
      prop: "contract_files",
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      slot: true
    },
    {
      label: "提交人",
      prop: "submitter",
      minWidth: 100,
      align: "center",
      headerAlign: "center"
    },
    {
      label: "签订日期",
      prop: "sign_date",
      minWidth: 120,
      align: "center",
      headerAlign: "center"
    },
    {
      label: "开始日期",
      prop: "start_date",
      minWidth: 120,
      align: "center",
      headerAlign: "center"
    },
    {
      label: "到期日期",
      prop: "expire_date",
      minWidth: 120,
      align: "center",
      headerAlign: "center"
    },
    {
      label: "合同状态",
      prop: "status",
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      slot: "contract_status"
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      formatter: row => {
        return row.remark || "-";
      }
    },
    {
      label: "操作",
      prop: "operation",
      fixed: "right",
      minWidth: 180,
      align: "center",
      headerAlign: "center",
      slot: "operation"
    }
  ];

  // 添加权限控制状态
  const permissions = reactive({
    action: {
      create: false,
      edit: false,
      delete: false
    },
    data: {
      view_all: false,
      view_own: false,
      view_by_location: false,
      view_department_submissions: false
    }
  });

  // 搜索方法
  const onSearch = async () => {
    loading.value = true;
    try {
      const params = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        contract_no: searchForm.contract_no,
        customer_name: searchForm.customer_name,
        business_type: searchForm.business_type,
        status: searchForm.status,
        submitter: searchForm.submitter,
        start_date: searchForm.start_date,
        end_date: searchForm.end_date
      };

      const data = await getContractList(params);

      if (data?.success) {
        // 更新表格数据
        dataList.value = data.data?.list || [];
        // 更新分页信息
        pagination.total = data.data?.total || 0;
        pagination.pageSize = data.data?.pageSize || 10;
        pagination.currentPage = data.data?.currentPage || 1;

        // 更新权限信息
        if (data.data?.permissions) {
          permissions.action = data.data.permissions.action;
          permissions.data = data.data.permissions.data;
        }
      } else {
        message("获取数据失败", { type: "error" });
      }
    } catch (error) {
      console.error("获取合同列表失败:", error);
      message("获取合同列表失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  };

  // 重置搜索表单
  const resetForm = () => {
    Object.keys(searchForm).forEach(key => {
      searchForm[key] = "";
    });
    pagination.currentPage = 1;
    onSearch();
  };

  // 打开编辑对话框
  const openDialog = (title = "新增", row?: FormItemProps) => {
    // 创建一个引用来存储表单组件实例
    let formRef = null;

    addDialog({
      title: `${title}合同`,
      props: {
        formInline: row
          ? { ...row }
          : {
              contract_no: "", // 合同编号
              business_type: "代理记账合同", // 业务类型
              customer_name: "", // 客户名称
              customer_code: "", // 客户统一社会信用代码
              customer_address: "", // 客户地址
              customer_phone: "", // 客户电话
              customer_contact: "", // 客户联系人
              company_name: "", // 公司名称
              company_code: "", // 公司统一社会信用代码
              company_address: "", // 公司地址
              company_phone: "", // 公司电话
              business_person: "", // 业务人员
              amount: null, // 合同金额
              sign_date: "", // 签订日期
              start_date: "", // 开始日期
              expire_date: "", // 到期日期
              status: "未签署", // 合同状态
              remark: "", // 备注
              contract_files: [] // 合同文件
            }
      },
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, {
          ref: el => {
            // 保存表单引用
            formRef = el;
          }
        }),
      beforeSure: async done => {
        try {
          if (!formRef) {
            throw new Error("表单引用获取失败");
          }

          // 调用表单验证并获取表单数据
          const formData = await formRef.validate();
          if (!formData) {
            return; // 如果验证失败，直接返回
          }

          // 构造提交数据
          const submitData = {
            ...formData,
            amount: Number(formData.amount || 0),
            contract_files: formData.contract_files || []
          };

          if (title === "新增") {
            await createContract(submitData);
            message(`新增成功`, { type: "success" });
          } else {
            await updateContract(submitData.id, submitData);
            message(`编辑成功`, { type: "success" });
          }

          done(); // 关闭loading
          onSearch(); // 刷新表格数据
        } catch (error) {
          console.error("表单提交错误:", error);
          message(`${title}失败: ${error.message || "未知错误"}`, {
            type: "error"
          });
        }
      }
    });
  };

  // 删除合同
  const handleDelete = async (row: FormItemProps) => {
    try {
      await deleteContract(row.id);
      message(`删除成功`, { type: "success" });
      onSearch();
    } catch (error) {
      message(`删除失败`, { type: "error" });
    }
  };

  // 分页相关方法
  const handleSizeChange = (val: number) => {
    pagination.pageSize = val;
    onSearch();
  };

  const handleCurrentChange = (val: number) => {
    pagination.currentPage = val;
    onSearch();
  };

  const handleSelectionChange = val => {
    selectedList.value = val;
  };

  // 状态过滤处理
  const handleStatusFilter = (status: string) => {
    searchForm.status = status;
    onSearch();
  };

  // 获取状态对应的样式类型
  const getStatusType = (status: string): TagType => {
    switch (status) {
      case "未签署":
        return "warning";
      case "生效中":
        return "success";
      case "已过期":
        return "danger";
      case "已作废":
        return "info";
      default:
        return "info";
    }
  };

  // 签署合同
  const handleSign = async () => {
    try {
      // TODO: 调用签署接口
      message("合同签署成功", { type: "success" });
      onSearch(); // 刷新列表
    } catch (error) {
      console.error("合同签署失败:", error);
      message("合同签署失败", { type: "error" });
    }
  };

  // 初始化
  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    columns,
    dataList,
    searchForm,
    pagination,
    selectedList,
    getStatusType,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleStatusFilter,
    handleSign,
    permissions
  };
}
