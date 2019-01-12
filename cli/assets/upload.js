const { awlyCliDir } = require("@awly/env");
const path = require("path");
const utils = require(path.resolve(awlyCliDir,"./lib/shared/utils"))();

module.exports = function(vorpal, projectConfig){
    return vorpal
        .command( "assets-upload", "Upload Awly project assets to AWS S3" )
        .alias("au")
        .action(uploadAssets.bind({projectConfig}))
        .on("error", function(err){
            console.log(err);
        });
};

function uploadAssets( args, cb ){
    if(!utils.project.checkProjectCredentials(this.projectConfig)){
        return true;
    }

    require("../../lib/assets-upload")(
        this.projectConfig,
        args.page,
        args.options
    );

    // invokes command code in module providing vorpal and arguments, supporting promise as result
    Promise.resolve( ( this, args ) ).then( this.projectConfig.repl ? cb : null );
}
