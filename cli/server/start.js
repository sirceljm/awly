var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, projectConfig){
    return vorpal
    	.command( "server start", "Start local server" )
        .option('--lambda', 'Build all Lambda functions and simulate AWS Lambda environment')
        .option('--hot-reload', 'Run with hot reload')
        .option('--port', 'Custom server port')
        .option('--prod', '--production', 'Run production server (not applicable if --lambda flag is present)')
    	.action( function( args, cb ) {
            serverStart(
                projectConfig,
                args.options
            );

    		// invokes command code in module providing vorpal and arguments, supporting promise as result
    		Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
    	} )
        .on('error', function(err){
            console.log(err);
        });
}


function serverStart(projectConfig, options){
    const cwd = projectConfig.cwd;

    require('app-module-path').addPath(cwd);
    require('app-module-path').addPath(path.resolve(cwd, './node_modules'));

    require('dotenv').config({
        path: path.resolve(cwd, './.env')
    });

    require('marko/express');
    require('marko/node-require').install();

    var lasso = require('lasso');

    const bodyParser = require('body-parser');
    // const localDynamo = require('local-dynamo');
    //
    // console.log(process.env);
    //
    // localDynamo.launch({
    //     port: process.env.DYNAMODB_PORT,
    //     sharedDb: true,
    //     dir: './data/dynamodb'
    // });

    var dynalite = require('dynalite');
    let dynaliteServer = dynalite({path: './data/dynalite', createTableMs: 50});

    dynaliteServer.listen(
        process.env.DYNAMODB_PORT, function(err) {
      if (err) throw err
      console.log('Dynalite started on port: ' + process.env.DYNAMODB_PORT);
    })

    var express = require('express');
    const spdy = require('spdy');
    var compression = require('compression'); // Provides gzip compression for the HTTP response

    var isProduction = options.prod;
    isProduction = false;

    // Configure lasso to control how JS/CSS/etc. is delivered to the browser
    lasso.configure({
        plugins: [
            'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
            'lasso-less',
            'lasso-sass',
            {
                plugin: 'lasso-inline-slots',
                config: {
                    inlineSlots: [
                        'inline-css'
                    ]
                }
            }
        ],
        resolveCssUrls: true,
        outputDir: path.resolve(cwd, './static'), // Place all generated JS/CSS/etc. files into the "static" dir
        bundlingEnabled: isProduction, // Only enable bundling in production
        minify: isProduction, // Only minify JS and CSS code in production
        fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
    });


    var app = express();

    var port = process.env.PORT || 8080;

    // Enable gzip compression for all HTTP responses
    app.use(compression());

    // var schema = require('./src/services/graphql/schema.js');
    // console.log(schema);

    // app.use('/graphql', bodyParser.json(), graphqlExpress.graphqlExpress({ schema: schema }));
    //
    // app.use('/graphiql', graphqlExpress.graphiqlExpress({
    //     endpointURL: '/graphql',
    // }));

    // Allow all of the generated files under "static" to be served up by Express
    app.use(require('lasso/middleware').serveStatic());

    require(path.resolve(cwd, './src/services/routes'))(app);

    express.static.mime.define({'text/javascript': ['js']});

    app.use('/assets', express.static(path.resolve(cwd, './assets')));

    addPage('', path.resolve(cwd, './src/pages/home'));
    addPage('posts', path.resolve(cwd, './src/pages/posts'));

    function addPage(urlPath, filePath){
        var template = require(filePath);

        lasso.lassoPage({
            name: urlPath || 'index',
            dependencies: [
                "require-run: ./src/pages/home",
            ]
        }, function(err, lassoPageResult) {
            if (err) throw err;

            let css = "<style>";

            lassoPageResult.files.forEach((file) => {
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
    app.disable('view cache');

    if (options.hotReload) {
        var viewsDir = path.reload(cwd, './src');

        // Enable hot reloading in development
        require('marko/hot-reload').enable();

        require('fs').watch(viewsDir, function (event, filename) {
            if (/\.marko$/.test(filename)) {
                // Resolve the filename to a full template path:
                var templatePath = path.join(viewsDir, filename);

                console.log('Marko template modified: ', templatePath);

                // Pass along the *full* template path to marko
                require('marko/hot-reload').handleFileModified(templatePath);
            }
        });
    }

    spdy
      .createServer({
          key: fs.readFileSync(path.resolve(cwd, './certs/privkey.pem')),
          cert:  fs.readFileSync(path.resolve(cwd, './certs/fullchain.pem'))
      }, app)
      .listen(port, (error) => {
        if (error) {
            console.log("errrr");
          console.error(error)
          return process.exit(1)
        } else {
          console.log('HTTPS server is running on port: ' + port + '. -> https://localhost:'+port);

          if (process.send) {
              process.send('online');
          }
        }
    });

    // set up plain http server
    // var http = express();
    //
    // // set up a route to redirect http to https
    // http.get('*', function(req, res) {
    //     res.redirect('https://' + req.headers.host + req.url);
    //
    //     // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
    //     // res.redirect('https://example.com' + req.url);
    // })
    //
    // // have it listen on 8080
    // http.listen(80);
    // console.log('HTTP server is running on port: ' + port + '.')

}

// process.on('exit', (code) => {
//   console.log(`About to exit with code: ${code}`);
//   dynaliteServer.close();
// });
