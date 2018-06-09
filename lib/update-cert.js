const path = require("path");
require("app-module-path").addPath(path.dirname(require.main.filename));

const fs = require("fs");

const awlyUtils = require("lib/utils.js");

module.exports = runSequence;

function runSequence(projectConfig, page, url, options){
    const cwd = projectConfig.cwd; // current working dir - your awly project dir

    const newCert = awlyUtils.generateLocalhostCert();

    fs.writeFileSync(path.resolve(cwd, "./certs/cert.pem"), newCert.cert);
    fs.writeFileSync(path.resolve(cwd, "./certs/privkey.pem"), newCert.key);

    console.log("Localhost certificates were updated");
}
