const path = require("path");
const fs = require("fs");
const co = require("co");
const _ = require("lodash");

const AWS = require("aws-sdk");
let cloudfront = null;

module.exports = runSequence;

function runSequence(projectConfig){
    const cwd = projectConfig.cwd; // current working dir - your awly project dir

    require("app-module-path").addPath(cwd);

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    cloudfront = new AWS.CloudFront({apiVersion: "2016-09-07"});

    co(function *(){
        yield downloadCFDistConfig(projectConfig);
    }).catch(function(err){
        console.log("ERROR", err);
    });
}

function downloadCFDistConfig(projectConfig){
    return new Promise(function(resolve, reject){
        cloudfront.listDistributions({}, function (err, data) {
            // console.log(data.DistributionList.Items);
            if (err) {
                console.log(err, err.stack);
            } else {
                var existing_distribution = _.find(data.DistributionList.Items, {"Comment": projectConfig.cf_comment});
                if (existing_distribution) {
                    var params = {
                        Id: existing_distribution.Id /* required */
                    };
                    cloudfront.getDistributionConfig(params, function (err, data) {
                        if (err) {
                            console.log(err, err.stack); // an error occurred
                        } else {
                            data.Id = existing_distribution.Id;
                            data.IfMatch = data.ETag;
                            delete data.ETag;

                            var cfDistribution = data;
                            fs.writeFileSync(
                                path.resolve(projectConfig.cwd, "project-config/cloudfront/cloudfront-distribution.config.js"),
                                "module.exports = " + JSON.stringify(cfDistribution, null, 4) + ";"
                            );
                        }
                    });
                }
            }
        });
    });
}
