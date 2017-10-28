// const Promise = require('bluebird');
const AWS = require('aws-sdk');

AWS.config.update({
    endpoint: "http://localhost:4567",
    region: "us-west-2",
    accessKeyId: "process.env.AWS_ACCESS_KEY_ID",
    secretAccessKey: "process.env.AWS_SECRET_ACCESS_KEY"
});

const dynamoConfig = {
    endpoint: "http://localhost:4567",
    accessKeyId: "process.env.AWS_ACCESS_KEY_ID",
    secretAccessKey: "process.env.AWS_SECRET_ACCESS_KEY",
    region:          "us-west-2",
};

const dynamodb = new AWS.DynamoDB(dynamoConfig);
const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);

const schema = {
    AttributeDefinitions: [{
        AttributeName: "id",
        AttributeType: "S"
    },{
        AttributeName: "title",
        AttributeType: "S"
    }],
    KeySchema: [{
        AttributeName: "id",
        KeyType: "HASH"
    },{
        AttributeName: "title",
        KeyType: "RANGE"
    }],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    },
    TableName: "Post"
};
//
dynamodb.createTable(schema, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});

module.exports = {
    // schema: schema,
    handlers: {
        createPost: createPost,
        getPosts: getPosts,
        getAuthor: getAuthor,
        getAuthors: getAuthors,
        getComments: getComments
    }
};

function createPost(post) {
    return new Promise(function(resolve, reject) {
        var params = {
            TableName: schema.TableName,
            Item: post
        };

        docClient.put(params, function(err, data) {
            if (err) {
              console.log(err);
              return reject(err);
            }
            return resolve(post);
        });

    });
}

function getPosts() {
    return new Promise(function(resolve, reject) {
        var params = {
            TableName: schema.TableName,
            AttributesToGet: [
                'id',
                'title',
                // 'author',
                'bodyContent'
            ]
        };

        docClient.scan(params, function(err, data) {
            if (err) return reject(err);
            return resolve(data["Items"]);
        });

    });
}

function getAuthor(id) {
    return new Promise(function(resolve, reject) {
        var params = {
            TableName: authorsTable,
            Key: {
                id: id
            },
            AttributesToGet: [
                'id',
                'name'
            ]
        };

        docClient.get(params, function(err, data) {
            if (err) return reject(err);
            return resolve(data["Item"]);
        });

    });
}

function getAuthors() {
    return new Promise(function(resolve, reject) {
        var params = {
            TableName: authorsTable,
            AttributesToGet: [
                'id',
                'name'
            ]
        };

        docClient.scan(params, function(err, data) {
            if (err) return reject(err);
            return resolve(data["Items"]);
        });

    });
}

function getComments() {
    return new Promise(function(resolve, reject) {
        var params = {
            TableName: commentsTable,
            AttributesToGet: [
                'id',
                'content',
                'author'
            ]
        };

        docClient.scan(params, function(err, data) {
            if (err) return reject(err);
            return resolve(data["Items"]);
        });

    });
}
