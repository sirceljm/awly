const { awlyCliDir } = require("@awly/env");
const path = require("path");
const utils = require(path.resolve(awlyCliDir,"./lib/shared/utils"))();

module.exports = function(vorpal, projectConfig){
    return vorpal
        .command("page-deploy <page>", "Deploy page to AWS" )
        .option("--no-gzip", "Do not compress lambda output")
        .option("--no-min", "Do not minify lambda code")
        .option("--analyze", "Analyze built lambda after completion")
        .option("--dry-run", "Only build lambda, do not deploy")
        //.option("--edge", "Deploy a lambda@edge function")
        .option("--region", "Deploy to a specific region") // TODO add - does not apply to lambda@edge if labda@edge deploy is available
        .option("--lambda-name <name>", "Provide a custom name for your lambda")
        .option("--path <path>", "Provide a custom path for your lambda by default it equals lambda name")
        .alias("pd")
        .action(deployPage.bind({projectConfig}))
        .on("error", function(err){
            console.log(err);
        });
};

function deployPage( args, cb, projectConfig ){
    if(!utils.project.checkProjectCredentials(this.projectConfig)){
        return true;
    }
    const deployFn = args.options.edge ? require("../../lib/deploy-page-edge") : require("../../lib/deploy-page");

    deployFn(
        this.projectConfig,
        args.page,
        args.options
    );

    // invokes command code in module providing vorpal and arguments, supporting promise as result
    Promise.resolve( ( this, args ) ).then( this.projectConfig.repl ? cb : null );
}
