const ShellJS = require("shelljs");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const forge = require("node-forge");

const cwd = ShellJS.pwd().toString();
const cwdSrcPath = path.resolve(cwd, "./src");

module.exports = {
    getCurrentWorkingDir: getCurrentWorkingDir,
    isAwlyProject: isAwlyProject,
    getProjectConfig: getProjectConfig,
    getProjectStructure: getProjectStructure,
    getProjectCredentials: getProjectCredentials,
    generateLocalhostCert: generateLocalhostCert
};

function getCurrentWorkingDir(){
    return cwd;
}
function isAwlyProject(){
    var pjson = require(path.resolve(cwd,"./package.json"));

    if(pjson.name !== "awly"){
        console.log("Not an Awly project. Exiting ..."); // TODO
        process.exit(); // TODO
    }
}


function getProjectConfig() {
    const projectConfig = require(path.resolve(cwd, "./project-config/main.config.js"));
    projectConfig.cwd = cwd;
    projectConfig.awlyCliDir = path.dirname(require.main.filename);

    return projectConfig;
}

function getProjectCredentials(projectConfig) {
    try{
        projectConfig.credentials = require(projectConfig.credentials_path);
    } catch(err){
        if(err.code == "MODULE_NOT_FOUND"){
            console.log("Credentials file at " + projectConfig.credentials_path + " could not be found. Exiting.");
            console.log("Please change the \"credentials_path\" in " + path.resolve(cwd, "./project-config/main.config.js"));
            console.log("Exiting.");
            return;
        }
    }
}

function getProjectStructure(awlyPagesDir) {
    return new Promise((resolve, reject) => {
        const awlyCliDir = path.dirname(require.main.filename);
        require(path.resolve(awlyCliDir, "./node_modules/marko/node-require")).install();

        const isDirectory = source => fs.lstatSync(source).isDirectory();
        const getPages = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

        // console.log('PAGES', awlyPagesDir, getPages(awlyPagesDir));

        let childConnections = {};
        let parentConnections = {};

        const pages = getPages(awlyPagesDir);
        const pagePromises = [];
        for(let i = 0; i < pages.length; i++){
            let page = pages[i];
            pagePromises.push(getSubcomponents({
                path: path.relative(cwdSrcPath, page),
                type: "page"
            }));

            Promise.all(pagePromises).then((values) => {
                resolve({
                    childConnections: childConnections,
                    parentConnections: parentConnections
                });
            });
        }
    });
}

function getSubcomponents(component){
    // console.log("----------------------------------------------------------");
    // console.log(component);
    return new Promise((resolve, reject) => {
        // TODO if no index.marko.js -> compile it
        const filePath = path.resolve(cwdSrcPath, component.path, "./index.marko.js");

        fs.stat(filePath, function(err, stat) {
            if(err && err.code == "ENOENT") {
                require(path.resolve(cwdSrcPath, component.path, "./index.marko"));
            } else if(err) {
                console.log("Error: ", err.code);
                reject();
            }

            fs.readFile(filePath, function read(err, data) {
                if (err) {
                    console.log(err);
                    throw err;
                }

                const matches = matchRequireResolve(data, requireResolveRegex);

                // if no more subcomponents resolve itself
                if(!matches || matches.length === 0){
                    resolve(component);
                } else {
                    let subcomponentPromises = [];
                    matches.forEach((subcomponentObj) => {
                        let subcomponent = {};

                        if(subcomponentObj.name.startsWith("src/layouts")){ // TODO make this check better - check for include paths
                            subcomponent = {
                                path: path.relative(cwdSrcPath, path.resolve(cwd, subcomponentObj.name)),
                                type: "layout"
                            };
                        } else {
                            subcomponent = {
                                path: path.relative(cwdSrcPath, path.resolve(filePath, "../", subcomponentObj.name)),
                                type: "component"
                            };
                        }

                        subcomponentPromises.push(getSubcomponents(subcomponent));
                    });

                    Promise.all(subcomponentPromises).then((values) => {
                        let childConnections = {};
                        let parentConnections = {};

                        values.forEach((subcomponent) => {
                            let parentComponent = {
                                path: component.path,
                                type: component.type,
                                next: {}
                            };

                            let childComponent = {
                                path: subcomponent.path,
                                type: subcomponent.type,
                                next: {}
                            };

                            if(!childConnections[parentComponent.path]){
                                childConnections[parentComponent.path] = _.cloneDeep(parentComponent);
                            }

                            if(!parentConnections[childComponent.path]){
                                parentConnections[childComponent.path] = _.cloneDeep(childComponent);
                            }

                            if(!childConnections[parentComponent.path].next[childComponent.path]){
                                childConnections[parentComponent.path].next[childComponent.path] = _.cloneDeep(childComponent);
                            }

                            if(!parentConnections[childComponent.path].next[parentComponent.path]){
                                parentConnections[childComponent.path].next[parentComponent.path] = _.cloneDeep(parentComponent);
                            }
                        });

                        resolve(component);
                    });
                }
            });
        });
    });
}

const requireResolveRegex = /(?:(?:\\['"`][\s\S])*?(['"`](?=[\s\S]*?require\.resolve\s*\(['"`][^`"']+?[`'"]\)))(?:\\\1|[\s\S])*?\1|\s*(?:(?:var|const|let)?\s*([_.\w/$]+?)\s*=\s*)?require\.resolve\s*\(([`'"])((?:@([^/]+?)\/([^/]*?)|[-.@\w/$]+?))\3(?:, ([`'"])([^\7]+?)\7)?\);?)/g;

// https://github.com/jonschlinkert/match-requires/
function matchRequireResolve(str, regex) {
    var matches = [];
    let match;

    while ((match = regex.exec(str))) {
        if (!match[4]) {
            continue;
        }
        var tok = { string: match[0].trim(), variable: match[2] || "", name: match[4] };

        Object.defineProperty(tok, "match", {
            enumerable: false,
            value: match
        });

        matches.push(tok);
    }

    return matches;
}

function generateLocalhostCert() {
    var pki = forge.pki;

    // generate a keypair and create an X.509v3 certificate
    var keys = pki.rsa.generateKeyPair(2048);
    var cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    // alternatively set public key from a csr
    //cert.publicKey = csr.publicKey;
    // NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
    // Conforming CAs should ensure serialNumber is:
    // - no more than 20 octets
    // - non-negative (prefix a '00' if your value starts with a '1' bit)
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    var attrs = [{
        name: "commonName",
        value: "localhost"
    }, {
        name: "countryName",
        value: ""
    }, {
        shortName: "ST",
        value: ""
    }, {
        name: "localityName",
        value: ""
    }, {
        name: "organizationName",
        value: "Awly"
    }, {
        shortName: "OU",
        value: "developers"
    }];
    cert.setSubject(attrs);
    // alternatively set subject from a csr
    //cert.setSubject(csr.subject.attributes);
    cert.setIssuer(attrs);
    cert.setExtensions([{
        name: "basicConstraints",
        cA: true
    }, {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
    }, {
        name: "extKeyUsage",
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
    }, {
        name: "nsCertType",
        client: true,
        server: true,
        email: true,
        objsign: true,
        sslCA: true,
        emailCA: true,
        objCA: true
    }, {
        name: "subjectAltName",
        altNames: [{
            type: 6, // URI
            value: "http://example.org/webid#me"
        }, {
            type: 7, // IP
            ip: "127.0.0.1"
        }]
    }, {
        name: "subjectKeyIdentifier"
    }]);
    /* alternatively set extensions from a csr
    var extensions = csr.getAttribute({name: 'extensionRequest'}).extensions;
    // optionally add more extensions
    extensions.push.apply(extensions, [{
      name: 'basicConstraints',
      cA: true
    }, {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    }]);
    cert.setExtensions(extensions);
    */
    // self-sign certificate
    cert.sign(keys.privateKey);

    return {
        key: pki.privateKeyToPem(keys.privateKey),
        cert: pki.certificateToPem(cert)
    };
}
