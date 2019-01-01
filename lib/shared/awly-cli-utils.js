module.exports = (AWS) => {
    return {
        lambda: require("./lambda-utils")(AWS)
    };
};
