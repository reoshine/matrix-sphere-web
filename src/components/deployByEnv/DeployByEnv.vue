<template>
  <div>
    <el-steps
      class="deploySpeed"
      :align-center="true"
      :active="deployProcessActive"
      finish-status="success">
      <el-step title="合并" :icon="iconName1" :description="mergeErrorMessage" :status="mergeBranchStatus"></el-step>
      <el-step title="构建" :icon="iconName2" :description="buildErrorMessage" :status="buildStatus" ></el-step>
      <el-step title="部署" :icon="iconName3" :description="publishErrorMessage" :status="publishStatus"></el-step>
      <el-step title="完成" :icon="iconName4" :description="finishErrorMessage" :status="finishStatus"></el-step>
    </el-steps>
    <el-divider content-position="left">已部署分支</el-divider>
    <div>
      <el-button type="warning" size="small" @click="withdrawBranch" :disabled="isDisabled">退出分支</el-button>
      <el-button type="primary" size="small" @click="reBuild" :disabled="isDisabled">重新部署</el-button>
      <el-button type="primary" size="small" @click="deploy">部署main分支</el-button>
      <el-button type="primary" size="small" @click="getDepLoyLogList">部署记录</el-button>
      <el-empty v-show="!deployInfo.deployInfo || !deployInfo.deployInfo.featureBranchList || deployInfo.deployInfo.featureBranchList.length <= 0" description="无已部署分支"></el-empty>
      <el-table v-show="deployInfo.deployInfo && deployInfo.deployInfo.featureBranchList && deployInfo.deployInfo.featureBranchList.length > 0" :data="deployInfo.deployInfo.featureBranchList" @selection-change="selectedDeployed" border>
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="branchName" label="分支" width="400"></el-table-column>
        <el-table-column prop="description" label="描述" width="400"></el-table-column>
        <el-table-column prop="createByName" label="创建人" width="180"></el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间"></el-table-column>
      </el-table>
    </div>

    <el-divider content-position="left">未部署分支</el-divider>
    <el-empty v-show="unDeployedBranchList.length <= 0" description="无未部署分支"></el-empty>
    <div v-show="unDeployedBranchList.length > 0">
      <el-button type="primary" size="small" @click="deploy">部署分支</el-button>
      <el-table :data="unDeployedBranchList" @selection-change="getUnDeployBranchIds" ref="selectedStatus" border>
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="branchName" label="分支" width="400"></el-table-column>
        <el-table-column prop="description" label="描述" width="400"></el-table-column>
        <el-table-column prop="createByName" label="创建人" width="180"></el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间"></el-table-column>
      </el-table>
    </div>

    <el-drawer
        size="30%"
        :visible.sync="dialog"
        direction="rtl"
        custom-class="demo-drawer"
        :modal=false
        ref="drawer">
      <div class="demo-drawer__content" v-for="deployLog in deployLogList"  style="margin-bottom: 20px">
        <el-card class="box-card" style="width: 95%; margin: 0 15px">
          <div slot="header" class="clearfix">
            <span>{{ deployLog.projectName }} 最新10次部署记录</span>
          </div>

          <el-descriptions :labelStyle="{width:'100px'}" :size="'mini'" :column="2" border>
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
            <el-descriptions-item :span="2">
              <template slot="label">
                feature分支
              </template>
              <el-tag size="small" type="primary" v-for="item in deployLog.featureBranchNameList">{{ item }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="2">
              <template slot="label">
                release分支
              </template>
              <el-tag size="small" type="primary">{{ deployLog.releaseBranchName }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="2">
              <template slot="label">
                部署时间
              </template>
              <el-tag size="small" type="primary">{{ deployLog.deployTime }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="2">
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
  build,
  deploy,
  getDepLoyLogList,
  getDeployRecord,
  getUnDeployedBranchList,
  mergeBranch,
  withdrawBranch,
  sseClose,
} from "@/api/api";
import bus from "@/util/bus";
import { EventSourcePolyfill } from 'event-source-polyfill'

export default {
  name: "DeployByEnv",
  props : {
    getActiveName: {
      type: String,
      default:'dev'
    },

    deployRecord: {
      type: Object,
      default: {}
    },

    projectInfo: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      //部署环境
      deployEnvironment: this.getActiveName,

      //部署按钮是否禁用
      isDisabled: true,

      //应用信息
      curProjectInfo: {
        id: '',
        projectCode: '',
        projectName: '',
        projectGroupId: '',
        projectGroupName: '',
        gitUrl: '',
        enableStatus: ''
      },

      //部署信息（从父组件获取）
      deployInfo: {
        deployInfo: {
          projectId: '',
          masterId: '',
          releaseBranchId: '',
          releaseBranchName: '',
          deployEnvironment: '',
          featureBranchList: []
        },
        deployStepList: [{
          masterId: '',
          stepCode: '',
          stepName: '',
          stepNo: '',
          stepSerialNo: '',
          stepStatus: 0
        }]
      },

      //未部署分支
      unDeployedBranchList: [],

      deployResult: {
        projectInfo: {},
        releaseBranch: {},
        featureBranchList: [],
        deployMaster: {},
      },

      deployState: {
        deployStep: '',
        deployStatusCode: '',
        deployStatusDesc: ''
      },

      deployProcessActive: -1,
      iconName1: '',
      iconName2: '',
      iconName3: '',
      iconName4: '',

      mergeErrorMessage: '',
      buildErrorMessage: '',
      publishErrorMessage: '',
      finishErrorMessage: '',

      mergeBranchStatus: '',
      buildStatus: '',
      publishStatus: '',
      finishStatus: '',

      //触发部署流程
      deployTrigger: true,

      //打开/关闭抽屉
      dialog: false,
      loading: false,

      saveProjectForm: {
        projectCode: '',
        projectName: '',
        projectGroupId: '',
        projectGroupName: '',
        gitUrl: '',
        enableStatus: ''
      },

      deployLogList: [
          {
            projectId: '',
            projectName: '',
            featureBranchNameList: [],
            releaseBranchName: '',
            deployTime: '',
            deployEnvironment: '',
            deployStatus: '',
            deployByName: '',
            errorMessage: '',
          }
      ],

      eventSource: null
    };
  },
  methods: {
    //根据项目id查询未部署分支列表
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

    //获取部署信息
    async getDeployRecord(deployMasterId) {
      let result
      await getDeployRecord({
        deployMasterId: deployMasterId
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployInfo = res.data.body
          result = res.data.body
          this.deployInfo = result
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
      return result
    },

    //部署分支
    async deploy() {
      this.clearDeployStatus()
      this.deployTrigger = false
      let result
      const toBeDeployBranchIds = this.unDeployedBranchIds.concat(this.deployInfo.deployInfo.featureBranchList.map((item) => item.id));
      await deploy({
        projectId: this.projectInfo.id,
        branchIds: toBeDeployBranchIds,
        deployEnvironment: this.deployEnvironment,
        deployType: 'SUBMIT_BRANCH'
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployResult = res.data.body
          result = res.data.body
          this.listenDeployStepMessage()
        } else {
          this.$message({
            message: res.data.message,
            type: 'error',
            duration: 2000,
          });
        }
      }).catch(err => {
        this.$message({
          message: '获取分支列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
      await this.getUnDeployedBranchList(result.project.id)
      let deployRecord = await this.getDeployRecord(result.deployMaster.id)
      await bus.$emit('deployInfo', deployRecord)
      await this.$refs.selectedStatus.clearSelection()
    },

    //退出分支
    async withdrawBranch() {
      this.clearDeployStatus()
      this.deployTrigger = false
      let result
      await deploy({
        projectId: this.projectInfo.id,
        branchIds: this.deployedBranchIds,
        deployEnvironment: this.deployEnvironment,
        deployType: 'WITHDRAW_BRANCH'
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployResult = res.data.body
          result = res.data.body
          this.listenDeployStepMessage()
        } else {
          this.$message({
            message: '部署失败，原因：' + res.data.message,
            type: 'error',
            duration: 2000,
          });
        }
      }).catch(err => {
        this.$message({
          message: '获取分支列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
      await this.getUnDeployedBranchList(result.project.id)
      let deployRecord = await this.getDeployRecord(result.deployMaster.id)
      await bus.$emit('deployInfo', deployRecord)
      await this.$refs.selectedStatus.clearSelection()
    },

    //重新部署
    async reBuild() {
      this.clearDeployStatus()
      this.deployTrigger = false
      if (!this.deployedBranchIds) {
        return
      }
      let result
      await deploy({
        projectId: this.projectInfo.id,
        branchIds: this.deployedBranchIds,
        deployEnvironment: this.deployEnvironment,
        deployType: 'SUBMIT_BRANCH'
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployResult = res.data.body
          result = res.data.body
          this.listenDeployStepMessage()
        } else {
          this.$message({
            message: res.data.message,
            type: 'error',
            duration: 2000,
          });
        }
      }).catch(err => {
        this.$message({
          message: '获取分支列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
      await this.getUnDeployedBranchList(result.project.id)
      let deployRecord = await this.getDeployRecord(result.deployMaster.id)
      await bus.$emit('deployInfo', deployRecord)
      await this.$refs.selectedStatus.clearSelection()
    },

    //未部署分支选择器
    getUnDeployBranchIds(val) {
      this.unDeployedBranchIds = val.map((item) => item.id);
    },

    //选择需要部署的分支
    selectedDeployed(selectedBranchList) {
      this.deployedBranchIds = selectedBranchList.map((item) => item.id);
      this.isDisabled = this.deployedBranchIds.length <= 0
    },

    listenDeployStepMessage() {
      this.eventSource.onmessage = (res => {
        this.deployState = JSON.parse(res.data)
        if (this.deployState.deployStep === 'merge') {
          this.iconName1 = 'el-icon-loading'
          this.deployProcessActive = 0
          this.next()
        }
        if (this.deployState.deployStep === 'build') {
          this.iconName2 = 'el-icon-loading'
          this.deployProcessActive = 1
          this.iconName1 = null
          this.next()
        }
        if (this.deployState.deployStep === 'publish') {
          this.iconName3 = 'el-icon-loading'
          this.deployProcessActive = 2
          this.iconName2 = null
          this.next()
        }
        if (this.deployState.deployStep === 'finish') {
          this.iconName4 = 'el-icon-loading'
          this.deployProcessActive = 3
          this.iconName3 = null
          this.next()
          if (this.finishStatus === 'success') {
            this.iconName4 = null
            this.deployProcessActive = 4
          }
        }
      })
    },

    next() {
      console.log('当前状态: ' + this.deployProcessActive)
      if (this.deployProcessActive === 0) {
        if (this.deployState.deployStatusCode === 2) {
          this.mergeBranchStatus = 'success'
          this.listenDeployStepMessage()
        } else if (this.deployState.deployStatusCode === 3) {
          this.mergeBranchStatus = 'error'
          this.iconName1 = null
          // this.listenDeployStepMessage()
        }
      }
      if (this.deployProcessActive === 1) {
        if (this.deployState.deployStatusCode === 2) {
          this.buildStatus = 'success'
          this.listenDeployStepMessage()
        }
      }
      if (this.deployProcessActive === 2) {
        if (this.deployState.deployStatusCode === 2) {
          this.publishStatus = 'success'
          this.listenDeployStepMessage()
        }
      }
      if (this.deployProcessActive === 3) {
        if (this.deployState.deployStatusCode === 2) {
          this.finishStatus = 'success'
          this.listenDeployStepMessage()
        }
      }
    },

    getDepLoyLogList() {
      this.dialog = true
      getDepLoyLogList({
        projectId: this.projectInfo.id,
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

    clearDeployStatus() {
      this.deployProcessActive = -1
      this.mergeBranchStatus = ''
      this.buildStatus = ''
      this.publishStatus = ''
      this.finishStatus = ''
      this.mergeErrorMessage = ''
      this.buildErrorMessage = ''
      this.publishErrorMessage = ''
      this.finishErrorMessage = ''
    },

    //关闭抽屉时间
    handleClose(done) {
      if (this.loading) {
        return;
      }
      this.$confirm('确认关闭吗？')
          .then(_ => {
            done();
          })
          .catch(_ => {
          });
    },

    createSseConnect() {
      this.eventSource = new EventSourcePolyfill(`http://192.168.0.10:7002/adp-matrix/sse/connect/1`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`,
          heartbeatTimeout: 10000000
        }
      })
      this.eventSource.onopen = (res => {
        console.log('已建立长连接 ==> ');
      })


    },

    sseClose() {
      sseClose(1)
      console.log('连接已关闭')
    }
  },

  watch: {
    getActiveName(val) {
      this.deployEnvironment = val;
      this.getUnDeployedBranchList(this.deployInfo.deployInfo.projectId);
    },

    //监听部署记录的变化
    'deployRecord': {
      handler(n, o) {
        this.deployInfo = n;
      },
      deep: true
    },

    //监听部署信息的变化
    'projectInfo': {
      handler(n, o) {
        this.curProjectInfo = n;
        this.getUnDeployedBranchList(this.curProjectInfo.id)
      },
      deep: true
    },
  },

  computed: {

  },

  mounted() {
  },

  updated() {
    if (this.deployTrigger) {
      if (this.deployInfo.deployStepList[0].masterId) {
        this.deployProcessActive = this.deployInfo.deployStepList.filter(item => item.stepStatus === 2).length
        this.deployInfo.deployStepList.forEach(item => {
          // debugger
          if (item.stepCode === 'merge') {
            if (item.stepStatus === 0) {
              this.mergeBranchStatus = 'wait'
              this.iconName1 = null
            } else if (item.stepStatus === 1) {
              this.mergeBranchStatus = 'process'
              this.iconName1 = null
            } else if (item.stepStatus === 2) {
              this.mergeBranchStatus = 'success'
              this.iconName1 = null
            } else {
              this.mergeBranchStatus = 'error'
              this.mergeErrorMessage = item.errorMessage
              this.iconName1 = null
            }
          }
        })
      }
    }
  },

  created() {
    this.createSseConnect()
  },

  beforeDestroy() {
    if(this.eventSource) {
      this.eventSource.close()
      this.sseClose();
    }
  },
};
</script>
<style lang="less" scoped>
.envTabs {
  margin-top: 30px;
  .el-button {
    margin-bottom: 10px;
  }
}
.el-steps {
  margin-top: 50px;
  margin-bottom: 50px;
}
.deploySpeed {
  padding: 0 50px;
}
.deployLogDrawer {
  //width: 200px;
}
</style>
