
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
}
