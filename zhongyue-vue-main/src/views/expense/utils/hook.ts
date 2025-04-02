import { ref, reactive, onMounted, computed } from "vue";
import { message } from "@/utils/message";
import {
  getExpenseList,
  createExpense,
  updateExpense,
  deleteExpense,
  auditExpense,
  cancelAuditExpense,
  exportExpenses,
  getAutocompleteOptions
} from "@/api/expense";
import { addDialog } from "@/components/ReDialog";
import editForm from "../form.vue";
import { h } from "vue";
import type { FormItemProps } from "../types";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { deviceDetection } from "@pureadmin/utils";

/**
 * 搜索表单接口
 * @property companyName - 公司名称
 * @property status - 费用状态（null 表示全部）
 * @property submitter - 提交人
 * @property chargeDate - 收费日期范围
 */
interface SearchForm {
  company_name: string;
  status: number | null;
  submitter: string;
  charge_date: string[] | null;
}

/**
 * API 请求参数接口
 * 继承自 SearchForm，但将 chargeDate 拆分为起始和结束日期
 * 添加了分页相关
 * @property chargeDateStart - 收费开始日期
 * @property chargeDateEnd - 收费结束日期
 * @property page - 当前码
 * @property page_size - 每页显示的记录数
 */
interface Params {
  page: number;
  page_size: number;
  companyName?: string;
  status?: number | null;
  submitter?: string;
  chargeDateStart?: string;
  chargeDateEnd?: string;
  [key: string]: any; // 添加这一行以支持动态字段
}

/**
 * 盖章单位选项
 * 用于在收据上选择盖章单位
 */
const stampUnitOptions = [
  { value: "中岳", label: "中岳" },
  { value: "雄安", label: "雄安" },
  { value: "高碑店", label: "高碑店" },
  { value: "脉信", label: "脉信" },
  { value: "金盾", label: "金盾" },
  { value: "如你心意", label: "如你心意" }
];

type AutoCompleteFunction = (
  queryString: string,
  callback: (results: any[]) => void
) => void;

interface AutoCompleteOptions {
  [key: string]: AutoCompleteFunction;
}

// 定义权限接口，与后端格式保持一致
interface Permissions {
  data: {
    view_all: boolean;
    view_by_location: boolean;
    view_department_submissions: boolean;
    view_own: boolean;
  };
  action: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    audit: boolean;
    view_receipt: boolean;
    cancel_audit: boolean;
  };
}

// 在 interface 定义区域添加
interface CompanyOption {
  value: string;
  label: string;
}

// 新增 Upload 组件所需的方法
const useExpenseUpload = formData => {
  // 获取上传目录
  const getUploadDirectory = (): string => {
    return formData.value?.company_name?.trim()
      ? `expense/${formData.value.company_name.trim()}`
      : "expense/default";
  };

  // 上传前验证
  const handleBeforeUpload = async (file?: File): Promise<boolean> => {
    if (!formData.value?.company_name) {
      ElMessage.warning("请先填写企业名称");
      return false;
    }

    if (!file) return true;

    // 验证文件类型
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      ElMessage.error("只能上传图片文件！");
      return false;
    }

    // 验证文件大小
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      ElMessage.error("图片大小不能超过 5MB！");
      return false;
    }

    return true;
  };

  return {
    getUploadDirectory,
    handleBeforeUpload
  };
};
export { useExpenseUpload };
export function useExpense() {
  // 修改 searchForm 的字段名
  const searchForm = reactive<SearchForm>({
    company_name: "",
    status: null,
    submitter: "",
    charge_date: null
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const selectedStampUnit = ref("中岳");

  const companyOptions = ref<CompanyOption[]>([]);
  const loadingCompanyOptions = ref(false);

  const remoteMethod = async (query: string) => {
    if (query !== "") {
      loadingCompanyOptions.value = true;
      try {
        const response = await getAutocompleteOptions("company_name", query);
        if (response.success && response.data) {
          companyOptions.value = response.data.map(item => ({
            value: item,
            label: item
          }));
        } else {
          companyOptions.value = [];
        }
      } catch (error) {
        console.error("Failed to fetch company options:", error);
        companyOptions.value = [];
      } finally {
        loadingCompanyOptions.value = false;
      }
    } else {
      companyOptions.value = [];
    }
  };

  onMounted(() => {
    onSearch(); // 确保在组件挂载时获取数据列表
  });

  /**
   * 重置搜索表单
   * 将所有字段重置为初始值，并触发搜索
   */
  function resetSearchForm() {
    Object.keys(searchForm).forEach(key => {
      searchForm[key] =
        key === "status" ? null : key === "chargeDate" ? null : "";
    });
    onSearch();
  }

  /**
   * 执行搜索
   * 根据搜索表单的值获取费用列表
   */
  async function onSearch() {
    loading.value = true;
    const params: Params = {
      page: currentPage.value,
      page_size: pageSize.value
    };

    // 处理所有搜索字段
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (
          key === "chargeDate" &&
          Array.isArray(value) &&
          value.length === 2
        ) {
          params.chargeDateStart = value[0];
          params.chargeDateEnd = value[1];
        } else {
          params[key] = value;
        }
      }
    });

    try {
      const response = await getExpenseList(params);
      if (response.success && response.data) {
        dataList.value = response.data.list;
        total.value = response.data.total;
        currentPage.value = response.data.currentPage;
        pageSize.value = response.data.pageSize;
        userPermissions.value = response.data.permissions; // 添加这行来更新用户权限
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("Failed to fetch expense list:", error);
      ElMessage.error("获取费用列表失败，请稍后重试");
    } finally {
      loading.value = false;
    }
  }

  function handlePageChange(page: number) {
    currentPage.value = page;
    onSearch();
  }

  function handleSizeChange(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    onSearch();
  }

  const formatMoney = (value: number | string) => {
    if (value === null || value === undefined) return "¥0.00";
    const num = parseFloat(value as string);
    return `¥${num.toFixed(2)}`;
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // 返回 YYYY-MM-DD 格式
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}费用`,
      props: {
        formInline: row ? { ...row } : {} // 直接使用原始数据，只做浅拷贝
      },
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async done => {
        const valid = await formRef.value.submitForm();
        if (valid) {
          try {
            const curData = formRef.value.getFormData();
            const formDataToSend = new FormData();

            Object.entries(curData).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                formDataToSend.append(key, JSON.stringify(value));
              } else {
                formDataToSend.append(key, String(value ?? ""));
              }
            });

            if (title === "新增") {
              await createExpense(formDataToSend);
            } else {
              await updateExpense(formDataToSend);
            }
            done();
            ElMessage.success(`${title}成功`);
            onSearch();
          } catch (error) {
            console.error(`${title}失败:`, error);
            ElMessage.error(`${title}失败: ${error.message || "未知错误"}`);
          }
        }
      }
    });
  }

  async function handleDelete(row) {
    await deleteExpense({ id: row.id });
    message(`您删除了企业名称为${row.companyName}的这条数据`, {
      type: "success"
    });
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  // 修改权限状态的初始值，确保与接口定义一致
  const userPermissions = ref<Permissions>({
    data: {
      view_all: false,
      view_by_location: false,
      view_department_submissions: false,
      view_own: false
    },
    action: {
      create: false,
      edit: false,
      delete: false,
      audit: false,
      view_receipt: false,
      cancel_audit: false
    }
  });

  const fetchExpenseList = async () => {
    loading.value = true;
    try {
      const params = {
        page: currentPage.value,
        page_size: pageSize.value,
        company_name: searchForm.company_name,
        status: searchForm.status,
        submitter: searchForm.submitter,
        charge_date_start: searchForm.charge_date
          ? searchForm.charge_date[0]
          : null,
        charge_date_end: searchForm.charge_date
          ? searchForm.charge_date[1]
          : null
      };
      const response = await getExpenseList(params);
      if (response.success && response.data) {
        dataList.value = response.data.list;
        total.value = response.data.total;
        currentPage.value = response.data.currentPage;
        pageSize.value = response.data.pageSize;
        // 确保权限数据格式正确
        if (response.data.permissions) {
          userPermissions.value = response.data.permissions;
        }
      } else {
        console.error(
          "Failed to fetch expense list: Unexpected response structure"
        );
      }
    } catch (error) {
      console.error("Failed to fetch expense list:", error);
    } finally {
      loading.value = false;
    }
  };

  const dialogVisible = ref(false);
  const auditStatus = ref(0);
  const rejectReason = ref("");
  const currentRow = ref(null);

  const showAuditDialog = row => {
    currentRow.value = row;
    dialogVisible.value = true;
    auditStatus.value = 0;
    rejectReason.value = "";
  };

  const handleAudit = async () => {
    if (auditStatus.value === 0) {
      ElMessage.warning("请选审核结果");
      return;
    }

    if (auditStatus.value === 2 && !rejectReason.value.trim()) {
      ElMessage.warning("请输入拒绝因");
      return;
    }

    try {
      const response = await auditExpense({
        id: currentRow.value.id,
        status: auditStatus.value,
        reject_reason: rejectReason.value
      });

      if (response.success) {
        ElMessage.success(
          auditStatus.value === 1 ? "审核通过成功" : "审核拒绝成功"
        );
        dialogVisible.value = false;
        fetchExpenseList();
      } else {
        ElMessage.error("审核失败");
      }
    } catch (error) {
      console.error("审核操作发生错误:", error);
      ElMessage.error("审核操作失败");
    }
  };

  const cancelAudit = () => {
    dialogVisible.value = false;
    auditStatus.value = 0;
    rejectReason.value = "";
  };

  const showRejectReason = row => {
    if (row.status === 2 && row.reject_reason) {
      ElMessageBox.alert(row.reject_reason, "拒绝原因", {
        confirmButtonText: "确定",
        customClass: "reject-reason-dialog"
      });
    } else {
      ElMessage.info("没有拒绝原因");
    }
  };

  const handleCancelAudit = async (id: any) => {
    try {
      await ElMessageBox.confirm("确定要取消审核吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });
      const res = await cancelAuditExpense({ id: id });
      if (res.success) {
        ElMessage.success("取消审核成功");
        await fetchExpenseList();
      } else {
        ElMessage.error("取消审核失败");
      }
    } catch (error) {
      if (error !== "cancel") {
        console.error("取消审核出错:", error);
        ElMessage.error("取消审核出错");
      }
    }
  };

  const receiptDialogVisible = ref(false);
  const currentReceipt = ref(null);

  const viewReceipt = row => {
    currentReceipt.value = row;
    receiptDialogVisible.value = true;
  };

  const generateGroupedExpenseDetails = computed(() => {
    if (!currentReceipt.value) return {};

    const filterNullValues = items => {
      return items.filter(
        item => item.value != null && item.value !== "" && item.value !== 0
      );
    };
    const addUnit = (value, unit) => {
      return value != null && value !== "" && value !== 0
        ? `${value}${unit}`
        : value;
    };

    const groups = {
      agency_accounting: {
        title: "代理记账",
        items: filterNullValues([
          { label: "代理类型", value: currentReceipt.value.agency_type },
          {
            label: "代理费",
            value: addUnit(currentReceipt.value.agency_fee, "元")
          },
          {
            label: "记账软件费",
            value: addUnit(currentReceipt.value.accounting_software_fee, "元")
          },
          {
            label: "地址费",
            value: addUnit(currentReceipt.value.address_fee, "元")
          },
          {
            label: "开始日期",
            value: currentReceipt.value.agency_start_date
          },
          {
            label: "结束日期",
            value: currentReceipt.value.agency_end_date
          }
        ])
      },
      invoice_software: {
        title: "开票软件",
        items: filterNullValues([
          {
            label: "开票软件费",
            value: addUnit(currentReceipt.value.invoice_software_fee, "元")
          },
          {
            label: "开始日期",
            value: currentReceipt.value.invoice_software_start_date
          },
          {
            label: "结束日期",
            value: currentReceipt.value.invoice_software_end_date
          }
        ])
      },
      social_insurance: {
        title: "社保代理",
        items: filterNullValues([
          {
            label: "社保代理费",
            value: addUnit(
              currentReceipt.value.social_insurance_agency_fee,
              "元"
            )
          },
          {
            label: "社保人数",
            value: addUnit(currentReceipt.value.social_insurance_number, "人")
          },
          {
            label: "开始日期",
            value: currentReceipt.value.social_insurance_start_date
          },
          {
            label: "结束日期",
            value: currentReceipt.value.social_insurance_end_date
          }
        ])
      },
      statistical_report: {
        title: "统计报表",
        items: filterNullValues([
          {
            label: "统计报表费",
            value: addUnit(currentReceipt.value.statistical_report_fee, "元")
          },
          {
            label: "开始日期",
            value: currentReceipt.value.social_insurance_start_date
          },
          {
            label: "结束日期",
            value: currentReceipt.value.social_insurance_end_date
          }
        ])
      },
      new_license: {
        title: "新办执照",
        items: filterNullValues([
          {
            label: "办照型",
            value: addUnit(currentReceipt.value.license_type, "元")
          },
          {
            label: "办照用",
            value: addUnit(currentReceipt.value.license_fee, "元")
          },
          {
            label: "一次性地址费",
            value: addUnit(currentReceipt.value.one_time_address_fee, "元")
          },
          {
            label: "牌子费",
            value: addUnit(currentReceipt.value.brand_fee, "元")
          },
          {
            label: "刻章费",
            value: addUnit(currentReceipt.value.seal_fee, "元")
          }
        ])
      },
      change_business: {
        title: "变更业务",
        items: filterNullValues([
          {
            label: "更费",
            value: addUnit(currentReceipt.value.change_fee, "元")
          },
          {
            label: "变更业务",
            value: currentReceipt.value.change_business
          }
        ])
      },
      administrative_license: {
        title: "行政可",
        items: filterNullValues([
          {
            label: "行政许可费",
            value: addUnit(
              currentReceipt.value.administrative_license_fee,
              "元"
            )
          },
          {
            label: "行政许可",
            value: currentReceipt.value.administrative_license
          }
        ])
      },
      other_fees: {
        title: "其他费用",
        items: filterNullValues([
          {
            label: "其他费用",
            value: addUnit(currentReceipt.value.other_business_fee, "元")
          },
          {
            label: "其他业务",
            value: currentReceipt.value.other_business
          }
        ])
      }
    };

    // 过滤掉没有任何有效项目的组
    return Object.fromEntries(
      Object.entries(groups).filter(([_, group]) => group.items.length > 0)
    );
  });

  const handleExport = async () => {
    try {
      const params = {
        companyName: searchForm.company_name,
        status: searchForm.status,
        submitter: searchForm.submitter,
        chargeDateStart: searchForm.charge_date
          ? searchForm.charge_date[0]
          : null,
        chargeDateEnd: searchForm.charge_date ? searchForm.charge_date[1] : null
      };

      const response = await exportExpenses(params);
      const reader = new FileReader();
      reader.onload = function () {
        const url = window.URL.createObjectURL(
          new Blob([reader.result as ArrayBuffer])
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      reader.readAsArrayBuffer(response);
      ElMessage.success("导出成功");
    } catch (error) {
      console.error("导出失败:", error);
      ElMessage.error("导出失败，请稍后重试");
    }
  };

  // 加一个计算属性来获取公司名称列表
  const companyNames = computed(() => {
    const uniqueNames = new Set(dataList.value.map(item => item.company_name));
    return Array.from(uniqueNames);
  });

  const dynamicFields = ref([]);
  const availableFields = [
    { key: "company_location", label: "企业归属地" },
    { key: "business_type", label: "业务类型" },
    { key: "agency_type", label: "代理类型" },
    { key: "contract_type", label: "合同类型" },
    { key: "agency_fee", label: "代理费" },
    { key: "accounting_software_fee", label: "记账软件费" },
    { key: "address_fee", label: "地址费" },
    { key: "agency_start_date", label: "代理开始日期" },
    { key: "agency_end_date", label: "代理结束日期" },
    { key: "invoice_software_provider", label: "开票软件服务商" },
    { key: "invoice_software_fee", label: "开票软件费" },
    { key: "invoice_software_start_date", label: "开票软件开始日期" },
    { key: "invoice_software_end_date", label: "开票软件结束日期" },
    { key: "social_insurance_agency_fee", label: "保代理费" },
    { key: "insured_count", label: "参保人数" },
    { key: "insurance_types", label: "参保险种" },
    { key: "social_insurance_start_date", label: "社保开始日期" },
    { key: "social_insurance_end_date", label: "社保结束日期" },
    { key: "statistical_report_fee", label: "统计局报表费" },
    { key: "statistical_start_date", label: "统计开始日期" },
    { key: "statistical_end_date", label: "统计结束日期" },
    { key: "license_type", label: "办照类型" },
    { key: "license_fee", label: "办照费用" },
    { key: "one_time_address_fee", label: "一次性地址费" },
    { key: "brand_fee", label: "牌子费" },
    { key: "seal_fee", label: "刻章费" },
    { key: "change_fee", label: "变更收费" },
    { key: "change_business", label: "变更业务" },
    { key: "administrative_license", label: "行政许可" },
    { key: "administrative_license_fee", label: "行政许可收费" },
    { key: "other_business", label: "其他业务" },
    { key: "other_business_fee", label: "其他业务收费" },
    { key: "total_fee", label: "总费用" },
    { key: "charge_date", label: "收费日期" },
    { key: "charge_method", label: "收费方式" },
    { key: "submitter", label: "提交人" },
    { key: "auditor", label: "审核员" },
    { key: "audit_date", label: "审核日期" },
    { key: "create_time", label: "创建日期" }
  ];

  const addSearchField = key => {
    const field = availableFields.find(f => f.key === key);
    if (field && !dynamicFields.value.includes(field)) {
      dynamicFields.value.push(field);
      searchForm[key] = "";
    }
  };

  const removeSearchField = (key: string) => {
    dynamicFields.value = dynamicFields.value.filter(f => f.key !== key);
    Reflect.deleteProperty(searchForm, key);
  };

  const isFieldUsed = key => {
    return dynamicFields.value.some(f => f.key === key) || key in searchForm;
  };

  const groupedAvailableFields = computed(() => {
    const fields = availableFields.filter(field => !isFieldUsed(field.key));
    const midpoint = Math.ceil(fields.length / 2);
    return {
      left: fields.slice(0, midpoint),
      right: fields.slice(midpoint)
    };
  });

  // 新增自动补全函数
  const getAutoCompleteOptions = (field: string) => {
    return async (queryString: string, cb: (arg: any) => void) => {
      try {
        const response = await getAutocompleteOptions(field, queryString);
        if (response.success) {
          cb(response.data.map(item => ({ value: item })));
        } else {
          cb([]);
        }
      } catch (error) {
        console.error("Failed to fetch autocomplete options:", error);
        cb([]);
      }
    };
  };

  const autoCompleteOptions: AutoCompleteOptions = {};

  // 为所有可用字段创建自动补全函数
  availableFields.forEach(field => {
    autoCompleteOptions[field.key] = getAutoCompleteOptions(field.key);
  });

  // 添加固定字段的自动补全
  autoCompleteOptions["company_name"] = getAutoCompleteOptions("company_name");
  autoCompleteOptions["submitter"] = getAutoCompleteOptions("submitter");

  return {
    searchForm,
    loading,
    dataList,
    onSearch,
    resetSearchForm,
    openDialog,
    handleDelete,
    formatMoney,
    formatDate,
    currentPage,
    pageSize,
    total,
    handlePageChange,
    handleSizeChange,
    companyNames,
    userPermissions,
    fetchExpenseList,
    handleAudit,
    dialogVisible,
    auditStatus,
    rejectReason,
    showAuditDialog,
    cancelAudit,
    showRejectReason,
    handleCancelAudit,
    receiptDialogVisible,
    currentReceipt,
    viewReceipt,
    generateGroupedExpenseDetails,
    stampUnitOptions,
    selectedStampUnit,
    handleExport,
    dynamicFields,
    availableFields,
    addSearchField,
    removeSearchField,
    isFieldUsed,
    groupedAvailableFields,
    autoCompleteOptions,
    remoteMethod,
    companyOptions,
    loadingCompanyOptions,
    useExpenseUpload
  };
}
