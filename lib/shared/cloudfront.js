const path = require("path");
const fs = require("fs");
const _ = require("lodash");

let cloudfrontSDK = null;

module.exports = (AWS) => {
    cloudfrontSDK = new AWS.CloudFront({apiVersion: "2016-09-07"});

    return {
        invalidateCloudfrontCache,
        createLmbdaEdgeTrigger
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

function createLmbdaEdgeTrigger(uploadedLambda, projectConfig, page, opt = {}){
    return new Promise(function(resolve, reject){
        cloudfrontSDK.listDistributions({}, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                var existing_distribution = _.find(data.DistributionList.Items, {"Comment": projectConfig.cf_comment});
                if (existing_distribution) {
                    var params = {
                        Id: existing_distribution.Id /* required */
                    };
                    cloudfrontSDK.getDistributionConfig(params, function (err, data) {
                        if (err) {
                            console.log(err, err.stack); // an error occurred
                        } else {
                            data.Id = existing_distribution.Id;
                            data.IfMatch = data.ETag;
                            delete data.ETag;

                            let pathPattern = "/" + _.trim(page, "/");
                            let index = _.findIndex(data.DistributionConfig.CacheBehaviors.Items, function(behaviour){
                                return behaviour.PathPattern == pathPattern;
                            });

                            if(index == -1){ // behavior not found - CREATE NEW
                                console.log("CREATING NEW CLOUDFRONT BEHAVIOR FOR: " + pathPattern);
                                data.DistributionConfig.CacheBehaviors.Quantity++;
                                const behaviorTemplatePath = path.resolve(projectConfig.cwd, "project-config/cloudfront/cache-behavior-template.js");
                                data.DistributionConfig.CacheBehaviors.Items.unshift(require(behaviorTemplatePath)(pathPattern));
                                index = 0;
                            }else{
                                console.log("UPDATING CLOUDFRONT BEHAVIOR FOR: " + pathPattern);
                            }

                            // console.log(data.DistributionConfig.CacheBehaviors.Items[index]);

                            let lambdaAssocIndex = _.findIndex(data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items, function(lambdaAssoc){
                                return lambdaAssoc.EventType == "origin-request";
                            });

                            if(lambdaAssocIndex == -1){
                                console.log("CREATING NEW CLOUDFRONT TRIGGER");
                                const lambdaAssocPath = path.resolve(projectConfig.cwd, "project-config/cloudfront/lambda-function-assoc-template.js");
                                data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Quantity++;
                                data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items.unshift(require(lambdaAssocPath)(uploadedLambda.FunctionArn, "origin-request"));
                                lambdaAssocIndex = 0;
                            }else{
                                console.log("UPDATING CLOUDFRONT TRIGGER");
                            }

                            if(uploadedLambda.Version === "1"){
                                uploadedLambda.FunctionArn = uploadedLambda.FunctionArn+":1";
                            }
                            data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items[lambdaAssocIndex].LambdaFunctionARN = uploadedLambda.FunctionArn;

                            // console.log(data);
                            fs.writeFileSync(path.resolve(projectConfig.cwd, "project-config/cloudfront/cloudfront-distribution.config.js"), JSON.stringify(data, null, 4));

                            cloudfrontSDK.updateDistribution(data, function (err, data) {
                                if (err) {
                                    //console.log(chalk.red(err));
                                    console.log(err.stack);
                                } else {
                                    resolve(data.Distribution.DomainName);
                                }
                            });
                        }
                    });
                } else {
                    const cloudfront_params = require(path.resolve(projectConfig.cwd, "project-config/cloudfront-distribution.config.js"));
                    cloudfrontSDK.createDistribution(cloudfront_params, function (err, data) {
                        if (err) {
                            //console.log(chalk.red(err));
                            console.log(err.stack);
                        } else {
                            console.log("create distribution");
                            resolve(data.Distribution.DomainName);
                        }
                    });
                }
            }
        });
    });
}
