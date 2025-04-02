import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 合同表单验证规则 */
export const formRules = reactive<FormRules>({
  contract_no: [
    { required: true, message: "请输入合同编号", trigger: "blur" },
    { min: 3, max: 50, message: "长度在 3 到 50 个字符", trigger: "blur" }
  ],
  customer_name: [{ required: true, message: "请选择客户", trigger: "change" }],
  amount: [
    { required: true, message: "请输入合同金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" }
  ],
  tax_amount: [
    { type: "number", min: 0, message: "税额必须大于等于0", trigger: "blur" }
  ],
  sign_date: [{ required: true, message: "请选择签订日期", trigger: "change" }],
  expire_date: [
    { required: true, message: "请选择到期日期", trigger: "change" }
  ]
});
