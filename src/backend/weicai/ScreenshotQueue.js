'use strict'
const path = require('path')
const events = require('events')
const os = require('os')
const child_process = require('child_process')
const { autoScroll, pageScreenshot } = require('./utils')
const empty = () => {};

class ScreenshotQueue extends events.EventEmitter {
  constructor(recorder, puppeteerPool) {
    super()
    const self = this
    self.recorder = recorder
    self.puppeteerPool = puppeteerPool
    self.list = []
    self.fstop = false
    self.complete = false
    self._resolveIdle = empty

    self.screenshotWorker = child_process.fork(path.join(__dirname, '../', 'resource/ScreenshotWorker.js'), [], {
      cwd: process.cwd(),
      env: process.env,
      stdio: [0, 1, 2, 'ipc'],
      encoding: 'utf-8'
    });
    self.screenshotWorker.on('message', function(msg) {
      if (typeof msg == 'object') {
        console.log('event:' + msg.event)
        if (msg.event == 'complete') {
          let data = msg.data
          let item = data.item
          let resolve = data.resolve
          let title = item.title.replace(/[|\\/?*<>:]/g, '')
          global.recorder.emitUpdate(item.msg_sn, { "html_jpg": 'html/' + title + '.png' })

          self.complete = true

          setTimeout(() => {
            self._resolveIdle()
            self._resolveIdle = empty
          }, 100)

        }
      }
    })
  }
  async start() {
    const self = this
    self.on('freshScreenshotList', async (data) => {
      if (self.fstop) {
        return
      }
      if (self.list.length <= 6) {
        let list = await self.recorder.findItems({ 'msg_sn': { $exists: true }, 'html_jpg': { $exists: false } }, 1, 10)
        if (list.length > 0) {
          self.list = self.list.concat(list)
        }
      }
      if (self.list.length > 0) {
        self.emit('startScreenshot')
      }
    })
    self.on('startScreenshot', async (data) => {
      if (self.fstop) {
        return
      }
      let item = self.list.shift()
      await new Promise(async (resolve, reject) => {
        console.log('处理[' + item.title + ']')
        let title = item.title.replace(/[|\\/?*<>:]/g, '')
        self.screenshotWorker.send({
          'event': 'screenshot',
          'data': {
            savepath: path.join(os.homedir(), '.weicai-scraper/html/' + title + '.png'),
            item: item
          }
        })
        await self.workerComplete()
        self.complete = false
        resolve()
      })
      self.emit('freshScreenshotList')
    })
    self.emit('freshScreenshotList')
  }
  async workerComplete() {
    const self = this
    if (self.complete) {
      return;
    }
    return new Promise(resolve => {
      const existingResolve = this._resolveIdle;
      this._resolveIdle = () => {
        existingResolve();
        resolve();
      };
    })
  }
  async stop() {
    this.list = []
    this.fstop = true
  }
}

module.exports = ScreenshotQueue
