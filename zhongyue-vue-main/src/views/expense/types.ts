// 费用记录的基本属性
export interface ExpenseRecord {
  id?: number;
  date: string;
  amount: number;
  category: string;
  description: string;
  payment_method: string;
  company_name?: string;
  status?: number;
  reject_reason?: string;
}

// 表单项属性，继承自 ExpenseRecord
export interface FormItemProps extends ExpenseRecord {
  // 基本信息
  company_name: string;
  company_location: string;
  charge_date: string;
  charge_method: string;
  submitter: string;
  contract_type: string;
  contract_image: string | { url: string };
  proof_of_charge: string[] | string;

  // 开票软件
  invoice_software_provider: string;
  invoice_software_fee: number | null;
  invoice_software_start_date: string;
  invoice_software_end_date: string;

  // 社保代理
  social_insurance_agency_fee: number | null;
  social_insurance_start_date: string;
  social_insurance_end_date: string;

  // 统计报表
  statistical_report_fee: number | null;
  statistical_report_start_date: string;
  statistical_report_end_date: string;

  // 新办执照
  license_type: string;
  license_fee: number | null;
  one_time_address_fee: number | null;
  brand_fee: number | null;
  seal_fee: number | null;

  // 变更业务
  change_fee: number | null;
  change_business: string;

  // 行政许可
  administrative_license_fee: number | null;
  administrative_license: string;

  // 其他业务
  other_business_fee: number | null;
  other_business: string;

  // 代理费
  agency_fee: number | null;

  // 会计软件
  accounting_software_fee: number | null;

  // 地址费
  address_fee: number | null;

  // 审核相关
  status: number;
  reject_reason?: string;
  auditor?: string;
  audit_date?: string;
}
