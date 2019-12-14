'use strict'

;
(async () => {
  await require('./weicai/app').start()
  require('./WeChatCtl')
})();
