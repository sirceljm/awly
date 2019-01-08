module.exports = (AWS) => {
    return {
        compile: require("./compile")(),
        lambda: require("./lambda")(AWS),
        apigateway: require("./api-gateway")(AWS),
        cloudfront: require("./cloudfront")(AWS),
        s3: require("./s3")(AWS)
    };
};
