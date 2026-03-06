const path = require('path');
const dotenv = require('dotenv');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { optimizeImage } = require('./.squooshrc');
const HtmlWebpackPlugin = require("html-webpack-plugin");

dotenv.config();

const mode = process.env.NODE_ENV;
const srcRelativePath = process.env.WEBPACK_SRC_RELATIVE_PATH || 'src';
const distRelativePath = process.env.WEBPACK_DIST_RELATIVE_PATH || 'dist';
const config = {
    mode: mode,
    entry: {
        'app': './src/assets/stylesheets/app.css',
        '2023_0513_1248_test/app_2023_0513_1248_test': './src/assets/scripts/app_2023_0513_1248_test.js',        
        
    },
    module: {
        rules: [
            {
                test: [/\.js$/],
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        "modules": false
                                    }
                                ]
                            ],
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: 'css-loader',
                    },
                ]
            },           
            {
                test: [/\.(glsl|vs|fs|vert|frag)$/],
                exclude: /node_modules/,
                use: [
                    'raw-loader', 'glslify-loader'
                ]
            },
            {
                test: [/\.ejs$/],
                use: [
                    'ejs-compiled-loader'
                ]
            }
        ]
    },
    target: 'web',
    plugins: [
        new BrowserSyncPlugin({
            host: process.env.WEBPACK_BROWSER_SYNC_HOST || 'localhost',
            port: process.env.WEBPACK_BROWSER_SYNC_PORT || 3000,
            proxy: process.env.WEBPACK_BROWSER_SYNC_PROXY || false,
            server: process.env.WEBPACK_BROWSER_SYNC_PROXY ? false : distRelativePath,
            open: false,
            files: [distRelativePath],
            injectChanges: true,
        }),
        new StylelintPlugin({ configFile: path.resolve(__dirname, '.stylelintrc.js') }),
        new ESLintPlugin({
            extensions: ['.js'],
            exclude: 'node_modules'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, `${srcRelativePath}/assets/images`),
                    to: path.resolve(__dirname, `${distRelativePath}/images`),
                    noErrorOnMissing: true,
                    transform: {
                        transformer: mode === 'production' ? optimizeImage : content => content
                    }
                }
            ]
        }),
          new HtmlWebpackPlugin({
            inject: false,
            template: path.resolve(__dirname, `${srcRelativePath}/2023_0513_1248_test.ejs`),
            filename: path.resolve(__dirname, `${distRelativePath}/2023_0513_1248_test/index.html`),
            minify: {
              collapseWhitespace: true,
              preserveLineBreaks: true,
            },
          }),
                  
        ],
}


if (mode === 'development') {
    config.devtool = 'source-map';
}

module.exports = config;
