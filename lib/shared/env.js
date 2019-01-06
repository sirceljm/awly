const ShellJS = require("shelljs");
const path = require("path");

module.exports = (function(){
    const cwd = ShellJS.pwd().toString();
    const awlyCliDir = path.resolve(__filename, "../../../");

    require("app-module-path").addPath(cwd);
    require("app-module-path").addPath(awlyCliDir);

    require("dotenv").config({
        path: path.resolve(awlyCliDir, ".env")
    });

    const awlyModulesPath = process.env.AWLY_MODULES_PATH || "@awly/";

    require("app-module-path").addPath(path.resolve(awlyCliDir, "./node_modules"));
    require("app-module-path").addPath(path.resolve(awlyCliDir, "./node_modules/", awlyModulesPath));

    const awsConfig = {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_SECRET_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY
    };

    return { cwd, awlyCliDir, awlyModulesPath, awsConfig };
})();
