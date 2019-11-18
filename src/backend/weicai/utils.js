// 大小转换
var renderSize = function(filesize) {
  if (null == filesize || filesize == '' || !filesize) {
    return "0 Bytes";
  }
  var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
  var index = 0;
  var srcsize = parseFloat(filesize);
  index = Math.floor(Math.log(srcsize) / Math.log(1024));
  var size = srcsize / Math.pow(1024, index);
  if (size % 1 === 0) {
    size = size.toFixed(0);
  } else {
    size = size.toFixed(2);
  }
  return size + unitArr[index];
}

var getFreePort = function() {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

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

module.exports = {
  renderSize,
  getFreePort,
  autoScroll
}
