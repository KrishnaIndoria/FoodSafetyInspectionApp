
pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Run Automated Tests') {
            steps {
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Build Complete') {
            steps {
                echo 'Food Safety Inspection App pipeline completed!'
            }
        }
    }
        post {
        success {
            echo 'SUCCESS: Food Safety Inspection App pipeline completed.'
            echo 'All automated API tests passed.'
        }

        failure {
            echo 'FAILURE: Please check the pipeline logs.'
        }

        always {
            echo 'Post-build notification executed.'
        }
    }
}
