#! /usr/bin/env node
const ShellJS = require("shelljs");
const path = require( "path" );
const Minimist = require( "minimist" );
const Vorpal = require( "vorpal" )();


var cwd = ShellJS.pwd().toString();
let argv = process.argv.slice( 0 );

let args = Minimist( argv.slice( 2 ) );
let repl = !( args._ && args._.length ) && !( args.h || args.help );

if ( args.h || args.help ) {
	argv = [].concat.apply( argv.slice( 0, 2 ).concat( "help" ), argv.slice( 2 ).filter( i => i[0] !== "-" ) );
}

Vorpal.catch( "[words...]", "Catches incorrect commands" )
	.action( function( args, cb ) {
		this.log( ( args.words ? args.words.join( " " ) : "<unknown>" ) + " is not a valid command." );
		cb();
	} );

require("./cli/init.js")(Vorpal);
require("./cli/server/start.js")(Vorpal, require('./lib/utils').getProjectConfig());

require("./cli/page/deploy.js")(Vorpal, require('./lib/utils').getProjectConfig());
require("./cli/api/deploy.js")(Vorpal, require('./lib/utils').getProjectConfig());

require("./cli/assets/upload.js")(Vorpal, require('./lib/utils').getProjectConfig());

require("./cli/aws/sync-cloudfront.js")(Vorpal, require('./lib/utils').getProjectConfig());

if ( repl ) {
	Vorpal
		.delimiter( "awly: " )
		.show();
} else {
	Vorpal
		.on( "client_command_executed", function() {
			process.exit( 0 )
		} )
		.delimiter( "$" )
		.parse( argv.slice( 0 ) );
}
