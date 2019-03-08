const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bot-random.js',
  },
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: [
        'commander',
        'mute-structs',
        '@coast-team/mute-core',
        '@coast-team/mute-crypto',
        '@coast-team/mute-crypto-helper',
        'protobuff',
        'rxjs',
        'ws',
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
}
