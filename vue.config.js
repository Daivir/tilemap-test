/* eslint-disable */
const WorkerPlugin = require('worker-plugin')
/*module.exports = {
  configureWebpack: {
    output: {
      globalObject: 'this'
    },
    plugins: [
      new WorkerPlugin({
        globalObject: 'self',
        preserveTypeModule: true
      })
    ]
  }
}*/

/*module.exports = {
  chainWebpack: config => {
    config.output.set('globalObject', 'this')
    config.module
      .rule()
    config.module.rules.push({
      enforce: 'pre',
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    })
  }
}*/

module.exports = {
  chainWebpack: config => {
    config.plugin("worker")
      .use(WorkerPlugin)
    config.module.rule('js').exclude.add(/\.worker\.js$/)
    config.module
      .rule('worker-loader')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
  }
}
