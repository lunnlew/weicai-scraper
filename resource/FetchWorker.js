'use strict'
process.send('FetchWorker inited')

const puppeteer = require('puppeteer')
const path = require('path')
const os = require('os')
const fs = require('fs-extra')

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

let browser

process.on('message', async (msg) => {
  if (typeof msg == 'object') {
    if (msg.event == 'fetch') {
      console.log('event:' + msg.event)
      let url = msg.data.url

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
      await page.goto(url, {
        timeout: 30000,
        waitUntil: ['networkidle0']
      });
      await autoScroll(page)
      await page.evaluate(() => { window.scrollTo(0, 0) })
      await page.evaluate(() => {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://127.0.0.1:6877/statics/index.js";
        document.getElementsByTagName("head")[0].appendChild(script)
      })
      await page.waitFor(2000)
      await page.close()
      await browser.close()

      process.send({
        'event': 'complete',
        'data': {}
      });

    }
  }
});
