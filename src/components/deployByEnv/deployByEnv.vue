<template>
  <div class="deploy-by-env-container">
    <el-card shadow="never" class="step-card">
      <el-steps class="deploySpeed" :align-center="true" :active="deployProcessActive" finish-status="success">
        <el-step
            v-for="step in steps"
            :key="step.id"
            :title="step.title"
            :icon="step.icon"
            :description="step.description"
            :status="step.status">
        </el-step>
      </el-steps>
    </el-card>

    <el-card shadow="never" class="branch-card">
      <div slot="header" class="clearfix">
        <el-divider content-position="left">已部署分支</el-divider>
      </div>
      <div class="toolbar">
        <div class="action-group">
          <el-button type="warning" size="small" @click="withdrawBranch" :disabled="isDisabled">退出分支</el-button>
          <el-button type="primary" size="small" @click="reDeploy" :disabled="isDisabled">重新部署</el-button>
          <el-button type="primary" size="small" @click="deployMain">部署main分支</el-button>
        </div>
        <div class="action-group">
          <el-button type="primary" size="small" @click="getDepLoyLogList" icon="el-icon-document">部署记录</el-button>
        </div>
      </div>
      <el-empty v-show="!deployInfo || !deployInfo.featureBranchList || deployInfo.featureBranchList.length <= 0" description="无已部署分支"></el-empty>
      <el-table v-show="deployInfo && deployInfo.featureBranchList && deployInfo.featureBranchList.length > 0" :data="deployInfo.featureBranchList" @selection-change="selectedDeployed" border>
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="branchName" label="分支" width="400"></el-table-column>
        <el-table-column prop="description" label="描述" width="400"></el-table-column>
        <el-table-column prop="createByName" label="创建人" width="180"></el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间"></el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="branch-card">
      <div slot="header" class="clearfix">
        <el-divider content-position="left">未部署分支</el-divider>
      </div>
      <div class="toolbar">
        <el-button type="primary" size="small" @click="deploy" :disabled="deployBranchBtnIsDisabled">部署分支</el-button>
      </div>
      <el-empty v-show="unDeployedBranchList.length <= 0" description="无未部署分支"></el-empty>
      <div v-show="unDeployedBranchList.length > 0">
        <el-table :data="unDeployedBranchList" @selection-change="getUnDeployBranchIds" ref="selectedStatus" border>
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="branchName" label="分支" width="400"></el-table-column>
          <el-table-column prop="description" label="描述" width="400"></el-table-column>
          <el-table-column prop="createByName" label="创建人" width="180"></el-table-column>
          <el-table-column prop="gmtCreate" label="创建时间"></el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-drawer
        size="30%"
        :visible.sync="dialog"
        direction="rtl"
        custom-class="demo-drawer"
        :modal="false"
        ref="drawer">

      <div class="demo-drawer__content" v-for="deployLog in deployLogList" :key="deployLog.deployTime" style="margin-bottom: 20px">
        <el-card class="box-card" style="width: 95%; margin: 0 15px">
          <div slot="header" class="clearfix">
            <span>{{ deployLog.projectName }} 最新10次部署记录</span>
          </div>

          <el-descriptions :labelStyle="{width:'100px'}" :size="'mini'" :column="3" border>
            <el-descriptions-item>
              <template slot="label">
                部署人
              </template>
              <el-tag size="small" type="primary">{{ deployLog.deployByName }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                部署环境
              </template>
              <el-tag size="small" type="primary">{{ deployLog.deployEnvironment }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                部署类型
              </template>
              <el-tag size="small" type="primary">{{ deployLog.deployType }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="3">
              <template slot="label">
                feature分支
              </template>
              <el-tag size="small" type="primary" v-for="item in deployLog.featureBranchNameList" :key="item">{{ item }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="3">
              <template slot="label">
                release分支
              </template>
              <el-tag size="small" type="primary" v-if="deployLog.releaseBranchName">{{ deployLog.releaseBranchName }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="3">
              <template slot="label">
                部署时间
              </template>
              <el-tag size="small" type="primary">{{ deployLog.deployTime }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="3">
              <template slot="label">
                部署状态
              </template>
              <el-tag size="small" effect="dark" v-if="deployLog.deployStatus === 0" type="info">初始化</el-tag>
              <el-tag size="small" effect="dark" v-else-if="deployLog.deployStatus === 1" type="warning">部署中</el-tag>
              <el-tag size="small" effect="dark" v-else-if="deployLog.deployStatus === 2" type="success">部署成功</el-tag>
              <el-tag size="small" effect="dark" v-else-if="deployLog.deployStatus === 3" type="danger">部署失败</el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="deployLog.deployStatus === 3" :span="2">
              <template slot="label">
                失败原因
              </template>
              <el-tag size="small" type="primary">{{ deployLog.errorMessage }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
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
// import bus from "@/util/bus"; // [移除] 不再需要
import { EventSourcePolyfill } from 'event-source-polyfill'
import * as CollUtils from '@/util/CollUtils'

// [新增] 步骤条状态映射
const STEP_STATUS_MAP = {
  0: 'wait',    // 0: 初始化
  1: 'process', // 1: 进行中
  2: 'success', // 2: 成功
  3: 'error'    // 3: 失败
};

export default {
  name: "deployByEnv",
  props : {
    env: String,
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      // 按钮禁用状态
      isDisabled: true,
      deployBranchBtnIsDisabled: true,

      // API 数据
      deployMaster: {},
      deployInfo: {
        featureBranchList: []
      },
      unDeployedBranchList: [],

      // ---------------------------------
      // [核心重构] 步骤条状态
      // ---------------------------------
      deployProcessActive: -1,
      steps: [
        { id: 'merge', title: '合并', status: 'wait', icon: '', description: '' },
        { id: 'build', title: '构建', status: 'wait', icon: '', description: '' },
        { id: 'publish', title: '部署', status: 'wait', icon: '', description: '' },
        { id: 'finish', title: '完成', status: 'wait', icon: '', description: '' }
      ],

      // 抽屉
      dialog: false,
      deployLogList: [],

      // SSE
      eventSource: null,

      // 表格选择
      unDeployedBranchIds: [],
      deployedBranchIds: []
    };
  },
  methods: {
    // ---------------------------------
    // [核心重构] 1. 步骤条状态机
    // ---------------------------------

    /**
     * [新] 处理单个SSE消息并更新UI
     * @param {object} item - SSE 消息 { stepCode, stepStatus, errorMessage }
     */
    updateStepState(item) {
      // 1. 找到对应的步骤
      const step = this.steps.find(s => s.id === item.stepCode);
      if (!step) return;

      // 2. 更新状态
      step.status = STEP_STATUS_MAP[item.stepStatus] || 'wait';
      step.icon = (step.status === 'process') ? 'el-icon-loading' : '';
      step.description = (step.status === 'error') ? item.errorMessage : '';

      // 3. 重新计算总进度
      // (activeIndex = 第一个 *未成功* 的步骤索引)
      const activeIndex = this.steps.findIndex(s => s.status !== 'success');
      this.deployProcessActive = (activeIndex === -1) ? 4 : activeIndex;

      // 4. 部署结束 (成功或失败)，关闭SSE
      if (item.stepCode === 'finish' && (item.stepStatus === 2 || item.stepStatus === 3)) {
        this.sseClose(this.projectId);
      }
    },

    /**
     * [新] "刷新保持状态" - 处理从API获取的完整步骤列表
     * @param {Array} stepList - getDeployStepList API 返回的数组
     */
    processStepList(stepList) {
      if (!stepList || stepList.length === 0) return;

      let finalActiveIndex = 0;
      const stepCodes = ['merge', 'build', 'publish', 'finish'];

      for (const code of stepCodes) {
        const stepUpdate = stepList.find(item => item.stepCode === code);
        if (stepUpdate) {
          // [复用] 调用单一的更新逻辑
          this.updateStepState(stepUpdate);
        }
      }

      // 再次计算总进度
      const activeIndex = this.steps.findIndex(s => s.status !== 'success');
      this.deployProcessActive = (activeIndex === -1) ? 4 : activeIndex;
    },

    /**
     * [重构] 清空状态
     */
    clearDeployStatus() {
      this.deployProcessActive = -1;
      this.steps = [
        { id: 'merge', title: '合并', status: 'wait', icon: '', description: '' },
        { id: 'build', title: '构建', status: 'wait', icon: '', description: '' },
        { id: 'publish', title: '部署', status: 'wait', icon: '', description: '' },
        { id: 'finish', title: '完成', status: 'wait', icon: '', description: '' }
      ];
    },

    // ---------------------------------
    // [重构] 2. SSE 和 API 调用
    // ---------------------------------

    // [重构] 监听SSE消息
    listenDeployStepMessage() {
      this.eventSource.onmessage = (res => {
        try {
          const item = JSON.parse(res.data);
          // [调用] 使用重构后的状态机
          this.updateStepState(item);
        } catch (e) {
          console.error("SSE message parse error:", e);
        }
      })
    },

    // [重构] "刷新保持状态" API
    getDeployStepList() {
      getDeployStepList({
        projectId: this.projectId, // [修复] 使用 this.projectId
        deployEnvironment: this.deployEnvironment
      }).then(res => {
        if (res.data.code === 2000 && CollUtils.isNotEmpty(res.data.body)) {
          // [调用] 使用重构后的处理器
          this.processStepList(res.data.body);
        }
      }).catch(err => {
        this.$message({
          message: '查询部署步骤失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    // [重构] 部署信息 (修复了 bus)
    async getDeployMaster(projectId, activeName) {
      let result;
      try {
        const res = await getDeployMaster({
          projectId: projectId,
          deployEnvironment: activeName
        });
        if (res.data.code === 2000) {
          this.deployMaster = res.data.body;
          result = res.data.body;
        }
      } catch (err) {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000
        });
      }

      if (result) {
        await this.getDeployRecord(result.id);
        if (this.deployInfo) {
          // [修复] 替换 bus.$emit
          this.$emit('deployInfoUpdated', this.deployInfo);
        }
      } else {
        // [修复] 替换 bus.$emit
        this.$emit('deployInfoUpdated', {deployInfo: {}, featureBranchList: []});
      }
      return result;
    },

    // (getDeployRecord 保持不变)
    async getDeployRecord(deployMasterId) {
      let result;
      await getDeployRecord({
        deployMasterId: deployMasterId
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployInfo = res.data.body;
          result = res.data.body;
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
      return result;
    },

    // (getUnDeployedBranchList 保持不变, 修复了 this.projectId)
    getUnDeployedBranchList(projectId) {
      getUnDeployedBranchList({
        projectId: projectId,
        deployEnvironment: this.deployEnvironment
      }).then(res => {
        if (res.data.code === 2000) {
          this.unDeployedBranchList = res.data.body;
        }
      }).catch(err => {
        this.$message({
          message: '获取分支列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    // (getDepLoyLogList 保持不变, 修复了 this.projectId)
    getDepLoyLogList() {
      this.dialog = true
      getDepLoyLogList({
        projectId: this.projectId,
        deployEnvironment: this.deployEnvironment,
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployLogList = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    // ---------------------------------
    // 3. 部署动作 (修复了 bus 和 this.projectId)
    // ---------------------------------

    // (部署分支)
    async deploy() {
      await this.clearDeployStatus();
      await this.createSseConnect(this.projectId); // [修复]
      let result;
      const toBeDeployBranchIds = this.unDeployedBranchIds.concat(this.deployInfo.featureBranchList.map((item) => item.id));

      try {
        const res = await deploy({
          projectId: this.projectId, // [修复]
          branchIds: toBeDeployBranchIds,
          deployEnvironment: this.deployEnvironment,
          deployType: '提交分支部署'
        });

        if (res.data.code === 2000) {
          result = res.data.body;
          this.listenDeployStepMessage();
          await this.getUnDeployedBranchList(result.project.id);
          let deployRecord = await this.getDeployRecord(result.deployMaster.id);
          this.$emit('deployInfoUpdated', deployRecord); // [修复]
          this.$refs.selectedStatus.clearSelection();
        } else {
          this.$message({ message: res.data.message, type: 'error' });
          this.sseClose(this.projectId); // 失败时关闭
        }
      } catch (err) {
        this.$message({ message: '部署失败，原因：' + err, type: 'error' });
        this.sseClose(this.projectId); // 失败时关闭
      }
    },

    // (退出分支 - 逻辑同上)
    async withdrawBranch() {
      await this.clearDeployStatus();
      await this.createSseConnect(this.projectId);
      let result;
      try {
        const res = await deploy({
          projectId: this.projectId,
          branchIds: this.deployedBranchIds,
          deployEnvironment: this.deployEnvironment,
          deployType: '退出分支部署'
        });
        if (res.data.code === 2000) {
          result = res.data.body
          this.listenDeployStepMessage()
          await this.getUnDeployedBranchList(result.project.id)
          let deployRecord = await this.getDeployRecord(result.deployMaster.id)
          this.$emit('deployInfoUpdated', deployRecord); // [修复]
          // (注意：这里没有 $refs.selectedStatus，退出分支应该清空 *已部署* 的选择)
          // this.$refs.selectedStatus.clearSelection()
        } else {
          this.$message({ message: res.data.message, type: 'error' });
          this.sseClose(this.projectId);
        }
      } catch (err) {
        this.$message({ message: '退出分支失败，原因：' + err, type: 'error' });
        this.sseClose(this.projectId);
      }
    },

    // (重新部署 - 逻辑同上)
    async reDeploy() {
      await this.clearDeployStatus();
      await this.createSseConnect(this.projectId);
      if (!this.deployedBranchIds || this.deployedBranchIds.length === 0) {
        this.$message.info('请先选择要重新部署的分支');
        return;
      }
      let result;
      try {
        const res = await deploy({
          projectId: this.projectId,
          branchIds: this.deployedBranchIds,
          deployEnvironment: this.deployEnvironment,
          deployType: '重新部署'
        });
        if (res.data.code === 2000) {
          result = res.data.body;
          this.listenDeployStepMessage();
          await this.getUnDeployedBranchList(result.project.id);
          let deployRecord = await this.getDeployRecord(result.deployMaster.id);
          this.$emit('deployInfoUpdated', deployRecord); // [修复]
        } else {
          this.$message({ message: res.data.message, type: 'error' });
          this.sseClose(this.projectId);
        }
      } catch (err) {
        this.$message({ message: '重新部署失败，原因：' + err, type: 'error' });
        this.sseClose(this.projectId);
      }
    },

    // (部署main - 逻辑同上)
    async deployMain() {
      await this.clearDeployStatus();
      await this.createSseConnect(this.projectId);
      let result;
      try {
        const res = await deploy({
          projectId: this.projectId,
          branchIds: [],
          deployEnvironment: this.deployEnvironment,
          deployType: 'main分支部署'
        });
        if (res.data.code === 2000) {
          result = res.data.body;
          this.listenDeployStepMessage();
          await this.getUnDeployedBranchList(result.project.id);
          let deployRecord = await this.getDeployRecord(result.deployMaster.id);
          this.$emit('deployInfoUpdated', deployRecord); // [修复]
          if (this.$refs.selectedStatus) {
            this.$refs.selectedStatus.clearSelection();
          }
        } else {
          this.$message({ message: res.data.message, type: 'error' });
          this.sseClose(this.projectId);
        }
      } catch (err) {
        this.$message({ message: '部署main失败，原因：' + err, type: 'error' });
        this.sseClose(this.projectId);
      }
    },

    // ---------------------------------
    // 4. SSE 和 表格选择
    // ---------------------------------

    // (表格选择器 - 保持不变)
    getUnDeployBranchIds(val) {
      this.unDeployedBranchIds = val.map((item) => item.id);
      this.deployBranchBtnIsDisabled = this.unDeployedBranchIds.length <= 0;
    },
    selectedDeployed(selectedBranchList) {
      this.deployedBranchIds = selectedBranchList.map((item) => item.id);
      this.isDisabled = this.deployedBranchIds.length <= 0;
    },

    // (SSE 创建 - 保持不变, 修复了 this.projectId)
    createSseConnect(projectId) {
      // (确保旧连接已关闭)
      if (this.eventSource) {
        this.eventSource.close();
      }
      this.eventSource = new EventSourcePolyfill(`http://192.168.0.10:7002/matrix-sphere/sse/connect/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`,
          heartbeatTimeout: 10000000
        }
      });
      this.eventSource.onopen = (res => {
        console.log('已建立长连接 ==> ');
      });
      // [新增] 增加错误处理
      this.eventSource.onerror = (err) => {
        console.error("SSE 连接发生错误:", err);
        this.eventSource.close();
      };
    },

    // (SSE 关闭 - 保持不变, 修复了 this.projectId)
    sseClose(projectId) {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null; // 释放
      }
      sseClose(projectId); // [修复] 应该传入 projectId
      console.log('连接已关闭');
    }
  },

  computed: {
    deployEnvironment() {
      return this.env;
    }
  },

  mounted() {
    // [修复] 直接使用 this.projectId
    this.getUnDeployedBranchList(this.projectId);
    this.getDeployMaster(this.projectId, this.deployEnvironment).then(data => {
      // 检查 deployMaster 的*最新*状态，而不是组件的 deployMaster (可能已过时)
      if (data && data.deployStatus === 1) { // 1=部署中 (假设)
        this.createSseConnect(this.projectId);
        this.listenDeployStepMessage();
      }
    });
  },

  created() {
    // [修复] 不再需要从 localStorage 获取 projectId，它是一个 prop
    // [修复] getDeployStepList 应该在 mounted 中，在 getDeployMaster 之后
    //        或者在 getDeployMaster 成功后调用
    //        我们保留在 created 中，用于页面刷新
    this.getDeployStepList();
  },

  beforeDestroy() {
    if(this.eventSource) {
      this.eventSource.close();
      this.sseClose(this.projectId);
    }
  },
};
</script>
<style lang="less" scoped>
// [新增] 容器总间距
.deploy-by-env-container {
  padding: 0 10px; // 左右留出一点空间
}

// [新增] 卡片统一样式
.step-card,
.branch-card {
  margin-bottom: 20px;

  // 移除卡片头部的默认边框
  ::v-deep .el-card__header {
    border-bottom: none;
    padding: 20px 20px 0 20px; // 调整内边距
  }
  // 移除卡片主体的默认内边距 (如果 divider 在里面)
  ::v-deep .el-card__body {
    padding: 20px;
  }
}

// [新增] 步骤条卡片
.step-card {
  .deploySpeed {
    padding: 10px 0; // 步骤条的内边距
  }
}

// [新增] 按钮工具栏布局
.toolbar {
  display: flex;
  justify-content: space-between; // 两端对齐
  align-items: center;
  flex-wrap: wrap; // 换行
  margin-bottom: 20px;
}

.action-group {
  // 按钮组
  margin-bottom: 10px; // 换行时的间距
  .el-button {
    margin-right: 10px;
    margin-bottom: 0; // 覆盖旧样式
  }
}

// (旧样式 - 已被 .action-group 覆盖)
// .el-button {
//   margin-bottom: 15px
// }

// (旧样式 - .el-steps 已在 .step-card 中)
// .el-steps {
//   margin-top: 50px;
//   margin-bottom: 50px;
// }
// .deploySpeed {
//   padding: 0 50px;
// }
</style>
