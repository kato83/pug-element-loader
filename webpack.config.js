const path = require('path')

module.exports = {
    entry: './test/test.js',
    mode: "production",
    output: {
        path: path.join(__dirname, 'test'),
        filename: 'build.js'
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
            directory: path.join(__dirname, "test"),
        },
        port: 3000
    },
}