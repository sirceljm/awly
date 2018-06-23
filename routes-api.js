const fs = require("fs");
const path = require("path");
require("./node_modules/marko/node-require").install();

module.exports = function(req, res, next, cwd, urlPath, localEndpoint, pageHasChanges){
    const router = require("express-promise-router")();

    router.use((req, res, next) => {
        return new Promise((resolve, reject) => {
            require(path.resolve(cwd, "src", localEndpoint))(req, res);

            resolve("next");
        });
    });

    return router(req, res, next);
};
