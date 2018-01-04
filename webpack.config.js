var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: './src/index.ts',
    target: 'node',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'backend.js'
    },
    externals: nodeModules,
    devtool: 'source-map',
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.js$/,
                loader: "source-map-loader",
                enforce: "pre"
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['./dist']),
        new CopyWebpackPlugin([{
            from: './src/swagger.yaml'
        }, {
            from: './package.json'
        }, {
            from: './.deployment'
        }, {
            from: './deploy.cmd'
        }])
    ]
};