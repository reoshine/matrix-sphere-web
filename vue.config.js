module.exports = {
    lintOnSave: false,
    publicPath: '/',
    devServer: {
        port: 8081,
        open: false,
        proxy: {
            // 统一代理到单体后端（注意：更具体的规则放前面）
            '/matrix-sphere-sso': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/matrix-sphere-sso': '/' }
            },
            '/matrix-sphere-management': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/matrix-sphere-management': '/' }
            },
            '/matrix-sphere': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/matrix-sphere': '/' }
            },
            '/api': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true
            },
            '/oauth2': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true
            },
            '/login': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true
            },
            '/logout': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true
            }
        }
    }
}
