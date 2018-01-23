#! /usr/bin/env node
const ShellJS = require("shelljs");
const path = require( "path" );
const Minimist = require( "minimist" );
const Vorpal = require( "vorpal" )();


var cwd = ShellJS.pwd().toString();
var pjson = require(path.resolve(cwd,'./package.json'));

let argv = process.argv.slice( 0 );

let args = Minimist( argv.slice( 2 ) );
let repl = !( args._ && args._.length ) && !( args.h || args.help );

if ( args.h || args.help ) {
	argv = [].concat.apply( argv.slice( 0, 2 ).concat( "help" ), argv.slice( 2 ).filter( i => i[0] !== "-" ) );
}

// const projectConfig = require(path.resolve(cwd, './project-config/main.config.js'));
// projectConfig.cwd = cwd;
// projectConfig.awlyCliDir = __dirname;
//
// try{
//     projectConfig.credentials = require(projectConfig.credentials_path);
// } catch(err){
//     if(err.code == 'MODULE_NOT_FOUND'){
//         console.log('Credentials file at ' + projectConfig.credentials_path + ' could not be found. Exiting.');
//         console.log('Please change the "credentials_path" in ' + path.resolve(cwd, './project-config/main.config.js'));
//         console.log('Exiting.');
//         return;
//     }
// }

Vorpal.catch( "[words...]", "Catches incorrect commands" )
	.action( function( args, cb ) {
		this.log( ( args.words ? args.words.join( " " ) : "<unknown>" ) + " is not a valid command." );
		cb();
	} );

require("./cli/init.js")(Vorpal);
require("./cli/server/start.js")(Vorpal, require('./lib/utils').getProjectConfig());

require("./cli/page/deploy.js")(Vorpal, require('./lib/utils').getProjectConfig());

if ( repl ) {
	Vorpal
		.delimiter( "$" )
		.show();
} else {
	Vorpal
		.on( "client_command_executed", function() {
			process.exit( 0 )
		} )
		.delimiter( "$" )
		.parse( argv.slice( 0 ) );
}
