const path = require("path");
require("app-module-path").addPath(path.dirname(require.main.filename));

const fs = require("fs");
const co = require("co");
const chalk = require("chalk");

const download = require("download-git-repo");
const awlyUtils = require("lib/utils.js");

let cwd = null;

module.exports = runSequence;

function runSequence(awlyProjectDir, customSkeletonRepo){
    const defaultSkeletonRepo = "sirceljm/awly-skeleton";
    // const defaultBundleRepo = "sirceljm/awly-main-bundle";
    const skeletonRepoName = customSkeletonRepo || defaultSkeletonRepo;
    awlyProjectDir = awlyProjectDir || "";

    cwd = path.resolve(process.cwd(), awlyProjectDir);

    console.log(cwd, awlyUtils.isEmptyDir(cwd));

    if (!awlyUtils.isEmptyDir(cwd)) {
        console.log("Directory " + cwd + " is not empty! Aborting ...");
        return;
    }

    co(function *(){
        yield downloadAwlyFromRepo(cwd, skeletonRepoName);

        const newCert = awlyUtils.generateLocalhostCert();

        const certsDir = path.resolve(cwd, "./certs");
        if (!fs.existsSync(certsDir)){
            fs.mkdirSync(certsDir);
        }

        fs.writeFileSync(path.resolve(certsDir, "./cert.pem"), newCert.cert);
        fs.writeFileSync(path.resolve(certsDir, "./privkey.pem"), newCert.key);

        console.log("Localhost certificates were created");

        // yield downloadAwlyFromRepo(directory)
        // yield checkIfDirectoryExists(directory);
        // let status = yield checkIfDirectoryIsEmptyorAwlyDirectory(directory);
        // if(status.empty){
        //     yield downloadAwlyFromRepo(directory);
        // }
        // require("lib/utils.js").generate();
        //
        // showCDMessage(directory);
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

function downloadAwlyFromRepo(directory, repo){
    return new Promise(function(resolve, reject){
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
