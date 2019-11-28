'use strict'

const expressWS = require('express-ws')

const path = require('path')
const os = require('os')
const child_process = require('child_process')
const fs = require('fs-extra')

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

          let screenshotWorker = child_process.fork(path.join(__dirname, '../', 'resource/ScreenshotWorker.js'), [], {
            cwd: process.cwd(),
            env: process.env,
            stdio: [0, 1, 2, 'ipc'],
            encoding: 'utf-8'
          });

          screenshotWorker.on('message', function(msg) {
            if (typeof msg == 'object') {
              if (msg.event == 'complete') {
                let data = msg.data
                let item = data.item
                let title = item.title.replace(/[|\\/?*<>:]/g, '')
                global.recorder.emitUpdate(item.msg_sn, { "html_jpg": 'html/' + title + '.png' })
                global.recorder.emit('toggleMakeImg', {
                  'row': item
                })
                screenshotWorker.kill()
              }
            }
          })

          let _id = req.query._id
          let list = await self.recorder.findItems({ '_id': _id }, 1, 1)
          let item = list[0]

          console.log('处理[' + item.title + ']')

          let title = item.title.replace(/[|\\/?*<>:]/g, '')
          screenshotWorker.send({
            'event': 'screenshot',
            'data': {
              savepath: path.join(os.homedir(), '.weicai-scraper/html/' + title + '.png'),
              item: item
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
              let current_time = Math.round(new Date() / 1000)
              await self.recorder.insertItems(Object.assign({
                'is_uniacc': true,
                'create_time': current_time,
                'history_duplicate_count': 0,
                'history_end_time': current_time
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
          let list = await self.recorder.findItems({ 'is_uniacc': { $exists: true } }, 1, 1, {
            'history_end_time': 1
          })
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
            let screenshotQueue = new ScreenshotQueue(self.recorder)
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
