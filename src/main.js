import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as echarts from 'echarts'
import VueSweetalert2 from '@/plugins/vue-sweetalert.js'
import ElementUI from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/icon.css';
import '@/assets/iconfont/iconfont.css'
import 'sweetalert2/dist/sweetalert2.min.css';

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueSweetalert2)
Vue.prototype.$echarts = echarts

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
