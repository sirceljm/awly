const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

module.exports = serverStart;

function serverStart(projectConfig, options){
    const cwd = projectConfig.cwd; // AWLY PROJECT DIR
    const awlyCliDir = projectConfig.awlyCliDir; // AWLY CLI DIR
    const utils = require(path.resolve(awlyCliDir, './lib/utils.js'));

    const markoInfo = require(path.resolve(awlyCliDir, './node_modules/marko/package.json'));

    const markoExpress = require(path.resolve(awlyCliDir, './node_modules/marko/express'));
    require(path.resolve(awlyCliDir, './node_modules/marko/node-require')).install();
    require(path.resolve(awlyCliDir, './node_modules/marko/hot-reload')).enable({ silent: true });

    const lasso = require(path.resolve(awlyCliDir, './node_modules/lasso'));
    const lassoForCLI = require(path.resolve(awlyCliDir, './node_modules/lasso'));

    // require('app-module-path').addPath(cwd);
    require('app-module-path').addPath(awlyCliDir);
    require('app-module-path').addPath(path.resolve(awlyCliDir, './node_modules'));

    // require('dotenv').config({
    //     path: path.resolve(cwd, './.env')
    // });

    // console.log(process.env);
    // console.log(projectConfig);

    const bodyParser = require('body-parser');
    const graphqlExpress = require(path.resolve(cwd, './node_modules/graphql-server-express'));
    // require("inline-svg-register");

    // RUN DYNAMODB LOCAL SERVER
    const localDynamo = require('local-dynamo');
    console.log('DynamoDB is running on port: ', projectConfig.DYNAMODB_PORT);
    localDynamo.launch({
        port: projectConfig.DYNAMODB_PORT,
        sharedDb: true,
        dir: './data/dynamodb'
    });

    // RUN DYNAMODB ADMIN GUI
    process.env.DYNAMO_ENDPOINT = 'http://localhost:' + projectConfig.DYNAMODB_PORT;
    console.log('DynamoDB Admin GUI is running on port: ', projectConfig.DYNAMODB_ADMIN_PORT);
    var dynamoDBAdminGUIServerPath = path.resolve(awlyCliDir, './node_modules/dynamodb-admin/index.js');
    const dynamoDBAdminGUI = child_process.fork(dynamoDBAdminGUIServerPath); // TODO import with require

    // , (ret) => {
    //   console.log('DDBA', ret);
    // });

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

    lassoForCLI.configure({
        plugins: [
            'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
            'lasso-less',
            'lasso-sass'
        ],
        resolveCssUrls: true,
        outputDir: path.resolve(awlyCliDir, './static'), // Place all generated JS/CSS/etc. files into the "static" dir,
        bundlingEnabled: false, // Only enable bundling in production
        minify: false, // Only minify JS and CSS code in production
        fingerprintsEnabled: false, // Only add fingerprints to URLs in production,
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
        }
    });

    // RUN AWLY SERVERS
    var app = express();

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

    const pages = require(path.resolve(cwd, './project-config/routing.js'));
    const paths = Object.keys(pages);

    paths.forEach((path) => {
      let page = pages[path];
      routePage(path, page.localEndpoint);
    });

    function routePage(pagePath, localEndpoint) {
        app.use(pagePath, function (req, res, next) {
            if(req.originalUrl === pagePath){
                require(path.resolve(awlyCliDir, 'routes'))(req, res, next, cwd, lasso, pagePath, localEndpoint, pageHasChanges);
                pageHasChanges = false;
            }else{
                router(req, res, next);
            }
        });
    }


    app.use('/__awly/awly-assets', express.static(path.resolve(awlyCliDir, 'web/assets')));

    utils.getProjectStructure(path.resolve(cwd, './src/pages')).then((projectStructure) => {
      // console.log('CHILD CONNECTIONS',  JSON.stringify(projectStructure.childConnections, undefined, 4));
      // console.log('PARENT CONNECTIONS', JSON.stringify(projectStructure.parentConnections, undefined, 4));

      let lassoPageOptions = {
          name: '/__map',
          dependencies: [
              "require-run: web/src/pages/map",
          ]
      }

      lassoForCLI.lassoPage(lassoPageOptions).then(function(lassoPageResult) {
          let js = lassoPageResult.getBodyHtml();
          // TODO make user choose
          let css = "<style>";

          lassoPageResult.files.forEach((file) => {
              if(file.contentType == 'css'){
                  css += fs.readFileSync(file.path, 'utf8');
              }
          });

          css += "</style>";

          // css = lassoPageResult.getHeadHtml();
          var template = require(path.resolve(awlyCliDir, 'web/src/pages/map'));

          app.get('/__awly', function (req, res) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.marko(template, {
                $global:{
                    injectCSS: css,
                    injectJS: js,
                    data: {
                      childConnections: projectStructure.childConnections,
                      parentConnections: projectStructure.parentConnections
                    }
                }
            });
          });
      });
    });

    var viewsDir = path.resolve(cwd, 'src');

    // TODO hot reload APIs as well
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

    var longpoll = require("express-longpoll")(app);
    var longpollWithDebug = require("express-longpoll")(app, { DEBUG: true });

    // Creates app.get("/poll") for the long poll
    longpoll.create("/__hotReload");

    const server = spdy
      .createServer(certs, app)
      .listen(projectConfig.HTTPS_PORT, (error) => {
        if (error) {
          console.error(error)
          return process.exit(1)
        } else {
          console.log('HTTPS server listening on port: ' + projectConfig.HTTPS_PORT + '.');
          console.log('MarkoJS version: ' + markoInfo.version);

          var hotReload = true; // TODO from arguments
          if(!isProduction && hotReload === true){
              // startHotReloadListening();
          }

          if (process.send) {
              process.send('online');
          }
        }
    });


    function startHotReloadListening(){
        var chokidar = require('chokidar');

        chokidar.watch(viewsDir, {ignored: /(^|[\/\\])\../}).on('all', (event, filePath) => {
          if (/\.marko$/.test(filePath)) {
              // Object.keys(require.cache).forEach((p) => {
              //     if(/navigation/.test(p)){
              //         console.log('AAAAAAAAA', p);
              //         delete require.cache['/home/matej/Desktop/awly.io/src/components/own/t2-specific/navigation/index.marko'];
              //     }
              // });

              require(path.resolve(awlyCliDir, './node_modules/marko/hot-reload')).handleFileModified(filePath, {silent: true});

              // TODO get all pages that use the component & invalidate caches
              // TODO make this logic in seperate utils function

              delete require.cache['/home/matej/Desktop/awly-cli/routes.js'];

              pageHasChanges = true;

              longpoll.publish("/__hotReload", Date.now());
          }
        });
    }

    // TODO if selected
    var http = express();

    // REDIRECT HTTP TO HTTPS
    http.get('*', function(req, res) {
        console.log('http');
        res.redirect('https://' + req.headers.host + req.url);
    })
    http.listen(projectConfig.HTTP_PORT);
}
