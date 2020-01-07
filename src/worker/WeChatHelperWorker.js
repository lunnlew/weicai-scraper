console.log('WeiChatWorker starting')

const path = require('path')
const fs = require('fs-extra')

let weicaiNative

// 发布模式配置
let p_WeicaiBinding = path.join(__dirname, '../native/WeicaiBinding.node').replace(/\\/g, '/')
let p_WeChatDll_dir

if (process.env.NODE_ENV == 'development') {
  // 开发模式
  console.log('[dev]加载' + '../../dist_electron/native/WeicaiBinding.node')
  weicaiNative = require('../../dist_electron/native/WeicaiBinding.node')
  p_WeChatDll_dir = path.join(__dirname, "../../dist_electron/native")
} else {
  // 发布模式
  console.log('[prod]加载' + p_WeicaiBinding)
  weicaiNative = require(p_WeicaiBinding)
  p_WeChatDll_dir = path.join(__dirname, "../native")
}
let wechatVersion = weicaiNative.GetWechatVersion().replace(/\./g, '')

let p_WeChatDll_name = `WeChatHelper${wechatVersion}.dll`

process.on('message', async (msg) => {
  if (typeof msg == 'object') {

    if ([26852, 27188, 27276, 27278, 28088, 280106, 280111].indexOf(parseInt(wechatVersion)) == -1) {
      process.send({
        'event': 'NotSupportedWechatVersion',
        'data': {
          version: wechatVersion
        }
      })
      return
    }

    if (msg.event == 'startWechatCtl') {
      let p_WeChatCtl_path = path.join(p_WeChatDll_dir, "WeChatCtl.dll")
      console.log('加载' + p_WeChatCtl_path)
      let loadCtlSuccess = weicaiNative.startCtrlClient(p_WeChatCtl_path)
      if (loadCtlSuccess) {
        console.log('加载控制端成功')
      } else {
        console.log('加载控制端失败')
      }
    }

    if (msg.event == 'openNewWechat') {
      let p_WeChatCtl_path = path.join(p_WeChatDll_dir, p_WeChatDll_name)
      console.log('加载' + p_WeChatCtl_path)
      let ret = weicaiNative.openNewWechat(p_WeChatDll_dir, p_WeChatDll_name)
      if (ret) {
        console.log('新开微信成功')
      } else {
        console.log('新开微信失败')
      }
    }

    if (msg.event == 'closeAllWechat') {
      let ret = weicaiNative.closeAllWechat()
      if (ret) {
        console.log('关闭微信成功')
      } else {
        console.log('关闭微信失败')
      }
    }

    if (msg.event == 'closeWechat') {
      let processId = msg.data.processId
      let ret = weicaiNative.closeWechatProcess(parseInt(processId))
      if (ret) {
        console.log('关闭微信成功')
      } else {
        console.log('关闭微信失败')
      }
    }

    if (msg.event == 'sendCtlMsg') {
      let cname = msg.data.cname
      let mtype = msg.data.mtype
      let ret = weicaiNative.sendCtlMsg(cname, parseInt(mtype))
      if (ret) {
        console.log('发送控制消息成功')
      } else {
        console.log('发送控制消息失败')
      }
    }
  }
})
