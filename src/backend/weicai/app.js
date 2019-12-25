'use strict'

const expressWS = require('express-ws')

const path = require('path')
const os = require('os')
const child_process = require('child_process')
const fs = require('fs-extra')
const json2csv = require('json2csv')

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
          let keywords = req.query.keywords || ''
          let list = await self.recorder.findItems({ 'msg_sn': { $exists: true }, 'title': new RegExp(keywords, 'i') }, page, size)
          let total = await self.recorder.count({ 'msg_sn': { $exists: true }, 'title': new RegExp(keywords, 'i') })
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
      case "export":
        {
          // 导出类型
          let type = req.query.type
          // 要导出的字段
          let body = req.body
          let fields = body.fields.split(',')
          console.log(fields);
          // 总记录数
          let total = await self.recorder.count({ 'msg_sn': { $exists: true } })
          // 分页处理
          let size = 100
          let page = Math.round(total / size)
          let writerStream = fs.createWriteStream('output.csv');
          for (let i = 0; i <= page; i++) {
            // 查询列表
            let list = await self.recorder.findItems({ 'msg_sn': { $exists: true } }, page, size)
            let csv = json2csv.parse(list, { fields: fields })
            csv = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)])
            writerStream.write(csv, 'UTF8')
          }
          // 标记文件末尾
          writerStream.end()
          writerStream.on('finish', function() {
            self.recorder.emit('export_status', {
              'type': 'export_status',
              'data': {
                'state': 'success'
              }
            })
          });
          writerStream.on('error', function(err) {
            self.recorder.emit('export_status', {
              'type': 'export_status',
              'data': {
                'state': 'fail'
              }
            })
            console.log(err.stack)
          });
          res.send({
            code: 200,
            msg: 'success'
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

          const workerPath = process.env.NODE_ENV === 'development' ?
            'src/worker/ScreenshotWorker.js' : path.join(__dirname, '../', 'worker/ScreenshotWorker.js')

          let screenshotWorker = child_process.fork(workerPath, [], {
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
                global.recorder.emitUpdate(item.msg_sn, { "html_jpg": 'html/' + title + '.png', "text": item.text })
                global.recorder.emit('toggleMakeImg', {
                  'row': item
                })
                screenshotWorker.kill()
              } else if (msg.event == 'complete-error') {
                let data = msg.data
                let item = data.item
                global.recorder.emit('toggleMakeImg', {
                  'row': item
                })
              }
            }
          })

          let msg_sn = req.query.msg_sn
          let list = await self.recorder.findItems({ 'msg_sn': msg_sn }, 1, 1)
          if (list.length) {
            let item = list[0]

            console.log('处理[' + item.title + ']')

            let title = item.title.replace(/[|\\/?*<>:]/g, '')

            if (typeof item.content_url == 'undefined') {
              console.log('content_url err: ' + item.content_url)
              break
            }

            screenshotWorker.send({
              'event': 'screenshot',
              'data': {
                savepath: path.join(os.homedir(), '.weicai-scraper/html/' + title + '.png'),
                item: item
              }
            })
          } else {
            console.log('未找到[msg_sn:' + msg_sn + ']的文章')
          }
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

var requestStrToMap = function(e) {
  var t = []
  let params = new URLSearchParams(e)
  params.forEach((value, name, searchParams) => {
    t[name] = value
  })
  return t
}

appServer.route(function(self) {
  self.app.all('/wechatRobot', async function(req, res) {
    console.log('wechatRobot')
    console.log(req.body)
    let body = req.body
    if (body.typeStr == '公众号推送') {
      // 要解析的推送内容
      let xml = body.content
      var xml2js = require('xml2js');
      //xml->json
      //xml2js默认会把子子节点的值变为一个数组, explicitArray设置为false
      var xmlParser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true })
      //json->xml
      var jsonBuilder = new xml2js.Builder();
      // xml -> json
      xmlParser.parseString(xml, async function(err, result) {
        if (typeof result == 'undefined') {
          return
        }

        let appmsg = result['msg']['appmsg']

        // 不是公众号推送消息跳过

        //5公众号推送,21应用消息
        if (appmsg.type != 5) {
          return
        }

        //将返回的结果再次格式化
        let citems = appmsg['mmreader']['category']['item']
        let items = []
        if (!citems.hasOwnProperty('length')) {
          items.push(citems)
        } else {
          items = citems
        }

        for (let item of items) {
          let publisher = appmsg['mmreader']['publisher']
          let rs = requestStrToMap(item.url.split('?')[1])
          let uniacc = {
            // 公众号名称
            nickname: publisher.nickname,
            // 公众号标识
            biz: rs['__biz'],
            // 公众号id
            username: publisher.username,
            // 公众号头像
            headimg: '',
          }
          let list = await self.recorder.findItems({ 'is_uniacc': { $exists: true }, 'username': uniacc.username })

          if (list && list.length) {
            let luniacc = list[0]
            await self.recorder.updateItems({ _id: luniacc._id }, Object.assign(luniacc, uniacc))
          } else {
            let current_time = Math.round(new Date() / 1000)
            await self.recorder.insertItems(Object.assign({
              'is_uniacc': true,
              'create_time': current_time,
              'history_duplicate_count': 0,
              'history_end_time': current_time
            }, uniacc))
          }

          let art = {
            msg_sn: rs['sn'],
            msg_biz: rs['__biz'],
            msg_mid: rs['mid'],
            msg_idx: rs['idx'],
            title: item.title,
            msg_desc: item.digest,
            cover: item.cover,
            content_url: item.url,
            comment_id: '',
            copyright_stat: 0,
            author: item['sources']['source']['name'],
            publish_time: item.pub_time
          }
          self.recorder.emitSave(art)
        }
      });

    }
    res.send({ code: 200, msg: '', data: {} })
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
  self.app.all('/wechatCtl', async function(req, res) {
    let action = req.query.act || ''
    switch (action) {
      default:
        {
          res.send({ code: 201, msg: '未知操作', data: {} })
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
          let keywords = req.query.keywords || ''
          let list = await self.recorder.findItems({ 'is_uniacc': { $exists: true }, 'nickname': new RegExp(keywords, 'i') }, page, size)
          let total = await self.recorder.count({ 'is_uniacc': { $exists: true }, 'nickname': new RegExp(keywords, 'i') })
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
      case "fetchUrl":
        {
          const workerPath = process.env.NODE_ENV === 'development' ?
            'src/worker/FetchWorker.js' : path.join(__dirname, '../', 'worker/FetchWorker.js')

          let fetchWorker = child_process.fork(workerPath, [], {
            cwd: process.cwd(),
            env: process.env,
            stdio: [0, 1, 2, 'ipc'],
            encoding: 'utf-8'
          });

          fetchWorker.on('message', function(msg) {
            if (typeof msg == 'object') {
              if (msg.event == 'complete') {
                console.log('处理[' + url + '] killed')
                fetchWorker.kill()
              }
            }
          })

          let url = req.query.url
          console.log('处理[' + url + ']')


          if (typeof url == 'undefined') {
            console.log('content_url err: ' + url)
            break
          }

          fetchWorker.send({
            'event': 'fetch',
            'data': {
              url: url
            }
          })

          res.send({
            code: 200,
            msg: 'success'
          })
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
          let list = await self.recorder.findItems({ 'msg_sn': { $exists: true }, 'content_url': { $exists: true }, 'msg_sn': { $ne: req.body.currentMsgSn } }, 1, 1, {
            'create_time': 1,
            'detail_end_time': 1
          })
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
