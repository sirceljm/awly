const co = require("co");
const _ = require("lodash");

let cloudfront = null;
let apiGatewaySDK = null;

module.exports = (AWS) => {
    cloudfront = require("./cloudfront")(AWS);

    apiGatewaySDK = new AWS.APIGateway();

    return {
        createAPIGatewayMethod,
        checkForMethod,
        createAPIGatewayResources,
        deleteMethod,
        createMethod,
        createIntegration,
        createMethodResponse,
        createIntegrationResponse,
        deployAPIGatewayStage,
    };
};


function createAPIGatewayMethod(path, method, uploadedLambda, projectConfig) {
    return new Promise((resolve, reject) => {
        let pathArray = path.split("/").filter((el) => el != "");

        let apiID = projectConfig.api_gateway_id;
        apiGatewaySDK.getResources({
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
                    yield cloudfront.invalidateCloudfrontCache(path, projectConfig);
                    //createIntegration('GET', parentId, apiID, uploadedLambda);

                    resolve();
                });
            }
        });
    });
}


function checkForMethod(httpMethod, resourceId, apiID, opt) {
    const options = opt || {};
    if(!options.silent){
        console.log("CHECK FOR METHOD");
    }

    return new Promise(function(resolve, reject){
        apiGatewaySDK.getMethod({
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

function createAPIGatewayResources(closestPathObj, paths, apiID, resolve, reject, opt){
    if (paths.length == 0) {
        resolve(closestPathObj.id);
    } else {
        let path = paths.shift();
        const options = opt || {};
        if(!options.silent){
            console.log("CREATING API GATEWAY RESOURCE: " + closestPathObj.path + "/" + (path != "/" ? path : ""));
        }

        var params = {
            parentId: closestPathObj.id,
            pathPart: path,
            restApiId: apiID
        };

        apiGatewaySDK.createResource(params, function(err, data) {
            if (err) {
                console.log(err);
                reject(err, err.stack); // an error occurred
            } else {
                createAPIGatewayResources(data, paths, apiID, resolve, reject);
            }
        });
    }
}

function deleteMethod(httpMethod, resourceId, apiID, opt) {
    const options = opt || {};
    if(!options.silent){
        console.log("DELETE METHOD");
    }

    return new Promise(function(resolve, reject){
        apiGatewaySDK.deleteMethod({
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

function createMethod(httpMethod, resourceId, apiID, opt) {
    const options = opt || {};
    if(!options.silent){
        console.log("CREATE METHOD");
    }

    return new Promise(function(resolve, reject){
        apiGatewaySDK.putMethod({
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

function createIntegration(httpMethod, resourceId, apiID, uploadedLambda, projectConfig, opt){
    const options = opt || {};
    if(!options.silent){
        console.log("CREATE INTEGRATION");
    }

    return new Promise(function(resolve, reject){
        apiGatewaySDK.putIntegration({
            httpMethod: httpMethod,
            resourceId: resourceId,
            restApiId: apiID,
            type: "AWS",
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

function createMethodResponse(httpMethod, resourceId, restApiId, statusCode, opt) {
    const options = opt || {};
    if(!options.silent){
        console.log("CREATE METHOD RESPONSE");
    }

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
        apiGatewaySDK.putMethodResponse(params, function(err, data) {
            if (err) {
                reject(err, err.stack);
            } else {
                resolve();
                // createIntegrationResponse(httpMethod, resourceId, restApiId, statusCode);
            }
        });
    });
}

function createIntegrationResponse(httpMethod, resourceId, restApiId, statusCode, opt) {
    const options = opt || {};
    if(!options.silent){
        console.log("CREATE INTEGRATION RESPONSE");
    }

    return new Promise(function(resolve, reject){
        var params = {
            httpMethod: httpMethod,
            resourceId: resourceId,
            restApiId: restApiId,
            statusCode: statusCode,
            responseParameters: {
                "method.response.header.Content-Type" : "'text/html'"
            },
            responseTemplates: {
                "application/json": "$input.path('$')"
            }
        };
        apiGatewaySDK.putIntegrationResponse(params, function(err, data) {
            if (err) {
                reject(err, err.stack);
            } else     {
                resolve(data);
            }
        });
    });
}

function deployAPIGatewayStage(projectConfig, opt) {
    const options = opt || {};
    if(!options.silent){
        console.log("DEPLOY API GATEWAY STAGE");
    }

    return new Promise(function(resolve, reject){
        apiGatewaySDK.createDeployment({
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
