'use strict'

const expressWS = require('express-ws')

const { default: PQueue } = require('p-queue')
const puppeteer = require('puppeteer')
const path = require('path')
const os = require('os')
const fs = require('fs-extra')

const { autoScroll } = require('./utils')

const AppServer = require('./AppServer')
const expressApp = require('./expressApp')
const Recorder = require('./Recorder')
const ProxyServer = require('./ProxyServer')

let appServer = new AppServer()
appServer.bindApp(expressApp, new Recorder())
appServer.bindProxy(new ProxyServer())

appServer.route(function(self) {
  self.app.post('/article', async (req, res) => {
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
  self.app.all('/job', async function(req, res) {
    let action = req.query.act || 'start'
    switch (action) {
      case "start":
        {
          if (!self.job) {
            const CronJob = require('cron').CronJob
            const job = new CronJob('0 */2 * * * *', async function() {
              let ChromiumPath = path.join(__dirname, '../.local-chromium/win64-706915/chrome-win/chrome.exe')
              const browser = await puppeteer.launch({
                args: [
                  '--disable-gpu',
                  '--disable-dev-shm-usage',
                  '--disable-setuid-sandbox',
                  '--no-first-run',
                  '--no-sandbox',
                  '--no-zygote'
                ],
                headless: true,
                ignoreHTTPSErrors: true,
                executablePath: ChromiumPath
              });
              let list = await self.recorder.findItems({ 'msg_sn': { $exists: true }, 'html_jpg': { $exists: false } }, 1, 5)
              let queue = new PQueue({ concurrency: 1 });
              fs.ensureDirSync(path.join(os.homedir(), '.weicai-scraper/html'))
              for (let item of list) {
                queue.add(() => {
                  return new Promise(async (resolve, reject) => {
                    let title = item.title.replace(/[|\\/?*<>:]/g, '')
                    try {
                      console.log('处理[' + item.title + ']')
                      let page = await browser.newPage();
                      await page.goto(item.content_url, {
                        timeout: 30000,
                        waitUntil: ['networkidle0']
                      });
                      await autoScroll(page);
                      await page.waitFor(3000);
                      await page.screenshot({
                        path: path.join(os.homedir(), '.weicai-scraper/html/' + title + '.jpg'),
                        fullPage: true
                      });
                      self.recorder.emitUpdate(item.msg_sn, { "html_jpg": 'html/' + title + '.jpg' })
                    } catch (err) {
                      console.log(err)
                    }
                    resolve()
                  })
                })
              }
              await queue.onIdle()
              await browser.close();
            });
            job.start();
            self.job = job
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
  self.app.ws('/weicai', function(ws, req) {
    ws.send(JSON.stringify({
      'type': 'connect',
      'data': 'success'
    }))
    ws.on('message', function(msg) {
      // 业务代码
    })
    appServer.bindWs(ws)
  })
})

module.exports = appServer;
