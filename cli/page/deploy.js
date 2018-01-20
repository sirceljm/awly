var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, projectConfig){
    return vorpal
    	.command( "page-deploy [page]", "Deploy page to AWS" )
        .option('--no-gzip', 'Do not compress lambda output')
        .alias("pd")
    	.action( function( args, cb ) {
            require("../../lib/deploy-lambda")(
                path.join(
                    projectConfig.cwd,
                    'src/pages',
                    args.page,
                    'index.marko'
                ),
                projectConfig,
                args.page,
                args.options
            );

    		// invokes command code in module providing vorpal and arguments, supporting promise as result
    		Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
    	} )
        .on('error', function(err){
            console.log(err);
        });
}
