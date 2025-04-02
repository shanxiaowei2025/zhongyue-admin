<template>
  <div class="customer-form-container">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="180px">
      <!-- 上面的卡片，包含联系人信息、税务信息和银行信息 -->
      <el-card class="main-card">
        <el-tabs v-model="activeTab" class="customer-tabs">
          <el-tab-pane label="基本信息" name="basicInfo">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业名称" prop="company_name">
                  <el-input v-model="formData.company_name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="统一社会信用代码"
                  prop="social_credit_code"
                >
                  <el-input v-model="formData.social_credit_code" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业状态" prop="enterprise_status">
                  <el-select
                    v-model="formData.enterprise_status"
                    placeholder="请选择企业状态"
                  >
                    <el-option label="正常" value="正常" />
                    <el-option label="已注销" value="已注销" />
                    <el-option label="已流失" value="已流失" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="业务员" prop="sales_representative">
                  <el-input v-model="formData.sales_representative" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="日常业务联系人" prop="daily_contact">
                  <el-input v-model="formData.daily_contact" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="日常客户联系人电话"
                  prop="daily_contact_phone"
                >
                  <el-input v-model="formData.daily_contact_phone" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所属分局" prop="tax_bureau">
                  <el-select
                    v-model="formData.tax_bureau"
                    placeholder="请选择所属分局"
                  >
                    <el-option label="固城局" value="固城局" />
                    <el-option label="定兴局" value="定兴局" />
                    <el-option label="北河局" value="北河局" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="业务来源" prop="business_source">
                  <el-input v-model="formData.business_source" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="税务登记类型" prop="tax_registration_type">
                  <el-select
                    v-model="formData.tax_registration_type"
                    placeholder="请选择税务登记类型"
                  >
                    <el-option label="一般纳税人" value="一般纳税人" />
                    <el-option
                      label="小规模纳税人(公司)"
                      value="小规模纳税人(公)"
                    />
                    <el-option
                      label="小规模纳税人(个人)"
                      value="小规模纳税人(个人)"
                    />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主管会计" prop="chief_accountant">
                  <el-input v-model="formData.chief_accountant" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="责任会计" prop="responsible_accountant">
                  <el-input v-model="formData.responsible_accountant" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="老板名称" prop="boss_name">
                  <el-autocomplete
                    v-model="formData.boss_name"
                    :fetch-suggestions="queryBossNames"
                    placeholder="请输入老板名称"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="企业画像" name="enterpriseProfile">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="企业主营" prop="main_business">
                  <el-input v-model="formData.main_business" type="textarea" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="老板画像" prop="boss_profile">
                  <el-input v-model="formData.boss_profile" type="textarea" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="沟通注意事项" prop="communication_notes">
                  <el-input
                    v-model="formData.communication_notes"
                    type="textarea"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="工商基本信息" name="businessInfo">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="经营范围" prop="business_scope">
                  <el-input v-model="formData.business_scope" type="textarea" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="经营地址" prop="business_address">
                  <el-input
                    v-model="formData.business_address"
                    type="textarea"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="注册资本(万元)" prop="registered_capital">
                  <el-input
                    v-model="formData.registered_capital"
                    type="number"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="成立时间" prop="establishment_date">
                  <el-date-picker
                    v-model="formData.establishment_date"
                    type="date"
                    placeholder="选择日期"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="执照到期日" prop="license_expiry_date">
                  <el-date-picker
                    v-model="formData.license_expiry_date"
                    type="date"
                    placeholder="选择日期"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="认缴到期日"
                  prop="capital_contribution_deadline"
                >
                  <el-date-picker
                    v-model="formData.capital_contribution_deadline"
                    type="date"
                    placeholder="选择日期"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业类型" prop="enterprise_type">
                  <el-input v-model="formData.enterprise_type" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="股东" prop="shareholders">
                  <el-input v-model="formData.shareholders" type="textarea" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="监事" prop="supervisors">
                  <el-input v-model="formData.supervisors" type="textarea" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="工商年检密码"
                  prop="annual_inspection_password"
                >
                  <el-input v-model="formData.annual_inspection_password" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实缴金额" prop="paid_in_capital">
                  <el-input v-model="formData.paid_in_capital" type="number" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="银行信息" name="bankInfo">
            <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item label="基本开户银行" prop="basic_bank">
                  <el-input v-model="formData.basic_bank" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="基本开户行账号" prop="basic_bank_account">
                  <el-input v-model="formData.basic_bank_account" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="基本开户行行号" prop="basic_bank_number">
                  <el-input v-model="formData.basic_bank_number" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="一般开户行" prop="general_bank">
                  <el-input v-model="formData.general_bank" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item
                  label="一般开户银行账号"
                  prop="general_bank_account"
                >
                  <el-input v-model="formData.general_bank_account" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="一般开户行行号" prop="general_bank_number">
                  <el-input v-model="formData.general_bank_number" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="是否办理网银盾" prop="has_online_banking">
                  <el-radio-group v-model="formData.has_online_banking">
                    <el-radio :value="'是'">是</el-radio>
                    <el-radio :value="'否'">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item
                  label="是否网银托"
                  prop="is_online_banking_custodian"
                >
                  <el-radio-group
                    v-model="formData.is_online_banking_custodian"
                  >
                    <el-radio :value="'是'">是</el-radio>
                    <el-radio :value="'否'">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- Add more bank information fields here -->
          </el-tab-pane>

          <el-tab-pane label="税务人员信息" name="taxPersonnelInfo">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="法人姓名" prop="legal_representative_name">
                  <el-input v-model="formData.legal_representative_name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="法人联系人电话"
                  prop="legal_representative_phone"
                >
                  <el-input v-model="formData.legal_representative_phone" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="法人身份证" prop="legal_representative_id">
                  <el-input v-model="formData.legal_representative_id" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="法人电子税务局密码"
                  prop="legal_representative_tax_password"
                >
                  <el-input
                    v-model="formData.legal_representative_tax_password"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="财务负责人姓名"
                  prop="financial_contact_name"
                >
                  <el-input v-model="formData.financial_contact_name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="财务负责人联系电话"
                  prop="financial_contact_phone"
                >
                  <el-input v-model="formData.financial_contact_phone" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="财务负责人身份证"
                  prop="financial_contact_id"
                >
                  <el-input v-model="formData.financial_contact_id" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="务负责人电子税务局密码"
                  prop="financial_contact_tax_password"
                >
                  <el-input v-model="formData.financial_contact_tax_password" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="办税员姓名" prop="tax_officer_name">
                  <el-input v-model="formData.tax_officer_name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="办税员联系电话" prop="tax_officer_phone">
                  <el-input v-model="formData.tax_officer_phone" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="办税员身份证" prop="tax_officer_id">
                  <el-input v-model="formData.tax_officer_id" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="办税员电子局密"
                  prop="tax_officer_tax_password"
                >
                  <el-input v-model="formData.tax_officer_tax_password" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="其他信息" name="otherInfo">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="三方协议账户"
                  prop="tripartite_agreement_account"
                >
                  <el-input v-model="formData.tripartite_agreement_account" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="税种" prop="tax_categories">
                  <el-input v-model="formData.tax_categories" type="textarea" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="申报个税人员"
                  prop="personal_income_tax_staff"
                >
                  <el-input v-model="formData.personal_income_tax_staff" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="个税密"
                  prop="personal_income_tax_password"
                >
                  <el-input v-model="formData.personal_income_tax_password" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="图片上传" name="imageUpload">
            <!-- 身份证图片一行 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="法人身份证" prop="legal_person_id_images">
                  <Uploader
                    v-model="formData.legal_person_id_images"
                    :max-count="2"
                    :accept="['image/jpeg', 'image/png']"
                    image-only
                    :directory="getUploadDirectory()"
                    :before-upload="handleBeforeImageUpload"
                    name="法人身份证"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="其他身份证" prop="other_id_images">
                  <Uploader
                    v-model="formData.other_id_images"
                    :max-count="2"
                    :accept="['image/jpeg', 'image/png']"
                    image-only
                    :directory="getUploadDirectory()"
                    :before-upload="handleBeforeImageUpload"
                    name="其他身份证"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 营业执照和开户许可证一行 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="营业执照" prop="business_license_images">
                  <Uploader
                    v-model="formData.business_license_images"
                    :max-count="2"
                    :accept="['image/jpeg', 'image/png']"
                    image-only
                    :directory="getUploadDirectory()"
                    :before-upload="handleBeforeImageUpload"
                    name="营业执照"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="开户许可证"
                  prop="bank_account_license_images"
                >
                  <Uploader
                    v-model="formData.bank_account_license_images"
                    :max-count="2"
                    :accept="['image/jpeg', 'image/png']"
                    image-only
                    :directory="getUploadDirectory()"
                    :before-upload="handleBeforeImageUpload"
                    name="开户许可证"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 补充图片 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="补充图片" prop="supplementary_images">
                  <Uploader
                    v-model="formData.supplementary_images"
                    :max-count="formData.supplementary_images.length + 1"
                    :accept="['image/jpeg', 'image/png']"
                    image-only
                    :directory="getUploadDirectory()"
                    :before-upload="handleBeforeImageUpload"
                    name="补充图片"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { useImageUpload } from "./utils/hook";
import { Uploader } from "@/components/Upload";

// 定义 props，包括 formData 和 queryBossNames
const props = defineProps<{
  formData: Record<string, any>;
  queryBossNames: (queryString: string, cb: (arg: any[]) => void) => void;
}>();

const formRef = ref<FormInstance>();
const activeTab = ref("basicInfo");

// 初始化 formData 的默认值
const defaultFormData = {
  company_name: "",
  social_credit_code: "",
  enterprise_status: "",
  sales_representative: "",
  daily_contact: "",
  daily_contact_phone: "",
  tax_bureau: "",
  business_source: "",
  tax_registration_type: "",
  chief_accountant: "",
  responsible_accountant: "",
  main_business: "",
  boss_profile: "",
  communication_notes: "",
  business_scope: "",
  business_address: "",
  registered_capital: "",
  paid_in_capital: "",
  establishment_date: "",
  license_expiry_date: "",
  capital_contribution_deadline: "",
  enterprise_type: "",
  shareholders: "",
  supervisors: "",
  annual_inspection_password: "",
  basic_bank: "",
  basic_bank_account: "",
  basic_bank_number: "",
  general_bank: "",
  general_bank_account: "",
  general_bank_number: "",
  has_online_banking: "",
  is_online_banking_custodian: "",
  legal_representative_name: "",
  legal_representative_phone: "",
  legal_representative_id: "",
  legal_representative_tax_password: "",
  financial_contact_name: "",
  financial_contact_phone: "",
  financial_contact_id: "",
  financial_contact_tax_password: "",
  tax_officer_name: "",
  tax_officer_phone: "",
  tax_officer_id: "",
  tax_officer_tax_password: "",
  tripartite_agreement_account: "",
  tax_categories: "",
  personal_income_tax_staff: "",
  personal_income_tax_password: "",
  legal_person_id_images: [],
  other_id_images: [],
  business_license_images: [],
  bank_account_license_images: [],
  supplementary_images: [],
  boss_name: ""
};

// 使用 props 中的 formData 初始化表单数据
const formData = ref({ ...defaultFormData, ...props.formData });

// 监听 props.formData 的变化，更新 formData
watch(
  () => props.formData,
  newVal => {
    // 基础字段直接合并
    Object.assign(formData.value, { ...defaultFormData, ...newVal });

    // 处理图片字段
    const imageFields = [
      "legal_person_id_images",
      "other_id_images",
      "business_license_images",
      "bank_account_license_images",
      "supplementary_images"
    ];

    imageFields.forEach(field => {
      formData.value[field] = Array.isArray(newVal[field]) ? newVal[field] : [];
    });
  },
  { deep: true, immediate: true }
);

// 使用 useImageUpload hook，传入响应式的 formData
const { handleBeforeImageUpload, getUploadDirectory } =
  useImageUpload(formData);

const rules: FormRules = {
  company_name: [
    { required: true, message: "请输入企业名称", trigger: "blur" },
    { min: 0, max: 100, message: "长度在 0 到 100 个字符", trigger: "blur" }
  ],
  social_credit_code: [
    {
      pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
      message: "请输入正确的统一社会信用代码",
      trigger: "blur"
    }
  ],
  enterprise_status: [],
  sales_representative: [],
  establishment_date: [],
  registered_capital: [],
  business_address: [],
  business_scope: [],
  daily_contact: [],
  daily_contact_phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ],
  tax_bureau: [],
  tax_registration_type: [],
  basic_bank: [],
  basic_bank_account: [
    { pattern: /^\d{16,19}$/, message: "请输入正确的银行账号", trigger: "blur" }
  ],
  basic_bank_number: [
    { pattern: /^\d{12}$/, message: "请输入正确的银行行号", trigger: "blur" }
  ],
  business_status: [],
  business_source: [],
  boss_name: [
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ]
};

const getFormData = () => {
  const data = { ...formData.value };

  // 处理所有图片字段
  const imageFields = [
    "legal_person_id_images",
    "other_id_images",
    "business_license_images",
    "bank_account_license_images",
    "supplementary_images"
  ];

  imageFields.forEach(field => {
    data[field] = Array.isArray(data[field]) ? data[field] : [];
  });

  return data;
};

defineExpose({
  getRef: () => formRef.value,
  getFormData
});
</script>

<style scoped>
.customer-form-container {
  padding: 10px;
  background-color: #f0f2f5;
  margin-bottom: 10px;
}

.main-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  height: auto; /* 设置高度为自动 */
}

.basic-info-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  width: 100%; /* 设置宽度为100% */
  height: auto; /* 设置高度为自动 */
}

.customer-tabs {
  height: 100%;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

:deep(.el-tabs__content) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card) {
  display: flex; /* 使用 flex 布局 */
  flex-wrap: wrap; /* 允许换行 */
}

:deep(.el-form-item__content) {
  display: flex;
  flex-wrap: wrap;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.upload-item {
  width: 150px;
  height: 150px;
}

.upload-slot {
  width: 100%;
  height: 100%;
}

.upload-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
}

.upload-placeholder .el-icon {
  font-size: 32px;
  color: #909399;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 5px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.5);
}

.image-actions .el-icon {
  color: white;
  cursor: pointer;
}
</style>
