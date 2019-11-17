'use strict'

;
(async () => {

  const Recorder = require('./weicai/Recorder')
  const WsServer = require('./weicai/WsServer')
  global.recorder = new Recorder()
  const wsServer = new WsServer(recorder)
  await wsServer.start()

})();
