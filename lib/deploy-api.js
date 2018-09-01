const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const co = require("co");
const JSZip = require("jszip");
const _ = require("lodash");

const AWS = require("aws-sdk");
let cloudfront = null;
let apigateway = null;

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = runSequence;

function runSequence(projectConfig, apiFilename, options){
    process.env.STAGE = "prod";

    const cwd = projectConfig.cwd; // current working dir - your awly project dir
    const awlyCliDir = projectConfig.awlyCliDir; // your awly cli dir

    require("app-module-path").addPath(cwd);

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    apigateway = new AWS.APIGateway();
    cloudfront = new AWS.CloudFront({apiVersion: "2016-09-07"});

    const apiName = "api/" + apiFilename.replace(/\.js$/, "");
    const entry = path.resolve(cwd, "./src/api/", apiFilename);

    // let lambdaPath = path.resolve(cwd, "./lambdas/index.js");

    let lambdaName = options["lambda-name"] || (projectConfig.domain + "__" + apiName).replace(/\./g, "-").replace(/\//g, "_");

    co(function *(){
        const preparedPath = yield preparePageTemplate(cwd, awlyCliDir, entry);
        const webpackStats = yield runWebpack(cwd, awlyCliDir, preparedPath);
        if(webpackStats.errors){
            console.log(webpackStats.errors);
        }
        const lambdaPath = yield wrapLambda(cwd, awlyCliDir, options);
        const lambdaZipContent = yield zipLambda(lambdaPath);
        const uploadedLambda = yield uploadLambda(lambdaZipContent, projectConfig, lambdaName);
        yield addLambdaAPIGatewayPermission(uploadedLambda);
        yield createAPIGatewayMethod(options.path || apiName, "POST", uploadedLambda, projectConfig);
    }).catch(function(err){
        console.log("ERROR", err);
    });
}


function preparePageTemplate(cwd, awlyCliDir, entry){
    return new Promise(function(resolve, reject){
        let renderAppend = require(path.join(awlyCliDir, "helpers/api/lambda/render-append.js"))();

        //const compiledPagePath = path.resolve(awlyCliDir, "./lambdas/index.js");
        const compiledPagePath = path.resolve(path.dirname(entry), "./lambda.js");

        fs.writeFile(compiledPagePath,
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/api/lambda/render-prepend.js"), "utf8") +
            fs.readFileSync(entry, "utf8") +
            renderAppend,
            function(err) {
                if(err) {
                    console.log(err);
                    reject();
                    return;
                }
                resolve(compiledPagePath);
            });
    });
}


function runWebpack(workingDir, awlyCliDir, entry){
    console.log("COMPILING LAMBDA");
    return new Promise(function(resolve, reject){
        webpack({
            stats:{
                errorDetails: true,
            },
            context: workingDir,
            entry: entry,
            output: {
                path: path.resolve(awlyCliDir, "./lambdas"),
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
                modules: [
                    path.resolve(workingDir),
                    path.resolve(workingDir, "node_modules"),
                    path.resolve(awlyCliDir, "node_modules")
                ],
            },
            externals: {
                "aws-sdk": "require('aws-sdk')",
                // 'graphql': "require('graphql')"
            },
            plugins: [
                // required for marko server side build to work:  this should really be documented
                new webpack.DefinePlugin({
                    // "global.GENTLY": false,
                    "process.env.BUNDLE": "true"
                }),
                // new UglifyJSPlugin(),
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

        }).run(function(err, stats) {
            if(err){
                reject(err);
                return;
            }

            resolve(stats);
        });
    });
}

function wrapLambda(workingDir, awlyCliDir, options){
    console.log("WRAP LAMBDA");
    return new Promise(function(resolve, reject){
        fs.writeFile(path.join(awlyCliDir, "./lambdas/index.js"),
            require(path.resolve(awlyCliDir, "helpers/api/lambda/lambda-prepend-no-gzip.js"))(options.gzip === false ? false : true) +
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/api/lambda/lambda-prepend.js"), "utf8") +
            fs.readFileSync(path.resolve(awlyCliDir, "./lambdas/index.js"), "utf8") +
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/api/lambda/lambda-append.js"), "utf8"),
            function(err) {
                if(err) {
                    reject(err);
                    return err;
                }
                resolve(path.join(awlyCliDir, "./lambdas/index.js"));
            }
        );
    });
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

// function uploadLambda(lambdaZipContent, projectConfig, lambdaName){
//     let lambdaFnName = lambdaName; // TODO different function names
//
//     return new Promise(function(resolve, reject){
//         // console.log(lambdaZipContent, projectConfig);
//         const lambda = new AWS.Lambda();
//
//         lambda.getFunction({
//             FunctionName: lambdaFnName,
//         }, function(err, data) {
//             if (err) { // NO FUNCTION FOUND - CREATE NEW
//                 console.log("NO FUNCTION FOUND - CREATING NEW");
//                 var params = {
//                     Code: {
//                         ZipFile: lambdaZipContent
//                     },
//                     FunctionName: lambdaFnName,
//                     Handler: "index.handler",
//                     Role: projectConfig.lambda_role_arn,
//                     Runtime: "nodejs6.10",
//                     //Description: 'STRING_VALUE',
//                     MemorySize: projectConfig.lambda_default_memory_size || 512, // needs 128 for edge
//                     Publish: true, // publish version
//                 };
//
//                 lambda.createFunction(params, function(err, data) {
//                     if (err) {
//                         reject(err, err.stack);
//                     } else     {
//                         resolve(data);
//                     }
//                 });
//             } else { //
//                 console.log("FUNCTION FOUND - UPDATING CODE");
//                 params = {
//                     FunctionName: lambdaFnName, /* required */
//                     Publish: true,
//                     ZipFile: lambdaZipContent
//                 };
//                 lambda.updateFunctionCode(params, function(err, data) {
//                     if (err) {
//                         reject(err, err.stack);
//                     } else     {
//                         resolve(data);
//                     }
//                 });
//             }
//         });
//     });
// }


function uploadLambda(lambdaZipContent, projectConfig, lambdaName){
    return new Promise(function(resolve, reject){
        // console.log(lambdaZipContent, projectConfig);
        const lambda = new AWS.Lambda();

        lambda.getFunction({
            FunctionName: lambdaName,
        }, function(err, data) {
            if (err) { // NO FUNCTION FOUND - CREATE NEW
                console.log("NO FUNCTION FOUND (" + lambdaName + ") - CREATING NEW");
                var params = {
                    Code: {
                        ZipFile: lambdaZipContent
                    },
                    FunctionName: lambdaName,
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
            } else { //
                console.log("FUNCTION FOUND (" + lambdaName + ") - UPDATING CODE");
                params = {
                    FunctionName: lambdaName, /* required */
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

function addLambdaAPIGatewayPermission(uploadedLambda) {
    const lambda = new AWS.Lambda();

    console.log("ADD LAMBDA API GATEWAY PERMISSION");
    // console.log(uploadedLambda);

    return new Promise((resolve, reject) => {
        var params = {
            FunctionName: uploadedLambda.FunctionArn,
            StatementId: "ID-1"
        };
        lambda.removePermission(params, function(err, data) {
            if (err && err.code != "ResourceNotFoundException") {
                console.log(err, err.stack);
            }

            var params = {
                Action: "lambda:InvokeFunction",
                FunctionName: uploadedLambda.FunctionArn,
                Principal: "apigateway.amazonaws.com",
                //  SourceAccount: "123456789012",
                //  SourceArn: "arn:aws:s3:::examplebucket/*",
                StatementId: "ID-1"
            };
            lambda.addPermission(params, (err, data) => {
                if (err) {
                    reject(err, err.stack);
                } else {
                    resolve(data);
                }
            });
        });
    });
}

function createAPIGatewayMethod(path, method, uploadedLambda, projectConfig) {
    // console.log(uploadedLambda);
    return new Promise((resolve, reject) => {
        let pathArray = path.split("/").filter((el) => el != "");

        let apiID = projectConfig.api_gateway_id;
        apigateway.getResources({
            restApiId: apiID,
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                let closestPath = [];
                let closestPathObj = {};

                for (let i = 0; i < data.items.length; i++) {
                    let existingPathArray = data.items[i].path.split("/").filter((el) => el != "");
                    let commonPath = [];

                    // console.log(data.items[i]);
                    // console.log(existingPathArray);
                    // console.log(pathArray);
                    // console.log("-----------------------");

                    for (let i = 0; i < Math.min(existingPathArray.length, pathArray.length); i++){
                        if (existingPathArray[i] == pathArray[i]) {
                            commonPath.push(pathArray[i]);
                        } else {
                            break;
                        }
                    }

                    if(existingPathArray.length < pathArray.length || _.isEqual(existingPathArray, pathArray)) {
                        if (closestPath.length == 0 && data.items[i].path === "/") {
                            closestPath = commonPath;
                            closestPathObj = data.items[i];
                        } else if(commonPath.length > closestPath.length) {
                            closestPath = commonPath;
                            closestPathObj = data.items[i];
                        }
                    }
                }


                pathArray.splice(0, closestPath.length);
                let differencePaths = pathArray;

                // console.log("__________________________");
                //
                // console.log("Closest path: ", closestPath);
                // console.log(differencePaths);
                // console.log(closestPathObj);

                let parentId = closestPathObj.id;
                co(function *(){
                    let chainedPromise = new Promise((resolve, reject) => {
                        createAPIGatewayResources(closestPathObj, differencePaths, apiID, resolve);
                    });
                    parentId = yield chainedPromise;

                    let existingMethod = yield checkForMethod(method, parentId, apiID);
                    if (existingMethod) {
                        yield deleteMethod(method, parentId, apiID);
                    }
                    yield createMethod(method, parentId, apiID);
                    yield createIntegration(method, parentId, apiID, uploadedLambda, projectConfig);
                    yield createMethodResponse(method, parentId, apiID, "200");
                    yield createIntegrationResponse(method, parentId, apiID, "200");
                    yield deployAPIGatewayStage(projectConfig);
                    yield invalidateCloudFrontCache(path, projectConfig);
                    //createIntegration('GET', parentId, apiID, uploadedLambda);
                    resolve();
                });
            }
        });
    });

    function createAPIGatewayResources(closestPathObj, paths, apiID, resolve, reject){
        if (paths.length == 0) {
            resolve(closestPathObj.id);
        } else {
            let path = paths.shift();
            console.log("CREATING API GATEWAY RESOURCE: " + closestPathObj.path + "/" + (path != "/" ? path : ""));

            var params = {
                parentId: closestPathObj.id,
                pathPart: path,
                restApiId: apiID
            };

            apigateway.createResource(params, (err, data) => {
                if (err) {
                    reject(err, err.stack); // an error occurred
                } else {
                    createAPIGatewayResources(data, paths, apiID, resolve);
                }
            });
        }
    }

    function checkForMethod(httpMethod, resourceId, apiID) {
        console.log("CHECK FOR METHOD");
        return new Promise(function(resolve, reject){
            apigateway.getMethod({
                httpMethod: httpMethod,
                resourceId: resourceId,
                restApiId: apiID
            }, function(err, data) {
                if (err) {
                    if (err.code == "NotFoundException") {
                        resolve(false);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(data);
                }
            });
        });
    }

    function deleteMethod(httpMethod, resourceId, apiID) {
        console.log("DELETE METHOD");
        return new Promise(function(resolve, reject){
            apigateway.deleteMethod({
                httpMethod: httpMethod,
                resourceId: resourceId,
                restApiId: apiID
            }, function(err, data) {
                if (err) {
                    reject(err, err.stack);
                } else {
                    resolve();
                }
            });
        });
    }

    function createMethod(httpMethod, resourceId, apiID) {
        console.log("CREATE METHOD");
        return new Promise(function(resolve, reject){
            apigateway.putMethod({
                authorizationType: "NONE",
                httpMethod: httpMethod,
                resourceId: resourceId,
                restApiId: apiID
            }, function(err, data) {
                if (err) {
                    reject(err, err.stack);
                } else {
                    resolve();
                }
            });
        });
    }

    function createIntegration(httpMethod, resourceId, apiID, uploadedLambda, projectConfig){
        console.log("CREATE INTEGRATION");
        return new Promise(function(resolve, reject){
            apigateway.putIntegration({
                httpMethod: httpMethod,
                resourceId: resourceId,
                restApiId: apiID,
                type: "AWS_PROXY",
                integrationHttpMethod: "POST",
                credentials: projectConfig.lambda_role_arn,
                uri: "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/" + uploadedLambda.FunctionArn + "/invocations"
            }, function(err, data) {
                if (err) {
                    reject(err, err.stack); // an error occurred
                } else {
                    resolve();
                }
            });
        });
    }

    function createMethodResponse(httpMethod, resourceId, restApiId, statusCode) {
        console.log("CREATE METHOD RESPONSE");
        return new Promise(function(resolve, reject){
            var params = {
                httpMethod: httpMethod,
                resourceId: resourceId,
                restApiId: restApiId,
                statusCode: statusCode,
                responseModels: {
                    "application/json": "Empty"
                },
                responseParameters: {
                    "method.response.header.Content-Type" : true
                }
            };
            apigateway.putMethodResponse(params, function(err, data) {
                if (err) {
                    reject(err, err.stack);
                } else {
                    resolve();
                    // createIntegrationResponse(httpMethod, resourceId, restApiId, statusCode);
                }
            });
        });
    }

    function createIntegrationResponse(httpMethod, resourceId, restApiId, statusCode) {
        console.log("CREATE INTEGRATION RESPONSE");
        return new Promise(function(resolve, reject){
            var params = {
                httpMethod: httpMethod,
                resourceId: resourceId,
                restApiId: restApiId,
                statusCode: statusCode,
                // responseParameters: {
                //     "method.response.header.Content-Type" : "'text/html'"
                // },
                // responseTemplates: {
                //     "application/json": "$input.path('$')"
                // }
            };
            apigateway.putIntegrationResponse(params, function(err, data) {
                if (err) {
                    reject(err, err.stack);
                } else     {
                    resolve(data);
                }
            });
        });
    }

    function deployAPIGatewayStage(projectConfig) {
        console.log("DEPLOY API GATEWAY STAGE");
        return new Promise(function(resolve, reject){
            apigateway.createDeployment({
                restApiId: projectConfig.api_gateway_id,
                stageName: projectConfig.api_gateway_prod_name
            }, function(err, data) {
                if (err) {
                    reject(err, err.stack);
                } else {
                    resolve(data);
                }
            });
        });
    }

    function invalidateCloudFrontCache(path, projectConfig) {
        console.log("CLEAR CLOUFRONT CACHE: /" + path);
        return new Promise(function(resolve, reject){
            cloudfront.createInvalidation({
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
            }, function(err, data) {
                if (err) {
                    console.log(err);
                    reject(err, err.stack);
                } else {
                    resolve(data);
                }
            });
        });
    }
}
