require('app-module-path').addPath(__dirname);
require('marko/express');
require('marko/node-require');

var express = require('express');
var compression = require('compression'); // Provides gzip compression for the HTTP response

var isProduction = process.env.NODE_ENV === 'production';

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
require('lasso').configure({
    plugins: [
        'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
        'lasso-less'
    ],
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: true, // Only enable bundling in production
    minify: true, // Only minify JS and CSS code in production
    fingerprintsEnabled: false, // Only add fingerprints to URLs in production
});


var app = express();

var port = process.env.PORT || 8080;

// Enable gzip compression for all HTTP responses
app.use(compression());

// Allow all of the generated files under "static" to be served up by Express
app.use(require('lasso/middleware').serveStatic());

require('src/services/routes')(app);

// Map the "/" route to the home page
app.get('/', require('./src/pages/home'));

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