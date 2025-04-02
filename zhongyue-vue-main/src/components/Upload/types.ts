import type { UploadFile, UploadFiles } from "element-plus";

// 直接导出 element-plus 的类型
export type { UploadFile, UploadFiles };

export interface UploadProps {
  modelValue?: string[];
  maxCount?: number;
  maxSize?: number;
  accept?: string[];
  multiple?: boolean;
  imageOnly?: boolean;
  showFileList?: boolean;
  directory?: string;
  headers?: Record<string, string>;
  data?: Record<string, any>;
  name: string;
  beforeUpload?: (file?: File) => Promise<boolean>;
}

export interface UploadEmits {
  (e: "update:modelValue", urls: string[]): void;
  (e: "success" | "error" | "remove", file: UploadFile): void;
  (e: "exceed", files: File[]): void;
}
