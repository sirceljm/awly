const node_s3_client = require("s3");

let s3SDK = null;

module.exports = (AWS) => {
    s3SDK = new AWS.S3({
        signatureVersion: "v4",
        apiVersion: "2006-03-01"
    });

    return {
        uploadAssets
    };
};

function uploadAssets(lassoPageResult, projectConfig){
    return new Promise(function (resolve, reject) {
        var client = node_s3_client.createClient({
            s3Client: s3SDK,
            maxAsyncS3: 20,     // this is the default
            s3RetryCount: 3,    // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640 // this is the default (15 MB)
        });

        let fileUploads = [];

        lassoPageResult.files.forEach((file) => {
            // console.log(file);
            var params = {
                localFile: file.path,
                deleteRemoved: false,

                s3Params: {
                    Bucket: projectConfig.s3_bucket,
                    Key: lassoPageResult.urlsBySlot[file.slot][0].slice(1),
                    ACL: "public-read"
                }
            };

            fileUploads.push(uploadFile(params));
        });

        Promise.all(fileUploads).then(() => {
            resolve();
        });

        function uploadFile(params){
            return new Promise(function(resolve, reject){
                var uploader = client.uploadFile(params);

                uploader.on("error", function(err) {
                    console.error("unable to upload:", err.stack);
                    reject();
                });
                uploader.on("progress", function() {
                    // console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on("end", function() {
                    resolve();
                });
            });
        }
    });
}
