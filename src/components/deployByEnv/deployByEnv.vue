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
            <el-button type="warning"
                       plain
                       icon="el-icon-remove-outline"
                       size="small" @click="withdrawBranch"
                       :disabled="isDisabled"
                       :loading="btnLoading">退出分支</el-button>
          </el-tooltip>
          <el-tooltip content="重新构建并部署选中分支" placement="top">
            <el-button type="primary"
                       plain
                       icon="el-icon-refresh"
                       size="small"
                       @click="reDeploy"
                       :disabled="isDisabled"
                       :loading="btnLoading">重新部署</el-button>
          </el-tooltip>
          <el-divider direction="vertical"></el-divider>
          <el-button type="danger"
                     plain
                     icon="el-icon-s-flag"
                     size="small"
                     @click="deployMain"
                     :loading="btnLoading">紧急部署 Main 分支</el-button>
        </div>
      </div>

      <el-table
          v-loading="loadingDeployed"
          element-loading-text="更新中..."
          element-loading-spinner="el-icon-loading"
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
        <el-button type="primary"
                   size="small"
                   icon="el-icon-upload2"
                   @click="deploy"
                   :disabled="deployBranchBtnIsDisabled"
                   :loading="btnLoading">部署选中分支</el-button>
      </div>

      <el-table
          v-loading="loadingUnDeployed"
          element-loading-text="更新中..."
          element-loading-spinner="el-icon-loading"
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
        :with-header="true"
        custom-class="log-drawer"
    >
      <div class="drawer-content">
        <el-timeline v-if="deployLogList && deployLogList.length > 0">
          <el-timeline-item
              v-for="(log, index) in deployLogList"
              :key="index"
              :timestamp="formatTime(log.deployTime)"
              placement="top"
              :color="getStatusColor(log.deployStatus)"
              size="large"
              :icon="getStatusIcon(log.deployStatus)"
          >
            <el-card shadow="hover" class="timeline-card">
              <div class="card-header">
                <div class="user-info">
                  <i class="el-icon-user-solid"></i>
                  <span class="username">{{ log.deployByName }}</span>
                  <span class="action-text">执行了</span>
                  <span :class="['action-type', getDeployTypeColorClass(log.deployType)]">
                    {{ log.deployType }}
                  </span>
                </div>

                <el-tag size="mini" effect="dark" :type="getStatusType(log.deployStatus)">
                  {{ getDeployStatusText(log.deployStatus) }}
                </el-tag>
              </div>

              <div class="card-body">
                <div v-if="log.releaseBranchName" class="branch-row">
                  <span class="label">Release:</span>
                  <span class="branch-name release-tag">{{ log.releaseBranchName }}</span>
                </div>

                <div v-if="log.featureBranchNameList && log.featureBranchNameList.length > 0" class="branch-section">
                  <div class="label-title">包含 Feature 分支 ({{ log.featureBranchNameList.length }}):</div>
                  <div class="tag-container">
                    <el-tag
                        v-for="branch in log.featureBranchNameList"
                        :key="branch"
                        type="info"
                        size="mini"
                        class="branch-tag"
                    >
                      <i class="el-icon-git-branch"></i> {{ branch }}
                    </el-tag>
                  </div>
                </div>

                <div v-if="log.deployStatus === 3 && log.errorMessage" class="error-alert">
                  <div class="error-title"><i class="el-icon-warning"></i> 部署失败原因:</div>
                  <div class="error-content">{{ log.errorMessage }}</div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-empty v-else description="暂无历史记录"></el-empty>
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
      deployedBranchIds: [],

      // 新增：控制局部 Loading
      loadingDeployed: false,
      loadingUnDeployed: false,
      btnLoading: false, // 全局按钮 Loading
    };
  },

  methods: {
    // --- 步骤条逻辑 ---
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

      // 链式激活
      if (newStatus === 'success' && index < this.steps.length - 1) {
        const nextIndex = index + 1;
        const nextStep = this.steps[nextIndex];
        if (nextStep.status === 'wait') {
          this.$set(this.steps, nextIndex, {...nextStep, status: 'process'});
        }
      }

      this.recalcActiveIndex();

      if (newStatus === 'error') {
        this.closeResources();
        // 错误时也要刷新数据，确保状态一致
        this.refreshBranchData();
      } else if (item.stepCode === 'finish' && newStatus === 'success') {
        this.closeResources();
        this.refreshBranchData();
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

    // --- SSE & 轮询 ---
    createSseConnect(applicationId) {
      this.closeResources();
      const sseUrl = `http://192.168.0.10:7002/matrix-sphere/sse/connect/${applicationId}`;
      console.log('SSE 连接中...', sseUrl);

      try {
        this.eventSource = new EventSourcePolyfill(sseUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`,
            heartbeatTimeout: 3600000
          }
        });

        this.eventSource.onopen = () => console.log('SSE 连接成功');
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
      getDeployMaster({applicationId: this.applicationId, env: this.env}).then(res => {
        if (res.data.code === 2000 && res.data.body) {
          const status = res.data.body.deployStatus;
          if (status === 2 || status === 3) {
            this.closeResources();
            this.refreshBranchData();
          }
        }
      });
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

    // --- 核心业务逻辑 ---

    /**
     * 【重要】静默刷新数据（并行请求，局部 Loading）
     * 解决页面闪烁问题，同时确保数据一致性
     */
    async refreshBranchData() {
      this.loadingDeployed = true;
      this.loadingUnDeployed = true;

      const p1 = this.getUnDeployedBranchList(this.applicationId);

      let p2 = Promise.resolve();
      if (this.deployMaster && this.deployMaster.id) {
        p2 = this.getDeployRecord(this.deployMaster.id);
      }

      try {
        await Promise.all([p1, p2]);
      } catch (e) {
        console.error("数据刷新异常", e);
      } finally {
        this.loadingDeployed = false;
        this.loadingUnDeployed = false;
      }
    },

    // --- API Calls (修改为返回 Promise) ---

    getDeployStepList() {
      // 步骤条不需要 await，让它异步跑
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
      } catch (e) { console.error(e) }
      return null;
    },

    // 修改：返回 Promise 以便 refreshBranchData 调用
    async getDeployRecord(deployMasterId) {
      if (!deployMasterId) return;
      return getDeployRecord(deployMasterId).then(res => {
        if (res.data.code === 2000) {
          // 【防崩坏处理】确保 featureBranchList 始终为数组
          const data = res.data.body || {};
          if (!data.featureBranchList) data.featureBranchList = [];

          this.deployInfo = data;
          this.$emit('deployInfoUpdated', this.deployInfo);
        }
      });
    },

    // 修改：返回 Promise 以便 refreshBranchData 调用
    getUnDeployedBranchList(applicationId) {
      return getUnDeployedBranchList({applicationId, env: this.env}).then(res => {
        if (res.data.code === 2000) {
          this.unDeployedBranchList = res.data.body || [];
        }
      });
    },

    getDepLoyLogList() {
      if (!this.applicationId || !this.env) return;
      this.dialog = true;
      getDepLoyLogList({
        applicationId: this.applicationId,
        env: this.env
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployLogList = res.data.body || [];
        } else {
          this.$message.error(res.data.message || '获取历史记录失败');
        }
      }).catch(e => {
        console.error(e);
      });
    },

    // --- Actions ---

    async executeDeployAction(actionType) {
      // 1. 立即给用户反馈，锁定按钮
      this.btnLoading = true;

      // 2. 立即重置步骤条状态，防止残留
      this.clearDeployStatus();

      let ids = [];
      if (actionType === '提交分支部署') {
        const currentFeatures = this.deployInfo.featureBranchList || [];
        ids = this.unDeployedBranchIds.concat(currentFeatures.map(i => i.id));
      } else if (actionType === 'main分支部署') {
        ids = [];
      } else {
        ids = this.deployedBranchIds;
      }

      try {
        const res = await deploy({
          applicationId: this.applicationId,
          branchIds: ids,
          env: this.env,
          deployType: actionType
        });

        if (res.data.code === 2000) {
          const result = res.data.body;

          // 更新 Master 信息
          if (result && result.deployMaster) {
            this.deployMaster = result.deployMaster;
          }

          // 清理选中状态
          if (this.$refs.selectedStatus) this.$refs.selectedStatus.clearSelection();
          this.unDeployedBranchIds = [];
          this.deployedBranchIds = [];

          // =======================================================
          // 【核心优化点】
          // 1. 接口通了立刻报喜，不要等表格刷新
          this.$message.success('请求已提交');

          // 2. 移除 await！让表格刷新在后台进行（表格有自己的 v-loading）
          // 这样界面就不会卡顿，表格转菊花的同时，步骤条也可以开始动了
          this.refreshBranchData();

          // 3. 立即连接 SSE (如果需要)
          // 这样步骤条能第一时间响应
          if (this.deployMaster.deployStatus === 1) {
            this.createSseConnect(this.applicationId);
          }
          // =======================================================

        } else {
          this.$message.error(res.data.message);
          // 恢复 UI 状态
          this.deployProcessActive = 0;
          this.steps.forEach(s => s.status = 'wait');
        }
      } catch (err) {
        console.error(err);
        this.$message.error('操作失败: ' + err);
        this.closeResources();
      } finally {
        // 无论成功失败，关闭按钮 Loading
        this.btnLoading = false;
      }
    },

    deploy() { this.executeDeployAction('提交分支部署'); },
    withdrawBranch() { this.executeDeployAction('退出分支部署'); },
    reDeploy() {
      if (!this.deployedBranchIds.length) return this.$message.warning('请选择要重部署的分支');
      this.executeDeployAction('重新部署');
    },
    deployMain() { this.executeDeployAction('main分支部署'); },

    // --- Table Selection ---
    getUnDeployBranchIds(val) {
      this.unDeployedBranchIds = val.map(i => i.id);
      this.deployBranchBtnIsDisabled = this.unDeployedBranchIds.length <= 0;
    },
    selectedDeployed(val) {
      this.deployedBranchIds = val.map(i => i.id);
      this.isDisabled = this.deployedBranchIds.length <= 0;
    },

    // --- Formatters ---
    formatTime(val) { return val ? val.replace('T', ' ') : ''; },
    getStatusColor(status) {
      const map = { 1: '#409EFF', 2: '#67C23A', 3: '#F56C6C' };
      return map[status] || '#909399';
    },
    getStatusIcon(status) {
      if (status === 1) return 'el-icon-loading';
      if (status === 2) return 'el-icon-check';
      if (status === 3) return 'el-icon-close';
      return '';
    },
    getDeployTypeColorClass(typeText) {
      if (typeText === '重新部署') return 'text-warning';
      if (typeText === 'main分支部署') return 'text-danger';
      if (typeText === '退出分支部署') return 'text-info';
      return 'text-primary';
    },
    getStatusType(status) {
      const map = { 1: 'primary', 2: 'success', 3: 'danger' };
      return map[status] || 'info';
    },
    getDeployStatusText(status) {
      const map = { 0: '初始化', 1: '部署中', 2: '部署成功', 3: '部署失败' };
      return map[status] || '未知';
    }
  },

  mounted() {
    // 初始加载
    this.refreshBranchData();

    this.getDeployStepList();

    // 恢复 SSE
    this.getDeployMaster(this.applicationId, this.env).then(master => {
      if (master && master.deployStatus === 1) {
        this.createSseConnect(this.applicationId);
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
    //border: 2px solid #303133;
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

/* Drawer 内容滚动区 */
.drawer-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto; /* 确保内容多时可以滚动 */
}

/* 时间戳样式微调 */
::v-deep .el-timeline-item__timestamp {
  font-weight: bold;
  color: #303133;
  font-size: 13px;
}

/* Timeline 卡片样式 */
.timeline-card {
  border: 1px solid #ebeef5;
  background-color: #fff;

  ::v-deep .el-card__body {
    padding: 12px 15px; /* 紧凑一点 */
  }

  /* 头部 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e4e7ed;
    margin-bottom: 10px;

    .user-info {
      font-size: 13px;
      color: #606266;
      display: flex;
      align-items: center;

      i { margin-right: 4px; font-size: 14px; }
      .username { font-weight: bold; color: #303133; margin-right: 4px; }
      .action-text { margin-right: 4px; }

      /* ★★★ 修复点开始 ★★★ */
      .action-type {
        font-weight: bold;
        margin-left: 2px;
        /* 注意：这里不要写 color，让下面的动态类去控制颜色 */
      }

      /* 必须显式定义这几个颜色类，否则 JS 返回了类名也没效果 */
      .text-primary { color: #409EFF; } /* 默认蓝 */
      .text-warning { color: #E6A23C; } /* 重新部署 - 橙色 */
      .text-danger  { color: #F56C6C; } /* Main部署 - 红色 */
      .text-info    { color: #909399; } /* 退出部署 - 灰色 */
      /* ★★★ 修复点结束 ★★★ */
    }
  }

  /* 内容主体 */
  .card-body {
    font-size: 13px;

    .branch-row {
      margin-bottom: 8px;
      .label { color: #909399; margin-right: 8px; }
      .release-tag {
        font-family: monospace;
        background-color: #ecf5ff;
        color: #409EFF;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    .branch-section {
      margin-bottom: 8px;
      .label-title {
        color: #909399;
        font-size: 12px;
        margin-bottom: 5px;
      }
      .tag-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .branch-tag {
          border: none;
          background-color: #f4f4f5;
          color: #606266;
          font-family: monospace; /* 代码风格字体 */
        }
      }
    }

    /* 错误提示框 - 重点优化 */
    .error-alert {
      margin-top: 12px;
      background-color: #fef0f0;
      border-radius: 4px;
      padding: 10px;
      border-left: 4px solid #F56C6C; /* 左侧红线强调 */

      .error-title {
        color: #F56C6C;
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 12px;
      }
      .error-content {
        color: #5e6d82;
        font-size: 12px;
        line-height: 1.5;
        word-break: break-all; /* 防止长报错撑破布局 */
      }
    }
  }
}
</style>