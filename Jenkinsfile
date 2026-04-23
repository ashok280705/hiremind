pipeline {
    agent { label 'deploy' }

    environment {
        SONARQUBE = credentials('sonar-token')
        SCANNER_HOME = tool 'SonarScanner'
        BUCKET_NAME = 'trivy-logs-hiremind'
    }

    stages {
        stage('Pull OR Clone the Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ashok280705/hiremind'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                    ${SCANNER_HOME}/bin/sonar-scanner \
                    -Dsonar.projectKey=hiremind \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://13.234.152.9:9000 \
                    -Dsonar.login=${SONARQUBE}
                    """
                }
            }
        }
        stage('Inject Env File') {
            steps {
                withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
                    sh '''
                    rm -f .env
                    cp $ENV_FILE .env
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t hiremind .'
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker tag hiremind $DOCKER_USER/hiremind:latest
                    docker push $DOCKER_USER/hiremind:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}