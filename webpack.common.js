/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
// console.clear(); // TODO: watchFix => it doesn't work properly since VSCode-terminal has bug: https://github.com/microsoft/vscode/issues/75141
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
// const PreloadPlugin = require("preload-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ObsoleteWebpackPlugin = require("obsolete-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const path = require("path");
const { SourceMapDevToolPlugin } = require("webpack");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const Dotenv = require("dotenv-webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const darkThemeVars = require("antd/dist/dark-theme");

// const srcPath = path.resolve(__dirname, "./src/");
const buildPath = path.resolve(__dirname, "/build");
const publicPath = "./public";
const filesThreshold = 8196; // (bytes) threshold for compression, url-loader plugins
// const isProd = process.env.NODE_ENV === "production"

/* eslint-disable func-names */
module.exports = function () {
  const isProd = process.env.NODE_ENV === "production";

  const target = isProd ? "browserslist" : "web";
  const generateSourceMap = process.env.GENERATE_SOURCEMAP;
  const cssModuleOptions = isProd
    ? {
        localIdentName: "[contenthash:base64:8]",
        exportLocalsConvention: "camelCase",
      }
    : { localIdentName: "[name]__[local]___[hash:base64:5]", exportLocalsConvention: "camelCase" };

  const plugins = [
    new SourceMapDevToolPlugin({
      filename: "[file].map",
    }),

    new WebpackManifestPlugin({
      fileName: "asset-manifest.json",
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: isProd ? "[name].[contenthash].css" : "[name].css",
      chunkFilename: isProd ? "[id].[contenthash].css" : "[id].css",
      ignoreOrder: true,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(path.resolve(__dirname, "./public/"), "index.html"),
      // inject: true,
      /* For production*/
      minify: isProd && {
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
    new CleanPlugin.CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: publicPath,
          to: path.resolve(__dirname, buildPath),
          toType: "dir",
        },
      ],
    }),
    new webpack.ProgressPlugin(),
    new webpack.ProvidePlugin({
      React: "react", // optional: react. it adds [import React from 'react'] as ES6 module to every file into the project
    }),
    new ObsoleteWebpackPlugin({
      // optional: browser: provides popup via alert-script if browser unsupported (according to .browserlistrc)
      name: "obsolete",
      promptOnNonTargetBrowser: true, // show popup if browser is not listed in .browserlistrc
      // optional: browser: [template: 'html string here']
    }),
    new ScriptExtHtmlWebpackPlugin({
      // it adds to obsolete-plugin-script 'async' tag (for perfomance puprpose)
      async: "obsolete",
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new CaseSensitivePathsPlugin(),
    new FriendlyErrorsWebpackPlugin(),
  ];

  if (process.env.SERVE) {
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  /** @type {import('webpack').Configuration} */
  const result = {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "eval-cheap-module-source-map",
    entry: path.resolve(__dirname, "./src/", "index.js"),
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
      version: false,
    },

    output: {
      pathinfo: true,
      publicPath: "/",
      filename: isProd ? "static/js/[name].[contenthash].js" : "[name].js",
      chunkFilename: isProd ? "static/js/[name].[chunkhash:8].chunk.js" : "[name].chunk.js",
      path: path.resolve(__dirname, "build"),
      assetModuleFilename: "static/media/[contenthash][ext][query]",
    },
    resolve: {
      extensions: [".js", ".jsx", ".scss", ".css", ".png", ".svg", ".ts", ".tsx"],
    },

    /* Right*/
    optimization: {
      // config is taken from vue-cli
      splitChunks: {
        // for avoiding duplicated dependencies across modules
        minChunks: 1, // Minimum number of chunks that must share a module before splitting.
        cacheGroups: {
          defaultVendors: {
            name: "chunk-vendors", // move js-files from node_modules into splitted file [chunk-vendors].js
            test: /[\\/]node_modules[\\/]/, // filtering files that should be included
            priority: -10, // a module can belong to multiple cache groups. The optimization will prefer the cache group with a higher priority
            chunks: "initial", // type of optimization: [initial | async | all]
          },
          common: {
            name: "chunk-common", // move reusable nested js-files into splitted file [chunk-common].js
            minChunks: 2, // minimum number of chunks that must share a module before splitting
            priority: -20,
            chunks: "initial",
            reuseExistingChunk: true, // If the current chunk contains modules already split out from the main bundle, it will be reused instead of a new one being generated. This can impact the resulting file name of the chunk
          },
        },
      },
    },
    module: {
      rules: [
        /* json loader*/
        {
          test: /\.json$/i,
          loader: "json5-loader",
          type: "javascript/auto",
        },

        /* css loader*/
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },

        {
          test: /\.(sa|sc)ss$/,
          exclude: /\.module\.s(a|c)ss$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { importLoaders: 1 },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: generateSourceMap,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: generateSourceMap,
              },
            },
          ],
        },

        /* scss module  loader*/
        {
          test: /\.module\.s(a|c)ss$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                // modules: cssModuleOptions,
                modules: {
                  auto: /\.module\.\w+$/, // enable css-modules option for files *.module*.
                  getLocalIdent: !isProd
                    ? (loaderContext, _localIdentName, localName, options) => {
                        const request = path
                          .relative(options.context || "", loaderContext.resourcePath)
                          .replace(`src${path.sep}`, "")
                          .replace(".module.css", "")
                          .replace(".module.scss", "")
                          .replace(/\\|\//g, "-")
                          .replace(/\./g, "_");

                        return `${request}__${localName}`;
                      }
                    : cssModuleOptions,
                },
                importLoaders: 1,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: generateSourceMap,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: generateSourceMap,
              },
            },
          ],
        },

        /* less loader*/
        {
          test: /\.less$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  modifyVars: {
                    hack: `true;@import "${require.resolve("antd/lib/style/color/colorPalette.less")}";`,
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
            },
          ],
        },

        /* img loader*/
        {
          test: /\.(?:ico|png|jpg|jpeg|svg|gif)$/,
          exclude: /node_modules/,
          type: "asset/resource",
          parser: {
            dataUrlCondition: {
              maxSize: 30 * 1024,
            },
          },
        },

        /* fonts loader*/
        {
          test: /\.(ttf|woff|woff2|eot)$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[hash][ext][query]",
          },
        },

        /* jsx loader*/
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
        /* tsx loader*/
        {
          test: /\.(ts|tsx)$/,
          exclude: isProd ? /core-js|regenerator-runtime/ : /node_modules/,
          use: [
            "babel-loader",
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
    plugins,
    target,
  };

  return result;
};

module.exports.filesThreshold = filesThreshold;
module.exports.assetsPath = publicPath;
