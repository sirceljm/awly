var path = require("path");

module.exports = function(vorpal, projectConfig){
    return vorpal
        .command("page-deploy <page>", "Deploy page to AWS" )
        .option("--no-gzip", "Do not compress lambda output")
        .option("--no-min", "Do not minify lambda code")
        .option("--analyze", "Analyze built lambda after completion")
        .option("--dry-run", "Only build lambda, do not deploy")
        //.option("--edge", "Deploy a lambda@edge function")
        .option("--region", "Deploy to a specific region") // TODO add - does not apply to lambda@edge if labda@edge deploy is available
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
                    projectConfig,
                    args.page,
                    args.options
                );
            }else{
                require("../../lib/deploy-page")(
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
