var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, cwd){
    return vorpal
    	.command( "init [dir]", "Init Awly directory" )
    	.action( function( args, cb ) {
            if(!args.dir){
                args.dir = cwd;
            }
            require("../lib/init")(args.dir);
    	} )
        .on('error', function(err){
            console.log(err);
        });
}
