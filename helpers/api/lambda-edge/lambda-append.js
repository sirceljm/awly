
const zlib = require('zlib');

exports.handler = function(event, context, callback) {
    timer('handler');
    var wait = new Promise(function(resolve, reject){ // wait for event.Records // TODO figure out what is really going on
        resolve();
    });

    wait.then(function(){

        let request = null;
        if(event.Records && event.Records[0] && event.Records[0].cf){ // Lambda@Edge
            request = event.Records[0].cf.request;
        }else{ // Lambda
            request = event;
        }

        let requestparams = {};

        if(request.body){ // Lambda@Edge
            requestparams = JSON.parse(request.body);
        }else if(request.querystring){ // Lambda
            requestparams = qs.parse(request.querystring);
        }

        context.callbackWaitsForEmptyEventLoop = false;
        var run = new Promise(promiseFn(requestparams));

        run.then((result) => {
            let compression = __gzip ? detectCompression(request) : null;

            times.push('handler_'+timerEnd('handler'));

            // let response = {
            //     statusCode: 200,
            //     headers: {
            //         "x-custom-header" : "my custom header value"
            //     },
            //     body: JSON.stringify(result)
            // }

            let response = {
                status: '200',
                statusDescription: 'HTTP OK',
                httpVersion: request.httpVersion,
                body: compressBody(JSON.stringify(result), compression),
                bodyEncoding: compression ? 'base64' : 'text',
                headers: {
                    'vary': [{ 'key': 'Vary', 'value': '*' }],
                    'content-type': [{ 'key': 'Content-Type', 'value': 'application/json; charset=UTF-8' }],
                    'content-encoding': [{ 'key': 'Content-Encoding', 'value': compression || 'identity' }],
                    'cache-control': [{ 'key': 'Cache-Control', 'value': 'public' }],
                    'timings': [{ 'key': 'Timings', 'value': JSON.stringify(times) }]
                },
            };

            callback(null, response);
            times = [];
        });
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
    if (compression === 'gzip') {
        return zlib.gzipSync(body).toString('base64');
    } else {
        return body;  // no compression
    }
}

exports.handler();
