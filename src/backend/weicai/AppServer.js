'use strict'

class AppServer {
  constructor() {
    const self = this
    self.app = null
    self.ws = null
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
  bindWs(ws) {
    const self = this
    self.ws = ws
  }
  route(callback) {
    callback(this)
  }
  start() {
    const self = this
    return new Promise((resolve, reject) => {
      self.recorder.on('update', (data) => {
        console.log('recorder update')
        self.ws.send(JSON.stringify({
          'type': 'update',
          'data': data
        }))
      })
      self.recorder.on('append', (data) => {
        console.log('recorder append')
        self.ws.send(JSON.stringify({
          'type': 'append',
          'data': data
        }))
      })
      self.app.listen(6877, () => {
        console.log('Backend service listing on port 6877')
        resolve()
      })
    })
  }
}

module.exports = AppServer;
