module.exports = function(vorpal, projectConfig){
    return vorpal
        .command("page-create <page> [url]", "Create a new page")
        .option("--template", "Use template to create page - input directory name of the template")
        .alias("pc")
        .action( function( args, cb ) {
            require("../../lib/create-page")(
                projectConfig,
                args.page,
                args.url,
                args.options
            );

            // invokes command code in module providing vorpal and arguments, supporting promise as result
            Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
        })
        .on("error", function(err){
            console.log(err);
        });
};
