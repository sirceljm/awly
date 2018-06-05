var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, projectConfig){
    return vorpal
        .command("page-deploy [page]", "Deploy page to AWS" )
        .option("--no-gzip", "Do not compress lambda output")
        .option("--edge", "Deploy a lambda@edge function")
        .option("--region", "Deploy to a specific region - does not apply to lambda@edge")
        .option("--lambda-name <name>", "Provide a custom name for your lambda")
        .option("--path <path>", "Provide a custom path for your lambda by default it equals lambda name")
        .alias("pd")
        .action(( args, cb ) => {
            try{
                projectConfig.credentials = require(projectConfig.credentials_path);
            } catch(err){
                if(err.code == "MODULE_NOT_FOUND"){
                    console.log("Credentials file at " + projectConfig.credentials_path + " could not be found. Exiting.");
                    console.log("Please change the \"credentials_path\" in " + path.resolve(projectConfig.cwd, "./project-config/main.config.js"));
                    console.log("Exiting.");
                    return;
                }
            }

            if(args.options.edge){
                require("../../lib/deploy-page-edge")(
                    path.join(
                        projectConfig.cwd,
                        "src/pages",
                        args.page,
                        "index.marko"
                    ),
                    projectConfig,
                    args.page,
                    args.options
                );
            }else{
                require("../../lib/deploy-page")(
                    path.join(
                        projectConfig.cwd,
                        "src/pages",
                        args.page,
                        "index.marko"
                    ),
                    projectConfig,
                    args.page,
                    args.options
                );
            }

            // invokes command code in module providing vorpal and arguments, supporting promise as result
            Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
        })
        .on("error", function(err){
            console.log(err);
        });
};
