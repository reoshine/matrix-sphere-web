<template>
  <div class="deploy-container">
    <el-card shadow="never" class="process-card">
      <div class="process-wrapper">
        <el-steps :active="deployProcessActive" align-center finish-status="success" class="custom-steps">
          <el-step
              v-for="step in steps"
              :key="step.id"
              :title="step.title"
              :icon="getStepIcon(step)"
              :status="step.status"
          >
            <template slot="description">
              <span v-if="step.description" class="step-error">{{ step.description }}</span>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-card>

    <el-card shadow="never" class="module-card">
      <div slot="header" class="card-header-flex">
        <span class="header-title"><i class="el-icon-success text-success"></i> 已部署分支 (Feature)</span>
        <div class="header-actions">
          <el-button type="text" icon="el-icon-document" @click="getDepLoyLogList">查看部署历史</el-button>
        </div>
      </div>

      <div class="toolbar-container">
        <div class="left-actions">
          <el-tooltip content="将选中分支从环境中移除" placement="top">
            <el-button type="warning" plain icon="el-icon-remove-outline" size="small" @click="withdrawBranch" :disabled="isDisabled">退出分支</el-button>
          </el-tooltip>
          <el-tooltip content="重新构建并部署选中分支" placement="top">
            <el-button type="primary" plain icon="el-icon-refresh" size="small" @click="reDeploy" :disabled="isDisabled">重新部署</el-button>
          </el-tooltip>
          <el-divider direction="vertical"></el-divider>
          <el-button type="danger" plain icon="el-icon-s-flag" size="small" @click="deployMain">紧急部署 Main 分支</el-button>
        </div>
      </div>

      <el-table
          :data="deployInfo.featureBranchList"
          @selection-change="selectedDeployed"
          border
          stripe
          highlight-current-row
          style="width: 100%"
          empty-text="当前环境暂无已部署的 Feature 分支"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="branchName" label="分支名称" min-width="200">
          <template slot-scope="scope">
            <el-tag size="medium" type="success" effect="plain">{{ scope.row.branchName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createByName" label="创建人" width="120" align="center" />
        <el-table-column prop="gmtCreate" label="创建时间" width="160" align="center" />
      </el-table>
    </el-card>

    <el-card shadow="never" class="module-card">
      <div slot="header" class="card-header-flex">
        <span class="header-title"><i class="el-icon-time"></i> 待部署分支</span>
        <el-button type="primary" size="small" icon="el-icon-upload2" @click="deploy" :disabled="deployBranchBtnIsDisabled">部署选中分支</el-button>
      </div>

      <el-table
          :data="unDeployedBranchList"
          @selection-change="getUnDeployBranchIds"
          ref="selectedStatus"
          border
          stripe
          style="width: 100%"
          empty-text="暂无待部署的分支"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="branchName" label="分支名称" min-width="200">
          <template slot-scope="scope">
            <span style="font-weight: 600">{{ scope.row.branchName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createByName" label="创建人" width="120" align="center" />
        <el-table-column prop="gmtCreate" label="创建时间" width="160" align="center" />
      </el-table>
    </el-card>

    <el-drawer
        title="部署历史记录"
        :visible.sync="dialog"
        direction="rtl"
        size="600px"
        custom-class="log-drawer"
    >
      <div class="log-list">
        <div v-for="(deployLog, index) in deployLogList" :key="index" class="log-item">
          <el-card shadow="hover" class="log-card">
            <div slot="header" class="log-header">
              <span class="log-time"><i class="el-icon-time"></i> {{ deployLog.deployTime }}</span>
              <el-tag size="small" effect="dark" :type="getDeployStatusType(deployLog.deployStatus)">
                {{ getDeployStatusText(deployLog.deployStatus) }}
              </el-tag>
            </div>

            <el-descriptions :column="1" border size="mini">
              <el-descriptions-item label="操作人">{{ deployLog.deployByName }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ deployLog.deployType }}</el-descriptions-item>
              <el-descriptions-item label="Release 分支" v-if="deployLog.releaseBranchName">
                {{ deployLog.releaseBranchName }}
              </el-descriptions-item>
              <el-descriptions-item label="Feature 分支">
                <div class="tag-group">
                  <el-tag v-for="item in deployLog.featureBranchNameList" :key="item" size="mini" type="info">{{ item }}</el-tag>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="失败原因" v-if="deployLog.deployStatus === 3">
                <span class="text-danger">{{ deployLog.errorMessage }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  deploy,
  getDepLoyLogList,
  getDeployMaster,
  getDeployRecord,
  getUnDeployedBranchList,
  sseClose,
  getDeployStepList
} from "@/views/applicationManagement/applicationList/api";
import { EventSourcePolyfill } from 'event-source-polyfill'
import * as CollUtils from '@/util/CollUtils'

// 步骤状态常量
const STEP_STATUS_MAP = {
  0: 'wait',    // 初始化
  1: 'process', // 进行中
  2: 'success', // 成功
  3: 'error'    // 失败
};

export default {
  name: "deployByEnv",
  props : {
    env: String,
    applicationId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      // 按钮状态
      isDisabled: true,
      deployBranchBtnIsDisabled: true,

      // 业务数据
      deployMaster: {},
      deployInfo: {
        featureBranchList: []
      },
      unDeployedBranchList: [],

      // 步骤条数据
      deployProcessActive: 0,
      steps: [
        { id: 'merge', title: '分支合并', status: 'wait', icon: 'el-icon-files' },
        { id: 'build', title: '代码构建', status: 'wait', icon: 'el-icon-cpu' },
        { id: 'publish', title: '容器部署', status: 'wait', icon: 'el-icon-upload' },
        { id: 'finish', title: '完成上线', status: 'wait', icon: 'el-icon-check' }
      ],

      // 日志抽屉
      dialog: false,
      deployLogList: [],

      // SSE连接对象
      eventSource: null,

      // 选中项 ID 集合
      unDeployedBranchIds: [],
      deployedBranchIds: []
    };
  },

  computed: {
    deployEnvironment() {
      return this.env;
    }
  },

  methods: {
    // --- 辅助 UI 方法 ---
    getStepIcon(step) {
      if (step.status === 'process') return 'el-icon-loading';
      if (step.status === 'error') return 'el-icon-close';
      if (step.status === 'success') return 'el-icon-check';
      return step.icon || 'el-icon-more';
    },

    getDeployStatusType(status) {
      const map = { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' };
      return map[status] || 'info';
    },

    getDeployStatusText(status) {
      const map = { 0: '初始化', 1: '部署中', 2: '成功', 3: '失败' };
      return map[status] || '未知';
    },

    // --- 核心 SSE 状态机逻辑 ---

    updateStepState(item) {
      const step = this.steps.find(s => s.id === item.stepCode);
      if (!step) return;

      step.status = STEP_STATUS_MAP[item.stepStatus] || 'wait';
      step.description = (step.status === 'error') ? item.errorMessage : '';

      // 计算当前激活步骤 (找到第一个非成功的)
      const activeIndex = this.steps.findIndex(s => s.status !== 'success');
      this.deployProcessActive = (activeIndex === -1) ? 4 : activeIndex;

      // 终态关闭连接
      if (item.stepCode === 'finish' && (item.stepStatus === 2 || item.stepStatus === 3)) {
        this.sseClose(this.applicationId);
      }
    },

    processStepList(stepList) {
      if (!stepList || stepList.length === 0) return;
      ['merge', 'build', 'publish', 'finish'].forEach(code => {
        const stepUpdate = stepList.find(item => item.stepCode === code);
        if (stepUpdate) this.updateStepState(stepUpdate);
      });
    },

    clearDeployStatus() {
      this.deployProcessActive = 0;
      this.steps.forEach(s => {
        s.status = 'wait';
        s.description = '';
      });
    },

    // --- API 交互 ---

    listenDeployStepMessage() {
      this.eventSource.onmessage = (res => {
        try {
          this.updateStepState(JSON.parse(res.data));
        } catch (e) {
          console.error("SSE Parse Error:", e);
        }
      })
    },

    getDeployStepList() {
      getDeployStepList({
        applicationId: this.applicationId,
        deployEnvironment: this.deployEnvironment
      }).then(res => {
        if (res.data.code === 2000 && CollUtils.isNotEmpty(res.data.body)) {
          this.processStepList(res.data.body);
        }
      });
    },

    async getDeployMaster(applicationId, activeName) {
      let result;
      try {
        const res = await getDeployMaster({ applicationId: applicationId, deployEnvironment: activeName });
        if (res.data.code === 2000) {
          this.deployMaster = res.data.body;
          result = res.data.body;
        }
      } catch (e) { console.error(e) }

      if (result) {
        await this.getDeployRecord(result.id);
      } else {
        this.$emit('deployInfoUpdated', { deployInfo: {}, featureBranchList: [] });
      }
      return result;
    },

    async getDeployRecord(deployMasterId) {
      let result;
      await getDeployRecord({ deployMasterId }).then(res => {
        if (res.data.code === 2000) {
          this.deployInfo = res.data.body;
          result = res.data.body;
          this.$emit('deployInfoUpdated', this.deployInfo);
        }
      });
      return result;
    },

    getUnDeployedBranchList(applicationId) {
      getUnDeployedBranchList({
        applicationId: applicationId,
        deployEnvironment: this.deployEnvironment
      }).then(res => {
        if (res.data.code === 2000) {
          this.unDeployedBranchList = res.data.body;
        }
      });
    },

    getDepLoyLogList() {
      this.dialog = true;
      getDepLoyLogList({
        applicationId: this.applicationId,
        deployEnvironment: this.deployEnvironment,
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployLogList = res.data.body;
        }
      });
    },

    // --- 部署动作 ---

    async executeDeployAction(actionType) {
      await this.clearDeployStatus();
      await this.createSseConnect(this.applicationId);

      // 根据类型决定分支ID
      let ids = [];
      if (actionType === '提交分支部署') {
        ids = this.unDeployedBranchIds.concat(this.deployInfo.featureBranchList.map(i => i.id));
      } else if (actionType === 'main分支部署') {
        ids = [];
      } else {
        ids = this.deployedBranchIds; // 退出 或 重部署
      }

      try {
        const res = await deploy({
          applicationId: this.applicationId,
          branchIds: ids,
          deployEnvironment: this.deployEnvironment,
          deployType: actionType
        });

        if (res.data.code === 2000) {
          const result = res.data.body;
          this.listenDeployStepMessage();

          // 刷新数据
          await this.getUnDeployedBranchList(result.application.id);
          await this.getDeployRecord(result.deployMaster.id);

          // 清空选择
          if (this.$refs.selectedStatus) this.$refs.selectedStatus.clearSelection();

        } else {
          this.$message.error(res.data.message);
          this.sseClose(this.applicationId);
        }
      } catch (err) {
        this.$message.error('操作失败: ' + err);
        this.sseClose(this.applicationId);
      }
    },

    deploy() { this.executeDeployAction('提交分支部署'); },
    withdrawBranch() { this.executeDeployAction('退出分支部署'); },
    reDeploy() {
      if (!this.deployedBranchIds.length) return this.$message.warning('请选择要重部署的分支');
      this.executeDeployAction('重新部署');
    },
    deployMain() { this.executeDeployAction('main分支部署'); },

    // --- 表格选择 ---
    getUnDeployBranchIds(val) {
      this.unDeployedBranchIds = val.map(i => i.id);
      this.deployBranchBtnIsDisabled = this.unDeployedBranchIds.length <= 0;
    },
    selectedDeployed(val) {
      this.deployedBranchIds = val.map(i => i.id);
      this.isDisabled = this.deployedBranchIds.length <= 0;
    },

    // --- SSE 管理 ---
    createSseConnect(applicationId) {
      if (this.eventSource) this.eventSource.close();
      this.eventSource = new EventSourcePolyfill(`http://192.168.0.10:7002/matrix-sphere/sse/connect/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`,
          heartbeatTimeout: 10000000
        }
      });
      this.eventSource.onerror = () => this.eventSource.close();
    },

    sseClose(applicationId) {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      sseClose(applicationId);
    }
  },

  mounted() {
    this.getUnDeployedBranchList(this.applicationId);
    this.getDeployMaster(this.applicationId, this.deployEnvironment).then(data => {
      // 如果当前处于部署中，恢复SSE连接
      if (data && data.deployStatus === 1) {
        this.createSseConnect(this.applicationId);
        this.listenDeployStepMessage();
      }
    });
    this.getDeployStepList();
  },

  beforeDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
      this.sseClose(this.applicationId);
    }
  }
};
</script>

<style lang="less" scoped>
.deploy-container {
  /* 无需 padding，父组件已经给了 */
}

/* 卡片通用样式修正 */
.process-card, .module-card {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;

  ::v-deep .el-card__header {
    padding: 15px 20px;
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
  }

  ::v-deep .el-card__body {
    padding: 20px;
  }
}

/* 1. 进度卡片 */
.process-card {
  background: #fdfdfd; /* 极淡的背景区分 */
  .process-wrapper {
    padding: 10px 40px;
  }
  .step-error {
    color: #F56C6C;
    font-size: 12px;
  }
}

/* 2. 模块卡片头 */
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-title {
    font-size: 15px;
    font-weight: bold;
    color: #303133;

    i { margin-right: 6px; }
    .text-success { color: #67C23A; }
  }
}

/* 3. 工具栏 */
.toolbar-container {
  margin-bottom: 15px;
  display: flex;
  align-items: center;

  .left-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

/* 4. 日志抽屉列表 */
.log-list {
  padding: 20px;

  .log-item {
    margin-bottom: 15px;
  }

  .log-card {
    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .log-time {
      font-size: 13px;
      font-weight: bold;
      color: #606266;
    }

    .tag-group {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .text-danger { color: #F56C6C; }
  }
}
</style>