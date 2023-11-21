// vue.config.js
module.exports = {
  lintOnSave: false,
  devServer: {
    port: 8081,
    open: false,
    proxy: {
      '/adp-sso': {
        target: 'http://nginx:7001/adp-sso',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/adp-sso': ''
        }
      },
      '/adp-matrix': {
        target: 'http://nginx:7002/adp-matrix',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/adp-matrix': ''
        }
      }
    }
  }
}
