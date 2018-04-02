
exports.handler = function(event, context, callback) {
    var run = new Promise(promiseFn);

    run.then((html) => {
        callback(null, html);
    });
};

exports.handler();
