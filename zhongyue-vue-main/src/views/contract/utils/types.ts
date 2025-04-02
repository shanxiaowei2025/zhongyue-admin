// 业务类型枚举
export enum BusinessType {
  Agency = "代理记账合同",
  Social = "社保代理合同"
}

// 合同状态枚举
export enum ContractStatus {
  Unsigned = "未签署",
  Active = "生效中",
  Expired = "已过期",
  Void = "已作废"
}

// 客户信息接口
export interface CustomerInfo {
  id: number;
  company_name: string;
  social_credit_code: string;
  business_address: string;
  daily_contact: string;
  daily_contact_phone: string;
}

// 公司信息接口
export interface CompanyInfo {
  id: number;
  company_name: string;
  company_code: string;
  company_address: string;
  company_phone: string;
  business_person: string;
}

// 合同表单项属性接口
export interface FormItemProps {
  id?: number;
  contract_no: string;
  business_type: BusinessType;

  // 客户信息（甲方）
  customer_name: string;
  customer_code: string;
  customer_address: string;
  customer_phone: string;
  customer_contact: string;

  // 公司信息（乙方）
  company_name: string;
  company_code: string;
  company_address: string;
  company_phone: string;
  business_person: string;

  // 合同信息
  amount: number;
  sign_date: string;
  start_date: string;
  expire_date: string;
  status: ContractStatus;
  remark: string;
  contract_files: string[];

  // 审计字段
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  submitter?: string;
}

// 合同表单属性接口
export interface FormProps {
  formInline: FormItemProps;
}

// 表格列配置接口
export interface ColumnItem {
  label: string;
  prop: string;
  width?: number;
  fixed?: boolean | "left" | "right";
  slot?: boolean | string;
  minWidth?: number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  formatter?: (row: any) => string;
}

export type TableColumnList = ColumnItem[];

// 搜索表单接口
export interface SearchFormProps {
  contract_no: string;
  customer_name: string;
  business_type: string;
  status: string;
  submitter: string;
  start_date: string;
  end_date: string;
}

// 定义合法的标签类型
export type TagType = "success" | "warning" | "info" | "primary" | "danger";
