const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    plugins: [
      // 似乎只有prod模式才生效
      new CopyWebpackPlugin([{
        from: path.join(__dirname, 'src/worker'),
        to: path.join(__dirname, 'dist_electron/worker'),
        ignore: ['.*']
      }, {
        from: path.join(__dirname, 'src/native/WeChatHelper/Release/WeChatHelper.dll'),
        to: path.join(__dirname, 'dist_electron/native/WeChatHelper.dll'),
        ignore: ['.*']
      }, {
        from: path.join(__dirname, 'src/native/WeChatCtl/Release/WeChatCtl.dll'),
        to: path.join(__dirname, 'dist_electron/native/WeChatCtl.dll'),
        ignore: ['.*']
      }, {
        from: path.join(__dirname, 'src/native/WeicaiBinding/build/Release/WeicaiBinding.node'),
        to: path.join(__dirname, 'dist_electron/native/WeicaiBinding.node'),
        ignore: ['.*']
      }]),
    ],
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
          // requestedExecutionLevel: 'requireAdministrator',
          "rfc3161TimeStampServer": "http://tsa.startssl.com/rfc3161",
          "signDlls": true,
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
        }, {
          'from': 'dist_electron/native',
          'to': 'native'
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


        // 似乎只有dev模式才生效
        // 不完美-WeicaiBinding.node-会报错不存在-需要重新再次运行任务
        config.plugin('copy')
          .use(CopyWebpackPlugin, [
            [{
              from: path.join(__dirname, 'src/worker'),
              to: path.join(__dirname, 'dist_electron/worker'),
              ignore: ['.*']
            }, {
              from: path.join(__dirname, 'src/native/WeChatHelper/Debug/WeChatHelper.dll'),
              to: path.join(__dirname, 'dist_electron/native/WeChatHelper.dll'),
              ignore: ['.*']
            }, {
              from: path.join(__dirname, 'src/native/WeChatCtl/Debug/WeChatCtl.dll'),
              to: path.join(__dirname, 'dist_electron/native/WeChatCtl.dll'),
              ignore: ['.*']
            }, {
              from: path.join(__dirname, 'src/native/WeicaiBinding/build/Release/WeicaiBinding.node'),
              to: path.join(__dirname, 'dist_electron/native/WeicaiBinding.node'),
              ignore: ['.*']
            }]
          ])

        if (process.env.NODE_ENV === 'production') {
          config.plugin('define').tap(args => {
            args[0]['NODE_ENV'] = "production"
            return args
          })
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
