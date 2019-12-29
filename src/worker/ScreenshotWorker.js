'use strict'
process.send('ScreenshotWorker inited')

const puppeteer = require('puppeteer')
const path = require('path')
const cheerio = require('cheerio')
const os = require('os')
const Jimp = require('jimp')
const mergeImg = require('merge-img')

const revision = require('puppeteer/package').puppeteer.chromium_revision
const platform = process.platform

const cptah = `node_modules/puppeteer/.local-chromium/${platform}-${revision}/chrome-win/chrome.exe`
const ChromiumPath = path.join(__dirname, cptah)
console.log(ChromiumPath)

String.prototype.html = function(encode) {
  var replace = ["&#39;", "'", "&quot;", '"', "&nbsp;", " ", "&gt;", ">", "&lt;", "<", "&yen;", "¥", "&amp;", "&"];
  var replaceReverse = ["&", "&amp;", "¥", "&yen;", "<", "&lt;", ">", "&gt;", " ", "&nbsp;", '"', "&quot;", "'", "&#39;"];
  var target;
  if (encode) {
    target = replaceReverse;
  } else {
    target = replace;
  }
  for (var i = 0, str = this; i < target.length; i += 2) {
    str = str.replace(new RegExp(target[i], 'g'), target[i + 1]);
  }
  return str;
};


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
  let viewHeight = 1920
  let viewWidth = viewport.width

  let maxViewHeight = viewHeight;
  let partViewCount = Math.ceil(pageHeight / maxViewHeight);
  let lastViewHeight = pageHeight - ((partViewCount - 1) * maxViewHeight);

  console.log("partViewCount： " + partViewCount)

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
  // 取得页面文本数据
  let html = await page.content()
  const $ = cheerio.load(html, { decodeEntities: false })
  let text = $('#js_content').html().replace(/<[^>]*>|/g, "").html()
  let data = {
    'text': text
  }

  return new Promise(async (resolve, reject) => {
    if (partViewCount == 1) {
      Jimp.read(images[0]).then((img) => {
        img.write(filename, () => {
          if (callback) {
            callback(resolve, data)
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
            callback(resolve, data)
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
      try {
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
            headless: false,
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
        await pageScreenshot(page, savepath, (resolve, data) => {
          process.send({
            'event': 'complete',
            'data': {
              item: Object.assign({}, item, data)
            }
          });
          resolve()
        }).catch(function(err) {
          console.log(err)
          process.send({
            'event': 'complete-error',
            'data': {
              item: item
            }
          });
        })
        await page.close()
      } catch (err) {
        console.log(err)
        process.send({
          'event': 'complete-error',
          'data': {
            item: item
          }
        });
      }
    }
  }
});
