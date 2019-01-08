let cloudfrontSDK = null;

module.exports = (AWS) => {
    cloudfrontSDK = new AWS.CloudFront({apiVersion: "2016-09-07"});

    return {
        invalidateCloudfrontCache: invalidateCloudfrontCache
    };
};

function invalidateCloudfrontCache(path, projectConfig, opt) {
    path = path.replace(/^\/+/g, "");

    const options = opt || {};
    if(!options.silent){
        console.log("CLEAR CLOUFRONT CACHE: /" + path);
    }

    const params = {
        DistributionId: projectConfig.cf_distribution_id,
        InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
                Quantity: 1,
                Items: [
                    "/" + path
                ]
            }
        }
    };

    return new Promise((resolve, reject) => {
        cloudfrontSDK.createInvalidation(params, (err, data) => {
            if (err) {
                reject(err, err.stack);
            } else {
                resolve(data);
            }
        });
    });
}
