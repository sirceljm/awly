const TAP = require("tap");
const fs = require("fs");

const { awsConfig } = require("@awly/env");

const AWS = require("aws-sdk");
AWS.config.update(awsConfig);

const utils = require("../../../lib/shared/awly-cli")(AWS);
const projectConfig = require("../../../lib/utils").getProjectConfig("./tests-assets/project-config/main.config.js");

TAP.test("uploadLambdaZip", function (t) {
    t.plan(1);

    const zipContents = fs.readFileSync("./tests-assets/unit/util/upload-lambda-zip/index.js.zip");
    utils.lambda.uploadLambda("awly-cli_test1", zipContents, projectConfig, {silent:true})
        .then(response => {
            t.pass();
        }).catch(err => {
            t.fail();
        });

    // utils.lambda.removeLambda("awly-cli_test1", zipContents, projectConfig, {silent:true})
    //     .then(response => {
    //         t.pass();
    //     }).catch(err => {
    //         t.fail();
    //     });
});
