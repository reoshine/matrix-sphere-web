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
    env: { type: String, required: true },
    applicationId: { type: [String, Number], required: true }
  },
  data() {
    return {
      isDisabled: true,
      deployBranchBtnIsDisabled: true,
      deployMaster: {},
      deployInfo: {featureBranchList: []},
      unDeployedBranchList: [],

      deployProcessActive: 0,
      steps: [
        {id: 'merge', title: '分支合并', status: 'wait', icon: ''},
        {id: 'build', title: '代码构建', status: 'wait', icon: ''},
        {id: 'publish', title: '容器部署', status: 'wait', icon: ''},
        {id: 'finish', title: '完成上线', status: 'wait', icon: ''}
      ],

      dialog: false,
      deployLogList: [],
      eventSource: null,
      pollingTimer: null,
      unDeployedBranchIds: [],
      deployedBranchIds: []
    };
  },

  methods: {
    getStepIcon(step) {
      if (step.status === 'process') return 'el-icon-loading';
      if (step.status === 'success') return 'el-icon-check';
      if (step.status === 'error') return 'el-icon-close';
      return step.icon;
    },

    updateStepState(item) {
      const index = this.steps.findIndex(s => s.id === item.stepCode);
      if (index === -1) return;

      const statusKey = Number(item.stepStatus);
      const newStatus = STEP_STATUS_MAP[statusKey] || 'wait';
      const errorMessage = (newStatus === 'error') ? item.errorMessage : '';

      const updatedStep = {
        ...this.steps[index],
        status: newStatus,
        description: errorMessage
      };
      this.$set(this.steps, index, updatedStep);

      // 链式激活：如果当前成功且不是最后一步，预判下一步为 process
      if (newStatus === 'success' && index < this.steps.length - 1) {
        const nextIndex = index + 1;
        const nextStep = this.steps[nextIndex];
        if (nextStep.status === 'wait') {
          this.$set(this.steps, nextIndex, {...nextStep, status: 'process'});
        }
      }

      this.recalcActiveIndex();

      // ★★★ 优化逻辑：防止SSE连上的一瞬间接收到旧的成功消息导致误关 ★★★
      // 只有当前步是最后一步，且状态是成功时，才关闭
      // 或者是 Error 状态
      if (newStatus === 'error') {
        this.closeResources();
        this.refreshData();
      } else if (item.stepCode === 'finish' && newStatus === 'success') {
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

    createSseConnect(applicationId) {
      this.closeResources();
      // 使用后端提供的SSE接口
      const sseUrl = `http://192.168.0.10:7002/matrix-sphere/sse/connect/${applicationId}`;
      console.log('SSE 连接中...', sseUrl);

      try {
        this.eventSource = new EventSourcePolyfill(sseUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`,
            heartbeatTimeout: 3600000
          }
        });

        this.eventSource.onopen = () => {
          console.log('SSE 连接成功');
        };

        this.eventSource.onmessage = (res) => {
          try {
            console.log('SSE 收到消息:', res.data);
            this.updateStepState(JSON.parse(res.data));
          } catch (e) {
            console.error(e);
          }
        };

        this.eventSource.onerror = (err) => {
          console.error('SSE 错误', err);
          this.handleSseError();
        };
      } catch (e) {
        this.startPolling();
      }
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
      console.log('降级为轮询模式');
      this.pollCurrentStatus();
      this.pollingTimer = setInterval(() => {
        this.pollCurrentStatus();
      }, 3000);
    },

    pollCurrentStatus() {
      this.getDeployStepList();
      // 这里调用 Master 状态检查，如果是最终状态则结束轮询
      getDeployMaster({applicationId: this.applicationId, env: this.env}).then(res => {
        if (res.data.code === 2000 && res.data.body) {
          const status = res.data.body.deployStatus;
          // 2:成功, 3:失败
          if (status === 2 || status === 3) {
            this.closeResources();
            this.refreshData();
          }
        }
      });
    },

    closeResources() {
      console.log('正在关闭 SSE 和轮询资源');
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
      // 通知后端关闭连接 (可选，视后端逻辑而定)
      sseClose(this.applicationId).catch(() => {
      });
    },

    refreshData() {
      console.log('刷新数据...');
      this.getUnDeployedBranchList(this.applicationId);
      // 务必确保这里使用的是最新的 deployMaster.id
      if (this.deployMaster && this.deployMaster.id) {
        console.log('刷新部署详情, ID:', this.deployMaster.id);
        this.getDeployRecord(this.deployMaster.id);
      }
    },

    // --- API Calls ---

    getDeployStepList() {
      getDeployStepList({
        applicationId: this.applicationId,
        env: this.env
      }).then(res => {
        if (res.data.code === 2000 && CollUtils.isNotEmpty(res.data.body)) {
          this.processStepList(res.data.body);
        }
      });
    },

    async getDeployMaster(applicationId, activeName) {
      try {
        const res = await getDeployMaster({applicationId, env: activeName});
        if (res.data.code === 2000) {
          this.deployMaster = res.data.body || {};
          return this.deployMaster;
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    },

    async getDeployRecord(deployMasterId) {
      if (!deployMasterId) return;
      await getDeployRecord(deployMasterId).then(res => {
        if (res.data.code === 2000) {
          this.deployInfo = res.data.body;
          this.$emit('deployInfoUpdated', this.deployInfo);
        }
      });
    },

    getUnDeployedBranchList(applicationId) {
      getUnDeployedBranchList({applicationId, env: this.env}).then(res => {
        if (res.data.code === 2000) {
          this.unDeployedBranchList = res.data.body;
        }
      });
    },

    getDepLoyLogList() {
      this.dialog = true;
      getDepLoyLogList({applicationId: this.applicationId, env: this.env}).then(res => {
        if (res.data.code === 2000) this.deployLogList = res.data.body;
      });
    },

    // --- Action Handlers (★★★ 核心修复区域 ★★★) ---

    async executeDeployAction(actionType) {
      // 1. 先把UI状态重置
      this.clearDeployStatus();

      // 注意：这里不要先调用 createSseConnect，否则会收到旧的消息！

      let ids = [];
      if (actionType === '提交分支部署') {
        ids = this.unDeployedBranchIds.concat(this.deployInfo.featureBranchList.map(i => i.id));
      } else if (actionType === 'main分支部署') {
        ids = [];
      } else {
        // 重新部署
        ids = this.deployedBranchIds;
      }

      try {
        // 2. 先请求接口创建部署
        const res = await deploy({
          applicationId: this.applicationId,
          branchIds: ids,
          env: this.env,
          deployType: actionType
        });

        if (res.data.code === 2000) {
          const result = res.data.body;

          // 3. 关键修复：确保先更新 deployMaster，拿到新的ID
          if (result && result.deployMaster) {
            this.deployMaster = result.deployMaster;
            console.log('新部署创建成功，ID:', this.deployMaster.id);
          }

          // 4. 清空选中状态
          if (this.$refs.selectedStatus) this.$refs.selectedStatus.clearSelection();

          // 5. ★★★ 只有在新部署创建成功后，才开始建立 SSE 连接 ★★★
          // 这样保证连上后收到的都是新 ID 的消息
          this.createSseConnect(this.applicationId);

        } else {
          this.$message.error(res.data.message);
          // 失败了就不连SSE了，重置UI
          this.deployProcessActive = 0;
          this.steps.forEach(s => s.status = 'wait');
        }
      } catch (err) {
        console.error(err);
        this.$message.error('操作失败: ' + err);
        this.closeResources();
      }
    },

    deploy() {
      this.executeDeployAction('提交分支部署');
    },
    withdrawBranch() {
      this.executeDeployAction('退出分支部署');
    },
    reDeploy() {
      if (!this.deployedBranchIds.length) return this.$message.warning('请选择要重部署的分支');
      this.executeDeployAction('重新部署');
    },
    deployMain() {
      this.executeDeployAction('main分支部署');
    },

    getUnDeployBranchIds(val) {
      this.unDeployedBranchIds = val.map(i => i.id);
      this.deployBranchBtnIsDisabled = this.unDeployedBranchIds.length <= 0;
    },
    selectedDeployed(val) {
      this.deployedBranchIds = val.map(i => i.id);
      this.isDisabled = this.deployedBranchIds.length <= 0;
    },
    getDeployStatusType(status) {
      const map = {0: 'info', 1: 'primary', 2: 'success', 3: 'danger'};
      return map[status] || 'info';
    },
    getDeployStatusText(status) {
      const map = {0: '初始化', 1: '部署中', 2: '成功', 3: '失败'};
      return map[status] || '未知';
    }
  },

  mounted() {
    this.getUnDeployedBranchList(this.applicationId);

    // 获取步骤条状态
    this.getDeployStepList();

    // 初始化检查：如果页面刷新时正在部署中，则恢复连接
    this.getDeployMaster(this.applicationId, this.env).then(master => {
      if (master) {
        if (master.deployStatus === 1) {
          this.createSseConnect(this.applicationId);
        }
        this.getDeployRecord(master.id);
      }
    });
  },

  beforeDestroy() {
    this.closeResources();
  }
};
</script>

<style lang="less" scoped>
/* 你的样式保持不变 */
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

  ::v-deep .el-step__line {
    background-color: #C0C4CC !important;
  }

  ::v-deep .el-step__head.is-success .el-step__icon {
    background-color: #67C23A;
    color: #fff;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    line-height: 24px;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
  }

  ::v-deep .el-step__head.is-error .el-step__icon {
    background-color: #F56C6C;
    color: #fff;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    line-height: 24px;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
  }

  ::v-deep .el-step__head.is-error .el-step__title,
  ::v-deep .el-step__head.is-error .el-step__description {
    color: #F56C6C;
  }

  ::v-deep .el-step__head.is-process .el-step__icon {
    background-color: #fff;
    border: 2px solid #303133;
    color: #303133;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    line-height: 20px;
    text-align: center;
    font-size: 14px;
  }

  ::v-deep .el-step__head.is-wait .el-step__icon {
    border: 2px solid #C0C4CC;
    color: #C0C4CC;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    line-height: 20px;
    text-align: center;
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

    .text-danger {
      color: #F56C6C;
    }
  }
}
</style>