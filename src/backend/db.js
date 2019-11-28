const Datastore = require('nedb')
const fs = require('fs')

var DB = {}

DB.MediaDB = function(file) {
  file = file || 'data.db'
  DB.db = new Datastore({
    filename: file,
    autoload: true
  })
  DB.db.persistence.setAutocompactionInterval(5001)
}

DB.MediaDB.prototype.count = function(conditions) {
  return new Promise(function(resolve, reject) {
    DB.db.count(conditions, function(err, count) {
      if (err) {
        DB.printErrorInfo(err)
        reject(err)
      } else {
        resolve(count)
      }
    })
  })
}

DB.MediaDB.prototype.find = function(conditions, page, size, sorts) {
  return new Promise(function(resolve, reject) {
    sorts = sorts || {
      'create_time': -1
    }
    page = parseInt(page)
    size = parseInt(size)
    DB.db.find(conditions).sort(sorts).skip((page - 1) * size).limit(size).exec(function(err, docs) {
      if (err) {
        DB.printErrorInfo(err)
        reject(err)
      } else {
        resolve(docs)
      }
    })
  })
}

DB.MediaDB.prototype.insert = function(item) {
  return new Promise(function(resolve, reject) {
    DB.db.insert(item, function(err, docs) {
      if (err) {
        DB.printErrorInfo(err)
        reject(err)
      } else {
        resolve(docs)
      }
    })
  })
}

DB.MediaDB.prototype.update = function(conditions, item) {
  return new Promise(function(resolve, reject) {
    DB.db.update(conditions, item, function(err, docs) {
      if (err) {
        DB.printErrorInfo(err)
        reject(err)
      } else {
        resolve(docs)
      }
    })
  })
}

DB.MediaDB.prototype.remove = function(conditions, options) {
  return new Promise(function(resolve, reject) {
    DB.db.remove(conditions, options, function(err, numRemoved) {
      if (err) {
        DB.printErrorInfo(err)
        reject(err)
      } else {
        resolve(numRemoved)
      }
    })
  })
}

DB.printErrorInfo = function(err) {
  console.log('Error Message:' + err.message + ' ErrorNumber:' + err.errno)
}

export default DB
