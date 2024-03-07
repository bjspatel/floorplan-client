pipeline {
  agent any

  options {
    skipDefaultCheckout true
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timestamps()
  }

  triggers {
    bitbucketPush()
  }

  environment {
    AWS_DEFAULT_REGION = 'us-east-1'
  }

  stages {
    stage('Checkout') {
      steps {
        script {
          checkout(scm).each { k,v -> env.setProperty(k, v) }
          // Multi branch pipeline gives "master"
          // Single branch pipeline gives "origin/master"
          if (env.GIT_BRANCH ==~ '(.+/)?master') {
            env.DOCKER_IMAGE_TAG = '731272683352.dkr.ecr.us-east-1.amazonaws.com/deskradar-services/clients-api:production'
          } else {
            env.DOCKER_IMAGE_TAG = '731272683352.dkr.ecr.us-east-1.amazonaws.com/deskradar-services/clients-api:latest'
          }
        }
      }
    }

    stage('Prepare environment') {
      steps {
        sh """
          docker pull mongo:3.4 && \
          docker network create ${env.BUILD_TAG} && \
          docker run --rm -d --network ${env.BUILD_TAG} --name ${env.BUILD_TAG}_db mongo:3.4
        """
      }
    }

    stage('Test') {
      agent {
        docker {
          image "node:9-slim"
          args "--network ${env.BUILD_TAG} -e DB_URL=mongodb://${env.BUILD_TAG}_db:27017/floorplan_client_test"
          reuseNode true
        }
      }
      environment {
        HOME = "/tmp"
      }
      steps {
        sh "printenv | sort"
        sh "npm install && npm test"
      }
    }

    stage('Build and push') {
      steps {
        sh 'rm  ~/.dockercfg || true'
        sh 'rm ~/.docker/config.json || true'
        script {
          docker.build("${env.DOCKER_IMAGE_TAG}")
          docker.withRegistry('https://731272683352.dkr.ecr.us-east-1.amazonaws.com', 'ecr:us-east-1:deskradar-services-clientsapi-deploy-jenkins') {
            docker.image("${env.DOCKER_IMAGE_TAG}").push()
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          if (env.BRANCH_NAME == 'master') {
            build job: '../deploy-production', propagate: false
          } else if (env.BRANCH_NAME == 'develop') {
            build job: '../deploy-integration', propagate: false
          }
        }
      }
    }
  }

  post {
    cleanup {
      sh "docker stop ${env.BUILD_TAG}_db"
      sh "docker network rm ${env.BUILD_TAG}"
    }
    success {
      emailext subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
        body: """
          <p>SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
          <p>Check console output at <a href='${env.BUILD_URL}/console'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a></p>
        """,
        mimeType: 'text/html',
        recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'RequesterRecipientProvider']]
    }
    failure {
      emailext subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
        body: """
          <p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
          <p>Check console output at <a href='${env.BUILD_URL}/console'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a></p>
        """,
        mimeType: 'text/html',
        recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'RequesterRecipientProvider']]
    }
  }
}
