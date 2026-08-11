module.exports = {
    lintOnSave: false,
    publicPath: '/',
    devServer: {
        port: 8081,
        open: false,
        proxy: {
            // 统一代理到单体后端（backend context-path=/matrix-sphere）
            '/matrix-sphere-sso': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/matrix-sphere-sso': '/matrix-sphere' }
            },
            '/matrix-sphere-management': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/matrix-sphere-management': '/matrix-sphere' }
            },
            '/matrix-sphere': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true
            },
            '/api': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true
            },
            '/oauth2': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/oauth2': '/matrix-sphere/oauth2' }
            },
            '/login': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/login': '/matrix-sphere/login' }
            },
            '/logout': {
                target: 'http://192.168.0.10:7002',
                changeOrigin: true,
                pathRewrite: { '^/logout': '/matrix-sphere/logout' }
            }
        }
    }
}
