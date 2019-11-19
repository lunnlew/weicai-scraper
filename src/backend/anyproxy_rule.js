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
  global.recorder.emitAppend(info)
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
    if (requestDetail.requestOptions.hostname === 'mp.weixin.qq.com') {
      if (/^\/mp\/profile_ext\?action=home/.test(requestDetail.requestOptions.path)) {

        const newResponse = responseDetail.response;

        var content = newResponse.body.toString()
        // 正则匹配到JSON
        var contentJSON = /var msgList = '(.+)';\n/.exec(content)[1];
        // 转义为正常字符
        var contentJSON = escape2Html(contentJSON).replace(/\\\//g, "/");
        var contentJs = JSON.parse(contentJSON);

        var list = contentJs.list;
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

        console.log('注入辅助脚本')
        var injectJs = '<script src="https://wei.cai/injectJs.js" type="text/javascript" async=""></script>'
        newResponse.body = content.replace("<!--headTrap<body></body><head></head><html></html>-->", "").replace("<!--tailTrap<body></body><head></head><html></html>-->", "")
          .replace("</body>", injectJs + "\n</body>");

        return new Promise((resolve, reject) => {
          resolve({ response: newResponse });
        });
      }
      if (/^\/mp\/profile_ext\?action=getmsg/.test(requestDetail.requestOptions.path)) {
        console.log('提取上拉加载的数据')
        var content = responseDetail.response.body.toString()
        var contentJs = JSON.parse(content);
        var generalMsgList = JSON.parse(contentJs.general_msg_list);
        var list = generalMsgList.list;
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
        var content = responseDetail.response.body.toString()
        var contentJs = JSON.parse(content);
        var data = requestStrToMap(requestDetail.requestData.toString())

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
            'rewardTotalCount': rewardTotalCount
          }
          global.recorder.emitSave(info)
        }

      }

      return new Promise((resolve, reject) => {
        resolve({ response: responseDetail.response });
      });
    }
  },
};
