var path = require("path");
var fs = require("fs");

module.exports = function(vorpal, version){
    return vorpal
    	.command( "version", "awly-cli version" )
        .alias("-v")
    	.action( function( args, cb ) {
            console.log(version);
    	} )
        .on('error', function(err){
            console.log(err);
        });
}
