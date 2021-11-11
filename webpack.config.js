const path = require('path')

module.exports = {
    entry: './src/index.js',
    mode: "production",
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.ce.pug$/,
                use: [
                    path.resolve(__dirname, "src/custom-loader.js"),
                ],
            },
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        port: 3000,
        open: true
    },
}