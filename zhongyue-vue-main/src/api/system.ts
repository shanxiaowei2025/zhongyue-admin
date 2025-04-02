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
  };
};

/** 获取系统管理-用户管理列表 */
export const getUserList = (data?: object) => {
  return http.request<ResultTable>("post", "/user", { data });
};

/** 系统管理-用户管理-获取所有角色列表 */
export const getAllRoleList = () => {
  return http.request<Result>("get", "/list-all-role");
};

/** 系统管理-用户管理-根据userId，获取对应角色id列表（userId：用户id） */
export const getRoleIds = (data?: object) => {
  return http.request<Result>("post", "/list-role-ids", { data });
};

/** 获取系统管理-角色管理列表 */
export const getRoleList = (data?: object) => {
  return http.request<ResultTable>("post", "/role", { data });
};

/** 获取系统管理-菜单管理列表 */
export const getMenuList = (data?: object) => {
  return http.request<Result>("post", "/menu", { data });
};

/** 获取系统管理-部门管理列表 */
export const getDeptList = (data?: object) => {
  return http.request<Result>("post", "/dept", { data });
};

/** 获取系统监控-在线用户列表 */
export const getOnlineLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/online-logs", { data });
};

/** 获取系统监控-登录日志列表 */
export const getLoginLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/login-logs", { data });
};

/** 获取系统监控-操作日志列表 */
export const getOperationLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/operation-logs", { data });
};

/** 获取系统监控-系统日志列表 */
export const getSystemLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/system-logs", { data });
};

/** 获取系统监控-系统日志-根据 id 查日志详情 */
export const getSystemLogsDetail = (data?: object) => {
  return http.request<Result>("post", "/system-logs-detail", { data });
};

/** 获取角色管理-权限-菜单权限 */
export const getRoleMenu = (data?: object) => {
  return http.request<Result>("post", "/role-menu", { data });
};

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (data?: object) => {
  return http.request<Result>("post", "/role-menu-ids", { data });
};

/** 系统管理-用户管理-新增用户 */
export const createUser = (data?: object) => {
  return http.request<Result>("post", "/user/create", { data });
};

/** 系统管理-用户管理-修改用户 */
export const updateUser = (data?: object) => {
  return http.request<Result>("post", "/user/update", { data });
};

/** 系统管理-用户管理-删除用户 */
export const deleteUser = (data?: object) => {
  return http.request<Result>("post", "/user/delete", { data });
};

/** 系统管理-用户管理-重置用户密码 */
export const resetUserPassword = (data?: object) => {
  return http.request<Result>("post", "/user/reset-password", { data });
};

/** 系统管理-用户管理-上传头像 */
export const uploadAvatar = (data?: object) => {
  return http.request<Result>(
    "post",
    "/user/upload-avatar",
    { data },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};

/** 系统管理-用户管理-更新用户角色 */
export const updateUserRoles = (data?: object) => {
  return http.request<Result>("post", "/user/update-roles", { data });
};

/** 系统管理-角色管理-新增角色 */
export const createRole = (data?: object) => {
  return http.request<Result>("post", "/role/create", { data });
};

/** 系统管理-角色管理-修改角色 */
export const updateRole = (data?: object) => {
  return http.request<Result>("post", "/role/update", { data });
};

/** 系统管理-角色管理-删除角色 */
export const deleteRole = (data?: object) => {
  return http.request<Result>("post", "/role/delete", { data });
};

/** 系统管理-部门管理-新增部门 */
export const createDept = (data?: object) => {
  return http.request<Result>("post", "/dept/create", { data });
};

/** 系统管理-部门管理-修改部门 */
export const updateDept = (data?: object) => {
  return http.request<Result>("post", "/dept/update", { data });
};

/** 系统管理-部门管理-删除部门 */
export const deleteDept = (data?: object) => {
  return http.request<Result>("post", "/dept/delete", { data });
};

/** 获取角色管理-权限-权限列表 */
export const getPermissionsList = async () => {
  return http.request<Result>("get", "/permission");
};

/** 更新角色管理-权限-权限 */
export const updatePermission = (data?: object) => {
  return http.request<Result>("post", "/permission/update", { data });
};

/** 获取当前用户权限 */
export const getCurrentUserPermissions = () => {
  return http.request<Result>("get", "/current-user-permissions");
};
