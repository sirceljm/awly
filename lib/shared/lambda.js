const JSZip = require("jszip");
const fs = require("fs");

let lambdaSDK = null;

module.exports = (AWS) => {
    lambdaSDK = new AWS.Lambda();

    return {
        getLambdaFunction,
        createLambda,
        updateLambda,
        uploadLambda,
        zipLambda,
        addLambdaAPIGatewayPermission
    };
};

function getLambdaFunction(lambdaName){
    return new Promise((resolve, reject) => {
        lambdaSDK.getFunction({
            FunctionName: lambdaName,
        }, (err, data) => {
            if(err && err.code === "ResourceNotFoundException"){
                resolve({ lambdaExists: false });
            }else if(err){
                reject(err, err.stack);
            }else{
                resolve({ lambdaExists: true });
            }
        });
    });
}

function createLambda(lambdaName, zip, roleArn, opt){
    const options = opt || {};
    if(!options.silent){
        console.log(`CREATING A NEW LAMBDA FUNCTION: ${lambdaName}`);
    }

    return new Promise((resolve, reject) => {
        lambdaSDK.createFunction({
            Code: {
                ZipFile: zip
            },
            FunctionName: lambdaName,
            Handler: options.handlerName || "index.handler",
            Role: roleArn,
            Runtime: options.runtime || "nodejs6.10",
            Description: options.description || "",
            MemorySize: options.defaultMemorySize || 512,
            Publish: true,
        }, (err, data) => {
            if (err) {
                reject(err, err.stack);
            } else {
                resolve(data);
            }
        });
    });
}

function updateLambda(lambdaName, zip, opt){
    let options = opt || {};
    if(!options.silent){
        console.log(`UPDATING LAMBDA FUNCTION: ${lambdaName}`);
    }

    return new Promise((resolve, reject) => {
        lambdaSDK.updateFunctionCode({
            FunctionName: lambdaName,
            Publish: true,
            ZipFile: zip
        }, (err, data) => {
            if (err) {
                reject(err, err.stack);
            } else {
                resolve(data);
            }
        });
    });
}

function uploadLambda(lambdaName, lambdaZipContent, projectConfig, opt){
    let options = opt || {};
    if(!options.silent){
        console.log(`UPLOAD LAMBDA FUNCTION: ${lambdaName}`);
    }

    return new Promise(function(resolve, reject){
        getLambdaFunction(lambdaName)
            .then(res => {
                return res.lambdaExists
                    ? updateLambda(lambdaName, lambdaZipContent, opt)
                    : createLambda(lambdaName, lambdaZipContent, projectConfig.lambda_role_arn, opt);
            })
            .then(response => {
                resolve(response);
            })
            .catch(err => {
                console.log("err", err);
                reject(err);
            });
    });
}

function zipLambda(lambdaPath, opt) {
    let options = opt || {};
    if(!options.silent){
        console.log(`ZIP LAMBDA: ${lambdaPath}`);
    }

    const fileContents = fs.readFileSync(lambdaPath, "utf8");

    return new Promise(function(resolve, reject){
        var zip = new JSZip();
        zip.file("index.js", fileContents);
        //var data = zip.generate({type:"uint8array", compression: 'deflate'});

        zip.generateAsync({type:"uint8array", compression: "deflate"})
            .then(function (content) {
                fs.writeFileSync(lambdaPath+".zip", content);
                resolve(content);
            });
    });
}


function addLambdaAPIGatewayPermission(uploadedLambda, opt) {
    let options = opt || {};
    if(!options.silent){
        console.log("ADD LAMBDA API GATEWAY PERMISSION");
    }

    return new Promise((resolve, reject) => {
        var params = {
            FunctionName: uploadedLambda.FunctionArn,
            StatementId: "ID-1"
        };
        lambdaSDK.removePermission(params, function(err, data) {
            if (err && err.code != "ResourceNotFoundException") {
                console.log(err, err.stack);
            }

            var params = {
                Action: "lambda:InvokeFunction",
                FunctionName: uploadedLambda.FunctionArn,
                Principal: "apigateway.amazonaws.com",
                StatementId: "ID-1"
            };
            lambdaSDK.addPermission(params, (err, data) => {
                if (err) {
                    reject(err, err.stack);
                } else {
                    resolve(data);
                }
            });
        });
    });
}
