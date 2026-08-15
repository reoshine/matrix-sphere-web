<template>
  <div class="wrapper">
    <headerBar></headerBar>
    <sidebar></sidebar>

    <div class="content-box" :style="contentStyle">
      <tags></tags>

      <div class="content">
        <pageHeader v-if="$route.meta.guidePath" />

        <keep-alive :include="tagsList">
          <router-view />
        </keep-alive>
        <el-backtop target=".content"></el-backtop>
      </div>

      <footer/>
    </div>
  </div>
</template>

<script>
import bus from '@/util/bus';
import headerBar from "@/components/common/headerBar";
import sidebar from "@/components/common/sidebar";
import tags from "@/components/common/Tags";
import pageHeader from "@/components/common/pageHeader.vue";

export default {
  name: "home",
  components: {
    pageHeader,
    headerBar,
    sidebar,
    tags,
  },
  data() {
    return {
      tagsList: [],
      collapse: false
    };
  },
  computed: {
    contentStyle() {
      // 假设您在 theme.less 中定义了 @sidebar-width 和 @sidebar-width-collapse
      // 这里的 '65px' 和 '250px' 应该与您的 theme.less 变量保持一致
      const left = this.collapse ? '65px' : '250px';
      return { left };
    }
  },
  created() {
    bus.$on('collapse-content', msg => {
      this.collapse = msg;
    });

    // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
    bus.$on('tags', msg => {
      let arr = [];
      for (let i = 0, len = msg.length; i < len; i++) {
        msg[i].name && arr.push(msg[i].name);
      }
      this.tagsList = arr;
    });
  }
};
</script>

<style lang="less" scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;

  // ---------------------------------
  // 关键修复：
  // ---------------------------------
  // 1. 必须为 "交叉淡入淡出" 设置定位上下文
  position: relative;
}
</style>
