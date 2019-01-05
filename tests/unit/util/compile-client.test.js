const TAP = require("tap");
const path = require("path");
const md5File = require("md5-file");

const AWS = require("aws-sdk");
const utils = require("../../../lib/shared/awly-cli")(AWS);

TAP.test("compileLasso", function (t) {
    utils.compile.compileClientSide(
        "tests-assets/unit/util/compile-client",
        "tests-assets/unit/util/compile-client/test.marko",
        {silent:true}
    ).then((content) => {
        t.equal(content.urlsBySlot.body[0], "/static/bundle-8df28ae7.js");
        t.equal(content.urlsBySlot.head[0], "/static/bundle-1fef503f.css");

        const inspectionHashJS = md5File.sync(path.join("tests-assets/unit/util/compile-client/control", content.urlsBySlot.body[0]));
        const outputHashJS = md5File.sync(path.join("tests-assets/unit/util/compile-client/lambdas", content.urlsBySlot.body[0]));
        t.equal(inspectionHashJS, outputHashJS);

        const inspectionHashCSS = md5File.sync(path.join("tests-assets/unit/util/compile-client/control", content.urlsBySlot.head[0]));
        const outputHashCSS = md5File.sync(path.join("tests-assets/unit/util/compile-client/lambdas", content.urlsBySlot.head[0]));
        t.equal(inspectionHashCSS, outputHashCSS);

        t.end();
    });
});
