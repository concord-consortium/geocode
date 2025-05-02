'use strict';

const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// DEPLOY_PATH is set by the s3-deploy-action its value will be:
// `branch/[branch-name]/` or `version/[tag-name]/`
// See the following documentation for more detail:
//   https://github.com/concord-consortium/s3-deploy-action/blob/main/README.md#top-branch-example
const DEPLOY_PATH = process.env.DEPLOY_PATH;

// this is the base url for static files that CesiumJS needs to load
// Not required but if it's set remember to update CESIUM_BASE_URL as shown below
const cesiumBaseUrl = "cesiumStatic";

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
          loader: 'ts-loader'
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
          generator: {
            filename: 'assets/[name].[contenthash:8][ext]' // Specify the output filename here
          }
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
          type: 'asset/source'  // Exports the raw source code of the file
        },
        {
          test: /\.(kml|kmz|xml)$/i,
          type: 'asset/resource', // Emits a separate file and exports the URL
          generator: {
            filename: 'assets/[name].[contenthash:8][ext]' // Specify the output filename here
          }
        }
      ]
    },
    resolve: {
      alias: {
        process: "process/browser"
      },
      extensions: [ '.ts', '.tsx', '.js' ]
    },
    ignoreWarnings: [
      {
        // Suppress "export not found" warnings about re-exported types
        message: /export .* was not found in/,
      }
    ],
    plugins: [
      new Dotenv(),
      new ESLintPlugin({
        extensions: ['ts', 'tsx', 'js', 'jsx'],
      }),
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
        templateParameters: {
          CESIUM_BASE_URL: `/${cesiumBaseUrl}/`, // Pass the base URL to the template
        }
      }),
      new HtmlWebpackPlugin({
        filename: 'report-item/index.html',
        chunks: ['report-item'],
        template: 'src/report-item/index.html',
        favicon: 'src/public/favicon.ico',
        templateParameters: {
          CESIUM_BASE_URL: `/${cesiumBaseUrl}/`, // Pass the base URL to the template
        }
      }),
      ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
        filename: 'index-top.html',
        chunks: ['app'],
        template: 'src/index.html',
        favicon: 'src/public/favicon.ico',
        publicPath: DEPLOY_PATH,
        templateParameters: {
          CESIUM_BASE_URL: `/${cesiumBaseUrl}/`, // Pass the base URL to the template
        }
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
          { from: 'src/public' },
          { from: 'node_modules/@cesium/engine/Build/Workers', to: `${cesiumBaseUrl}/Workers` },
          { from: 'node_modules/@cesium/engine/Build/ThirdParty', to: `${cesiumBaseUrl}/ThirdParty` },
          { from: 'node_modules/@cesium/engine/Source/Assets', to: `${cesiumBaseUrl}/Assets` }
        ]
      })
    ]
  };
};
