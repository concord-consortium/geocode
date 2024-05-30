'use strict';
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// DEPLOY_PATH is set by the s3-deploy-action its value will be:
// `branch/[branch-name]/` or `version/[tag-name]/`
// See the following documentation for more detail:
//   https://github.com/concord-consortium/s3-deploy-action/blob/main/README.md#top-branch-example
const DEPLOY_PATH = process.env.DEPLOY_PATH;

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  return {
    context: __dirname, // to automatically find tsconfig.json
    devtool: 'source-map',
    entry: {
      "app": "./src/index.tsx",
      "report-item": "./src/report-item/index.tsx"
    },
    mode: 'development',
    output: {
      filename: 'assets/[name].[hash].js',
    },
    performance: { hints: false },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          enforce: 'pre',
          use: [
            {
              loader: 'tslint-loader',
              options: {}
            }
          ]
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
          }
        },
        {
          test: /\.(sa|sc|c)ss$/i,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|woff|woff2|eot|ttf)$/,
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'assets/[name].[ext]',
            publicPath: function(url) {
              // cf. https://github.com/webpack-contrib/file-loader/issues/160#issuecomment-349771544
              return devMode ? url : url.replace(/assets/, '.');
            }
          }
        },
        {
          test: /\.svg$/,
          oneOf: [
            {
              // Do not apply SVGR import in (S)CSS files.
              issuer: /\.scss$/,
              use: 'url-loader'
            },
            {
              issuer: /\.tsx?$/,
              loader: '@svgr/webpack'
            }
          ]
        },
        {
          test: /\.csv$/,
          use: [
            'dsv-loader'
          ]
        },
        {
          test: /\.(txt|vel)$/i,
          use: [
            {
              loader: 'raw-loader',
              options: {
                esModule: false,
              },
            },
          ],
        },
        {
          test: /\.(kmz)$/i,
          use: [
            {
              loader: 'file-loader'
            },
          ],
        }
      ]
    },
    resolve: {
      extensions: [ '.ts', '.tsx', '.js' ]
    },
    stats: {
      // suppress "export not found" warnings about re-exported types
      warningsFilter: /export .* was not found in/
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: devMode ? "assets/index.css" : "assets/[name].[hash].css"
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: ['app'],
        template: 'src/index.html',
        favicon: 'src/public/favicon.ico',
        publicPath: '.',
      }),
      new HtmlWebpackPlugin({
        filename: 'report-item/index.html',
        chunks: ['report-item'],
        template: 'src/report-item/index.html',
        favicon: 'src/public/favicon.ico',
        publicPath: '.',
      }),
      ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
        filename: 'index-top.html',
        chunks: ['app'],
        template: 'src/index.html',
        favicon: 'src/public/favicon.ico',
        publicPath: DEPLOY_PATH
      })] : []),
      ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
        filename: 'report-item/index-top.html',
        chunks: ['report-item'],
        template: 'src/report-item/index.html',
        favicon: 'src/public/favicon.ico',
        publicPath: DEPLOY_PATH
      })] : []),
      new CopyWebpackPlugin({
        patterns: [
          {from: 'src/public'},
          {
            from: 'src/assets',
            to: 'assets'
          }
        ],
      })
    ]
  };
};
