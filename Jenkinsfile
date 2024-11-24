pipeline {
    agent any
    stages {
        stage("Hello") {
            steps {
                echo "Hello World"
            }
        }
        stage("git pull") {
            steps {
                echo "本次构建选择的分支是：${branch}"
                checkout([$class: "GitSCM", branches: [[name: "${branch}"]], extensions: [], userRemoteConfigs: [[credentialsId: "e2804a17-90fa-4c8c-8f30-5985b4e5bb4c", url: "http://192.168.0.110:8088/adp/matrix-sphere-web.git"]]])
            }
        }
        stage("node build") {
            steps {
                sh '''
                cnpm install
                cnpm run build
                tar -czvf dist.tar.gz dist
                '''
            }
        }
        stage("deploy service") {
            steps {
                sshPublisher(publishers: [sshPublisherDesc(configName: 'adp-server', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: '''
                cd /usr/local/docker/project/www/matrix-sphere-web
                ls
                rm -rf dist
                tar -zxvf /usr/local/docker/project/www/matrix-sphere-web/dist.tar.gz
                rm -rf dist.tar.gz
                ''', execTimeout: 120000,
                        flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'www/matrix-sphere-web', remoteDirectorySDF: false,
                        removePrefix: '', sourceFiles: 'dist.tar.gz')], usePromotionTimestamp: false, useWorkspaceInPromotion: false,
                        verbose: false)])
                echo "容器启动成功"
            }
        }
    }
    post {
        cleanup {
            deleteDir()
            dir("${workspace}@tmp") {
                deleteDir()
            }
            dir("${workspace}@script") {
                deleteDir()
            }
        }
    }
}