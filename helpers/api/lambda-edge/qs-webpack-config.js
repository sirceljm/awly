var path = require('path');
var webpack = require('webpack');

var webpackConfig = {
    entry: './helpers/api/lambda-prepend-querystring.js',
    output: {
        path: path.resolve('./helpers/api/'),
        filename: 'lambda-prepend-querystring-build.js',
    },
    resolve: {
    extensions: ['.js'],
        modules: ['node_modules'],
        alias: {
          'qs': path.resolve(__dirname, './helpers/api/lambda-prepend-querystring.js')  // <-- When you build or restart dev-server, you'll get an error if the path to your utils.js file is incorrect.
        }
      },
    plugins: [
        new webpack.ProvidePlugin({
            qs: "qs",
        })
    ]
};

module.exports = webpackConfig;
