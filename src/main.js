import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './permission'
import * as echarts from 'echarts'
import ElementUI from 'element-ui'
import { initGlobalKeys } from '@/utils/globalKeys'

import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/design-tokens.css'
import '@/assets/css/main.css'
import '@/assets/css/element-dark.css'
import '@/assets/css/icon.css';
import '@/assets/iconfont/iconfont.css'
import '@/assets/css/theme.less'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.prototype.$echarts = echarts

// 初始化全局键盘快捷键
initGlobalKeys()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
