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

class WeChatCtl extends events.EventEmitter {
  constructor() {
    super()
    const self = this
    self.WeChatHelperWorker = child_process.fork(WeChatHelperWorkerPath, [], {
      cwd: process.cwd(),
      env: process.env,
      stdio: [0, 1, 2, 'ipc'],
      encoding: 'utf-8'
    })
    self.WeChatHelperWorker.on('message', function(msg) {
      if (typeof msg == 'object') {
        if (msg.event == 'NotSupportedWechatVersion') {
          self.emit('NotSupportedWechatVersion', msg.data)
        }
      }
    })
    self.WeChatHelperWorker.on('close', function(code) {
      // TODO code=3为ipc通道退出
      console.log('子进程已退出，退出码 ' + code);
    });
    self.WeChatHelperWorker.on('error', function(err) {
      console.log(err);
    });
  }
  async startWechatCtl() {
    const self = this
    self.WeChatHelperWorker.send({
      'event': 'startWechatCtl',
      'data': {}
    })
  }
  async sendCtlMsg(cname, mtype) {
    const self = this
    self.WeChatHelperWorker.send({
      'event': 'sendCtlMsg',
      'data': {
        cname: cname,
        mtype: mtype
      }
    })
  }
  async openNewWechat() {
    const self = this
    self.WeChatHelperWorker.send({
      'event': 'openNewWechat',
      'data': {}
    })
  }
  async closeAllWechat() {
    const self = this
    self.WeChatHelperWorker.send({
      'event': 'weicaiNative',
      'data': {}
    })
  }
  async closeWechat(processId) {
    const self = this
    self.WeChatHelperWorker.send({
      'event': 'closeWechat',
      'data': {
        processId: processId
      }
    })
  }
}

module.exports = WeChatCtl
