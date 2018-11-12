const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const { NODE_ENV } = process.env;
const isDev = NODE_ENV !== 'production';

const resolve = dir => path.join(__dirname, dir);

const config = {
  mode: process.env.NODE_ENV,
  target: 'web',
  entry: './src/index.js',
  output: {
    path: resolve('dist'),
    publicPath: '/',
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].[hash].js',
    pathinfo: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: /src/,
        exclude: /node_modules/,
        options: {
          formatter: eslintFriendlyFormatter,
        },
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: /src/,
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
            options: { sourceMap: isDev },
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: isDev,
            },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: isDev },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              sourceMap: isDev,
            },
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [resolve('src'), resolve('node_modules')],
    alias: {
      src: resolve('src'),
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  stats: {
    assetsSort: '!size',
    children: false,
    chunks: false,
    colors: true,
    entrypoints: false,
    modules: false,
  },
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': NODE_ENV,
    }),
    new WebpackBar({
      name: NODE_ENV,
      color: 'green',
      profile: !isDev,
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new FriendlyErrorsWebpackPlugin({
      clearConsole: false,
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        notifier.notify({
          title: 'Webpack error',
          message: `${severity}: ${error.name}`,
          subtitle: error.file || '',
        });
      },
    }),
  ],
};

if (process.env.npm_config_report) {
  config.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 3001 }));
}

module.exports = config;
