'use strict'
process.send('ScreenshotWorker inited')

const puppeteer = require('puppeteer')
const path = require('path')
const os = require('os')
const fs = require('fs-extra')
const Jimp = require('jimp')
const mergeImg = require('merge-img')

const ChromiumPath = path.join(__dirname, '../.local-chromium/win64-706915/chrome-win/chrome.exe')


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
      Jimp.read(images[0]).then((img) => {
        img.write(filename)
      })
    } else {
      mergeImg(images, {
        direction: true
      }).then((img) => {
        img.write(filename, () => console.log('done'))
      });
    }
    resolve()
  })
}

let browser

process.on('message', async (msg) => {
  if (typeof msg == 'object') {
    if (msg.event == 'screenshot') {
      console.log('event:' + msg.event)
      let savepath = msg.data.savepath
      let item = msg.data.item

      if (!browser) {
        browser = await puppeteer.launch({
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-zygote',
            '--no-sandbox'
          ],
          timeout: 0,
          pipe: true,
          headless: true,
          ignoreHTTPSErrors: true,
          executablePath: ChromiumPath,
          defaultViewport: null
        })
      }
      let page = await browser.newPage()
      await page.setViewport({
        width: 1000,
        height: 1920,
        deviceScaleFactor: 1
      })
      await page.goto(item.content_url, {
        timeout: 30000,
        waitUntil: ['networkidle0']
      });
      await autoScroll(page)
      await page.evaluate(() => { window.scrollTo(0, 0) })
      await page.waitFor(1000)
      await pageScreenshot(page, savepath).catch(err => console.log(err))
      await page.close()

      process.send({
        'event': 'complete',
        'data': {
          item: item
        }
      });

    }
  }
});
