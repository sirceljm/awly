const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

// import {
//     GraphQLObjectType,
//     GraphQLSchema,
//     GraphQLList,
//     GraphQLString,
//     GraphQLNonNull
// } from 'graphql/dist/modules';

// const graphqlCustomTypes = require('graphql-custom-types');
// const GraphQLLimitedString = graphqlCustomTypes.GraphQLLimitedString;

const dynamoDbModel = require('./dynamodb/handlers/posts');
const getPosts = dynamoDbModel.handlers.getPosts;
const getAuthor = dynamoDbModel.handlers.getAuthor;
const getAuthors = dynamoDbModel.handlers.getAuthors;
const getComments = dynamoDbModel.handlers.getComments;
const createPost = dynamoDbModel.handlers.createPost;

const Author = new GraphQLObjectType({
    name: "Author",
    description: "Author of the blog post",
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString}
    })
});

const Comment = new GraphQLObjectType({
    name: "Comment",
    description: "Comment on the blog post",
    fields: () => ({
        id: {type: GraphQLString},
        content: {type: GraphQLString},
        author: {
            type: Author,
            resolve: function({author}) {
                return getAuthor(author);
            }
        }
    })
});

const Post = new GraphQLObjectType({
    name: "Post",
    description: "Blog post content",
    fields: () => ({
        id: {type: GraphQLString},
        title: {type: GraphQLString},
        bodyContent: {type: GraphQLString},
        // author: {
        //     type: Author,
        //     resolve: function({author}) {
        //         return getAuthor(author);
        //     }
        // },
        // comments: {
        //     type: new GraphQLList(Comment),
        //     resolve: function(post) {
        //         return getComments();
        //     }
        // }
    })
});

const Query = new GraphQLObjectType({
    name: 'BlogSchema',
    description: "Root of the Blog Schema",
    fields: () => ({
        posts: {
            type: new GraphQLList(Post),
            description: "List of posts in the blog",
            resolve: function(source, {category}) {
                return getPosts();
            }
        },
        authors: {
            type: new GraphQLList(Author),
            description: "List of Authors",
            resolve: function() {
                return getAuthors();
            }
        },
        author: {
            type: Author,
            description: "Get Author by id",
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: function(source, {id}) {
                return getAuthor(author);
            }
        }
    })
});

const Mutuation = new GraphQLObjectType({
    name: 'BlogMutations',
    fields: {
        createPost: {
            type: Post,
            description: "Create blog post",
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                title: {type: new GraphQLNonNull(GraphQLString)},
                bodyContent: {type: new GraphQLNonNull(GraphQLString)},
                // author: {type: new GraphQLNonNull(GraphQLString), description: "Id of the author"}
            },
            resolve: function(source, args) {
                return createPost(args);
            }
        },
    }
});

const Schema = new GraphQLSchema({
    query: Query,
    mutation: Mutuation
});

module.exports = Schema;
