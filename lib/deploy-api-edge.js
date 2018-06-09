const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const co = require("co");
const JSZip = require("jszip");
const _ = require("lodash");

const AWS = require("aws-sdk");
let cloudfront = null;

// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = runSequence;

function runSequence(projectConfig, api, options){
    const cwd = projectConfig.cwd; // current working dir - your awly project dir
    const awlyCliDir = projectConfig.awlyCliDir; // your awly cli dir

    require("app-module-path").addPath(cwd);

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    cloudfront = new AWS.CloudFront({apiVersion: "2016-09-07"});

    let entry = path.resolve(cwd, "./src/apis/", api, "./index.js");
    let lambdaName = options["lambda-name"] || (projectConfig.domain + "_api_edge_" + api).replace(".", "-");

    co(function *(){
        yield runWebpack(cwd, awlyCliDir, entry);

        const lambdaPath = yield wrapLambda(cwd, awlyCliDir, options);
        const lambdaZipContent = yield zipLambda(lambdaPath);
        const uploadedLambda = yield uploadLambda(lambdaZipContent, projectConfig, lambdaName);
        yield createTrigger(uploadedLambda, projectConfig, api);
    }).catch(function(err){
        console.log("ERROR", err);
    });
}

// returns a Compiler instance
function compileLambda(workingDir, awlyCliDir, entry){
    return webpack({
        stats:{
            errorDetails: true,
        },
        context: workingDir,
        entry: entry,
        output: {
            path: path.resolve(workingDir, "./lambdas"),
            filename: "index.js",
            // library: '',
            // libraryTarget: 'commonjs'
        },
        target: "node",
        resolveLoader: {
            modules: [
                path.resolve(awlyCliDir, "./node_modules")
            ]
        },
        resolve: {
            extensions: [".js"],
            modules: [path.resolve(workingDir), "node_modules"],
        },
        externals: {
            "aws-sdk": "require('aws-sdk')",
            // 'graphql': "require('graphql')"
        },
        plugins: [
            // required for marko server side build to work:  this should really be documented
            new webpack.DefinePlugin({
                // "global.GENTLY": false,
                "process.env": {"BUNDLE": "\"true\""}
            }),
            new UglifyJSPlugin(),
            // new BundleAnalyzerPlugin(),
        ],
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                    query: {
                        presets: ["es2015"]
                    }
                }
            ]
        }

    });
}

function runWebpack(workingDir, awlyCliDir, entry){
    console.log("runWebpack");
    return new Promise(function(resolve, reject){
        compileLambda(workingDir, awlyCliDir, entry).run(function(err, stats) {
            if(err){
                console.log(err);
                reject(err);
                return;
            }

            //console.log(stats);
            resolve(stats);
        });
    });
}

function wrapLambda(workingDir, awlyCliDir, options){
    console.log("wrapLambda");
    return new Promise(function(resolve, reject){
        fs.writeFile(path.join(workingDir, "./lambdas/index.js"),
            // fs.readFileSync('./helpers/graphql-prepend.js', 'utf8') +
            require(path.resolve(awlyCliDir, "helpers/api/lambda-edge/lambda-prepend-no-gzip.js"))(options.gzip === false ? false : true) +
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/api/lambda-edge/lambda-prepend-querystring-build.js"), "utf8") +
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/api/lambda-edge/lambda-prepend.js"), "utf8") +
            fs.readFileSync(path.resolve(workingDir, "./lambdas/index.js"), "utf8") +
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/api/lambda-edge/lambda-append.js"), "utf8"),
            function(err) {
                if(err) {
                    reject(err);
                    return err;
                }
                resolve(path.join(workingDir, "./lambdas/index.js"));
            }
        );
    });

    // console.log('DONE!');
}

function zipLambda(lambdaPath, entry) {
    return new Promise(function(resolve, reject){
        var zip = new JSZip();
        zip.file("index.js", fs.readFileSync(lambdaPath, "utf8"));
        //var data = zip.generate({type:"uint8array", compression: 'deflate'});

        zip.generateAsync({type:"uint8array", compression: "deflate"})
            .then(function (content) {
                fs.writeFileSync(lambdaPath+".zip", content);
                resolve(content);
            });
    });
}

function uploadLambda(lambdaZipContent, projectConfig, lambdaName){
    let lambdaFnName = lambdaName; // TODO different function names

    return new Promise(function(resolve, reject){
        // console.log(lambdaZipContent, projectConfig);
        const lambda = new AWS.Lambda();

        lambda.getFunction({
            FunctionName: lambdaFnName,
        }, function(err, data) {
            if (err) { // NO FUNCTION FOUND - CREATE NEW
                console.log("NO FUNCTION FOUND - CREATING NEW");
                var params = {
                    Code: {
                        ZipFile: lambdaZipContent
                    },
                    FunctionName: lambdaFnName,
                    Handler: "index.handler",
                    Role: projectConfig.lambda_role_arn,
                    Runtime: "nodejs6.10",
                    //Description: 'STRING_VALUE',
                    MemorySize: projectConfig.lambda_default_memory_size || 512, // needs 128 for edge
                    Publish: true, // publish version
                };

                lambda.createFunction(params, function(err, data) {
                    if (err) {
                        reject(err, err.stack);
                    } else     {
                        resolve(data);
                    }
                });
            }else{ //
                console.log("FUNCTION FOUND - UPDATING CODE");
                params = {
                    FunctionName: lambdaFnName, /* required */
                    Publish: true,
                    ZipFile: lambdaZipContent
                };
                lambda.updateFunctionCode(params, function(err, data) {
                    if (err) {
                        reject(err, err.stack);
                    } else     {
                        resolve(data);
                    }
                });
            }
        });
    });
}


function createTrigger(uploadedLambda, projectConfig, api){
    return new Promise(function(resolve, reject){
        cloudfront.listDistributions({}, function (err, data) {
            // console.log(data.DistributionList.Items);
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(uploadedLambda.FunctionArn);

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

                            // var a = data.DistributionConfig.CacheBehaviors.Items[0];
                            // console.log(a);
                            // fs.writeFileSync(path.resolve(projectConfig.cwd, 'project-config/cloudfront/c.js'), JSON.stringify(a, null, 4));

                            let pathPattern = "/" + _.trim(api, "/");
                            let index = _.findIndex(data.DistributionConfig.CacheBehaviors.Items, function(behaviour){
                                return behaviour.PathPattern == pathPattern;
                            });

                            if(index == -1){ // behaviour not found - CREATE NEW
                                data.DistributionConfig.CacheBehaviors.Quantity++;
                                const behaviorTemplatePath = path.resolve(projectConfig.cwd, "project-config/cloudfront/cache-behavior-template.js");
                                data.DistributionConfig.CacheBehaviors.Items.unshift(require(behaviorTemplatePath)(pathPattern));
                                index = 0;
                            }

                            // console.log(data.DistributionConfig.CacheBehaviors.Items[index]);

                            let lambdaAssocIndex = _.findIndex(data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items, function(lambdaAssoc){
                                return lambdaAssoc.EventType == "origin-request";
                            });

                            if(lambdaAssocIndex == -1){
                                const lambdaAssocPath = path.resolve(projectConfig.cwd, "project-config/cloudfront/lambda-function-assoc-template.js");
                                data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Quantity++;
                                data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items.unshift(require(lambdaAssocPath)(uploadedLambda.FunctionArn, "origin-request"));
                                lambdaAssocIndex = 0;
                            }

                            if(uploadedLambda.Version === "1"){
                                uploadedLambda.FunctionArn = uploadedLambda.FunctionArn+":1";
                            }
                            data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items[lambdaAssocIndex].LambdaFunctionARN = uploadedLambda.FunctionArn;

                            // console.log(data);
                            fs.writeFileSync(path.resolve(projectConfig.cwd, "project-config/cloudfront/cloudfront-distribution.config.js"), JSON.stringify(data, null, 4));

                            cloudfront.updateDistribution(data, function (err, data) {
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
                    cloudfront.createDistribution(cloudfront_params, function (err, data) {
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
