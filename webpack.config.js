const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const {SourceMapDevToolPlugin} = require("webpack");
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const darkThemeVars = require('antd/dist/dark-theme');


/*new SWPrecacheWebpackPlugin
*
* */


const isProd = process.env.NODE_ENV === "production"
const target = isProd ? "browserslist" : "web";

const plugins = [
    new SourceMapDevToolPlugin({
        filename: "[file].map"
    }),

    /**
     * manifest for webpack.prod.conf
     * **/
    new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
    }),
    new webpack.ProvidePlugin({
        React: "react"
    }),
    new Dotenv(),

    new MiniCssExtractPlugin({
        filename: isProd ? '[name].[hash].css' : '[name].css',
        chunkFilename: isProd ? '[id].[hash].css' : '[id].css',
        ignoreOrder: true,
    }),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        // inject: true,
        /*For production*/
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        },
    }),
]


if (process.env.SERVE) {
    plugins.push(new ReactRefreshWebpackPlugin());
}


const generateSourceMap = process.env.GENERATE_SOURCEMAP

const cssModuleOptions = isProd
    ? {
        localIdentName: "[contenthash:base64:8]",
        exportLocalsConvention: "camelCase"
    }
    : {localIdentName: "[name]__[local]___[hash:base64:5]", exportLocalsConvention: "camelCase"}


module.exports = {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "eval-cheap-module-source-map",
    entry: "./src/index.js",
    performance: {
        hints: isProd ? "warning" : false,
        maxEntrypointSize: 5120,
        maxAssetSize: 5120,
    },
    stats: {
        cached: false,
        cachedAssets: false,
        chunks: false,
        chunkModules: false,
        children: false,
        colors: true,
        hash: false,
        modules: false,
        reasons: false,
        timings: false,
        version: false
    },

    output: {
        pathinfo: true,
        publicPath: '/',
        filename: isProd ? "static/js/[name].[contenthash].js" : "[name].js",
        chunkFilename: isProd ? "static/js/[name].[chunkhash:8].chunk.js" : "[name].chunk.js",
        path: path.resolve(__dirname, "build"),
        assetModuleFilename: "static/media/[contenthash][ext][query]",
    },

    plugins: plugins,
    target: target,
    // node: {
    //     dgram: 'empty',
    //     fs: 'empty',
    //     net: 'empty',
    //     tls: 'empty',
    //     child_process: 'empty',
    // },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: 'initial',
                    name: 'vendor',
                    enforce: true,
                },
            },
        },
    },
    devtool: isProd ? false : 'eval-source-map',
    resolve: {
        extensions: [
            '.js',
            '.jsx',
            '.scss',
            '.css',
            '.png',
            '.svg',
            '.ts',
            '.tsx'
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "build"),
        },
        historyApiFallback: true,
        port: 3000,
        open: false,
        compress: true,
        hot: true,
    },
    module: {
        rules: [

            /*json loader*/
            {
                test: /\.json$/i,
                loader: 'json5-loader',
                type: 'javascript/auto',
            },

            /*css loader*/
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },

            {
                test: /\.(sa|sc)ss$/,
                exclude: /\.module\.s(a|c)ss$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {importLoaders: 1}
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: generateSourceMap
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: generateSourceMap
                        }
                    }
                ]
            },


            /*scss module  loader*/
            {
                test: /\.module\.s(a|c)ss$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: cssModuleOptions,
                            importLoaders: 1
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: generateSourceMap
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: generateSourceMap
                        }
                    }
                ]
            },

            /*less loader*/
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                modifyVars: {
                                    'hack': `true;@import "${require.resolve('antd/lib/style/color/colorPalette.less')}";`,
                                    ...darkThemeVars,
                                    "@primary-color": "#39D98A",
                                    "@body-background": "#15171F",
                                    "@component-background": "#1C1E28",
                                    "@popover-background": "#1C1E28",
                                    "@btn-primary-color": "#1C1E28",
                                },
                                javascriptEnabled: true,
                                sourceMap: true,
                            },
                        },
                    }
                ]
            },


            /*img loader*/
            {
                test: /\.(?:ico|png|jpg|jpeg|svg|gif)$/,
                exclude: /node_modules/,
                type: 'asset/resource',
                parser: {
                    dataUrlCondition: {
                        maxSize: 30 * 1024,
                    },
                },
            },

            /*fonts loader*/
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[hash][ext][query]',
                },
            },

            /*jsx loader*/
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: isProd ? /core-js|regenerator-runtime/ : /node_modules/,
                use: {
                    loader: "babel-loader",

                    options: {
                        cacheDirectory: isProd,
                        cacheCompression: isProd,
                        compact: isProd,
                    },
                },
            },
        ],
    },

};