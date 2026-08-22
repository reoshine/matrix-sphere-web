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
              <div v-if="step.description" class="step-desc">
                <div class="step-desc-card" :class="{ 'is-waiting': step.rawStatus === 4, 'is-error': step.rawStatus === 3 }">
                  <div class="step-desc-body">
                    <template v-for="(line, lIdx) in step.description.split('\n')">
                      <div v-if="isUrl(line)" :key="lIdx" class="step-desc-actions">
                        <el-button type="warning" size="mini" icon="el-icon-link" class="action-btn"
                                   @click.stop="openMrLink(line)">前往 GitLab 解决冲突</el-button>
                        <el-button v-if="step.rawStatus === 4 && step.id === 'merge'"
                                   type="primary" size="mini" icon="el-icon-refresh" class="action-btn"
                                   @click.stop="handleRetry">重试</el-button>
                      </div>
                      <span v-else-if="line.trim()" :key="lIdx" class="step-desc-text">{{ line }}</span>
                    </template>
                  </div>
                </div>
              </div>
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
                       size="small" @click="confirmWithdraw"
                       :disabled="isDisabled || isDeploying"
                       :loading="btnLoading">退出分支</el-button>
          </el-tooltip>
          <el-tooltip content="重新构建并部署选中分支" placement="top">
            <el-button type="primary"
                       plain
                       icon="el-icon-refresh"
                       size="small"
                       @click="confirmReDeploy"
                       :disabled="isDisabled || isDeploying"
                       :loading="btnLoading">重新部署</el-button>
          </el-tooltip>
          <el-divider direction="vertical"></el-divider>
          <el-button type="danger"
                     plain
                     icon="el-icon-s-flag"
                     size="small"
                     @click="confirmDeployMain"
                     :disabled="isDeploying"
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
        <el-table-column prop="gmtCreate" label="创建时间" width="170" align="center" :formatter="formatGmtCreate" />
      </el-table>
    </el-card>

    <el-card shadow="never" class="module-card">
      <div slot="header" class="card-header-flex">
        <span class="header-title"><i class="el-icon-time"></i> 待部署分支</span>
      </div>

      <div class="toolbar-container">
        <div class="left-actions">
          <el-button type="primary"
                     size="small"
                     icon="el-icon-upload2"
                     @click="deploy"
                     :disabled="deployBranchBtnIsDisabled || isDeploying"
                     :loading="btnLoading">部署选中分支</el-button>
        </div>
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
        <el-table-column prop="gmtCreate" label="创建时间" width="170" align="center" :formatter="formatGmtCreate" />
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
                    {{ getDeployTypeDesc(log.deployType) }}
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
  retryDeploy,
  sseClose,
  getDeployStepList
} from "@/views/applicationManagement/applicationList/api";
import { EventSourcePolyfill } from 'event-source-polyfill'
import * as CollUtils from '@/util/CollUtils'

const STEP_STATUS_MAP = {
  0: 'wait',
  1: 'process',
  2: 'success',
  3: 'error',
  4: 'wait'
};

const DEPLOY_TYPE_DESC = {
  'SUBMIT_BRANCH': '提交分支部署',
  'WITHDRAW_BRANCH': '退出分支部署',
  'RE_DEPLOY': '重新部署',
  'MAIN_BRANCH': 'main分支部署'
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
      isInitializing: true, // 标志：是否正在初始化
    };
  },

  computed: {
    isDeploying() {
      return this.deployMaster && this.deployMaster.deployStatus === 1;
    }
  },

  methods: {
    // --- 步骤条逻辑 ---
    getStepIcon(step) {
      if (step.rawStatus === 4) return 'el-icon-warning';
      if (step.status === 'process') return 'el-icon-loading';
      if (step.status === 'success') return 'el-icon-check';
      if (step.status === 'error') return 'el-icon-close';
      return step.icon;
    },

    isUrl(text) {
      return /^https?:\/\/.+/.test(text);
    },

    formatGmtCreate(row, column, cellValue) {
      if (!cellValue) return '-';
      if (typeof cellValue === 'string') return cellValue;
      if (Array.isArray(cellValue) && cellValue.length >= 6) {
        const [y, m, d, h, min, s] = cellValue;
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      return String(cellValue);
    },

    openMrLink(url) {
      window.open(url, '_blank');
    },

    updateStepState(item) {
      const index = this.steps.findIndex(s => s.id === item.stepCode);
      if (index === -1) return;

      const statusKey = Number(item.stepStatus);
      const newStatus = STEP_STATUS_MAP[statusKey] || 'wait';
      const isWaiting = statusKey === 4;
      const showDescription = (newStatus === 'error') || isWaiting;
      const errorMessage = showDescription ? item.errorMessage : '';

      const updatedStep = {
        ...this.steps[index],
        status: newStatus,
        rawStatus: statusKey,
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

      // WAITING 状态下不关闭资源，继续接收 SSE/轮询更新
      if (isWaiting) {
        return;
      }
      // 初始化阶段不重复调用 refreshBranchData，避免 getDeployRecord 被调用两次
      if (this.isInitializing) {
        return;
      }
      if (newStatus === 'error') {
        this.closeResources();
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
          // 链式激活的 process 不被 DB 中的 INIT 数据覆盖
          const currentStep = this.steps.find(s => s.id === code);
          if (currentStep && currentStep.status === 'process' && Number(stepData.stepStatus) === 0) {
            return;
          }
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
    createSseConnect(applicationId, onReady) {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
      const sseUrl = `http://192.168.0.10:7002/matrix-sphere/sse/v1/connect/${applicationId}`;
      console.log('SSE 连接中...', sseUrl);

      try {
        this.eventSource = new EventSourcePolyfill(sseUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`
          },
          heartbeatTimeout: 3600000
        });

        this.eventSource.onopen = () => {
          console.log('SSE 连接成功');
          if (onReady) onReady();
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
        if (onReady) onReady();
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
        if (res.code === 200 && res.data) {
          const status = res.data.deployStatus;
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
        if (res.code === 200 && CollUtils.isNotEmpty(res.data)) {
          this.processStepList(res.data);
        }
      });
    },

    async getDeployMaster(applicationId, activeName) {
      try {
        const res = await getDeployMaster({applicationId, env: activeName});
        if (res.code === 200) {
          this.deployMaster = res.data || {};
          // 更新概览信息
          this.$emit('deployInfoUpdated', {
            releaseBranchName: this.deployMaster.releaseBranchName || '',
            featureBranchList: this.deployInfo.featureBranchList || [],
            deployStatus: this.deployMaster.deployStatus
          });
          return this.deployMaster;
        }
      } catch (e) { console.error(e) }
      return null;
    },

    // 修改：返回 Promise 以便 refreshBranchData 调用
    async getDeployRecord(deployMasterId) {
      if (!deployMasterId) return;
      return getDeployRecord(deployMasterId).then(res => {
        if (res.code === 200) {
          // 【防崩坏处理】确保 featureBranchList 始终为数组
          const data = res.data || {};
          if (!data.featureBranchList) data.featureBranchList = [];

          this.deployInfo = data;
          this.$emit('deployInfoUpdated', this.deployInfo);
        }
      });
    },

    // 修改：返回 Promise 以便 refreshBranchData 调用
    getUnDeployedBranchList(applicationId) {
      return getUnDeployedBranchList({applicationId, env: this.env}).then(res => {
        if (res.code === 200) {
          this.unDeployedBranchList = res.data || [];
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
        if (res.code === 200) {
          this.deployLogList = res.data || [];
        } else {
          this.$message.error(res.message || '获取历史记录失败');
        }
      }).catch(e => {
        console.error(e);
      });
    },

    // --- Actions ---

    getSelectedBranchNames() {
      if (!this.deployedBranchIds.length) return '';
      const branches = this.deployInfo.featureBranchList || [];
      return branches
        .filter(b => this.deployedBranchIds.includes(b.id))
        .map(b => b.branchName)
        .join('、');
    },

    confirmWithdraw() {
      if (!this.deployedBranchIds.length) return this.$message.warning('请选择要退出的分支');
      const names = this.getSelectedBranchNames();
      const msg = `<div class="deploy-confirm-box">
        <div class="deploy-confirm-row">
          <span class="deploy-confirm-label">部署环境</span>
          <span class="deploy-confirm-tag deploy-confirm-tag--env">${this.env}</span>
        </div>
        <div class="deploy-confirm-row">
          <span class="deploy-confirm-label">移除分支</span>
          <span class="deploy-confirm-tag deploy-confirm-tag--danger">${names}</span>
        </div>
        <div class="deploy-confirm-hint">移除后，将用剩余分支自动重新部署。</div>
      </div>`;
      this.$confirm(msg, '退出分支', {
        confirmButtonText: '确认退出',
        cancelButtonText: '取消',
        type: 'warning',
        iconClass: 'el-icon-remove-outline',
        dangerouslyUseHTMLString: true,
        customClass: 'deploy-confirm-dialog'
      }).then(() => { this.executeDeployAction('WITHDRAW_BRANCH'); })
        .catch(() => {});
    },

    confirmReDeploy() {
      if (!this.deployedBranchIds.length) return this.$message.warning('请选择要重部署的分支');
      const names = this.getSelectedBranchNames();
      const msg = `<div class="deploy-confirm-box">
        <div class="deploy-confirm-row">
          <span class="deploy-confirm-label">部署环境</span>
          <span class="deploy-confirm-tag deploy-confirm-tag--env">${this.env}</span>
        </div>
        <div class="deploy-confirm-row">
          <span class="deploy-confirm-label">选中分支</span>
          <span class="deploy-confirm-tag">${names}</span>
        </div>
        <div class="deploy-confirm-hint">将跳过合并步骤，直接触发 Jenkins 构建。</div>
      </div>`;
      this.$confirm(msg, '重新部署', {
        confirmButtonText: '确认部署',
        cancelButtonText: '取消',
        type: 'warning',
        iconClass: 'el-icon-refresh',
        dangerouslyUseHTMLString: true,
        customClass: 'deploy-confirm-dialog'
      }).then(() => { this.executeDeployAction('RE_DEPLOY'); })
        .catch(() => {});
    },

    confirmDeployMain() {
      const msg = `<div class="deploy-confirm-box">
        <div class="deploy-confirm-row">
          <span class="deploy-confirm-label">部署环境</span>
          <span class="deploy-confirm-tag deploy-confirm-tag--env">${this.env}</span>
        </div>
        <div class="deploy-confirm-row">
          <span class="deploy-confirm-label">部署分支</span>
          <span class="deploy-confirm-tag deploy-confirm-tag--danger">main（紧急）</span>
        </div>
        <div class="deploy-confirm-warning">将覆盖当前所有 Feature 分支的部署</div>
      </div>`;
      this.$confirm(msg, '紧急部署 Main 分支', {
        confirmButtonText: '确认部署',
        cancelButtonText: '取消',
        type: 'error',
        iconClass: 'el-icon-s-flag',
        dangerouslyUseHTMLString: true,
        customClass: 'deploy-confirm-dialog'
      }).then(() => { this.executeDeployAction('MAIN_BRANCH'); })
        .catch(() => {});
    },

    handleRetry() {
      if (!this.deployMaster || !this.deployMaster.id) {
        this.$message.warning('未找到部署记录');
        return;
      }
      const masterId = this.deployMaster.id;
      const mergeStep = this.steps.find(s => s.id === 'merge');
      if (mergeStep) {
        const updated = { ...mergeStep, status: 'process', description: '重试中...' };
        this.$set(this.steps, this.steps.findIndex(s => s.id === 'merge'), updated);
      }
      retryDeploy(masterId).then(res => {
        if (res.code === 200) {
          this.$message.success('重试已触发');
          // 重新建立 SSE 连接接收状态更新
          this.createSseConnect(this.applicationId, () => this.getDeployStepList());
        } else {
          this.$message.error(res.message || '重试失败');
        }
      }).catch(e => {
        console.error('重试请求失败:', e);
        this.$message.error('重试请求失败');
      });
    },

    async executeDeployAction(actionType) {
      // 1. 立即给用户反馈，锁定按钮
      this.btnLoading = true;

      // 2. 立即重置步骤条状态，防止残留
      this.clearDeployStatus();

      let ids = [];
      if (actionType === 'SUBMIT_BRANCH') {
        const currentFeatures = this.deployInfo.featureBranchList || [];
        ids = this.unDeployedBranchIds.concat(currentFeatures.map(i => i.id));
      } else if (actionType === 'MAIN_BRANCH') {
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

        if (res.code === 200) {
          const result = res.data;

          // 更新 Master 信息（createDeploy 直接返回 DeployMasterVO）
          if (result && result.id) {
            this.deployMaster = result;
          }

          // 清理选中状态
          if (this.$refs.selectedStatus) this.$refs.selectedStatus.clearSelection();
          this.unDeployedBranchIds = [];
          this.deployedBranchIds = [];

          this.$message.success('请求已提交');

          this.refreshBranchData();

          // 仅部署中时才连接 SSE 实时推送
          if (this.deployMaster.deployStatus === 1) {
            this.createSseConnect(this.applicationId, () => this.getDeployStepList());
          } else {
            this.getDeployStepList();
          }

        } else {
          this.$message.error(res.message);
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

    deploy() { this.executeDeployAction('SUBMIT_BRANCH'); },
    withdrawBranch() { this.executeDeployAction('WITHDRAW_BRANCH'); },
    reDeploy() {
      if (!this.deployedBranchIds.length) return this.$message.warning('请选择要重部署的分支');
      this.executeDeployAction('RE_DEPLOY');
    },
    deployMain() { this.executeDeployAction('MAIN_BRANCH'); },

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
    getDeployTypeDesc(code) {
      return DEPLOY_TYPE_DESC[code] || code;
    },
    getDeployTypeColorClass(typeText) {
      if (typeText === 'RE_DEPLOY') return 'text-warning';
      if (typeText === 'MAIN_BRANCH' || typeText === 'Main 分支部署') return 'text-danger';
      if (typeText === 'WITHDRAW_BRANCH') return 'text-info';
      if (typeText === 'SUBMIT_BRANCH') return 'text-primary';
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

  async mounted() {
    const master = await this.getDeployMaster(this.applicationId, this.env);

    this.refreshBranchData();
    this.getDeployStepList();

    if (master && master.deployStatus === 1) {
      this.createSseConnect(this.applicationId);
    }

    // 初始化完成，允许 updateStepState 调用 refreshBranchData
    this.isInitializing = false;
  },

  beforeDestroy() {
    this.closeResources();
  }
};
</script>

<style lang="less" scoped>
/* 部署环境组件 — 适配卡片网格布局 */
.deploy-container {
  padding: 12px;
}

.process-card, .module-card {
  margin-bottom: 12px;
  border: 1px solid #ebeef5;

  ::v-deep .el-card__header {
    padding: 15px 20px;
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
  }

  ::v-deep .el-card__body {
    padding: 20px;
  }

  ::v-deep .el-table td {
    vertical-align: middle;
  }
}

.process-card {
  background: #fdfdfd;

  .process-wrapper {
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;

    .custom-steps {
      width: 100%;
    }
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

  /* 步骤描述卡片 */
  .step-desc {
    margin-top: 6px;
  }
  .step-desc-card {
    padding: 8px 12px;
    border-radius: 6px;
    border-left: 3px solid #E6A23C;
    background: #fef7ee;
    font-size: 12px;
    line-height: 1.6;
    max-height: 280px;
    overflow-y: auto;
    word-break: break-all;
  }
  .step-desc-card.is-error {
    border-left-color: #F56C6C;
    background: #fef0f0;
  }
  .step-desc-text {
    color: #606266;
    display: block;
  }
  .step-desc-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .action-btn {
    font-size: 12px;
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
  margin-top: 15px;
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

<style lang="less">
/* 部署操作确认弹窗样式 */
.deploy-confirm-dialog {
  .el-message-box__header {
    padding: 20px 24px 0;
    .el-message-box__title {
      font-size: 17px;
      font-weight: 600;
      color: #303133;
    }
  }

  .el-message-box__content {
    padding: 16px 24px 0;
  }

  .el-message-box__message {
    padding: 0;
    color: #606266;
    line-height: 1.6;
  }

  .el-message-box__btns {
    padding: 16px 24px 20px;
  }
}

.deploy-confirm-box {
  .deploy-confirm-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .deploy-confirm-label {
    font-size: 13px;
    color: #909399;
    width: 68px;
    flex-shrink: 0;
  }

  .deploy-confirm-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', 'Menlo', 'Monaco', Consolas, monospace;
    background: #f0f2f5;
    color: #606266;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--env {
      background: #ecf5ff;
      color: #409EFF;
      font-family: inherit;
      font-weight: 600;
      letter-spacing: 1px;
    }

    &--danger {
      background: #fef0f0;
      color: #F56C6C;
    }
  }

  .deploy-confirm-hint {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }

  .deploy-confirm-warning {
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 6px;
    background: #fef0f0;
    border-left: 3px solid #F56C6C;
    font-size: 13px;
    color: #F56C6C;
    line-height: 1.5;
  }
}
</style>