'use strict'
const os = require('os')
const events = require('events')
const DB = require('../db').default.MediaDB

// 采集结果事件处理
class Recorder extends events.EventEmitter {
  constructor(config) {
    super(config);
    this.db = new DB(os.homedir() + '/.weicai-scraper/data.db');
  }
  // 公众号历史列表页信息保存动作
  async emitHistorySave(info) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      // 没有消息ID跳过
      if (!info.msg_sn || !info.msg_biz) {
        resolve()
        return
      }

      // 读取该公众号最近的历史页采集结束时间
      let uniacc_list = await self.findItems({ 'is_uniacc': { $exists: true }, 'biz': info.msg_biz })
      let uniacc = {}
      let current_time = Math.round(new Date() / 1000)
      let history_duplicate_count = 0
      let history_end_time = current_time
      if (uniacc_list.length) {
        uniacc = uniacc_list[0]
        if (!'history_end_time' in uniacc) {
          await self.updateItems({ biz: info.msg_biz }, Object.assign(uniacc, {
            history_end_time: history_end_time
          }))
        }
        if (!'history_duplicate_count' in uniacc) {
          await self.updateItems({ biz: info.msg_biz }, Object.assign(uniacc, {
            history_duplicate_count: history_duplicate_count
          }))
        }

        history_duplicate_count = uniacc.history_duplicate_count || history_duplicate_count
        history_end_time = uniacc.history_end_time || history_end_time
      } else {
        uniacc = {
          'is_uniacc': true,
          'biz': info.msg_biz,
          'create_time': current_time,
          'history_duplicate_count': history_duplicate_count,
          'history_end_time': history_end_time
        }
        await self.insertItems(uniacc)
      }


      // 查询是否存在记录
      let msg_list = await self.findItems({ 'msg_sn': info.msg_sn })
      // 存在记录
      if (msg_list.length) {

        console.log("history_duplicate_count:" + history_duplicate_count)
        console.log("history_end_time:" + history_end_time)

        // 如果在30分钟以外则重置文章采集重复计数
        if (history_end_time + 30 * 60 <= current_time) {
          history_duplicate_count = 0
        }
        // 采集重复计数+1
        history_duplicate_count += 1

        //
        await self.updateItems({ biz: info.msg_biz }, Object.assign(uniacc, {
          history_duplicate_count: history_duplicate_count,
          history_end_time: current_time
        }))

        // 超出限制计数，发起采集中断事件，并更新采集结束时间
        if (history_duplicate_count > 3) {
          console.log('达到30分钟内重复文章达到3篇')
          self.emit('wechat_history', {
            'type': 'pause'
          })
          resolve('limit')
          return
        }

        info = Object.assign(msg_list[0], info)
        self.db.update({ 'msg_sn': info.msg_sn }, info).then(() => {
          self.emit('client_update_article_list', info)
        })

      } else {

        await self.updateItems({ biz: info.msg_biz }, Object.assign(uniacc, {
          history_duplicate_count: history_duplicate_count,
          history_end_time: history_end_time
        }))

        info = Object.assign({
          'create_time': current_time
        }, info)
        self.db.insert(info || {}).then(() => {
          self.emit('client_append_article_list', info)
        })
      }
      resolve('')
    })
  }
  // 保存记录事件
  async emitCommentsSave(info) {
    const self = this;
    if (!info.comment_id) {
      return
    }
    self.db.find({ 'msg_sn': { $exists: true }, 'comment_id': info.comment_id }).then((res) => {
      if (res && res.length) {
        info = Object.assign(res[0], info)
        self.db.update({ 'msg_sn': { $exists: true }, 'comment_id': info.comment_id }, info).then(() => {})
      } else {
        // info = Object.assign({
        //   'is_comment': true,
        //   'create_time': Math.round(new Date() / 1000)
        // }, info)
        // self.db.insert(info || {}).then(() => {
        // })
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  // 保存记录事件
  async emitSave(info) {
    const self = this;
    if (!info.msg_sn) {
      return
    }
    self.db.find({ 'msg_sn': info.msg_sn }).then((res) => {
      if (res && res.length) {
        info = Object.assign(res[0], info)
        self.db.update({ 'msg_sn': info.msg_sn }, info).then(() => {
          self.emit('client_update_article_list', info)
        })
      } else {
        info = Object.assign({
          'create_time': Math.round(new Date() / 1000)
        }, info)
        self.db.insert(info || {}).then(() => {
          self.emit('client_append_article_list', info)
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  }
  // 更新记录事件
  async emitUpdate(msg_sn, info) {
    const self = this;
    self.db.find({ 'msg_sn': msg_sn }).then((res) => {
      if (res && res.length) {
        info = Object.assign(res[0], info)
        self.db.update({ 'msg_sn': msg_sn }, info).then(() => {
          self.emit('client_update_article_list', info)
        })
      } else {
        info = Object.assign({
          'create_time': Math.round(new Date() / 1000)
        }, info)
        self.db.insert(info || {}).then(() => {
          self.emit('client_append_article_list', info)
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  }
  // 新增记录事件
  async emitAppend(info) {
    const self = this;
    self.db.find({ 'msg_sn': info.msg_sn }).then((res) => {
      if (res && res.length) {
        info = Object.assign(res[0], info)
        self.db.update({ 'msg_sn': info.msg_sn }, info).then(() => {
          self.emit('client_update_article_list', info)
        })
      } else {
        info = Object.assign({
          'create_time': Math.round(new Date() / 1000)
        }, info)
        self.db.insert(info || {}).then(() => {
          self.emit('client_append_article_list', info)
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  }
  // 删除记录事件
  async emitDelete(msg_sn, info) {}

  async findItems(conditions, page, size, sorts) {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.db.find(conditions, page, size, sorts).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async updateItems(conditions, item) {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.db.update(conditions, item).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async insertItems(item) {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.db.insert(item).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async deleteItems(conditions, options) {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.db.remove(conditions, options).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async count(conditions) {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.db.count(conditions).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }
}
module.exports = Recorder;
