<template>
  <div class="dashboard-container">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">客户总数</div>
              <div class="card-value">{{ statistics.totalCustomers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-icon income">
              <el-icon><Money /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">本月收入</div>
              <div class="card-value">¥{{ statistics.monthlyIncome }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-icon pending">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">待审核费用</div>
              <div class="card-value">{{ statistics.pendingExpenses }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">即将到期合同</div>
              <div class="card-value">{{ statistics.expiringContracts }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>收入趋势</span>
              <el-radio-group v-model="incomeTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- 使用echarts绘制收入趋势图 -->
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>客户分布</span>
              <el-select v-model="customerDistType" size="small">
                <el-option label="按地区" value="region" />
                <el-option label="按企业类型" value="type" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <!-- 使用echarts绘制饼图 -->
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作区 -->
    <el-row :gutter="20" class="quick-access">
      <el-col :span="24">
        <el-card class="quick-card">
          <template #header>
            <div class="quick-header">
              <span>快捷操作</span>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-row :gutter="20" class="recent-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="recent-card">
          <template #header>
            <div class="recent-header">
              <span>待处理事项</span>
              <el-button text>查看全部</el-button>
            </div>
          </template>
          <el-table
            :data="pendingItems"
            style="width: 100%"
            :show-header="false"
          >
            <el-table-column width="40">
              <template #default="scope">
                <el-tag
                  :type="scope.row.type === 'expense' ? 'warning' : 'info'"
                  size="small"
                  effect="plain"
                >
                  {{ scope.row.type === "expense" ? "费" : "客" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" />
            <el-table-column prop="date" width="100" align="right" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="recent-card">
          <template #header>
            <div class="recent-header">
              <span>最近更新</span>
              <el-button text>查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in recentActivities"
              :key="index"
              :type="activity.type"
              :timestamp="activity.timestamp"
              :color="activity.type === 'primary' ? '#409EFF' : undefined"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserFilled, Money, Document, Warning } from "@element-plus/icons-vue";

// 定义活动类型
type ActivityType = "primary" | "success" | "warning" | "info" | "danger";

interface Activity {
  content: string;
  timestamp: string;
  type: ActivityType; // 使用限定的类型
}

// 统计数据
const statistics = ref({
  totalCustomers: 0,
  monthlyIncome: 0,
  pendingExpenses: 0,
  expiringContracts: 0
});

// 图表相关
const incomeTimeRange = ref("month");
const customerDistType = ref("region");

// 待处理事项
const pendingItems = ref([
  { type: "expense", title: "待审核费用申请 - XX公司", date: "2024-03-20" },
  { type: "customer", title: "客户合同即将到期 - YY企业", date: "2024-03-21" }
]);

// 最近活动
const recentActivities = ref<Activity[]>([
  {
    content: "新增客户：XX科技有限公司",
    timestamp: "2024-03-20 10:00",
    type: "primary"
  },
  {
    content: "审核通过费用申请：YY企业",
    timestamp: "2024-03-20 09:30",
    type: "success"
  },
  {
    content: "待审核费用申请：ZZ公司",
    timestamp: "2024-03-20 09:00",
    type: "warning"
  }
]);

// 获取统计数据
const fetchStatistics = async () => {
  // TODO: 调用后端API获取数据
};

onMounted(() => {
  fetchStatistics();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

/* 数据概览卡片样式 */
.data-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.card-icon :deep(i) {
  font-size: 30px;
  color: #fff;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

/* 图表区域样式 */
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
}

/* 快捷操作区样式 */
.quick-access {
  margin-bottom: 20px;
}

.quick-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

/* 最近动态样式 */
.recent-section {
  margin-bottom: 20px;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-card {
  height: 400px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .overview-card {
    margin-bottom: 15px;
  }

  .chart-card,
  .recent-card {
    height: auto;
    margin-bottom: 15px;
  }
}
</style>
