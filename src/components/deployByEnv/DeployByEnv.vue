<template>
  <div>
    <el-steps
      class="deploySpeed"
      :align-center="true"
      :active="deployProcessActive"
      finish-status="success">
      <el-step title="合并" :icon="mergeIcon" :description="mergeErrorMessage" :status="mergeStatus"></el-step>
      <el-step title="构建" :icon="buildIcon" :description="buildErrorMessage" :status="buildStatus" ></el-step>
      <el-step title="部署" :icon="publishIcon" :description="publishErrorMessage" :status="publishStatus"></el-step>
      <el-step title="完成" :icon="finishIcon" :description="finishErrorMessage" :status="finishStatus"></el-step>
    </el-steps>
    <el-divider content-position="left">已部署分支</el-divider>
    <div>
      <el-button type="warning" size="small" @click="withdrawBranch" :disabled="isDisabled">退出分支</el-button>
      <el-button type="primary" size="small" @click="reBuild" :disabled="isDisabled">重新部署</el-button>
      <el-button type="primary" size="small" @click="deploy">部署main分支</el-button>
      <el-button type="primary" size="small" @click="getDepLoyLogList">部署记录</el-button>
      <el-empty v-show="!deployInfo || !deployInfo.featureBranchList || deployInfo.featureBranchList.length <= 0" description="无已部署分支"></el-empty>
      <el-table v-show="deployInfo && deployInfo.featureBranchList && deployInfo.featureBranchList.length > 0" :data="deployInfo.featureBranchList" @selection-change="selectedDeployed" border>
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
      <el-button type="primary" size="small" @click="deploy" :disabled="deployBranchBtnIsDisabled">部署分支</el-button>
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
  getDepLoyLogList, getDeployMaster,
  getDeployRecord, getUnDeployedBranchList,
  sseClose, getDeployStepList
} from "@/api/api";
import bus from "@/util/bus";
import { EventSourcePolyfill } from 'event-source-polyfill'

export default {
  name: "DeployByEnv",
  props : {
    activeName: {
      type: String,
      default:'dev'
    },

    projectId: ''
  },
  data() {
    return {
      //部署环境
      deployEnvironment: this.activeName,

      //部署按钮是否禁用
      isDisabled: true,
      deployBranchBtnIsDisabled: true,

      curProjectId: this.projectId,

      //应用信息
      projectInfo: {
        id: '',
        projectCode: '',
        projectName: '',
        projectGroupId: '',
        projectGroupName: '',
        gitUrl: '',
        enableStatus: ''
      },

      deployMaster: {},

      //部署信息（从父组件获取）
      deployInfo: {
        projectId: '',
        masterId: '',
        releaseBranchId: '',
        releaseBranchName: '',
        deployEnvironment: '',
        featureBranchList: []
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
      mergeIcon: '',
      buildIcon: '',
      publishIcon: '',
      finishIcon: '',

      mergeErrorMessage: '',
      buildErrorMessage: '',
      publishErrorMessage: '',
      finishErrorMessage: '',

      mergeStatus: '',
      buildStatus: '',
      publishStatus: '',
      finishStatus: '',

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

    async getDeployMaster(projectId, activeName) {
      let result
      await getDeployMaster({
        projectId: projectId,
        deployEnvironment: activeName
      }).then(res => {
        if (res.data.code === 2000) {
          this.deployMaster = res.data.body
          result = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000
        });
      })
      if (result) {
        await this.getDeployRecord(result.id)
        if (this.deployInfo) {
          await bus.$emit('deployInfo', this.deployInfo)
        }
      } else {
        await bus.$emit('deployInfo', {deployInfo: {}, featureBranchList: []})
      }
      return result
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
      await this.clearDeployStatus()
      await this.createSseConnect(this.curProjectId)
      let result
      const toBeDeployBranchIds = this.unDeployedBranchIds.concat(this.deployInfo.featureBranchList.map((item) => item.id));
      await deploy({
        projectId: this.curProjectId,
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
      // await this.clearDeployStatus()
      await this.createSseConnect(this.curProjectId)
      let result
      await deploy({
        projectId: this.curProjectId,
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
      await this.clearDeployStatus()
      await this.createSseConnect(this.curProjectId)
      if (!this.deployedBranchIds) {
        return
      }
      let result
      await deploy({
        projectId: this.curProjectId,
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
      this.deployBranchBtnIsDisabled = this.unDeployedBranchIds.length <= 0
    },

    //选择需要部署的分支
    selectedDeployed(selectedBranchList) {
      this.deployedBranchIds = selectedBranchList.map((item) => item.id);
      this.isDisabled = this.deployedBranchIds.length <= 0
    },

    listenDeployStepMessage() {
      this.eventSource.onmessage = (res => {
        console.log(res.data, 111)
        const item = JSON.parse(res.data)
        // if (this.deployState.deployStep === 'merge') {
        //   this.iconName1 = 'el-icon-loading'
        //   this.deployProcessActive = 0
        //   this.next()
        // }
        if (item.stepCode === 'merge') {
          if (item.stepStatus === 0) {
            this.deployProcessActive = 0
          }
          if (item.stepStatus === 1) {
            this.mergeIcon = 'el-icon-loading'
            this.deployProcessActive = 0
          }
          if (item.stepStatus === 2) {
            this.mergeIcon = null
            this.deployProcessActive = 1
          }
          if (item.stepStatus === 3) {
            this.mergeIcon = null
            this.deployProcessActive = 1
            this.mergeStatus = 'error'
            this.mergeIcon = null
            this.finishErrorMessage = item.errorMessage
          }
        }

        if (item.stepCode === 'build') {
          if (item.stepStatus === 0) {
            this.deployProcessActive = 1
          }
          if (item.stepStatus === 1) {
            this.buildIcon = 'el-icon-loading'
            this.deployProcessActive = 1
          }
          if (item.stepStatus === 2) {
            this.buildIcon = null
            this.deployProcessActive = 2
          }
          if (item.stepStatus === 3) {
            this.buildIcon = null
            this.deployProcessActive = 2
            this.buildStatus = 'error'
            this.buildErrorMessage = item.errorMessage
          }
        }

        if (item.stepCode === 'publish') {
          if (item.stepStatus === 0) {
            this.deployProcessActive = 2
          }
          if (item.stepStatus === 1) {
            this.publishIcon = 'el-icon-loading'
            this.deployProcessActive = 2
          }
          if (item.stepStatus === 2) {
            this.publishIcon = null
            this.deployProcessActive = 3
          }
          if (item.stepStatus === 3) {
            this.publishIcon = null
            this.deployProcessActive = 3
            this.publishStatus = 'error'
            this.publishErrorMessage = item.errorMessage
          }
        }

        if (item.stepCode === 'finish') {
          if (item.stepStatus === 0) {
            this.deployProcessActive = 3
          }
          if (item.stepStatus === 1) {
            this.finishIcon = 'el-icon-loading'
            this.deployProcessActive = 3
          }
          if (item.stepStatus === 2) {
            this.finishIcon = null
            this.deployProcessActive = 4
            this.sseClose(this.curProjectId)
          }
          if (item.stepStatus === 3) {
            this.finishIcon = null
            this.deployProcessActive = 4
            this.finishStatus = 'error'
            this.finishErrorMessage = item.errorMessage
            this.sseClose(this.curProjectId)
          }
        }
      })
    },

    next() {
      if (this.deployProcessActive === 0) {
        if (this.deployState.deployStatusCode === 2) {
          this.mergeStatus = 'success'
        } else if (this.deployState.deployStatusCode === 3) {
          this.mergeStatus = 'error'
          this.mergeIcon = null
          this.mergeErrorMessage = this.deployState.errorMessage
        }
      }
      if (this.deployProcessActive === 1) {
        if (this.deployState.deployStatusCode === 2) {
          this.buildStatus = 'success'
        } else if (this.deployState.deployStatusCode === 3) {
          this.buildStatus = 'error'
          this.buildIcon = null
          this.buildErrorMessage = this.deployState.errorMessage
        }
      }
      if (this.deployProcessActive === 2) {
        if (this.deployState.deployStatusCode === 2) {
          this.publishStatus = 'success'
        } else if (this.deployState.deployStatusCode === 3) {
          this.publishStatus = 'error'
          this.publishIcon = null
          this.publishErrorMessage = this.deployState.errorMessage
        }
      }
      if (this.deployProcessActive === 3) {
        if (this.deployState.deployStatusCode === 2) {
          this.finishStatus = 'success'
        } else if (this.deployState.deployStatusCode === 3) {
          this.finishStatus = 'error'
          this.finishIcon = null
          this.finishErrorMessage = this.deployState.errorMessage
        }
      }
    },

    getDepLoyLogList() {
      this.dialog = true
      getDepLoyLogList({
        projectId: this.curProjectId,
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

    getDeployStepList() {
      getDeployStepList({
        projectId: this.curProjectId,
        deployEnvironment: this.deployEnvironment
      }).then(res => {
        if (res.data.code === 2000) {
          const mergeStep = res.data.body.find(item => item.stepCode === 'merge')
          const buildStep = res.data.body.find(item => item.stepCode === 'build')
          const publishStep = res.data.body.find(item => item.stepCode === 'publish')
          const finishStep = res.data.body.find(item => item.stepCode === 'finish')

          if (finishStep.stepStatus === 1) {
            this.deployProcessActive = 4
            this.finishIcon = 'el-icon-loading'
          } else if (finishStep.stepStatus === 2) {
            this.deployProcessActive = 4
            return;
          } else if (finishStep.stepStatus === 3) {
            this.deployProcessActive = 3
            this.finishStatus = 'error'
            this.finishErrorMessage = finishStep.errorMessage
            return;
          }

          if (publishStep.stepStatus === 1) {
            this.deployProcessActive = 3
            this.publishIcon = 'el-icon-loading'
          } else if (publishStep.stepStatus === 2) {
            this.deployProcessActive = 3
            return;
          } else if (publishStep.stepStatus === 3) {
            this.deployProcessActive = 2
            this.publishStatus = 'error'
            this.publishErrorMessage = publishStep.errorMessage
            return;
          }

          if (buildStep.stepStatus === 1) {
            this.deployProcessActive = 2
            this.buildIcon = 'el-icon-loading'
          } else if (buildStep.stepStatus === 2) {
            this.deployProcessActive = 2
            return;
          } else if (buildStep.stepStatus === 3) {
            this.deployProcessActive = 1
            this.buildStatus = 'error'
            this.buildErrorMessage = buildStep.errorMessage
            return;
          }

          if (mergeStep.stepStatus === 1) {
            this.deployProcessActive = 1
            this.mergeIcon = 'el-icon-loading'
          } else if (mergeStep.stepStatus === 2) {
            this.deployProcessActive = 1
          } else if (mergeStep.stepStatus === 3) {
            this.deployProcessActive = 0
            this.mergeStatus = 'error'
            this.mergeErrorMessage = mergeStep.errorMessage
          }
        }
      }).catch(err => {
        this.$message({
          message: '查询部署步骤失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    clearDeployStatus() {
      this.deployProcessActive = -1
      this.mergeStatus = ''
      this.buildStatus = ''
      this.publishStatus = ''
      this.finishStatus = ''
      this.mergeErrorMessage = ''
      this.buildErrorMessage = ''
      this.publishErrorMessage = ''
      this.finishErrorMessage = ''
    },

    createSseConnect(projectId) {
      this.eventSource = new EventSourcePolyfill(`http://192.168.0.10:7002/adp-matrix/sse/connect/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adpSsoToken')}`,
          heartbeatTimeout: 10000000
        }
      })
      this.eventSource.onopen = (res => {
        console.log('已建立长连接 ==> ');
      })
    },

    sseClose(projectId) {
      this.eventSource.onerror = (err) => {
        this.eventSource.close()
      }
      sseClose(projectId)
      console.log('连接已关闭')
    }
  },

  watch: {
  },

  computed: {

  },

  mounted() {
    this.getUnDeployedBranchList(this.curProjectId)
    this.getDeployMaster(this.curProjectId, this.activeName).then(data => {
      if (this.deployMaster.deployStatus === 0) {
        this.createSseConnect(this.curProjectId)
        this.listenDeployStepMessage()
      }
    })
  },

  created() {
    if (localStorage.getItem('projectId')) {
      this.curProjectId = localStorage.getItem('projectId')
    }
    this.getDeployStepList()
  },

  beforeDestroy() {
    if(this.eventSource) {
      this.eventSource.close()
      this.sseClose(this.curProjectId);
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
