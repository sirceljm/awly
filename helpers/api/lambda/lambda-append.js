
const zlib = require("zlib");

exports.handler = function(event, context, callback) {
    var wait = new Promise((resolve, reject) => { // wait for event.Records // TODO figure out what is really going on
        resolve();
    });

    wait.then(() => {
        let request = {
            body: JSON.parse(event.body)
        }

        if(context){
            context.callbackWaitsForEmptyEventLoop = false;
        }

        var run = promiseFn(request);

        run.then((result) => {
            const response = {
                isBase64Encoded: "false",
                // status: "200",
                // statusDescription: 'HTTP OK',
                statusCode: result.statusCode || 200,
                httpVersion: request.httpVersion,
                body: JSON.stringify(result.body), // compressBody(html, compression),
                // bodyEncoding: "text",
                headers: result.headers
                // {
                //     'vary': [{ 'key': 'Vary', 'value': '*' }],
                //     'content-type': [{ 'key': 'Content-Type', 'value': 'text/html; charset=UTF-8' }],
                //     'content-encoding': [{ 'key': 'Content-Encoding', 'value': compression || 'identity' }],
                //     'cache-control': [{ 'key': 'Cache-Control', 'value': 'public, max-age=30' }],
                //     'timings': [{ 'key': 'Timings', 'value': JSON.stringify(times) }]
                // },
            };

            callback(null, response);
        }).catch((err) => {
            console.log("ERROR", err);
            callback(null, err);
        });
    });
};

let supportedCompression = ["gzip"];

function detectCompression(request) {
    request = request || { headers: {} };
    request.headers = request.headers || {};

    const accept = request.headers["accept-encoding"] || request.headers["Accept-Encoding"] || [];
    if(accept.length === 0){
        return null;
    }

    let encodings = [];
    if(accept[0] && accept[0].value){ // Lambda@Edge - request from cloudfront
        encodings = accept[0].value.split(",");
    }else{ // Lambda - request from API Gateway
        encodings = accept.split(",");
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
    if (compression === "gzip") {
        return zlib.gzipSync(body).toString("base64");
    } else {
        return body;  // no compression
    }
}

exports.handler();
