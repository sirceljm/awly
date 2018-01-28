var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, projectConfig){
    return vorpal
    	.command( "init [dir]", "Init Awly directory" )
        // TODO options for tags and branches
    	.action( function( args, cb ) {
            if(!args.dir){
                args.dir = cwd;
            }
            require("../lib/init")(args.dir);
    		// invokes command code in module providing vorpal and arguments, supporting promise as result
    		// Promise.resolve( ( this, args ) ).then( projectConfig.repl ? cb : null );
    	} )
        .on('error', function(err){
            console.log(err);
        });
}
