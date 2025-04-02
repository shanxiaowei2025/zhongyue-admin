<script setup lang="ts">
import {
  ref,
  onMounted,
  nextTick,
  computed,
  watch,
  onActivated,
  onDeactivated,
  onBeforeUnmount
} from "vue";
import { useExpense } from "@/views/expense/utils/hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ElImageViewer, ElMessageBox } from "element-plus";
import html2canvas from "html2canvas";

import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { Check, Close } from "@element-plus/icons-vue";

// 导入所有印章图片
import dingxingZhang from "@/assets/dingxing-zhang.png";
import xionganZhang from "@/assets/xiongan-zhang.png";
import gaobeidianZhang from "@/assets/gaobeidian-zhang.png";
import maixinZhang from "@/assets/maixin-zhang.png";
import jindunZhang from "@/assets/jindun-zhang.png";
import runixinyiZhang from "@/assets/runixinyi-zhang.png";
defineOptions({
  name: "ExpenseIndex"
});
const {
  searchForm,
  loading,
  dataList,
  total,
  currentPage,
  pageSize,
  onSearch,
  resetSearchForm,
  openDialog,
  handleDelete: originalHandleDelete,
  formatMoney,
  formatDate,
  handlePageChange,
  handleSizeChange,
  companyNames,
  userPermissions,
  fetchExpenseList,
  handleAudit,
  dialogVisible,
  auditStatus,
  rejectReason,
  showAuditDialog,
  cancelAudit,
  showRejectReason,
  handleCancelAudit,
  receiptDialogVisible,
  currentReceipt,
  viewReceipt,
  generateGroupedExpenseDetails,
  stampUnitOptions,
  selectedStampUnit,
  handleExport,
  dynamicFields,
  availableFields,
  addSearchField,
  removeSearchField,
  isFieldUsed,
  groupedAvailableFields,
  autoCompleteOptions
} = useExpense();

const tableRef = ref();

onMounted(() => {
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.doLayout();
    }
  });
  fetchExpenseList();
});

onActivated(() => {
  // 删除 console.log("Expense component activated");
});

onDeactivated(() => {
  // 删除 console.log("Expense component deactivated");
});

onBeforeUnmount(() => {
  // 删除 console.log("Expense component will unmount");
});

// 添加这个方法
const getUniqueValues = (
  array: any[],
  key: string
): { text: string; value: string }[] => {
  const uniqueValues = [...new Set(array.map(item => item[key]))];
  return uniqueValues
    .filter(value => value != null) // 过掉 null 和 undefined
    .map(value => {
      let text, val;
      if (typeof value === "object" && value instanceof Date) {
        text = formatDate(value);
        val = value.toISOString();
      } else if (
        typeof value === "number" &&
        (key.includes("fee") || key.includes("_fee"))
      ) {
        text = formatMoney(value);
        val = value.toString();
      } else {
        text = String(value);
        val = String(value);
      }
      return { text, value: val };
    });
};

const filterHandler = (value, row, property) => {
  return row[property].toString() === value.toString();
};

const showViewer = ref(false);
const viewerSrc = ref("");
const viewerSrcList = ref([]);

const previewImage = (image: string | File) => {
  if (image instanceof File) {
    const reader = new FileReader();
    reader.onload = e => {
      viewerSrcList.value = [e.target.result as string];
      showViewer.value = true;
    };
    reader.readAsDataURL(image);
  } else {
    viewerSrcList.value = [image];
    showViewer.value = true;
  }
};

// 修改 handleDelete 方法
const handleDelete = row => {
  ElMessageBox.confirm(
    `确定要删除 ${row.company_name} 的费用记录吗？`,
    "确认删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      originalHandleDelete(row);
    })
    .catch(() => {
      // ���户点击取消，做任何操作
    });
};

const receiptContent = ref<HTMLElement | null>(null);

const saveAsImage = async () => {
  if (receiptContent.value) {
    const canvas = await html2canvas(receiptContent.value);
    const image = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.download = "receipt.png";
    link.href = image;
    link.click();
  }
};

const receiptNumber = computed(() => {
  if (!currentReceipt.value) return "";

  const date = new Date(currentReceipt.value.charge_date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 生成1000-9999之间的随机数

  return `${year}${month}${day}${randomNum}`;
});

const convertToChinese = (num: number) => {
  const fraction = ["角", "分"];
  const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const unit = [
    ["元", "万", "亿"],
    ["", "拾", "佰", "仟"]
  ];
  const head = num < 0 ? "欠" : "";
  num = Math.abs(num);

  let s = "";
  for (let i = 0; i < fraction.length; i++) {
    s +=
      digit[Math.floor(num * 10 * Math.pow(10, i)) % 10] +
      fraction[i].replace(/零./, "");
  }
  s = s || "整";
  num = Math.floor(num);

  for (let i = 0; i < unit[0].length && num > 0; i++) {
    let p = "";
    for (let j = 0; j < unit[1].length && num > 0; j++) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + s;
  }

  return (
    head +
    s
      .replace(/(零.)*零元/, "元")
      .replace(/(零.)+/g, "零")
      .replace(/^整$/, "零元整")
  );
};

const stampUnitToPayee = {
  中岳: "定兴县中岳会计服务有限责任公司",
  雄安: "定兴县中岳会计服务有限责任公司河北雄安分公司",
  高碑店: "定兴县中岳会计服务有限��任公司高碑店分公司",
  脉信: "保定脉信会计服务有限公司",
  金盾: "定兴县金盾企业管理咨询有限公司",
  如你心意: "保定如你心意企业管理咨询有限公司"
};

const payee = computed(() => {
  return stampUnitToPayee[selectedStampUnit.value] || "";
});

// 添加一个新的计算属性
const stampImage = computed(() => {
  switch (selectedStampUnit.value) {
    case "中岳":
      return dingxingZhang;
    case "雄安":
      return xionganZhang;
    case "高碑店":
      return gaobeidianZhang;
    case "脉信":
      return maixinZhang;
    case "金盾":
      return jindunZhang;
    case "如你心意":
      return runixinyiZhang;
    default:
      return dingxingZhang; // 默认图片
  }
});

const tableHeight = ref(0);

onMounted(() => {
  tableHeight.value = window.innerHeight - 300;
});

// 添加环境变量
const minioDomain = import.meta.env.VITE_MINIO_DOMAIN;
const minioBucket = import.meta.env.VITE_MINIO_BUCKET;
const minioUrl = `${minioDomain}/${minioBucket}/`;
</script>

<template>
  <div class="main">
    <!-- 搜索表单卡片 -->
    <el-card class="search-card">
      <el-form ref="searchFormRef" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <!-- 固定搜索字�� -->
          <el-col :span="6">
            <el-form-item label="企业名称" prop="companyName">
              <el-autocomplete
                v-model="searchForm.company_name"
                :fetch-suggestions="autoCompleteOptions.company_name"
                placeholder="请输入企业名称"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 100%"
              >
                <el-option label="未审核" :value="0" />
                <el-option label="已审核" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提交人" prop="submitter">
              <el-autocomplete
                v-model="searchForm.submitter"
                :fetch-suggestions="autoCompleteOptions.submitter"
                placeholder="请输入提交人"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="收费日期" prop="chargeDate">
              <el-date-picker
                v-model="searchForm.charge_date"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 动态搜索字段 -->
          <el-col v-for="field in dynamicFields" :key="field.key" :span="6">
            <el-form-item :label="field.label" :prop="field.key">
              <el-autocomplete
                v-model="searchForm[field.key]"
                :fetch-suggestions="autoCompleteOptions[field.key]"
                :placeholder="`请输入${field.label}`"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <div class="search-buttons">
              <el-dropdown @command="addSearchField">
                <el-button type="primary">
                  添加搜索项 <i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="custom-dropdown-menu">
                    <div class="dropdown-columns">
                      <div class="dropdown-column">
                        <el-dropdown-item
                          v-for="field in groupedAvailableFields.left"
                          :key="field.key"
                          :command="field.key"
                        >
                          {{ field.label }}
                        </el-dropdown-item>
                      </div>
                      <div class="dropdown-column">
                        <el-dropdown-item
                          v-for="field in groupedAvailableFields.right"
                          :key="field.key"
                          :command="field.key"
                        >
                          {{ field.label }}
                        </el-dropdown-item>
                      </div>
                    </div>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button type="primary" @click="onSearch">搜索</el-button>
              <el-button @click="resetSearchForm">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 表格头部卡片 -->
    <el-card class="main-card">
      <div class="table-header">
        <div class="header-content">
          <h2 class="table-title">费用列表</h2>
          <div class="table-buttons">
            <el-button
              v-if="userPermissions.action.create"
              type="primary"
              :icon="useRenderIcon(AddFill)"
              @click="openDialog('新增')"
            >
              新增费用
            </el-button>
            <el-button
              type="info"
              :icon="useRenderIcon(Refresh)"
              @click="onSearch"
            >
              刷新
            </el-button>
            <el-button
              type="warning"
              :icon="useRenderIcon('mdi:file-export')"
              @click="handleExport"
            >
              导出
            </el-button>
          </div>
        </div>
      </div>
      <!-- 表格内容 -->
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="dataList"
          :border="true"
          style="width: 100%"
          :height="tableHeight"
          :cell-style="{ textAlign: 'center' as const }"
          class="custom-filter-table"
        >
          <el-table-column
            prop="expense_id"
            label="费用ID"
            width="100"
            fixed="left"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <!-- 企业名称 -->
          <el-table-column
            prop="company_name"
            label="企业名"
            min-width="180"
            fixed="left"
            show-overflow-tooltip
          >
            <template #default="scope">
              <el-tooltip
                :content="scope.row.company_name"
                placement="top"
                :hide-after="2000"
              >
                <span>{{ scope.row.company_name }}</span>
              </el-tooltip>
            </template>
          </el-table-column>

          <!-- 基本信息 -->
          <el-table-column label="基本信息" align="center">
            <el-table-column
              prop="company_type"
              label="企业类型"
              min-width="120"
            />
            <el-table-column
              prop="company_location"
              label="业归属地"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="business_type"
              label="业务类型"
              min-width="120"
              show-overflow-tooltip
            />
          </el-table-column>

          <!-- 代理记账 -->
          <el-table-column
            label="代理记账"
            align="center"
            class-name="header-agency"
          >
            <el-table-column
              prop="agency_type"
              label="代理类型"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="contract_type"
              label="合同类型"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column prop="agency_fee" label="代理费" min-width="100">
              <template #default="scope">
                <span v-if="scope.row.agency_fee !== null">{{
                  formatMoney(scope.row.agency_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="accounting_software_fee"
              label="记账软件费"
              min-width="120"
            >
              <template #default="scope">
                <span v-if="scope.row.accounting_software_fee !== null">{{
                  formatMoney(scope.row.accounting_software_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="address_fee" label="地址费" min-width="100">
              <template #default="scope">
                <span v-if="scope.row.address_fee !== null">{{
                  formatMoney(scope.row.address_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="agency_start_date"
              label="代理开始日期"
              min-width="140"
            >
              <template #default="scope">
                {{ formatDate(scope.row.agency_start_date) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="agency_end_date"
              label="代理结束"
              min-width="140"
            >
              <template #default="scope">
                {{ formatDate(scope.row.agency_end_date) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="contract_image"
              label="合同图片"
              min-width="120"
            >
              <template #default="scope">
                <el-image
                  v-if="scope.row.contract_image"
                  :src="scope.row.contract_image"
                  fit="contain"
                  style="cursor: pointer; object-fit: contain"
                  @click="previewImage(scope.row.contract_image)"
                />
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 开票软件 -->
          <el-table-column label="开票" align="center">
            <el-table-column
              prop="invoice_software_provider"
              label="开票软件服务商"
              min-width="160"
            />
            <el-table-column
              prop="invoice_software_fee"
              label="开票软件费"
              min-width="140"
            >
              <template #default="scope">
                <span v-if="scope.row.invoice_software_fee !== null">{{
                  formatMoney(scope.row.invoice_software_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="invoice_software_start_date"
              label="开票软件开始日期"
              min-width="160"
            >
              <template #default="scope">
                {{ formatDate(scope.row.invoice_software_start_date) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="invoice_software_end_date"
              label="开票件结束日期"
              min-width="160"
            >
              <template #default="scope">
                {{ formatDate(scope.row.invoice_software_end_date) }}
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 社保代理 -->
          <el-table-column
            label="社保代理"
            align="center"
            class-name="header-social-insurance"
          >
            <el-table-column
              prop="social_insurance_agency_fee"
              label="社保代理费"
              min-width="140"
            >
              <template #default="scope">
                <span v-if="scope.row.social_insurance_agency_fee !== null">{{
                  formatMoney(scope.row.social_insurance_agency_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="insured_count"
              label="参保人数"
              min-width="120"
            />
            <el-table-column
              prop="insurance_types"
              label="参保险种"
              min-width="180"
            />
            <el-table-column
              prop="social_insurance_start_date"
              label="社保开始日期"
              min-width="160"
            >
              <template #default="scope">
                {{ formatDate(scope.row.social_insurance_start_date) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="social_insurance_end_date"
              label="社保结束期"
              min-width="160"
            >
              <template #default="scope">
                {{ formatDate(scope.row.social_insurance_end_date) }}
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 统计报表 -->
          <el-table-column
            label="统计报表"
            align="center"
            class-name="header-statistics"
          >
            <el-table-column
              prop="statistical_report_fee"
              label="统计局报表费"
              min-width="160"
            >
              <template #default="scope">
                <span v-if="scope.row.statistical_report_fee !== null">{{
                  formatMoney(scope.row.statistical_report_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="social_insurance_start_date"
              label="统计开始日期"
              min-width="160"
            >
              <template #default="scope">
                {{ formatDate(scope.row.statistical_start_date) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="social_insurance_end_date"
              label="统计结束日期"
              min-width="160"
            >
              <template #default="scope">
                {{ formatDate(scope.row.statistical_end_date) }}
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 新办执照 (移动到这里) -->
          <el-table-column
            label="新办执照"
            align="center"
            class-name="header-license"
          >
            <el-table-column
              prop="license_type"
              label="办照类型"
              min-width="120"
            />
            <el-table-column
              prop="license_fee"
              label="办照费用"
              min-width="120"
            >
              <template #default="scope">
                <span v-if="scope.row.license_fee !== null">{{
                  formatMoney(scope.row.license_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="one_time_address_fee"
              label="一次性地址费"
              min-width="140"
            >
              <template #default="scope">
                <span v-if="scope.row.one_time_address_fee !== null">{{
                  formatMoney(scope.row.one_time_address_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="brand_fee" label="牌子费" min-width="120">
              <template #default="scope">
                <span v-if="scope.row.brand_fee !== null">{{
                  formatMoney(scope.row.brand_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="seal_fee" label="刻章费" min-width="120">
              <template #default="scope">
                <span v-if="scope.row.seal_fee !== null">{{
                  formatMoney(scope.row.seal_fee)
                }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 其他业务 -->
          <el-table-column
            label="其他业务"
            align="center"
            class-name="header-other-business"
          >
            <el-table-column prop="change_fee" label="更收费" min-width="120">
              <template #default="scope">
                <span v-if="scope.row.change_fee !== null">{{
                  formatMoney(scope.row.change_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="change_business"
              label="变更业务"
              min-width="180"
            />
            <el-table-column
              prop="administrative_license"
              label="行政许可"
              min-width="180"
            />
            <el-table-column
              prop="administrative_license_fee"
              label="行政许可收费"
              min-width="160"
            >
              <template #default="scope">
                <span v-if="scope.row.administrative_license_fee !== null">{{
                  formatMoney(scope.row.administrative_license_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="other_business"
              label="其他业务"
              min-width="120"
            />
            <el-table-column
              prop="other_business_fee"
              label="其他业务收费"
              min-width="160"
            >
              <template #default="scope">
                <span v-if="scope.row.other_business_fee !== null">{{
                  formatMoney(scope.row.other_business_fee)
                }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 收费信息 -->
          <el-table-column
            label="收费信息"
            align="center"
            class-name="header-charge-info"
          >
            <el-table-column prop="total_fee" label="总费用" min-width="120">
              <template #default="scope">
                <span v-if="scope.row.total_fee !== null">{{
                  formatMoney(scope.row.total_fee)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="charge_date" label="收费日" min-width="140">
              <template #default="scope">
                {{ formatDate(scope.row.charge_date) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="charge_method"
              label="收费方式"
              min-width="140"
            />
            <el-table-column
              prop="proof_of_charge"
              label="收费凭证"
              min-width="180"
            >
              <template #default="scope">
                <div class="proof-images">
                  <el-image
                    v-for="(url, index) in scope.row.proof_of_charge"
                    :key="index"
                    :src="minioUrl + url"
                    fit="contain"
                    class="proof-image"
                    @click="previewImage(minioUrl + url)"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 状态和审核信息 -->
          <el-table-column
            label="状态和审核信息"
            align="center"
            class-name="header-status-audit"
          >
            <el-table-column
              prop="submitter"
              label="提交人"
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.status === 0
                      ? 'warning'
                      : scope.row.status === 2
                        ? 'danger'
                        : 'success'
                  "
                >
                  {{
                    scope.row.status === 0
                      ? "未审核"
                      : scope.row.status === 2
                        ? "已拒绝"
                        : "已审核"
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="auditor"
              label="审核员"
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column prop="audit_date" label="审核日期" min-width="120">
              <template #default="scope">
                {{ formatDate(scope.row.audit_date) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="create_time"
              label="创建日期"
              min-width="140"
            >
              <template #default="scope">
                {{ scope.row.create_time }}
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            prop="remarks"
            label="备注"
            min-width="200"
            show-overflow-tooltip
          />

          <el-table-column label="操作" width="280" fixed="right">
            <template #default="scope">
              <!-- 编辑按钮 -->
              <el-button
                v-if="
                  userPermissions.action.edit &&
                  (scope.row.status === 0 || scope.row.status === 2)
                "
                type="primary"
                link
                @click="openDialog('编辑', scope.row)"
              >
                编辑
              </el-button>

              <!-- 删除按钮 -->
              <el-button
                v-if="userPermissions.action.delete && scope.row.status === 0"
                type="danger"
                link
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>

              <!-- 审核按钮 -->
              <el-button
                v-if="userPermissions.action.audit && scope.row.status === 0"
                type="success"
                link
                @click="showAuditDialog(scope.row)"
              >
                审核
              </el-button>

              <!-- 查看收据按钮 -->
              <el-button
                v-if="
                  userPermissions.action.view_receipt && scope.row.status === 1
                "
                type="primary"
                link
                @click="viewReceipt(scope.row)"
              >
                查看收据
              </el-button>

              <!-- 拒绝原因按钮 -->
              <el-button
                v-if="scope.row.status === 2"
                type="info"
                link
                @click="showRejectReason(scope.row)"
              >
                拒绝原因
              </el-button>

              <!-- 取消审核按钮 -->
              <el-button
                v-if="
                  userPermissions.action.cancel_audit && scope.row.status === 1
                "
                type="warning"
                link
                @click="handleCancelAudit(scope.row.id)"
              >
                取消审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 图片预览组件 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="viewerSrcList"
      :hide-on-click-modal="true"
      @close="showViewer = false"
    />

    <el-dialog
      v-model="dialogVisible"
      title="费用审核"
      width="400px"
      :close-on-click-modal="false"
      custom-class="audit-dialog"
    >
      <el-form :model="{ auditStatus, rejectReason }" label-position="top">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditStatus" class="audit-radio-group">
            <el-radio-button :label="1" class="audit-radio-button approve">
              <el-icon><Check /></el-icon> 审通过
            </el-radio-button>
            <el-radio-button :label="2" class="audit-radio-button reject">
              <el-icon><Close /></el-icon> 审核拒绝
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditStatus === 2" label="拒绝原因" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelAudit">取消</el-button>
          <el-button
            type="primary"
            :disabled="auditStatus === 2 && !rejectReason.trim()"
            @click="handleAudit"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 收据对话框 -->
    <el-dialog
      v-model="receiptDialogVisible"
      width="850px"
      :show-close="false"
      class="receipt-dialog"
    >
      <!-- 移除原来的盖章单位选择卡片 -->

      <div v-if="currentReceipt" ref="receiptContent" class="receipt-content">
        <div class="receipt-frame">
          <div class="receipt-header">
            <div class="logo-container">
              <img
                src="@/assets/logo.png"
                alt="中岳会计"
                class="company-logo"
              />
            </div>
            <div class="title-container">
              <h1 class="receipt-title">电子收款收据</h1>
              <p class="receipt-date">
                日期: {{ formatDate(currentReceipt.charge_date) }}
              </p>
            </div>
            <p class="receipt-no">NO. {{ receiptNumber }}</p>
          </div>
          <table class="receipt-table">
            <tr>
              <td>付款单位</td>
              <td>{{ currentReceipt.company_name }}</td>
            </tr>
            <tr>
              <td>款项明细</td>
              <td>
                <div
                  v-for="(group, key) in generateGroupedExpenseDetails"
                  :key="key"
                  class="expense-group"
                >
                  <h3 class="group-title">{{ group.title }}</h3>
                  <div class="expense-list">
                    <div
                      v-for="(item, index) in group.items"
                      :key="index"
                      class="expense-item"
                    >
                      <span class="item-label">{{ item.label }}：</span>
                      <span class="item-value">{{ item.value || "无" }}</span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>合计金额</td>
              <td>
                <span class="amount-label">大写：</span>
                <span class="amount-value">{{
                  convertToChinese(currentReceipt.total_fee)
                }}</span>
                <span class="amount-separator" />
                <span class="amount-label">小写：</span>
                <span class="amount-value">{{
                  formatMoney(currentReceipt.total_fee)
                }}</span>
              </td>
            </tr>
            <tr>
              <td>收款方式</td>
              <td>{{ currentReceipt.charge_method }}</td>
            </tr>
            <tr>
              <td>备注</td>
              <td>{{ currentReceipt.remark || "无" }}</td>
            </tr>
          </table>
          <div class="receipt-footer">
            <div class="receipt-signature">
              <span class="signature-label">收款人：</span>
              <span class="signature-value">{{ payee }}</span>
            </div>
            <div class="receipt-stamp">
              <span class="stamp-label">盖章：</span>
            </div>
          </div>
          <div class="stamp-image-container">
            <img
              :src="stampImage"
              :alt="`${selectedStampUnit}公司印章`"
              class="stamp-image"
            />
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <div class="stamp-unit-select">
          <span class="stamp-label">选择盖章单位：</span>
          <el-radio-group v-model="selectedStampUnit" size="small">
            <el-radio-button
              v-for="item in stampUnitOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="button-group">
          <el-button @click="receiptDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveAsImage">保存为图片</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 主布局 */
.main {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: auto; /* 假设顶部导航栏高度为 84px */
  overflow-y: auto;
}

.main-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-table) {
  flex: 1;
  overflow: auto;
}

/* 表格头部 */
.table-header {
  margin-bottom: 20px;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 20px 0 0;
}

.table-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.table-buttons .el-button {
  margin-left: 0;
  padding: 8px 15px;
  font-size: 14px;
}

/* 表格样式 */
:deep(.el-table) {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
  border: 1px solid #ebeef5;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

:deep(.el-table--scrollable-x .el-table__body-wrapper) {
  overflow-x: auto !important;
}

:deep(.el-table__header) {
  font-weight: bold;
}

:deep(.el-table__header-wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
  padding: 12px 0;
  text-align: center;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table__body td) {
  padding: 12px 0;
}

:deep(.el-table .cell) {
  line-height: 23px;
  padding: 0 12px;
  white-space: normal;
  word-break: break-word;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f5f7fa;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  padding: 0 20px;
}

/* 自定义滚动条样式 */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 12px;
  height: 12px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #c0c4cc;
  border: 3px solid #fff;
  border-radius: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background-color: #909399;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background-color: #f4f4f5;
  border-radius: 6px;
}

/* Firefox 滚动条样式 */
:deep(.el-table__body-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc #f4f4f5;
}

/* 审核对话框样式 */
.audit-dialog :deep(.el-dialog__body) {
  padding: 30px;
}

.audit-dialog :deep(.el-dialog__header) {
  padding: 20px 30px;
  margin-right: 0;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.audit-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.audit-dialog :deep(.el-form-item__label) {
  font-weight: bold;
  color: #606266;
}

.audit-radio-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

.audit-radio-button {
  width: 48%;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.audit-radio-button :deep(.el-radio-button__inner) {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: none;
}

.audit-radio-button.approve :deep(.el-radio-button__inner) {
  background-color: #f0f9eb;
  color: #67c23a;
}

.audit-radio-button.reject :deep(.el-radio-button__inner) {
  background-color: #fef0f0;
  color: #f56c6c;
}

.audit-radio-button :deep(.el-radio-button__inner:hover) {
  opacity: 0.8;
}

.audit-radio-button
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  box-shadow: none;
}

.audit-radio-button.approve
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #67c23a;
  color: #ffffff;
}

.audit-radio-button.reject
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #f56c6c;
  color: #ffffff;
}

.audit-radio-group :deep(.el-radio-button__inner .el-icon) {
  margin-right: 5px;
}

.audit-dialog :deep(.el-textarea__inner) {
  resize: none;
  border-radius: 4px;
}

/* 收据对话框样式 */
.receipt-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.receipt-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.receipt-frame {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  min-height: 400px;
  position: relative;
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  height: 80px;
}

.logo-container {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
}

.company-logo {
  max-width: 150px;
  max-height: 100%;
  width: auto;
  height: auto;
}

.title-container {
  flex: 1;
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.receipt-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.receipt-date {
  font-size: 14px;
  margin: 5px 0 0 0;
}

.receipt-no {
  font-size: 18px;
  color: red;
  flex: 0 0 auto;
}

.receipt-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 20px;
  border: 1px solid #000;
}

.receipt-table td {
  padding: 10px;
  height: 30px;
  vertical-align: middle;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
}

.receipt-table tr:last-child td {
  border-bottom: none;
}

.receipt-table td:last-child {
  border-right: none;
  width: calc(100% - 120px);
}

.receipt-table td:first-child {
  width: 120px;
  font-weight: bold;
  background-color: #f5f5f5;
}

.amount-label {
  font-weight: bold;
  color: #303133;
  margin-right: 5px;
}

.amount-value {
  color: #606266;
}

.amount-separator {
  margin: 0 10px;
  color: #909399;
}

.expense-group {
  margin-bottom: 10px;
}

.group-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 5px;
}

.expense-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.expense-item {
  flex: 1 1 calc(33.33% - 5px);
  min-width: 150px;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 5px;
}

.item-label {
  font-weight: bold;
  color: #606266;
  margin-right: 5px;
}

.item-value {
  color: #303133;
}

.receipt-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.receipt-signature,
.receipt-stamp {
  margin-right: 100px;
  display: flex;
  align-items: center;
}

.signature-label,
.stamp-label {
  font-weight: bold;
  margin-right: 10px;
}

.signature-value {
  font-weight: normal;
  border-bottom: none;
  width: auto;
}

.stamp-image {
  width: 100px;
  height: 100px;
}

.stamp-image-container {
  position: absolute;
  right: 20px;
  bottom: -10px;
  z-index: 1;
}

/* 对话框底部样式 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.button-group {
  display: flex;
  gap: 10px;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

:deep(.el-radio-button__inner) {
  padding: 8px 15px;
  font-size: 14px;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
  box-shadow: -1px 0 0 0 #409eff;
}

/* 收费凭证样式 */
.proof-images {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.proof-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.proof-image:hover {
  transform: scale(1.1);
}

/* 自定义过滤表格样式 */
:deep(.custom-filter-table) {
  /* 表格整体样式 */
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.custom-filter-table .el-table__header-wrapper) {
  background-color: #f5f7fa;
}

:deep(.custom-filter-table .el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

:deep(.custom-filter-table .el-table__body td) {
  padding: 12px 0;
}

:deep(.custom-filter-table .el-table__column-filter-trigger) {
  margin-left: 8px;
  color: #909399;
}

:deep(.custom-filter-table .el-table__column-filter-trigger:hover) {
  color: #409eff;
}

/* 斑马纹样式 */
:deep(.custom-filter-table .el-table__body tr:nth-child(even)) {
  background-color: #fafafa;
}

/* 鼠标悬停样式 */
:deep(.custom-filter-table .el-table__body tr:hover > td) {
  background-color: #f5f7fa;
}

/* 表格内容居中对齐 */
:deep(.custom-filter-table .el-table__body td .cell) {
  text-align: center;
}

/* 调整过滤图标和列标题的间距 */
:deep(.custom-filter-table .el-table__column-filter-trigger) {
  margin-left: 5px;
}

.search-card {
  margin-bottom: 20px;
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
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__content) {
  width: 100%;
}

@media (max-width: 768px) {
  .search-buttons {
    justify-content: flex-start;
  }
}

.custom-dropdown-menu {
  min-width: 400px;
}

.dropdown-columns {
  display: flex;
}

.dropdown-column {
  flex: 1;
  padding: 10px;
}

.el-dropdown-menu__item {
  padding: 5px 10px;
}
</style>
