'use strict'
process.send('ScreenshotWorker inited')

const puppeteer = require('puppeteer')
const path = require('path')
const os = require('os')
const Jimp = require('jimp')
const mergeImg = require('merge-img')

const revision = require('puppeteer/package').puppeteer.chromium_revision
const platform = process.platform

const cptah = `node_modules/puppeteer/.local-chromium/${platform}-${revision}/chrome-win/chrome.exe`
const ChromiumPath = path.join(__dirname, cptah)
console.log(ChromiumPath)


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

var pageScreenshot = async function(page, filename, callback) {
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
        if (typeof $ != 'undefined') {
          $('body').css('margin-top', '-' + totalMarignTop + 'px')
          var timer = setTimeout(() => {
            clearTimeout(timer);
            resolve();
          }, 1000);
        } else {
          resolve()
        }
      })
    }, totalMarignTop)
  }

  return new Promise(async (resolve, reject) => {
    if (partViewCount == 1) {
      Jimp.read(images[0]).then((img) => {
        img.write(filename, () => {
          if (callback) {
            callback(resolve)
          } else {
            resolve()
          }
        })
      })
    } else {
      mergeImg(images, {
        direction: true
      }).then((img) => {
        img.write(filename, () => {
          if (callback) {
            callback(resolve)
          } else {
            resolve()
          }
        })
      });
    }
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
      await pageScreenshot(page, savepath, (resolve) => {
        process.send({
          'event': 'complete',
          'data': {
            item: item
          }
        });
        resolve()
      }).catch(err => console.log(err))
      await page.close()

    }
  }
});
