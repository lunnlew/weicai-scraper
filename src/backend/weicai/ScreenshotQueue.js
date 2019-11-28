'use strict'
const path = require('path')
const events = require('events')
const os = require('os')
const { autoScroll, pageScreenshot } = require('./utils')

class ScreenshotQueue extends events.EventEmitter {
  constructor(recorder, puppeteerPool) {
    super()
    this.recorder = recorder
    this.puppeteerPool = puppeteerPool
    this.list = []
    this.fstop = false
  }
  async start() {
    const self = this
    self.on('freshScreenshotList', async (data) => {
      if (self.fstop) {
        return
      }
      if (self.list.length <= 5) {
        let list = await self.recorder.findItems({ 'msg_sn': { $exists: true }, 'html_jpg': { $exists: false } }, 1, 3)
        if (list.length > 0) {
          self.list = list.concat(list)
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
        await self.puppeteerPool.use(async (browser) => {
          let title = item.title.replace(/[|\\/?*<>:]/g, '')
          try {
            console.log('处理[' + item.title + ']')
            let page = await browser.newPage();
            await page.setViewport({
              width: 1000,
              height: 1920,
              deviceScaleFactor: 1
            })
            await page.goto(item.content_url, {
              timeout: 30000,
              waitUntil: ['networkidle0']
            });
            await autoScroll(page)
            await page.evaluate(() => { window.scrollTo(0, 0) })
            await page.waitFor(1000)
            await pageScreenshot(page, path.join(os.homedir(), '.weicai-scraper/html/' + title + '.png')).catch(err => console.log(err))
            self.recorder.emitUpdate(item.msg_sn, { "html_jpg": 'html/' + title + '.png' })
            await page.close()
          } catch (err) {
            console.log(err)
          }
          return
        })
        resolve()
      })
      self.emit('freshScreenshotList')
    })
    self.emit('freshScreenshotList')
  }
  async stop() {
    this.list = []
    this.fstop = true
  }
}

module.exports = ScreenshotQueue
