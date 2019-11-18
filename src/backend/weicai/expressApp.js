'use strict'

const express = require('express')
const compress = require('compression')
const expressWS = require('express-ws')
const bodyParser = require('body-parser')

var app = express()
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
module.exports = app;
