'use strict'

var wecai = {}
wecai.__Ajax__ = function(obj) {

  var type = (obj.type || 'GET').toUpperCase();
  var async = typeof obj.async == 'undefined' ? true : obj.async;
  var url = obj.url;
  var xhr = new XMLHttpRequest();
  var timer = null;
  var data = null;

  if (typeof obj.data == "object") {
    data = JSON.stringify(obj.data)
  } else {
    data = typeof obj.data == 'string' ? obj.data : null;
  }

  xhr.open(type, url, async);
  var _onreadystatechange = xhr.onreadystatechange;

  xhr.onreadystatechange = function() {

    if (typeof _onreadystatechange == 'function') {
      _onreadystatechange.apply(xhr);
    }
    if (xhr.readyState == 3) {
      obj.received && obj.received(xhr);
    }
    if (xhr.readyState == 4) {
      xhr.onreadystatechange = null;
      var status = xhr.status;
      if (status >= 200 && status < 400) {
        var responseText = xhr.responseText;
        var resp = responseText;
        if (obj.dataType == 'json') {
          try {
            resp = eval("(" + resp + ")");
          } catch (e) {
            obj.error && obj.error(xhr);
            return;
          }
        }
        obj.success && obj.success(resp);
      } else {
        obj.error && obj.error(xhr);
      }
      clearTimeout(timer);
      obj.complete && obj.complete();
      obj.complete = null;
    }
  };
  if (type == 'POST') {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  }
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  if (typeof obj.timeout != 'undefined') {
    timer = setTimeout(function() {
      xhr.abort("timeout");
      obj.complete && obj.complete();
      obj.complete = null;
    }, obj.timeout);
  }
  try {
    xhr.send(data);
  } catch (e) {
    obj.error && obj.error();
  }
}


var aJaxData = function(act,data) {
    return new Promise(function(resolve, reject) {
      wecai.__Ajax__({
        type: 'POST',
        dataType: 'json',
        url: 'http://127.0.0.1:6877/scraper?act='+act,
        data: data,
        success:(result)=>{
          resolve(result)
        },
        error:(err)=>{
          reject(err)
        }
      })
    })
  }

var url = location.pathname + location.search

// 历史文章列表页
if (/^\/mp\/profile_ext\?action=home/.test(url)) {
  // var params = getQueryFromURL(location.href);
  var uniacc = {
    // 公众号名称
    nickname: nickname,
    // 公众号标识
    biz: __biz,
    // 公众号id
    username: username,
    // 公众号头像
    headimg: headimg,
    lang: LANG,
    // key
    key: window.key,
    wxtoken: window.wxtoken,
    pass_ticket: window.pass_ticket,
    appmsg_token: window.appmsg_token,
    a8scene: window.a8scene,
    scene: window.scene,
    history_url: location.href,
    // 历史页链接约在30分钟失效
    expiry_time: Math.round(new Date() / 1000) + 30 * 60 - 2 * 60
  }
  try {
    aJaxData('saveAccount',uniacc)
  } catch (err) {}

  var socket = new WebSocket('ws://localhost:6877/weicai/wechat_history');
  socket.addEventListener('open', function(event) {});
  socket.addEventListener('message', function(event) {
    console.log('Message from server', event.data);
    var data = JSON.parse(event.data)
    if (data.type == 'pause') {
      clearTimeout(stime)
    }
  });

  var end = document.createElement("p");
  var stime = null;
  document.body.appendChild(end);
  (function scrollDown() {
    end.scrollIntoView();
    stime = setTimeout(scrollDown, Math.floor(Math.random() * 5000 + 5000));
  })();
}

// 文章详情页
if (/^\/s[/?]/.test(url)) {

  var uniacc = {
    // 公众号名称
    nickname: nickname,
    // 公众号标识
    biz: biz,
    // 公众号id
    username: user_name,
    // 公众号头像
    headimg: ori_head_img_url || '',
  }

  try {
    aJaxData('saveAccount',uniacc)
  } catch (err) {
    alert('ss')
  }

  var req_params = getQueryFromURL(location.href.replace(/&amp;/g, '&'))
  //
  var article = {
    msg_sn: sn || req_params['sn'],
    msg_biz: biz || req_params['__biz'],
    msg_mid: mid || req_params['mid'],
    msg_idx: idx || req_params['idx'],
    title: msg_title,
    msg_desc: msg_desc,
    cover: msg_cdn_url,
    content_url: msg_link || location.href,
    comment_id: comment_id,
    copyright_stat: copyright_stat,
    author: document.getElementsByTagName('meta')['author'].getAttribute('content'),
    publish_time: svr_time
  }

  try {
    aJaxData('saveArticle',article).then(function(result){
      // 请求下一篇文章
      aJaxData('getNextArticle',{
        'currentMsgSn':article.msg_sn
      }).then(function(result){
        let art = result.data.art
        if(art.content_url){
          setTimeout(()=>{
            //location.href = result.data.art.content_url
          }, Math.floor(Math.random() * 5000 + 5000))
        }
      })
    })
  } catch (err) {}
}
