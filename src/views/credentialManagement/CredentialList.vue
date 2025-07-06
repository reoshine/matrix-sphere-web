<template>
  <div>
    <div>
      <el-input
          minlength="0"
          maxlength="20"
          style="width: 320px;"
          size="medium"
          placeholder="请输入凭据描述，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="page">查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addDialog">新增</el-button>
    </div>
    <el-divider content-position="left">凭据列表</el-divider>
    <el-empty v-show="credentialList.length <= 0" description="未添加任务凭据"></el-empty>
    <el-row v-show="credentialList.length > 0" :gutter="20">
      <el-col v-for="credential in credentialList" :key="credential.id" :span="6">
        <el-card shadow="hover" :body-style="{ padding: '0px' }">
          <div style="padding: 10px">
            <div style="color: #2b4b6b; font-weight: bold">{{ credential.credentialType }}</div>
            <div>
              <el-tag style="color: #324157" type="" size="small">{{ credential.credentialDesc }}</el-tag>
              <el-divider content-position="left">配置信息</el-divider>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px">
                <el-tag type="warning" style="color: #324157; cursor: pointer; flex: 1" size="large">
                  <strong>url: </strong>{{ credential.config.url }}
                </el-tag>
                <el-button :disabled="!credential.config.url" type="primary" size="mini" icon="el-icon-document-copy" circle @click="handleCopy(credential.config.url)"/>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px">
                <el-tag type="warning"  style="color: #324157; cursor: pointer; flex: 1" size="large">
                  <strong>token: </strong>{{ credential.config.token }}
                </el-tag>
                <el-button :disabled="!credential.config.token" type="primary" size="mini" icon="el-icon-document-copy" circle @click="handleCopy(credential.config.token)"/>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px">
                <el-tag type="warning"  style="color: #324157; cursor: pointer; flex: 1" size="large">
                  <strong>用户名: </strong>{{ credential.config.user }}
                </el-tag>
                <el-button :disabled="!credential.config.user" type="primary" size="mini" icon="el-icon-document-copy" circle @click="handleCopy(credential.config.user)"/>
              </div>
            </div>
            <el-button @click.stop="removeCredential(credential.id)" style="float: right;"
                       size="small" icon="el-icon-delete">
              删除</el-button>
            <el-button @click.stop="credentialEdit(credential)" style="float: right; margin-right: 10px;"
                       size="small" type="primary" plain icon="el-icon-edit">
              编辑
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div style="position: absolute; bottom: 10px;right: 0" v-show="credentialList.length > 0" class="pagination">
      <el-pagination
          class="text-center"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pageNum"
          :page-sizes="pageSizes"
          :page-size="pageCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
    <el-dialog title="修改凭据"
               :close-on-click-modal="false"
               :visible.sync="modifyCredentialDialogVisible"
               width="25%">
      <el-form class="modifyCredential"
               :model="modifyCredentialInfoForm"
               :rules="modifyCredentialRules"
               ref="modifyCredentialRef"
               size="small">
        <el-form-item label="凭据类型" prop="credentialType" label-width="80px">
          <el-select size="medium" v-model="modifyCredentialInfoForm.credentialType" placeholder="请选择">
            <el-option
                v-for="item in credentialTypeList"
                :key="item.canPush"
                :label="item.canPushDesc"
                :value="item.canPush">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="凭据url" prop="config.url" label-width="80px">
          <el-input v-model="modifyCredentialInfoForm.config.url" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="凭据描述" prop="config.token" label-width="80px">
          <el-input v-model="modifyCredentialInfoForm.config.token" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="凭据用户" prop="config.user" label-width="80px">
          <el-input v-model="modifyCredentialInfoForm.config.user" autocomplete="off" :disabled="!modifyCredentialInfoForm.config.user"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCredential">取 消</el-button>
        <el-button type="primary" @click="modifyCredential">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {modifyById, page, add, removeById} from "./api";

export default {
  name: "CredentialList",
  data() {
    return {
      //分页参数
      total: 0,
      pageNum: 1,
      pageCount: 10,
      pageSizes: [10, 20, 50, 100],

      //弹窗的title文案
      dialogTitle: '',

      //搜索内容
      searchText: '',

      //应用分组
      credentialInfo: {
        id: '',
        credentialType: '',
        config: {
          user: '',
          url: '',
          token: ''
        },
        credentialDesc: '',
        createByName: '',
        gmtCreate: '',
      },

      modifyCredentialInfoForm: {
        id: '',
        credentialType: '',
        config: {
          user: '',
          url: '',
          token: ''
        },
        credentialDesc: '',
        createByName: '',
        gmtCreate: '',
      },

      modifyCredentialDialogVisible: false,

      modifyCredentialRules: {
        credentialType: [
          { required: true, message: "请输入分支描述", trigger: "blur" },
          { min: 2, max: 50, message: "长度在2到50个字符", trigger: "blur" },
        ]
      },

      credentialTypeList: [],
      credentialList: [],


      //启用状态列表
      enableStatus: '启用',
      enableStatusList: ['启用', '停用'],
    }
  },
  methods: {
    async handleCopy(url) {
      // console.log(err)
      // 降级处理：兼容旧版浏览器
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message({
          message: '复制成功',
          type: 'success',
          duration: 2000
        })
      } catch (fallbackErr) {
        this.$message.error('复制失败，请手动选择复制')
      } finally {
        document.body.removeChild(textarea)
      }
    },
    //当前页改变事件
    handleCurrentChange(val) {
      this.pageNum = val;
      this.queryPage(this.pageNum)
    },

    //每页展示数改变事件
    handleSizeChange(val) {
      this.pageCount = val;
      this.queryPage(this.pageCount)
    },

    //分页查询分组列表
    page() {
      page({
        pageNum: this.pageNum,
        pageCount: this.pageCount,
        searchText: '',
        enableStatus: this.enableStatus
      }).then(res => {
        if (res.data.code === 2000) {
          const result = res.data.body;
          this.total = result.total;
          this.credentialList = result.data;
          // this.credentialList.forEach(item => {item.config = this.prettyPrintJson(item.config)})
        }
      }).catch(err => {
        this.$message({
          message: '分页查询应用分组失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
        this.loading = false
      })
    },

    addDialog() {
      this.dialogTitle = '新增应用分组'
      this.modifyGroupDialogVisible = true
      this.modifyGroupFormVisible = true
    },

    credentialEdit(credential) {
      this.modifyCredentialDialogVisible = true
      this.modifyCredentialInfoForm = JSON.parse(JSON.stringify(credential))
    },

    modifyCredential() {
      console.log(this.modifyCredentialInfoForm, 222)

    },

    cancelCredential() {
      this.modifyCredentialDialogVisible = false
      this.modifyCredentialInfoForm.clear
    }
  },
  created() {
    this.pageNum = 1
    this.pageCount = 10
    this.page();
  }
}
</script>

<style lang="less" scoped>
.el-input {
  width: 200px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-select {
  width: 190px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  margin-bottom: 15px;
  border-radius: 4px;

  div {
    padding: 5px 5px;
  }
}

.bg-purple {
  background: #d3dce6;
}

.grid-content {
  border-radius: 4px;
  min-height: 150px;
}

.pagination {
  display: flex;
  float: right;
}

.upload-demo {
  display: inline-block;
  margin-left: 10px;
}

.modifyCredential {
  .el-form-item {
    margin-bottom: 20px;
  }
  .el-input {
    width: 350px;
  }
}
</style>

