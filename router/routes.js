const path = require("path");
const fs = require("fs");

require("./../node_modules/@awly/marko/node-require").install();

module.exports = function(req, res, next, cwd, lasso, urlPath, localEndpoint, pageHasChanges, inlineCSS){
    const router = require("express-promise-router")();

    router.use((req, res, next) => {
        return new Promise((resolve, reject) => {
            compilePage(urlPath, localEndpoint, cwd, router, lasso, pageHasChanges, inlineCSS)
                .then(lassoResponse => {
                    router.get("/", (req, res) => {
                        res.setHeader("Content-Type", "text/html; charset=utf-8");
                        lassoResponse.template.render({
                            $global:{
                                injectCSS: lassoResponse.css,
                                injectJS: lassoResponse.js,
                                request: req,
                                response: res
                            }
                        }).then(data => {
                            res.send(data.out.stream.str);
                        }).catch(err => {
                            compilePage("/", "web/src/pages/error", __dirname, router, lasso, true, true).then(errorLassoResponse => {
                                errorLassoResponse.template.render({
                                    $global:{
                                        injectCSS: errorLassoResponse.css,
                                        injectJS: errorLassoResponse.js,
                                        error: err.toString(),
                                        request: req,
                                        response: res
                                    }
                                }).then(data => {
                                    res.send(data.out.stream.str);
                                });
                            });
                        });
                    });
                    resolve("next");
                });
        });
    });

    return router(req, res, next);
};

function compilePage(urlPath, filePath, cwd, router, lasso, rebuildPage, inlineCSS){
    return new Promise((resolve, reject) => {
        console.log("RELOAD PAGE:", urlPath, "->", filePath, !rebuildPage ? " (from cache)" : "");

        if(rebuildPage){
            delete require.cache[path.resolve(cwd, filePath, "index.marko")];
            delete require.cache[path.resolve(cwd, filePath, "index.marko.js")];
        }

        setTimeout(() => { // should wait a bit after invalidating cache - weird but it works
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
                let css = null;

                if (inlineCSS) {
                    css = "<style>";

                    lassoPageResult.files.forEach((file) => {
                        if(file.contentType == "css"){
                            css += fs.readFileSync(file.path, "utf8");
                        }
                    });

                    css += "</style>";
                } else {
                    css = lassoPageResult.getHeadHtml();
                }

                resolve({
                    template: template,
                    js: js,
                    css: css
                });
            });
        }, 100);
    });
}
