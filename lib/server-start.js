const path = require('path');
const fs = require('fs');

module.exports = serverStart;

function serverStart(projectConfig, options){
    const cwd = projectConfig.cwd;
    const awlyCliDir = projectConfig.awlyCliDir; // your awly cli dir

    const markoExpress = require(path.resolve(awlyCliDir, './node_modules/marko/express'));
    require(path.resolve(awlyCliDir, './node_modules/marko/node-require')).install();
    require(path.resolve(awlyCliDir, './node_modules/marko/hot-reload')).enable({ silent: true });

    const lasso = require('lasso');

    require('app-module-path').addPath(cwd);
    require('app-module-path').addPath(path.resolve(cwd, './node_modules'));

    require('dotenv').config({
        path: path.resolve(cwd, './.env')
    });

    const bodyParser = require('body-parser');
    const graphqlExpress = require(path.resolve(cwd, './node_modules/graphql-server-express'));
    require("inline-svg-register");

    const localDynamo = require('local-dynamo');

    console.log('DynamoDB port: ', process.env.DYNAMODB_PORT);
    localDynamo.launch({
        port: process.env.DYNAMODB_PORT,
        sharedDb: true,
        dir: './data/dynamodb'
    });

    var express = require('express');
    const router = express.Router();

    const spdy = require('spdy');
    var compression = require('compression'); // Provides gzip compression for the HTTP response

    var isProduction = options.prod || false;
    // var isProduction = true;

    // Configure lasso to control how JS/CSS/etc. is delivered to the browser
    lasso.configure({
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
    app.use(markoExpress());

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

    let pageHasChanges = false;
    pagePath = '/';
    app.use(pagePath, function (req, res, next) {
        if(req.path === pagePath){
            console.log('--------------------------------------');
            require(path.resolve(awlyCliDir, 'routes'))(req, res, next, cwd, lasso, '/', pageHasChanges);
            pageHasChanges = false;
        }else{
            // console.log(req.path);
            router(req, res, next);
        }
    });

    var viewsDir = path.resolve(cwd, 'src');

    function addApi(urlPath, filePath){
        app.get('/'+urlPath, function(req, res) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.send(JSON.stringify(req.query, null, 2));
        });
    }

    app.disable('view cache');

    const certs = {
        key: fs.readFileSync(path.resolve(cwd, './certs/privkey.pem')),
        cert:  fs.readFileSync(path.resolve(cwd, './certs/fullchain.pem'))
    }

    var longpoll = require("express-longpoll")(app)
    var longpollWithDebug = require("express-longpoll")(app, { DEBUG: true });
    process.env.MARKO_DEBUG = true;

    // Creates app.get("/poll") for the long poll
    longpoll.create("/__hotReload");

    const server = spdy
      .createServer(certs, app)
      .listen(8080, (error) => {
        if (error) {
          console.error(error)
          return process.exit(1)
        } else {
          console.log('HTTPS server listening on port: ' + 8080 + '.')

          var hotReload = true; // TODO
          if(!isProduction && hotReload === true){
              startHotReloadListening();
          }

          if (process.send) {
              console.log('SEND');
              process.send('online');
          }
        }
    });


    function startHotReloadListening(){
        var chokidar = require('chokidar');

        chokidar.watch(viewsDir, {ignored: /(^|[\/\\])\../}).on('all', (event, filePath) => {
          if (/\.marko$/.test(filePath)) {
            //   Object.keys(require.cache).forEach((p) => {
            //       if(/navigation/.test(p)){
            //           console.log('AAAAAAAAA', p);
            //           delete require.cache['/home/matej/Desktop/awly.io/src/components/own/t2-specific/navigation/index.marko'];
            //       }
            //   });

              require(path.resolve(awlyCliDir, './node_modules/marko/hot-reload')).handleFileModified(filePath, {silent: true});

              // TODO get all pages that use the component & invalidate caches
              // TODO make this logic in seperate utils function

              delete require.cache['/home/matej/Desktop/awly-cli/routes.js'];



              pageHasChanges = true;

              longpoll.publish("/__hotReload", Date.now());
          }
        });
    }

    // set up plain http server
    var http = express();

    // set up a route to redirect http to https
    http.get('*', function(req, res) {
        console.log('http');
        res.redirect('https://' + req.headers.host + req.url);

        // Or, if you don't want to automatically detect the domain name
        // from the request header, you can hard code it:
        // res.redirect('https://example.com' + req.url);
    })

    // have it listen on 8080
    http.listen(8000);
}
