import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = async (): Promise<Result> => {
  try {
    const response = await http.request<Result>("get", "/get-async-routes/");
    return response;
  } catch (error) {
    console.error("获取异步路由出错:", error);
    throw error;
  }
};
