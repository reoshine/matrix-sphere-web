<template>
  <div class="tags" v-if="showTags">
    <ul>
      <li class="tags-li" v-for="(item,index) in tagsList" :class="{'active': isActive(item.path)}" :key="index">
        <router-link :to="item.path" class="tags-li-title">
          {{ item.title }}
        </router-link>
        <span class="tags-li-icon" @click="closeTags(index)"><i class="el-icon-close"></i></span>
      </li>
    </ul>
    <div class="tags-close-box">
      <el-dropdown @command="handleTags">
        <el-button size="mini" type="primary">标签选项<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu size="small" slot="dropdown">
          <el-dropdown-item command="other">关闭其他</el-dropdown-item>
          <el-dropdown-item command="all">关闭所有</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import bus from '@/util/bus';

export default {
  name: "tags",
  components: {},
  data() {
    return {
      tagsList: []
    }
  },
  methods: {
    isActive(path) {
      return path === this.$route.fullPath;
    },

    // 统一的导航处理器（保持不变，用于捕获其他导航错误）
    handleNav(pushPromise) {
      pushPromise.catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error(err);
        }
      });
    },

    /**
     * [FIX 1] 修复：关闭单个标签
     */
    closeTags(index) {
      // ---------------------------------
      // 关键修复：
      // ---------------------------------
      // 如果只剩一个标签，提示并阻止关闭
      if (this.tagsList.length <= 1) {
        //this.$message.info('请至少保留一个标签页');
        return;
      }

      const delItem = this.tagsList.splice(index, 1)[0];
      // 找出下一个要跳转的标签 (前一个或后一个)
      const item = this.tagsList[index] ? this.tagsList[index] : this.tagsList[index - 1];

      if (item) {
        // 只有当关闭的是当前激活的标签时，才跳转
        if (delItem.path === this.$route.fullPath) {
          this.handleNav(this.$router.push(item.path));
        }
      }
      // (如果 'item' 不存在，理论上不可能，因为我们已在开头检查 <= 1)
    },

    /**
     * [FIX 2] 修复：关闭所有
     */
    closeAll() {
      // ---------------------------------
      // 关键修复：
      // ---------------------------------
      // 如果已经只剩一个或没有，提示并阻止
      if (this.tagsList.length <= 1) {
        this.$message.info('请至少保留一个标签页');
        return;
      }

      // 筛选：只保留当前激活的页面
      // (这是 "关闭所有" 的一种标准交互逻辑)
      const currentItem = this.tagsList.find(item => this.isActive(item.path));
      if (currentItem) {
        this.tagsList = [currentItem];
      } else {
        // 预防性：如果没找到，就清空并跳转到首页（这不应该发生）
        this.tagsList = [];
        this.handleNav(this.$router.push('/'));
      }
    },

    /**
     * [FIX 3] 修复：关闭其他
     * (确保 "关闭其他" 不会清空)
     */
    closeOther() {
      // 筛选出当前标签页
      this.tagsList = this.tagsList.filter(item => {
        return item.path === this.$route.fullPath;
      });
      // 此时 tagsList 必定 length === 1，这是正确的
    },

    // (保持不变) 过滤 '详情页' 和 '登录页'
    setTags(route) {
      if (route.meta && (route.meta.guidePath || route.meta.hidden)) {
        return;
      }
      if (route.path === '/login' || route.path === '/') {
        return;
      }
      const isExist = this.tagsList.some(item => item.path === route.fullPath);
      if (!isExist) {
        if (this.tagsList.length >= 8) this.tagsList.shift();
        this.tagsList.push({
          title: route.meta.title,
          path: route.fullPath,
          name: route.name // 使用 router/permission.js 中设置的 name
        })
      }
      bus.$emit('tags', this.tagsList);
    },

    handleTags(command) {
      command === 'other' ? this.closeOther() : this.closeAll();
    }
  },
  computed: {
    showTags() {
      return this.tagsList.length > 0;
    }
  },
  watch: {
    $route(newValue) {
      this.setTags(newValue);
    }
  },
  created() {
    this.setTags(this.$route);

    // [FIX 4] 修复 bus 事件
    bus.$on('close_current_tags', () => {
      // ---------------------------------
      // 关键修复：
      // ---------------------------------
      // 如果只剩一个标签，提示并阻止关闭
      if (this.tagsList.length <= 1) {
        this.$message.info('请至少保留一个标签页');
        return;
      }

      for (let i = 0, len = this.tagsList.length; i < len; i++) {
        const item = this.tagsList[i];
        if (item.path === this.$route.fullPath) {

          let pushTarget = null;
          if (i < len - 1) {
            pushTarget = this.tagsList[i + 1].path;
          } else if (i > 0) {
            pushTarget = this.tagsList[i - 1].path;
          }
          // (如果 i === 0 且 i === len - 1, 意味着只有一个标签,
          //  但已在函数开头被 return)

          this.tagsList.splice(i, 1);
          if (pushTarget) {
            this.handleNav(this.$router.push(pushTarget));
          }
          break;
        }
      }
    })
  }
}
</script>

<style>
.tags {
  position: relative;
  height: 30px;
  overflow: hidden;
  background: #fff;
  padding-right: 120px;
  box-shadow: 0 5px 10px #ddd;
}

.tags ul {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.tags-li {
  float: left;
  margin: 3px 5px 2px 3px;
  border-radius: 3px;
  font-size: 12px;
  overflow: hidden;
  cursor: pointer;
  height: 23px;
  line-height: 23px;
  border: 1px solid #e9eaec;
  background: #fff;
  padding: 0 5px 0 12px;
  vertical-align: middle;
  color: #666;
  -webkit-transition: all .3s ease-in;
  -moz-transition: all .3s ease-in;
  transition: all .3s ease-in;
}

.tags-li:not(.active):hover {
  background: #f8f8f8;
}

.tags-li.active {
  color: #fff;
}

.tags-li-title {
  float: left;
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 5px;
  color: #666;
}

.tags-li.active .tags-li-title {
  color: #fff;
}

.tags-close-box {
  position: absolute;
  right: 0;
  top: 0;
  box-sizing: border-box;
  padding-top: 1px;
  text-align: center;
  width: 110px;
  height: 30px;
  background: #fff;
  /*box-shadow: -3px 0 15px 3px rgba(0, 0, 0, .1);*/
  z-index: 10;
}

</style>
