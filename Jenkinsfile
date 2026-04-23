pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    COMPOSE_FILE = 'docker-compose.yml'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prepare Environment') {
      steps {
        script {
          if (!fileExists('.env')) {
            echo '.env not found, creating from .env.example'
            writeFile file: '.env', text: readFile('.env.example')
          }
        }
      }
    }

    stage('Build Containers') {
      steps {
        sh 'docker compose build --pull'
      }
    }

    stage('Seed Database') {
      steps {
        sh 'docker compose --profile init run --rm seed'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d --remove-orphans app'
      }
    }

    stage('Health Check') {
      steps {
        sh "docker compose exec -T app node -e \"fetch('http://127.0.0.1:3000/api/v1/health').then((r)=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))\""
      }
    }
  }

  post {
    always {
      sh 'docker compose ps'
    }
    cleanup {
      sh 'docker image prune -f'
    }
  }
}
