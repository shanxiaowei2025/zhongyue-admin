import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data?: Array<any>;
};

type ResultTable = {
  success: boolean;
  data?: {
    list: Array<any>;
    total?: number;
    pageSize?: number;
    currentPage?: number;
    permissions?: {
      action: {
        edit: boolean;
        delete: boolean;
        create: boolean;
      };
      data: {
        view_all: boolean;
        view_own: boolean;
        view_by_location: boolean;
        view_department_submissions: boolean;
      };
    };
  };
};

/** 获取客户列表 */
export const getCustomerList = (params: any): Promise<ResultTable> => {
  return http.request("get", "/customer/list/", { params });
};

/** 创建客户 */
export const createCustomer = (data: object) => {
  return http.request<Result>("post", "/customer/create/", {
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 更新客户 */
export const updateCustomer = (id: number, data: object) => {
  return http.request<Result>("put", `/customer/update/${id}/`, {
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 删除客户 */
export const deleteCustomer = (id: number) => {
  return http.request<Result>("delete", `/customer/delete/${id}/`);
};

/** 获取客户详情 */
export const getCustomerDetail = (id: number) => {
  return http.request<Result>("get", `/customer/detail/${id}/`);
};

/** 获取同宗企业 */
export const getRelatedCustomers = (bossName: string) => {
  return http.request<Result>("get", `/customer/related-customers/`, {
    params: { boss_name: bossName }
  });
};

/** 导出客户 */
export const exportCustomers = (params: any) => {
  return http.request<Blob>("get", "/customer/export/", {
    params,
    responseType: "blob"
  });
};

/** 获取自动补全选项 */
export const getAutocompleteOptions = (field: string, query: string) => {
  return http.request<Result>("get", "/customer/autocomplete/", {
    params: { field, query }
  });
};
