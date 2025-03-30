import axios from 'axios'
import swal from 'sweetalert2'
import router from "@/router";

//axios实例对象
const request = axios.create({
  timeout: 5000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

const baseURL = '/matrix-sphere-sso';
let isRefreshing = false
let requests = []

// 设置post请求参数格式为json
// request.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

request.setToken = (accessToken, refreshToken) => {
  request.defaults.headers['Authorization'] = `Bearer ${accessToken}`
  window.localStorage.setItem('adpSsoToken', accessToken)
  window.localStorage.setItem('adpSsoRefreshToken', refreshToken)
}

function refreshToken () {
  const refresh_token = localStorage.getItem("adpSsoRefreshToken")
  if (refresh_token) {
    return request({method:'post', url: `${baseURL}/oauth2/token`,
      data: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      },
      headers: {
        "Content-Type": 'multipart/form-data',
        "Authorization": 'Basic ' + btoa('matrix-sphere:matrix-sphere-secret')
      }})
  } else {
    toLogin()
  }
}

function removeToken() {
  localStorage.removeItem('adpSsoToken')
  localStorage.removeItem('adpSsoRefreshToken')
}


// 发送请求携带请求头
request.interceptors.request.use(config => {
  if (config.url === `${baseURL}/oauth2/token`) {
    config.headers["Content-Type"] = 'multipart/form-data'
  } else {
    config.headers.Authorization = localStorage.getItem('adpSsoToken') === null ? null : `Bearer ${localStorage.getItem('adpSsoToken')}`
  }
  return config
})

// 返回值如果是4003需要登录
request.interceptors.response.use(response => {
  if (response.data.code === 4003) {
    const config = response.config
    if (!isRefreshing) {
      isRefreshing = true
      return refreshToken().then(refreshRes => {
        if (refreshRes.status === 200) {
          const { access_token, refresh_token } = refreshRes.data
          request.setToken(access_token, refresh_token)
          config.headers['Authorization'] = `Bearer ${access_token}`
          requests.forEach(cb => cb(access_token))
          requests = []
          return request(config)
        } else {
          removeToken()
        }
      }).catch(err => {
        console.log(err, 222222222)
        removeToken()
      }).finally(() => {
        isRefreshing = false
      })
    } else {
      // 正在刷新token，将返回一个未执行resolve的promise
      // 保存函数 等待执行
      // 吧请求都保存起来 等刷新完成后再一个一个调用
      return new Promise((resolve) => {
        // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
        requests.push((access_token) => {
          config.headers['Authorization'] = `Bearer ${access_token}`
          resolve(request(config))
        })
      })
    }
  }
  return response
}, error => {
  return Promise.reject(error)
})

function toLogin()  {
  swal({
    title: '登录已失效，请重新登录！',
    type: 'error',
    timer: '2500',
    confirmButtonText: '确定',
    showCancelButton: false
  }).then(() => {
    router.push({path: '/matrix-sphere/client/login'})
    // window.location.href = '/matrix-sphere/client/login'
  })
}

// axios.defaults.baseURL = BASE_URL
export default request