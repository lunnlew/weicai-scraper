'use strict'

const path = require('path')
const events = require('events')

// 由于 anyproxy 所依赖的 node-easy-cert 模块的依赖项 node-forge 0.6.1 版本不兼容 webpack
// 提示 ReferenceError: Invalid left-hand side in assignment 错误
// 故anyproxy采用源码引入的方式，并指定 node-forge 版本为 0.9.1
const AnyProxy = require('../anyproxy/proxy')

const options = {
  port: 6879,
  rule: require('../anyproxy_rule'),
  webInterface: {
    enable: true,
    webPort: 6878
  },
  throttle: 10000,
  forceProxyHttps: true,
  wsIntercept: false,
  silent: false
}

var generateRootCA = function() {
  return new Promise(async (resolve, reject) => {
    if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
      AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
        if (!error) {
          resolve(keyPath)
        } else {
          reject()
        }
      })
    } else {
      resolve(AnyProxy.utils.certMgr.getRootCAFilePath())
    }
  })
}

var trustRootCA = function() {
  return new Promise(async (resolve, reject) => {
    console.log("RootCAFileExists:", AnyProxy.utils.certMgr.ifRootCAFileExists());
    let spawn = require("child_process").spawn,
      child;
    let rootCaPath = await generateRootCA()
    const isWin = /^win/.test(process.platform);
    if (isWin) {
      console.log("platform:window");
      console.log("trustRootCA with cmd: ", "powershell.exe", "-WindowStyle", "Hidden", "-file", path.join(__dirname, '../tools/winset.ps1'), '-Act', 'trustRootCA', '-CaPath', rootCaPath);
      child = spawn("powershell.exe", ["-WindowStyle", "Hidden", "-file", path.join(__dirname, '../tools/winset.ps1'), '-Act', 'trustRootCA', '-CaPath', rootCaPath]);
      child.stdout.on("data", function(data) {
        console.log("Powershell Data: " + data);
      });
      child.stderr.on("data", function(data) {
        console.log("Powershell Errors: " + data);
      });
      child.on("exit", function() {
        resolve()
        console.log("Powershell Script finished");
      });
      child.stdin.end();
    } else {
      AnyProxy.utils.certMgr.trustRootCA()
      resolve()
    }
  })
}

var removeRootCA = function() {
  return new Promise(async (resolve, reject) => {
    let spawn = require("child_process").spawn,
      child;
    let rootCaPath = await generateRootCA()
    const isWin = /^win/.test(process.platform);
    if (isWin) {
      console.log("platform:window");
      console.log("removeRootCA with cmd: ", "powershell.exe", "-WindowStyle", "Hidden", "-file", path.join(__dirname, '../tools/winset.ps1'), '-Act', 'removeRootCA');
      child = spawn("powershell.exe", ["-WindowStyle", "Hidden", "-file", path.join(__dirname, '../tools/winset.ps1'), '-Act', 'removeRootCA']);
      child.stdout.on("data", function(data) {
        console.log("Powershell Data: " + data);
      });
      child.stderr.on("data", function(data) {
        console.log("Powershell Errors: " + data);
      });
      child.on("exit", function() {
        resolve()
        console.log("Powershell Script finished");
      });
      child.stdin.end();
    } else {
      AnyProxy.utils.certMgr.trustRootCA()
      resolve()
    }
  })
}

class ProxyServer extends events.EventEmitter {
  constructor() {
    super();
    const self = this
    self.proxyServer = null
  }
  async start() {
    const self = this

    await trustRootCA()
    console.log("enableGlobalProxy:", '127.0.0.1:6879');
    AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', '6879');

    console.log("enableProxyServer");
    const proxyServer = new AnyProxy.ProxyServer(options);
    proxyServer.on('ready', async () => {
      console.log('ProxyServer start ready')
    });
    proxyServer.on('error', (e) => {
      console.log('ProxyServer start error')
    });
    proxyServer.start()

    self.proxyServer = proxyServer
  }
  async close() {
    const self = this

    await removeRootCA()
    console.log("disableGlobalProxy");
    AnyProxy.utils.systemProxyMgr.disableGlobalProxy()

    console.log("closeProxyServer")
    if (self.proxyServer) {
      self.proxyServer.close()
    }

    self.proxyServer = null
  }
}

module.exports = ProxyServer;
