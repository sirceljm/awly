const TAP = require("tap");
const md5File = require("md5-file");
const crypto = require("crypto");

const AWS = require("aws-sdk");
const utils = require("../../../lib/shared/awly-cli")(AWS);

TAP.test("zipLambda", function (t) {
    t.plan(2);

    utils.lambda.zipLambda("tests-assets/unit/util/zip-lambda/index.js", {silent:true}).then((content) => {
        const outputHash = crypto.createHash("md5").update(content).digest("hex");
        const inspectionHash = md5File.sync("tests-assets/unit/util/zip-lambda/index.js.zip");

        t.equal(outputHash, inspectionHash, "Zip hashes should be equal for the same input");
    });

    t.throws(
        () => utils.lambda.zipLambda("not_existent_file.js", {silent:true}),
        Error,
        "Should throw error if file not found"
    );
});
