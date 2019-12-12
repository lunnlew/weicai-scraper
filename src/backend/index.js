'use strict'

const path = require('path')

;
(async () => {
  await require('./weicai/app').start()

  let weicaiNative
  if (process.env.NODE_ENV === 'production') {
    weicaiNative = require('../native/WeicaiBinding.node')
  } else {
    weicaiNative = require('../../dist_electron/native/WeicaiBinding.node')
  }
  if (weicaiNative.CheckProcessExists("WeChat.exe")) {
    if (!weicaiNative.CheckProcessDllExists("WeChat.exe", "WeChatHelper.dll")) {
      weicaiNative.ProcessDllInject("WeChat.exe", path.join(__dirname, "native"), "WeChatHelper.dll")
      console.log('辅助服务端已注入')
    } else {
      console.log('辅助服务端已存在')
      //weicaiNative.ProcessDllUninstall("WeChat.exe", "WeChatHelper.dll")
      //console.log('ProcessDllUninstall')
    }
    let loadCtlSuccess = weicaiNative.startCtrlClient(path.join(__dirname, "native/WeChatCtl.dll"))
    if (loadCtlSuccess) {
      console.log('加载控制端成功')
      let enableReciveMsgHook = weicaiNative.sendCtlMsg()
      if (enableReciveMsgHook) {
        console.log('发送启用消息接收hook成功')
      } else {
        console.log('发送启用消息接收hook失败')
      }
    } else {
      console.log('加载控制端失败')
    }

  } else {
    console.log('微信未启动')
  }

})();
