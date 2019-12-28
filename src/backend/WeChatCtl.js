'use strict'

const events = require('events')
const path = require('path')
const child_process = require('child_process')
const fs = require('fs-extra')

const WeChatHelperWorkerPath = process.env.NODE_ENV === 'development' ?
  'src/worker/WeChatHelperWorker.js' : path.join(__dirname, '../', 'worker/WeChatHelperWorker.js')

// prod模式下
// 由于没权限直接加载c盘二进制资源，须在其他盘处理

console.log('NODE_ENV:' + process.env.NODE_ENV)

let p_WeChatDll_dir = 'd:/weicai-scraper/native'
if (process.env.NODE_ENV == 'development') {
  p_WeChatDll_dir = path.join(__dirname, "../dist_electron/native")
} else {
  fs.copySync(path.join(__dirname, "../native"), p_WeChatDll_dir)
}

class WeChatCtl extends events.EventEmitter {
  constructor(weicaiNative) {
    super()
    this.WeChatHelperWorker = null
    console.log('加载' + 'WeicaiBinding.node')
    this.weicaiNative = weicaiNative
    this.isWeChatCtl = false
  }
  async startWechatHelper() {
    const self = this
    self.WeChatHelperWorker = child_process.fork(WeChatHelperWorkerPath, [], {
      cwd: process.cwd(),
      env: process.env,
      stdio: [0, 1, 2, 'ipc'],
      encoding: 'utf-8'
    })
    self.WeChatHelperWorker.on('message', function(msg) {
      if (typeof msg == 'object') {
        if (msg.event == 'startCtl') {
          console.log('WeiChatWorker inited')

          let p_WeChatCtl_path = path.join(p_WeChatDll_dir, "WeChatCtl.dll")
          console.log('加载' + p_WeChatCtl_path)
          let loadCtlSuccess = self.weicaiNative.startCtrlClient(p_WeChatCtl_path)
          if (loadCtlSuccess) {
            self.isWeChatCtl = true
            console.log('加载控制端成功')
            setTimeout(function() {
              let hookSuccess = self.weicaiNative.sendCtlMsg(502)
              if (hookSuccess) {
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
  async startAntiRevoke() {
    const self = this
    let hookSuccess = self.weicaiNative.sendCtlMsg(504)
    if (hookSuccess) {
      console.log('发送启用防撤回指令-完成')
    } else {
      console.log('发送启用防撤回指令-失败')
    }
  }
}

module.exports = WeChatCtl
