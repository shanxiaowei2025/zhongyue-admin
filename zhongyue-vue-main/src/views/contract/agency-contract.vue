<template>
  <el-form
    ref="agencyFormRef"
    :model="formData"
    :rules="rules"
    class="contract-content"
    :validate-on-rule-change="false"
  >
    <!-- 合同内容区域 -->
    <div class="contract-content">
      <!-- 第一页 -->
      <div v-show="currentPage === 1" class="contract-page">
        <!-- 合同标题 -->
        <div class="contract-header">
          <h1 class="main-title">代理记账合同</h1>
          <!-- 合同编号 -->
          <div class="contract-no-section">
            <div class="contract-no">
              <span class="contract-no__label">合同编号：</span>
              <el-form-item prop="contract_no" class="form-item-wrapper">
                <span class="contract-no__value">{{
                  formData.contract_no
                }}</span>
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- 合同双方信息 -->
        <div class="contract-parties">
          <div class="parties-content">
            <!-- 甲方信息块 -->
            <div class="party-block">
              <div class="party-title">甲方</div>
              <div class="party-info">
                <div class="info-item">
                  <span class="label">名称：</span>
                  <el-form-item prop="customer_name" class="form-item-wrapper">
                    <el-popover
                      v-model:visible="customerPopoverVisible"
                      placement="bottom-start"
                      :width="300"
                      trigger="click"
                      popper-class="select-dropdown"
                    >
                      <template #reference>
                        <span
                          class="editable"
                          :class="{ 'invalid-input': isInvalidCustomer }"
                          contenteditable="true"
                          @input="handleCustomerInput"
                          >{{ formData.customer_name }}</span
                        >
                      </template>

                      <div class="select-dropdown__list" @scroll="handleScroll">
                        <template v-if="!loading">
                          <div
                            v-for="item in customerList"
                            :key="item.id"
                            class="select-dropdown__item"
                            @click="handleCustomerSelect(item)"
                          >
                            {{ item.company_name }}
                          </div>
                          <div
                            v-if="customerList.length === 0"
                            class="select-dropdown__item select-dropdown__item--empty"
                          >
                            暂无匹配客户
                          </div>
                          <div
                            v-if="isLoadingMore"
                            class="select-dropdown__item select-dropdown__item--loading"
                          >
                            <el-icon class="is-loading"><Loading /></el-icon>
                            加载更多...
                          </div>
                        </template>
                        <div
                          v-else
                          class="select-dropdown__item select-dropdown__item--empty"
                        >
                          <el-icon class="is-loading"><Loading /></el-icon>
                          加载中...
                        </div>
                      </div>
                    </el-popover>
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">统一社会信用代码：</span>
                  <el-form-item prop="customer_code" class="form-item-wrapper">
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'customer_code',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.customer_code }}</span
                    >
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">地址：</span>
                  <el-form-item
                    prop="customer_address"
                    class="form-item-wrapper"
                  >
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'customer_address',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.customer_address }}</span
                    >
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">电话：</span>
                  <el-form-item prop="customer_phone" class="form-item-wrapper">
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'customer_phone',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.customer_phone }}</span
                    >
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">联系人：</span>
                  <el-form-item
                    prop="customer_contact"
                    class="form-item-wrapper"
                  >
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'customer_contact',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.customer_contact }}</span
                    >
                  </el-form-item>
                </div>
              </div>
            </div>

            <!-- 乙方信息块 -->
            <div class="party-block">
              <div class="party-title">乙方</div>
              <div class="party-info">
                <div class="info-item">
                  <span class="label">名称：</span>
                  <el-form-item prop="company_name" class="form-item-wrapper">
                    <el-popover
                      v-model:visible="companyPopoverVisible"
                      placement="bottom-start"
                      :width="300"
                      trigger="click"
                      popper-class="select-dropdown"
                    >
                      <template #reference>
                        <span
                          class="editable"
                          :class="{ 'invalid-input': isInvalidCompany }"
                          contenteditable="true"
                          @input="handleCompanyInput"
                          >{{ formData.company_name }}</span
                        >
                      </template>

                      <div class="select-dropdown__list">
                        <div
                          v-for="item in filteredCompanies"
                          :key="item.id"
                          class="select-dropdown__item"
                          @click="handleCompanySelect(item)"
                        >
                          {{ item.company_name }}
                        </div>
                        <div
                          v-if="filteredCompanies.length === 0"
                          class="select-dropdown__item select-dropdown__item--empty"
                        >
                          暂无匹配公司
                        </div>
                      </div>
                    </el-popover>
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">统一社会信用代码：</span>
                  <el-form-item prop="company_code" class="form-item-wrapper">
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'company_code',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.company_code }}</span
                    >
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">地址：</span>
                  <el-form-item
                    prop="company_address"
                    class="form-item-wrapper"
                  >
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'company_address',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.company_address }}</span
                    >
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">电话：</span>
                  <el-form-item prop="company_phone" class="form-item-wrapper">
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'company_phone',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.company_phone }}</span
                    >
                  </el-form-item>
                </div>
                <div class="info-item">
                  <span class="label">业务人：</span>
                  <el-form-item
                    prop="business_person"
                    class="form-item-wrapper"
                  >
                    <span
                      class="editable"
                      contenteditable="true"
                      @input="
                        e =>
                          handleInputUpdate(
                            'business_person',
                            (e.target as HTMLElement).textContent || ''
                          )
                      "
                      >{{ formData.business_person }}</span
                    >
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 合同前言 -->
        <div class="contract-preamble">
          <p>
            根据《中华人民共和国民法典》及《代理记账管理办法》等法律、法规，遵循平等、自愿、公平、诚实、信用原则，双方就乙方为甲方提供财务相关服务，经协商一致，订立本合同。
          </p>
        </div>

        <!-- 第一条服务内容 -->
        <div class="contract-section">
          <h3>第一条 委托服务内容（请勾选）</h3>
          <!-- 这里添加服务内容的具体实现 -->
        </div>

        <!-- 合同日期和金额部分 -->
        <div class="date-amount-section">
          <p class="date-amount-content">
            合同开始日期
            <el-form-item prop="start_date" class="form-item-wrapper">
              <el-date-picker
                v-model="localFormData.start_date"
                type="date"
                placeholder="选择开始日期"
                format="YYYY年MM月DD日"
                value-format="YYYY-MM-DD"
                :prefix-icon="null"
                @update:modelValue="handleDateUpdate('start_date', $event)"
              />
            </el-form-item>
            ， 合同结束日期
            <el-form-item prop="expire_date" class="form-item-wrapper">
              <el-date-picker
                v-model="localFormData.expire_date"
                type="date"
                placeholder="选择结束日期"
                format="YYYY年MM月DD日"
                value-format="YYYY-MM-DD"
                :prefix-icon="null"
                @update:modelValue="handleDateUpdate('expire_date', $event)"
              />
            </el-form-item>
            ， 合同金额：
            <el-form-item prop="amount" class="form-item-wrapper">
              <el-input-number
                v-model="localFormData.amount"
                :min="0"
                :precision="2"
                :step="1000"
                class="amount-input"
                placeholder="请输入合同金额"
                @update:modelValue="handleAmountUpdate"
              />
            </el-form-item>
            元。
          </p>
        </div>

        <!-- 签字部分 -->
        <div class="signatures-section">
          <div class="signatures-grid">
            <!-- 甲方签字 -->
            <div class="signature-block">
              <div class="signature-title">甲方：</div>
              <div class="signature-line" />
              <div class="signature-date">
                <span class="date-label">签订日期：</span>
                <el-form-item prop="sign_date" class="form-item-wrapper">
                  <el-date-picker
                    v-model="localFormData.sign_date"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY年MM月DD日"
                    value-format="YYYY-MM-DD"
                    :prefix-icon="null"
                    @update:modelValue="handleDateUpdate('sign_date', $event)"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 乙方签字 -->
            <div class="signature-block">
              <div class="signature-title">乙方（盖章）：</div>
              <div class="signature-line" />
              <div class="signature-date">
                <span class="date-label">签订日期：</span>
                <el-form-item prop="sign_date" class="form-item-wrapper">
                  <el-date-picker
                    v-model="localFormData.sign_date"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY年MM月DD日"
                    value-format="YYYY-MM-DD"
                    :prefix-icon="null"
                    @update:modelValue="handleDateUpdate('sign_date', $event)"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二页 -->
      <div v-show="currentPage === 2" class="contract-page">
        <!-- 代理记账合同第二页内容 -->
      </div>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Loading } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import type { RuleType } from "async-validator";
import type { FormItemProps, CustomerInfo, CompanyInfo } from "./utils/types";
import { getCustomerList } from "@/api/customer";

const props = defineProps<{
  formData: FormItemProps;
  currentPage: number;
}>();

const emit = defineEmits<{
  "update:formData": [value: FormItemProps];
}>();

// 表单引用
const agencyFormRef = ref<FormInstance>();

// 完整的表单验证规则
const rules: FormRules = {
  // 合同基本信息验证
  contract_no: [{ required: true, message: "请输入合同编号", trigger: "blur" }],
  business_type: [
    { required: true, message: "请选择合同类型", trigger: "change" }
  ],

  // 甲方信息验证
  customer_name: [
    { required: true, message: "请选择客户名称", trigger: "change" }
  ],
  customer_code: [
    { required: true, message: "请输入统一社会信用代码", trigger: "blur" },
    {
      pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
      message: "请输入正确的统一社会信用代码",
      trigger: "blur"
    }
  ],
  customer_address: [
    { required: true, message: "请输入客户地址", trigger: "blur" }
  ],
  customer_phone: [
    { required: true, message: "请输入客户电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ],
  customer_contact: [
    { required: true, message: "请输入客户联系人", trigger: "blur" }
  ],

  // 乙方信息验证
  company_name: [
    { required: true, message: "请选择公司名称", trigger: "change" }
  ],
  company_code: [
    { required: true, message: "请输入公司统一社会信用代码", trigger: "blur" },
    {
      pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
      message: "请输入正确的统一社会信用代码",
      trigger: "blur"
    }
  ],
  company_address: [
    { required: true, message: "请输入公司地址", trigger: "blur" }
  ],
  company_phone: [
    { required: true, message: "请输入公司电话", trigger: "blur" }
  ],
  business_person: [
    { required: true, message: "请输入业务人员", trigger: "blur" }
  ],

  // 合同日期和金额验证
  start_date: [
    { required: true, message: "请选择开始日期", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("请选择开始日期"));
        } else if (
          props.formData.expire_date &&
          new Date(value) >= new Date(props.formData.expire_date)
        ) {
          callback(new Error("开始日期必须早于结束日期"));
        } else {
          callback();
        }
      },
      trigger: "change"
    }
  ],
  expire_date: [
    { required: true, message: "请选择结束日期", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("请选择结束日期"));
        } else if (
          props.formData.start_date &&
          new Date(value) <= new Date(props.formData.start_date)
        ) {
          callback(new Error("结束日期必须晚于开始日期"));
        } else {
          callback();
        }
      },
      trigger: "change"
    }
  ],
  sign_date: [{ required: true, message: "请选择签订日期", trigger: "change" }],
  amount: [
    { required: true, message: "请输入合同金额", trigger: "blur" },
    {
      type: "number" as RuleType,
      min: 0,
      message: "合同金额不能小于0",
      trigger: "blur"
    }
  ],

  // 合同服务内容验证
  service_content: [
    { required: true, message: "请输入服务内容", trigger: "blur" }
  ],
  service_requirements: [
    { required: true, message: "请输入服务要求", trigger: "blur" }
  ],
  payment_terms: [
    { required: true, message: "请输入付款条件", trigger: "blur" }
  ]
};

// 验证方法
const validate = async () => {
  if (!agencyFormRef.value) return false;
  try {
    await agencyFormRef.value.validate();
    // 额外验证：确保日期逻辑正确
    const { start_date, expire_date } = props.formData;
    if (start_date && expire_date) {
      const startDate = new Date(start_date);
      const expireDate = new Date(expire_date);

      if (startDate >= expireDate) {
        throw new Error("开始日期必须早于结束日期");
      }
    }
    return true;
  } catch (error) {
    console.error("代理合同表单验证错误:", error);
    return false;
  }
};

// 创建本地响应式数据副本
const localFormData = ref<FormItemProps>({ ...props.formData });

// 客户选择相关
const customerList = ref<CustomerInfo[]>([]);
const loading = ref(false);
const customerPage = ref(1);
const customerPageSize = ref(10);
const customerTotal = ref(0);
const isLoadingMore = ref(false);
const searchKeyword = ref("");
const customerPopoverVisible = ref(false);
const companyPopoverVisible = ref(false);
const companySearchKeyword = ref(""); // 添加公司搜索关键词

// 公司列表数据
const companyList = ref<CompanyInfo[]>([
  {
    id: 1,
    company_name: "定兴县中岳会计服务有限公司",
    company_code: "91130626598283956U",
    company_address: "定兴县佶地国际D区120号",
    company_phone: "0312-6789888",
    business_person: "张三"
  }
]);

// 过滤后的客户列表
const filteredCustomers = computed(() => {
  return customerList.value;
});

// 过滤后的公司列表
const filteredCompanies = computed(() => {
  const keyword = companySearchKeyword.value.toLowerCase();
  return keyword
    ? companyList.value.filter(company =>
        company.company_name.toLowerCase().includes(keyword)
      )
    : companyList.value;
});

// 获取客户列表
const fetchCustomers = async (keyword: string = "", loadMore = false) => {
  loading.value = true;
  try {
    const response = await getCustomerList({
      companyName: keyword,
      page: loadMore ? customerPage.value : 1,
      pageSize: customerPageSize.value
    });

    if (response.success && response.data) {
      if (loadMore) {
        customerList.value = [...customerList.value, ...response.data.list];
      } else {
        customerList.value = response.data.list;
        customerPage.value = 1;
      }
      customerTotal.value = response.data.total;
    }
  } catch (error) {
    console.error("获取客户列表失败:", error);
  } finally {
    loading.value = false;
    isLoadingMore.value = false;
  }
};

// 处理滚动加载
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target) return;

  const isBottom =
    target.scrollHeight - target.scrollTop - target.clientHeight < 20;

  if (
    isBottom &&
    !loading.value &&
    !isLoadingMore.value &&
    customerList.value.length < customerTotal.value
  ) {
    isLoadingMore.value = true;
    customerPage.value++;
    await fetchCustomers(searchKeyword.value, true);
  }
};

// 处理客户输入
const handleCustomerInput = async (e: Event) => {
  const content = (e.target as HTMLElement).textContent || "";
  emit("update:formData", {
    ...localFormData.value,
    customer_name: content
  });
  await fetchCustomers(content);
};

// 处理公司输入
const handleCompanyInput = (e: Event) => {
  const content = (e.target as HTMLElement).textContent || "";
  handleInputUpdate("company_name", content);
};

// 通用输入更新处理
const handleInputUpdate = (
  field: keyof FormItemProps,
  value: string | number
) => {
  emit("update:formData", {
    ...props.formData,
    [field]: value
  });
  // 触发表单验证
  agencyFormRef.value?.validateField(field);
};

// 选择客户
const handleCustomerSelect = (customer: CustomerInfo) => {
  emit("update:formData", {
    ...props.formData,
    customer_name: customer.company_name,
    customer_code: customer.social_credit_code,
    customer_address: customer.business_address,
    customer_phone: customer.daily_contact_phone,
    customer_contact: customer.daily_contact
  });
  customerPopoverVisible.value = false;

  // 手动清除该字段的验证
  agencyFormRef.value?.clearValidate("customer_name");
};

// 选择公司
const handleCompanySelect = (company: CompanyInfo) => {
  emit("update:formData", {
    ...localFormData.value,
    company_name: company.company_name,
    company_code: company.company_code,
    company_address: company.company_address,
    company_phone: company.company_phone,
    business_person: company.business_person
  });
  companyPopoverVisible.value = false;
};

// 判断输入是否有效
const isInvalidCustomer = computed(() => {
  if (!props.formData.customer_name) return false;
  return !customerList.value.some(
    customer => customer.company_name === props.formData.customer_name
  );
});

const isInvalidCompany = computed(() => {
  if (!props.formData.company_name) return false;
  return !companyList.value.some(
    company => company.company_name === props.formData.company_name
  );
});

// 生成合同编号
const generateContractNo = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2); // 年份后两位
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 月份，补零
  const timestamp = Date.now().toString().slice(-6); // 时间戳后6位

  return `ZY-${year}${month}${timestamp}`;
};

// 组件挂载时生成合同编号
onMounted(() => {
  if (!localFormData.value.contract_no) {
    const contractNo = generateContractNo();
    emit("update:formData", {
      ...localFormData.value,
      contract_no: contractNo
    });
  }
});

// 初始化
onMounted(async () => {
  await fetchCustomers();
});

// 监听 props 变化更新本地数据
watch(
  () => props.formData,
  newValue => {
    localFormData.value = { ...newValue };
  },
  { deep: true }
);

// 处理日期更新
const handleDateUpdate = (
  field: "start_date" | "expire_date" | "sign_date",
  value: string
) => {
  emit("update:formData", {
    ...localFormData.value,
    [field]: value
  });
};

// 处理金额更新
const handleAmountUpdate = (value: number) => {
  emit("update:formData", {
    ...localFormData.value,
    amount: value
  });
};

// 导出验证方法供父组件使用
defineExpose({
  validate
});
</script>

<style lang="scss" scoped>
.contract-content {
  padding: 20px;

  .contract-page {
    width: 794px;
    min-height: 1123px;
    margin: 0 auto 20px;
    padding: 40px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .contract-header {
      text-align: center;
      margin-bottom: 20px;
      position: relative;

      .main-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .contract-no-section {
        display: flex;
        justify-content: flex-end;
        margin: 10px 0 20px;

        .contract-no {
          display: flex;
          align-items: center;

          .contract-no__label {
            white-space: nowrap;
          }

          .form-item-wrapper {
            margin-bottom: 0;
          }

          :deep(.el-form-item__content) {
            margin-left: 0 !important;
          }

          :deep(.el-form-item) {
            margin-bottom: 0;
            width: auto;
          }

          &__value {
            color: #f56c6c;
            font-size: 18px;
            font-weight: 600;
            font-family: Arial, sans-serif;
            letter-spacing: 1px;
          }
        }
      }
    }

    .contract-parties {
      margin: 15px 0;
      width: 100%;

      .parties-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        max-width: 100%;
      }

      .party-block {
        min-width: 0;

        .party-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .party-info {
          .info-item {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
            width: 100%;
            gap: 4px;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              white-space: nowrap;
              color: #606266;
              margin-right: 0;
            }

            .form-item-wrapper {
              flex: 1;
              margin: 0;
              padding: 0;

              :deep(.el-form-item__content) {
                margin-left: 0 !important;
                width: 100%;
              }

              :deep(.el-popover__reference) {
                width: 100%;
              }

              :deep(.el-popover__reference-wrapper) {
                width: 100%;
              }
            }

            .editable {
              width: 100%;
              min-width: 0;
              border-bottom: 1px solid #dcdfe6;
              outline: none;
              padding: 0 4px;
              line-height: 24px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              text-align: left;
            }
          }
        }
      }
    }

    .contract-preamble {
      margin-bottom: 30px;
      line-height: 1.8;
      text-indent: 2em;
    }

    .contract-section {
      margin-bottom: 30px;

      h3 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 20px;
      }
    }

    .date-amount-section {
      margin: 20px 0;
      padding: 15px 20px;
      line-height: 2;
      text-indent: 2em;

      .date-amount-content {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        color: #303133;
      }

      :deep(.el-date-editor) {
        width: 160px;

        .el-input__wrapper {
          padding: 0;
          box-shadow: none;
        }

        .el-input__inner {
          border: none;
          border-bottom: 1px solid #dcdfe6;
          border-radius: 0;
          text-align: center;
          padding: 0;
          color: #303133;

          &:hover,
          &:focus {
            border-bottom-color: #409eff;
          }
        }

        .el-input__prefix {
          display: none !important;
        }

        .el-input__prefix-inner {
          display: none !important;
        }
      }

      .amount-input {
        width: 160px;
        margin: 0 4px;

        :deep(.el-input-number__decrease),
        :deep(.el-input-number__increase) {
          display: none;
        }

        :deep(.el-input__wrapper) {
          padding: 0;
          box-shadow: none;
        }

        :deep(.el-input__inner) {
          border: none;
          border-bottom: 1px solid #dcdfe6;
          border-radius: 0;
          text-align: center;
          padding: 0;

          &:hover,
          &:focus {
            border-bottom-color: #409eff;
          }
        }
      }
    }

    .signatures-section {
      margin-top: 60px;
      padding: 0 40px;

      .signatures-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 80px;

        .signature-block {
          .signature-title {
            font-weight: normal;
            margin-bottom: 40px;
          }

          .signature-line {
            height: 1px;
            background-color: #dcdfe6;
            margin: 10px 0 20px;
          }

          .signature-date {
            margin-top: 20px;
            display: flex;
            align-items: center;
            white-space: nowrap;

            .date-label {
              min-width: 70px;
            }

            :deep(.el-input__prefix) {
              display: none !important;
            }

            :deep(.el-input__inner) {
              letter-spacing: 2px;
              font-size: 14px;
              text-align: center;
            }

            :deep(.el-input__wrapper) {
              padding: 0;
              box-shadow: none;
            }

            :deep(.el-input__inner) {
              border: none;
              border-bottom: 1px solid #dcdfe6;
              border-radius: 0;
              text-align: center;
            }

            :deep(.el-date-editor) {
              width: 200px;
            }
          }
        }
      }
    }
  }
}

.select-dropdown {
  &__list {
    max-height: 300px;
    overflow-y: auto;
  }

  &__item {
    padding: 8px 12px;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }

    &--empty {
      color: #909399;
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    }

    &--loading {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;

      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

.form-item-wrapper {
  flex: 1;
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    flex: 1;
    line-height: normal;
    display: flex;
  }

  :deep(.el-form-item__error) {
    position: absolute;
    top: 100%;
    left: 0;
  }
}
</style>
