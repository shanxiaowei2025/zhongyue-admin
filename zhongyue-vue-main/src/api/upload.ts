import { http } from "@/utils/http";

interface UploadUrlResponse {
  success: boolean;
  data: {
    url: string; // 预签名上传URL
    path: string; // 对象存储路径
    file_url: string; // 完整的文件访问URL
    expires_in: number; // URL过期时间(秒)
  };
}

/** 获取文件上传预签名URL */
export const getUploadUrl = (data: {
  filename: string;
  content_type: string;
  subdirectory?: string;
}): Promise<UploadUrlResponse> => {
  return http.request("post", "/fileupload/upload/", { data });
};
