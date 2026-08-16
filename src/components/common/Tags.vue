<template>
  <div class="tab-nav" v-if="showTags">
    <div class="tab-nav__list" ref="listRef">
      <div
        v-for="(item, index) in tagsList"
        :key="index"
        class="tab-nav__item"
        :class="{ 'is-active': isActive(item.path) }"
        @click="handleNav($router.push(item.path))"
      >
        <span class="tab-nav__label">{{ item.title }}</span>
        <i
          class="el-icon-close tab-nav__close"
          v-if="tagsList.length > 1"
          @click.stop="closeTags(index)"
        />
      </div>
    </div>

    <el-dropdown class="tab-nav__more" @command="handleTags" trigger="click">
      <el-button size="mini" type="primary" plain>
        标签选项<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="other">关闭其他</el-dropdown-item>
        <el-dropdown-item command="all">关闭所有</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import bus from '@/util/bus';

export default {
  name: "tags",
  data() {
    return {
      tagsList: []
    }
  },
  methods: {
    isActive(path) {
      if (this.$route.meta.guidePath) {
        return path === this.$route.meta.jumpPath;
      } else {
        return path === this.$route.fullPath;
      }
    },

    handleNav(pushPromise) {
      pushPromise.catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error(err);
        }
      });
    },

    closeTags(index) {
      if (this.tagsList.length <= 1) {
        return;
      }

      const delItem = this.tagsList.splice(index, 1)[0];
      const item = this.tagsList[index] ? this.tagsList[index] : this.tagsList[index - 1];

      if (item) {
        if (delItem.path === this.$route.fullPath) {
          this.handleNav(this.$router.push(item.path));
        }
      }
    },

    closeAll() {
      if (this.tagsList.length <= 1) {
        this.$message.info('请至少保留一个标签页');
        return;
      }

      const currentItem = this.tagsList.find(item => this.isActive(item.path));
      if (currentItem) {
        this.tagsList = [currentItem];
      } else {
        this.tagsList = [];
        this.handleNav(this.$router.push('/'));
      }
    },

    closeOther() {
      this.tagsList = this.tagsList.filter(item => {
        return item.path === this.$route.fullPath;
      });
    },

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
          name: route.name
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

    bus.$on('close_current_tags', () => {
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

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.tab-nav {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 @space-4;
  background: @bg-footer;
  border-bottom: 1px solid @border-color;

  &__list {
    flex: 1;
    display: flex;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 @space-3;
    border-radius: @border-radius;
    font-size: @font-size-sm;
    color: @text-secondary;
    cursor: pointer;
    white-space: nowrap;
    transition: all @transition-fast;
    flex-shrink: 0;
    border: 1px solid transparent;

    &:hover {
      background: @border-color-light;
    }

    &.is-active {
      background: @primary-color;
      color: #fff;
      border-color: @primary-color;
    }
  }

  &__close {
    font-size: 12px;
    border-radius: 50%;
    padding: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  }

  &__more {
    flex-shrink: 0;
    margin-left: @space-2;
  }
}
</style>
