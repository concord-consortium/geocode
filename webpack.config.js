'use strict';

const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
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
    devtool: devMode ? 'eval-cheap-module-source-map' : 'source-map',
    entry: {
      "app": "./src/index.tsx",
      "report-item": "./src/report-item/index.tsx"
    },
    mode: 'development',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets/[name].[chunkhash:8].js',
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
          test: /\.css$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader, "css-loader"
          ]
        },
        {
          test: /\.(png|woff|woff2|eot|ttf)$/,
          type: 'asset',
        },
        {
          test: /\.svg$/i,
          exclude: /\.nosvgo\.svg$/i,
          oneOf: [
            {
              // Do not apply SVGR import in CSS files.
              issuer: /\.(css|scss|less)$/,
              type: 'asset',
            },
            {
              issuer: /\.tsx?$/,
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      // cf. https://github.com/svg/svgo/releases/tag/v2.4.0
                      name: 'preset-default',
                      params: {
                        overrides: {
                          // don't minify "id"s (i.e. turn randomly-generated unique ids into "a", "b", ...)
                          // https://github.com/svg/svgo/blob/master/plugins/cleanupIDs.js
                          cleanupIds: { minify: false },
                          // leave <line>s, <rect>s and <circle>s alone
                          // https://github.com/svg/svgo/blob/master/plugins/convertShapeToPath.js
                          convertShapeToPath: false,
                          // leave "class"es and "id"s alone
                          // https://github.com/svg/svgo/blob/master/plugins/prefixIds.js
                          // prefixIds: false,
                          // leave "stroke"s and "fill"s alone
                          // https://github.com/svg/svgo/blob/master/plugins/removeUnknownsAndDefaults.js
                          removeUnknownsAndDefaults: { defaultAttrs: false },
                          // leave viewBox alone
                          removeViewBox: false
                        }
                      }
                    }
                  ]
                }
              }
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
          test: /\.(kmz|xml)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                esModule: false,
              },
            },
          ],
        }
      ]
    },
    resolve: {
      extensions: [ '.ts', '.tsx', '.js' ],
      alias: {
        process: "process/browser"
      },
    },
    ignoreWarnings: [
      {
        // Suppress "export not found" warnings about re-exported types
        message: /export .* was not found in/,
      }
    ],
    plugins: [
      // since we updated to webpack 5, we need to polyfill node modules
      // because the current version of pixijs we are using needs 'path'
      // if we update pixijs to a newer version, we can probably remove this
      // see: https://github.com/webpack/changelog-v5#automatic-nodejs-polyfills-removed
      new NodePolyfillPlugin(),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new MiniCssExtractPlugin({
        filename: devMode ? 'assets/[name].css' : 'assets/[name].[chunkhash:8].css',
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: ['app'],
        template: 'src/index.html',
        favicon: 'src/public/favicon.ico',
      }),
      new HtmlWebpackPlugin({
        filename: 'report-item/index.html',
        chunks: ['report-item'],
        template: 'src/report-item/index.html',
        favicon: 'src/public/favicon.ico',
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
        publicPath: `../${DEPLOY_PATH}`
      })] : []),
      new CopyWebpackPlugin({
        patterns: [
          {from: 'src/public'}
        ],
      })
    ]
  };
};
