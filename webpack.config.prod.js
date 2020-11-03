const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const config = {
    entry: {
        main: './main.ts',
    },
    target: "async-node",
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /,
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        pathinfo: false
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                type: 'javascript/auto',
                test: /\.(json)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]'
                        }
                    }
                ],

                exclude: /node_modules/,

            },
            {
                test: /\.(ts)$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /pdf_viewer/],
            },
            {
                test: /\.node$/,
                loader: "native-ext-loader"
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.node'],
    },
    mode: 'production',

    stats: {
        warnings: false
    },

    optimization: {
        moduleIds: "named",

        minimize: true,
        minimizer: [new TerserPlugin({
            // sourceMap: true,
            extractComments: true,
            terserOptions: {
                ecma:8,
                warnings: false,
                keep_fnames: true,
            }
        })]
    },
    externals: ["pg", "sqlite3", "pg-hstore", "rmcast", nodeWindowsServiceExternals],
    plugins: [
        new CleanWebpackPlugin(),
    ]
};

function nodeWindowsServiceExternals({context, request}, arg3) {
    // var context = opts.arg1;
    // var request = opts.arg2;
    var callback = arg3;

    var importType = "commonjs";

    if(context.indexOf("\\node-windows\\") > 0) {
        if(request.substr(0, 2) === "./") {
            request = `./data/node-windows/lib/${request.substr(2)}`
        }
        return callback(null, importType + ' ' + request);
    } else if(request.indexOf("node-windows") >= 0) {
        return callback(null, importType + ' ' + request);
    } else {
        return  callback();
    }
}

module.exports = config;
