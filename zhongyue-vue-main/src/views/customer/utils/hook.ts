import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomers,
  getAutocompleteOptions
} from "@/api/customer";
import { ElMessageBox, ElMessage } from "element-plus";
import { h } from "vue";
import { addDialog } from "@/components/ReDialog";
import editForm from "../form.vue";
import { useRouter } from "vue-router";

type AutoCompleteFunction = (
  queryString: string,
  callback: (results: any[]) => void
) => void;

interface AutoCompleteOptions {
  [key: string]: AutoCompleteFunction;
}

export function useCustomer() {
  const searchForm = reactive({
    companyName: "",
    bossName: "",
    dailyContact: "",
    taxBureau: ""
    // 其他字段将动态添加
  });

  const dynamicFields = ref([]);
  const availableFields = [
    { key: "sales_representative", label: "业务员" },
    { key: "social_credit_code", label: "统一社会信用代码" },
    { key: "enterprise_status", label: "企业状态" },
    { key: "business_source", label: "业务来源" },
    { key: "tax_registration_type", label: "税务登记类型" },
    { key: "chief_accountant", label: "主管会计" },
    { key: "responsible_accountant", label: "责任会计" },
    { key: "license_expiry_date", label: "执照到期日" },
    { key: "enterprise_type", label: "企业类型" },
    { key: "basic_bank", label: "基本开户银行" },
    { key: "basic_bank_account", label: "基本开户行账号" },
    { key: "general_bank", label: "一般开户行" },
    { key: "legal_person_name", label: "法人姓名" },
    { key: "financial_officer_name", label: "财务负责人姓名" },
    { key: "tax_officer_name", label: "办税员姓名" },
    { key: "tax_categories", label: "税种" }
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

  const loading = ref(true);
  const dataList = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const permissions = ref({
    action: {
      edit: false,
      delete: false,
      create: false
    },
    data: {
      view_all: false,
      view_own: false,
      view_by_location: null,
      view_department_submissions: false
    }
  });
  const formRef = ref();
  const router = useRouter();

  const resetSearchForm = () => {
    Object.keys(searchForm).forEach(key => {
      // 清空所有搜索字段的值，包括动态添加的字段
      searchForm[key] = "";
    });
    // 不再删除动态字段
    // dynamicFields.value = [];
    onSearch();
  };

  const onSearch = async () => {
    loading.value = true;
    try {
      // 构建搜索参数
      const params = Object.entries(searchForm).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});
      // 调用 API
      const response = await getCustomerList(params);
      if (response.success && response.data) {
        dataList.value = response.data.list;
        total.value = response.data.total;
        currentPage.value = response.data.currentPage;
        pageSize.value = response.data.pageSize;
        permissions.value = response.data.permissions;
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      message("获取客户列表失败，请稍后重试", { type: "error" });
    } finally {
      loading.value = false;
    }
  };

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
  autoCompleteOptions["companyName"] = getAutoCompleteOptions("company_name");
  autoCompleteOptions["bossName"] = getAutoCompleteOptions("boss_name");
  autoCompleteOptions["dailyContact"] = getAutoCompleteOptions("daily_contact");
  autoCompleteOptions["taxBureau"] = getAutoCompleteOptions("tax_bureau");

  const queryCompanyNames = getAutoCompleteOptions("company_name");
  const queryDailyContacts = getAutoCompleteOptions("daily_contact");
  const querySalesRepresentatives = getAutoCompleteOptions(
    "sales_representative"
  );
  const queryTaxBureaus = getAutoCompleteOptions("tax_bureau");
  const queryBossNames = getAutoCompleteOptions("boss_name");

  const handlePageChange = (page: number) => {
    currentPage.value = page;
    onSearch();
  };

  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    onSearch();
  };

  const openDialog = (title = "新增", row?: any) => {
    const formData = row ? { ...row } : {};

    // 简化图片字段处理
    const imageFields = [
      "legal_person_id_images",
      "other_id_images",
      "business_license_images",
      "bank_account_license_images",
      "supplementary_images"
    ];

    // 确保所有图片字段都是数组
    imageFields.forEach(field => {
      formData[field] = Array.isArray(formData[field]) ? formData[field] : [];
    });

    addDialog({
      title: `${title}客户`,
      props: {
        formData: formData,
        queryBossNames: queryBossNames
      },
      width: "60%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, {
          ref: formRef,
          formData: formData,
          queryBossNames: queryBossNames
        }),
      beforeSure: async done => {
        const FormRef = formRef.value.getRef();
        const curData = formRef.value.getFormData();

        try {
          await FormRef.validate(async valid => {
            if (valid) {
              const formDataToSend = new FormData();

              // 处理所有字段
              Object.keys(curData).forEach(key => {
                if (imageFields.includes(key)) {
                  // 图片字段：直接发送数组
                  formDataToSend.append(
                    key,
                    JSON.stringify(curData[key] || [])
                  );
                } else {
                  // 普通字段：直接保存值
                  formDataToSend.append(key, curData[key] || "");
                }
              });

              if (title === "新增") {
                await createCustomer(formDataToSend);
              } else {
                if (!formData.id) {
                  throw new Error("Customer ID is missing");
                }
                await updateCustomer(formData.id, formDataToSend);
              }
              done();
              message(`${title}成功`, { type: "success" });
              onSearch();
            }
          });
        } catch (error) {
          message(`${title}失败: ${error.message}`, { type: "error" });
        }
      }
    });
  };

  const handleDelete = async (row: any) => {
    ElMessageBox.confirm("确定要删除该客户吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(async () => {
        try {
          await deleteCustomer(row.id);
          message("删除成功", { type: "success" });
          onSearch();
        } catch (error) {
          message("删除失败，请稍后重试", { type: "error" });
        }
      })
      .catch(() => {
        message("已取消删除", { type: "info" });
      });
  };

  const handleCreate = () => {
    openDialog("新增");
  };

  const handleUpdate = (row: any) => {
    openDialog("编辑", row);
  };

  const handleViewDetail = (row: any) => {
    router.push(`/customer/detail/${row.id}`);
  };

  const handleRefresh = () => {
    onSearch();
  };

  const handleExport = async () => {
    try {
      const params = {
        companyName: searchForm.companyName,
        bossName: searchForm.bossName
      };
      const response: Blob = await exportCustomers(params);

      // 创建一个 URL
      const url = window.URL.createObjectURL(response);

      // 创建一个临时的 <a> 元素并触发下载
      const link = document.createElement("a");
      link.href = url;
      link.download = "customers.xlsx";
      link.click();

      // 清理
      window.URL.revokeObjectURL(url);

      message("导出成功", { type: "success" });
    } catch (error) {
      message("导出失败，请稍后重试", { type: "error" });
    }
  };

  const initFormData = () => {
    return {
      legal_person_id_images: [],
      other_id_images: [],
      business_license_images: [],
      bank_account_license_images: [],
      supplementary_images: []
    };
  };

  onMounted(() => {
    onSearch();
  });

  return {
    searchForm,
    dynamicFields,
    availableFields,
    addSearchField,
    removeSearchField,
    isFieldUsed,
    loading,
    dataList,
    total,
    currentPage,
    pageSize,
    permissions,
    resetSearchForm,
    onSearch,
    handlePageChange,
    handleSizeChange,
    openDialog,
    handleDelete,
    handleCreate,
    handleUpdate,
    handleViewDetail,
    queryCompanyNames,
    queryDailyContacts,
    querySalesRepresentatives,
    queryTaxBureaus,
    queryBossNames,
    handleRefresh,
    handleExport,
    autoCompleteOptions,
    initFormData
  };
}

/**
 * 使用图片上传相关的钩子函数
 * @param formData - 表单数据对象
 * @returns {Object} 包含图片上传相关的方法
 */
export const useImageUpload = (formData: any) => {
  const formRef = ref();

  const handleBeforeImageUpload = async (file?: File): Promise<boolean> => {
    // 先验证企业名称字段
    if (!formData.value?.company_name) {
      ElMessage.warning("请先填写企业名称");
      return false;
    }

    // 如果没有传入文件，说明是点击验证，直接返回true
    if (!file) {
      return true;
    }

    // 验证文件类型
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      ElMessage.error("只能上传图片文件！");
      return false;
    }

    // 验证文件大小（默认限制 5MB）
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      ElMessage.error("图片大小不能超过 5MB！");
      return false;
    }

    return true;
  };

  const getUploadDirectory = (): string => {
    return formData.value?.company_name?.trim()
      ? `customer/${formData.value.company_name.trim()}`
      : "customer/default";
  };

  return {
    formRef,
    handleBeforeImageUpload,
    getUploadDirectory
  };
};
