
    const zlib = require('zlib');

exports.handler = function(event, context, callback) {
    timer('handler');

    var run = new Promise(promiseFn);

    run.then((html) => {
        const request = event.Records[0].cf.request;
        context.callbackWaitsForEmptyEventLoop = false;

        let compression = __gzip ? detectCompression(request) : null;

        times.push('handler_'+timerEnd('handler'));

        const response = {
            status: '200',
            statusDescription: 'HTTP OK',
            httpVersion: request.httpVersion,
            body: compressBody(html, compression),
            bodyEncoding: compression ? 'base64' : 'text',
            headers: {
                'vary': [{ 'key': 'Vary', 'value': '*' }],
                'content-type': [{ 'key': 'Content-Type', 'value': 'text/html; charset=UTF-8' }],
                'content-encoding': [{ 'key': 'Content-Encoding', 'value': compression || 'identity' }],
                'cache-control': [{ 'key': 'Cache-Control', 'value': 'public, max-age=30' }],
                'timings': [{ 'key': 'Timings', 'value': JSON.stringify(times) }]
            },
        };
        callback(null, response);
        times = [];
    });
};

let supportedCompression = ['gzip'];

function detectCompression(request) {
    const accept = request.headers['accept-encoding'] || request.headers['Accept-Encoding'] || [];
    if(accept.length === 0){
        return null;
    }

    let encodings = [];
    if(accept[0] && accept[0].value){ // Lambda@Edge - request from cloudfront
        encodings = accept[0].value.split(',');
    }else{ // Lambda - request from API Gateway
        encodings = accept.split(',');
    }

    const acceptedEncodings = encodings.map(el => el.trim());
    for(var i = 0; i < acceptedEncodings.length; i++) {
        if (supportedCompression.indexOf(acceptedEncodings[i]) !== -1) {
            return acceptedEncodings[i];  // return the first match
        }
    }
    return null;
}

function compressBody(body, compression) {
    /*if (compression === 'br') {
        return zlib.brSync(body).toString('utf8');
    } else */
    if (compression === 'gzip') {
        return zlib.gzipSync(body).toString('base64');
    } else if (compression === 'deflate') {
        return zlib.deflateSync(body).toString('base64');
    } else {
        return body;  // no compression
    }
}

exports.handler();
