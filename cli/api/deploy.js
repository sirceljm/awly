var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, projectConfig){
    return vorpal
    	.command( "api-deploy [api]", "Deploy api to AWS" )
        .option('--no-gzip', 'Do not compress lambda output')
        .alias("ad")
    	.action( function( args, cb ) {
            try{
                projectConfig.credentials = require(projectConfig.credentials_path);
            } catch(err){
                if(err.code == 'MODULE_NOT_FOUND'){
                    console.log('Credentials file at ' + projectConfig.credentials_path + ' could not be found. Exiting.');
                    console.log('Please change the "credentials_path" in ' + path.resolve(projectConfig.cwd, './project-config/main.config.js'));
                    console.log('Exiting.');
                    return;
                }
            }

            require("../../lib/deploy-api")(
                projectConfig,
                args.api,
                args.options
            );

    		// invokes command code in module providing vorpal and arguments, supporting promise as result
    		Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
    	} )
        .on('error', function(err){
            console.log(err);
        });
}
