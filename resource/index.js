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
    wecai.__Ajax__({
      type: 'POST',
      dataType: 'json',
      url: 'http://127.0.0.1:6877/scraper?act=saveAccount',
      data: uniacc
    });
  } catch (err) {}
  // var end = document.createElement("p");
  // document.body.appendChild(end);
  // (function scrollDown() {
  //   end.scrollIntoView();
  //   setTimeout(scrollDown, Math.floor(Math.random() * 5000 + 5000));
  // })();
}

// 文章详情页
if (/^\/s\//.test(url)) {

  var uniacc = {
    // 公众号名称
    nickname: nickname,
    // 公众号标识
    biz: biz,
    // 公众号id
    username: user_name,
    // 公众号头像
    headimg: ori_head_img_url,
    lang: LANG,
    key: window.key,
    wxtoken: window.wxtoken,
    pass_ticket: window.pass_ticket,
    appmsg_token: window.appmsg_token,
    a8scene: window.a8scene,
    scene: window.scene,
    expiry_time: Math.round(new Date() / 1000) + 30 * 60 - 2 * 60
  }

  try {
    wecai.__Ajax__({
      type: 'POST',
      dataType: 'json',
      url: 'http://127.0.0.1:6877/scraper?act=saveAccount',
      data: uniacc
    });
  } catch (err) {}

  //
  var article = {
    msg_sn: sn,
    msg_biz: biz,
    msg_mid: mid,
    msg_idx: idx,
    title: msg_title,
    msg_desc: msg_desc,
    cover: msg_cdn_url,
    content_url: msg_link,
    comment_id: comment_id,
    copyright_stat: copyright_stat,
    author: document.getElementsByTagName('meta')['author'].getAttribute('content'),
    publish_time: svr_time
  }

  try {
    wecai.__Ajax__({
      type: 'POST',
      dataType: 'json',
      url: 'http://127.0.0.1:6877/scraper?act=saveArticle',
      data: article
    });
  } catch (err) {}
}
