<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style lang="less">
@import "./assets/css/main.css";
@import "./assets/css/color-dark.css";
.fade-enter-active,
.fade-leave-active {
  /* 1. 设置过渡时间 (可以调短，比如 0.2s，更“直入直出”) */
  transition: opacity 0.2s ease-in-out;

  /* * 2. [核心]
   * 在过渡期间，将新旧组件都设为绝对定位
   * 让它们在父容器 (.content) 内重叠
   */
  position: absolute;

  /* * 3. [核心]
   * 因为绝对定位脱离了文档流，我们必须手动设置宽度
   * (width: 100% 会自动匹配 .content 的内容区宽度)
   */
  width: 100%;
}

/* * 4. 'in' (进入) 的开始状态 (完全透明)
 */
.fade-enter {
  opacity: 0;
}
/* 'in' (进入) 的结束状态 (自动, opacity: 1) */

/* * 5. 'out' (离开) 的开始状态 (自动, opacity: 1)
 */
/* 'out' (离开) 的结束状态 (完全透明) */
.fade-leave-to {
  opacity: 0;
}
</style>
