const env = require("@awly/env");
const path = require("path");
const lasso = require("lasso");

module.exports = (AWS) => {
    return {
        compileClientSide
    };
};

function compileClientSide(workingDir, entry, opt){
    const options = opt || {};
    if(!options.silent){
        console.log("COMPILING ASSETS");
    }

    return new Promise(function(resolve, reject){
        lasso.configure({
            outputDir: path.join(workingDir, "lambdas/static"),
            // urlPrefix: "/static",
            fingerprintsEnabled: true,
            plugins: [
                "lasso-marko",
                "lasso-less",
                "lasso-sass"
            ],
            // resolveCssUrls: {
            //     urlResolver: function(url, lassoContext, callback) {
            //         // if() starts with /
            //         url = url.replace("/assets", "https://");
            //         callback(null, url);
            //     }
            // },
            bundlingEnabled: options.bundle || true, // Only enable bundling in production
            minify: options.min || true, // Only minify JS and CSS code in production
            require: {
                transforms: [{
                    transform: "lasso-babel-transform", // Will transpile code from ES2015 to ES5, see babelOptions
                    config: {
                        extensions: [".marko", ".js", ".es6"],
                        babelOptions: {
                            presets: ["es2015"], // Do not require .babelrc file
                        }
                    }
                }]
            }
        });

        lasso.lassoPage({
            name: "bundle",
            dependencies: [
                "require-run: " + entry
            ]
        }).then(function(lassoPageResult) {
            resolve(lassoPageResult);
        });
    });
}
