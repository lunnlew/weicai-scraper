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
  // 保存记录事件
  async emitSavee(info) {
    const self = this;
    if (!info.msg_sn) {
      return
    }
    self.db.find({ 'msg_sn': info.msg_sn }).then((res) => {
      if (res && res.length) {
        info = Object.assign(res[0], info)
        self.db.update({ 'msg_sn': info.msg_sn }, info).then(() => {
          self.emit('update', info)
        })
      } else {
        self.db.insert(info || {}).then(() => {
          self.emit('append', info)
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
          self.emit('update', info)
        })
      } else {
        self.db.insert(info || {}).then(() => {
          self.emit('append', info)
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
          self.emit('update', info)
        })
      } else {
        self.db.insert(info || {}).then(() => {
          self.emit('append', info)
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  }
  // 删除记录事件
  async emitDelete(msg_sn, info) {}

  async findItems(conditions, page, size) {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.db.find(conditions, page, size).then((res) => {
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
