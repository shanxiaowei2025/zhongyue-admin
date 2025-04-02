<template>
  <div class="customer-detail">
    <el-page-header
      :title="customerData?.company_name || '客户详情'"
      @back="goBack"
    >
      <template #content>
        <span class="text-large font-600 mr-3">客户详情</span>
      </template>
    </el-page-header>

    <el-card v-if="customerData" class="detail-card">
      <el-row :gutter="20">
        <el-col :span="24">
          <h2>基本信息</h2>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="企业名称">{{
              customerData.company_name
            }}</el-descriptions-item>
            <el-descriptions-item label="老板名称">{{
              customerData.boss_name
            }}</el-descriptions-item>
            <el-descriptions-item label="统一社会信用代码">{{
              customerData.social_credit_code
            }}</el-descriptions-item>
            <el-descriptions-item label="企业状态">{{
              customerData.enterprise_status
            }}</el-descriptions-item>
            <el-descriptions-item label="业务员">{{
              customerData.sales_representative
            }}</el-descriptions-item>
            <el-descriptions-item label="日常业务联系人">{{
              customerData.daily_contact
            }}</el-descriptions-item>
            <el-descriptions-item label="日常客户联系人电话">{{
              customerData.daily_contact_phone
            }}</el-descriptions-item>
            <el-descriptions-item label="所属分局">{{
              customerData.tax_bureau
            }}</el-descriptions-item>
            <el-descriptions-item label="业务来源">{{
              customerData.business_source
            }}</el-descriptions-item>
            <el-descriptions-item label="税务登记类型">{{
              customerData.tax_registration_type
            }}</el-descriptions-item>
            <el-descriptions-item label="主管会计">{{
              customerData.chief_accountant
            }}</el-descriptions-item>
            <el-descriptions-item label="责任会计">{{
              customerData.responsible_accountant
            }}</el-descriptions-item>
            <el-descriptions-item label="同宗企业">
              <template v-if="relatedCustomers.length > 0">
                <el-tooltip
                  v-for="customer in displayedCustomers"
                  :key="customer.id"
                  :content="'点击查看 ' + customer.company_name + ' 的详情'"
                  placement="top"
                >
                  <el-tag
                    class="mx-1 related-customer-tag"
                    @click="handleClick(customer)"
                  >
                    {{ customer.company_name }}
                  </el-tag>
                </el-tooltip>
                <el-button
                  v-if="relatedCustomers.length > maxDisplay"
                  link
                  type="primary"
                  @click="showAllCustomers"
                >
                  查看全部 ({{ relatedCustomers.length }})
                </el-button>
              </template>
              <span v-else>无</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="24">
          <h2>企业画像</h2>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="企业主营">{{
              customerData.main_business
            }}</el-descriptions-item>
            <el-descriptions-item label="老板画像">{{
              customerData.boss_profile
            }}</el-descriptions-item>
            <el-descriptions-item label="沟通注意事项">{{
              customerData.communication_notes
            }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="24">
          <h2>工商基本信息</h2>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="经营范围">{{
              customerData.business_scope
            }}</el-descriptions-item>
            <el-descriptions-item label="经营地址">{{
              customerData.business_address
            }}</el-descriptions-item>
            <el-descriptions-item label="注册资本">{{
              customerData.registered_capital
            }}</el-descriptions-item>
            <el-descriptions-item label="实缴资本">{{
              customerData.paid_in_capital
            }}</el-descriptions-item>
            <el-descriptions-item label="成立日期">{{
              customerData.establishment_date
            }}</el-descriptions-item>
            <el-descriptions-item label="营业执照到期日">{{
              customerData.license_expiry_date
            }}</el-descriptions-item>
            <el-descriptions-item label="出资截止日期">{{
              customerData.capital_contribution_deadline
            }}</el-descriptions-item>
            <el-descriptions-item label="企业类型">{{
              customerData.enterprise_type
            }}</el-descriptions-item>
            <el-descriptions-item label="股东">{{
              customerData.shareholders
            }}</el-descriptions-item>
            <el-descriptions-item label="监事">{{
              customerData.supervisors
            }}</el-descriptions-item>
            <el-descriptions-item label="工商年检密码">{{
              customerData.business_license_password
            }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="24">
          <h2>税务人员信息</h2>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="法人姓名">{{
              customerData.legal_person_name
            }}</el-descriptions-item>
            <el-descriptions-item label="法人联系人电话">{{
              customerData.legal_person_phone
            }}</el-descriptions-item>
            <el-descriptions-item label="法人身份证">{{
              customerData.legal_person_id
            }}</el-descriptions-item>
            <el-descriptions-item label="法人电子税务局密码">{{
              customerData.legal_person_tax_password
            }}</el-descriptions-item>
            <el-descriptions-item label="财务负责人姓名">{{
              customerData.financial_officer_name
            }}</el-descriptions-item>
            <el-descriptions-item label="财务责人联系电话">{{
              customerData.financial_officer_phone
            }}</el-descriptions-item>
            <el-descriptions-item label="财务负责人身份证">{{
              customerData.financial_officer_id
            }}</el-descriptions-item>
            <el-descriptions-item label="财务负责人电子税务局密码">{{
              customerData.financial_officer_tax_password
            }}</el-descriptions-item>
            <el-descriptions-item label="办税员姓名">{{
              customerData.tax_officer_name
            }}</el-descriptions-item>
            <el-descriptions-item label="办税员联系电话">{{
              customerData.tax_officer_phone
            }}</el-descriptions-item>
            <el-descriptions-item label="办税员身份证">{{
              customerData.tax_officer_id
            }}</el-descriptions-item>
            <el-descriptions-item label="办税员电子税务局密码">{{
              customerData.tax_officer_tax_password
            }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="24">
          <h2>其他信息</h2>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="三方协议账户">{{
              customerData.tripartite_agreement_account
            }}</el-descriptions-item>
            <el-descriptions-item label="税种">{{
              customerData.tax_categories
            }}</el-descriptions-item>
            <el-descriptions-item label="申报个税人员">{{
              customerData.personal_tax_declaration_staff
            }}</el-descriptions-item>
            <el-descriptions-item label="个税密码">{{
              customerData.personal_tax_password
            }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="24">
          <h2>图片信息</h2>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="法人身份证图片">
              <div class="image-list">
                <div
                  v-for="(img, index) in customerData.legal_person_id_images"
                  :key="index"
                  class="image-item"
                  @click="
                    handlePreview(customerData.legal_person_id_images, index)
                  "
                >
                  <el-image
                    :src="getFullUrl(img)"
                    fit="cover"
                    class="preview-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="其他身份证图片">
              <div class="image-list">
                <div
                  v-for="(img, index) in customerData.other_id_images"
                  :key="index"
                  class="image-item"
                  @click="handlePreview(customerData.other_id_images, index)"
                >
                  <el-image
                    :src="getFullUrl(img)"
                    fit="cover"
                    class="preview-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="营业执照图片">
              <div class="image-list">
                <div
                  v-for="(img, index) in customerData.business_license_images"
                  :key="index"
                  class="image-item"
                  @click="
                    handlePreview(customerData.business_license_images, index)
                  "
                >
                  <el-image
                    :src="getFullUrl(img)"
                    fit="cover"
                    class="preview-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="开户许可图片">
              <div class="image-list">
                <div
                  v-for="(
                    img, index
                  ) in customerData.bank_account_license_images"
                  :key="index"
                  class="image-item"
                  @click="
                    handlePreview(
                      customerData.bank_account_license_images,
                      index
                    )
                  "
                >
                  <el-image
                    :src="getFullUrl(img)"
                    fit="cover"
                    class="preview-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="补充图片">
              <div class="image-list">
                <div
                  v-for="(img, index) in customerData.supplementary_images"
                  :key="index"
                  class="image-item"
                  @click="
                    handlePreview(customerData.supplementary_images, index)
                  "
                >
                  <el-image
                    :src="getFullUrl(img)"
                    fit="cover"
                    class="preview-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </el-card>

    <el-image-viewer
      v-if="showViewer"
      :url-list="previewImages"
      :initial-index="previewIndex"
      @close="closePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCustomerDetail, getRelatedCustomers } from "@/api/customer";

const route = useRoute();
const router = useRouter();
const customerData = ref<any>(null);
const relatedCustomers = ref<any[]>([]);

const relatedCustomersTooltip = computed(() => {
  return relatedCustomers.value
    .map(customer => customer.company_name)
    .join("\n");
});
defineOptions({
  name: "CustomerDetail"
});
onMounted(async () => {
  const customerId = Number(route.params.id);
  try {
    const response = await getCustomerDetail(customerId);
    if (response.success && response.data) {
      customerData.value = response.data;
      // 获取同宗企业
      await fetchRelatedCustomers();
    } else {
      throw new Error("Failed to fetch customer details");
    }
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
  }
});

const fetchRelatedCustomers = async () => {
  if (customerData.value && customerData.value.boss_name) {
    try {
      const response = await getRelatedCustomers(customerData.value.boss_name);
      if (response.success && response.data) {
        relatedCustomers.value = response.data.filter(
          (customer: any) => customer.id !== customerData.value.id
        );
      }
    } catch (error) {
      console.error("Failed to fetch related customers:", error);
    }
  }
};

const goBack = () => {
  router.push("/customer");
};

const maxDisplay = 5; // 最大显示数量
const showAll = ref(false);

const displayedCustomers = computed(() => {
  return showAll.value
    ? relatedCustomers.value
    : relatedCustomers.value.slice(0, maxDisplay);
});

const showAllCustomers = () => {
  showAll.value = true;
};

const handleClose = (customer: any) => {
  // 这里可以添加移除同宗企业的逻辑，如果需要的话
  console.log("关闭标签:", customer.company_name);
};

const handleClick = (customer: any) => {
  // 点击标签时跳转到对应客户的详情页
  router.push(`/customer/detail/${customer.id}`);
};

const getFullUrl = (path?: string) => {
  if (!path) return "";
  return `${import.meta.env.VITE_MINIO_DOMAIN}/${import.meta.env.VITE_MINIO_BUCKET}/${path}`;
};

const showViewer = ref(false);
const previewImages = ref<string[]>([]);
const previewIndex = ref(0);

const handlePreview = (images: string[], index: number) => {
  previewImages.value = images.map(img => getFullUrl(img));
  previewIndex.value = index;
  showViewer.value = true;
};

const closePreview = () => {
  showViewer.value = false;
};
</script>

<style scoped>
.customer-detail {
  padding: 20px;
}

.detail-card {
  margin-top: 20px;
}

.detail-image {
  width: 100px;
  height: 100px;
  margin-right: 10px;
  object-fit: cover;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__label) {
  width: 180px;
  font-weight: bold;
}

h2 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
}

.el-divider {
  margin: 24px 0;
}

.related-customer-tag {
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 5px;
  margin-bottom: 5px;
}

.related-customer-tag:hover {
  background-color: #409eff;
  color: white;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.image-item {
  width: 100px;
  height: 100px;
  margin: 5px;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
