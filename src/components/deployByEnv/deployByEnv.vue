<template>
  <div class="deploy-container">
    <el-card shadow="never" class="process-card">
      <div class="process-wrapper">
        <el-steps :active="deployProcessActive" align-center class="custom-steps">
          <el-step
              v-for="(step, index) in steps"
              :key="step.id"
              :title="step.title"
              :icon="getStepIcon(step)"
              :status="step.status"
              :class="{ 'step-line-success': isLineSuccess(index) }"
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
        <el-table-column prop="gmtCreate" label="创建时间" width="170" align="center" />
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
        <el-table-column prop="gmtCreate" label="创建时间" width="170" align="center" />
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

const STEP_STATUS_MAP = {
  0: 'wait',
  1: 'process',
  2: 'success',
  3: 'error'
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
      isDisabled: true,
      deployBranchBtnIsDisabled: true,
      deployMaster: {},
      deployInfo: { featureBranchList: [] },
      unDeployedBranchList: [],

      deployProcessActive: 0,
      steps: [
        { id: 'merge', title: '分支合并', status: 'wait', icon: 'el-icon-files' },
        { id: 'build', title: '代码构建', status: 'wait', icon: 'el-icon-cpu' },
        { id: 'publish', title: '容器部署', status: 'wait', icon: 'el-icon-upload' },
        { id: 'finish', title: '完成上线', status: 'wait', icon: 'el-icon-video-play' }
      ],

      dialog: false,
      deployLogList: [],
      eventSource: null,
      pollingTimer: null,
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
    getStepIcon(step) {
      if (step.status === 'error') return 'el-icon-close';
      if (step.status === 'process') return 'el-icon-loading';
      if (step.status === 'success') return 'el-icon-check';
      return step.icon;
    },

    // 修改点 2: 判断线条是否应该变绿
    // 逻辑：当前步骤成功 且 下一步骤也成功
    isLineSuccess(index) {
      const currentStep = this.steps[index];
      const nextStep = this.steps[index + 1];

      // 如果没有下一步（最后一步），不需要关心线
      if (!nextStep) return false;

      // 只有两端都 success，线才变绿
      return currentStep.status === 'success' && nextStep.status === 'success';
    },

    updateStepState(item) {
      const index = this.steps.findIndex(s => s.id === item.stepCode);
      if (index === -1) return;

      const currentStep = { ...this.steps[index] };
      const statusKey = Number(item.stepStatus);
      const newStatus = STEP_STATUS_MAP[statusKey] || 'wait';

      currentStep.status = newStatus;
      currentStep.description = (newStatus === 'error') ? item.errorMessage : '';

      this.$set(this.steps, index, currentStep);

      if (newStatus === 'error') {
        this.deployProcessActive = index;
        this.closeResources();
        this.refreshData();
        return;
      }

      if (newStatus === 'success' && index < this.steps.length - 1) {
        const nextIndex = index + 1;
        const nextStep = { ...this.steps[nextIndex] };
        if (nextStep.status === 'wait') {
          nextStep.status = 'process';
          this.$set(this.steps, nextIndex, nextStep);
        }
      }

      this.recalcActiveIndex();

      if (item.stepCode === 'finish' && newStatus === 'success') {
        this.closeResources();
        this.refreshData();
      }
    },

    recalcActiveIndex() {
      const firstNotSuccess = this.steps.findIndex(s => s.status !== 'success');
      this.deployProcessActive = firstNotSuccess === -1 ? this.steps.length : firstNotSuccess;
    },

    processStepList(stepList) {
      if (!stepList || stepList.length === 0) return;
      const stepOrder = ['merge', 'build', 'publish', 'finish'];
      stepOrder.forEach(code => {
        const stepData = stepList.find(item => item.stepCode === code);
        if (stepData) {
          this.updateStepState(stepData);
        }
      });
    },

    clearDeployStatus() {
      this.deployProcessActive = 0;
      this.steps = this.steps.map((s, index) => ({
        ...s,
        status: index === 0 ? 'process' : 'wait',
        description: ''
      }));
    },

    // === 资源管理 ===
    createSseConnect(applicationId) {
      this.closeResources();
      const sseUrl = `http://192.168.0.10:7002/matrix-sphere/sse/connect/${applicationId}`;

      this.eventSource = new EventSourcePolyfill(sseUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`,
          heartbeatTimeout: 3600000
        }
      });

      this.eventSource.addEventListener('connect', () => console.log("SSE Connected"));

      this.eventSource.onmessage = (res => {
        try {
          const data = JSON.parse(res.data);
          this.updateStepState(data);
        } catch (e) {
          console.error("SSE Parse Error:", e);
        }
      });

      this.eventSource.onerror = (err) => {
        console.warn("SSE Error -> Polling", err);
        this.handleSseError();
      };
    },

    handleSseError() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      this.startPolling();
    },

    startPolling() {
      if (this.pollingTimer) return;
      this.pollCurrentStatus();
      this.pollingTimer = setInterval(() => {
        this.pollCurrentStatus();
      }, 3000);
    },

    pollCurrentStatus() {
      this.getDeployStepList();
      getDeployMaster({
        applicationId: this.applicationId,
        deployEnvironment: this.deployEnvironment
      }).then(res => {
        if (res.data.code === 2000 && res.data.body) {
          const status = res.data.body.deployStatus;
          if (status === 2 || status === 3) {
            this.closeResources();
            this.refreshData();
          }
        }
      }).catch(() => {});
    },

    closeResources() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
      sseClose(this.applicationId).catch(() => {});
    },

    // === API Calls ===
    refreshData() {
      this.getUnDeployedBranchList(this.applicationId);
      if (this.deployMaster && this.deployMaster.id) {
        this.getDeployRecord(this.deployMaster.id);
      }
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
        const res = await getDeployMaster({ applicationId, deployEnvironment: activeName });
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

    async executeDeployAction(actionType) {
      this.clearDeployStatus();
      this.createSseConnect(this.applicationId);

      let ids = [];
      if (actionType === '提交分支部署') {
        ids = this.unDeployedBranchIds.concat(this.deployInfo.featureBranchList.map(i => i.id));
      } else if (actionType === 'main分支部署') {
        ids = [];
      } else {
        ids = this.deployedBranchIds;
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
          await this.getUnDeployedBranchList(result.application.id);
          await this.getDeployRecord(result.deployMaster.id);
          if (this.$refs.selectedStatus) this.$refs.selectedStatus.clearSelection();
        } else {
          this.$message.error(res.data.message);
          this.closeResources();
        }
      } catch (err) {
        this.$message.error('操作失败: ' + err);
        this.closeResources();
      }
    },

    deploy() { this.executeDeployAction('提交分支部署'); },
    withdrawBranch() { this.executeDeployAction('退出分支部署'); },
    reDeploy() {
      if (!this.deployedBranchIds.length) return this.$message.warning('请选择要重部署的分支');
      this.executeDeployAction('重新部署');
    },
    deployMain() { this.executeDeployAction('main分支部署'); },

    getUnDeployBranchIds(val) {
      this.unDeployedBranchIds = val.map(i => i.id);
      this.deployBranchBtnIsDisabled = this.unDeployedBranchIds.length <= 0;
    },
    selectedDeployed(val) {
      this.deployedBranchIds = val.map(i => i.id);
      this.isDisabled = this.deployedBranchIds.length <= 0;
    },

    getDeployStatusType(status) {
      const map = { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' };
      return map[status] || 'info';
    },
    getDeployStatusText(status) {
      const map = { 0: '初始化', 1: '部署中', 2: '成功', 3: '失败'};
      return map[status] || '未知';
    }
  },

  mounted() {
    this.getUnDeployedBranchList(this.applicationId);
    this.getDeployMaster(this.applicationId, this.deployEnvironment).then(data => {
      if (data && data.deployStatus === 1) {
        this.createSseConnect(this.applicationId);
      }
    });
    this.getDeployStepList();
  },

  beforeDestroy() {
    this.closeResources();
  }
};
</script>

<style lang="less" scoped>
.deploy-container {
  padding: 0 10px;
}

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

.process-card {
  background: #fdfdfd;

  .process-wrapper {
    padding: 10px 20px;
  }

  /* * =========================================
   * 核心样式修复与线条颜色接管
   * =========================================
   */

  /* 1. 全局强制重置线条颜色为灰色 */
  /* 去掉 Element UI 默认的进度条填充效果，完全由我们控制背景色 */

  ::v-deep .el-step__line-inner {
    display: none !important;
  }

  ::v-deep .el-step__line {
    background-color: #C0C4CC !important; /* 默认灰 */
  }

  /* 2. 只有当父级有 step-line-success 类时，线条才变绿 */

  ::v-deep .el-step.step-line-success {
    .el-step__line {
      background-color: #67C23A !important; /* 成功绿 */
    }
  }

  /* 3. 成功状态图标 (绿底白钩) */

  ::v-deep .el-step__head.is-success {
    .el-step__icon {
      background-color: #67C23A;
      color: #fff;
      border-color: #67C23A;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 14px;
      font-weight: bold;
      display: inline-flex; /* 修复居中 */
      align-items: center;
      justify-content: center;
    }

    .el-step__line {
      /* 注意：这里不能写颜色，颜色由上面的 step-line-success 控制 */
    }
  }

  /* 4. 失败状态图标 (红底白叉) */

  ::v-deep .el-step__head.is-error {
    .el-step__icon {
      background-color: #F56C6C;
      color: #fff;
      border-color: #F56C6C;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 14px;
      font-weight: bold;
      display: inline-flex; /* 修复居中 */
      align-items: center;
      justify-content: center;
    }

    .el-step__title {
      color: #F56C6C;
    }

    .el-step__description {
      color: #F56C6C;
    }
  }

  /* 5. 进行中状态 (无边框 Loading) */

  ::v-deep .el-step__head.is-process {
    .el-step__icon {
      background-color: #fff;
      border: none;
      color: #409EFF;
      width: 24px;
      height: 24px;
      font-size: 24px;
      display: inline-flex; /* 修复居中 */
      align-items: center;
      justify-content: center;
    }

    .el-step__icon-inner {
      font-weight: normal;
    }
  }

  /* 6. 等待状态 */

  ::v-deep .el-step__head.is-wait {
    .el-step__icon {
      width: 24px;
      height: 24px;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  .step-error {
    color: #F56C6C;
    font-size: 12px;
    margin-top: 5px;
    display: block;
    font-weight: bold;
  }
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-title {
    font-size: 15px;
    font-weight: bold;
    color: #303133;

    i {
      margin-right: 6px;
    }

    .text-success {
      color: #67C23A;
    }
  }
}

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

    .text-danger {
      color: #F56C6C;
    }
  }
}
</style>