const { cwd } = require("@awly/env");

const path = require("path");
const co = require("co");

const AWS = require("aws-sdk");

module.exports = runSequence;

function runSequence(projectConfig, page, options){
    process.env.STAGE = "prod";

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    const utils = require("./shared/awly-cli")(AWS);

    let lambdaName = options["lambda-name"] || (projectConfig.domain + "_page_edge_" + page).replace(".", "-").replace("/", "_");

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

        const compileIntoDir = path.resolve(cwd, "./.lambdas");
        const compiledPagePath = yield utils.compile.preparePageTemplate(compileIntoDir, entry, css, lassoPageResult.getBodyHtml());
        const webpackStats = yield utils.compile.compileTemplateWithWebpack(compileIntoDir, entry, compiledPagePath, options);

        if(webpackStats.errors){
            console.log(webpackStats.errors);
        }
        const lambdaPath = yield utils.compile.makeExecutablePageLambdaEdge(compileIntoDir, options);
        if(!options["dry-run"]){
            const lambdaZipContent = yield utils.lambda.zipLambda(lambdaPath, entry);
            const uploadedLambda = yield utils.lambda.uploadLambda(lambdaName, lambdaZipContent, projectConfig);
            yield utils.cloudfront.createLmbdaEdgeTrigger(uploadedLambda, projectConfig, options.path || page);
        }
    }).catch(function(err){
        console.log("ERROR", err);
    });
}
