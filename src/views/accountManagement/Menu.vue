<template>
<div class="app-container">
  <el-container>
    <el-aside>
      <el-select @change="getMenuList(projectId)" v-model="projectId" clearable placeholder="请选择">
        <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.projectName"
            :value="item.id">
        </el-option>
      </el-select>
      <el-button class="addBtn" type="primary">新增</el-button>
      <el-tree
          :data="menuList"
          @node-click="getMenuById"
          node-key="id"
          :default-expand-all="true"
          :current-node-key="currentMenuId"
          :expand-on-click-node="false"
          :props="defaultProps">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>
                <i :class="data.icon" style="background: #666; color: #bfcbd9"></i>
                {{ node.label }}
              </span>
              <span>
                <el-button type="text" size="mini" :disabled="currentMenuId !== data.id" @click.stop="() => editMenu(data)">添加</el-button>
                <el-button type="text" size="mini" :disabled="currentMenuId !== data.id" @click.stop="() => editMenu(data)">编辑</el-button>
                <el-button type="text" size="mini" :disabled="currentMenuId !== data.id" @click.stop="() => () => remove(node, data)">删除</el-button>
              </span>
            </span>
      </el-tree>

    </el-aside>
    <el-container>
      <el-main>
        <el-divider content-position="left">菜单信息</el-divider>
        <el-form label-position="right" label-width="80px" :model="menu" :disabled="cannotEdit">
          <el-form-item label="菜单等级">
            <el-input v-model="menu.menuLevel"></el-input>
          </el-form-item>
          <el-form-item label="菜单名称">
            <el-input v-model="menu.menuName"></el-input>
          </el-form-item>
          <el-form-item label="路由地址">
            <el-input v-model="menu.menuCode"></el-input>
          </el-form-item>
          <el-form-item label="图标">
            <el-input v-model="menu.icon"></el-input>
          </el-form-item>
          <el-form-item label="序号">
            <el-input v-model="menu.sortNo"></el-input>
          </el-form-item>
          <el-button type="primary" @click="modifyMenu(menu)" v-if="!cannotEdit">保存</el-button>
          <el-button type="info" @click="cancelEditStatus" v-if="!cannotEdit">取消</el-button>
        </el-form>
      </el-main>
    </el-container>
  </el-container>
</div>
</template>

<script>

import {getMenuById, getMenuList, modifyMenu, queryProjectList} from "@/views/accountManagement/api";
export default {
  name: "role",
  data() {
    return {
      //应用列表
      projectList: [
        {
          id: '',
          projectCode: '',
          projectName: '',
          projectGroupCode: '',
          projectGroupName: '',
          gitProjectId: '',
          gitUrl: '',
          enableStatus: ''
        }
      ],
      //选中的项目id
      projectId: '',

      //菜单列表
      menuList: [],

      //菜单
      menu: {
        id: '',
        menuCode: '',
        menuName: '',
        icon: '',
        sortNo: '',
        patentFlag: '',
        menuLevel: '',
        parentId: '',
        createBy: '',
        createByName: '',
        children: []
      },
      //不可编辑
      cannotEdit: true,
      currentMenuId: '',

      //菜单下拉列表展示的树形属性
      defaultProps: {
        id: 'id',
        children: 'children',
        label: 'menuName'
      },

      labelPosition: 'right',
      formLabelAlign: {
        name: '',
        region: '',
        type: ''
      }
    }
  },
  methods: {
    queryProjectList() {
      queryProjectList({
        projectId: this.projectId,
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectList = res.data.body
          this.projectId = res.data.body[0].id
          this.getMenuList(this.projectId)
        }
      }).catch(err => {
        this.$message({
          message: '查询应用列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    getMenuList(projectId) {
      getMenuList(projectId).then(res => {
        if (res.data.code === 2000) {
          this.menuList = res.data.body
          this.currentMenuId = this.menuList.at(0).id
          this.getMenuById(this.menuList.at(0))
        }
      }).catch(err => {
        this.$message({
          message: '根据应用id查询菜单列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    getMenuById(data) {
      this.currentMenuId = data.id;
      this.cannotEdit = true
      getMenuById(data.id).then(res => {
        if (res.data.code === 2000) {
          this.menu = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '根据id查询菜单失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    editMenu(menu) {
      this.currentMenuId = menu.id
      this.cannotEdit = false
    },

    cancelEditStatus() {
      this.cannotEdit = true
    },

    modifyMenu(menu) {
      modifyMenu(menu).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            type: 'success',
            message: '修改成功!'
          });
          this.getMenuList(this.projectId)
        }
      }).catch(err => {
        this.$message({
          message: '修改菜单失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },
  },
  created() {
    this.queryProjectList()
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 95%;
}
.app-container {
  height: 100%;
}
.el-container {
  height: 100%;
}

.el-aside {
  height: 100%;
  color: #333;
  width: 350px !important;
  border-right: 1px solid #bfcbd9;
}

.addBtn {
  margin-top: 10px;
  width: 95%;
}

.el-tree {
  margin-top: 10px;
}
.el-main {
  color: #333;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 14px;
}
</style>
