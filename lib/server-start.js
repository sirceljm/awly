global.__base = __dirname + '/';

require('app-module-path').addPath(__dirname);
// require('require-webpack-compat')(module, require);
console.log(require.context);

require('dotenv').config();

const path = require('path');
const fs = require('fs');

require('marko/express');
require('marko/node-require').install();
require("inline-svg-register");

var lasso = require('lasso');

const bodyParser = require('body-parser');
// const graphqlExpress = require('graphql-server-express');

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
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
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

require('src/services/routes')(app);

express.static.mime.define({'text/javascript': ['js']});

app.use('/assets', express.static('./assets'));

// Map the "/" route to the home page
addPage('', './src/pages/home');

function addPage(urlPath, filePath){
    var template = require(filePath);

    lasso.lassoPage({
        name: urlPath || 'index',
        dependencies: [
            "require-run: "+filePath,
        ]
    }, function(err, lassoPageResult) {
        if (err) throw err;

        let css = "<style>";

        lassoPageResult.files.forEach((file) => {
            console.log(file);
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

const options = {
    key: fs.readFileSync(__dirname + '/certs/privkey.pem'),
    cert:  fs.readFileSync(__dirname + '/certs/fullchain.pem')
}


var viewsDir = path.join(__dirname, 'src');

if (isProduction !== 'production') {
    // Enable hot reloading in development
    require('marko/hot-reload').enable();

    require('fs').watch(viewsDir, function (event, filename) {
        if (/\.marko$/.test(filename)) {
            // Resolve the filename to a full template path:
            var templatePath = path.join(viewsDir, filename);

            console.log('Marko template modified: ', templatePath);

            // Pass along the *full* template path to marko
            // require('marko/hot-reload').handleFileModified(templatePath);
        }
    });
}

spdy
  .createServer(options, app)
  .listen(443, (error) => {
    if (error) {
        console.log("errrr");
      console.error(error)
      return process.exit(1)
    } else {
      console.log('SPDY Listening on port: ' + port + '.')

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
http.listen(80);
