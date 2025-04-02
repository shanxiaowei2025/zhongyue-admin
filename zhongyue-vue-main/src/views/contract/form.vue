<template>
  <div class="contract-content">
    <el-form ref="formRef" :model="newFormInline" label-width="120px">
      <!-- 合同类型和页码控制区域 -->
      <div class="contract-header">
        <el-form-item label="合同类型" class="contract-type-item">
          <el-radio-group
            v-model="newFormInline.business_type"
            class="contract-type-group"
          >
            <el-radio-button
              v-for="type in contractTypes"
              :key="type.value"
              :label="type.value"
            >
              {{ type.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="page-control">
          <el-radio-group v-model="currentPage" class="page-radio-group">
            <el-radio-button v-for="page in maxPages" :key="page" :label="page">
              第{{ page }}页
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 动态加载合同组件 -->
      <component
        :is="currentContractComponent"
        ref="contractComponentRef"
        :form-data="newFormInline"
        :current-page="currentPage"
        @update:form-data="handleFormDataUpdate"
      />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { FormProps, FormItemProps } from "./utils/types";
import { ContractStatus, BusinessType } from "./utils/types";
import AgencyContract from "./agency-contract.vue";
import SocialContract from "./social-contract.vue";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";

// Props 定义
const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    contract_no: "",
    business_type: BusinessType.Agency,
    customer_name: "",
    customer_code: "",
    customer_address: "",
    customer_phone: "",
    customer_contact: "",
    company_name: "",
    company_code: "",
    company_address: "",
    company_phone: "",
    submitter: "",
    business_person: "",
    amount: null,
    sign_date: "",
    start_date: "",
    expire_date: "",
    status: ContractStatus.Unsigned,
    remark: "",
    contract_files: []
  })
});

// Emits 定义
const emit = defineEmits<{
  "update:formInline": [value: FormItemProps];
}>();

// 响应式数据
const formRef = ref();
const newFormInline = ref<FormItemProps>({
  ...props.formInline
});
const currentPage = ref(1);

// 合同类型配置
const contractTypes = [
  { label: "代理记账合同", value: "代理记账合同" },
  { label: "社保代理合同", value: "社保代理合同" }
];

// 计算属性
const currentContractComponent = computed(() => {
  return newFormInline.value.business_type === "代理记账合同"
    ? AgencyContract
    : SocialContract;
});

const maxPages = computed(() => {
  return newFormInline.value.business_type === "代理记账合同" ? 2 : 3;
});

// 方法定义
const handleFormDataUpdate = (value: FormItemProps) => {
  newFormInline.value = value;
  emit("update:formInline", value);
};

// 监听合同类型变化，重置页码
watch(
  () => newFormInline.value.business_type,
  () => {
    currentPage.value = 1;
  }
);

// 添加状态自动更新逻辑
watch(
  [
    () => newFormInline.value.start_date,
    () => newFormInline.value.expire_date,
    () => newFormInline.value.sign_date
  ],
  ([startDate, expireDate, signDate]) => {
    if (!startDate || !expireDate) return;

    const now = new Date();
    const start = new Date(startDate);
    const expire = new Date(expireDate);

    if (!signDate) {
      newFormInline.value.status = ContractStatus.Unsigned;
    } else if (expire < now) {
      newFormInline.value.status = ContractStatus.Expired;
    } else if (start <= now && now <= expire) {
      newFormInline.value.status = ContractStatus.Active;
    } else {
      newFormInline.value.status = ContractStatus.Unsigned;
    }
  }
);

// 添加对子组件的引用
const contractComponentRef = ref();

// 修改验证方法
const validate = async () => {
  try {
    if (!contractComponentRef.value) return false;

    // 调用子组件的验证方法
    const isValid = await contractComponentRef.value.validate();
    if (!isValid) return false;

    // 验证通过后返回完整的表单数据
    return {
      ...newFormInline.value,
      amount: Number(newFormInline.value.amount || 0),
      contract_files: newFormInline.value.contract_files || []
    };
  } catch (error) {
    console.error("表单验证错误:", error);
    return false;
  }
};

// 导出验证方法
defineExpose({
  validate
});
</script>

<style lang="scss" scoped>
.contract-content {
  min-height: calc(100vh - 84px);
  padding: 20px;
  background-color: #f5f7fa;

  // 响应式布局
  @media screen and (width <= 768px) {
    padding: 12px;

    .contract-header {
      flex-direction: column;
      align-items: stretch;
      padding: 12px 16px;

      .contract-type-item {
        min-width: auto;
      }

      .page-control {
        justify-content: center;

        .page-radio-group {
          display: flex;
          width: 100%;

          :deep(.el-radio-button__inner) {
            flex: 1;
            padding: 6px 16px;
          }
        }
      }
    }

    .contract-type-group {
      :deep(.el-radio-button__inner) {
        padding: 6px 16px;
      }
    }
  }

  // 新增 header 区域样式
  .contract-header {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    margin-bottom: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

    .contract-type-item {
      flex: 1;
      min-width: 300px;
      margin-bottom: 0;

      :deep(.el-form-item__label) {
        font-weight: 600;
        color: #303133;
      }

      .contract-type-group {
        :deep(.el-radio-button__inner) {
          padding: 8px 24px;
          font-size: 14px;
        }
      }
    }

    // 调整页码控制样式
    .page-control {
      display: flex;
      align-items: center;

      .page-radio-group {
        :deep(.el-radio-button__inner) {
          padding: 8px 24px;
          font-size: 14px;
        }
      }
    }
  }

  // 表单整体样式
  :deep(.el-form) {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}
</style>
