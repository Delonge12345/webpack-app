/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
const { merge } = require("webpack-merge");
const CleanPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const dev = require("./webpack.dev");

module.exports = (env, argv) => {
  const devConfig = dev(env, argv);

  function remove(searchFunction) {
    devConfig.plugins.splice(devConfig.plugins.findIndex(searchFunction), 1);
  }
  // remove plugins because these aren't required for devServer
  remove((a) => a instanceof CleanPlugin.CleanWebpackPlugin);
  remove((a) => a instanceof CopyWebpackPlugin);
  remove((a) => a instanceof MiniCssExtractPlugin);
  remove((a) => a instanceof WebpackManifestPlugin);

  /** @type {import('webpack').Configuration} */
  const extendedConfig = {
    target: "web", // force target otherwise HMR doesn't work for style-loader
    devtool: "eval-cheap-module-source-map",
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
  };

  return merge(devConfig, extendedConfig);
};
