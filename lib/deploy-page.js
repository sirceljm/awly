const { cwd } = require("@awly/env");
const co = require("co");
const path = require("path");

let utils = {};

const AWS = require("aws-sdk");

module.exports = function(projectConfig, page, options){
    process.env.STAGE = "prod";

    const compileIntoDir = path.resolve(cwd, "./.lambdas");

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    utils = require("./shared/awly-cli")(AWS);

    let lambdaName = options["lambda-name"] || (projectConfig.domain + "_page_" + page).replace(".", "-").replace("/", "_");

    const endpoints = require(path.resolve(cwd, "./project-config/routing.js"));
    const entry = path.resolve( // TODO put this in lib file only pass args.page
        cwd,
        endpoints["/" + page].localEndpoint, // TODO handle page & /page the same way
        "index.marko"
    );

    co(function *(){
        const lassoPageResult = yield utils.compile.compileClientSide(cwd, entry);

        const css = utils.compile.mergeLassoFilesIntoStyleTag(lassoPageResult);
        utils.s3.uploadAssets(lassoPageResult, projectConfig); // no yield as this can be done in parallel

        const compiledPagePath = yield utils.compile.preparePageTemplate(compileIntoDir, entry, css, lassoPageResult.getBodyHtml());
        const webpackStats = yield utils.compile.compileTemplateWithWebpack(compileIntoDir, entry, compiledPagePath, options);

        if(webpackStats.errors){
            console.log(webpackStats.errors);
        }
        const lambdaPath = yield utils.compile.makeExecutablePageLambda(compileIntoDir, options);
        if(!options["dry-run"]){
            const lambdaZipContent = yield utils.lambda.zipLambda(lambdaPath, entry);
            const uploadedLambda = yield utils.lambda.uploadLambda(lambdaName, lambdaZipContent, projectConfig);
            yield utils.lambda.addLambdaAPIGatewayPermission(uploadedLambda);
            yield utils.apigateway.createAPIGatewayMethod(options.path || page, "GET", uploadedLambda, projectConfig);
        }

    }).catch(function(err){
        console.log("ERROR", err);
    });
};
