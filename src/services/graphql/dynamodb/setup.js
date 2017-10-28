var normalizedPath = require("path").join(__dirname, "/handlers");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    console.log("./graphql/dynamodb/handlers/" + file);
});