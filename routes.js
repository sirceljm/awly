const fs = require("fs");
const path = require("path");
require("./node_modules/marko/node-require").install();

module.exports = function(req, res, next, cwd, lasso, urlPath, localEndpoint, pageHasChanges){
    const router = require("express-promise-router")();

    router.use((req, res, next) => {
        return new Promise((resolve, reject) => {
            renderPage(urlPath, localEndpoint, cwd, router, lasso, pageHasChanges)
                .then((lassoResponse) => {
                    router.get("/", function(req, res) {
                        res.setHeader("Content-Type", "text/html; charset=utf-8");
                        res.marko(lassoResponse.template, {
                            $global:{
                                injectCSS: lassoResponse.css,
                                injectJS: lassoResponse.js
                            }
                        });
                    });

                    resolve("next");
                });
        });
    });

    return router(req, res, next);
};

function renderPage(urlPath, filePath, cwd, router, lasso, rebuildPage){
    return new Promise((resolve, reject) => {
        console.log("RELOAD PAGE:", urlPath, "->", filePath, !rebuildPage ? " (from cache)" : "");

        if(rebuildPage){
            delete require.cache[path.resolve(cwd, filePath, "index.marko")];
            delete require.cache[path.resolve(cwd, filePath, "index.marko.js")];
        }

        var template = require(path.resolve(cwd, filePath, "index.marko"));

        let lassoPageOptions = {
            name: (urlPath !== "/" ? urlPath : "index"),
            dependencies: [
                "require-run: " + filePath,
            ]
        };

        // this makes lasso rebuild if there are updates to the page
        if(rebuildPage){
            lassoPageOptions.cacheKey = Date.now()+"";
        }

        lasso.lassoPage(lassoPageOptions).then(function(lassoPageResult) {
            let js = lassoPageResult.getBodyHtml();
            let cssFile = lassoPageResult.getHeadHtml();

            // TODO make user choose
            let css = "<style>";

            lassoPageResult.files.forEach((file) => {
                if(file.contentType == "css"){
                    css += fs.readFileSync(file.path, "utf8");
                }
            });

            css += "</style>";

            // css = lassoPageResult.getHeadHtml();
            resolve({
                template: template,
                js: js,
                css: cssFile
            });
        });
    });
}
