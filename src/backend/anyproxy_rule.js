'use strict'
console.log("load anyproxy_rule")
const querystring = require('querystring')
const url = require('url')

var escape2Html = function(str) {
  var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
  return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) { return arrEntities[t]; });
}

var requestStrToMap = function(e) {
  var t = []
  let params = new URLSearchParams(e)
  params.forEach((value, name, searchParams) => {
    t[name] = value
  })
  return t
}

var saveMsg = function(dateTime, msg) {
  msg.content_url = msg.content_url.replace(/&amp;/g, '&')
  let linkParse = querystring.parse(url.parse(msg.content_url).query);
  let msgBiz = linkParse.__biz;
  let msgMid = linkParse.mid;
  let msgIdx = linkParse.idx;
  let msgSn = linkParse.sn;
  let info = {
    'msg_biz': msgBiz,
    'msg_mid': msgMid,
    'msg_idx': msgIdx,
    'msg_sn': msgSn,
    'title': msg.title,
    'content_url': msg.content_url,
    'cover': msg.cover,
    'author': msg.author,
    'copyright_stat': msg.copyright_stat,
    'publish_time': dateTime
  }
  global.recorder.emitHistorySave(info)
}

module.exports = {
  summary: 'a rule to hack response',
  * beforeSendRequest(requestDetail) {
    if (requestDetail.url.indexOf('/injectJs.js') >= 0) {
      const newRequestOptions = requestDetail.requestOptions;
      newRequestOptions.protocol = 'http:';
      newRequestOptions.hostname = '127.0.0.1'
      newRequestOptions.port = '6877';
      newRequestOptions.path = '/statics/index.js';
      newRequestOptions.method = 'GET';
      return newRequestOptions;
    }
  },
  * beforeDealHttpsRequest(requestDetail) {
    return true;
  },
  * beforeSendResponse(requestDetail, responseDetail) {
    if (responseDetail.response.statusCode == 500 ||
      responseDetail.response.statusCode == 404
    ) {
      return new Promise((resolve, reject) => {
        resolve({ response: responseDetail.response });
      });
    }
    console.log(requestDetail.requestOptions.path)
    if (requestDetail.requestOptions.hostname === 'mp.weixin.qq.com') {
      let content = responseDetail.response.body.toString()
      // 异常结果
      let error_msg = "操作频繁，请稍后再试";
      if (content.indexOf(error_msg) >= 0) {
        console.log('微信提示: ' + error_msg)
        return new Promise((resolve, reject) => {
          resolve({ response: responseDetail.response });
        });
      }
      if (/^\/mp\/profile_ext\?action=home/.test(requestDetail.requestOptions.path)) {
        // 正则匹配到JSON
        let contentJSON = /var msgList = '(.+)';\n/.exec(content)[1];
        // 转义为正常字符
        contentJSON = escape2Html(contentJSON).replace(/\\\//g, "/");
        let contentJs = JSON.parse(contentJSON);

        let list = contentJs.list;
        for (let msg of list) {
          //1 纯文本 49 富文本
          if (msg.comm_msg_info.type != 49) {
            continue
          }
          let dateTime = (msg.comm_msg_info.datetime * 1000).toString();
          if (msg.app_msg_ext_info.is_multi) {
            for (let sub_msg of msg.app_msg_ext_info.multi_app_msg_item_list) {
              saveMsg(dateTime, sub_msg)
            }
          } else {
            saveMsg(dateTime, msg.app_msg_ext_info)
          }
        }
      }
      if (/^\/mp\/profile_ext\?action=getmsg/.test(requestDetail.requestOptions.path)) {
        console.log('提取上拉加载的数据')
        let contentJs = JSON.parse(content);
        let generalMsgList = JSON.parse(contentJs.general_msg_list);
        let list = generalMsgList.list;
        for (let msg of list) {
          //1 纯文本 49 富文本
          if (msg.comm_msg_info.type != 49) {
            continue
          }
          let dateTime = (msg.comm_msg_info.datetime * 1000).toString();
          if (msg.app_msg_ext_info.is_multi) {
            for (let sub_msg of msg.app_msg_ext_info.multi_app_msg_item_list) {
              saveMsg(dateTime, sub_msg)
            }
          } else {
            saveMsg(dateTime, msg.app_msg_ext_info)
          }
        }
      }
      if (/^\/mp\/getappmsgext/.test(requestDetail.requestOptions.path)) {
        console.log('提取阅读量数据')
        let contentJs = JSON.parse(content);
        let data = requestStrToMap(requestDetail.requestData.toString())

        let msgBiz = data['__biz'];
        let msgMid = data['mid'];
        let msgIdx = data['idx'];
        let msgSn = data['sn'];
        let title = decodeURIComponent(data['title']);

        if ('appmsgstat' in contentJs) {
          // 阅读量
          let readNum = contentJs.appmsgstat.read_num;
          // 点赞量
          let likeNum = contentJs.appmsgstat.like_num;
          let comment_count = contentJs.comment_count
          //contentJs.appmsgticket.ticket
          //contentJs.base_resp.wxtoken
          // 赞赏量，若没有，赋值0
          let rewardTotalCount = contentJs.reward_total_count || 0;
          let info = {
            'msg_biz': msgBiz,
            'msg_mid': msgMid,
            'msg_idx': msgIdx,
            'msg_sn': msgSn,
            'title': title,
            'readNum': readNum,
            'likeNum': likeNum,
            'comment_count': comment_count,
            'rewardTotalCount': rewardTotalCount
          }
          global.recorder.emitSave(info)
        }

        // 评论数据参数格式
        // let req_params = {
        //   'action': 'getcomment',
        //   'scene': '0',
        //   'appmsgid': '2650531172',
        //   'idx': '1',
        //   'comment_id': '1081233331964051456',
        //   'offset': '0',
        //   'limit': '100',
        //   'send_time': '',
        //   'uin': 'MjA1ODEzNTYxMQ%253D%253D',
        //   'key': '3b746db36a28e164a7e1db772d20b947f78b4983ff4386f0da1b314370f92ab0348a2081a6da859d569a14b9c292aafb429324eacd93d4a777727be0346b3ed9158f8ad791eb8cb1f1ffa2d63b0c2dfd',
        //   'pass_ticket': 'Ll0bVX1E%25252B9lPZ0omXgRNl3FUoaeYTv6SEaMwlHuutAyksYFHcDG58EiYJGLFwD64',
        //   'wxtoken': '777',
        //   'devicetype': 'Windows%26nbsp%3B10',
        //   'clientversion': '62070158',
        //   '__biz': 'MjM5MjAyNDUyMA%3D%3D',
        //   'appmsg_token': '1035_WOk35%252Flx2%252B7R3KyDZ_ZHOrhtHKctjazazH2eaf-8L207_s5fYfLDJ1eVZob0VdsijLoPP6_YD6hxFda9',
        //   'x5': '0',
        //   'f': 'json'
        // }
        //https://mp.weixin.qq.com/mp/appmsg_comment?

      }
      // 提取评论数据
      if (/^\/mp\/appmsg_comment/.test(requestDetail.requestOptions.path)) {
        console.log('提取评论数据')
        let contentJs = JSON.parse(content);
        let data = requestStrToMap(requestDetail.requestData.toString())
        console.log(contentJs)
      }
      if (responseDetail.response.statusCode == 200 &&
        'Content-Type' in responseDetail.response.header &&
        responseDetail.response.header['Content-Type'].indexOf('/html') >= 0) {
        console.log('处于代理模式-注入辅助脚本')
        const newResponse = responseDetail.response;
        let newContent = newResponse.body.toString()
        let injectJs = '<script src="https://mp.weixin.qq.com/injectJs.js" type="text/javascript" async=""></script>'
        newResponse.body = newContent.replace("<!--headTrap<body></body><head></head><html></html>-->", "").replace("<!--tailTrap<body></body><head></head><html></html>-->", "")
          .replace("</body>", injectJs + "\n</body>");
        return new Promise((resolve, reject) => {
          resolve({ response: newResponse });
        });
      }

      return new Promise((resolve, reject) => {
        resolve({ response: responseDetail.response });
      });
    }
  },
};
