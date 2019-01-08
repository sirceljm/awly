const { cwd } = require("@awly/env");
const path = require("path");
const co = require("co");

let utils = {};

const AWS = require("aws-sdk");

module.exports = function (projectConfig, apiFilename, options){
    process.env.STAGE = "prod";

    const compileIntoDir = path.resolve(cwd, "./.lambdas");

    utils = require("./shared/awly-cli")(AWS);

    require("app-module-path").addPath(cwd);

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    const apiName = "api/" + apiFilename.replace(/\.js$/, "");
    const entry = path.resolve(cwd, "./src/api/", apiFilename);

    // let lambdaPath = path.resolve(cwd, "./lambdas/index.js");

    let lambdaName = options["lambda-name"] || (projectConfig.domain + "__" + apiName).replace(/\./g, "-").replace(/\//g, "_");

    co(function *(){
        const entryPath = yield utils.compile.prepareApiCode(entry);
        const webpackStats = yield utils.compile.compileApiWithWebpack(entryPath);
        if(webpackStats.errors){
            console.log(webpackStats.errors);
        }
        const lambdaPath = yield utils.compile.makeExecutableApiLambda(compileIntoDir, options);
        const lambdaZipContent = yield utils.lambda.zipLambda(lambdaPath);
        const uploadedLambda = yield utils.lambda.uploadLambda(lambdaZipContent, projectConfig, lambdaName);
        yield utils.lambda.addLambdaAPIGatewayPermission(uploadedLambda);
        yield utils.apigateway.createAPIGatewayMethod(options.path || apiName, "POST", uploadedLambda, projectConfig);
    }).catch(function(err){
        console.log("ERROR", err);
    });
};
