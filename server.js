require('app-module-path').addPath(__dirname);
require('dotenv').config();

const Promise = require('bluebird');

require('marko/express');
require('marko/node-require');

var lasso = require('lasso');

const bodyParser = require('body-parser');
// const graphqlExpress = require('graphql-server-express');

const localDynamo = require('local-dynamo');
localDynamo.launch(null, process.env.DYNAMODB_PORT);

var express = require('express');
var compression = require('compression'); // Provides gzip compression for the HTTP response

var isProduction = process.env.NODE_ENV === 'production';

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
lasso.configure({
    plugins: [
        'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
        'lasso-less'
    ],
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: true , // Only enable bundling in production
    minify: process.env.NODE_ENV , // Only minify JS and CSS code in production
    fingerprintsEnabled: true, // Only add fingerprints to URLs in production
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

// Map the "/" route to the home page
//addPage('/', './src/pages/home/template.marko');
addPage('/posts', './src/pages/posts/');
function addPage(urlPath, filePath){
    var template = require(filePath);

    lasso.lassoPage({
        name: 'bundle',
        dependencies: [
            "require-run: "+filePath
        ]
    }, function(err, lassoPageResult) {
        if (err) throw err;

        app.get(urlPath, function(req, res) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.marko(template, {injectCSS: lassoPageResult.getHeadHtml(), injectJS:lassoPageResult.getBodyHtml()});
        });
    });
}
app.disable('view cache');
app.listen(port, function(err) {
    if (err) {
        throw err;
    }
    console.log('Listening on port %d', port);

    // The browser-refresh module uses this event to know that the
    // process is ready to serve traffic after the restart
    if (process.send) {
        process.send('online');
    }
});
