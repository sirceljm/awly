module.exports = function(vorpal, projectConfig){
    return vorpal
        .command("server cert-update", "Update localhost self-signed certificate" )
        .action(( args, cb ) => {
            require("../../lib/update-cert")(
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
