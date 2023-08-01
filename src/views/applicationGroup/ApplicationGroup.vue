<template>
  <div>
    <div>
      <el-input
          minlength="0"
          maxlength="20"
          style="width: 320px;"
          size="medium"
          placeholder="请输入应用分组编码/名称，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>

      <label style="margin-left:20px" for="enableStatus">启用状态：</label>
      <el-select clearable size="medium" v-model="projectGroupInfo.enableStatus" placeholder="请选择">
        <el-option
            v-for="item in enableStatusList"
            :key="item.enableStatus"
            :label="item.enableStatusName"
            :value="item.enableStatus">
        </el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="queryPage">查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addDialog">新增</el-button>
    </div>
    <el-divider content-position="left">应用分组列表</el-divider>
    <el-empty v-show="projectGroupList.length <= 0" description="无应用分组信息"></el-empty>
    <el-table v-show="projectGroupList.length > 0" :data="projectGroupList" border>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="projectGroupCode" label="应用分组编码"></el-table-column>
      <el-table-column prop="projectGroupName" label="应用分组名称"></el-table-column>
      <el-table-column prop="createByName" label="创建人"></el-table-column>
      <el-table-column prop="gmtCreate" label="创建时间"></el-table-column>
      <el-table-column prop="enableStatus" label="启用状态" @click.stop="projectGroupInfo.enableStatus === 1 ? 0 : 1">
        <template slot-scope="scope">
          <el-switch
              style="padding: 0 10px"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.enableStatus"
              @change="enableChange($event, scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" @click="editProjectGroup(scope.row)">修 改</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteConfirm(scope.row.id)">删 除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="position: absolute; bottom: 10px;right: 0" v-show="projectGroupList.length > 0" class="pagination">
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

    <el-dialog :title="dialogTitle"
               :close-on-click-modal="false"
               :visible.sync="modifyGroupDialogVisible"
               v-if="modifyGroupDialogVisible"
               width="617px">
      <el-form class="modifyProjectGroup"
               :model="editProjectGroupForm"
               :rules="modifyProjectGroupRules"
               ref="modifyProjectGroupRulesRef"
               size="small">
        <el-form-item label="应用分组编码: " prop="projectGroupCode" label-width="120px">
          <el-input v-model="editProjectGroupForm.projectGroupCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="应用分组名称: " prop="projectGroupName" label-width="120px">
          <el-input v-model="editProjectGroupForm.projectGroupName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelModifyProjectGroup">取 消</el-button>
        <el-button v-if="dialogTitle === '修改应用分组'" type="primary" @click="modify">确 定</el-button>
        <el-button v-else-if="dialogTitle === '新增应用分组'" type="primary" @click="add">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {modifyById, queryPage, add, removeById} from "@/api/api";

export default {
  name: "ApplicationGroup",
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

      //
      modifyGroupDialogVisible: false,
      modifyGroupFormVisible: false,

      // 编辑弹窗表单对象
      editProjectGroupForm: {
        id: '',
        projectGroupCode: '',
        projectGroupName: '',
        enableStatus: '',
      },

      //应用分组
      projectGroupInfo: {
        id: '',
        projectGroupCode: '',
        projectGroupName: '',
        enableStatus: '',
        createByName: '',
        gmtCreate: '',
      },
      projectGroupList: [],

      //启用状态列表
      enableStatusList: [
        {
          enableStatus: 1,
          enableStatusName: '启用',
        },
        {
          enableStatus: 0,
          enableStatusName: '停用',
        }
      ],

      modifyProjectGroupRules: {
        projectGroupCode: [
          { required: true, message: "请输入应用分组编码", trigger: "blur" },
          { min: 2, max: 50, message: "长度在2到50个字符", trigger: "blur" },
        ],
        projectGroupName: [
          { required: true, message: "请输入应用分组名称", trigger: "blur" },
          { min: 3, max: 50, message: "长度在3到50个字符", trigger: "blur" },
        ]
      },
    }
  },
  methods: {
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
    queryPage() {
      queryPage({
        pageNum: this.pageNum,
        pageCount: this.pageCount,
        searchText: '',
        enableStatus: this.projectGroupInfo.enableStatus
      }).then(res => {
        if (res.data.code === 2000) {
          const result = res.data.body;
          this.total = result.total;
          this.projectGroupList = result.data;
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

    add() {
      this.$refs.modifyProjectGroupRulesRef.validate((valid) => {
        if (valid) {
          add({
            projectGroupCode: this.editProjectGroupForm.projectGroupCode,
            projectGroupName: this.editProjectGroupForm.projectGroupName,
            enableStatus: 1
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                message: '添加分组成功！',
                type: 'success',
                duration: 1000
              });
              this.editProjectGroupForm = {}
              this.modifyGroupDialogVisible = false
              this.queryPage()
            } else {
              this.$message({
                message: res.data.message,
                type: 'error',
                duration: 3000,
              });
            }
          }).catch(err => {
            this.$message({
              message: '新增应用分组失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
            this.loading = false
          })
        }
      })
    },

    editProjectGroup(projectGroup) {
      this.dialogTitle = '修改应用分组'
      this.modifyGroupDialogVisible = true
      this.modifyGroupFormVisible = true
      this.editProjectGroupForm = JSON.parse(JSON.stringify(projectGroup))
    },

    cancelModifyProjectGroup() {
      this.modifyGroupDialogVisible = false
      this.modifyGroupFormVisible = false
      this.editProjectGroupForm = {}
    },

    modify() {
      this.$refs.modifyProjectGroupRulesRef.validate((valid) => {
        modifyById({
          id: this.editProjectGroupForm.id,
          projectGroupCode: this.editProjectGroupForm.projectGroupCode,
          projectGroupName: this.editProjectGroupForm.projectGroupName
        }).then(res => {
          if (res.data.code === 2000) {
            if (res.data.code === 2000) {
              this.$message({
                message: '修改分组成功！',
                type: 'success',
                duration: 2000,
              });
              this.editProjectGroupForm = {}
              this.modifyGroupDialogVisible = false
              this.queryPage()
            } else {
              this.$message({
                message: res.data.message,
                type: 'error',
                duration: 3000,
              });
            }
          }
        }).catch(err => {
          this.$message({
            message: '分页查询应用分组失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
          this.loading = false
        })
      });
    },

    //删除应用分组
    deleteConfirm(projectGroupId) {
      this.$confirm('此操作将删除应用分组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeById(projectGroupId).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.queryPage();
          } else {
            this.$message({
              message: '删除应用分组失败，原因：' + res.data.message,
              type: 'error',
              duration: 3000,
            });
          }
        }).catch(err => {
          console.log(err)
          this.$message({
            message: '删除应用分组失败，原因：' + err,
            type: 'error',
            duration: 3000,
          });
        })
      })
    },

    enableChange(e,row) {
      modifyById({
        id: row.id,
        enableStatus: row.enableStatus
      }).then(res => {
        if (res.data.code === 2000) {
          if (res.data.code === 2000) {
            this.$message({
              message: row.enableStatus === 1 ? '已启用' : '已停用',
              type: 'success',
              duration: 2000,
            });
            this.editProjectGroupForm = {}
            this.modifyGroupDialogVisible = false
            this.queryPage()
          } else {
            this.$message({
              message: res.data.message,
              type: 'error',
              duration: 3000,
            });
          }
        }
      }).catch(err => {
        this.$message({
          message: '分页查询应用分组失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
        this.loading = false
      })
    }
  },
  created() {
    this.pageNum = 1
    this.pageCount = 10
    this.queryPage();
  }
}
</script>

<style lang="less" scoped>
.el-input {
  width: 80%;
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

.modifyProjectGroup {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>
