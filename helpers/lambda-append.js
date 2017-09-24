

});

var zlib = require('zlib');

exports.handler = function(event, context, callback) {
    run.then((html) => {
        const request = event.Records[0].cf.request;

        const compression = detectCompression(request);

        const response = {
            status: '200',
            statusDescription: 'HTTP OK',
            httpVersion: request.httpVersion,
            body: compressBody(html, compression),
            headers: {
                'vary': [{ 'key': 'Vary', 'value': '*' }],
                'content-type': [{ 'key': 'Content-Type', 'value': 'text/html; charset=UTF-8'}],
                'content-encoding': [{ 'key': 'Content-Encoding', 'value': compression || 'UTF-8' }],
                'cache-control': [{ 'key': 'Cache-Control', 'value': 'public, max-age=30' }]
            },
        };

        callback(null, response);
    });
};

const supportedCompression = ['gzip', 'deflate'];

function detectCompression(request) {
    const accept = request.headers['Accept-Encoding'] || [];
    for(var i = 0; i < accept.length; i++) {
        if (supportedCompression.indexOf(accept[i]) !== -1) {
            return accept[i];  // return the first match
        }
    }
    return null;
}

function compressBody(body, compression) {
    if (compression === 'gzip') {
        return zlib.gzipSync(body).toString('utf8');
    } else if (compression === 'deflate') {
        return zlib.deflateSync(body).toString('utf8');
    } else {
        return body;  // no compression
    }
}