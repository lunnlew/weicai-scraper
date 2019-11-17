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

module.exports = {
  summary: 'a rule to hack response',
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
        console.log('提取首页的数据')
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
              sub_msg.content_url = sub_msg.content_url.replace(/&amp;/g, '&')
              let linkParse = querystring.parse(url.parse(sub_msg.content_url).query);
              let msgBiz = linkParse.__biz;
              let msgMid = linkParse.mid;
              let msgIdx = linkParse.idx;
              let msgSn = linkParse.sn;
              let info = {
                'msg_biz': msgBiz,
                'msg_mid': msgMid,
                'msg_idx': msgIdx,
                'msg_sn': msgSn,
                'title': sub_msg.title,
                'content_url': sub_msg.content_url,
                'cover': sub_msg.cover,
                'author': sub_msg.author,
                'copyright_stat': sub_msg.copyright_stat,
                'publish_time': dateTime
              }
              global.recorder.emitAppend(info)
            }
          } else {
            console.log('not sub_msg')
          }
        }

        console.log('注入自动脚本')
        var scrollDownJs = '<script type="text/javascript">var end = document.createElement("p");document.body.appendChild(end);(function scrollDown(){end.scrollIntoView();setTimeout(scrollDown,Math.floor(Math.random()*5000+5000));})();</script>';
        newResponse.body = content.replace("<!--headTrap<body></body><head></head><html></html>-->", "").replace("<!--tailTrap<body></body><head></head><html></html>-->", "")
          .replace("</body>", scrollDownJs + "\n</body>");

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
              sub_msg.content_url = sub_msg.content_url.replace(/&amp;/g, '&')
              let linkParse = querystring.parse(url.parse(sub_msg.content_url).query);
              let msgBiz = linkParse.__biz;
              let msgMid = linkParse.mid;
              let msgIdx = linkParse.idx;
              let msgSn = linkParse.sn;
              let info = {
                'msg_biz': msgBiz,
                'msg_mid': msgMid,
                'msg_idx': msgIdx,
                'msg_sn': msgSn,
                'title': sub_msg.title,
                'content_url': sub_msg.content_url,
                'cover': sub_msg.cover,
                'author': sub_msg.author,
                'copyright_stat': sub_msg.copyright_stat,
                'publish_time': dateTime
              }
              global.recorder.emitAppend(info)
            }
          } else {
            console.log('not sub_msg')
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
          global.recorder.emitSavee(info)
        }

      }

      return new Promise((resolve, reject) => {
        resolve({ response: responseDetail.response });
      });
    }
  },
};
