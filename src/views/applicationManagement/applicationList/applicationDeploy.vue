<template>
  <div>
    <el-divider content-position="left">应用信息</el-divider>
    <div>
      <el-descriptions class="appDeployDiv" title="" :column="2" border>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-s-order"></i>
            应用编码
          </template>
          <el-tag size="small" v-if="projectInfo.projectCode">{{projectInfo.projectCode}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-document"></i>
            应用名称
          </template>
          <el-tag size="small" v-if="projectInfo.projectName">{{projectInfo.projectName}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-location-outline"></i>
            应用分组
          </template>
          <el-tag size="small" v-if="projectInfo.projectGroupId">
            {{projectGroupMap.get(projectInfo.projectGroupId) || '未知'}}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-link"></i>
            git地址
          </template>
          <el-tag size="small" v-if="projectInfo.gitUrl">{{projectInfo.gitUrl}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template slot="label">
            <i class="el-icon-link"></i>
            release分支
          </template>
          <el-tag size="small" v-if="deployedInfo.releaseBranchName">{{deployedInfo.releaseBranchName}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-link"></i>
            feature分支
          </template>
          <el-tag
              v-if="deployedInfo.featureBranchList && deployedInfo.featureBranchList.length > 0"
              v-for="item in deployedInfo.featureBranchList"
              :key="item.branchName"
              size="small"
              style="margin-right: 5px">
            {{item.branchName}}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider content-position="left">部署发布</el-divider>
    <el-col>
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="开发环境" name="DEV">
          <deployByEnv
              :projectId="projectId"
              :env="'DEV'"
              v-if="activeName === 'DEV'"
              @deployInfoUpdated="onDeployInfoUpdated" />
        </el-tab-pane>
        <el-tab-pane label="测试环境" name="TEST">
          <deployByEnv
              :projectId="projectId"
              :env="'TEST'"
              v-if="activeName === 'TEST'"
              @deployInfoUpdated="onDeployInfoUpdated" />
        </el-tab-pane>
        <el-tab-pane label="演示环境" name="POC">
          <deployByEnv
              :projectId="projectId"
              :env="'POC'"
              v-if="activeName === 'POC'"
              @deployInfoUpdated="onDeployInfoUpdated" />
        </el-tab-pane>
        <el-tab-pane label="生产环境" name="PROD">
          <deployByEnv
              :projectId="projectId"
              :env="'PROD'"
              v-if="activeName === 'PROD'"
              @deployInfoUpdated="onDeployInfoUpdated" />
        </el-tab-pane>
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
    // 新增: 事件处理
    onDeployInfoUpdated(data) {
      if (JSON.stringify(data)) {
        this.deployedInfo = data;
      }
    },
    //获取项目信息
    getProject(projectId) {
      getProjectById({
        projectId: projectId
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectInfo = res.data.body;

          // ---------------------------------
          // 关键修复：
          // ---------------------------------
          // 发出事件，通知 PageHeader 更新标题
          bus.$emit('set-page-title', this.projectInfo.projectName);

          // (旧的 localStorage 逻辑)
          localStorage.setItem('projectId', this.projectInfo.id)
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

    // getProjectGroupCode(id) {
    //   const obj = this.projectGroupList.find(item => item.id === id)
    //   return obj === undefined ? '' : obj.projectGroupCode
    // }
  },

  computed: {
    // [优化] 使用 computed map 代替 'find' 方法，性能更好
    projectGroupMap() {
      const map = new Map();
      this.projectGroupList.forEach(item => {
        map.set(item.id, item.projectGroupCode);
      });
      return map;
    }
  },

  mounted() {
  },

  created() {
    // 1. 优先从 URL query 中读取
    let projectId = this.$route.query.projectId;

    if (projectId) {
      // 2. 如果 URL 中有，使用它，并更新 localStorage 供刷新使用
      this.projectId = projectId;
      localStorage.setItem('projectId', projectId); // 存入 (不需要 JSON.stringify)
    } else {
      // 3. 如果 URL 中没有 (例如 F5 刷新页面)，从 localStorage 回退
      this.projectId = localStorage.getItem('projectId');
    }

    if (this.projectId) {
      this.getProject(this.projectId);
      this.getGroupList();
    } else {
      // 4. 彻底找不到ID，报错并返回
      this.$message.error('未指定应用ID，即将返回列表页');
      this.$router.push('/applicationManagement/application');
    }
  },
  beforeDestroy() {
    // 离开页面时，重置标题
    bus.$emit('set-page-title', null);
    // (localStorage.removeItem('projectId') 已在上面被移除)
  },
};
</script>

<style lang="less" scoped>

</style>
