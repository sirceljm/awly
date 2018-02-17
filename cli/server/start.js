var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, projectConfig){
    return vorpal
    	.command( "server start", "Start local server" )
        .option('--lambda', 'Build all Lambda functions and simulate AWS Lambda environment')
        .option('--hot-reload', 'Run with hot reload')
        .option('--port', 'Custom server port')
        .option('--prod', '--production', 'Run production server (not applicable if --lambda flag is present)')
    	.action( function( args, cb ) {
            require("../../lib/server-start")(
                projectConfig,
                args.options
            );

    		// invokes command code in module providing vorpal and arguments, supporting promise as result
    		Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
    	} )
        .on('error', function(err){
            console.log(err);
        });
}
