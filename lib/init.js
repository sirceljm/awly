const path = require("path");
require("app-module-path").addPath(path.dirname(require.main.filename));

const fs = require("fs");
const co = require("co");
const chalk = require("chalk");

const download = require("download-git-repo");
// const awlyUtils = require("lib/utils.js");

module.exports = runSequence;

function runSequence(directory, customRepo){
    co(function *(){
        if(!directory || directory == ""){
            console.log("Directory name was not given. Aborting...");
            return;
        }

        yield checkIfDirectoryExists(directory);
        let status = yield checkIfDirectoryIsEmptyorAwlyDirectory(directory);
        if(status.empty){
            yield downloadAwlyFromRepo(directory);
        }
        require("lib/utils.js").generate();
        showCDMessage(directory);
    }).catch(function(err){
        console.log(err);
    });
}

function checkIfDirectoryExists(directory) {
    return new Promise(function(resolve, reject){
        fs.stat(directory, function(err, stats) {
            if (err && err.errno === -2) {
                console.log("Directory " + directory + " does not exist. Creating ...");
                fs.mkdir(directory, function(){
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
}

function checkIfDirectoryIsEmptyorAwlyDirectory(directory){
    return new Promise(function(resolve, reject){
        fs.readdir(directory, function(err, files) {
            if (err) {
                console.log(err);
            } else {
                if (!files.length) {
                    resolve({empty:true});
                } else if(insideAwlyDir(directory)){
                    console.log("This directory is not empty but it looks like an Awly project directory");
                    resolve({empty:false});
                } else {
                    reject("Directory is not empty. Aborting ...");
                }
            }
        });
    });
}

function downloadAwlyFromRepo(directory, customRepo){
    return new Promise(function(resolve, reject){
        let repo = customRepo || "sirceljm/awly";
        console.log("Downloading Awly from " + repo + " ...");
        download(repo, directory, function (err) {
            if (err) {
                reject(err);
            } else{
                let templateContents = fs.readFileSync(path.resolve(directory, "./project-config/main.config.template.js"));
                fs.writeFileSync(path.resolve(directory, "./project-config/main.config.js"), templateContents);
                resolve();
                console.log("Your Awly project was sucessfully set up.");
            }
        });
    });
}

function showCDMessage(directory){
    console.log(chalk.yellow("cd ./" + directory));
    console.log("And run awly from there");
}

function insideAwlyDir(directory){
    if (fs.existsSync(path.resolve(directory, "./project-config/main.config.js"))) {
        return true;
    } else {
        return false;
    }
}
