const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

module.exports = serverStart;

function serverStart(projectConfig, options){
    process.env.MARKO_DEBUG = true; // if this is not set it triggers MarkoJS dist build with --prod flag which produces an error
    process.env.NODE_ENV = "dev";
    process.env.STAGE = "dev";

    process.env.AWS_REGION = projectConfig.region;

    const hotReload = options["hot-reload"] === false ? false : true;
    const inlineCSS = options["inline-css"];

    const cwd = projectConfig.cwd; // AWLY PROJECT DIR
    const awlyCliDir = projectConfig.awlyCliDir; // AWLY CLI DIR
    const utils = require(path.resolve(awlyCliDir, "./lib/utils.js"));

    require("dotenv").config({
        path: path.resolve(awlyCliDir, ".env")
    });

    const markojsModulesPath = process.env.MARKOJS_MODULES_PATH;
    const awlyModulesPath = process.env.AWLY_MODULES_PATH;
    require("app-module-path").addPath(cwd);
    require("app-module-path").addPath(path.resolve(cwd, "./node_modules"));
    require("app-module-path").addPath(path.resolve(cwd, "./node_modules/", awlyModulesPath));

    require("app-module-path").addPath(awlyCliDir);
    require("app-module-path").addPath(path.resolve(awlyCliDir, "./node_modules"));
    require("app-module-path").addPath(path.resolve(awlyCliDir, "./node_modules/", awlyModulesPath));

    console.log("MarkoJS path in node_modules is: ", markojsModulesPath);

    require(markojsModulesPath + "node-require").install();

    // require(path.resolve(awlyCliDir, "./node_modules/@awly/markocompiler")).configure({ writeToDisk: false }); hot reload needs to have marko.js files
    const markoInfo = require(markojsModulesPath + "package.json");
    const markoExpress = require(markojsModulesPath + "express");
    const markoHotReload = require(markojsModulesPath + "hot-reload");

    if(hotReload){
        markoHotReload.enable({ silent: true });
    }

    const lasso = require(awlyModulesPath + "lasso");

    // console.log(process.env);
    // console.log(projectConfig);z

    const bodyParser = require("body-parser");
    const cookieParser = require("cookie-parser");
    // const graphqlExpress = require(path.resolve(cwd, "./node_modules/graphql-server-express"));

    // RUN DYNALITE LOCAL SERVER
    // Returns a standard Node.js HTTP server
    const dbFolder = path.resolve(cwd, "./data/dynalite");
    const dynalite = require("dynalite");
    const dynaliteServer = dynalite({path: dbFolder, createTableMs: 50});
    dynaliteServer.listen(projectConfig.DYNAMODB_PORT, function(err) {
        if (err) {
            throw err;
        }
        console.log("DynamoDB is running on port: ", projectConfig.DYNAMODB_PORT, "- DB folder:", dbFolder);
    });

    // RUN AWLY SERVERS
    const express = require("express");
    const app = express();
    const spdy = require("spdy");

    app.use(cookieParser());

    const router = express.Router();

    // RUN DYNAMODB ADMIN GUI
    process.env.DYNAMODB_ENDPOINT = "http://localhost:" + projectConfig.DYNAMODB_PORT;
    process.env.DYNAMO_ENDPOINT = process.env.DYNAMODB_ENDPOINT;
    console.log("DynamoDB Admin GUI is running. You can access it on", chalk.yellow("https://localhost:" + projectConfig.HTTPS_PORT + "/__awly/dynamodb"));
    const dynamoDBAdminGUIRouter = require("@awly/dynamodb-admin/router.js");
    // var dynamoDBAdminGUIServerPath = path.resolve(awlyCliDir, "./node_modules/@awly/dynamodb-admin/index.js");
    // const dynamoDBAdminGUI = child_process.fork(dynamoDBAdminGUIServerPath); // TODO import with require

    app.set("json spaces", 2);
    app.set("view engine", "ejs");
    app.set("views", path.resolve(awlyCliDir, "./node_modules/@awly/dynamodb-admin/views"));
    const dynamodbAdminPrefix = "/__awly/dynamodb";
    app.set("dynamodb-admin-urlPrefix", dynamodbAdminPrefix);
    // app.use(errorhandler());

    app.use(dynamodbAdminPrefix + "/assets/", express.static(path.resolve(awlyCliDir, "./node_modules/@awly/dynamodb-admin/public")));

    app.use("/__awly/dynamodb", dynamoDBAdminGUIRouter);

    const compression = require("compression"); // Provides gzip compression for the HTTP response

    let isProduction = options.prod || false;

    if(isProduction){
        process.env.NODE_ENV = "prod";
    }

    // Configure lasso to control how JS/CSS/etc. is delivered to the browser
    lasso.configure({
        // urlPrefix: "/static",
        plugins: [
            "lasso-marko", // Allow Marko templates to be compiled and transported to the browser
            "lasso-less",
            "lasso-sass",
            // {
            //     plugin: 'lasso-inline-slots',
            //     config: {
            //         inlineSlots: [
            //             'inline-css'
            //         ]
            //     }
            // }
        ],
        // resolveCssUrls: {
        //     urlResolver: function(url, lassoContext, callback) {
        //         url = url.replace("SOME_TOKEN", "something else");
        //         callback(null, url);
        //     }
        // },
        resolveCssUrls: false,
        outputDir: path.resolve(cwd, "./static"), // Place all generated JS/CSS/etc. files into the "static" dir
        bundlingEnabled: isProduction, // Only enable bundling in production
        minify: isProduction, // Only minify JS and CSS code in production
        fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production,
        require: {
            transforms: [{
                transform: "lasso-babel-transform",
                config: {
                    extensions: [".marko", ".js", ".es6"],
                    // directly specify babel options
                    babelOptions: {
                        presets: [ "es2015" ]
                    }
                }
            }]
        },
    });

    // Enable gzip compression for all HTTP responses
    app.use(compression());
    app.use(markoExpress());

    // var schema = require(path.resolve(cwd, "./src/services/graphql/schema.js"));
    // console.log(schema);

    // app.use("/gql", bodyParser.json(), graphqlExpress.graphqlExpress({ schema: schema }));
    // app.use("/graphql", bodyParser.json(), graphqlExpress.graphqlExpress({ schema: schema }));
    //
    // app.use("/__awly/graphiql", graphqlExpress.graphiqlExpress({
    //     endpointURL: "/graphql",
    // }));

    // Allow all of the generated files under "static" to be served up by Express
    app.use(require(awlyModulesPath + "lasso/middleware").serveStatic());

    express.static.mime.define({"text/javascript": ["js"]});

    app.use("/assets", express.static("./assets"));

    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    let pageHasChanges = false;
    const endpoints = require(path.resolve(cwd, "./project-config/routing.js"));
    const paths = Object.keys(endpoints);

    paths.forEach((path) => {
        let endpoint = endpoints[path];

        if(/^src\/pages/.test(endpoint.localEndpoint)){
            routePage(path, endpoint.localEndpoint);
        } else if (/^src\/api/.test(endpoint.localEndpoint)) {
            routeApi(path, endpoint.localEndpoint);
        }
    });

    function routePage(pagePath, localEndpoint) {
        app.use(pagePath, function (req, res, next) {
            if(req.originalUrl === pagePath){
                require(path.resolve(awlyCliDir, "./router/routes.js"))(req, res, next, cwd, lasso, pagePath, localEndpoint, pageHasChanges, inlineCSS);
                pageHasChanges = false;
            }else{
                router(req, res, next);
            }
        });
    }

    // API ENDPOINTS
    function routeApi(apiPath, localEndpoint, method){
        app.use(apiPath, function (req, res, next) {
            if(req.originalUrl === apiPath){
                require(path.resolve(awlyCliDir, "./router/routes-api.js"))(req, res, next, cwd, apiPath, localEndpoint, pageHasChanges);
                pageHasChanges = false;
            }else{
                router(req, res, next);
            }
        });
    }

    // __AWLY ASSETS
    app.use("/__awly/awly-assets", express.static(path.resolve(awlyCliDir, "web/assets")));

    utils.getProjectStructure(path.resolve(cwd, "./src/pages")).then((projectStructure) => {
        // console.log('CHILD CONNECTIONS',  JSON.stringify(projectStructure.childConnections, undefined, 4));
        // console.log('PARENT CONNECTIONS', JSON.stringify(projectStructure.parentConnections, undefined, 4));

        let lassoPageOptions = {
            name: "/__map",
            dependencies: [
                "require-run: web/src/pages/map",
            ]
        };

        lasso.lassoPage(lassoPageOptions).then(function(lassoPageResult) {
            let js = lassoPageResult.getBodyHtml();
            let css = null;

            if (inlineCSS) {
                css = "<style>";

                lassoPageResult.files.forEach((file) => {
                    if(file.contentType == "css"){
                        css += fs.readFileSync(file.path, "utf8");
                    }
                });

                css += "</style>";
            } else {
                css = lassoPageResult.getHeadHtml();
            }

            var template = require(path.resolve(awlyCliDir, "web/src/pages/map"));

            app.get("/__awly", function (req, res) {
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.marko(template, {
                    $global:{
                        injectCSS: css,
                        injectJS: js,
                        data: {
                            childConnections: projectStructure.childConnections,
                            parentConnections: projectStructure.parentConnections
                        }
                    }
                });
            });
        });
    });

    var viewsDir = path.resolve(cwd, "src");

    app.disable("view cache");

    const certs = {
        key: fs.readFileSync(path.resolve(cwd, "./certs/privkey.pem")),
        cert:  fs.readFileSync(path.resolve(cwd, "./certs/cert.pem"))
    };

    if(hotReload){
        var longpoll = require("@awly/express-longpoll")(app);
        // var longpollWithDebug = require("@awly/express-longpoll")(app, { DEBUG: true });
        longpoll.create("/__hotReload");
    }

    // app.use(function (err, req, res, next) {
    //     console.error(err.stack);
    //     res.status(500).send("Something broke!");
    // });

    const server = spdy
        .createServer(certs, app)
        .listen(projectConfig.HTTPS_PORT, (error) => {
            if (error) {
                console.error(error);
                return process.exit(1);
            } else {
                console.log((isProduction ? "Production " : "") + "HTTPS server listening on port: " + projectConfig.HTTPS_PORT + ".");
                console.log("MarkoJS version: " + markoInfo.version);

                if(!isProduction && hotReload){
                    startHotReloadListening();
                }

                if (process.send) {
                    process.send("online");
                }

                console.log();
                console.log();
                console.log("Visit your page on:", chalk.green("https://localhost:"+projectConfig.HTTPS_PORT));
                console.log();
            }
        });


    function startHotReloadListening(){
        console.log("Hot reload ACTIVE!");
        var chokidar = require("chokidar");

        let firstRoundChanges = {};

        chokidar.watch(viewsDir, {ignored: /(^|[/\\])\../}).on("all", (event, filePath) => {
            if (/\.marko$/.test(filePath) && firstRoundChanges[filePath]) {
                utils.getProjectStructure(path.resolve(cwd, "./src/pages")).then((projectStructure) => {
                    const relativeDirPath = path.dirname(path.relative(path.resolve(cwd, "./src"), filePath));
                    invalidateMarkoComponentsUpstream(relativeDirPath, projectStructure.parentConnections);
                });

                pageHasChanges = true;

                longpoll.publish("/__hotReload", Date.now());
            }
            firstRoundChanges[filePath] = true;
        });
    }

    function invalidateMarkoComponentsUpstream(relativeDirPath, connections){
        // console.log("   " + relativeDirPath);
        // console.log("CONNECTIONS", connections);
        // console.log("CONNECTIONS", connections[relativeDirPath]);
        markoHotReload.handleFileModified(path.resolve(cwd, "./src", relativeDirPath, "./index.marko"), {silent: true});
        // markoHotReload.handleFileModified(path.resolve(cwd, "./src", relativeDirPath, "./index.marko"));
        if(connections[relativeDirPath]){
            for(let parentComponent in connections[relativeDirPath].next){
            // console.log('PC', parentComponent);
                invalidateMarkoComponentsUpstream(parentComponent, connections);
            }
        }

    }

    // TODO if selected
    var http = express();

    // REDIRECT HTTP TO HTTPS
    http.get("*", function(req, res) {
        res.redirect("https://" + req.headers.host + req.url);
    });
    http.listen(projectConfig.HTTP_PORT);

    return server;
}
