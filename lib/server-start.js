const path = require('path');
const fs = require('fs');
require('marko/express');
require('marko/node-require').install();

var lasso = require('lasso');

module.exports = serverStart;

function serverStart(projectConfig, options){
    const cwd = projectConfig.cwd;

    require('app-module-path').addPath(cwd);
    require('app-module-path').addPath(path.resolve(cwd, './node_modules'));

    require('dotenv').config({
        path: path.resolve(cwd, './.env')
    });

    const bodyParser = require('body-parser');
    const graphqlExpress = require('graphql-server-express');
    require("inline-svg-register");

    const localDynamo = require('local-dynamo');

    localDynamo.launch({
        port: process.env.DYNAMODB_PORT,
        sharedDb: true,
        dir: './data/dynamodb'
    });

    var express = require('express');
    const spdy = require('spdy');
    var compression = require('compression'); // Provides gzip compression for the HTTP response

    var isProduction = process.env.NODE_ENV === 'production';
    isProduction = true;

    // Configure lasso to control how JS/CSS/etc. is delivered to the browser
    lasso.configure({
        // require: {
        //     transforms: [
        //         {
        //             transform: 'lasso-babel-transform',
        //             config: {
        //                 extensions: ['.js', '.es6'] // Enabled file extensions. Default: ['.js', '.es6']
        //             }
        //         }
        //     ]
        // },
        plugins: [
            'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
            'lasso-less',
            'lasso-sass',
            // {
            //     plugin: 'lasso-inline-slots',
            //     config: {
            //         inlineSlots: [
            //             'inline-css'
            //         ]
            //     }
            // }
        ],
        resolveCssUrls: true,
        outputDir: path.resolve(cwd, './static'), // Place all generated JS/CSS/etc. files into the "static" dir
        bundlingEnabled: isProduction, // Only enable bundling in production
        minify: isProduction, // Only minify JS and CSS code in production
        fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production,
        require: {
            transforms: [{
                transform: 'lasso-babel-transform',
                config: {
                    extensions: ['.marko', '.js', '.es6'],
                    // directly specify babel options
                    babelOptions: {
                        presets: [ "es2015" ]
                    }
                }
            }]
        },
    });


    var app = express();

    var port = process.env.PORT || 8080;

    // Enable gzip compression for all HTTP responses
    app.use(compression());

    var schema = require(path.resolve(cwd, './src/services/graphql/schema.js'));
    // console.log(schema);

    app.use('/gql', bodyParser.json(), graphqlExpress.graphqlExpress({ schema: schema }));

    app.use('/graphql', bodyParser.json(), graphqlExpress.graphqlExpress({ schema: schema }));
    app.use('/graphiql', graphqlExpress.graphiqlExpress({
        endpointURL: '/graphql',
    }));

    // Allow all of the generated files under "static" to be served up by Express
    app.use(require('lasso/middleware').serveStatic());

    express.static.mime.define({'text/javascript': ['js']});

    app.use('/assets', express.static('./assets'));

    // Map the "/" route to the home page
    addPage('', './src/pages/home');
    addPage('posts', './src/pages/posts');
    addPage('profile', './src/pages/profile');

    function addPage(urlPath, filePath){
        console.log("ADD PAGE:", urlPath, filePath);

        var template = require(path.resolve(cwd, filePath));

        lasso.lassoPage({
            name: urlPath || 'index',
            dependencies: [
                "require-run: " + filePath,
            ]
        }).then(function(lassoPageResult) {
            // console.log(lassoPageResult);
            let css = "<style>";

            lassoPageResult.files.forEach((file) => {
                // console.log(file);
                if(file.contentType == 'css'){
                    css += fs.readFileSync(file.path, 'utf8');
                }
            });

            css += "</style>";

            app.get('/'+urlPath, function(req, res) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.marko(template, {
                    $global:{
                        injectCSS: css,
                        injectJS: lassoPageResult.getBodyHtml()
                    }
                });
            });
        });
    }

    function addApi(urlPath, filePath){
        app.get('/'+urlPath, function(req, res) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            console.log(req.query);
            res.send(JSON.stringify(req.query, null, 2));
        });
    }

    app.disable('view cache');

    const certs = {
        key: fs.readFileSync(path.resolve(cwd, './certs/privkey.pem')),
        cert:  fs.readFileSync(path.resolve(cwd, './certs/fullchain.pem'))
    }


    // var viewsDir = path.join(__dirname, 'src');

    // if (isProduction !== 'production') {
    //     // Enable hot reloading in development
    //     require('marko/hot-reload').enable();
    //
    //     require('fs').watch(viewsDir, function (event, filename) {
    //         if (/\.marko$/.test(filename)) {
    //             // Resolve the filename to a full template path:
    //             var templatePath = path.join(viewsDir, filename);
    //
    //             console.log('Marko template modified: ', templatePath);
    //
    //             // Pass along the *full* template path to marko
    //             require('marko/hot-reload').handleFileModified(templatePath);
    //         }
    //     });
    // }

    spdy
      .createServer(certs, app)
      .listen(8080, (error) => {
        if (error) {
            console.log("errrr");
          console.error(error)
          return process.exit(1)
        } else {
          console.log('SPDY Listening on port: ' + 8080 + '.')

          if (process.send) {
              process.send('online');
          }
        }
    });

    // set up plain http server
    var http = express();

    // set up a route to redirect http to https
    http.get('*', function(req, res) {
        res.redirect('https://' + req.headers.host + req.url);

        // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
        // res.redirect('https://example.com' + req.url);
    })

    // have it listen on 8080
    http.listen(8000);
}
