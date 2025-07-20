<template>
<div>
  <!-- 搜索条件 -->
  <div class="search_condition">
      <el-input
          class="searchInput"
          minlength="0"
          maxlength="20"
          style="width: 400px;"
          size="medium"
          placeholder="请输入权限编码/名称，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>
      <label style="margin-left:20px" for="enabled">启用状态：</label>
      <el-select clearable size="medium" v-model="enabled" @change="getAuthorityPage" placeholder="请选择">
        <el-option
            v-for="item in enableStatusList"
            :key="item.enableStatus"
            :label="item.enableStatusName"
            :value="item.enableStatus">
        </el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="getAuthorityPage">查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addAuthority">新增</el-button>
  </div>

  <!-- 权限列表 -->
  <el-divider content-position="left">权限列表</el-divider>
  <el-empty v-show="authorityPage.total <= 0" description="无应用分组信息"></el-empty>
  <el-table v-show="authorityPage.total > 0" :data="authorityPage.data" border>
    <el-table-column type="index"></el-table-column>
    <el-table-column prop="authorityCode" label="权限编码"></el-table-column>
    <el-table-column prop="authorityDesc" label="权限名称"></el-table-column>
    <el-table-column prop="createByName" label="创建人"></el-table-column>
    <el-table-column prop="enabled" label="启用状态">
      <template slot-scope="scope">
        <el-switch
            v-model="authorityPage.data[scope.$index].enabled"
            @change="modifyAuthorityConfirm(scope.row)">
        </el-switch>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button size="small" type="primary" icon="el-icon-edit" @click="modifyAuthority(scope.row)">修 改</el-button>
        <el-button size="small" type="danger" icon="el-icon-delete" @click="removeAuthority(scope.row)">删 除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <div class="authorityPage block">
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="authorityPage.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="authorityPage.pageCount"
        layout="total, sizes, prev, pager, next, jumper"
        :total="authorityPage.total">
    </el-pagination>
  </div>

  <!-- 用户信息编辑抽屉 -->
  <el-drawer
      :title="drawerTitle"
      :before-close="handleClose"
      :visible.sync="dialog"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer">
    <div class="demo-drawer__content">
      <el-form :model="saveAuthorityForm" :rules="saveAuthorityRules" ref="saveAuthorityRulesRef">
        <el-form-item prop="authorityCode" label="权限编码" label-width="100px">
          <el-input v-model="saveAuthorityForm.authorityCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="authorityDesc" label="权限名称" label-width="100px">
          <el-input v-model="saveAuthorityForm.authorityDesc" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="enabled" label="启用状态" label-width="100px">
          <el-select size="medium" v-model="saveAuthorityForm.enabled" placeholder="请选择">
            <el-option
                v-for="item in enableStatusList"
                :key="item.enableStatus"
                :label="item.enableStatusName"
                :value="item.enableStatus">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 20px" @click="cancelForm">取 消</el-button>
      <el-button type="primary" v-if="drawerTitle === '新增权限'"
                 @click="addAuthorityConfirm(saveAuthorityForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
      <el-button type="primary" v-else-if="drawerTitle === '修改权限'"
                 @click="modifyAuthorityConfirm(saveAuthorityForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
    </div>
  </el-drawer>
</div>
</template>

<script>
import {
  addAuthority,
  getAuthorityById,
  getAuthorityPage,
  modifyAuthority,
  removeAuthority,
} from "@/api/api";

export default {
  name: "authority",
  data() {
    return {
      pageNum: 1,
      pageCount: 10,
      searchText: '',
      enabled: true,
      enableStatusList: [
        {
          enableStatus: true,
          enableStatusName: '启用',
        },
        {
          enableStatus: false,
          enableStatusName: '停用',
        }
      ],
      drawerTitle: '',
      loading: false,
      dialog: false,
      saveAuthorityForm: {},
      authorityPage: {},
      authorityList: [],

      saveAuthorityRules: {
        authorityCode: [
          { required: true, message: "请输入权限编码", trigger: "blur" },
          { min: 3, max: 20, message: "长度在3到10个字符", trigger: "blur" },
        ],
        authorityDesc: [
          { required: true, message: "请输入权限名称", trigger: "blur" },
          { min: 2, max: 20, message: "长度在3到50个字符", trigger: "blur" },
        ]
      },
    }

  },
  methods: {
    //分页查询
    getAuthorityPage(data) {
      if (data.enabled === undefined || data.enabled === '') {
        data = {
          enabled: this.enabled,
          pageNum: this.pageNum,
          pageCount: this.pageCount,
          paging: true,
          searchText: this.searchText
        }
      }
      getAuthorityPage({
        pageCount: data.pageCount,
        pageNum: data.pageNum,
        paging: data.paging,
        enabled: data.enabled,
        searchText: data.searchText
      }).then(res => {
        if (res.data.code === 2000) {
          this.authorityPage = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '分页查询权限列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //根据账号查询用户信息
    getAuthorityById(authorityId) {
      getAuthorityById(authorityId).then(res => {
        if (res.data.code === 2000) {
          this.saveAuthorityForm = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '获取权限信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },


    handleClose() {
      if (this.loading) {
        return;
      }
      this.$confirm('确认关闭吗？')
          .then(_ => {
            this.cancelForm();
          })
          .catch(_ => {
          });
    },

    //新增按钮
    addAuthority() {
      this.saveAuthorityForm = {}
      this.drawerTitle = '新增权限'
      this.dialog = true
    },

    //修改按钮
    modifyAuthority(authority) {
      this.drawerTitle = '修改权限'
      this.dialog = true
      this.getAuthorityById(authority.id)
    },

    //抽屉取消按钮
    cancelForm() {
      this.dialog = false
      this.$refs.saveAuthorityRulesRef.resetFields()
    },

    //新增用户信息确认
    addAuthorityConfirm(saveAuthorityForm) {
      this.$refs.saveAuthorityRulesRef.validate((valid) => {
        if (valid) {
          addAuthority({
            ...saveAuthorityForm
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                type: 'success',
                message: '新增成功!',
                duration: 2000
              });
              this.dialog = false
              this.getAuthorityPage({
                pageNum: this.pageNum,
                pageCount: this.pageCount,
                enabled: this.enabled,
                paging: true
              })
            }
          }).catch(err => {
            this.$message({
              message: '新增权限失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
          })
        }
      });
    },

    //分页条选每页条数后
    handleSizeChange(pageCount) {
      let data = {
        enabled: this.enabled,
        pageNum: this.pageNum,
        pageCount: pageCount,
        paging: true
      }
      this.getAuthorityPage(data)
    },

    //分页条跳转页数后
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },

    //修改用户信息确认
    modifyAuthorityConfirm(saveAuthorityForm) {
      modifyAuthority({
        ...saveAuthorityForm
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            type: 'success',
            message: '修改成功!',
            duration: 1000,
            onClose: () => {
              this.dialog = false
              this.getAuthorityPage({
                pageNum: this.pageNum,
                pageCount: this.pageCount,
                enabled: this.enabled,
                paging: true
              })
            }
          });

        }
      }).catch(err => {
        this.$message({
          message: '修改用户信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //删除用户
    removeAuthority(authority) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeAuthority(authority.id).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!',
              duration: 2000
            });
            this.getAuthorityPage({
              pageNum: this.pageNum,
              pageCount: this.pageCount,
              enabled: this.enabled,
              paging: true
            })
          }
        }).catch(err => {
          this.$message({
            message: '删除权限失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
        })
      })
    },
  },
  created() {
    let data = {
      pageNum: this.pageNum,
      pageCount: this.pageCount,
      enabled: this.enabled,
      paging: true
    }
    this.getAuthorityPage(data)
  }
}
</script>

<style lang="less" scoped>
.searchInput {
  width: 80%;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-select {
  width: 190px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.authorityPage {
  position: absolute;
  bottom: 10px;
  right: 10px
}

.demo-drawer__content {
  .el-form-item {
    margin-bottom: 20px;
    .el-input {
      width: 80%;
    }
  }
}
</style>
