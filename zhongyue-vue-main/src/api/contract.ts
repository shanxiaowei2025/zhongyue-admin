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

/** 获取合同列表 */
export const getContractList = (params?: object) => {
  return http.request<ResultTable>("get", "/contract/list/", { params });
};

/** 创建合同 */
export const createContract = (data: FormData) => {
  return http.request<Result>("post", "/contract/create/", {
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 更新合同 */
export const updateContract = (id: number, data: FormData) => {
  return http.request<Result>("put", `/contract/update/${id}/`, {
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 删除合同 */
export const deleteContract = (id: number) => {
  return http.request<Result>("delete", `/contract/delete/${id}/`);
};
