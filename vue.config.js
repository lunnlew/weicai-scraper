const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    entry: path.join(__dirname, 'src/renderer/main.js'),
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/renderer'),
        'vue$': 'vue/dist/vue.esm.js'
      },
      extensions: ['.js', '.vue', '.json', '.css']
    }
  },
  chainWebpack: config => {
    return config
  },
  pluginOptions: {
    // see https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html
    electronBuilder: {
      // 原生模块需要标记为外部模块
      externals: [],
      builderOptions: {
        win: {
          "target": [{
            "target": "nsis",
            "arch": [
              "ia32"
            ]
          }],
          icon: './public/app.png'
        },
        mac: {
          "extendInfo": {
            "URL types": [{
              "URL identifier": "weicai-scraper",
              "URL Schemes": [
                "weicai-scraper"
              ]
            }]
          },
          icon: './public/app.png'
        },
        "productName": "微采助手",
        "extraResources": ["./tools/**", "./resource/**", "./web/**", {
          'from': 'dist_electron/worker',
          'to': 'worker'
        }],
        "nsis": {
          "oneClick": false,
          "allowElevation": true,
          "allowToChangeInstallationDirectory": true,
          "createDesktopShortcut": true
        },
      },
      outputDir: 'dist_electron',
      chainWebpackMainProcess: config => {
        // config.node({
        //   __filename: false,
        //   __dirname: false
        // })

        // config.plugin('copy')
        //   .use(require('copy-webpack-plugin'), [
        //     [{
        //       from: path.join(__dirname, `node_modules/puppeteer/.local-chromium/${platform}-${revision}`),
        //       to: path.join(__dirname, `.local-chromium/${platform}-${revision}`)
        //     }]
        //   ])

        if (process.env.NODE_ENV === 'production') {
          config.plugin('copy')
            .use(require('copy-webpack-plugin'), [
              [{
                from: path.join(__dirname, 'src/worker'),
                to: path.join(__dirname, 'dist_electron/worker'),
                ignore: ['.*']
              }]
            ])
        }

        // require('*.node') 方式加载原生模块需要
        config.module
          .rule('node-loader')
          .test(/\.node$/)
          .use('node-loader')
          .loader('node-loader')
          .end()

        // config.module
        //   .rule('file-loader')
        //   .test(/\.node$/)
        //   .use('file-loader')
        //   .loader('file-loader')
        //   .tap(options => {
        //     options = {
        //       name: '[name].[ext]',
        //       outputPath: 'addons',
        //       publicPath: '../../app.asar.unpacked/addons'
        //     }
        //     return options
        //   })
        //   .end()

      },
      chainWebpackRendererProcess: config => {
        config.plugin('define').tap(args => {
          args[0]['IS_ELECTRON'] = true
          return args
        })
      },
      mainProcessFile: 'src/background.js',
      mainProcessWatch: ['src']
    }
  }
}
