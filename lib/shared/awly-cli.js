module.exports = (AWS) => {
    return {
        compile: require("./compile")(),
        lambda: require("./lambda")(AWS)
    };
};
