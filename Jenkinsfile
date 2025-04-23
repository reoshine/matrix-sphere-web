node {
    properties([
        parameters([
            gitParameter(
                name: 'branch',
                type: 'PT_BRANCH',
                defaultValue: 'main',
                description: 'Git 分支',
                // branchFilter: '.*',
                sortMode: 'NONE',
                // quickFilterEnabled: false,
                selectedValue: 'DEFAULT',
                useRepository: 'http://192.168.0.91:8088/matrixsphere/matrix-sphere-web.git'
            ),
            choice(name: 'deployEnv', choices: ['dev', 'prod'], description: '部署环境')
        ])
    ])

    stage("Hello") {
        echo "Hello World"
    }

    stage("git pull") {
        echo "本次构建选择的分支是：${params.branch}"
        checkout([$class: "GitSCM",
                 branches: [[name: "${params.branch}"]],
                 userRemoteConfigs: [[
                     url: "http://192.168.0.91:8088/matrixsphere/matrix-sphere-web.git",
                     credentialsId: "e2804a17-90fa-4c8c-8f30-5985b4e5bb4c"
                 ]]])
    }

    stage("build images") {
        sh "npm install"
        sh "npm run build"
        sh "tar -zcvf matrix-sphere-web.tar.gz dist"
        echo "maven打包成功"
    }

    stage("deploy service") {
        sshPublisher(
            publishers: [sshPublisherDesc(
                configName: 'matrix-server',
                transfers: [sshTransfer(
                    cleanRemote: false,
                    execCommand: """
                        cd /usr/local/docker/project/www/matrix-sphere-web
                        tar -zxvf matrix-sphere-web.tar.gz -C ./
                        rm -rf matrix-sphere-web.tar.gz
                    """,
                    execTimeout: 120000,
                    remoteDirectory: 'www/matrix-sphere-web',
                    sourceFiles: 'matrix-sphere-web.tar.gz'
                )],
                verbose: true
            )]
        )
        echo "前端包部署成功"
    }

    stage("clean workspace") {
        deleteDir()
        dir("${workspace}@tmp") {
            deleteDir()
        }
        dir("${workspace}@script") {
            deleteDir()
        }
    }
}