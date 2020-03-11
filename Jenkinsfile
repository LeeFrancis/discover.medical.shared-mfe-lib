#!groovy

@Library("platform.infrastructure.pipelinelibrary") _

// Global Pipeline Settings, like keep the 10 most recent builds, etc
withGlobalPipelineProperties () {

  def buildNodeId = platformDefaults.getBuildNodeLabel()
  node(buildNodeId) {

    // Ensure we start with an empty directory.
    deleteDir()

    // Checkout the repo from github
    stage ('checkout') {
      checkout scm
    }

    def useNode10 = """\
      . /home/ec2-user/.nvm/nvm.sh
      nvm install 10 --latest-npm
      nvm use 10
      node --version
      npm --version
      """

    stage ('Build/Test') {
      sh """\
      $useNode10
      npm install
      npm_config_registry=https://registry.npmjs.org/ npm run dependency-audit
      """
    }

    // End build if not on master branch
    if(env.BRANCH_NAME != "master"){
      println "No live deployment on a branch which is not master"
      return 0;
    }

    stage('NPM Publish'){
      sh '/opt/node/bin/npm publish' // <-- This will fail if version was not bumped
    }
  }
}
