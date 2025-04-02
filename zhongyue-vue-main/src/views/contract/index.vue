<script setup lang="ts">
import { ref } from "vue";
import { useContract } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PictureFilled } from "@element-plus/icons-vue";
import { BusinessType, ContractStatus } from "./utils/types";

defineOptions({
  name: "ContractPage"
});

// 获取 hook 中的方法和数据，包括 searchForm
const {
  loading,
  dataList,
  columns,
  pagination,
  searchForm, // 使用 hook 中的 searchForm
  permissions, // 添加权限状态
  getStatusType,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  openDialog,
  handleDelete,
  handleSign
} = useContract();

// 日期范围值
const dateRange = ref<[string, string]>(["", ""]);

// 监听日期范围变化
const handleDateRangeChange = (val: [string, string]) => {
  if (val) {
    searchForm.start_date = val[0];
    searchForm.end_date = val[1];
  } else {
    searchForm.start_date = "";
    searchForm.end_date = "";
  }
};

// 合同类型选项
const contractTypeOptions = [
  { label: "电子合同", value: "电子合同" },
  { label: "纸质合同", value: "纸质合同" }
];

// 业务类型选项 - 使用枚举
const businessTypeOptions = [
  { label: "代理记账", value: BusinessType.Agency },
  { label: "社保代理", value: BusinessType.Social }
];

// 合同状态选项 - 使用枚举
const contractStatusOptions = [
  { label: "未签署", value: ContractStatus.Unsigned },
  { label: "生效中", value: ContractStatus.Active },
  { label: "已过期", value: ContractStatus.Expired },
  { label: "已作废", value: ContractStatus.Void }
];
</script>

<template>
  <div class="main-content">
    <PureTableBar title="合同管理" @refresh="onSearch">
      <!-- 搜索表单 -->
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="合同编号" class="form-item">
                <el-input
                  v-model="searchForm.contract_no"
                  placeholder="请输入合同编号"
                  clearable
                  class="search-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="客户名称" class="form-item">
                <el-input
                  v-model="searchForm.customer_name"
                  placeholder="请输入客户名称"
                  clearable
                  class="search-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="业务类型" class="form-item">
                <el-select
                  v-model="searchForm.business_type"
                  placeholder="请选择业务类型"
                  clearable
                  class="search-select"
                >
                  <el-option
                    v-for="item in businessTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="合同状态" class="form-item">
                <el-select
                  v-model="searchForm.status"
                  placeholder="请选择合同状态"
                  clearable
                  class="search-select"
                >
                  <el-option
                    v-for="item in contractStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="提交人" class="form-item">
                <el-input
                  v-model="searchForm.submitter"
                  placeholder="请输入提交人"
                  clearable
                  class="search-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="签订日期" class="form-item">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="date-picker"
                  @change="handleDateRangeChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" class="text-right">
              <el-button type="primary" @click="onSearch">查询</el-button>
              <el-button @click="resetForm">重置</el-button>
              <el-button
                v-if="permissions.action.create"
                type="success"
                @click="openDialog('新增')"
              >
                新增合同
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 表格 -->
      <el-card class="table-card">
        <pure-table
          v-loading="loading"
          row-key="id"
          :data="dataList"
          :columns="columns"
          :pagination="{
            ...pagination,
            align: 'left',
            small: true
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <!-- 合同文件 -->
          <template #contract_files="{ row }">
            <el-space wrap>
              <el-image
                v-for="(url, index) in row.contract_files"
                :key="index"
                :src="url"
                fit="cover"
                :preview-src-list="row.contract_files"
                class="contract-image"
              >
                <template #error>
                  <el-icon><picture-filled /></el-icon>
                </template>
              </el-image>
            </el-space>
          </template>

          <!-- 提交人 -->
          <template #submitter="{ row }">
            <el-tooltip :content="`ID: ${row.submitter_id}`" placement="top">
              <span>{{ row.submitter_name }}</span>
            </el-tooltip>
          </template>

          <!-- 合同状态 -->
          <template #contract_status="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light" round>
              {{ row.status }}
            </el-tag>
          </template>

          <!-- 操作列 -->
          <template #operation="{ row }">
            <el-button-group>
              <!-- 未签署状态显示签署按钮 -->
              <el-button
                v-if="row.status === '未签署'"
                type="success"
                link
                :icon="
                  useRenderIcon('ep:document-checked', { color: '#67C23A' })
                "
                @click="handleSign()"
              >
                签署
              </el-button>
              <!-- 编辑按钮添加权限控制 -->
              <el-button
                v-if="permissions.action.edit"
                type="primary"
                link
                :icon="useRenderIcon('ep:edit')"
                @click="openDialog('编辑', row)"
              >
                编辑
              </el-button>
              <!-- 删除按钮添加权限控制 -->
              <el-popconfirm
                v-if="permissions.action.delete"
                title="是否确认删除?"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    link
                    :icon="useRenderIcon('ep:delete')"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </el-button-group>
          </template>
        </pure-table>
      </el-card>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
.main-content {
  margin: 24px;

  .search-card {
    margin-bottom: 24px;
  }

  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-bottom: 18px;

      .el-form-item__label {
        min-width: 70px;
      }

      // 统一输入框和选择框的宽度
      .search-input,
      .search-select {
        width: 100%;
      }

      // 日期选择器宽度
      .date-picker {
        width: 100%;
      }
    }

    // 调整表单项间距
    .form-item {
      margin-right: 0;
    }
  }

  .text-right {
    padding-right: 20px;
    text-align: right;

    // 按钮间距
    .el-button {
      margin-left: 12px;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  .table-card {
    :deep(.el-card__body) {
      padding: 0;
    }

    :deep(.pure-pagination) {
      justify-content: flex-start;
      padding: 12px 20px;
    }
  }

  .contract-image {
    width: 50px;
    height: 50px;
    cursor: pointer;
    border-radius: 4px;

    :deep(.el-image__inner) {
      border-radius: 4px;
    }

    :deep(.el-image__error) {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background-color: #f5f7fa;
    }
  }
}
</style>
