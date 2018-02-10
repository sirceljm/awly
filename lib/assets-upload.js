const path = require("path");
const fs = require('fs');
const node_s3_client = require('s3');
const co = require("co");

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

    uploadAssets(params, projectConfig);
}

function uploadAssets(params, projectConfig){
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
                    // console.log(uploader);
                    // console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on('end', function() {

                    // resolve();
                    // files_uploaded++;

                    // process.stdout.clearLine();
                    // process.stdout.cursorTo(0);
                    // process.stdout.write("Uploaded: " + files_uploaded + "/" + files_to_upload);
                    if(files_to_upload == 0){
                        console.log("No new files to upload.");
                    }

                    if (files_uploaded === files_to_upload) {
                        console.log("Finished");
                        resolve();
                    }
                });

                uploader.on('fileUploadStart', function (localFilePath, s3Key) {
                    files_to_upload++;
                });

                uploader.on('fileUploadEnd', function (localFilePath, s3Key) {
                    co(function* () {
                        let objAttrs = yield getAttributes(s3Key);
                        // console.log(objAttrs);
                        yield setAttributes(s3Key, objAttrs);

                        // yield makePublic(s3Key);
                    }).then(function (value) {
                      files_uploaded++;
                      console.log("Uploaded: " + files_uploaded + "/" + files_to_upload + " | " + localFilePath + " -> " + s3Key);
                    }, function (err) {
                      console.error(err.stack);
                    });
                });

                function makePublic(s3Key){
                    return new Promise(function (resolve, reject) {
                        s3.putObjectAcl({
                            Bucket: projectConfig.s3_bucket,
                            Key: s3Key,
                            ACL: "public-read"
                        }, function(err, data) {
                            if (err) {
                                console.log(err, err.stack); // an error occurred
                                reject();
                            } else {
                                resolve();
                            }
                        });
                    });
                }

                function getAttributes(s3key){
                    return new Promise(function (resolve, reject) {
                        s3.headObject({
                            Bucket: projectConfig.s3_bucket,
                            Key: s3key
                        }, function(err, data) {
                            if (err) {
                                console.log(err); // an error occurred
                                reject();
                            } else {
                                resolve(data);
                            }
                        });
                    });
                }

                function setAttributes(s3key, attributes){
                    delete attributes.ETag;
                    delete attributes.LastModified;
                    delete attributes.AcceptRanges;
                    delete attributes.ContentLength;

                    attributes.Bucket = projectConfig.s3_bucket;
                    attributes.ACL = 'public-read';
                    attributes.Key = s3key;
                    attributes.CopySource = projectConfig.s3_bucket + "/" + s3key;
                    attributes.CacheControl = "public, max-age=604800";
                    attributes.MetadataDirective = 'REPLACE';

                    return new Promise(function (resolve, reject) {
                        s3.copyObject(attributes, function(err, data) {
                            if (err) {
                                console.log(err); // an error occurred
                                reject();
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            });
        }

        uploadAssets(params);
    });
}
