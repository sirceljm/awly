let lambdaSDK = null;

module.exports = (AWS) => {
    lambdaSDK = new AWS.Lambda();

    return {
        getLambdaFunction,
        createLambda,
        updateLambda,
        uploadLambda
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
                    ? updateLambda(lambdaName, lambdaZipContent)
                    : createLambda(lambdaName, lambdaZipContent, projectConfig.lambda_role_arn);
            })
            .then(res => {
                // console.log(res);
            })
            .catch(err => {
                throw err;
            });
    });
}
