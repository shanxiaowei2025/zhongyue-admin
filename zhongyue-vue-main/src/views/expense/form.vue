<script setup lang="ts">
import { reactive, ref, watch, onMounted, computed, onUnmounted } from "vue";
import type { FormInstance, UploadFile, UploadFiles } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { ElMessage, ElMessageBox } from "element-plus";
import { useExpense, useExpenseUpload } from "./utils/hook";
import { Uploader } from "@/components/Upload";

defineOptions({
  name: "ExpenseForm"
});

const props = defineProps({
  formInline: {
    type: Object,
    default: () => ({})
  }
});

const localFormInline = ref({ ...props.formInline });

const userStore = useUserStore();

const { companyOptions, loadingCompanyOptions, remoteMethod } = useExpense();

// 使用计算属性来计算总费用
const totalFee = computed(() => {
  const fees = [
    "license_fee",
    "one_time_address_fee",
    "brand_fee",
    "seal_fee",
    "agency_fee",
    "accounting_software_fee",
    "address_fee",
    "invoice_software_fee",
    "social_insurance_agency_fee",
    "statistical_report_fee",
    "change_fee",
    "administrative_license_fee",
    "other_business_fee"
  ];

  return fees.reduce((total, fee) => {
    const value = localFormInline.value[fee];
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return total + (isNaN(numValue) ? 0 : numValue);
  }, 0);
});

// 监听 props.formInline 的变化
watch(
  () => props.formInline,
  newVal => {
    localFormInline.value = { ...newVal };
  },
  { deep: true }
);

const emit = defineEmits(["update:formInline"]);

// 监听 localFormInline 的变化
watch(
  localFormInline,
  newVal => {
    emit("update:formInline", { ...newVal, totalFee: totalFee.value });
  },
  { deep: true }
);

const activeTab = ref("agencyAccounting");

// 检查标签页是否有字段被填写的计算属性
const isAgencyAccountingFilled = computed(() => {
  const {
    business_type,
    agency_type,
    contract_type,
    agency_fee,
    accounting_software_fee,
    address_fee,
    agency_start_date,
    agency_end_date,
    contract_image
  } = localFormInline.value;
  return (
    business_type ||
    agency_type ||
    contract_type ||
    agency_fee ||
    accounting_software_fee ||
    address_fee ||
    agency_start_date ||
    agency_end_date ||
    contract_image
  );
});

// 检查开票软件标签页是否有字段被填写
const isInvoiceSoftwareFilled = computed(() => {
  const {
    invoice_software_provider,
    invoice_software_fee,
    invoice_software_start_date,
    invoice_software_end_date
  } = localFormInline.value;
  return (
    !!invoice_software_provider ||
    !!invoice_software_fee ||
    !!invoice_software_start_date ||
    !!invoice_software_end_date
  );
});

// 检查社保代理标签页是否有字段被填写
const isSocialInsuranceFilled = computed(() => {
  const {
    insurance_types = [], // 提供默认值为空数组
    insured_count,
    social_insurance_agency_fee,
    social_insurance_start_date,
    social_insurance_end_date
  } = localFormInline.value;
  return (
    (insurance_types && insurance_types.length > 0) || // 添加 insurance_types 存在性检查
    !!insured_count ||
    !!social_insurance_agency_fee ||
    !!social_insurance_start_date ||
    !!social_insurance_end_date
  );
});

// 检查统计报表标签页是否有字段被填写
const isStatisticalReportFilled = computed(() => {
  const {
    statistical_report_fee,
    statistical_report_start_date,
    statistical_report_end_date
  } = localFormInline.value;
  return (
    !!statistical_report_fee ||
    !!statistical_report_start_date ||
    !!statistical_report_end_date
  );
});

// 检查变更业务标签页是否有字段被填写
const isChangeBusinessFilled = computed(() => {
  const { change_business_types = [], change_fee } = localFormInline.value;
  return change_business_types.length > 0 || !!change_fee;
});

// 检查其他业务签页否填写
const isOtherBusinessFilled = computed(() => {
  const { other_business_types = [], other_business_fee } =
    localFormInline.value;
  return other_business_types.length > 0 || !!other_business_fee;
});

// 检查行政许可标签页是否有字段被填写
const isAdministrativeLicenseFilled = computed(() => {
  const { administrative_license_types = [], administrative_license_fee } =
    localFormInline.value;
  return (
    administrative_license_types.length > 0 || !!administrative_license_fee
  );
});

// 添加新办执照小的计算属性
const newLicenseSubtotal = computed(() => {
  const {
    license_fee = 0,
    one_time_address_fee = 0,
    brand_fee = 0,
    seal_fee = 0
  } = localFormInline.value;
  return Math.round(
    Number(license_fee) +
      Number(one_time_address_fee) +
      Number(brand_fee) +
      Number(seal_fee)
  );
});

// 修改动态验证规则
const dynamicRule = computed(() => {
  const baseRule = reactive({
    company_name: [
      { required: true, message: "请输入公司名称", trigger: "submit" }
    ],
    business_type: [],
    agency_type: [],
    contract_type: [],
    agency_fee: [],
    accounting_software_fee: [],
    address_fee: [],
    agency_start_date: [],
    agency_end_date: [],
    contract_image: [],
    invoice_software_provider: [],
    invoice_software_fee: [],
    invoice_software_start_date: [],
    invoice_software_end_date: [],
    insurance_types: [],
    insured_count: [],
    social_insurance_agency_fee: [],
    social_insurance_start_date: [],
    social_insurance_end_date: [],
    statistical_report_fee: [],
    statistical_report_start_date: [],
    statistical_report_end_date: [],
    change_business_types: [],
    change_fee: [],
    other_business_types: [],
    other_business_fee: [],
    administrative_license_types: [],
    administrative_license_fee: [],
    charge_date: [
      { required: true, message: "请选择收费日期", trigger: "change" }
    ],
    charge_method: [
      { required: true, message: "请选择收费方式", trigger: "change" }
    ],
    license_type: [],
    license_fee: [],
    one_time_address_fee: [],
    brand_fee: [],
    seal_fee: [],
    proof_of_charge: [
      {
        required: true,
        message: "请上传至少一张收费凭证",
        trigger: "change",
        validator: (rule, value, callback) => {
          if (Array.isArray(value) && value.length > 0) {
            callback();
          } else {
            callback(new Error("请上传至少一张收费凭证"));
          }
        }
      }
    ]
  });

  const requiredRule = {
    required: true,
    message: "该字段为必项",
    trigger: "submit"
  };

  // 代理账签
  if (isAgencyAccountingFilled.value) {
    baseRule.business_type = [requiredRule];
    baseRule.agency_type = [requiredRule];
    baseRule.contract_type = [requiredRule];
    baseRule.agency_fee = [requiredRule];
    baseRule.accounting_software_fee = [requiredRule];
    baseRule.address_fee = [requiredRule];
    baseRule.agency_start_date = [requiredRule];
    baseRule.agency_end_date = [requiredRule];
    baseRule.contract_image = [requiredRule];
  }

  // 开票软件标签页
  if (isInvoiceSoftwareFilled.value) {
    baseRule.invoice_software_provider = [requiredRule];
    baseRule.invoice_software_fee = [requiredRule];
    baseRule.invoice_software_start_date = [requiredRule];
    baseRule.invoice_software_end_date = [requiredRule];
  }

  // 社保代理标签页
  if (isSocialInsuranceFilled.value) {
    baseRule.insurance_types = [requiredRule];
    baseRule.insured_count = [requiredRule];
    baseRule.social_insurance_agency_fee = [requiredRule];
    baseRule.social_insurance_start_date = [requiredRule];
    baseRule.social_insurance_end_date = [requiredRule];
  }

  // 统计报表标签页
  if (isStatisticalReportFilled.value) {
    baseRule.statistical_report_fee = [requiredRule];
    baseRule.statistical_report_start_date = [requiredRule];
    baseRule.statistical_report_end_date = [requiredRule];
  }

  // 变
  if (isChangeBusinessFilled.value) {
    baseRule.change_business_types = [requiredRule];
    baseRule.change_fee = [requiredRule];
  }

  // 其他业务标签页
  if (isOtherBusinessFilled.value) {
    baseRule.other_business_types = [requiredRule];
    baseRule.other_business_fee = [requiredRule];
  }

  // 行政许可标签页
  if (isAdministrativeLicenseFilled.value) {
    baseRule.administrative_license_types = [requiredRule];
    baseRule.administrative_license_fee = [requiredRule];
  }

  // 添加新办执照标签页的验逻辑
  if (isNewLicenseFilled.value) {
    baseRule.license_type = [requiredRule];
    baseRule.license_fee = [requiredRule];
    baseRule.one_time_address_fee = [requiredRule];
    baseRule.brand_fee = [requiredRule];
    baseRule.seal_fee = [requiredRule];
  }

  return baseRule;
});

// 使用计算属性作为表单的证规则
const ruleFormRef = ref<FormInstance>();

// 监听 localFormInline 的变化，更新文件列表
watch(
  () => localFormInline.value.proof_of_charge,
  newValue => {
    if (!Array.isArray(newValue)) {
      localFormInline.value.proof_of_charge = [];
    }
  },
  { immediate: true }
);

// 添加生成合同的方法
const generateContract = () => {
  console.log("生成合同");
  // 这里添加生成合同的逻辑
};

// 修改表单提交方法
const submitForm = async () => {
  if (!ruleFormRef.value) return false;
  const valid = await ruleFormRef.value.validate();
  if (valid) {
    return true;
  }
  return false;
};

// 修改 getFormData 方法
const getFormData = () => {
  const formData = { ...localFormInline.value };

  // 添加总费用
  formData.total_fee = totalFee.value;

  return formData;
};

// 修 defineExpose，添加 getFormData 方法
defineExpose({ submitForm, getFormData, getRef });

// 设置默认值
onMounted(() => {
  // 设置提交人为当前登录用户昵称
  localFormInline.value.submitter = userStore.nickname;

  // 设置收费日期默认为当天
  localFormInline.value.charge_date = new Date().toISOString().split("T")[0];
});

// 修改用户选项
const userOptions = ref([
  { label: userStore.nickname, value: userStore.nickname }
  // 可以添加其他用户选项，如果需要的话
]);

// 如果需要在脚本中用这些选项以定义一个常量
const businessTypeOptions = [
  { label: "新办业务", value: "新办业务" },
  { label: "续费业务", value: "续费业务" }
];

const agencyTypeOptions = [
  { label: "代理申报", value: "代理申报" },
  { label: "代理记账", value: "代理记账" }
];

const contractTypeOptions = [
  { label: "纸质合同", value: "纸质合同" },
  { label: "电子合同", value: "电子合同" }
];

// 添加企业类型选项
const companyTypeOptions = [
  { label: "一般纳税人", value: "一般纳税人" },
  { label: "小规模纳税人（公司）", value: "小规模纳税人（公司）" },
  { label: "小规模纳税人（个人）", value: "小规模纳税人（个人）" },
  { label: "其他", value: "其他" }
];

// 添加企业归属地选项
const companyLocationOptions = [
  { label: "定兴总公司", value: "定兴总公司" },
  { label: "雄安分公司", value: "雄安分公司" },
  { label: "高碑店分公司", value: "高碑店分公司" },
  { label: "其他", value: "他" }
];

// 如果需要可以添加日期选的相关逻辑
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now();
};

// 添加验证数字输入的方法
const validateNumber = field => {
  if (field === "insured_count") {
    localFormInline.value[field] = localFormInline.value[field].replace(
      /[^\d]/g,
      ""
    );
  } else {
    localFormInline.value[field] = localFormInline.value[field].replace(
      /[^\d.]/g,
      ""
    );
    if (localFormInline.value[field].split(".").length > 2) {
      localFormInline.value[field] = localFormInline.value[field].slice(0, -1);
    }
  }
};

// 添加收费方式选项
const chargeMethodOptions = [
  { label: "定兴中岳对公户", value: "定兴中岳对公户" },
  { label: "高碑店中岳对公户", value: "高碑店中岳对公户" },
  { label: "雄安中岳对公户", value: "雄安中岳对公户" },
  { label: "保定脉对公", value: "保定脉公" },
  { label: "定兴金盾对公户", value: "兴金盾对公户" },
  { label: "如你心意对公户", value: "如你心意对公户" },
  { label: "个人", value: "个人" }
];

// 为每个标签页添加费用小计的计算属性
const agencyAccountingSubtotal = computed(() => {
  const {
    agency_fee = 0,
    accounting_software_fee = 0,
    address_fee = 0
  } = localFormInline.value;
  return Math.round(
    Number(agency_fee) + Number(accounting_software_fee) + Number(address_fee)
  );
});

const invoiceSoftwareSubtotal = computed(() => {
  return Math.round(Number(localFormInline.value.invoice_software_fee || 0));
});

const socialInsuranceSubtotal = computed(() => {
  return Math.round(
    Number(localFormInline.value.social_insurance_agency_fee || 0)
  );
});

const statisticalReportSubtotal = computed(() => {
  return Math.round(Number(localFormInline.value.statistical_report_fee || 0));
});

const changeSubtotal = computed(() => {
  return Math.round(Number(localFormInline.value.change_fee || 0));
});

const administrativeLicenseSubtotal = computed(() => {
  return Math.round(
    Number(localFormInline.value.administrative_license_fee || 0)
  );
});

const otherBusinessSubtotal = computed(() => {
  return Math.round(Number(localFormInline.value.other_business_fee || 0));
});

// 添加开票软件服务商选
const invoiceSoftwareProviderOptions = [
  { label: "亿企赢", value: "亿企" },
  { label: "云账房", value: "云账房" },
  { label: "航信365", value: "航信365" }
];

// 添加查新办执照签页是否有字段被填写的计算属性
const isNewLicenseFilled = computed(() => {
  const {
    license_type,
    license_fee,
    one_time_address_fee,
    brand_fee,
    seal_fee
  } = localFormInline.value;
  return (
    !!license_type ||
    !!license_fee ||
    !!one_time_address_fee ||
    !!brand_fee ||
    !!seal_fee
  );
});

function getRef() {
  return ruleFormRef.value;
}

// 添加办照类选项
const licenseTypeOptions = [
  { label: "个体", value: "个体" },
  { label: "公司", value: "公司" },
  { label: "合作社", value: "合作社" },
  { label: "个人独资企业", value: "个人独资企业" },
  { label: "补领执照", value: "补领执照" }
];

// 使用新的 upload hook
const { getUploadDirectory, handleBeforeUpload } =
  useExpenseUpload(localFormInline);

// 添加状态文本和类型的方法
const getStatusText = status => {
  const statusMap = {
    0: "未审核",
    1: "已通过",
    2: "已拒绝"
  };
  return statusMap[status] || "未知状态";
};
</script>
<template>
  <el-form
    ref="ruleFormRef"
    :model="localFormInline"
    :rules="dynamicRule"
    label-width="120px"
    class="expense-form"
    :validate-on-rule-change="false"
  >
    <!-- 当前状态和拒绝原因显示 -->
    <div class="status-and-reason">
      <div v-if="localFormInline.status !== undefined" class="status-display">
        <span class="status-label">当前状态：</span>
        <span :class="['status-value', `status-${localFormInline.status}`]">
          {{ getStatusText(localFormInline.status) }}
        </span>
      </div>
      <div
        v-if="localFormInline.status === 2 && localFormInline.rejectReason"
        class="reject-reason"
      >
        <span class="reject-reason-label">拒绝原因：</span>
        <span class="reject-reason-value">{{
          localFormInline.rejectReason
        }}</span>
      </div>
    </div>

    <el-card class="form-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="企业名称" prop="company_name" required>
            <el-select
              v-model="localFormInline.company_name"
              filterable
              remote
              reserve-keyword
              placeholder="请输入企业名称"
              :remote-method="remoteMethod"
              :loading="loadingCompanyOptions"
            >
              <el-option
                v-for="item in companyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="企业类型" prop="company_type" required>
            <el-select
              v-model="localFormInline.company_type"
              placeholder="请选择企业类型"
            >
              <el-option
                v-for="option in companyTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="企业归属地" prop="company_location" required>
            <el-select
              v-model="localFormInline.company_location"
              placeholder="请选择企业归属地"
            >
              <el-option
                v-for="option in companyLocationOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="收费日期" prop="charge_date" required>
            <el-date-picker
              v-model="localFormInline.charge_date"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择收费日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="收费方式" prop="charge_method" required>
            <el-select
              v-model="localFormInline.charge_method"
              placeholder="请选择收费方式"
            >
              <el-option
                v-for="option in chargeMethodOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="提交人" prop="submitter" required>
            <el-select
              v-model="localFormInline.submitter"
              placeholder="请选择提交人"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.value"
                :label="user.label"
                :value="user.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="收费凭证" prop="proof_of_charge">
        <Uploader
          v-model="localFormInline.proof_of_charge"
          :directory="getUploadDirectory()"
          :before-upload="handleBeforeUpload"
          :max-count="3"
          :accept="['image/jpeg', 'image/png']"
          image-only
          name="收费凭证"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="localFormInline.remarks" type="textarea" :rows="3" />
      </el-form-item>
    </el-card>

    <el-card class="form-card">
      <el-tabs v-model="activeTab" type="border-card" class="form-tabs">
        <el-tab-pane
          :label="`代理记账 (￥${agencyAccountingSubtotal})`"
          name="agencyAccounting"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="业务类型" prop="business_type">
                <el-select
                  v-model="localFormInline.business_type"
                  placeholder="请选择业务类型"
                >
                  <el-option
                    v-for="option in businessTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="代理类型" prop="agency_type">
                <el-select
                  v-model="localFormInline.agency_type"
                  placeholder="请选择代理类"
                >
                  <el-option
                    v-for="option in agencyTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同类型" prop="contract_type">
                <el-select
                  v-model="localFormInline.contract_type"
                  placeholder="请选择合同类型"
                >
                  <el-option
                    v-for="option in contractTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="代理费" prop="agency_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.agency_fee"
                    placeholder="请入代理费"
                    class="custom-input"
                    @input="validateNumber('agency_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="记账软件费" prop="accounting_software_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.accounting_software_fee"
                    placeholder="请输入记账软件费"
                    class="custom-input"
                    @input="validateNumber('accounting_software_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="地址费" prop="address_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.address_fee"
                    placeholder="输入地址费"
                    class="custom-input"
                    @input="validateNumber('address_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="代理开始日期" prop="agency_start_date">
                <el-date-picker
                  v-model="localFormInline.agency_start_date"
                  type="month"
                  placeholder="选择开始年月"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="代理结束日期" prop="agency_end_date">
                <el-date-picker
                  v-model="localFormInline.agency_end_date"
                  type="month"
                  placeholder="选择结束年月"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item
            :label="
              localFormInline.contract_type === '纸质合同'
                ? '纸质合同'
                : '电子合同'
            "
            prop="contract_image"
          >
            <template v-if="localFormInline.contract_type === '纸质合同'">
              <el-form-item prop="contract_image">
                <Uploader
                  v-model="localFormInline.contract_image"
                  :directory="getUploadDirectory()"
                  :before-upload="handleBeforeUpload"
                  :max-count="3"
                  :accept="['image/jpeg', 'image/png']"
                  image-only
                  name="合同图片"
                />
              </el-form-item>
            </template>
            <template v-else-if="localFormInline.contract_type === '电子合同'">
              <el-button type="primary" @click="generateContract">
                生成合同
              </el-button>
            </template>
          </el-form-item>
        </el-tab-pane>
        <!-- 开票软件标签页 -->
        <el-tab-pane
          :label="`开软件 (￥${invoiceSoftwareSubtotal})`"
          name="invoiceSoftware"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="开票软件提供商"
                prop="invoice_software_provider"
              >
                <el-select
                  v-model="localFormInline.invoice_software_provider"
                  placeholder="请选开票软件提供商"
                >
                  <el-option
                    v-for="option in invoiceSoftwareProviderOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开票软件用" prop="invoice_software_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.invoice_software_fee"
                    placeholder="请开票软件费用"
                    class="custom-input"
                    @input="validateNumber('invoice_software_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="开票开始日期"
                prop="invoice_software_start_date"
              >
                <el-date-picker
                  v-model="localFormInline.invoice_software_start_date"
                  type="month"
                  placeholder="选择始年月"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="开票结束日期"
                prop="invoice_software_end_date"
              >
                <el-date-picker
                  v-model="localFormInline.invoice_software_end_date"
                  type="month"
                  placeholder="选择结束年"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 社保代理标签页 -->
        <el-tab-pane
          :label="`社保代理 (￥${socialInsuranceSubtotal})`"
          name="socialInsuranceAgency"
        >
          <el-row :gutter="20">
            <el-col :span="16">
              <el-form-item label="参保险种" prop="insurance_types">
                <el-select
                  v-model="localFormInline.insurance_types"
                  multiple
                  placeholder="请选择参保险"
                  style="width: 100%"
                >
                  <el-option label="养老保险" value="养老保险" />
                  <el-option label="医疗保险" value="医疗保险" />
                  <el-option label="失业保险" value="失业保险" />
                  <el-option label="工伤保险" value="工伤保险" />
                  <el-option label="生育保险" value="生育保险" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="参保人数" prop="insured_count">
                <el-input
                  v-model="localFormInline.insured_count"
                  placeholder="请输入参保人数"
                  class="custom-input"
                  @input="validateNumber('insured_count')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item
                label="社保代理费"
                prop="social_insurance_agency_fee"
              >
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.social_insurance_agency_fee"
                    placeholder="请输入社保代理费"
                    class="custom-input"
                    @input="validateNumber('social_insurance_agency_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="社保开始日期"
                prop="social_insurance_start_date"
              >
                <el-date-picker
                  v-model="localFormInline.social_insurance_start_date"
                  type="month"
                  placeholder="选择社保开始年月"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="社保结束日期"
                prop="social_insurance_end_date"
              >
                <el-date-picker
                  v-model="localFormInline.social_insurance_end_date"
                  type="month"
                  placeholder="选择社保结束年月"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 统计报表标签页 -->
        <el-tab-pane
          :label="`统计报表 (￥${statisticalReportSubtotal})`"
          name="statisticalReport"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="统计局报表费" prop="statistical_report_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.statistical_report_fee"
                    placeholder="请输入统计局报表费"
                    class="custom-input"
                    @input="validateNumber('statistical_report_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="统计开始日期"
                prop="statistical_report_start_date"
              >
                <el-date-picker
                  v-model="localFormInline.statistical_report_start_date"
                  type="month"
                  placeholder="选择开始年月"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="统计结束日期"
                prop="statistical_report_end_date"
              >
                <el-date-picker
                  v-model="localFormInline.statistical_report_end_date"
                  type="month"
                  placeholder="选择结束年月"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
        <!-- 新增新办执照标签页 -->
        <el-tab-pane
          :label="`新办执照 (￥${newLicenseSubtotal})`"
          name="newLicense"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="办照类型" prop="license_type">
                <el-select
                  v-model="localFormInline.license_type"
                  placeholder="请选择办照类型"
                >
                  <el-option
                    v-for="option in licenseTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="办照费用" prop="license_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.license_fee"
                    placeholder="请输入办照费用"
                    class="custom-input"
                    @input="validateNumber('license_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="一次性地址费" prop="one_time_address_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.one_time_address_fee"
                    placeholder="请输入一次性地址费"
                    class="custom-input"
                    @input="validateNumber('one_time_address_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="牌费" prop="brand_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.brand_fee"
                    placeholder="请输入牌子费"
                    class="custom-input"
                    @input="validateNumber('brand_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="刻章费" prop="seal_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.seal_fee"
                    placeholder="请输入刻章费"
                    class="custom-input"
                    @input="validateNumber('seal_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
        <!-- 变更业务标签页 -->
        <el-tab-pane
          :label="`变更业务 (￥${changeSubtotal})`"
          name="changeBusiness"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="变更业务" prop="change_business">
                <el-select
                  v-model="localFormInline.change_business"
                  multiple
                  placeholder="请选择变更业务"
                  style="width: 100%"
                >
                  <el-option label="变更名称" value="变更名称" />
                  <el-option label="变更地址" value="变更地址" />
                  <el-option label="变更范围" value="变更范围" />
                  <el-option label="变更转股" value="变更转股" />
                  <el-option label="变更法人" value="变更法人" />
                  <el-option label="变更监事" value="变更监事" />
                  <el-option label="变更注册资本" value="变更注册资本" />
                  <el-option label="跨域变更" value="跨域变更" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="变更收费" prop="change_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.change_fee"
                    placeholder="请输入变更收费"
                    class="custom-input"
                    @input="validateNumber('change_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 行政许可标签页 -->
        <el-tab-pane
          :label="`行政许可 (￥${administrativeLicenseSubtotal})`"
          name="administrativeLicense"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="行政许可" prop="administrative_license">
                <el-select
                  v-model="localFormInline.administrative_license"
                  multiple
                  placeholder="请选择行政许可"
                  style="width: 100%"
                >
                  <el-option label="食品经营许可证" value="食品经营许可证" />
                  <el-option label="卫生许可证" value="卫生许可证" />
                  <el-option label="餐饮服务许可证" value="餐饮服务许可证" />
                  <el-option label="小作坊" value="作坊" />
                  <el-option label="道路运输许可证" value="道路运许可证" />
                  <el-option
                    label="二类医疗器械备案"
                    value="二类医疗器械备案"
                  />
                  <el-option label="预包装食品备案" value="预包装食品备案" />
                  <el-option label="预付卡备案" value="预付卡备案" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="行政许可收费"
                prop="administrative_license_fee"
              >
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.administrative_license_fee"
                    placeholder="请输入行政许可收费"
                    class="custom-input"
                    @input="validateNumber('administrative_license_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 其他业务标签页 -->
        <el-tab-pane
          :label="`其他业务 (￥${otherBusinessSubtotal})`"
          name="otherBusiness"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="其他业务" prop="other_business">
                <el-select
                  v-model="localFormInline.other_business"
                  multiple
                  placeholder="请选择其他业务"
                  style="width: 100%"
                >
                  <el-option label="审计" value="审计" />
                  <el-option label="评估" value="评估" />
                  <el-option label="检测报告" value="检测报告" />
                  <el-option label="商标" value="商标" />
                  <el-option label="条形码" value="条形码" />
                  <el-option label="工商异常" value="工商异常" />
                  <el-option label="税务异常" value="税务异常" />
                  <el-option label="工商年检" value="工商年检" />
                  <el-option label="工商注销" value="工商注销" />
                  <el-option label="税务注销" value="税务注销" />
                  <el-option label="补充申报" value="补充申报" />
                  <el-option label="公司转让" value="公司转让" />
                  <el-option label="代收费用" value="代收费用" />
                  <el-option label="出口税" value="出口税" />
                  <el-option label="银行融资" value="银行融资" />
                  <el-option label="贷款" value="贷款" />
                  <el-option label="资质办理" value="资质办理" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="其他业务收费" prop="other_business_fee">
                <div class="input-with-prefix">
                  <span class="prefix">￥</span>
                  <el-input
                    v-model="localFormInline.other_business_fee"
                    placeholder="请输入其他业务收费"
                    class="custom-input"
                    @input="validateNumber('other_business_fee')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <el-divider content-position="right">总费用</el-divider>
      <div class="total-fee">
        总费用：<span>￥{{ totalFee }}</span>
      </div>
    </el-card>
  </el-form>
</template>

<style scoped>
.expense-form {
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
}

.form-card {
  margin-bottom: 20px;
}

.form-tabs {
  margin-bottom: 20px;
}

.el-divider {
  margin: 24px 0;
}

.total-fee {
  font-size: 20px;
  font-weight: bold;
  text-align: right;
}

.total-fee span {
  color: #f56c6c;
  margin-left: 10px;
}

/* 其他样式保不变 */

.custom-input {
  width: 100%;
}

.custom-input :deep(.el-input__inner) {
  padding-left: 10px;
  text-align: left;
}

/* 确保占位文本左对齐 */
.custom-input :deep(.el-input__inner::placeholder) {
  text-align: left;
}

/* ... 其他样式保持变 ... */

.custom-input-number {
  width: 100%;
}

.custom-input-number :deep(.el-input__inner) {
  padding-left: 25px !important;
  text-align: left !important;
}

.custom-input-number :deep(.el-input__prefix) {
  left: 5px !important;
}

.input-prefix {
  color: #90939d;
}

/* 确保占位符文本左对齐 */
.custom-input-number :deep(.el-input__inner::placeholder) {
  text-align: left !important;
}

/* ... 其他样式保持不 ... */

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix {
  position: absolute;
  left: 5px;
  color: #909399;
  z-index: 1;
}

.custom-input {
  flex: 1;
}

.custom-input :deep(.el-input__inner) {
  padding-left: 20px;
  text-align: left;
}

/* 确保占位符文本左对齐 */
.custom-input :deep(.el-input__inner::placeholder) {
  text-align: left;
}

.small-upload {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }
  /* 隐藏上传成功的对勾图标 */
  :deep(.el-upload-list__item-status-label) {
    display: none !important;
  }
  /* 调整预览和删除图标的颜色和背景 */
  :deep(.el-upload-list__item-actions) {
    background-color: rgba(0, 0, 0, 0.6);
  }
  :deep(.el-upload-list__item-delete),
  :deep(.el-upload-list__item-preview) {
    color: #ffffff !important;
  }
}

/* 调整上传区域的图标大小 */
.small-upload :deep(.el-icon) {
  font-size: 20px;
  color: #8c939d;
}

/* ... 其他样式保持不变 ... */

.image-upload-container {
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.image-uploader {
  width: 150px;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader {
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: contain;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.button-group .el-button {
  width: 100px;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.operation-icon {
  font-size: 20px;
  color: #fff;
  margin: 0 10px;
  cursor: pointer;
}

.operation-icon:hover {
  transform: scale(1.2);
}

.proof-of-charge-container {
  display: flex;
  gap: 10px;
}

.avatar-uploader {
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: contain;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.operation-icon {
  font-size: 20px;
  color: #fff;
  margin: 0 10px;
  cursor: pointer;
}

.operation-icon:hover {
  transform: scale(1.2);
}

.status-and-reason {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.status-display,
.reject-reason {
  display: flex;
  align-items: center;
}

.status-display {
  margin-right: 40px; /* 增加右侧间距 */
}

.status-label,
.reject-reason-label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266; /* 设置标文字颜色，与 Element Plus 默认文字颜色一致 */
}

.status-value,
.reject-reason-value {
  font-weight: bold;
}

.status-0 {
  color: #909399; /* 灰色 */
}

.status-1 {
  color: #67c23a; /* 绿色 */
}

.status-2 {
  color: #f56c6c; /* 红色 */
}

.reject-reason-value {
  color: #f56c6c; /* 红色，只对拒绝原因值应用红色 */
}

/* 添加 loading 遮罩样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-overlay .el-icon {
  font-size: 24px;
  color: #409eff;
}

/* 添加 loading 动画 */
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
