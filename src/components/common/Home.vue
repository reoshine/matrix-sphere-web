<template>
  <div class="wrapper">
    <headerBar></headerBar>
    <sidebar></sidebar>
    <div class="content-box" :class="{'content-collapse':collapse}">
      <div class="content">
        <transition name="move" mode="out-in">
          <keep-alive :include="tagsList">
            <router-view></router-view>
          </keep-alive>
        </transition>
        <el-backtop target=".content"></el-backtop>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '@/util/bus';
import headerBar from "@/components/common/headerBar";
import sidebar from "@/components/common/sidebar.vue";
import tags from "@/components/common/tags.vue";

export default {
  name: "home",
  components: {
    headerBar,
    sidebar,
    tags
  },
  data() {
    return {
      tagsList: [],
      collapse: false
    };
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

</style>
