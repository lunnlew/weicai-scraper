const path = require('path')
const os = require('os')
const fs = require('fs-extra')
const Jimp = require('jimp')
const mergeImg = require('merge-img')

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
          resolve(totalHeight);
        }
      }, 100);
    })
  });
}

var pageScreenshot = async function(page, filename) {
  let {
    pageHeight,
    viewport
  } = await page.evaluate(() => {
    window.scrollTo(0, 0);
    return {
      pageHeight: document.body.scrollHeight,
      viewport: {
        height: document.body.clientHeight,
        width: document.body.clientWidth
      }
    };
  });
  let viewHeight = viewport.height
  let viewWidth = viewport.width

  let maxViewHeight = viewHeight;
  let partViewCount = Math.ceil(pageHeight / maxViewHeight);
  let lastViewHeight = pageHeight - ((partViewCount - 1) * maxViewHeight);

  let totalMarignTop = 0
  let images = []
  for (let i = 1; i <= partViewCount; i++) {
    let currentViewHeight = i !== partViewCount ? maxViewHeight : lastViewHeight
    let image = await page.screenshot({
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: viewWidth,
        height: currentViewHeight
      }
    })
    images.push(image)
    // 滚动距离
    totalMarignTop += currentViewHeight
    await page.evaluate((totalMarignTop) => {
      return new Promise((resolve, reject) => {
        $('body').css('margin-top', '-' + totalMarignTop + 'px')
        var timer = setTimeout(() => {
          clearTimeout(timer);
          resolve();
        }, 1000);
      })
    }, totalMarignTop)
  }

  return new Promise(async (resolve, reject) => {
    if (partViewCount == 1) {
      let img = await Jimp.read(images[0])
      img.write(filename)
    } else {
      let img = await mergeImg(images, {
        direction: true
      })
      img.write(filename)
    }
    resolve()
  })
}

module.exports = {
  renderSize,
  getFreePort,
  autoScroll,
  pageScreenshot
}
