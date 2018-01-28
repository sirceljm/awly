const ShellJS = require("shelljs");
const path = require("path");

var cwd = ShellJS.pwd().toString();

module.exports = {
    getCurrentWorkingDir: getCurrentWorkingDir,
    isAwlyProject: isAwlyProject,
    getProjectConfig: getProjectConfig
}

function getCurrentWorkingDir(){
    return cwd;
}
function isAwlyProject(){
    var pjson = require(path.resolve(cwd,'./package.json'));

    if(pjson.name !== 'awly'){
        console.log("Not an Awly project. Exiting ..."); // TODO
        process.exit(); // TODO
    }
}


function getProjectConfig() {
    const projectConfig = require(path.resolve(cwd, './project-config/main.config.js'));
    projectConfig.cwd = cwd;
    projectConfig.awlyCliDir = path.dirname(require.main.filename);

    return projectConfig;
}

function getProjectCredentials(projectConfig) {
    try{
        projectConfig.credentials = require(projectConfig.credentials_path);
    } catch(err){
        if(err.code == 'MODULE_NOT_FOUND'){
            console.log('Credentials file at ' + projectConfig.credentials_path + ' could not be found. Exiting.');
            console.log('Please change the "credentials_path" in ' + path.resolve(cwd, './project-config/main.config.js'));
            console.log('Exiting.');
            return;
        }
    }
}
