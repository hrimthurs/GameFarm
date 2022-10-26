const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

const pathPublic = path.join(__dirname, 'public')

const cfgBase = {
    resolve: {
        fallback: {
            path: require.resolve('path-browserify'),
            zlib: require.resolve('browserify-zlib'),
            stream: require.resolve('stream-browserify')
        }
    },

    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                        cacheDirectory: true
                    }
                }
            }
        ]
    }
}

const cfgProd = {
    mode: 'production',

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            minify: TerserPlugin.uglifyJsMinify,
            extractComments: false,
            terserOptions: {
                output: {
                    comments: false
                },
                mangle: {
                    reserved: [ 'Corn', 'Chicken', 'Cow' ]
                },
                compress: {
                    unsafe: true
                }
            }
        })]
    }
}

const cfgDev = {
    mode: 'development',

    devtool: 'source-map',
    optimization: { minimize: false }
}

const cfgDevLive = {
    ...cfgDev,

    devServer: {
        static: [pathPublic],
        client: { logging: 'none' },
        port: 9000,
        open: true,
        hot: true
    }
}

const entryPoints = {
    'prod': {
        cfg: cfgProd,
        src: 'entryMain.js',
        dst: '[name].js'
    },
    'live': {
        cfg: cfgDevLive,
        src: 'entryMain.js'
    }
}

module.exports = env => {
    let entryPoint = entryPoints[env.entry ?? 'live']

    return {
        ...cfgBase,
        ...entryPoint.cfg,

        entry: {
            build: path.join(__dirname, 'entry_points', entryPoint.src)
        },

        output: {
            filename: entryPoint.dst,
            path: pathPublic
        }
    }
}