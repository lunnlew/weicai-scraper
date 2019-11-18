'use strict'

const express = require('express')
const compress = require('compression')
const expressWS = require('express-ws')
const bodyParser = require('body-parser')
const events = require('events')

const { default: PQueue } = require('p-queue')
const puppeteer = require('puppeteer')
const path = require('path')
const os = require('os')
const fs = require('fs-extra')

var autoScroll = function(page) {
  return page.evaluate(() => {
    return new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    })
  });
}

// Ws事件处理
class WsServer extends events.EventEmitter {
  constructor(recorder) {
    if (!recorder) {
      throw new Error('recorder is required for ws interface');
    }
    super();
    const self = this;
    self.recorder = recorder;
    self.app = null;
    self.ws = null;
    self.proxyServer = null;;
    self.job = null;
  }

  start() {
    const self = this;
    const recorder = self.recorder;
    return new Promise((resolve, reject) => {
      var app = express()
      expressWS(app)
      app.use(bodyParser.json())
      app.use(compress())
      var allowCors = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        res.header('Access-Control-Allow-Credentials', true)
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With')
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
        if (req.method === 'OPTIONS') {
          res.send(200)
        } else {
          next()
        }
      }
      app.use(allowCors)
      app.get('/', (req, res) => {
        res.end("welcome!!")
      })
      app.post('/article', async (req, res) => {
        let action = req.query.act || ''
        switch (action) {
          case "list":
            {
              let page = req.query.page || 1
              let size = req.query.size || 10
              let list = await recorder.findItems({ 'msg_sn': { $exists: true } }, page, size)
              let total = await recorder.count({ 'msg_sn': { $exists: true } })
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
              let list = await recorder.findItems({ 'msg_sn': msg_sn })
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
      app.all('/proxy', async function(req, res) {
        let action = req.query.act || 'start'
        switch (action) {
          case "start":
            {
              const ProxyServer = require('./ProxyServer')
              var proxyServer = new ProxyServer()
              await proxyServer.start()
              self.proxyServer = proxyServer
              res.send({ code: 200, msg: 'start proxy success', data: {} })
              break
            }
          case "close":
            {
              if (self.proxyServer) {
                await self.proxyServer.close()
                self.proxyServer = null
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
      app.all('/job', async function(req, res) {
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
                  let list = await recorder.findItems({ 'msg_sn': { $exists: true }, 'html_jpg': { $exists: false } }, 1, 5)
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
                          recorder.emitUpdate(item.msg_sn, { "html_jpg": 'html/' + title + '.jpg' })
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
      app.all('/setting', async function(req, res) {
        console.log(req)
        let action = req.query.act || 'get'
        switch (action) {
          case "save":
            {
              let list = await recorder.findItems({ 'is_setting': { $exists: true } })
              if (list && list.length) {
                let sett = list[0]
                await recorder.updateItems({ _id: sett._id }, Object.assign(sett, req.body))
              } else {
                await recorder.insertItems(Object.assign({
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
              let list = await recorder.findItems({ 'is_setting': { $exists: true } })
              res.send({ code: 200, msg: 'success', data: list.length ? list[0] : {} })
              break
            }
        }
      })
      app.listen(6877, () => {
        console.log('Backend service listing on port 6877')
        resolve()
      })
      app.ws('/weicai', function(ws, req) {
        self.ws = ws

        ws.send(JSON.stringify({
          'type': 'connect',
          'data': 'success'
        }))

        ws.on('message', function(msg) {
          // 业务代码
        })
      })

      self.app = app

      recorder.on('update', (data) => {
        console.log('recorder update')
        self.ws.send(JSON.stringify({
          'type': 'update',
          'data': data
        }))
      })

      recorder.on('append', (data) => {
        console.log('recorder append')
        self.ws.send(JSON.stringify({
          'type': 'append',
          'data': data
        }))
      })
    })
  }
}

module.exports = WsServer;
