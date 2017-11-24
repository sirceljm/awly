#! /usr/bin/env node
const ShellJS = require("shelljs");
const Path = require( "path" );
const Minimist = require( "minimist" );
const Vorpal = require( "vorpal" )();

var cwd = ShellJS.pwd().toString();
var pjson = require(Path.join(cwd,'./package.json'));

console.log(cwd);
console.log(pjson.name);

if(pjson.name !== 'awly'){
    console.log("Not an Awly directory. Exiting ...");
    process.exit();
}

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

require("./cli/lambda-deploy")(Vorpal, {repl:repl});

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
