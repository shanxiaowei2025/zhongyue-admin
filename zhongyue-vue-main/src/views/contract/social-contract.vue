<template>
  <!-- 合同内容区域 -->
  <div class="contract-content">
    <!-- 第一页 -->
    <div v-show="currentPage === 1" class="contract-page">
      <!-- 合同标题 -->
      <div class="contract-header">
        <h1 class="main-title">代理记账合同</h1>
        <div class="contract-no">
          <span class="contract-no__label">合同编号：</span>
          <span class="contract-no__value">{{ formData.contract_no }}</span>
        </div>
      </div>

      <!-- 合同双方信息 -->
      <div class="contract-parties">
        <!-- 甲乙双方标题 -->
        <div class="parties-header">
          <div class="party-title">甲方</div>
          <div class="party-title">乙方</div>
        </div>

        <!-- 甲乙双方内容 -->
        <div class="parties-content">
          <!-- 甲方信息 -->
          <div class="party-info">
            <div class="info-item">
              <span class="label short-label">名称：</span>
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
            </div>
            <div class="info-item">
              <span class="label long-label">统一社会信用代码：</span>
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
            </div>
            <div class="info-item">
              <span class="label short-label">地址：</span>
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
            </div>
            <div class="info-item">
              <span class="label short-label">电话：</span>
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
            </div>
            <div class="info-item">
              <span class="label short-label">联系人：</span>
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
            </div>
          </div>

          <!-- 乙方信息 -->
          <div class="party-info">
            <div class="info-item">
              <span class="label short-label">名称：</span>
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
            </div>
            <div class="info-item">
              <span class="label long-label">统一社会信用代码：</span>
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
            </div>
            <div class="info-item">
              <span class="label short-label">地址：</span>
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
            </div>
            <div class="info-item">
              <span class="label short-label">电话：</span>
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
            </div>
            <div class="info-item">
              <span class="label short-label">业务人：</span>
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
          <el-date-picker
            v-model="localFormData.start_date"
            type="date"
            placeholder="选择开始日期"
            format="YYYY年MM月DD日"
            value-format="YYYY-MM-DD"
            :prefix-icon="null"
            @update:modelValue="handleDateUpdate('start_date', $event)"
          />， 合同结束日期
          <el-date-picker
            v-model="localFormData.expire_date"
            type="date"
            placeholder="选择结束日期"
            format="YYYY年MM月DD日"
            value-format="YYYY-MM-DD"
            :prefix-icon="null"
            @update:modelValue="handleDateUpdate('expire_date', $event)"
          />， 合同金额：
          <el-input-number
            v-model="localFormData.amount"
            :min="0"
            :precision="2"
            :step="1000"
            class="amount-input"
            placeholder="请输入合同金额"
            @update:modelValue="handleAmountUpdate"
          />元。
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
              <el-date-picker
                v-model="localFormData.sign_date"
                type="date"
                placeholder="选择日期"
                format="YYYY年MM月DD日"
                value-format="YYYY-MM-DD"
                :prefix-icon="null"
                @update:modelValue="handleDateUpdate('sign_date', $event)"
              />
            </div>
          </div>

          <!-- 乙方签字 -->
          <div class="signature-block">
            <div class="signature-title">乙方（盖章）：</div>
            <div class="signature-line" />
            <div class="signature-date">
              <span class="date-label">签订日期：</span>
              <el-date-picker
                v-model="localFormData.sign_date"
                type="date"
                placeholder="选择日期"
                format="YYYY年MM月DD日"
                value-format="YYYY-MM-DD"
                :prefix-icon="null"
                @update:modelValue="handleDateUpdate('sign_date', $event)"
              />
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
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Loading } from "@element-plus/icons-vue";
import type { FormItemProps, CustomerInfo, CompanyInfo } from "./utils/types";
import { getCustomerList } from "@/api/customer";

const props = defineProps<{
  formData: FormItemProps;
  currentPage: number;
}>();

const emit = defineEmits<{
  "update:formData": [value: FormItemProps];
}>();

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
    ...localFormData.value,
    [field]: value
  });
};

// 选择客户
const handleCustomerSelect = (customer: CustomerInfo) => {
  emit("update:formData", {
    ...localFormData.value,
    customer_name: customer.company_name,
    customer_code: customer.social_credit_code,
    customer_address: customer.business_address,
    customer_phone: customer.daily_contact_phone,
    customer_contact: customer.daily_contact
  });
  customerPopoverVisible.value = false;
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
      margin-bottom: 15px;

      .main-title {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .contract-no {
        text-align: right;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .label {
          margin-right: 10px;
        }
      }
    }

    .contract-parties {
      margin: 15px 0;

      .parties-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;

        .party-title {
          font-size: 16px;
          font-weight: bold;
          flex: 1;
          text-align: left;
          margin-left: 0;
          padding-left: 0;
        }
      }

      .parties-content {
        display: flex;
        justify-content: space-between;
        gap: 40px;

        .party-info {
          flex: 1;

          .info-item {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              display: inline-block;
              line-height: 24px;
              color: #606266;
              text-align: left;
              margin-right: 0;

              &.short-label {
                width: auto;
                min-width: auto;
              }

              &.long-label {
                width: auto;
                min-width: auto;
              }
            }

            .editable {
              flex: 1;
              min-width: 100px;
              padding: 0;
              line-height: 24px;
              border-bottom: 1px solid #dcdfe6;
              outline: none;
              cursor: text;

              &:focus {
                border-bottom-color: #409eff;
              }

              &.invalid-input {
                color: #f56c6c;
                border-bottom-color: #f56c6c;
              }
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
</style>
