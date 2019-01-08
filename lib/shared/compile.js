const { cwd, awlyCliDir } = require("@awly/env");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const lasso = require("lasso");

// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = (AWS) => {
    return {
        compileClientSide,
        makeExecutablePageLambda,
        compileTemplateWithWebpack,
        preparePageTemplate,
        mergeLassoFilesIntoStyleTag,
        prepareApiCode,
        compileApiWithWebpack,
        makeExecutableApiLambda
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

function mergeLassoFilesIntoStyleTag(lassoPageResult){
    let css = "<style>";

    lassoPageResult.files.forEach((file) => {
        if(file.contentType === "css"){
            css += fs.readFileSync(file.path, "utf8");
        }
    });

    css += "</style>";

    return css;
}

function prepareApiCode(entry){
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

function preparePageTemplate(compileIntoDir, entry, injectCSS, injectJS, opt){
    const options = opt || {};
    if(!options.silent){
        console.log("PREPARE PAGE TEMPLATE: ", compileIntoDir);
    }

    return new Promise(function(resolve, reject){
        var markoCompiler = require("marko/compiler");
        markoCompiler.configure({ requireTemplates: true });

        require("marko/node-require");

        let globals = {$global:{injectCSS: injectCSS, injectJS:injectJS}};
        let renderAppend = require(path.join(awlyCliDir, "helpers/page/lambda/render-append.js"))(globals);
        var compiledSrc = markoCompiler.compileFile(entry);

        //fs.writeFileSync(entry+".js", compiledSrc);
        const compiledPagePath = path.resolve(entry+".js");
        fs.writeFile(compiledPagePath,
            fs.readFileSync(path.join(awlyCliDir, "helpers/page/lambda/render-prepend.js"), "utf8") +
            compiledSrc +
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

function makeExecutablePageLambda(compileIntoDir, opt = {}){
    if(!opt.silent){
        console.log("MAKING EXECUTABLE PAGE LAMBDA IN: " + compileIntoDir);
    }

    return new Promise(function(resolve, reject){
        fs.writeFile(path.resolve(compileIntoDir, "./index.js"),
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/page/lambda/lambda-prepend.js"), "utf8") +
            fs.readFileSync(path.resolve(compileIntoDir, "./index.js"), "utf8") + // TODO make path dynamic
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/page/lambda/lambda-append.js"), "utf8"),
            function(err) {
                if(err) {
                    reject(err);
                    return err;
                }
                resolve(path.resolve(compileIntoDir, "./index.js"));
            }
        );
    });
}

function makeExecutableApiLambda(compileIntoDir, opt = {}){
    if(!opt.silent){
        console.log("MAKING EXECUTABLE API LAMBDA IN: " + compileIntoDir);
    }

    return new Promise(function(resolve, reject){
        fs.writeFile(path.resolve(compileIntoDir,  "./index.js"),
            require(path.resolve(awlyCliDir, "helpers/api/lambda/lambda-prepend-no-gzip.js"))(opt.gzip === false ? false : true) +
            fs.readFileSync(path.resolve(awlyCliDir, "./helpers/api/lambda/lambda-prepend.js"), "utf8") +
            fs.readFileSync(path.resolve(awlyCliDir, "./lambdas/index.js"), "utf8") + // TODO make path dynamic
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

function compileTemplateWithWebpack(compileIntoDir, entry, pagePath, opt){
    if(!opt.silent){
        console.log("COMPILING PAGE LAMBDA");
    }

    return new Promise((resolve, reject) => {
        let webpackConfig = {
            stats:{
                errorDetails: true,
            },
            entry: entry+".js",
            output: {
                path: compileIntoDir,
                filename: "index.js",
                // library: '',
                // libraryTarget: 'commonjs'
            },
            target: "node",
            resolve: {
                extensions: [".marko", ".js"],
                modules: [
                    path.resolve(cwd),
                    path.resolve(cwd, "node_modules"),
                    path.resolve(awlyCliDir),
                    path.resolve(awlyCliDir, "node_modules"),
                    path.resolve(awlyCliDir, "node_modules/@awly"),
                ]
            },
            resolveLoader: {
                modules:  [
                    path.resolve(cwd, "node_modules"),
                    path.resolve(awlyCliDir, "node_modules")
                ]
            },
            module: {
                rules: [{
                    test: /\.marko$/,
                    exclude: /node_modules(?!\/marko)/,
                    use: [{
                        loader: "marko-loader",
                        options: {target: "server"} // need to set this or marko loader won't compile for server
                    }]
                }]
            },
            externals: {
                "aws-sdk": "require('aws-sdk')"
            },
            plugins: [
                // required for marko server side build to work:  this should really be documented
                new webpack.DefinePlugin({
                    // "global.GENTLY": false,
                    "process.env.BUNDLE": "true"
                }),

                // new ExtractTextPlugin({
                //     filename:'./static/bundle2.css',
                //     allChunks: true
                // }),


                // ,

                // gets rid of warning from webpack about require not being statically resolved.
                new webpack.ContextReplacementPlugin(/runtime\/dependencies/, /runtime\/dependencies/)
            ]
        };

        if (opt.analyze) {
            webpackConfig.plugins.push(new BundleAnalyzerPlugin());
        }

        if (opt.min !== false) {
            webpackConfig.plugins.push(new UglifyJSPlugin());
        }

        webpack(webpackConfig).run(function(err, stats) {
            if(err){
                reject(err);
                return;
            }

            resolve(stats);
        });
    });
}


function compileApiWithWebpack(workingDir, entry, opt){
    if(!opt.silent){
        console.log("COMPILING PAGE LAMBDA");
    }

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
