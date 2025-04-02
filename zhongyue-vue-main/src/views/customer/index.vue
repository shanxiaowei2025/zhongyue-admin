<script setup lang="ts">
import { useCustomer } from "./utils/hook";
import { TableColumnList } from "./types";
import { Refresh, Download, Picture } from "@element-plus/icons-vue";
import {
  ref,
  onMounted,
  onActivated,
  nextTick,
  onDeactivated,
  onBeforeUnmount
} from "vue";
import { useRoute } from "vue-router";
defineOptions({
  name: "CustomerIndex"
});
const route = useRoute();
const tableRef = ref();
const tableHeight = ref(500);

const {
  searchForm,
  dynamicFields,
  availableFields,
  addSearchField,
  removeSearchField,
  isFieldUsed,
  loading,
  dataList,
  total,
  currentPage,
  pageSize,
  permissions,
  resetSearchForm,
  onSearch,
  handlePageChange,
  handleSizeChange,
  handleDelete,
  handleCreate,
  handleUpdate,
  handleViewDetail,
  autoCompleteOptions,
  handleRefresh,
  handleExport
} = useCustomer();

onMounted(() => {
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.doLayout();
    }
  });
  tableHeight.value = window.innerHeight - 300;
  onSearch();
});

onActivated(() => {
  nextTick(() => {
    tableHeight.value = window.innerHeight - 300;
    onSearch();
  });
});

onDeactivated(() => {});

onBeforeUnmount(() => {});

const columns: TableColumnList = [
  {
    label: "企业名称",
    prop: "company_name"
  },
  {
    label: "统一社会信用代码",
    prop: "social_credit_code"
  },
  {
    label: "企业状态",
    prop: "enterprise_status"
  },
  {
    label: "业务员",
    prop: "sales_representative"
  },
  {
    label: "操作",
    prop: "operation",
    fixed: "right",
    width: 180,
    slot: "operation"
  }
];

// 预览相关的状态
const showViewer = ref(false);
const previewImages = ref<string[]>([]);
const previewIndex = ref(0);

// 处理图片预览
const handlePreview = (images: string[], index: number) => {
  previewImages.value = images;
  previewIndex.value = index;
  showViewer.value = true;
};

// 关闭预览
const closePreview = () => {
  showViewer.value = false;
};

const getFullUrl = (path?: string) => {
  if (!path) return "";
  return `${import.meta.env.VITE_MINIO_DOMAIN}/${import.meta.env.VITE_MINIO_BUCKET}/${path}`;
};
</script>
<template>
  <div class="page-container">
    <div class="customer-management">
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-row :gutter="20">
            <!-- 固定搜索字段 -->
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="企业名称">
                <el-autocomplete
                  v-model="searchForm.companyName"
                  :fetch-suggestions="autoCompleteOptions.companyName"
                  placeholder="请输入企业名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="8" :lg="6">
              <el-form-item label="老板名称">
                <el-autocomplete
                  v-model="searchForm.bossName"
                  :fetch-suggestions="autoCompleteOptions.bossName"
                  placeholder="请输入老板名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="8" :lg="6">
              <el-form-item label="日常业务联系人">
                <el-autocomplete
                  v-model="searchForm.dailyContact"
                  :fetch-suggestions="autoCompleteOptions.dailyContact"
                  placeholder="请输入日常业务联系人"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="8" :lg="6">
              <el-form-item label="所属分局">
                <el-autocomplete
                  v-model="searchForm.taxBureau"
                  :fetch-suggestions="autoCompleteOptions.taxBureau"
                  placeholder="请输入所属分局"
                  clearable
                />
              </el-form-item>
            </el-col>

            <!-- 动态搜索字段 -->
            <el-col
              v-for="field in dynamicFields"
              :key="field.key"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-form-item :label="field.label">
                <el-autocomplete
                  v-model="searchForm[field.key]"
                  :fetch-suggestions="autoCompleteOptions[field.key]"
                  :placeholder="`请输入${field.label}`"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24" class="search-buttons">
              <el-form-item class="button-group">
                <el-dropdown
                  style="margin-right: 10px"
                  @command="addSearchField"
                >
                  <el-button type="primary">
                    添加搜索项 <i class="el-icon-arrow-down el-icon--right" />
                  </el-button>
                  <template v-slot:dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="field in availableFields"
                        :key="field.key"
                        :command="field.key"
                        :disabled="isFieldUsed(field.key)"
                      >
                        {{ field.label }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button @click="resetSearchForm">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card class="main-card">
        <template #header>
          <div class="card-header">
            <h2 class="title">客户信息管理</h2>
            <div class="button-group">
              <el-button type="primary" @click="handleRefresh">
                <el-icon><Refresh /></el-icon> 刷新
              </el-button>
              <el-button type="success" @click="handleExport">
                <el-icon><Download /></el-icon> 导出
              </el-button>
              <el-button
                v-if="permissions?.action?.create"
                type="primary"
                @click="handleCreate"
                >新增客户</el-button
              >
            </div>
          </div>
        </template>
        <el-table
          v-loading="loading"
          :data="dataList"
          style="width: 100%"
          :height="tableHeight"
          class="data-table"
          border
          :header-cell-style="{ background: '#f5f7fa', textAlign: 'center' }"
          :cell-style="{ textAlign: 'center' }"
        >
          <el-table-column
            prop="customer_id"
            label="客户ID"
            width="100"
            fixed="left"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <!-- 将企业名称单独列出并固定在左侧 -->
          <el-table-column
            prop="company_name"
            label="企业名称"
            width="180"
            fixed="left"
          />

          <el-table-column label="基本信息" align="center">
            <el-table-column prop="boss_name" label="老板名称" width="150" />
            <el-table-column
              prop="daily_contact"
              label="日常业务联系人"
              width="150"
            />
            <el-table-column
              prop="daily_contact_phone"
              label="日常客户联系人电话"
              width="180"
            />
            <el-table-column
              prop="sales_representative"
              label="业务员"
              width="120"
            />
            <el-table-column
              prop="social_credit_code"
              label="统一社会信用代码"
              width="200"
            />
            <el-table-column prop="tax_bureau" label="所属分局" width="120" />
            <el-table-column
              prop="business_source"
              label="业务来源"
              width="120"
            />
            <el-table-column
              prop="tax_registration_type"
              label="税务登记类型"
              width="150"
            />
            <el-table-column
              prop="chief_accountant"
              label="主管会计"
              width="120"
            />
            <el-table-column
              prop="responsible_accountant"
              label="责任会计"
              width="120"
            />
            <el-table-column
              prop="enterprise_status"
              label="企业状态"
              width="120"
            >
              <template #default="scope">
                <el-radio-group v-model="scope.row.enterprise_status">
                  <el-radio :value="'正常'">正常</el-radio>
                  <el-radio :value="'异常'">异常</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="企业画像" align="center">
            <el-table-column
              prop="main_business"
              label="企业主营"
              width="200"
            />
            <el-table-column prop="boss_profile" label="老板画像" width="200" />
            <el-table-column
              prop="communication_notes"
              label="沟通注意事项"
              width="200"
            />
          </el-table-column>

          <el-table-column label="工商基本信息" align="center">
            <el-table-column
              prop="business_scope"
              label="经营范围"
              width="200"
            />
            <el-table-column
              prop="business_address"
              label="经营地址"
              width="200"
            />
            <el-table-column
              prop="registered_capital"
              label="注册资本"
              width="120"
            />
            <el-table-column
              prop="establishment_date"
              label="成立时间"
              width="120"
            />
            <el-table-column
              prop="license_expiry_date"
              label="执照到期日"
              width="120"
            />
            <el-table-column
              prop="capital_contribution_deadline"
              label="认缴到期日"
              width="120"
            />
            <el-table-column
              prop="enterprise_type"
              label="企业类型"
              width="120"
            />
            <el-table-column prop="shareholders" label="股东" width="200" />
            <el-table-column prop="supervisors" label="监事" width="200" />
            <el-table-column
              prop="business_license_password"
              label="工商年检密码"
              width="150"
            />
            <el-table-column
              prop="paid_in_capital"
              label="实缴金额"
              width="120"
            />
          </el-table-column>

          <el-table-column label="银行基本信息" align="center">
            <el-table-column
              prop="basic_bank"
              label="基本开户银行"
              width="150"
            />
            <el-table-column
              prop="basic_bank_account"
              label="基本开户行账号"
              width="180"
            />
            <el-table-column
              prop="basic_bank_number"
              label="基本开户行行号"
              width="150"
            />
            <el-table-column
              prop="general_bank"
              label="一般开户行"
              width="150"
            />
            <el-table-column
              prop="general_bank_account"
              label="一般开户银行账号"
              width="180"
            />
            <el-table-column
              prop="general_bank_number"
              label="一般开户行行号"
              width="150"
            />
            <el-table-column
              prop="has_online_banking"
              label="是否办理网银盾"
              width="150"
            >
              <template #default="scope">
                <el-radio-group v-model="scope.row.has_online_banking">
                  <el-radio :value="'是'">是</el-radio>
                  <el-radio :value="'否'">否</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
            <el-table-column
              prop="is_online_banking_custodian"
              label="是否网银盾托管"
              width="150"
            >
              <template #default="scope">
                <el-radio-group v-model="scope.row.is_online_banking_custodian">
                  <el-radio :value="'是'">是</el-radio>
                  <el-radio :value="'否'">否</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="税务人员信息" align="center">
            <el-table-column
              prop="legal_person_name"
              label="法人姓名"
              width="120"
            />
            <el-table-column
              prop="legal_person_phone"
              label="法人联系人电话"
              width="150"
            />
            <el-table-column
              prop="legal_person_id"
              label="法人身份证"
              width="180"
            />
            <el-table-column
              prop="legal_person_tax_password"
              label="法人电子税务局密码"
              width="180"
            />
            <el-table-column
              prop="financial_officer_name"
              label="财务负责人姓名"
              width="150"
            />
            <el-table-column
              prop="financial_officer_phone"
              label="财务责人联系电话"
              width="180"
            />
            <el-table-column
              prop="financial_officer_id"
              label="财务负责人身份证"
              width="180"
            />
            <el-table-column
              prop="financial_officer_tax_password"
              label="财务负责人电子税务局密码"
              width="200"
            />
            <el-table-column
              prop="tax_officer_name"
              label="办税员姓名"
              width="120"
            />
            <el-table-column
              prop="tax_officer_phone"
              label="办税员联系电话"
              width="150"
            />
            <el-table-column
              prop="tax_officer_id"
              label="办税员身份证"
              width="180"
            />
            <el-table-column
              prop="tax_officer_tax_password"
              label="办税员电子税务局密码"
              width="180"
            />
          </el-table-column>

          <el-table-column label="其他信息" align="center">
            <el-table-column
              prop="tripartite_agreement_account"
              label="三方协议账户"
              width="180"
            />
            <el-table-column prop="tax_categories" label="税种" width="150" />
            <el-table-column
              prop="personal_tax_declaration_staff"
              label="申报个人员"
              width="150"
            />
            <el-table-column
              prop="personal_tax_password"
              label="个税密码"
              width="150"
            />
          </el-table-column>

          <el-table-column label="图片信息" align="center">
            <el-table-column label="法人身份证图片" width="150">
              <template #default="scope">
                <div class="image-list">
                  <div
                    v-for="(img, index) in scope.row.legal_person_id_images"
                    :key="index"
                    class="image-item"
                    @click="
                      handlePreview(
                        scope.row.legal_person_id_images.map(img =>
                          getFullUrl(img)
                        ),
                        index
                      )
                    "
                  >
                    <el-image
                      :src="getFullUrl(img)"
                      fit="cover"
                      class="table-image"
                      :preview-teleported="false"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="其他身份证图片" width="150">
              <template #default="scope">
                <div class="image-list">
                  <div
                    v-for="(img, index) in scope.row.other_id_images"
                    :key="index"
                    class="image-item"
                    @click="
                      handlePreview(
                        scope.row.other_id_images.map(img => getFullUrl(img)),
                        index
                      )
                    "
                  >
                    <el-image
                      :src="getFullUrl(img)"
                      fit="cover"
                      class="table-image"
                      :preview-teleported="false"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="营业执照图片" width="150">
              <template #default="scope">
                <div class="image-list">
                  <div
                    v-for="(img, index) in scope.row.business_license_images"
                    :key="index"
                    class="image-item"
                    @click="
                      handlePreview(
                        scope.row.business_license_images.map(img =>
                          getFullUrl(img)
                        ),
                        index
                      )
                    "
                  >
                    <el-image
                      :src="getFullUrl(img)"
                      fit="cover"
                      class="table-image"
                      :preview-teleported="false"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="开户许可图片" width="150">
              <template #default="scope">
                <div class="image-list">
                  <div
                    v-for="(img, index) in scope.row
                      .bank_account_license_images"
                    :key="index"
                    class="image-item"
                    @click="
                      handlePreview(
                        scope.row.bank_account_license_images.map(img =>
                          getFullUrl(img)
                        ),
                        index
                      )
                    "
                  >
                    <el-image
                      :src="getFullUrl(img)"
                      fit="cover"
                      class="table-image"
                      :preview-teleported="false"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="补充图片" min-width="200">
              <template #default="scope">
                <div class="image-list">
                  <div
                    v-for="(img, index) in scope.row.supplementary_images"
                    :key="index"
                    class="image-item"
                    @click="
                      handlePreview(
                        scope.row.supplementary_images.map(img =>
                          getFullUrl(img)
                        ),
                        index
                      )
                    "
                  >
                    <el-image
                      :src="getFullUrl(img)"
                      fit="cover"
                      class="table-image"
                      :preview-teleported="false"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            label="操作"
            width="180"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-if="permissions.action.edit"
                type="primary"
                link
                @click="handleUpdate(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="permissions.action.delete"
                type="danger"
                link
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-button
                type="primary"
                link
                @click="handleViewDetail(scope.row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </el-card>

      <!-- 图片预览组件 -->
      <el-image-viewer
        v-if="showViewer"
        :url-list="previewImages"
        :initial-index="previewIndex"
        @close="closePreview"
      />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  width: 100%;
  height: 100%;
}

.customer-management {
  padding: 20px;
  background-color: #f0f2f5;
}

.search-card {
  margin-bottom: 20px;
}

.main-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: bold;
  margin: 0;
}

.search-form {
  .el-form-item {
    margin-bottom: 10px;
    width: 100%;
  }

  .el-input,
  .el-select,
  .el-date-editor {
    width: 100%;
  }
}

.search-buttons {
  text-align: right;
}

@media (max-width: 768px) {
  .search-buttons {
    text-align: left;
  }
}

.data-table {
  margin-bottom: 20px;
}

.pagination {
  text-align: right;
  margin-top: 20px;
}

:deep(.el-table) {
  .el-table__body-wrapper {
    overflow-x: auto;
  }
  .el-table__header-wrapper {
    overflow-x: hidden;
  }
}

:deep(.el-table__header) th {
  background-color: #f5f7fa;
  text-align: center !important;
}

:deep(.el-table__row) {
  &:hover {
    background-color: #f5f7fa;
  }
}

:deep(.el-table__body) td {
  padding: 8px 0;
  vertical-align: middle;
}

:deep(.el-table-column--selection .cell) {
  padding-right: 10px;
}

.table-image {
  width: 50px;
  height: 50px;
  margin: 2px;
  cursor: pointer;
}

:deep(.el-image-viewer__wrapper) {
  z-index: 2000; /* 确保图片预览在最上层 */
}

.image-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 5px 0;
}

.table-image {
  flex: 0 0 auto;
  width: 50px;
  height: 50px;
  margin-right: 5px;
  cursor: pointer;
}

/* 为了美观，可以添加一个滚动条式 */
.image-container::-webkit-scrollbar {
  height: 6px;
}

.image-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.image-container::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 为自动完成输入框添加样式 */
:deep(.el-autocomplete) {
  width: 100%;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
}

.button-group :deep(.el-form-item__content) {
  margin-left: 0 !important;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .button-group,
  .button-group :deep(.el-form-item__content) {
    justify-content: flex-start;
  }
}

.image-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 5px 0;
}

.image-item {
  flex: 0 0 auto;
  margin-right: 5px;
  cursor: pointer;
  position: relative;
}

.table-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  transition: transform 0.3s;
}

.image-item:hover .table-image {
  transform: scale(1.05);
}

.image-error {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

/* 自定义滚动条样式 */
.image-list::-webkit-scrollbar {
  height: 6px;
}

.image-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.image-list::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 确保预览弹窗在最上层 */
:deep(.el-image-viewer__wrapper) {
  z-index: 2100;
}

:deep(.el-image-viewer__close) {
  color: #fff;
}
</style>
