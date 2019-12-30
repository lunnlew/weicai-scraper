#include "stdafx.h"
#include <sstream>
#include "MsgProtocol.h"
#include "StringTool.h"
#include "HttpRequest.h"
#include "json.hpp"

using json = nlohmann::json;


void sendWeChatMessage(WeChatMessage *msg)
{
	json o;
	o["content"] = stringToUTF8(Wchar_tToString(msg->content));
	o["msgSender"] = stringToUTF8(Wchar_tToString(msg->msgSender));
	o["msgReciver"] = stringToUTF8(Wchar_tToString(msg->msgReciver));
	o["type"] = msg->type;
	o["typeStr"] = stringToUTF8(Wchar_tToString(msg->typeStr));
	o["sourceType"] = msg->sourceType;
	o["sourceTypeStr"] = stringToUTF8(Wchar_tToString(msg->sourceTypeStr));
	HttpRequest httpReq("127.0.0.1", 6877);
	std::string res = httpReq.HttpPost("/wechatRobot", o.dump());
}