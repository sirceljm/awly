const path = require("path");
const webpack = require("webpack");
const fs = require('fs');
const co = require('co');
const JSZip = require('jszip');
const _ = require('lodash');
const node_s3_client = require('s3');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const lasso = require('lasso');

const AWS = require('aws-sdk');
let cloudfront = null;
let s3 = null;

module.exports = runSequence;

function runSequence(entry, projectConfig, page, options){
    const cwd = projectConfig.cwd; // current working dir - your awly project dir
    const awlyCliDir = projectConfig.awlyCliDir; // your awly cli dir

    require('app-module-path').addPath(cwd);

    AWS.config.update(projectConfig.credentials);

    AWS.config.update({
        region: projectConfig.aws_region
    });

    cloudfront = new AWS.CloudFront({apiVersion: '2016-09-07'});
    s3 = new AWS.S3({
        signatureVersion: 'v4',
        apiVersion: '2006-03-01'
    });

    let lambdaName = options['lambda-name'] || (projectConfig.domain + '_page_' + page).replace('.', '-');

    co(function *(){
        const lassoPageResult = yield runLasso(cwd, entry);

        let css = "<style>";

        lassoPageResult.files.forEach((file) => {
            if(file.contentType == 'css'){
                css += fs.readFileSync(file.path, 'utf8');
            }
        });

        css += "</style>";

        uploadAssets(cwd, lassoPageResult, projectConfig); // no yield as this can be done in parallel

        yield preparePageTemplate(awlyCliDir, entry, css, lassoPageResult.getBodyHtml());
        const stats = yield runWebpack(cwd, entry);

        // console.log(stats);
        // return;
        const lambdaPath = yield wrapLambda(cwd, awlyCliDir, options);
        const lambdaZipContent = yield zipLambda(lambdaPath, entry);
        const uploadedLambda = yield uploadLambda(lambdaZipContent, projectConfig, lambdaName);
        yield createTrigger(uploadedLambda, projectConfig, page);
    }).catch(function(err){
        console.log('ERROR', err);
    });
}

function runLasso(workingDir, entry){
    console.log('COMPILING ASSETS');
    return new Promise(function(resolve, reject){
        lasso.configure({
            outputDir: path.join(workingDir, "lambdas/static"),
            urlPrefix: "/static",
            fingerprintsEnabled: true,
            plugins: [
                "lasso-marko",
                "lasso-less",
                "lasso-sass"
            ],
            bundlingEnabled: true, // Only enable bundling in production
            minify: true, // Only minify JS and CSS code in production
            require: {
                transforms: [{
                    transform: 'lasso-babel-transform', // Will transpile code from ES2015 to ES5, see babelOptions
                    config: {
                      extensions: ['.marko', '.js', '.es6'],
                      babelOptions: {
                        presets: ['es2015'], // Do not require .babelrc file
                      }
                    }
                }]
            }
        });

        lasso.lassoPage({
            name: 'bundle',
            dependencies: [
                "require-run: "+entry
            ]
        }).then(function(lassoPageResult) {
            resolve(lassoPageResult);
        });
    })
}

function uploadAssets(cwd, lassoPageResult, projectConfig){
    return new Promise(function (resolve, reject) {
        var client = node_s3_client.createClient({
            s3Client: s3,
            maxAsyncS3: 20,     // this is the default
            s3RetryCount: 3,    // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640 // this is the default (15 MB)
        });

        let fileUploads = [];

        lassoPageResult.files.forEach((file) => {
            // console.log(file);
            var params = {
                localFile: file.path,
                deleteRemoved: false,

                s3Params: {
                    Bucket: projectConfig.s3_bucket,
                    Key: lassoPageResult.urlsBySlot[file.slot][0].slice(1),
                    ACL: "public-read"
                }
            };

            fileUploads.push(uploadFile(params));
        });

        Promise.all(fileUploads).then(() => {
            resolve();
        });

        function uploadFile(params){
            return new Promise(function(resolve, reject){
                var uploader = client.uploadFile(params);

                uploader.on('error', function(err) {
                    //   console.error("unable to upload:", err.stack);
                  reject();
                });
                uploader.on('progress', function() {
                    //   console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on('end', function() {
                    resolve();
                    // files_uploaded++;
                    //
                    // // process.stdout.clearLine();
                    // // process.stdout.cursorTo(0);
                    // // process.stdout.write("Uploaded: " + files_uploaded + "/" + files_to_upload);
                    // console.log("Uploaded: " + files_uploaded + "/" + files_to_upload);
                    //
                    // if (files_uploaded === files_to_upload) {
                    //     resolve();
                    // }
                });
            });


            // if (!uploader.filesFound) {
            //     console.log("no new files found");
            //     resolve();
            // } else {
            //     uploader.on('fileUploadStart', function (localFilePath, s3Key) {
            //         files_to_upload++;
            //     });
            //
            //     uploader.on('fileUploadEnd', function (localFilePath, s3Key) {
            //         files_uploaded++;
            //
            //         process.stdout.clearLine();
            //         process.stdout.cursorTo(0);
            //         process.stdout.write("Uploaded: " + files_uploaded + "/" + files_to_upload);
            //         console.log("Uploaded: " + files_uploaded + "/" + files_to_upload);
            //
            //         if (files_uploaded === files_to_upload) {
            //             resolve();
            //         }
            //     });
            // }
        }

    });

    // console.log('LASSO', lassoPageResult);
}

function preparePageTemplate(workingDir, entry, injectCSS, injectJS){
    return new Promise(function(resolve, reject){
        var markoCompiler = require('marko/compiler');
        markoCompiler.configure({ requireTemplates: true });

        require('marko/node-require');

        let globals = {$global:{injectCSS: injectCSS, injectJS:injectJS}};
        let renderAppend = require(path.join(workingDir, 'helpers/page/lambda-edge/render-append.js'))(globals);
        var compiledSrc = markoCompiler.compileFile(entry);

        fs.writeFile(entry + '.js',
            fs.readFileSync(path.join(workingDir, 'helpers/page/lambda-edge/render-prepend.js'), 'utf8') +
            compiledSrc +
            renderAppend,
        function(err) {
            if(err) {
                console.log(err)
                reject();
                return;
            }
            resolve();
        });
    });
}


// returns a Compiler instance
function compileLambda(workingDir, entry){
    return webpack({
        stats:{
            errorDetails: true,
        },
        context: workingDir,
        entry: entry+'.js',
        output: {
            path: path.resolve(workingDir, './lambdas'),
            filename: 'index.js',
            // library: '',
            // libraryTarget: 'commonjs'
        },
        target: 'node',
        resolve: {
            extensions: ['.js', '.marko'],
            modules: [path.resolve(workingDir), 'node_modules'],
        },
        module: {
            rules: [{
                test: /\.marko$|\.html$/,
                exclude: /node_modules(?!\/marko)/,
                use: [{
                    loader: 'marko-loader',
                    options: {target: 'server'} // need to set this or marko loader won't compile for server
                }]
            },{
                test: /\.svg$/,
                use: [{
                    loader: 'svg-inline-loader'
                }]
            },{
                test: /\.less|\.scss$/, // matches style.less { ... } from our template
                loader: "style-loader!css-loader!less-loader!"
            },{
                test: /\.(less|css)$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!less-loader"
                })
            }]
        },
        externals: {
           'aws-sdk': "require('aws-sdk')",
           // 'graphql': "require('graphql')"
        },
        plugins: [
            // required for marko server side build to work:  this should really be documented
            new webpack.DefinePlugin({
                // "global.GENTLY": false,
                'process.env': {'BUNDLE': '"true"'}
            }),

            // new ExtractTextPlugin({
            //     filename:'./static/bundle2.css',
            //     allChunks: true
            // }),

            // new MinifyPlugin(),
            new UglifyJSPlugin(),
            // new BundleAnalyzerPlugin(),

            // gets rid of warning from webpack about require not being statically resolved.
            new webpack.ContextReplacementPlugin(/runtime\/dependencies/, /runtime\/dependencies/)
        ]

    });
}

function runWebpack(workingDir, entry){
    console.log('COMPILING LAMBDA');
    return new Promise(function(resolve, reject){
        compileLambda(workingDir, entry).run(function(err, stats) {
            if(err){
                reject(err);
                return;
            }

            resolve(stats);
        });
    });
}


function wrapLambda(workingDir, awlyCliDir, options){
    return new Promise(function(resolve, reject){
        fs.writeFile(path.join(workingDir, "./lambdas/index.js"),
            // fs.readFileSync('./helpers/page/lambda-edge/graphql-prepend.js', 'utf8') +
            require(path.resolve(awlyCliDir, 'helpers/page/lambda-edge/lambda-prepend-no-gzip.js'))(options.gzip === false ? false : true) +
            fs.readFileSync(path.resolve(awlyCliDir, './helpers/page/lambda-edge/lambda-prepend.js'), 'utf8') +
            fs.readFileSync(path.resolve(workingDir, './lambdas/index.js'), 'utf8') +
            fs.readFileSync(path.resolve(awlyCliDir, './helpers/page/lambda-edge/lambda-append.js'), 'utf8'),
            function(err) {
                if(err) {
                    reject(err);
                    return err;
                }
                resolve(path.join(workingDir, "./lambdas/index.js"));
            }
        );
    });

    // console.log('DONE!');
}


function zipLambda(lambdaPath) {
    return new Promise(function(resolve, reject){
    	var zip = new JSZip();
    	zip.file('index.js', fs.readFileSync(lambdaPath, 'utf8'));
    	//var data = zip.generate({type:"uint8array", compression: 'deflate'});

        zip.generateAsync({type:"uint8array", compression: 'deflate'})
        .then(function (content) {
            fs.writeFileSync(lambdaPath+".zip", content);
            resolve(content);
        });
    });
};

function uploadLambda(lambdaZipContent, projectConfig, lambdaName){
    return new Promise(function(resolve, reject){
        // console.log(lambdaZipContent, projectConfig);
        const lambda = new AWS.Lambda();

    	lambda.getFunction({
    	  FunctionName: lambdaName,
    	}, function(err, data) {
    		if (err) { // NO FUNCTION FOUND - CREATE NEW
    	  		console.log("NO FUNCTION FOUND - CREATING NEW")
    		  	var params = {
    			  Code: {
    			    ZipFile: lambdaZipContent
    			  },
    			  FunctionName: lambdaName,
    			  Handler: 'index.handler',
    			  Role: projectConfig.lambda_role_arn,
    			  Runtime: 'nodejs6.10',
    			  //Description: 'STRING_VALUE',
    			  MemorySize: projectConfig.lambda_default_memory_size || 512, // needs 128 for edge
    			  Publish: true, // publish version
    			};

    			lambda.createFunction(params, function(err, data) {
    			  if (err) reject(err, err.stack);
    			  else     resolve(data);
    			});
    		}else{ //
    		  	console.log("FUNCTION FOUND - UPDATING CODE");
    		  	var params = {
    				FunctionName: lambdaName, /* required */
    				Publish: true,
    				ZipFile: lambdaZipContent
    			};
    			lambda.updateFunctionCode(params, function(err, data) {
    			  if (err) reject(err, err.stack);
    			  else     resolve(data);
    			});
    		}
    	});
    });
}


function createTrigger(uploadedLambda, projectConfig, page){
    return new Promise(function(resolve, reject){
        cloudfront.listDistributions({}, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                var existing_distribution = _.find(data.DistributionList.Items, {"Comment": projectConfig.cf_comment});
                if (existing_distribution) {
                    var params = {
                        Id: existing_distribution.Id /* required */
                    };
                    cloudfront.getDistributionConfig(params, function (err, data) {
                        if (err) {
                            console.log(err, err.stack); // an error occurred
                        } else {
                            data.Id = existing_distribution.Id;
                            data.IfMatch = data.ETag;
                            delete data.ETag;

                            let pathPattern = '/' + _.trim(page, '/');
                            let index = _.findIndex(data.DistributionConfig.CacheBehaviors.Items, function(behaviour){
                                return behaviour.PathPattern == pathPattern;
                            });

                            if(index == -1){ // behavior not found - CREATE NEW
                                console.log('CREATING NEW CLOUDFRONT BEHAVIOR FOR: ' + pathPattern);
                                data.DistributionConfig.CacheBehaviors.Quantity++;
                                const behaviorTemplatePath = path.resolve(projectConfig.cwd, 'project-config/cloudfront/cache-behavior-template.js');
                                data.DistributionConfig.CacheBehaviors.Items.unshift(require(behaviorTemplatePath)(pathPattern));
                                index = 0;
                            }else{
                                console.log('UPDATING CLOUDFRONT BEHAVIOR FOR: ' + pathPattern);
                            }

                            // console.log(data.DistributionConfig.CacheBehaviors.Items[index]);

                            let lambdaAssocIndex = _.findIndex(data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items, function(lambdaAssoc){
                                return lambdaAssoc.EventType == "origin-request";
                            });

                            if(lambdaAssocIndex == -1){
                                console.log('CREATING NEW CLOUDFRONT TRIGGER');
                                const lambdaAssocPath = path.resolve(projectConfig.cwd, 'project-config/cloudfront/lambda-function-assoc-template.js');
                                data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Quantity++;
                                data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items.unshift(require(lambdaAssocPath)(uploadedLambda.FunctionArn, "origin-request"));
                                lambdaAssocIndex = 0;
                            }else{
                                console.log('UPDATING CLOUDFRONT TRIGGER');
                            }

                            if(uploadedLambda.Version === '1'){
                                uploadedLambda.FunctionArn = uploadedLambda.FunctionArn+':1';
                            }
                            data.DistributionConfig.CacheBehaviors.Items[index].LambdaFunctionAssociations.Items[lambdaAssocIndex].LambdaFunctionARN = uploadedLambda.FunctionArn;

                            // console.log(data);
                            fs.writeFileSync(path.resolve(projectConfig.cwd, 'project-config/cloudfront/cloudfront-distribution.config.js'), JSON.stringify(data, null, 4));

                            cloudfront.updateDistribution(data, function (err, data) {
                                if (err) {
                                    //console.log(chalk.red(err));
                                    console.log(err.stack);
                                } else {
                                    resolve(data.Distribution.DomainName);
                                }
                            });
                        }
                    });
                } else {
                    cloudfront.createDistribution(cloudfront_params, function (err, data) {
                        if (err) {
                            //console.log(chalk.red(err));
                            console.log(err.stack);
                        } else {
                            console.log('create distribution');
                            resolve(data.Distribution.DomainName);
                        }
                    });
                }
            }
        });
    });
}
