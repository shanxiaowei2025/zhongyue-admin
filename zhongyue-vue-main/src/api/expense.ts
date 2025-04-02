import { http } from "@/utils/http";
type Result = {
  success: boolean;
  data?: Array<any>;
};

type ResultTable = {
  success: boolean;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
    permissions?: {
      action: {
        edit: boolean;
        audit: boolean;
        cancel_audit: boolean;
        delete: boolean;
        view_receipt: boolean;
        create: boolean;
      };
      data: {
        view_all: boolean;
        view_own: boolean;
        view_unaudited: boolean;
        view_by_location: boolean;
        view_department_submissions: boolean;
      };
    };
  };
};

/** 获取费用管理列表 */
export const getExpenseList = (params?: object) => {
  return http.request<ResultTable>("get", "/expense/", { params });
};

/** 新增费用 */
export const createExpense = (data: object) => {
  return http.request<Result>("post", "/expense/create/", {
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 修改费用 */
export const updateExpense = (data: object) => {
  return http.request<Result>("post", "/expense/update/", {
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 删除费用 */
export const deleteExpense = (data?: object) => {
  return http.request<Result>("post", "/expense/delete/", { data });
};

// 添加审核接口
export const auditExpense = (data: object) => {
  return http.request<Result>("post", "/expense/audit/", { data });
};

// 取消审核接口
export const cancelAuditExpense = (data: { id: number }) => {
  return http.request<{ success: boolean; message: string }>(
    "post",
    "/expense/cancel-audit/",
    { data }
  );
};

// 导出费用
export const exportExpenses = (params: object) => {
  return http.request<Blob>(
    "get",
    "/expense/export/",
    { params },
    { responseType: "blob" }
  );
};

// 自动补全接口
export const getAutocompleteOptions = (field: string, query: string) => {
  return http.request<Result>("get", "/expense/autocomplete/", {
    params: { field, query }
  });
};
