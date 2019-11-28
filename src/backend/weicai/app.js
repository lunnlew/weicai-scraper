'use strict'

const expressWS = require('express-ws')

const { default: PQueue } = require('p-queue')
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors');
const path = require('path')
const os = require('os')
const fs = require('fs-extra')

const ChromiumPath = path.join(__dirname, '../.local-chromium/win64-706915/chrome-win/chrome.exe')

const { autoScroll, pageScreenshot } = require('./utils')

const PuppeteerPool = require('./puppeteer-pool')
// 全局只应该被初始化一次
const puppeteerPool = PuppeteerPool({
  puppeteerArgs: {
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-zygote',
      '--no-sandbox'
    ],
    timeout: 0,
    pipe: true,
    headless: true,
    ignoreHTTPSErrors: true,
    executablePath: ChromiumPath,
    defaultViewport: null
  }
})


const AppServer = require('./AppServer')
const expressApp = require('./expressApp')
const Recorder = require('./Recorder')
const ProxyServer = require('./ProxyServer')
global.recorder = new Recorder()
let appServer = new AppServer()
appServer.bindApp(expressApp, recorder)
appServer.bindProxy(new ProxyServer())

appServer.route(function(self) {
  self.app.all('/article', async (req, res) => {
    let action = req.query.act || ''
    switch (action) {
      case "list":
        {
          let page = req.query.page || 1
          let size = req.query.size || 10
          let list = await self.recorder.findItems({ 'msg_sn': { $exists: true } }, page, size)
          let total = await self.recorder.count({ 'msg_sn': { $exists: true } })
          res.send({
            code: 200,
            msg: 'success',
            data: {
              'total': total,
              'list': list
            }
          })
          break
        }
      case "delete":
        {
          let _id = req.query._id
          await self.recorder.deleteItems({ '_id': _id }, {})
          res.send({
            code: 200,
            msg: 'success'
          })
          break
        }
      case "makeimg":
        {

          puppeteerPool.use(async (browser) => {
            let _id = req.query._id
            let list = await self.recorder.findItems({ '_id': _id }, 1, 1)
            let item = list[0]
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
              self.recorder.emit('toggleMakeImg', {
                'row': item
              })
              await page.close()
            } catch (err) {
              console.log(err)
            }
          })
          res.send({
            code: 200,
            msg: 'success'
          })
          break
        }
      case "detail":
        {
          let msg_sn = req.query.msg_sn
          let list = await self.recorder.findItems({ 'msg_sn': msg_sn })
          res.send({
            code: 200,
            msg: 'success',
            data: list.shift()
          })
          break
        }
      case 'preview':
        {
          let _id = req.query._id
          let list = await self.recorder.findItems({ _id: _id })
          let preview_path = list[0].html_jpg
          preview_path = path.join(os.homedir(), '.weicai-scraper/' + preview_path)
          console.log('preview_path ' + preview_path)
          if (preview_path && preview_path.indexOf('http') === 0) {
            res.status(404).end()
          } else {
            let isExistFile = false
            try {
              isExistFile = fs.statSync(preview_path).isFile()
            } catch (err) {
              console.log(err)
            }
            if (isExistFile) {
              fs.createReadStream(preview_path)
                .on('error', function(err) {
                  console.log(err.stack)
                }).pipe(res)
            } else {
              res.status(404).end('Not found')
            }
          }
          break
        }
      default:
        {
          res.send({ code: 200, msg: 'article', data: {} })
          break
        }
    }
  })
})

appServer.route(function(self) {
  self.app.all('/proxy', async function(req, res) {
    let action = req.query.act || 'start'
    switch (action) {
      case "start":
        {
          await self.proxyServer.start()
          res.send({ code: 200, msg: 'start proxy success', data: {} })
          break
        }
      case "close":
        {
          if (self.proxyServer) {
            await self.proxyServer.close()
          }
          res.send({ code: 200, msg: 'close proxy success', data: {} })
          break
        }
      default:
        {
          res.send({ code: 200, msg: 'proxy', data: {} })
          break
        }
    }
  })
})

appServer.route(function(self) {
  self.app.all('/uniacc', async function(req, res) {
    let action = req.query.act || 'list'
    switch (action) {
      case "list":
        {
          let page = req.query.page || 1
          let size = req.query.size || 10
          let list = await self.recorder.findItems({ 'is_uniacc': { $exists: true } }, page, size)
          let total = await self.recorder.count({ 'is_uniacc': { $exists: true } })
          res.send({
            code: 200,
            msg: 'success',
            data: {
              'total': total,
              'list': list
            }
          })
          break
        }
      case "delete":
        {
          let _id = req.query._id
          await self.recorder.deleteItems({ '_id': _id }, {})
          res.send({
            code: 200,
            msg: 'success'
          })
          break
        }
      case "detail":
        {
          let _id = req.query._id
          let list = await self.recorder.findItems({ '_id': _id })
          res.send({
            code: 200,
            msg: 'success',
            data: list.shift()
          })
          break
        }
      default:
        {
          res.send({ code: 200, msg: 'success', data: {} })
          break
        }
    }
  })
})

appServer.route(function(self) {
  self.app.all('/scraper', async function(req, res) {
    let action = req.query.act || ''
    console.log(req.body)
    switch (action) {
      case "saveAccount":
        {
          if (req.body.username) {
            let list = await self.recorder.findItems({ 'is_uniacc': { $exists: true }, 'username': req.body.username })
            if (list && list.length) {
              let uniacc = list[0]
              await self.recorder.updateItems({ _id: uniacc._id }, Object.assign(uniacc, req.body))
            } else {
              await self.recorder.insertItems(Object.assign({
                'is_uniacc': true,
                'create_time': Math.round(new Date() / 1000)
              }, req.body))
            }
          }
          break
        }
      case "saveArticle":
        {
          self.recorder.emitSave(req.body)
          break
        }
      case "getNextUniaccHis":
        {
          let list = await self.recorder.findItems({ 'is_uniacc': { $exists: true } }, 1, 1)
          let uniacc = {}
          if (list.length) {
            uniacc = list[0]
          }
          res.send({
            code: 200,
            msg: 'success',
            data: {
              'uniacc': uniacc
            }
          })
          break
        }
      case "getNextArticle":
        {
          let list = await self.recorder.findItems({ 'msg_sn': { $exists: true }, 'content_url': { $exists: true }, 'msg_sn': { $ne: req.body.currentMsgSn } }, 1, 1)
          let art = {}
          if (list.length) {
            art = list[0]
          }
          res.send({
            code: 200,
            msg: 'success',
            data: {
              'art': art
            }
          })
          break
        }
      default:
        {

          break
        }
    }
    res.send({ code: 200, msg: 'success', data: {} })
  })
})

appServer.route(function(self) {
  self.app.all('/job', async function(req, res) {
    let action = req.query.act || 'start'
    fs.ensureDirSync(path.join(os.homedir(), '.weicai-scraper/html'))

    switch (action) {
      case "start":
        {
          console.log('will start job task')
          if (!self.job) {
            let ScreenshotQueue = require('./ScreenshotQueue')
            let screenshotQueue = new ScreenshotQueue(self.recorder, puppeteerPool)
            screenshotQueue.start()
            self.job = screenshotQueue
          }
          res.send({ code: 200, msg: 'start job success', data: {} })
          break
        }
      case "close":
        {
          if (self.job) {
            await self.job.stop()
            self.job = null
          }
          res.send({ code: 200, msg: 'close job success', data: {} })
          break
        }
      default:
        {
          res.send({ code: 200, msg: 'job', data: {} })
          break
        }
    }
  })
})

appServer.route(function(self) {
  self.app.all('/setting', async function(req, res) {
    let action = req.query.act || 'get'
    switch (action) {
      case "save":
        {
          let list = await self.recorder.findItems({ 'is_setting': { $exists: true } })
          if (list && list.length) {
            let sett = list[0]
            await self.recorder.updateItems({ _id: sett._id }, Object.assign(sett, req.body))
          } else {
            await self.recorder.insertItems(Object.assign({
              'is_setting': true,
              'proxy_ip': "127.0.0.1",
              'proxy_port': 6879
            }, req.body))
          }
          res.send({
            code: 200,
            msg: 'success',
            data: ''
          })
          break
        }
      default:
        {
          let list = await self.recorder.findItems({ 'is_setting': { $exists: true } })
          res.send({ code: 200, msg: 'success', data: list.length ? list[0] : {} })
          break
        }
    }
  })
})


appServer.route(function(self) {
  expressWS(self.app)
  self.app.ws('/weicai/:clientid', function(ws, req) {
    console.log('client [' + req.params.clientid + '] connected')
    ws.send(JSON.stringify({
      'type': 'connect',
      'data': 'success'
    }))
    ws.on('message', function(msg) {
      // 业务代码
    })
    appServer.bindWs(req.params.clientid, ws)
  })
})

module.exports = appServer;
