const path = require("path");
require("@awly/marko/node-require").install();

module.exports = function(req, res, next, cwd, urlPath, localEndpoint, pageHasChanges){
    const router = require("express-promise-router")();

    router.use((req, res, next) => {
        return new Promise((resolve, reject) => {
            require(path.resolve(cwd, localEndpoint))(req, res).then((response) => {
                for(let header in response.headers){
                    res.header(header, response.headers[header]);
                }

                res.send(response.body);
                resolve("next");
            });
        });
    });

    return router(req, res, next);
};
