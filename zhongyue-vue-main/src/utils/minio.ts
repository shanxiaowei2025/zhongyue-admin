const isProd = import.meta.env.PROD;

export const getMinioUrl = (path: string): string => {
  if (!path) return "";

  // 如果已经是完整的URL，直接返回
  if (path.startsWith("http")) {
    return path;
  }

  if (isProd) {
    // 生产环境
    return `${import.meta.env.VITE_MINIO_ENDPOINT}/${import.meta.env.VITE_MINIO_BUCKET}/${path}`;
  } else {
    // 开发环境
    return `${import.meta.env.VITE_MINIO_DOMAIN}/${import.meta.env.VITE_MINIO_BUCKET}/${path}`;
  }
};
