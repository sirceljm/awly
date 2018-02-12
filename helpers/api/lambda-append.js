};};

var zlib = require('zlib');

exports.handler = function(event, context, callback) {
    var wait = new Promise(function(resolve, reject){ // wait for event.Records // TODO figure out what is really going on
        resolve();
    });

    wait.then(function(){
        const request = event.Records[0].cf.request;

        var run = new Promise(promiseFn(request));

        run.then((result) => {
            let compression = __gzip ? detectCompression(c) : null;

            const response = {
                status: '200',
                statusDescription: 'HTTP OK',
                httpVersion: request.httpVersion,
                body: compressBody(JSON.stringify(result), compression),
                bodyEncoding: compression ? 'base64' : 'text',
                headers: {
                    'vary': [{ 'key': 'Vary', 'value': '*' }],
                    'content-type': [{ 'key': 'Content-Type', 'value': 'application/json; charset=UTF-8' }],
                    'content-encoding': [{ 'key': 'Content-Encoding', 'value': compression || 'identity' }],
                    'cache-control': [{ 'key': 'Cache-Control', 'value': 'public' }]
                },
            };
            callback(null, response);
        });
    });
};

let supportedCompression = ['gzip'];

function detectCompression(request) {
    const accept = request.headers['accept-encoding'] || request.headers['Accept-Encoding'] || [];
    if(accept.length === 0){
        return null;
    }

    const acceptedEncodings = accept[0].value.split(',').map(el => el.trim());
    for(var i = 0; i < acceptedEncodings.length; i++) {
        if (supportedCompression.indexOf(acceptedEncodings[i]) !== -1) {
            return acceptedEncodings[i];  // return the first match
        }
    }
    return null;
}

function compressBody(body, compression) {
    if (compression === 'gzip') {
        return zlib.gzipSync(body).toString('base64');
    } else {
        return body;  // no compression
    }
}

exports.handler();
