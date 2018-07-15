module.exports = function(vorpal, projectConfig){
    return vorpal
        .command("server start", "Start local server" )
        .alias("serve")
        .option("--lambda", "Build all Lambda functions and simulate AWS Lambda environment")
        .option("--hot-reload", "Run with hot reload")
        .option("--port", "Custom server port")
        .option("--prod", "--production", "Run production server (not applicable if --lambda flag is present)")
        .option("--inline-css", "Inline CSS into HTML instead of servin it in separate file")
        .action(( args, cb ) => {
            require("../../lib/server-start")(
                projectConfig,
                args.options
            );

            // invokes command code in module providing vorpal and arguments, supporting promise as result
            Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
        })
        .on("error", function(err){
            console.log(err);
        });
};
