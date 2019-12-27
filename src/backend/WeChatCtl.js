'use strict'

const events = require('events')
const path = require('path')
const child_process = require('child_process')
const fs = require('fs-extra')

const WeChatHelperWorkerPath = process.env.NODE_ENV === 'development' ?
  'src/worker/WeChatHelperWorker.js' : path.join(__dirname, '../', 'worker/WeChatHelperWorker.js')

class WeChatCtl extends events.EventEmitter {
  constructor() {
    super()
  }
  async startWechatHelper() {
    const self = this
    let WeChatHelperWorker = child_process.fork(WeChatHelperWorkerPath, [], {
      cwd: process.cwd(),
      env: process.env,
      stdio: [0, 1, 2, 'ipc'],
      encoding: 'utf-8'
    })

    WeChatHelperWorker.on('message', function(msg) {
      if (typeof msg == 'object') {
        if (msg.event == 'startCtl') {
          console.log('WeiChatWorker inited')

          let weicaiNative
          let p_WeChatDll_dir = 'd:/weicai-scraper/native'
          let p_WeChatCtl_path = path.join(p_WeChatDll_dir, "WeChatCtl.dll")
          console.log('NODE_ENV:' + process.env.NODE_ENV)

          if (process.env.NODE_ENV == 'development') {
            // 开发模式
            console.log('[dev]加载' + '../../dist_electron/native/WeicaiBinding.node')
            weicaiNative = require('../../dist_electron/native/WeicaiBinding.node')
            p_WeChatDll_dir = path.join(__dirname, "../dist_electron/native")

          } else {
            // 发布模式
            console.log('[prod]加载' + '../../dist_electron/native/WeicaiBinding.node')
            weicaiNative = require('../../dist_electron/native/WeicaiBinding.node')
            // let p_WeicaiBinding = path.join(__dirname, '../native/WeicaiBinding.node').replace(/\\/g, '/')
            // weicaiNative = require(p_WeicaiBinding)
            try {
              if (!fs.existsSync(p_WeChatCtl_path)) {
                fs.copySync(path.join(__dirname, "../native/WeChatCtl.dll"), p_WeChatCtl_path)
                console.log('copy WeChatCtl.dll success')
              } else {
                console.log('WeChatCtl.dll exists')
              }
            } catch (err) {
              console.log('copy WeChatCtl.dll err: ' + err)
            }
          }

          p_WeChatCtl_path = path.join(p_WeChatDll_dir, "WeChatCtl.dll")
          console.log('加载' + p_WeChatCtl_path)
          let loadCtlSuccess = weicaiNative.startCtrlClient(p_WeChatCtl_path)
          if (loadCtlSuccess) {
            console.log('加载控制端成功')
            setTimeout(function() {
              let enableReciveMsgHook = weicaiNative.sendCtlMsg()
              if (enableReciveMsgHook) {
                console.log('发送启用消息接收指令-完成')
              } else {
                console.log('发送启用消息接收指令-失败')
              }
            }, 2000)
          } else {
            console.log('加载控制端失败')
          }
        }
      }
    })
  }
}

module.exports = WeChatCtl
