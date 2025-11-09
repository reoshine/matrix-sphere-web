<template>
<div>
  <div class="container">
    <div class="left-panel">
      <el-divider content-position="left">应用详情</el-divider>
      <el-form :model="modifyProjectForm" :rules="rules" ref="modifyProjectFormRef">
        <el-form-item prop="projectCode" label="项目编码" label-width="100px">
          <el-input style="width: 80%" v-model="modifyProjectForm.projectCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="projectName" label="项目名称" label-width="100px">
          <el-input style="width: 80%" v-model="modifyProjectForm.projectName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="projectGroupCode" label="分组名称" label-width="100px">
          <el-select size="medium" v-model="modifyProjectForm.projectGroupId" placeholder="请选择">
            <el-option
                v-for="item in projectGroupList"
                :key="item.id"
                :label="item.projectGroupCode"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="gitUrl" label="git地址" label-width="100px">
          <el-input style="width: 80%" v-model="modifyProjectForm.gitUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="enableStatus" label="启用状态" label-width="100px">
          <el-select size="medium" v-model="modifyProjectForm.enableStatus" placeholder="请选择">
            <el-option
                v-for="item in enableStatusList"
                :key="item"
                :label="item"
                :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 20px" @click="cancelForm">取 消</el-button>
      <!-- @click="$refs.drawer.closeDrawer()"  -->
      <el-button type="primary" @click="modifyProject" :loading="loading">{{
          loading ? '提交中 ...' : '确 定'
        }}
      </el-button>
    </div>
    <div class="right-panel">
      <el-divider content-position="left">jenkins Job配置</el-divider>
      <pre>
        <code>{{ modifyProjectForm.jobXml }}</code>
      </pre>
    </div>
  </div>
</div>
</template>

<script>
import beautify from 'vkbeautify'
import hljs from 'highlight.js'
import 'highlight.js/styles/a11y-light.css'
import {getProjectInfo, modifyProject} from "@/views/applicationManagement/applicationList/api";
import {queryList} from "@/views/applicationManagement/applicationGroup/api";

export default {
  name: "applicationEdit",
  data() {
    return {
      projectId: '',

      modifyProjectForm: {
        projectCode: '',
        projectName: '',
        projectGroupId: '',
        projectGroupCode: '',
        gitUrl: '',
        enableStatus: '',
        jobXml: ''
      },
      rules: {
        projectCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' },
          { min: 3, max: 40, message: '长度在3到40个字符', trigger: 'blur' },
        ],
        projectName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在3到30个字符', trigger: 'blur' },
        ],
        projectGroupId: [
          { required: true, message: '请选择项目分组', trigger: 'blur' },
        ],
        gitUrl: [
          { required: true, message: '请输入正确的git地址', trigger: 'blur' },
          { min: 12, max: 100, message: '长度在12到100个字符', trigger: 'blur' },
        ],
        enableStatus: [
          { required: true, message: '请选择启用状态', trigger: 'blur' },
        ]
      },

      projectGroupId: '',
      projectGroupList: [],
      enableStatusList: ['启用', '停用'],
      loading: false,

      xmlContent: '',
      prettyXmlContent: ''
    }
  },

  methods: {
    getProjectInfo(projectId) {
      getProjectInfo({
        projectId: projectId
      }).then(res => {
        if (res.data.code === 2000) {
          this.modifyProjectForm = res.data.body
          if (this.modifyProjectForm.jobXml) {
            this.modifyProjectForm.jobXml = beautify.xml(this.modifyProjectForm.jobXml)
            //注意数据显示后再去渲染高亮
            this.$nextTick(() => {
              document.querySelectorAll('pre code').forEach((el) => {
                hljs.highlightElement(el);
              });
            });
          }
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //抽屉表单提交
    modifyProject() {
      this.$refs.modifyProjectFormRef.validate((valid) => {
        if (valid) {
          modifyProject({
            ...this.modifyProjectForm
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                message: '更新应用成功！',
                type: 'success',
                duration: 1000,
                onClose: () => {
                  location.reload();
                }
              });
            } else {
              this.$message({
                message: res.data.message,
                type: 'error',
                duration: 3000,
              });
            }
          }).catch(err => {
            this.$message({
              message: '更新应用失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
            this.loading = false
          })
        }
      });
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

    cancelForm() {
      this.loading = false
      clearTimeout(this.timer)
      this.$router.back()
    },
  },

  mounted() {
  },

  created () {
    this.getGroupList()
    if (this.$route.params.projectId) {
      this.projectId = this.$route.params.projectId;
      this.getProjectInfo(this.projectId)
      localStorage.setItem('projectId', JSON.stringify(this.projectId))
      return;
    }
    if (localStorage.getItem('projectId')) {
      const projectId = JSON.parse(localStorage.getItem('projectId'))
      this.getProjectInfo(projectId)
    }
  },

  destroyed () {
    localStorage.removeItem('projectId')
  }
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;  /* 占据整个视口高度 */
  border: none;
  padding: 20px 0;
}

.left-panel, .right-panel {
  flex: 1; /* 分配相等空间 */
  padding: 10px; /* 添加一些内边距 */
  overflow-y: auto; /* 如果内容过多，允许垂直滚动 */
}

/* 可以根据需要为左右面板添加不同的背景色或边框等样式 */
.left-panel {
  background-color: #fff;
}

.right-panel {
  background-color: #fff;
}
</style>

