// Copyright 2017 Quip

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const Autoprefixer = require('autoprefixer');
const cwd = process.cwd();

function plugins() {
    let plugins = [
        new ExtractTextPlugin("app.css"),
        new WriteFilePlugin()
    ];
    if (process.env.NODE_ENV != "development") {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                mangle: { except: ["quiptext"] }
            })
        )
    }
    return plugins;
}

module.exports = {
    devtool: "source-map",
    entry: ["babel-polyfill", "quip-apps-compat", path.resolve(cwd, "./src/root.jsx")],
    output: {
        path: path.resolve(cwd, "./app/dist"),
        filename: "app.js",
        publicPath: "dist"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: [
                        require.resolve("babel-preset-env"),
                        require.resolve("babel-preset-react-app")
                    ]
                },
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                importLoaders: 1,
                                localIdentName: "[name]__[local]"
                            },
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: loader => [
                                    Autoprefixer(),
                                ]
                            }
                        },
                        "less-loader"
                    ],
                }),
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: loader => [
                                    Autoprefixer(),
                                ]
                            }
                        },
                    ],
                }),
            },
            {
                test: /\.svg/,
                use: "url-loader",
            },
            {
                test: /\.png$/,
                use: "url-loader"
            }
        ],
    },
    resolve: {
        modules: [
            path.resolve(cwd, "src"),
            path.resolve(cwd, "node_modules"),
            path.resolve(__dirname, "node_modules")
        ]
    },
    resolveLoader: {
        modules: [
            path.resolve(cwd, "node_modules"),
            path.resolve(__dirname, "node_modules")
        ]
    },
    plugins: plugins(),
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        quip: "quip",
        quiptext: "quiptext"
    },
    devServer: {
        contentBase: path.resolve(cwd, "app/dist"),
        // host: "docker.qa",
        port: 8888,
        inline: false
    }
};

