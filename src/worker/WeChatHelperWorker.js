console.log('WeiChatWorker starting')

const path = require('path')
const fs = require('fs-extra')

let weicaiNative
let p_WeicaiBinding = path.join(__dirname, '../native/WeicaiBinding.node').replace(/\\/g, '/')

// 预定义DLL地址
let p_WeChatDll_dir = 'd:/weicai-scraper/native'
let p_WeChatHelper_path = path.join(p_WeChatDll_dir, "WeChatHelper.dll")
console.log('NODE_ENV:' + process.env.NODE_ENV)

let wechatVersion

if (process.env.NODE_ENV == 'development') {

  // 开发模式
  console.log('[dev]加载' + '../../dist_electron/native/WeicaiBinding.node')
  weicaiNative = require('../../dist_electron/native/WeicaiBinding.node')
  wechatVersion = weicaiNative.GetWechatVersion().replace(/\./g, '')
  p_WeChatDll_dir = path.join(__dirname, "../../dist_electron/native")
  p_WeChatDll_name = `WeChatHelper${wechatVersion}.dll`

} else {

  // 发布模式
  console.log('[prod]加载' + p_WeicaiBinding)
  weicaiNative = require(p_WeicaiBinding)
  wechatVersion = weicaiNative.GetWechatVersion().replace(/\./g, '')
  p_WeChatDll_name = `WeChatHelper.dll`
  // 由于未知原因无法直接从C盘下加载DLL资源
  // 于是复制到另外的盘符下来加载
  try {
    if (!fs.existsSync(p_WeChatHelper_path)) {
      fs.copySync(path.join(__dirname, `../native/WeChatHelper${wechatVersion}.dll`), p_WeChatHelper_path)
      console.log('copy WeChatHelper.dll success')
    } else {
      console.log('WeChatHelper.dll exists')
    }
  } catch (err) {
    console.log('copy WeChatHelper.dll err: ' + err)
  }

}

if (weicaiNative.CheckProcessExists("WeChat.exe")) {
  if (!weicaiNative.CheckProcessDllExists("WeChat.exe", p_WeChatDll_name)) {
    console.log('加载' + p_WeChatDll_dir + '/' + p_WeChatDll_name)
    let loadHelperSuccess = weicaiNative.ProcessDllInject("WeChat.exe", p_WeChatDll_dir, p_WeChatDll_name)
    if (loadHelperSuccess) {
      console.log('辅助服务端注入成功')
    } else {
      console.log('辅助服务端注入失败')
    }
  } else {
    console.log('辅助服务端已存在')
    //weicaiNative.ProcessDllUninstall("WeChat.exe", "WeChatHelper.dll")
    //console.log('ProcessDllUninstall')
  }
  process.send({
    'event': 'WeChatHelperInjectCompleted'
  })
} else {
  console.log('微信未启动')
}
