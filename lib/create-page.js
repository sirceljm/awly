var fs = require("fs");
var path = require("path");

module.exports = runSequence;

function runSequence(projectConfig, page, url, options){
    const cwd = projectConfig.cwd; // current working dir - your awly project dir
    const awlyCliDir = projectConfig.awlyCliDir; // your awly cli dir

    const pageDir = path.resolve(cwd, "./src/pages", page);
    const pagePath = path.resolve(cwd, "./src/pages", page, "index.marko");

    let templatePath;
    if (options.template) {
        templatePath = path.resolve(awlyCliDir, "./templates/pages", options.template, "index.marko");
    } else {
        templatePath = path.resolve(awlyCliDir, "./templates/pages/default/index.marko");
    }

    console.log("CREATING PAGE: ", pageDir);

    if (fs.existsSync(pagePath)) {
        console.log("Page already exists - ABORTING");
    } else { // CREATE PAGE
        if(fs.existsSync(pagePath)){
            console.log("Page template: " + templatePath + " doesn't exist - ABORTING");
        } else {
            console.log("Created new page: " + pagePath + " from template: " + templatePath + "");
            if(!fs.existsSync(pageDir)){
                fs.mkdirSync(pageDir);
            }

            fs.createReadStream(templatePath).pipe(fs.createWriteStream(pagePath));
        }
    }

    const routingFilePath = path.resolve(cwd, "./project-config/routing.js");
    let routes = require(routingFilePath);

    if (!routes["/" + page]) {
        routes["/" + page] = {
            type: "lambda",
            localEndpoint: "src/pages/" + (url ? url : page)
        };
    } else {
        console.log("Page record already exists - ABORTING");
    }

    routes = sortObjKeysAlphabetically(routes);

    fs.writeFileSync(routingFilePath, returnRoutesFileContents(JSON.stringify(routes, null, 4)), "utf8", function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

function sortObjKeysAlphabetically(obj) {
    var ordered = {};
    Object.keys(obj).sort().forEach(function(key) {
        ordered[key] = obj[key];
    });
    return ordered;
}

function returnRoutesFileContents (routesObjStr){
    return `module.exports = ${routesObjStr};`;
}
