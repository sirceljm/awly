const graphql = require('graphql').graphql;
const Schema = require('./schema');

function runGraphQL(query, cb) {
    console.log('query');
    // patch to allow queries from GraphiQL
    // like the initial introspectionQuery
    if (query && query.hasOwnProperty('query')) {
        query = query.query.replace("\n", ' ', "g");
    }

    graphql(Schema, query).then( function(result) {
        console.log('RESULT: ', result);
        return cb(null, result);
    });
}

module.exports = runGraphQL;
