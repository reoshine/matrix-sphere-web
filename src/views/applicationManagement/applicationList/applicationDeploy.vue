<template>
  <div class="app-container">
    <el-card class="info-card" shadow="never">
      <div slot="header" class="clearfix">
        <span class="card-title"><i class="el-icon-s-operation"></i> 应用状态概览</span>
        <el-tag
            size="small"
            effect="dark"
            :type="activeName === 'PROD' ? 'danger' : 'primary'"
            style="float: right"
        >
          当前控制台: {{ envMap[activeName] }}
        </el-tag>
      </div>

      <el-descriptions class="margin-top" :column="4" border size="medium">
        <el-descriptions-item label="应用名称">
          <span class="text-bold">{{ projectInfo.projectName }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="应用编码">
          <el-tag size="small" type="info">{{ projectInfo.projectCode }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="所属分组">
          {{ projectGroupMap.get(projectInfo.projectGroupId) || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="Git 仓库">
          <el-link
              v-if="projectInfo.gitUrl"
              type="primary"
              :href="projectInfo.gitUrl"
              target="_blank"
              :underline="false"
          >
            <i class="el-icon-link"></i> 跳转仓库
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="当前 Release 分支" :span="2">
          <el-tag v-if="deployedInfo.releaseBranchName" type="success" effect="light">
            <i class="el-icon-guide"></i> {{ deployedInfo.releaseBranchName }}
          </el-tag>
          <span v-else class="text-gray">暂无发布分支信息</span>
        </el-descriptions-item>

        <el-descriptions-item label="包含 Feature 分支" :span="2">
          <div v-if="deployedInfo.featureBranchList && deployedInfo.featureBranchList.length > 0" class="feature-tags">
            <el-tag
                v-for="item in deployedInfo.featureBranchList"
                :key="item.branchName"
                size="mini"
                type="warning"
                effect="plain"
                class="feature-item"
            >
              {{ item.branchName }}
            </el-tag>
          </div>
          <span v-else class="text-gray">无合并特性分支</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="deploy-card" shadow="never" :body-style="{ padding: '0' }">
      <el-tabs v-model="activeName" type="border-card" class="env-tabs">
        <el-tab-pane name="DEV">
          <span slot="label"><i class="el-icon-cpu"></i> 开发环境 (DEV)</span>
          <div class="tab-content">
            <deployByEnv
                v-if="activeName === 'DEV'"
                :projectId="projectId"
                env="DEV"
                @deployInfoUpdated="onDeployInfoUpdated"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="TEST">
          <span slot="label"><i class="el-icon-s-check"></i> 测试环境 (TEST)</span>
          <div class="tab-content">
            <deployByEnv
                v-if="activeName === 'TEST'"
                :projectId="projectId"
                env="TEST"
                @deployInfoUpdated="onDeployInfoUpdated"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="POC">
          <span slot="label"><i class="el-icon-monitor"></i> 演示环境 (POC)</span>
          <div class="tab-content">
            <deployByEnv
                v-if="activeName === 'POC'"
                :projectId="projectId"
                env="POC"
                @deployInfoUpdated="onDeployInfoUpdated"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="PROD">
          <span slot="label"><i class="el-icon-s-platform"></i> 生产环境 (PROD)</span>
          <div class="tab-content">
            <deployByEnv
                v-if="activeName === 'PROD'"
                :projectId="projectId"
                env="PROD"
                @deployInfoUpdated="onDeployInfoUpdated"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import deployByEnv  from "@/components/deployByEnv/deployByEnv.vue";
import { getProjectById } from "@/views/applicationManagement/applicationList/api";
import { queryList } from "@/views/applicationManagement/applicationGroup/api";
import bus from "@/util/bus";

export default {
  name: "applicationDeploy",
  components: {
    deployByEnv
  },
  data() {
    return {
      projectId: '',

      // 当前激活环境
      activeName: 'DEV',

      // 字典映射 (用于右上角 Tag 显示)
      envMap: {
        'DEV': '开发环境',
        'TEST': '测试环境',
        'POC': '演示环境',
        'PROD': '生产环境'
      },

      // 数据
      projectGroupList: [],
      projectInfo: {},
      deployedInfo: {}, // 存储子组件传递回来的分支信息
    };
  },

  computed: {
    // 优化：使用 Map 提高查找效率
    projectGroupMap() {
      const map = new Map();
      if (this.projectGroupList && this.projectGroupList.length > 0) {
        this.projectGroupList.forEach(item => {
          map.set(item.id, item.projectGroupCode);
        });
      }
      return map;
    }
  },

  methods: {
    // 接收子组件传来的部署信息 (release分支/feature分支)
    onDeployInfoUpdated(data) {
      if (data && Object.keys(data).length > 0) {
        this.deployedInfo = data;
      }
    },

    // 获取项目详情
    getProject(projectId) {
      const loading = this.$loading({ target: '.info-card', text: '加载应用信息...' });
      getProjectById({ projectId: projectId }).then(res => {
        if (res.data.code === 2000) {
          this.projectInfo = res.data.body;

          // 更新 PageHeader
          bus.$emit('set-page-title', this.projectInfo.projectName);
        }
      }).catch(err => {
        this.$message.error('查询应用信息失败：' + err);
      }).finally(() => {
        loading.close();
      });
    },

    // 获取分组列表
    getGroupList() {
      queryList({ searchText: '', enableStatus: '启用' }).then(res => {
        if (res.data.code === 2000) {
          this.projectGroupList = res.data.body || [];
        }
      });
    }
  },

  created() {
    // 1. 优先从 Query 获取
    let pid = this.$route.query.projectId;

    // 2. 其次从 LocalStorage 获取 (处理刷新)
    if (!pid) {
      pid = localStorage.getItem('projectId');
    }

    if (pid) {
      this.projectId = pid;
      // 更新缓存
      localStorage.setItem('projectId', pid);

      this.getProject(this.projectId);
      this.getGroupList();
    } else {
      this.$message.warning('丢失应用ID参数，请从列表页重新进入');
      this.$router.push('/applicationManagement/applicationList');
    }
  },

  beforeDestroy() {
    // 重置标题
    bus.$emit('set-page-title', null);
  }
};
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}

/* 1. 顶部信息卡片 */
.info-card {
  margin-bottom: 20px;
  border: none;

  .card-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }

  .text-bold {
    font-weight: 600;
    color: #303133;
  }

  .text-gray {
    color: #909399;
    font-size: 12px;
  }

  .feature-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
}

/* 2. 部署 Tabs 卡片 */
.deploy-card {
  border: none;
  min-height: 500px; /* 保证高度 */

  /* 覆盖 Element UI Tabs 样式，使其更贴合 Card */
  :deep(.el-tabs--border-card) {
    border: none;
    box-shadow: none;
  }

  :deep(.el-tabs--border-card > .el-tabs__header) {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-tabs--border-card > .el-tabs__content) {
    padding: 0; /* 去除默认 padding，让子组件自己控制 */
  }

  .tab-content {
    padding: 20px;
  }
}
</style>