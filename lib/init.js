const path = require("path");
require('app-module-path').addPath(path.dirname(require.main.filename));

const fs = require('fs');
const co = require('co');
const _ = require('lodash');
const download = require('download-git-repo');

const awlyUtils = require('lib/utils.js')

module.exports = runSequence;

function runSequence(directory, customRepo){
    co(function *(){
        yield checkIfDirectoryExists(directory);
        yield checkIfDirectoryIsEmpty(directory);
        yield downloadAwlyFromRepo(directory);
    }).catch(function(err){
        console.log(err);
    });
}

//function will check if a directory exists, and create it if it doesn't
function checkIfDirectoryExists(directory) {
    return new Promise(function(resolve, reject){
        fs.stat(directory, function(err, stats) {
            //Check if error defined and the error code is "not exists"
            if (err && err.errno === -2) {
                //Create the directory, call the callback.
                console.log('Directory ' + directory + ' does not exist. Creating ...');
                fs.mkdir(directory, function(){
                    resolve();
                });
            } else {
                resolve()
            }
        });
    });
}

function checkIfDirectoryIsEmpty(directory){
    return new Promise(function(resolve, reject){
        console.log('Checking ' + directory + ' if it is an empty directory.');
        fs.readdir(directory, function(err, files) {
            if (err) {
                console.log(err);
               // some sort of error
               reject('Directory is not empty. Aborting ...')
            } else {
                console.log(files);
               if (!files.length) {
                   // directory appears to be empty
                   resolve();
               }
            }
        });
    });
}

function downloadAwlyFromRepo(directory, customRepo){
    return new Promise(function(resolve, reject){
        let repo = customRepo || 'sirceljm/awly';
        console.log('Downloading Awly from ' + repo);
        download(repo, directory, function (err) {
            if (err) {
               reject(err)
           } else{
               resolve();
           }
        })
    });
}
