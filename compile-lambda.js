const path = require("path");
const webpack = require("webpack");
const fs = require('fs');

require('app-module-path').addPath(__dirname);

const ExtractTextPlugin = require("extract-text-webpack-plugin");

var lasso = require('lasso');
lasso.configure({
    "outputDir": "./lambdas/static",
    "urlPrefix": "/static",
    "fingerprintsEnabled": false,
    "plugins": [
        "lasso-marko",
        "lasso-less"
    ],
    bundlingEnabled: true, // Only enable bundling in production
    minify: true, // Only minify JS and CSS code in production
});

// returns a Compiler instance
const compiler = webpack({
    entry: './src/pages/home/template.marko.js',
    output: {
        path: path.resolve(__dirname, 'lambdas'),
        filename: 'lambda.js',
        // library: '',
        // libraryTarget: 'commonjs'
    },
    target: 'node',
    resolve: {
        extensions: ['.js', '.marko'],
        modules: [path.resolve(__dirname), 'node_modules']
    },
    module: {
        rules: [{
            test: /\.marko$|\.html$/,
            exclude: /node_modules(?!\/marko)/,
            use: [{
                loader: 'marko-loader',
                options: {target: 'server'} // need to set this or marko loader won't compile for server
            }]
        },{
            // test: /\.less$/, // matches style.less { ... } from our template
            // loader: "style-loader!css-loader!less-loader!"
        },{
            // test: /\.(less|css)$/,
            // use: ExtractTextPlugin.extract({
            //     fallback: "style-loader",
            //     use: "css-loader!less-loader"
            // })
        }]
    },
    plugins: [
        // required for marko server side build to work:  this should really be documented
        new webpack.DefinePlugin({
            "global.GENTLY": false,
            'process.env': {'BUNDLE': '"true"'}
        }),

        new ExtractTextPlugin({
            filename:'./static/bundle2.css',
            allChunks: true
        }),

        // gets rid of warning from webpack about require not being statically resolved.
        new webpack.ContextReplacementPlugin(/runtime\/dependencies/, /runtime\/dependencies/)
    ]

});

prepareLambda();

//////////
function prepareLambda(){
    runLasso();
}

function runLasso(){
    lasso.lassoPage({
        name: 'bundle',
        dependencies: [
            "require-run: ./src/pages/home/template.marko"
        ]
    }, function(err, lassoPageResult) {
        if (err) {
            console.log(err);
            return;
            // Handle the error
        }

        var headHtml = lassoPageResult.getHeadHtml();
        // headHtml will contain something similar to the following:
        // <link rel="stylesheet" href="static/my-page-169ab5d9.css">

        var bodyHtml = lassoPageResult.getBodyHtml();
        // bodyHtml will contain something similar to the following:
        //  <script src="static/my-page-2e3e9936.js"></script>

        // console.log(headHtml);
        // console.log("");
        // console.log(bodyHtml);

        preparePageTemplate();
    });
}

function preparePageTemplate(){
    var markoCompiler = require('marko/compiler')
    markoCompiler.configure({ requireTemplates: true });
    require('marko/node-require');

    var compiledSrc = markoCompiler.compileFile("./src/pages/home/template.marko");

    fs.writeFileSync("./src/pages/home/template.marko.js", compiledSrc + fs.readFileSync('./helpers/render-append.js', 'utf8'), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    runWebpack();
}

function runWebpack(){
    compiler.run(function(err, stats) {
        if(err){
            throw(err);
        }

        wrapLambda();
    });
}


function wrapLambda(){
    fs.writeFileSync("./lambdas/lambda.js",
        fs.readFileSync('./helpers/lambda-prepend.js', 'utf8') +
        fs.readFileSync('./lambdas/lambda.js', 'utf8') +
        fs.readFileSync('./helpers/lambda-append.js', 'utf8'),
        function(err) {
        if(err) {
            return console.log(err);
        }
    });

    console.log('DONE!');
}