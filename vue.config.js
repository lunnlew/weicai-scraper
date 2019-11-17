const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [],
    entry: path.join(__dirname, 'src/renderer/main.js'),
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/renderer'),
        'vue$': 'vue/dist/vue.esm.js'
      },
      extensions: ['.js', '.vue', '.json', '.css']
    }
  },
  chainWebpack: config => {},
  pluginOptions: {
    // see https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html
    electronBuilder: {
      builderOptions: {
        win: {
          "target": [{
            "target": "nsis",
            "arch": [
              // "ia32",
              "x64"
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
          "from": '.local-chromium',
          "to": '.local-chromium'
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
        config.plugin('copy')
          .use(require('copy-webpack-plugin'), [
            [{
              from: path.join(__dirname, 'node_modules/puppeteer/.local-chromium'),
              to: path.join(__dirname, '.local-chromium')
            }]
          ])
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
