<template>
  <div>
    <el-divider content-position="left">应用信息</el-divider>
    <div style="margin-bottom: 40px;">
      <el-descriptions class="appDeployDiv" title="" :column="2" border>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-s-order"></i>
            应用编码
          </template>
          <el-tag size="small" v-show="(projectInfo.projectCode)">{{projectInfo.projectCode}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-document"></i>
            应用名称
          </template>
          <el-tag size="small"  v-show="(projectInfo.projectName)">{{projectInfo.projectName}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-location-outline"></i>
            应用分组
          </template>
          <el-tag size="small" v-show="(projectInfo.projectGroupId)">
            {{getProjectGroupCode(projectInfo.projectGroupId)}}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-link"></i>
            git地址
          </template>
          <el-tag size="small" v-show="(projectInfo.gitUrl)">{{projectInfo.gitUrl}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template slot="label">
            <i class="el-icon-link"></i>
            release分支
          </template>
          <el-tag size="small" v-show="(deployedInfo.releaseBranchName)">{{deployedInfo.releaseBranchName}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-link"></i>
            feature分支
          </template>
            <el-tag v-show="deployedInfo.featureBranchList && deployedInfo.featureBranchList.length > 0" v-for="item in deployedInfo.featureBranchList" size="small" style="margin-right: 5px">
            {{item.branchName}}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider content-position="left">部署发布</el-divider>
    <el-col>
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="开发环境" name="DEV"><deployByEnv :projectId="projectId" :env="'DEV'" v-if="activeName === 'DEV'"/></el-tab-pane>
        <el-tab-pane label="测试环境" name="TEST"><deployByEnv :projectId="projectId" :env="'TEST'" v-if="activeName === 'TEST'"/></el-tab-pane>
        <el-tab-pane label="演示环境" name="POC"><deployByEnv :projectId="projectId" :env="'POC'" v-if="activeName === 'POC'"/></el-tab-pane>
        <el-tab-pane label="生产环境" name="PROD"><deployByEnv :projectId="projectId" :env="'PROD'" v-if="activeName === 'PROD'"/></el-tab-pane>
      </el-tabs>
    </el-col>
  </div>
</template>

<script>
import deployByEnv  from "@/components/deployByEnv/deployByEnv.vue";
import {getProjectById} from "@/views/applicationManagement/applicationList/api";
import {queryList} from "@/views/applicationManagement/applicationGroup/api";
import bus from "@/util/bus";

export default {
  name: "applicationDeploy",
  components: {
    deployByEnv
  },
  data() {
    return {

      projectId: '',
      deployMasterId: '',

      //tabs 当前激活环境
      activeName: 'DEV',

      //应用分组
      projectGroupList: [],

      //应用信息
      projectInfo: {},

      deployedInfo: {},

      deployMaster: {},

      deployRecord: {},

      //已合并分支列表
      featureBranchList: [],
      deployedBranch: ''
    };
  },
  methods: {
    //获取项目信息
    getProject(projectId) {
      getProjectById({
        projectId: projectId
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectInfo = res.data.body;
          localStorage.setItem('projectId', JSON.stringify(this.projectInfo.id))
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
        this.loading = false
      })
    },

    getGroupList() {
      queryList({
        searchText: '',
        enableStatus: '启用'
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectGroupList = res.data.body
        }
      })
    },

    getProjectGroupCode(id) {
      const obj = this.projectGroupList.find(item => item.id === id)
      return obj === undefined ? '' : obj.projectGroupCode
    }
  },

  mounted() {
    bus.$on('deployInfo', data => {
      if (JSON.stringify(data)) {
        this.deployedInfo = data
      }
    });
  },

  created() {
    if (localStorage.getItem('projectId')) {
      const projectId = JSON.parse(localStorage.getItem('projectId'))
      this.getProject(projectId)
      this.getGroupList()
      return
    }
    if (this.$route.params.projectId) {
      this.projectId = this.$route.params.projectId;
      this.getProject(this.projectId)
      this.getGroupList()
    }
  },

  beforeDestroy() {
    bus.$off('deployInfo')
    localStorage.removeItem('projectId')
  },
};
</script>

<style lang="less" scoped>

</style>
