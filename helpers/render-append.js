

var createOut = require('marko/src/runtime/createOut');

function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
    try {
        renderFunc(finalData, finalOut);

        if (shouldEnd) {
            finalOut.end();
        }
    } catch(err) {
        var actualEnd = finalOut.end;
        finalOut.end = function() {};

        setTimeout(function() {
            finalOut.end = actualEnd;
            finalOut.error(err);
        }, 0);
    }
    return finalOut;
}

function renderToString(template, data, callback) {
    var localData = data || {};
    var render = template._;
    var globalData = localData.$global;

    var out = createOut(globalData);

    out.global.template = template;

    if (globalData) {
        localData.$global = undefined;
    }

    out.on('finish', function () {
        callback(null, out.toString(), out);
    }).once('error', function(err){
        console.log(err);
    });

    return safeRender(render, localData, out, true);
}

renderToString(marko_template, {}, function(res, html, out) {
    resolve(html);
});
