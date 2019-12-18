'use strict'

class AppServer {
  constructor() {
    const self = this
    self.app = null
    self.ws = []
    self.recorder = null
    self.proxyServer = null
  }
  bindApp(app, recorder) {
    const self = this
    self.app = app
    self.recorder = recorder
  }
  bindProxy(proxyServer) {
    const self = this
    self.proxyServer = proxyServer
  }
  bindWs(clientid, ws) {
    const self = this
    self.ws[clientid] = ws
  }
  route(callback) {
    callback(this)
  }
  start() {
    const self = this
    return new Promise((resolve, reject) => {
      self.recorder.on('toggleMakeImg', (data) => {
        console.log('toggleMakeImg')
        self.ws['wcclient'].send(JSON.stringify({
          'type': 'toggleMakeImg',
          'data': data
        }))
      })
      self.recorder.on('client_update_article_list', (data) => {
        console.log('client_update_article_list')
        self.ws['wcclient'].send(JSON.stringify({
          'type': 'update',
          'data': data
        }))
      })
      self.recorder.on('client_append_article_list', (data) => {
        console.log('client_append_article_list')
        self.ws['wcclient'].send(JSON.stringify({
          'type': 'append',
          'data': data
        }))
      })
      self.recorder.on('wechat_history', (data) => {
        console.log('wechat_history')
        self.ws['wechat_history'].send(JSON.stringify(data))
      })
      self.recorder.on('article_detail', (data) => {
        console.log('article_detail')
        self.ws['article_detail'].send(JSON.stringify(data))
      })
      self.app.listen(6877, () => {
        console.log('Backend service listing on port 6877')
        resolve()
      })
    })
  }
}

module.exports = AppServer;
