const path = require("path");
const fs = require('fs');
const node_s3_client = require('s3');

let s3 = null;

const AWS = require('aws-sdk');

module.exports = runSequence;

function runSequence(projectConfig){
    const cwd = projectConfig.cwd; // current working dir - your awly project dir
    const awlyCliDir = projectConfig.awlyCliDir; // your awly cli dir

    require('app-module-path').addPath(cwd);

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    s3 = new AWS.S3({
        signatureVersion: 'v4',
        apiVersion: '2006-03-01'
    });

    var params = {
      localDir: path.resolve(cwd, "./assets"),
      deleteRemoved: false, // default false, whether to remove s3 objects
                           // that have no corresponding local file.
      s3Params: {
        Bucket: projectConfig.s3_bucket,
        Prefix: projectConfig.s3_assets_folder,
        // other options supported by putObject, except Body and ContentLength.
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      },
    };

    uploadAssets(params);
}

function uploadAssets(params){
    return new Promise(function (resolve, reject) {
        var client = node_s3_client.createClient({
            s3Client: s3,
            maxAsyncS3: 20,     // this is the default
            s3RetryCount: 3,    // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640 // this is the default (15 MB)
        });

        let fileUploads = [];

        function uploadAssets(params){
            return new Promise(function(resolve, reject){
                var files_to_upload = 0;
                var files_uploaded = 0;

                var uploader = client.uploadDir(params);

                uploader.on('error', function(err) {
                    //   console.error("unable to upload:", err.stack);
                  reject();
                });
                uploader.on('progress', function() {
                    // console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on('end', function() {
                    // resolve();
                    // files_uploaded++;

                    // process.stdout.clearLine();
                    // process.stdout.cursorTo(0);
                    // process.stdout.write("Uploaded: " + files_uploaded + "/" + files_to_upload);
                    console.log("Uploaded: " + files_uploaded + "/" + files_to_upload);

                    if (files_uploaded === files_to_upload) {
                        resolve();
                    }
                });

                if (!uploader.filesFound) {
                    console.log("no new files found");
                    resolve();
                } else {
                    uploader.on('fileUploadStart', function (localFilePath, s3Key) {
                        files_to_upload++;
                    });

                    uploader.on('fileUploadEnd', function (localFilePath, s3Key) {
                        files_uploaded++;

                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write("Uploaded: " + files_uploaded + "/" + files_to_upload);
                        console.log("Uploaded: " + files_uploaded + "/" + files_to_upload);

                        if (files_uploaded === files_to_upload) {
                            resolve();
                        }
                    });
                }
            });
        }

        uploadAssets(params);
    });
}
